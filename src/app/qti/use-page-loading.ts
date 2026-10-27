/**
 * Hide a page from the moment the runner starts navigating until everything on
 * it has settled, so the reader never watches it assemble itself.
 *
 * A navigation reaches the screen in steps: the old items are cleared, the new
 * ones connect one by one, the shared stimulus is fetched and copied in, our
 * booklet pass lifts it into its own column, and only then do the images
 * arrive. Each step moves the layout. qti-components reports the start
 * (`cito-test-navigation-started`) and the point where items and stimuli are
 * in (`cito-test-rendered`); this hook adds the last two steps on top of that.
 */
import { useEffect, useRef, useState } from "react";
import { bookletRoot } from "./booklet";

/** What the runner is navigating to, from `cito-test-navigation-started`. */
export interface NavigationTarget {
  type: "item" | "section";
  id: string;
}

/** Longest we hold a page back for images that are slow or never load. */
const IMAGE_WAIT_MS = 4000;
/** Reveal anyway if nothing at all is heard — a page must never stay hidden. */
const SAFETY_MS = 10000;
/**
 * How long a page may be hidden before the skeleton shows. A page that is ready
 * in a blink would otherwise flash a placeholder first.
 */
const SKELETON_DELAY_MS = 150;

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Resolve once every image on the rendered page has loaded or failed. */
const imagesSettled = (root: ParentNode): Promise<void> => {
  const pending = Array.from(root.querySelectorAll("img")).filter(
    (img) => !img.complete,
  );
  if (pending.length === 0) return Promise.resolve();
  const settled = Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
  const timeout = new Promise<void>((resolve) =>
    window.setTimeout(resolve, IMAGE_WAIT_MS),
  );
  return Promise.race([settled, timeout]);
};

export interface UsePageLoadingOptions {
  /** `<qti-test>`, which dispatches the navigation events. */
  qtiTestElement: HTMLElement | null;
  /** `<test-container>`; the rendered page lives in its shadow root. */
  testContainerRef: React.RefObject<HTMLElement | null>;
  /**
   * Last-moment DOM work that has to land before the page is shown — the
   * booklet's stimulus hoist, which otherwise moves the source a beat after
   * the page appears. Must be idempotent.
   */
  beforeReveal?: (testContainer: HTMLElement) => void;
}

export function usePageLoading({
  qtiTestElement,
  testContainerRef,
  beforeReveal,
}: UsePageLoadingOptions): {
  /** The page is hidden until it has settled. */
  loading: boolean;
  /** Loading has taken long enough that a placeholder should hold its place. */
  showSkeleton: boolean;
  target: NavigationTarget | null;
} {
  // A fresh <qti-test> navigates to its first page by itself, possibly before
  // this effect has attached, so a new player starts out hidden.
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [target, setTarget] = useState<NavigationTarget | null>(null);

  const beforeRevealRef = useRef(beforeReveal);
  useEffect(() => {
    beforeRevealRef.current = beforeReveal;
  }, [beforeReveal]);

  useEffect(() => {
    if (!qtiTestElement) return;

    /** Bumped per navigation, so a slow reveal cannot show a newer page early. */
    let generation = 0;
    let safetyTimer = 0;
    let skeletonTimer = 0;

    const clearTimers = () => {
      window.clearTimeout(safetyTimer);
      window.clearTimeout(skeletonTimer);
    };

    const reveal = () => {
      clearTimers();
      setLoading(false);
      setShowSkeleton(false);
    };

    const startTimers = () => {
      safetyTimer = window.setTimeout(reveal, SAFETY_MS);
      skeletonTimer = window.setTimeout(
        () => setShowSkeleton(true),
        SKELETON_DELAY_MS,
      );
    };

    const hide = () => {
      generation++;
      clearTimers();
      setLoading(true);
      startTimers();
    };

    const onStarted = (event: Event) => {
      const detail = (event as CustomEvent<NavigationTarget>).detail;
      setTarget(detail?.id ? detail : null);
      hide();
    };

    const onLoaded = async () => {
      const current = generation;
      await nextFrame();
      const container = testContainerRef.current;
      if (container) {
        beforeRevealRef.current?.(container);
        const root = bookletRoot(container);
        if (root) await imagesSettled(root);
      }
      // Let the images' own layout land before the page fades in.
      await nextFrame();
      if (current === generation) reveal();
    };

    // Every navigation ends in one of three ways: rendered, failed, or
    // superseded by a newer one, which reports its own start. So there is no
    // "ended" case left to time out; SAFETY_MS is the backstop.
    qtiTestElement.addEventListener("cito-test-navigation-started", onStarted);
    qtiTestElement.addEventListener("cito-test-rendered", onLoaded);
    qtiTestElement.addEventListener("cito-test-navigation-failed", reveal);
    startTimers();

    return () => {
      generation++;
      clearTimers();
      qtiTestElement.removeEventListener(
        "cito-test-navigation-started",
        onStarted,
      );
      qtiTestElement.removeEventListener("cito-test-rendered", onLoaded);
      qtiTestElement.removeEventListener("cito-test-navigation-failed", reveal);
    };
  }, [qtiTestElement, testContainerRef]);

  return { loading, showSkeleton, target };
}
