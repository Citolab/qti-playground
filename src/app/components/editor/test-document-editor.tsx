import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { QtiCitolabEditor } from "./qti-citolab-editor";

export type TestDocumentItem = {
  /** The item-ref identifier: what the player navigates by. */
  key: string;
  /** The item's own identifier: what the package saves by. */
  identifier: string;
  href: string;
  /** "Question 3", "Info" -- the divider's label. */
  label: string;
  title?: string;
};

type Props = {
  items: TestDocumentItem[];
  /** The item to open on: the one the player was showing. */
  initialKey: string;
  onItemChange: (identifier: string, xml: string) => void;
  /** The item at the top of the view, as the author scrolls. */
  onVisibleItemChange?: (key: string) => void;
};

type LoadedItem = TestDocumentItem & { xml: string | null };

/**
 * Space left above an item scrolled to, so its divider is not flush with the top edge -- and
 * the line an item has to cross to count as "the one in view".
 */
const SCROLL_MARGIN = 16;

/**
 * The whole test as one document: every item under a divider naming it, in test order, each in
 * an editor of its own. The playground's take on qti-construction's "edit as document", minus the
 * part that needs a server -- dividers cannot be removed or added here, so items are never joined
 * or split, and every item saves back to its own file.
 *
 * One editor per item rather than one editor for all of them: each item keeps its own load check
 * (content-loss.ts, unsupported-interactions.ts), so one item the editor cannot hold does not lock
 * the author out of the rest, and response identifiers never have to be told apart.
 */
export function TestDocumentEditor({
  items,
  initialKey,
  onItemChange,
  onVisibleItemChange,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [loaded, setLoaded] = useState<LoadedItem[] | null>(null);
  // Read once: the author's scrolling decides from here on.
  const initialKeyRef = useRef(initialKey);
  const onVisibleItemChangeRef = useRef(onVisibleItemChange);
  useEffect(() => {
    onVisibleItemChangeRef.current = onVisibleItemChange;
  }, [onVisibleItemChange]);

  // Loaded once per session. The editors read their XML only when they mount, so a reload while
  // they are up would only re-run the opening scroll and pull the view from under the author.
  const itemsRef = useRef(items);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      itemsRef.current.map(async (item): Promise<LoadedItem> => {
        try {
          const response = await fetch(item.href);
          return { ...item, xml: response.ok ? await response.text() : null };
        } catch {
          return { ...item, xml: null };
        }
      }),
    ).then((next) => {
      if (!cancelled) setLoaded(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Open on the item the player was showing. The items above it mount their editors as they come
  // near the view and grow while they do, which pushes the target down -- so it is held at the top
  // through every resize until the author takes over the scrolling.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!loaded || !scroller || !list) return;
    const target = list.querySelector<HTMLElement>(
      `[data-item-key="${CSS.escape(initialKeyRef.current)}"]`,
    );
    if (!target) return;

    const align = () => {
      scroller.scrollTop +=
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        SCROLL_MARGIN;
    };
    align();

    const resizes = new ResizeObserver(align);
    resizes.observe(list);
    const release = () => {
      resizes.disconnect();
      for (const type of USER_SCROLL_EVENTS) {
        scroller.removeEventListener(type, release);
      }
    };
    for (const type of USER_SCROLL_EVENTS) {
      scroller.addEventListener(type, release, { passive: true });
    }
    return release;
  }, [loaded]);

  // Report the item in view, so closing the editor can take the player there.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!loaded || !scroller || !list) return;

    let frame = 0;
    let last = "";
    const report = () => {
      frame = 0;
      const line = scroller.getBoundingClientRect().top + SCROLL_MARGIN + 1;
      let current = "";
      for (const section of list.querySelectorAll<HTMLElement>("[data-item-key]")) {
        if (section.getBoundingClientRect().top > line) break;
        current = section.dataset.itemKey ?? "";
      }
      current ||= loaded[0]?.key ?? "";
      if (current === last) return;
      last = current;
      onVisibleItemChangeRef.current?.(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(report);
    };
    report();
    scroller.addEventListener("scroll", schedule, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [loaded]);

  return (
    <div ref={scrollerRef} className="h-full overflow-auto">
      {loaded ? (
        <ol ref={listRef} className="mx-auto w-full max-w-4xl px-6 pt-4 pb-[60vh]">
          {loaded.map((item) => (
            <li key={item.key} data-item-key={item.key} className="mb-8">
              <ItemDivider item={item} />
              {item.xml === null ? (
                <p className="px-4 py-6 text-sm text-red-700">
                  This item could not be loaded from the package.
                </p>
              ) : (
                <LazyItemEditor
                  scrollerRef={scrollerRef}
                  sourceXml={item.xml}
                  assetBaseHref={item.href}
                  onSourceChange={(xml) => onItemChange(item.identifier, xml)}
                />
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div
          className="mx-auto w-full max-w-4xl space-y-3 px-6 pt-6"
          role="status"
          aria-label="Loading the test's items"
        >
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-40 w-full animate-pulse rounded bg-gray-100" />
        </div>
      )}
    </div>
  );
}

/** Scrolling the author does, as opposed to the scrolling `align` does for them. */
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function ItemDivider({ item }: { item: TestDocumentItem }) {
  const showTitle = item.title && item.title !== item.identifier;
  return (
    <div className="flex items-center gap-3 py-2 text-xs text-gray-500">
      <span className="rounded-full bg-citolab-700 px-2 py-0.5 font-semibold text-white">
        {item.label}
      </span>
      <span className="truncate">
        <span className="font-mono">{item.identifier}</span>
        {showTitle ? ` · ${item.title}` : ""}
      </span>
      <span className="h-px min-w-8 flex-1 bg-gray-200" />
    </div>
  );
}

/**
 * Mounts its editor once it comes near the view and keeps it from then on: a test of forty items
 * would otherwise build forty editors, with their node views, before the author sees one.
 */
function LazyItemEditor({
  scrollerRef,
  sourceXml,
  assetBaseHref,
  onSourceChange,
}: {
  scrollerRef: RefObject<HTMLDivElement | null>;
  sourceXml: string;
  assetBaseHref: string;
  onSourceChange: (xml: string) => void;
}) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (near || !placeholder) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { root: scrollerRef.current, rootMargin: "800px 0px" },
    );
    observer.observe(placeholder);
    return () => observer.disconnect();
  }, [near, scrollerRef]);

  if (!near) {
    return (
      <div
        ref={placeholderRef}
        className="h-80 rounded-lg border border-dashed border-gray-200"
        aria-hidden
      />
    );
  }

  return (
    <QtiCitolabEditor
      editorSessionKey={0}
      sourceXml={sourceXml}
      assetBaseHref={assetBaseHref}
      onSourceChange={onSourceChange}
      heightClassName=""
      surfaceClassName="py-2"
      stickyToolbar
    />
  );
}
