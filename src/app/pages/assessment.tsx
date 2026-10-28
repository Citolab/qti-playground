import React, {
  RefCallback,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useStore } from "../store/store";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { CustomElements } from "@citolab/qti-components/react";
import {
  IQtiTest,
  QtiAssessmentItem,
  QtiAssessmentItemRef,
  computedContext,
  transformItemApi,
  transformTestApi,
} from "@citolab/qti-components";
import type { QtiTestState, TestContext } from "@citolab/qti-components";
// import { QtiTest } from "@citolab/qti-components";
import {
  Check,
  ArrowLeft,
  ChevronLeft,
  Code,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { itemCss } from "../itemCss";
import { useScopedQtiRegistry } from "../use-scoped-registry";
import { syncScopedRegistry } from "../scoped-registry";
import {
  QTI_PKG_URL_PREFIX,
  detectPciBaseUrl,
  createModuleResolutionFetcher,
  normalizePciPaths,
} from "@citolab/qti-browser-import";

import DraggablePopup from "../components/draggable-popup";
import {
  ItemOutputPanel,
  type OutputItem,
} from "../components/item-output-panel";
import ModeSwitch from "../components/mode-switcher";
import { Button } from "@/components/ui/button";
import { ToolBar } from "../components/tool-bar";
import { DownloadPackageButton } from "../components/download-package-button";
import { QtiCitolabEditorPanel } from "../components/editor/qti-citolab-editor-panel";
import { NavigationBar } from "./nav-list";
import { AssessmentOverviewPage } from "./assessment-overview";
import {
  AssessmentIntroScreen,
  type SessionSettings,
} from "./assessment-intro";
import {
  DEFAULT_PLAYER_DEVICE,
  DEFAULT_PLAYER_MODE,
  DEFAULT_PLAYER_THEME,
  parsePlayerDevice,
  parsePlayerMode,
  parsePlayerTheme,
  parseCoachCharacter,
  COACH_NAMES,
} from "../qti/session-options";
import { PracticeCoach, type CoachMood } from "../components/practice-coach";
import { checkPage, showAnswers } from "../qti/practice-check";
import { assessmentTitleOf } from "../qti/assessment-title";
import { ExtendedItemContext, ExtendedTestContext } from "@citolab/qti-api";
import { useDebouncedCallback } from "use-debounce";
import { PlayerOptionsMenu } from "../components/player-options-menu";
import {
  AssessmentLayoutMode,
  DEFAULT_LAYOUT_MODE,
  parseLayoutMode,
} from "../qti/layout-mode";
import {
  SectionGrouping,
  flattenTestToSingleSection,
  groupItemRefsBySharedStimulus,
} from "../qti/test-layout-transforms";
import {
  bookletCssFor,
  decorateClassicSpeechPlayers,
  decorateEndAttemptButtons,
  decorateQuestionBadges,
  decorateSectionItemNumbers,
  decorateStimulusSpeechPlayers,
  hoistSharedStimuli,
  observeBookletScroll,
  syncBookmarkButtons,
  scrollToBookletItem,
} from "../qti/booklet";
import { itemKey, useStimulusRefs } from "../qti/use-stimulus-refs";
import {
  applyStimulusReferences,
  stimulusReferenceCss,
} from "../qti/stimulus-references";
import { usePageLoading } from "../qti/use-page-loading";
import { hasRecordedWork } from "../qti/has-recorded-work";
import { lockFinishedSteps } from "../qti/adaptive-steps";
import { ITEM_READY_EVENT } from "../qti-tool-base";
import { subscribeToContext } from "../qti/lit-context";
import { useItemLoadWatchdog } from "../qti/use-item-load-watchdog";
import {
  HandInDialog,
  HandedInScreen,
  type HandInResult,
} from "../components/hand-in";
import {
  readStoredVolume,
  storeVolume,
  useMediaVolume,
} from "../qti/media-volume";
import { PageLoadingSkeleton } from "../components/page-loading-skeleton";
import { VerticalNavigationPane } from "../components/vertical-navigation-pane";

/* React */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends CustomElements {
      "dep-textmarker": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "dep-symbolpicker": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      style: React.DetailedHTMLProps<
        React.StyleHTMLAttributes<HTMLStyleElement>,
        HTMLStyleElement
      >;
    }
  }
}

type AssessmentTestContext = { assessmentId: string } & ExtendedTestContext;

const mergeRestoredTestContext = (
  current: ExtendedTestContext | undefined,
  stored: ExtendedTestContext,
): ExtendedTestContext => {
  if (!current) return stored;

  const currentItems = Array.isArray(current.items) ? current.items : [];
  const storedItems = Array.isArray(stored.items) ? stored.items : [];

  const mergedItems = currentItems.map((currentItem) => {
    const currentIdentifier = String(
      (currentItem as { identifier?: string }).identifier || "",
    );
    const storedItem = storedItems.find(
      (candidate) =>
        String((candidate as { identifier?: string }).identifier || "") ===
        currentIdentifier,
    );
    if (!storedItem) return currentItem;

    const currentVariables = Array.isArray(currentItem.variables)
      ? currentItem.variables
      : [];
    const storedVariables = Array.isArray(storedItem.variables)
      ? storedItem.variables
      : [];

    const mergedVariables = [
      ...currentVariables.filter((currentVariable) => {
        const id = String(
          (currentVariable as { identifier?: string }).identifier || "",
        );
        return !storedVariables.some(
          (storedVariable) =>
            String(
              (storedVariable as { identifier?: string }).identifier || "",
            ) === id,
        );
      }),
      ...storedVariables,
    ];

    return {
      ...currentItem,
      ...storedItem,
      variables: mergedVariables,
      state: {
        ...(currentItem.state || {}),
        ...(storedItem.state || {}),
      },
    };
  });

  const missingStoredItems = storedItems.filter((storedItem) => {
    const storedIdentifier = String(
      (storedItem as { identifier?: string }).identifier || "",
    );
    return !currentItems.some(
      (currentItem) =>
        String((currentItem as { identifier?: string }).identifier || "") ===
        storedIdentifier,
    );
  });

  return {
    ...current,
    ...stored,
    items: [...mergedItems, ...missingStoredItems],
  };
};

// The white player surface, and the toolbar that has to line up with its edges. `max-w-6xl` alone
// left the panel a 1152px strip with ~1100px of dead page background either side of it on an
// ultra-wide display. The steps widen the surface without touching the item column inside it,
// which stays at `max-w-4xl`: that is a deliberate reading measure, and QTI items are authored
// against it, so stretching it is not a safe way to use up the extra width.
const PLAYER_SURFACE = "w-full max-w-6xl 2xl:max-w-[80rem] 3xl:max-w-[96rem]";

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const qtiTestRef = useRef<IQtiTest>(null);
  const [qtiTestElement, setQtiTestElement] = useState<IQtiTest | null>(null);
  const hasRedirectedForMissingPackageCacheRef = useRef(false);
  const [queryParams, setQueryParams] = useSearchParams();
  // The editor owns the qti-* names on the global registry, so the test player
  // needs its own scope. See app/editor-first.ts.
  const { registry: scopedRegistry, attachRef: attachScopedRegistry } =
    useScopedQtiRegistry();
  const [showVariables, setShowVariables] = useState(false);
  /** Review Mode: the runner's scorer view, which also shows the answer key. */
  const [reviewMode, setReviewMode] = useState(false);
  /** The scoring rubric of the item in view, for the review panel. */
  const [scoringRubricHtml, setScoringRubricHtml] = useState<string | null>(
    null,
  );
  const [rubricPanelOpen, setRubricPanelOpen] = useState(true);
  const [handInOpen, setHandInOpen] = useState(false);
  /** Set once handed in; shows the result screen in place of the player. */
  const [handInResult, setHandInResult] = useState<HandInResult | null>(null);
  /** Bumped by "Start again" to remount the runner with a blank context. */
  const [attempt, setAttempt] = useState(0);
  /** While starting again, the outgoing runner must not save its answers back. */
  const discardingAnswersRef = useRef(false);
  const [currentItemIdentifier, setCurrentItemIdentifier] = useState("");
  const [currentItemRefIdentifier, setCurrentItemRefIdentifier] = useState("");
  const isOverviewOpen = queryParams.get("overview") === "true";
  const [showIntro, setShowIntro] = useState(() => {
    const hasItemParam = !!queryParams.get("item");
    const overview = queryParams.get("overview") === "true";
    // `start=1` means the layout was already picked on the way in (the package
    // page starts the test in one), leaving the intro nothing to ask.
    const startsImmediately = queryParams.get("start") === "1";
    return !hasItemParam && !overview && !startsImmediately;
  });
  /**
   * Which layout the player is in. Lives in the URL so it survives a reload and
   * can be linked to, and so the `<qti-test>` below can key off it: the two
   * layouts are different section structures, so switching means reloading the
   * test rather than restyling it.
   */
  const layoutMode = parseLayoutMode(queryParams.get("layout"));
  /** Test or practice, and the colour theme: chosen on the intro, kept in the URL like the layout. */
  const playerMode = parsePlayerMode(queryParams.get("mode"));
  const playerTheme = parsePlayerTheme(queryParams.get("theme"));
  const coachCharacter = parseCoachCharacter(queryParams.get("coach"));
  /**
   * Inside the device preview's iframe the page is the device's screen: the
   * frame around it has its own way out, so the player's own close button goes.
   */
  const isEmbedded = window.self !== window.top;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stampContext, setStampContext] = useState<any>(null);
  /**
   * Which question the reader is on in vertical mode. Everything is on screen
   * at once there, so the runner has no active item to report and the scroll
   * position is the only answer.
   */
  const [scrolledItemRefIdentifier, setScrolledItemRefIdentifier] =
    useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [volume, setVolume] = useState(readStoredVolume);
  const handleVolumeChange = useCallback((level: number) => {
    setVolume(level);
    storeVolume(level);
  }, []);
  /** The `<test-container>` element — the runner renders items into its shadow root. */
  const testContainerRef = useRef<HTMLElement | null>(null);
  /** The same element as state, for effects that must re-run on a remount. */
  const [testContainerElement, setTestContainerElement] =
    useState<HTMLElement | null>(null);
  /** The pane the booklet scrolls in, so "which question am I on" is answerable. */
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  /** A question asked for before the booklet had rendered it. */
  const pendingScrollTargetRef = useRef<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const initialZoomRef = useRef<string>("");

  useEffect(() => {
    // Log a PCI's saved state whenever it changes. The test state carries each
    // item's `state` (where a PCI keeps its own), so diff it per item.
    const lastLogged = new Map<string, string>();
    const handleStateChanged = (event: Event) => {
      const items =
        (event as CustomEvent<QtiTestState>).detail?.test?.items ?? [];
      for (const item of items) {
        if (!item.state || Object.keys(item.state).length === 0) continue;
        const serialized = JSON.stringify(item.state);
        if (lastLogged.get(item.identifier) === serialized) continue;
        lastLogged.set(item.identifier, serialized);
        console.log("[PCI STATE]->", item.identifier, item.state);
      }
    };

    window.addEventListener("cito-test-state-changed", handleStateChanged);
    return () => {
      window.removeEventListener("cito-test-state-changed", handleStateChanged);
    };
  }, []);
  const initialBodyZoomRef = useRef<string>("");

  // Zustand store - use selectors for optimal re-renders
  const assessments = useStore((state) => state.assessments);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);
  const editItem = useStore((state) => state.editItem);
  const saveEditedItem = useStore((state) => state.saveEditedItem);
  const editorSourceXml = useStore((state) => state.qti3);
  // The item's own package URL. Its asset paths are relative to it, not to this
  // page, so the editor needs it to render the item's images.
  const editorAssetBaseHref = useStore((state) => state.previewItemHref);
  const setQti3 = useStore((state) => state.setQti3);
  const testContexts = useStore((state) => state.testContexts);
  const updateTestContext = useStore((state) => state.updateTestContext);

  const { assessmentId } = useParams<{
    assessmentId: string;
  }>();
  const storedBookmarks = useStore((state) =>
    assessmentId ? state.bookmarks?.[assessmentId] : undefined,
  );
  const setBookmarks = useStore((state) => state.setBookmarks);
  /** Persisted in the store, so a reload keeps the candidate's bookmarks. */
  const bookmarkedItemRefIds = useMemo(
    () => new Set(storedBookmarks ?? []),
    [storedBookmarks],
  );

  const assessment = assessments?.find((a) => a.id === assessmentId);
  const assessmentContent = assessment?.content;
  const assessmentName = assessment?.name;
  const assessmentTitle = useMemo(
    () =>
      assessmentTitleOf({ content: assessmentContent, name: assessmentName }),
    [assessmentContent, assessmentName],
  );
  const assessmentPackageId = assessment?.packageId;
  const packageRootUrl = useMemo(() => {
    if (!assessmentPackageId) return null;
    return `${QTI_PKG_URL_PREFIX}/${encodeURIComponent(assessmentPackageId)}`;
  }, [assessmentPackageId]);

  const items = useMemo(
    () =>
      itemsPerAssessment.find((i) => i.assessmentId === assessmentId)?.items ||
      [],
    [assessmentId, itemsPerAssessment],
  );

  /**
   * Which shared stimulus each item references, read from the item XML before
   * anything renders. Drives both the shared-stimulus sections in classic mode
   * and the source thumbnails in the overview.
   */
  const stimulusRefs = useStimulusRefs(items);

  /** Layouts that put more than one question on a page, and so navigate by section. */
  const isVerticalLayout = layoutMode === "vertical";
  const groupsSharedStimuli =
    !isVerticalLayout && stimulusRefs.sharedIds.size > 0;
  const isBookletLayout = isVerticalLayout || groupsSharedStimuli;

  /** 1-based question number per item-ref, info items excluded. */
  const displayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let nr = 1;
    for (const item of items) {
      if (item.type === "info") continue;
      map.set(itemKey(item), nr);
      nr += 1;
    }
    return map;
  }, [items]);

  const testContextsRef = useRef<AssessmentTestContext[]>([]);
  useEffect(() => {
    testContextsRef.current = testContexts;
  }, [testContexts]);
  const lastAppliedContextRef = useRef<ExtendedTestContext | null>(null);
  // The test element that has produced a live context. State, not a ref, because the restore
  // effect below is gated on it and a ref would not re-run it. Holding the element rather than a
  // boolean means it resets itself when a different test mounts, with no teardown write.
  const [liveContextElement, setLiveContextElement] = useState<IQtiTest | null>(
    null,
  );
  // Whether the boot context has been seen. Until it has, a live context is the runtime's
  // freshly initialised state and must not be written over a previous session's answers.
  const hasSeenBootContextRef = useRef(false);

  const assessmentTestUrl = assessment?.testUrl;
  const postLoadTransformCallback = useCallback(
    async (
      transformer: transformItemApi,
      itemRef?: QtiAssessmentItemRef,
    ) => {
      // Define the item's tags in the player's registry before it renders. The
      // registry is seeded with the interactions only, and mirrors the rest in
      // as they appear -- so without this `qti-assessment-item` upgraded after
      // its interactions had connected, their `qti-register-interaction` went
      // unheard, and the item's `interactionElements` stayed empty: no answer
      // key in Review Mode. The preview page does the same before it renders.
      if (scopedRegistry && transformer?.xmlDoc) {
        syncScopedRegistry(scopedRegistry, transformer.xmlDoc());
      }
      if (!packageRootUrl || !transformer?.configurePci) return transformer;

      const itemHref = itemRef?.getAttribute?.("href") || "";
      const itemDirUrl = (() => {
        if (!itemHref) return packageRootUrl;
        try {
          // `href` on qti-assessment-item-ref is relative to the *test XML URL* (not the app route URL).
          // If we resolve against `window.location.href`, PCI modules will be requested from `/items/...`
          // instead of `/__qti_pkg__/<packageId>/items/...`, causing 404s.
          const testUrl = assessmentTestUrl || packageRootUrl;
          const base = new URL(testUrl, window.location.href);
          const u = new URL(itemHref, base);
          const pathname = u.pathname;
          const idx = pathname.lastIndexOf("/");
          return idx >= 0 ? pathname.slice(0, idx) : packageRootUrl;
        } catch {
          return packageRootUrl;
        }
      })();

      const itemStemDirUrl = (() => {
        if (!itemHref) return null;
        try {
          const testUrl = assessmentTestUrl || packageRootUrl;
          const base = new URL(testUrl, window.location.href);
          const u = new URL(itemHref, base);
          const pathname = u.pathname;
          const last = pathname.split("/").pop() || "";
          const dot = last.lastIndexOf(".");
          if (dot <= 0) return null;
          const withoutExt = last.slice(0, dot);
          const baseDir = pathname
            .slice(0, pathname.length - last.length)
            .replace(/\/+$/, "");
          const parent = baseDir.split("/").filter(Boolean).pop() || "";
          if (parent.toLowerCase() !== "items") return null;
          return `${baseDir}/${withoutExt}`;
        } catch {
          return null;
        }
      })();

      try {
        const rawXml = transformer.xml();
        const hasPreconfiguredPortablePci =
          /<qti-portable-custom-interaction\b/i.test(rawXml) &&
          /\bdata-base-url="/i.test(rawXml) &&
          /<qti-interaction-module\b/i.test(rawXml);

        if (hasPreconfiguredPortablePci) {
          // Package conversion already provided explicit PCI baseUrl + module mappings.
          // Avoid re-running runtime remapping heuristics that can rewrite valid paths.
          return transformer;
        }

        const pciBaseUrl = await detectPciBaseUrl({
          packageRootUrl,
          itemDirUrl,
          itemStemDirUrl,
          xmlText: rawXml,
        });

        const fetcher = createModuleResolutionFetcher({
          packageRootUrl,
          itemDirUrl,
          itemStemDirUrl,
        });

        const configured = await transformer.configurePci(
          pciBaseUrl,
          (_baseUrl, fileUrl) => fetcher(fileUrl),
        );

        const doc = configured.xmlDoc();
        if (doc) {
          // Legacy CES / "qti-custom-interaction" support.
          // qti-components expects `data`, `data-base-item`, and `data-base-ref` on the host element.
          // Some packages ship these only inside a nested `<object data="...manifest.json" />`.
          // Some manifests reference scripts/styles relative to the manifest folder (e.g. `../script/bootstrap.js`)
          // while others reference package-root paths (e.g. `ref/<...>/script/bootstrap.js`). We probe the manifest
          // to choose a correct `data-base-ref`.
          const configureLegacyCustomInteractions = async () => {
            const origin =
              typeof window !== "undefined" ? window.location.origin : "";
            const itemBasePath = itemDirUrl.replace(/\/+$/, "");
            const itemBase = `${origin}${itemBasePath}/`;
            const manifestCache = new Map<string, Promise<unknown | null>>();

            const dirnamePath = (pathname: string) => {
              const idx = pathname.lastIndexOf("/");
              return idx >= 0 ? pathname.slice(0, idx) : pathname;
            };

            const relativePath = (fromDirPath: string, toPathname: string) => {
              const fromSegs = fromDirPath.split("/").filter(Boolean);
              const toSegs = toPathname.split("/").filter(Boolean);
              let i = 0;
              while (
                i < fromSegs.length &&
                i < toSegs.length &&
                fromSegs[i] === toSegs[i]
              ) {
                i += 1;
              }
              const up = fromSegs.length - i;
              const rel = [
                ...Array.from({ length: up }).map(() => ".."),
                ...toSegs.slice(i),
              ];
              return rel.length ? rel.join("/") : ".";
            };

            const getFirstManifestEntry = (manifest: unknown): string => {
              if (!manifest || typeof manifest !== "object") return "";
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const m = manifest as any;
              const candidates = [
                ...(Array.isArray(m?.script) ? m.script : []),
                ...(Array.isArray(m?.style) ? m.style : []),
                ...(Array.isArray(m?.media) ? m.media : []),
              ]
                .map((v: unknown) => (typeof v === "string" ? v.trim() : ""))
                .filter(Boolean);
              return candidates[0] || "";
            };

            const fetchManifest = async (
              url: string,
            ): Promise<unknown | null> => {
              if (manifestCache.has(url)) return await manifestCache.get(url)!;
              const p = (async () => {
                try {
                  const res = await fetch(url, { method: "GET" });
                  if (!res.ok) return null;
                  return (await res.json()) as unknown;
                } catch {
                  return null;
                }
              })();
              manifestCache.set(url, p);
              return await p;
            };

            for (const el of Array.from(
              doc.querySelectorAll("qti-custom-interaction"),
            )) {
              const host = el as Element;

              const object = host.querySelector("object[data]");
              const objectData = object?.getAttribute("data")?.trim() || "";

              let data = host.getAttribute("data")?.trim() || "";
              if (!data && objectData) data = objectData;
              if (!data) continue;

              // Ensure width/height are on the host element (qti-components reads them from the host).
              const width =
                host.getAttribute("width")?.trim() ||
                object?.getAttribute("width")?.trim() ||
                "";
              const height =
                host.getAttribute("height")?.trim() ||
                object?.getAttribute("height")?.trim() ||
                "";
              if (width && !host.getAttribute("width"))
                host.setAttribute("width", width);
              if (height && !host.getAttribute("height"))
                host.setAttribute("height", height);

              host.setAttribute("data-base-item", itemBasePath);

              try {
                const isAbsolute = /^(data:|blob:|https?:)/.test(data);
                const isPkgRooted =
                  data.startsWith("/") && !data.startsWith(QTI_PKG_URL_PREFIX);

                const abs = isAbsolute
                  ? data
                  : isPkgRooted
                    ? `${origin}${packageRootUrl}${data}`
                    : new URL(data, itemBase).toString();
                const u = new URL(abs, origin);
                const baseRefByManifest = dirnamePath(u.pathname);

                // Fetch the manifest to check if paths are package-root relative
                const manifest = isAbsolute
                  ? null
                  : await fetchManifest(u.toString());
                const firstEntry = getFirstManifestEntry(manifest);
                const usePackageRootBaseRef =
                  firstEntry.startsWith("/") ||
                  firstEntry.startsWith("ref/") ||
                  firstEntry.startsWith("/ref/") ||
                  firstEntry.startsWith("items/") ||
                  firstEntry.startsWith("/items/");

                const baseRefPath = usePackageRootBaseRef
                  ? packageRootUrl
                  : baseRefByManifest;
                host.setAttribute("data-base-ref", baseRefPath);

                if (!isAbsolute) {
                  const rel = relativePath(itemBasePath, u.pathname);
                  const nextData = `${rel}${u.search}${u.hash}`;
                  host.setAttribute("data", nextData);
                  if (object) object.setAttribute("data", nextData);
                } else {
                  host.setAttribute("data", data);
                  if (object) object.setAttribute("data", data);
                }
              } catch {
                // ignore
              }
            }
          };

          await configureLegacyCustomInteractions();

          normalizePciPaths(doc, {
            pciBaseUrl,
            packageRootUrl,
            itemDirUrl,
            itemStemDirUrl,
          });
        }

        return configured;
      } catch (error) {
        console.warn(
          "PCI module resolution failed (continuing without it):",
          error,
        );
        return transformer;
      }
    },
    [assessmentTestUrl, packageRootUrl, scopedRegistry],
  );

  /**
   * The section structure the layout transform produced, so navigation can go
   * by section without re-reading the rendered document.
   *
   * Kept twice on purpose. The ref is the authority: it is written from inside
   * the transform, which the runner drives, and read by event handlers that may
   * fire in the same tick — `cito-test-loaded` arrives before
   * React has re-rendered. The state copy is what the chrome renders from.
   */
  const groupingRef = useRef<SectionGrouping | null>(null);
  const [grouping, setGrouping] = useState<SectionGrouping | null>(null);

  /**
   * Restructure the test for the chosen layout: one section for the whole test
   * in vertical mode, one section per shared stimulus in classic mode. Both
   * make qti-components render several questions on one page — the only way it
   * offers to do that is a section navigation.
   */
  const postLoadTestTransformCallback = useCallback(
    (transformer: transformTestApi) => {
      let next: SectionGrouping | null = null;
      try {
        if (isVerticalLayout) {
          next = flattenTestToSingleSection(transformer);
        } else if (groupsSharedStimuli) {
          next = groupItemRefsBySharedStimulus(
            transformer,
            stimulusRefs.primaryStimulusByItem,
            stimulusRefs.sharedIds,
          );
        }
      } catch (error) {
        // A test we cannot regroup still plays, one question at a time.
        console.warn("Layout transform failed (falling back to items):", error);
        next = null;
      }
      groupingRef.current = next;
      setGrouping(next);
      return transformer;
    },
    [
      groupsSharedStimuli,
      isVerticalLayout,
      stimulusRefs.primaryStimulusByItem,
      stimulusRefs.sharedIds,
    ],
  );

  /** The section a question now lives in, or null when navigating by item. */
  const sectionOf = useCallback((itemRefIdentifier: string) => {
    return groupingRef.current?.sectionByItemRef.get(itemRefIdentifier) ?? null;
  }, []);

  // Stable event handler for QTI item connection
  const handleItemConnected = useCallback((event: Event) => {
    const qtiAssessmentItem = (event as CustomEvent<QtiAssessmentItem>)?.detail;
    const itemId = qtiAssessmentItem?.identifier || "";
    const itemRefId =
      (qtiAssessmentItem?.parentElement as HTMLElement | null)?.getAttribute(
        "identifier",
      ) || "";
    setCurrentItemIdentifier(itemId);
    setCurrentItemRefIdentifier(itemRefId);

    // Signal to external tools (DEP marker/symbol picker) that an item is ready
    window.dispatchEvent(new CustomEvent(ITEM_READY_EVENT));
  }, []);

  /** What was last written to the store, so repeat saves can be skipped. */
  const lastSavedContextJsonRef = useRef<string | null>(null);
  const handleTestContextUpdated = useCallback(
    (fallback: TestContext | undefined, source?: IQtiTest | null) => {
      const assessmentId = assessment?.id;
      if (!assessmentId) return;
      // Save what the runner holds *now*, not a snapshot handed in: a snapshot
      // can predate the response that triggered the save. The store replaces the context wholesale, so a snapshot
      // one interaction behind would delete the newest answer from storage
      // while it stays on screen. (Same fix as cito-test-uit's save.)
      const live = (source ?? qtiTestRef.current)?.testContext as
        | TestContext
        | undefined;
      const detail =
        live && Array.isArray(live.items) && live.items.length > 0
          ? live
          : fallback;
      if (!detail) return;

      const previous = testContextsRef.current.find(
        (ctx) => ctx.assessmentId === assessmentId,
      );

      const nextContext: AssessmentTestContext = {
        assessmentId,
        items: detail.items as ExtendedItemContext[],
        testOutcomeVariables: detail.testOutcomeVariables,
        navPartId: previous?.navPartId ?? null,
        navSectionId: previous?.navSectionId ?? null,
        navItemId: previous?.navItemId ?? null,
        navItemLoading: previous?.navItemLoading ?? false,
        navTestLoading: previous?.navTestLoading ?? false,
      };

      setLiveContextElement(qtiTestElement);

      // The first context after boot carries declaration defaults and no responses, because the
      // runtime has only just initialised. Persisting it would erase what the candidate answered
      // in an earlier session before the restore effect below can push it back into the element -
      // the answers would be gone from storage, not merely unrestored. Skip that one write and
      // let the restore run; the update it triggers carries the merged state and is persisted.
      if (!hasSeenBootContextRef.current) {
        hasSeenBootContextRef.current = true;
        if (previous) return;
      }

      // Saves now also come from interactions and page hide, so most of them
      // repeat the last one; skip those rather than rewrite storage.
      let serialized: string | null = null;
      try {
        serialized = JSON.stringify([
          nextContext.items,
          nextContext.testOutcomeVariables,
        ]);
      } catch {
        // Unserialisable: save it anyway and compare again next time.
      }
      if (serialized && serialized === lastSavedContextJsonRef.current) return;
      lastSavedContextJsonRef.current = serialized;

      // This update comes from the active qti-test instance, so avoid immediately replaying it back.
      lastAppliedContextRef.current = nextContext;
      updateTestContext(nextContext);
    },
    [assessment?.id, qtiTestElement, updateTestContext],
  );

  // Stable ref callback for QTI test element
  const refCallback: RefCallback<IQtiTest> = useCallback(
    (element) => {
      if (element) {
        qtiTestRef.current = element;
        setQtiTestElement(element);
        element.postLoadTransformCallback = postLoadTransformCallback;
        // Both callbacks have to be in place before <test-container> reads
        // them. They are: the container's load is async, so its first `await`
        // yields to the microtask queue — which React's commit phase, and so
        // this ref callback, has already run to completion by.
        element.postLoadTestTransformCallback = postLoadTestTransformCallback;
        if (isBookletLayout) element.navigate = "section";
      } else {
        qtiTestRef.current = null;
        setQtiTestElement(null);
      }
    },
    [isBookletLayout, postLoadTestTransformCallback, postLoadTransformCallback],
  );

  useEffect(() => {
    if (!qtiTestElement) return;
    qtiTestElement.addEventListener("cito-item-rendered", handleItemConnected);
    return () => {
      qtiTestElement.removeEventListener(
        "cito-item-rendered",
        handleItemConnected,
      );
    };
  }, [handleItemConnected, qtiTestElement]);

  useEffect(() => {
    if (!qtiTestRef.current) return;
    qtiTestRef.current.postLoadTransformCallback = postLoadTransformCallback;
    qtiTestRef.current.postLoadTestTransformCallback =
      postLoadTestTransformCallback;
  }, [postLoadTestTransformCallback, postLoadTransformCallback]);

  useEffect(() => {
    if (!qtiTestElement) return;
    // `cito-test-state-changed` fires whenever the runner's context changes. Its
    // payload is the `state` shape, not the stored context, so only the live
    // `testContext` is saved from it.
    const listener = () =>
      handleTestContextUpdated(undefined, qtiTestElement);
    qtiTestElement.addEventListener("cito-test-state-changed", listener);

    // Save from the live runner on two more occasions: after any interaction
    // change (a frame later, once the runner has applied it), and when the
    // page is hidden or closed -- the last moment a save is guaranteed to run.
    // Read from this effect's element, never the ref: on a remount the ref
    // already holds the new, blank runner. And only a runner holding answers:
    // a blank one (not restored yet) would overwrite the stored answers.
    const saveLive = () => {
      if (discardingAnswersRef.current) return;
      const context = qtiTestElement.testContext as ExtendedTestContext;
      if (!hasRecordedWork(context)) return;
      handleTestContextUpdated(context as TestContext, qtiTestElement);
    };
    const onInteraction = () => requestAnimationFrame(saveLive);
    const onHide = () => {
      if (document.visibilityState === "hidden") saveLive();
    };
    qtiTestElement.addEventListener("cito-item-response-changed", onInteraction);
    // An adaptive item in steps: moving on to a next STEP locks the steps before it.
    const onItemOutcome = (event: Event) => {
      if ((event as CustomEvent<{ outcomeIdentifier?: string }>).detail?.outcomeIdentifier !== "STEP") return;
      const item = (event.composedPath()[0] as Element | undefined)?.closest?.("qti-assessment-item");
      if (item?.getAttribute("adaptive") === "true") lockFinishedSteps(item);
    };
    qtiTestElement.addEventListener("cito-item-outcome-changed", onItemOutcome);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", saveLive);
    return () => {
      qtiTestElement.removeEventListener("cito-test-state-changed", listener);
      qtiTestElement.removeEventListener(
        "cito-item-response-changed",
        onInteraction,
      );
      qtiTestElement.removeEventListener("cito-item-outcome-changed", onItemOutcome);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", saveLive);
      // Unmount (leaving the page, a layout switch): one last save.
      saveLive();
    };
  }, [handleTestContextUpdated, qtiTestElement]);

  useEffect(() => {
    if (!qtiTestElement) {
      lastAppliedContextRef.current = null;
      hasSeenBootContextRef.current = false;
      return;
    }
    if (!assessment?.id) return;
    // Only restore persisted context after the runtime has produced at least one live context snapshot.
    // This avoids clobbering declaration defaults (e.g. QTI_CONTEXT) during initial item boot.
    if (liveContextElement !== qtiTestElement) return;

    // Write through the ref, not the state value: the runtime element is an external DOM node and
    // a value React hands back from useState must not be mutated in place.
    const testElement = qtiTestRef.current;
    if (!testElement || testElement !== qtiTestElement) return;

    const stored = testContexts.find(
      (ctx) => ctx.assessmentId === assessment.id,
    );
    if (!stored || lastAppliedContextRef.current === stored) return;

    // Only while the runner has no answers of its own. After the first restore
    // the runner is the only up-to-date copy; a store-side edit that hands back
    // an older snapshot must not be written over it.
    if (
      hasRecordedWork(
        testElement.testContext as ExtendedTestContext | undefined,
      )
    ) {
      lastAppliedContextRef.current = stored;
      return;
    }

    const merged = mergeRestoredTestContext(
      testElement.testContext as ExtendedTestContext | undefined,
      stored,
    );

    testElement.testContext = {
      items: merged.items.map((item) => ({
        ...item,
        variables: item.variables?.map((variable) => ({ ...variable })),
        state: item.state ? { ...item.state } : undefined,
      })),
      testOutcomeVariables: merged.testOutcomeVariables,
    };

    lastAppliedContextRef.current = stored;
  }, [assessment?.id, qtiTestElement, testContexts, liveContextElement]);

  const handleToggle = useCallback((mode: string) => {
    setReviewMode(mode === "scorer");
    // Reopen the rubric panel on every switch to review, even if it was closed.
    if (mode === "scorer") setRubricPanelOpen(true);
    if (qtiTestRef.current)
      qtiTestRef.current.dispatchEvent(
        new CustomEvent("cito-test-switch-view", {
          composed: true,
          bubbles: true,
          detail: mode,
        }),
      );
  }, []);

  /**
   * The answer key on every question on the page, not only the active one.
   *
   * The scorer view marks the correct response through
   * `QtiTestCorrection.updateAssessmentItemView`, but on a switch it only
   * reaches the item at `navItemRefId` -- and a booklet page has none, so its
   * questions kept their key hidden. Items that connect later are covered by
   * the runner itself (it applies the view on `qti-assessment-item-connected`).
   */
  useEffect(() => {
    const root = testContainerRef.current?.shadowRoot;
    if (!root) return;
    root
      .querySelectorAll<
        HTMLElement & {
          assessmentItem?: { showCorrectResponse?: (show: boolean) => void };
        }
      >("qti-assessment-item-ref")
      .forEach((itemRef) =>
        itemRef.assessmentItem?.showCorrectResponse?.(reviewMode),
      );
  }, [reviewMode, qtiTestElement]);

  /**
   * Review Mode on a one-question page: the item's scoring rubric moves out of
   * the question into a panel that can be dragged clear of it (adapted from
   * cito-test-uit's Correctievoorschrift panel). A booklet page has no panel;
   * the scorer view already shows each rubric inline, beside its question.
   */
  const showRubricPanel = reviewMode && !isBookletLayout;
  useEffect(() => {
    const container = testContainerRef.current;
    const root = container?.shadowRoot;
    if (!showRubricPanel || !container || !root) {
      setScoringRubricHtml(null);
      return;
    }

    const hidden = new Set<HTMLElement>();
    const sync = () => {
      const blocks = Array.from(
        root.querySelectorAll<HTMLElement>(
          'qti-rubric-block[use="scoring"], qti-rubric-block[view~="scorer"]',
        ),
      ).filter((block) => block.closest("qti-assessment-item"));
      const html = new Set<string>();
      blocks.forEach((block) => {
        const body = block.querySelector("qti-content-body") ?? block;
        const content = body.innerHTML.trim();
        if (content) html.add(content);
        block.style.display = "none";
        hidden.add(block);
      });
      setScoringRubricHtml(html.size ? [...html].join("<hr />") : null);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      hidden.forEach((block) => (block.style.display = ""));
    };
  }, [showRubricPanel, qtiTestElement, layoutMode]);

  /**
   * Put the persisted answers back after the runner has wiped its own context.
   *
   * Loading the test (`cito-test-loaded`) makes qti-components assign
   * `INITIAL_TEST_CONTEXT` unconditionally — the guard meant to preserve an
   * existing context tests the value the line above it has just overwritten —
   * so every `<test-container>` remount starts blank: an overview round trip, a
   * layout switch, a re-entry from the item grid. The store still holds the
   * answers, so they go back in here.
   *
   * Timing is the whole point of doing it in this handler. It runs during the
   * same synchronous dispatch as the wipe (our listener is added later than the
   * library's, so it runs after it), which is before any item has connected.
   * The runner then replays the restored variables into each item itself, in
   * `_updateItemInTestContext` — which only does so when the item context holds
   * more than the one `completionStatus` variable a blank context has.
   */
  const restorePersistedTestContext = useCallback(() => {
    const element = qtiTestRef.current;
    const assessmentId = assessment?.id;
    if (!element || !assessmentId) return;

    const stored = testContextsRef.current.find(
      (ctx) => ctx.assessmentId === assessmentId,
    );
    if (!stored?.items?.length) return;

    const merged = mergeRestoredTestContext(
      element.testContext as ExtendedTestContext | undefined,
      stored,
    );

    // Cloned: the runtime element is an external DOM node and mutates what it
    // is handed, so it must not be handed the store's own objects.
    element.testContext = {
      items: merged.items.map((item) => ({
        ...item,
        variables: item.variables?.map((variable) => ({ ...variable })),
        state: item.state ? { ...item.state } : undefined,
      })),
      testOutcomeVariables: merged.testOutcomeVariables,
    };

    // The restore effect below would otherwise apply the same context a second
    // time, after the items have connected -- too late to be replayed into them,
    // and enough to trigger another round of context updates.
    lastAppliedContextRef.current = stored;
  }, [assessment?.id]);

  // QTI test setup effect
  useEffect(() => {
    // Keyed on the element, not on `qtiTestRef.current`: the player only mounts
    // once the stimulus scan is ready, and a ref going from null to an element
    // is not something an effect re-runs for.
    if (!qtiTestElement || !assessmentTestUrl) return;

    const itemId = queryParams.get("item");

    const handleTestConnected = () => {
      restorePersistedTestContext();

      const target =
        (itemId && assessment?.items?.find((i) => i.identifier === itemId)) ||
        assessment?.items?.[0];
      const targetItemRefId = target?.itemRefIdentifier;
      if (!targetItemRefId) return;

      // In a booklet layout the runner has already navigated to the first
      // section by itself (`navigate = "section"`), so only a deep link into a
      // later section needs a navigation of our own. An *item* navigation here
      // would tear the page down to a single question.
      if (isBookletLayout) {
        const sectionId = sectionOf(targetItemRefId);
        const firstSection = groupingRef.current?.sections[0];
        if (sectionId && sectionId !== firstSection) {
          qtiTestRef.current?.navigateTo("section", sectionId);
        }
        // Vertical mode renders the whole test at once, so a deep-linked
        // question is a scroll away rather than a navigation. Only a deep link:
        // scrolling to question 1 unprompted would push the booklet's first
        // shared source off the top of the pane before it has been read.
        if (isVerticalLayout && itemId) {
          pendingScrollTargetRef.current = targetItemRefId;
        }
        return;
      }

      qtiTestRef.current?.navigateTo("item", targetItemRefId);
    };

    qtiTestElement.addEventListener("cito-test-loaded", handleTestConnected);

    return () => {
      qtiTestElement.removeEventListener(
        "cito-test-loaded",
        handleTestConnected,
      );
    };
  }, [
    assessment?.content,
    assessment?.items,
    assessmentTestUrl,
    isBookletLayout,
    isVerticalLayout,
    qtiTestElement,
    queryParams,
    restorePersistedTestContext,
    sectionOf,
  ]);

  // Navigation handlers
  // Editing happens in place: the editor is rendered as an overlay on top of
  // the item content, so the test itself stays mounted (and keeps its state).

  // Which item the open editor belongs to. Read instead of `currentItemIdentifier` because a
  // pending edit is flushed *after* the player has already moved on to another item, and the
  // flush must still write to the file it was editing.
  const editingItemIdentifierRef = useRef("");
  const editingItemRefIdentifierRef = useRef("");
  // The last write of the edited item to the package cache. `_loadItems` re-fetches
  // `item.href` on every navigation, so the reload below has to wait for that write --
  // otherwise the player races it and re-reads the pre-edit XML.
  const pendingItemSaveRef = useRef<Promise<boolean>>(Promise.resolve(false));
  const editedInSessionRef = useRef(false);

  const pushEditorSource = useDebouncedCallback((nextXml: string) => {
    void setQti3(nextXml);
    const identifier = editingItemIdentifierRef.current;
    if (!identifier) return;
    editedInSessionRef.current = true;
    pendingItemSaveRef.current = saveEditedItem(identifier, nextXml);
  }, 1000);

  // Gets every pending edit into the package cache. The editor flushes its own export
  // debounce while it tears down, so the last keystrokes only reach `pushEditorSource`
  // once it has unmounted -- hence the yield before flushing ours.
  const flushPendingEdit = useCallback(async () => {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    pushEditorSource.flush();
    await pendingItemSaveRef.current;
  }, [pushEditorSource]);

  const closeEditor = useCallback(async () => {
    setIsEditorOpen(false);
    await flushPendingEdit();
    if (!editedInSessionRef.current) return;
    editedInSessionRef.current = false;
    // Reload the item so the player picks the edit up from the package cache. Navigating
    // to the item it is already on is allowed even in linear mode.
    const itemRefId = editingItemRefIdentifierRef.current;
    if (itemRefId) {
      qtiTestRef.current?.navigateTo("item", itemRefId);
    }
  }, [flushPendingEdit]);

  const onToggleEditor = useCallback(async () => {
    if (isEditorOpen) {
      await closeEditor();
      return;
    }
    try {
      await editItem(currentItemIdentifier);
      editingItemIdentifierRef.current = currentItemIdentifier;
      editingItemRefIdentifierRef.current = currentItemRefIdentifier;
      editedInSessionRef.current = false;
      setEditorSessionKey((current) => current + 1);
      setIsEditorOpen(true);
    } catch (error) {
      console.error("Edit item error:", error);
    }
  }, [
    closeEditor,
    currentItemIdentifier,
    currentItemRefIdentifier,
    editItem,
    isEditorOpen,
  ]);

  // Navigating to another item closes the in-place editor. The pending edit still has to
  // land in the package cache, so it is flushed rather than cancelled -- the item the
  // player navigates to re-fetches its own XML anyway.
  const editorItemIdentifierRef = useRef(currentItemIdentifier);
  useEffect(() => {
    if (editorItemIdentifierRef.current === currentItemIdentifier) return;
    editorItemIdentifierRef.current = currentItemIdentifier;
    setIsEditorOpen(false);
    void flushPendingEdit().then(() => {
      // No reload here: the player has already moved on, and the edited item re-fetches
      // its own XML the next time it is navigated to.
      editedInSessionRef.current = false;
    });
  }, [currentItemIdentifier, flushPendingEdit]);

  // Leaving the page (back, exit) must not strand an edit in the debounce either.
  useEffect(() => {
    return () => {
      pushEditorSource.flush();
    };
  }, [pushEditorSource]);

  const handleBackNavigation = useCallback(() => {
    navigate("/package");
  }, [navigate]);

  const handlePrevious = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/package");
    }
  }, [navigate]);

  const setOverviewMode = useCallback(
    (open: boolean) => {
      const next = new URLSearchParams(queryParams);
      if (open) {
        next.set("overview", "true");
      } else {
        next.delete("overview");
      }
      setQueryParams(next, { replace: true });
    },
    [queryParams, setQueryParams],
  );

  /**
   * Switch layout. The two layouts are different section structures, so this
   * reloads the test — the `key` on `<qti-test>` below makes that happen — and
   * the mode lives in the URL so a reload or a shared link keeps it.
   */
  const setLayoutMode = useCallback(
    (mode: AssessmentLayoutMode) => {
      if (mode === layoutMode) return;
      const next = new URLSearchParams(queryParams);
      if (mode === DEFAULT_LAYOUT_MODE) next.delete("layout");
      else next.set("layout", mode);
      setQueryParams(next, { replace: true });
    },
    [layoutMode, queryParams, setQueryParams],
  );

  /**
   * Mode, theme and device from the toolbar's options menu: URL parameters
   * like the layout. Mode and theme apply in place. A device other than the
   * desktop hands the page to the device preview (see app.tsx), which frames
   * this same URL -- `start=1` so the frame opens on the test, where the
   * answers saved on the way out are restored.
   */
  const setSessionOption = useCallback(
    (key: "mode" | "theme" | "device", value: string, fallback: string) => {
      const next = new URLSearchParams(queryParams);
      if (value === fallback) next.delete(key);
      else next.set(key, value);
      if (key === "device" && value !== fallback) next.set("start", "1");
      setQueryParams(next, { replace: true });
    },
    [queryParams, setQueryParams],
  );

  const redirectToPackageDueToMissingItemData = useCallback(
    (details?: { uri?: string; error?: unknown }) => {
      if (hasRedirectedForMissingPackageCacheRef.current) return;
      hasRedirectedForMissingPackageCacheRef.current = true;

      console.warn(
        "Assessment package resources are not available (missing CacheStorage entries). Redirecting to /package.",
        details,
      );

      try {
        localStorage.removeItem("state_default_user");
      } catch {
        // ignore
      }
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
      navigate("/package", { replace: true });
    },
    [navigate],
  );

  // If the user returns later (or refreshes), persisted state may still reference a packageId/testUrl,
  // but the corresponding CacheStorage entries may be gone. Detect that early and redirect to /package.
  useEffect(() => {
    const testUrl = assessment?.testUrl;
    if (!testUrl) return;

    const check = async () => {
      try {
        const res = await fetch(testUrl, { method: "HEAD" });
        if (!res.ok) {
          throw new Error(`Missing testUrl (${res.status})`);
        }
      } catch (error) {
        redirectToPackageDueToMissingItemData({
          uri: testUrl,
          error,
        });
      }
    };

    void check();
  }, [assessment?.testUrl, redirectToPackageDueToMissingItemData]);

  const handleExitOverlay = useCallback(() => {
    handlePrevious();
  }, [handlePrevious]);

  /**
   * Go to a question — whatever "go" means in this layout: a scroll in vertical
   * mode (everything is already rendered), a section navigation when questions
   * are grouped onto one page, an item navigation otherwise.
   */
  const goToItem = useCallback(
    (itemRefIdentifier: string | null) => {
      if (!itemRefIdentifier) return;

      if (isVerticalLayout) {
        setScrolledItemRefIdentifier(itemRefIdentifier);
        // The booklet may not be rendered yet (a deep link, or the intro still
        // covering it); the load effect below picks the target up.
        if (!scrollToBookletItem(testContainerRef.current, itemRefIdentifier)) {
          pendingScrollTargetRef.current = itemRefIdentifier;
        }
        return;
      }

      const sectionId = sectionOf(itemRefIdentifier);
      if (sectionId) {
        qtiTestRef.current?.navigateTo("section", sectionId);
        return;
      }
      qtiTestRef.current?.navigateTo("item", itemRefIdentifier);
    },
    [isVerticalLayout, sectionOf],
  );

  const handleNavigationBarClick = useCallback(
    (id: string) => goToItem(id),
    [goToItem],
  );



  /** The section the runner is showing, when it is navigating by section. */
  const activeSectionId: string | null =
    stampContext?.activeSection?.identifier ?? null;

  const activeSectionItemRefIds = useMemo(() => {
    if (!isBookletLayout || !activeSectionId) return [] as string[];
    return grouping?.itemRefsBySection.get(activeSectionId) ?? [];
  }, [activeSectionId, grouping, isBookletLayout]);

  /**
   * Where the reader is, as a single item-ref.
   *
   * The runner can only answer this when it renders one question per screen. On
   * a booklet page it reports a section and no active item, so vertical mode
   * takes the scroll position and a grouped page takes its first question.
   */
  const currentPositionItemRefId = isVerticalLayout
    ? scrolledItemRefIdentifier
    : groupsSharedStimuli
      ? (activeSectionItemRefIds[0] ?? "")
      : currentItemRefIdentifier;

  /**
   * The page stays hidden while the runner assembles it — items connecting,
   * the stimulus landing and being lifted into its column, images arriving —
   * and a skeleton of the same shape holds its place. The hoist runs once more
   * right before the reveal, so the source is already in its column when the
   * page appears rather than moving there a beat later.
   */
  const {
    loading: pageLoading,
    showSkeleton: showPageSkeleton,
    target: pageLoadingTarget,
  } = usePageLoading({
    qtiTestElement,
    testContainerRef,
    beforeReveal: isBookletLayout ? hoistSharedStimuli : undefined,
  });

  /** What the page being loaded holds, so the skeleton can take its shape. */
  const pageSkeletonShape = useMemo(() => {
    const itemRefIds =
      pageLoadingTarget?.type === "section"
        ? (grouping?.itemRefsBySection.get(pageLoadingTarget.id) ?? [])
        : pageLoadingTarget
          ? [pageLoadingTarget.id]
          : [];
    return {
      withStimulus:
        !isVerticalLayout &&
        itemRefIds.some((id) => stimulusRefs.primaryStimulusByItem.has(id)),
      questionCount: isVerticalLayout ? 3 : Math.min(itemRefIds.length, 4),
    };
  }, [
    grouping,
    isVerticalLayout,
    pageLoadingTarget,
    stimulusRefs.primaryStimulusByItem,
  ]);

  /**
   * Whether vertical mode's left pane is on screen. Off on the intro and the
   * overview, which both take the whole surface.
   */
  const showVerticalPane = isVerticalLayout && !showIntro && !isOverviewOpen;

  /** Which questions the chrome should light up as "you are here". */
  const activeItemRefIds = useMemo(() => {
    if (groupsSharedStimuli) return new Set(activeSectionItemRefIds);
    return new Set(
      currentPositionItemRefId ? [currentPositionItemRefId] : [],
    );
  }, [activeSectionItemRefIds, currentPositionItemRefId, groupsSharedStimuli]);

  const storedTestContext = useMemo(
    () => testContexts.find((ctx) => ctx.assessmentId === assessmentId),
    [assessmentId, testContexts],
  );

  const responseStateByItemRefId = useMemo(() => {
    const map = new Map<string, "missing" | "incomplete" | "complete">();
    // The saved answers first. The runner's computed context only knows the
    // questions it has rendered, so on a fresh load -- the overview opened
    // straight from a reload -- it reported every question as unanswered.
    for (const item of storedTestContext?.items ?? []) {
      const variables = item.variables ?? [];
      const completed = variables.some(
        (v) => v.identifier === "completionStatus" && v.value === "completed",
      );
      const answered = variables.some(
        (v) =>
          v.identifier?.startsWith("RESPONSE") &&
          v.value != null &&
          v.value !== "" &&
          !(Array.isArray(v.value) && v.value.length === 0),
      );
      if (item.identifier && (completed || answered)) {
        map.set(item.identifier, completed ? "complete" : "incomplete");
      }
    }
    const ctxItems = stampContext?.activeTestpart?.items || [];
    for (const item of ctxItems) {
      const hasNonEmptyResponse =
        item.response &&
        item.response !== "" &&
        !(Array.isArray(item.response) && item.response.length === 0);
      const responseState =
        item.completionStatus === "completed"
          ? "complete"
          : hasNonEmptyResponse
            ? "incomplete"
            : "missing";
      // A live "missing" may only mean "not rendered yet"; keep the saved state.
      if (responseState === "missing" && map.has(item.identifier)) continue;
      map.set(item.identifier, responseState);
    }
    return map;
  }, [stampContext, storedTestContext]);

  const regularItems = useMemo(
    () => items.filter((item) => item.type !== "info"),
    [items],
  );
  const regularItemCount = regularItems.length;
  const answeredCount = regularItems.filter(
    (item) =>
      (responseStateByItemRefId.get(item.itemRefIdentifier ?? "") ??
        "missing") !== "missing",
  ).length;

  const resetAssessmentProgress = useStore(
    (state) => state.resetAssessmentProgress,
  );

  /**
   * Hand in: end the attempt and show the result. Local only -- there is no
   * server. The score is what the runner itself computed (`auto-score-items`
   * scores on every interaction); open questions are left out and counted.
   */
  const handIn = useCallback(() => {
    setHandInOpen(false);
    const contextItems =
      ((qtiTestRef.current?.testContext as ExtendedTestContext | undefined)
        ?.items ?? []) as ExtendedItemContext[];
    // Live first; the saved copy for questions this runner has not rendered
    // (the overview, where handing in starts, may follow a fresh load).
    const storedItems = (storedTestContext?.items ?? []) as ExtendedItemContext[];
    const numberOf = (
      itemRefId: string,
      identifier: string,
    ): number | null => {
      const find = (source: ExtendedItemContext[]) =>
        source
          .find((ctx) => ctx.identifier === itemRefId)
          ?.variables?.find((v) => v.identifier === identifier);
      const variable = find(contextItems) ?? find(storedItems);
      const value = Number(variable?.value);
      return variable?.value != null && Number.isFinite(value) ? value : null;
    };

    let score = 0;
    let maxScore: number | null = 0;
    let manuallyScored = 0;
    const root = testContainerRef.current?.shadowRoot;
    /** Open questions: the import says so, the runner marks SCORE external, or the page shows one. */
    const isManuallyScored = (item: (typeof regularItems)[number]) => {
      const id = item.itemRefIdentifier ?? "";
      if (item.interactionType === "extendedTextEntry") return true;
      const scoreVariable = contextItems
        .find((ctx) => ctx.identifier === id)
        ?.variables?.find((v) => v.identifier === "SCORE") as
        | { externalScored?: string | null }
        | undefined;
      if (scoreVariable?.externalScored) return true;
      return !!root?.querySelector(
        `qti-assessment-item-ref[identifier="${CSS.escape(id)}"] qti-extended-text-interaction`,
      );
    };
    for (const item of regularItems) {
      const id = item.itemRefIdentifier ?? "";
      if (isManuallyScored(item)) {
        manuallyScored += 1;
        continue;
      }
      score += numberOf(id, "SCORE") ?? 0;
      // Unvisited questions only know their maximum from the import.
      const max = item.maxScore ?? numberOf(id, "MAXSCORE");
      maxScore = max === null || maxScore === null ? null : maxScore + max;
    }

    setOverviewMode(false);
    setHandInResult({
      answered: answeredCount,
      total: regularItemCount,
      score,
      maxScore,
      manuallyScored,
    });
  }, [
    answeredCount,
    regularItemCount,
    regularItems,
    setOverviewMode,
    storedTestContext,
  ]);

  /** Start again: forget this attempt's answers and bookmarks, reload the runner. */
  const startAgain = useCallback(() => {
    if (!assessmentId) return;
    discardingAnswersRef.current = true;
    resetAssessmentProgress(assessmentId);
    lastSavedContextJsonRef.current = null;
    setHandInResult(null);
    setAttempt((current) => current + 1);
  }, [assessmentId, resetAssessmentProgress]);

  /**
   * Leave the intro for the layout the reader picked.
   *
   * Starting is always a fresh attempt: answers and bookmarks saved by an
   * earlier run are dropped, and the runner remounts with a blank context
   * (which opens it on the first question, whatever the layout).
   *
   * One URL write for both the layout and the dismissed overview: two calls
   * would each start from the same `queryParams` snapshot and the second would
   * drop the first one's parameter.
   */
  const startAssessment = useCallback(
    (settings: SessionSettings) => {
      setShowIntro(false);
      startAgain();
      const next = new URLSearchParams(queryParams);
      next.delete("overview");
      const write = (key: string, value: string, fallback: string) => {
        if (value === fallback) next.delete(key);
        else next.set(key, value);
      };
      write("layout", settings.layout, DEFAULT_LAYOUT_MODE);
      write("mode", settings.mode, DEFAULT_PLAYER_MODE);
      write("theme", settings.theme, DEFAULT_PLAYER_THEME);
      write("device", settings.device, DEFAULT_PLAYER_DEVICE);
      // A device preview loads this same page into a frame, which must open on
      // the test rather than on this intro again.
      if (settings.device !== DEFAULT_PLAYER_DEVICE) next.set("start", "1");
      setQueryParams(next, { replace: true });
    },
    [queryParams, setQueryParams, startAgain],
  );

  /**
   * Practice mode's coach. `pageKey` names what is on screen, so moving on
   * clears the last verdict (and any answer it revealed); in vertical mode the
   * whole test is one page, so scrolling does not.
   */
  const practicePageKey = isVerticalLayout
    ? "booklet"
    : groupsSharedStimuli
      ? (activeSectionItemRefIds[0] ?? "")
      : currentItemRefIdentifier;
  const [coach, setCoach] = useState<{
    mood: CoachMood;
    message: string;
    bubbleVisible: boolean;
    checkCount: number;
    busy: boolean;
    answerShown: boolean;
    wrongItems: Parameters<typeof showAnswers>[0];
  }>({
    mood: "idle",
    message: `Hi, I'm ${COACH_NAMES[coachCharacter]}! Answer the question, then press Check and I'll tell you how you did.`,
    bubbleVisible: true,
    checkCount: 0,
    busy: false,
    answerShown: false,
    wrongItems: [],
  });
  const [lastPracticePageKey, setLastPracticePageKey] = useState(practicePageKey);
  if (lastPracticePageKey !== practicePageKey) {
    setLastPracticePageKey(practicePageKey);
    // Until the first check the greeting stays up, so the reader learns what
    // the button is for; after that the next page starts quiet.
    setCoach((current) => ({
      ...current,
      mood: "idle",
      bubbleVisible: current.checkCount === 0 && current.bubbleVisible,
      answerShown: false,
      wrongItems: [],
    }));
  }
  const handlePracticeCheck = useCallback(async () => {
    const root = testContainerRef.current?.shadowRoot;
    if (!root) return;
    setCoach((current) => ({ ...current, busy: true }));
    const result = await checkPage(root);
    setCoach((current) => {
      if (current.answerShown) showAnswers(current.wrongItems, false);
      return {
        mood: result.mood,
        message: result.message,
        bubbleVisible: true,
        checkCount: current.checkCount + 1,
        busy: false,
        answerShown: false,
        wrongItems: result.wrongItems,
      };
    });
  }, []);
  const handleToggleAnswer = useCallback(() => {
    setCoach((current) => {
      showAnswers(current.wrongItems, !current.answerShown);
      return { ...current, answerShown: !current.answerShown };
    });
  }, []);

  // The new runner is a fresh attempt: its saves count again.
  useEffect(() => {
    discardingAnswersRef.current = false;
  }, [qtiTestElement]);

  /** The item on screen is adaptive and not yet completed: the nav bar offers "End attempt" in place of "Next",
   *  unless the item brings its own end-attempt interaction. Once completed, "Next" returns. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeItemCtx = (stampContext?.activeTestpart?.items ?? []).find((i: any) => i.active);
  /** What "Show Output" reports on: the question being read, which in a booklet is not the runner's active item. */
  const outputItem: OutputItem | null =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stampContext?.activeTestpart?.items ?? []).find((i: any) =>
      currentPositionItemRefId ? i.identifier === currentPositionItemRefId : i.active,
    ) ?? activeItemCtx ?? null;
  const showEndAttempt =
    activeItemCtx?.adaptive === true &&
    activeItemCtx.completionStatus !== "completed" &&
    !qtiTestElement?.querySelector(
      `qti-assessment-item-ref[identifier="${CSS.escape(activeItemCtx.identifier)}"] qti-end-attempt-interaction`,
    );

  const overviewNavTargets = useMemo(() => {
    const ctxItems = stampContext?.activeTestpart?.items || [];
    const ids: string[] = ctxItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((i: any) => i.identifier)
      .filter(Boolean);
    const activeIndex = currentPositionItemRefId
      ? ids.indexOf(currentPositionItemRefId)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctxItems.findIndex((i: any) => i.active);
    return {
      activeIndex,
      prevId: activeIndex > 0 ? ids[activeIndex - 1] : null,
      nextId:
        activeIndex >= 0 && activeIndex < ids.length - 1
          ? ids[activeIndex + 1]
          : null,
    };
  }, [currentPositionItemRefId, stampContext]);

  /**
   * The nav bar's copy of the context, with "you are here" set the way this
   * layout decides it. The runner only marks an item active when it renders one
   * per screen, so on a booklet page every question in view is marked instead.
   */
  const navStampContext = useMemo(() => {
    const ctxItems = stampContext?.activeTestpart?.items;
    if (!ctxItems) return stampContext;
    return {
      ...stampContext,
      activeTestpart: {
        ...stampContext.activeTestpart,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: ctxItems.map((item: any) => ({
          ...item,
          active: activeItemRefIds.has(item.identifier),
        })),
      },
    };
  }, [activeItemRefIds, stampContext]);

  /**
   * What prev/next mean on a booklet page: the neighbouring question in
   * vertical mode, the neighbouring section when questions are grouped. Both
   * are expressed as an item-ref so `goToItem` can do the right thing with it.
   */
  const pageNavTargets = useMemo(() => {
    if (isVerticalLayout) {
      const order = items.map(itemKey);
      const index = order.indexOf(currentPositionItemRefId);
      return {
        prevId: index > 0 ? order[index - 1] : null,
        nextId:
          index >= 0 && index < order.length - 1 ? order[index + 1] : null,
      };
    }

    const sections = grouping?.sections ?? [];
    const index = activeSectionId ? sections.indexOf(activeSectionId) : -1;
    const firstOf = (sectionId: string | undefined) =>
      (sectionId && grouping?.itemRefsBySection.get(sectionId)?.[0]) || null;
    return {
      prevId: index > 0 ? firstOf(sections[index - 1]) : null,
      nextId:
        index >= 0 && index < sections.length - 1
          ? firstOf(sections[index + 1])
          : null,
    };
  }, [
    activeSectionId,
    currentPositionItemRefId,
    grouping,
    isVerticalLayout,
    items,
  ]);

  const closeOverview = useCallback(() => {
    setOverviewMode(false);
  }, [setOverviewMode]);

  const goToPrevFromOverview = useCallback(() => {
    const prevId = overviewNavTargets.prevId;
    closeOverview();
    goToItem(prevId);
  }, [closeOverview, goToItem, overviewNavTargets.prevId]);

  const goToNextFromOverview = useCallback(() => {
    const nextId = overviewNavTargets.nextId;
    closeOverview();
    goToItem(nextId);
  }, [closeOverview, goToItem, overviewNavTargets.nextId]);

  // Overview is URL-driven, so it can open without going through a handler here (deep link, back/
  // forward). Dismissing the intro during render instead of from an effect keeps that to a single
  // render pass rather than a committed render followed by a cascading one.
  if (isOverviewOpen && showIntro) {
    setShowIntro(false);
  }

  const clampZoom = useCallback((value: number) => {
    const rounded = Number(value.toFixed(2));
    return Math.min(2, Math.max(0.5, rounded));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => clampZoom(prev + 0.1));
  }, [clampZoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => clampZoom(prev - 0.1));
  }, [clampZoom]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  /** Bookmark a named question — any question, not only the one in view. */
  const toggleBookmark = useCallback(
    (itemRefIdentifier: string, marked: boolean) => {
      if (!itemRefIdentifier || !assessmentId) return;
      const next = new Set(
        useStore.getState().bookmarks?.[assessmentId] ?? [],
      );
      if (marked) next.add(itemRefIdentifier);
      else next.delete(itemRefIdentifier);
      setBookmarks(assessmentId, [...next]);
    },
    [assessmentId, setBookmarks],
  );

  /** The toolbar's bookmark always aims at whichever question is current. */
  const handleMarkCurrentItem = useCallback(
    (marked: boolean) => {
      toggleBookmark(currentPositionItemRefId, marked);
    },
    [currentPositionItemRefId, toggleBookmark],
  );

  /**
   * Stable handle for the booklet's own bookmark buttons. They are plain DOM
   * inside <test-container>'s shadow root, wired up from a decoration pass
   * rather than from a render, so the state they read has to come from a ref.
   */
  const bookmarkedItemRefIdsRef = useRef(bookmarkedItemRefIds);
  useEffect(() => {
    bookmarkedItemRefIdsRef.current = bookmarkedItemRefIds;
  }, [bookmarkedItemRefIds]);

  /**
   * Player context, from the runner's computed context rather than from
   * `<test-stamp>`.
   *
   * `<test-stamp>` bails out unless there is an *active item*, and a section
   * navigation deliberately has none — it sets `navItemRefId` to null and
   * renders the whole section. So on a booklet page the stamp never fires
   * again, and the chrome that reads it (nav bar, answered counts) freezes on
   * whatever it last saw. The computed context has no such condition.
   *
   * Shaped like the stamp context so everything downstream is unchanged.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleComputedContextUpdate = useCallback((context: any) => {
    const testParts: any[] = context?.testParts ?? [];
    const testPart =
      testParts.find((part: any) => part.active) ?? testParts[0];
    const sections: any[] = testPart?.sections ?? [];
    if (sections.length === 0) return;

    const next = {
      view: context?.view,
      activeSection: sections.find((section: any) => section.active) ?? null,
      activeTestpart: {
        sections,
        items: sections.flatMap((section: any) => section.items ?? []),
      },
    };

    setStampContext((prevContext: any) =>
      JSON.stringify(prevContext) === JSON.stringify(next) ? prevContext : next,
    );
  }, []);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  useEffect(() => {
    // `<test-navigation>` provides the computed context. Ask from its
    // `<test-stamp>`, which is always rendered (the test container is not while
    // the overview is open), so the chrome keeps following it.
    const stamp = qtiTestElement?.querySelector(
      ":scope > test-navigation > test-stamp",
    );
    if (!stamp) return;
    return subscribeToContext(
      stamp,
      computedContext,
      handleComputedContextUpdate,
    );
  }, [handleComputedContextUpdate, qtiTestElement]);

  const attachTestContainer = useCallback(
    (element: HTMLElement | null) => {
      testContainerRef.current = element;
      setTestContainerElement(element);
      attachScopedRegistry(element);
    },
    [attachScopedRegistry],
  );

  /**
   * Keep the booklet page decorated: a number badge per question, and each
   * shared source lifted into a block of its own above the questions that use
   * it.
   *
   * Driven by a MutationObserver rather than by `cito-test-rendered` alone,
   * because a stimulus can land in the page after the load has been reported
   * and the runner re-renders items behind our back. The observer is
   * disconnected while we work so our own edits cannot wake it — both
   * functions are idempotent, but a self-triggering observer would still spin.
   */
  useEffect(() => {
    if (!isBookletLayout) return;

    const container = testContainerRef.current;
    const root = container?.shadowRoot;
    if (!container || !root) return;

    let timer = 0;
    let disposed = false;

    const decorate = () => {
      observer.disconnect();
      try {
        hoistSharedStimuli(container);
        // Vertical mode gives every question a card header with its number,
        // bookmark and score. Classic only numbers the questions of a page
        // that holds several; the toolbar keeps the bookmark.
        if (isVerticalLayout) {
          decorateQuestionBadges(
            container,
            displayNumbers,
            {
              bookmarkedIds: bookmarkedItemRefIdsRef.current,
              onToggle: toggleBookmark,
            },
            true,
          );
          decorateStimulusSpeechPlayers(container);
          decorateEndAttemptButtons(container);
        } else {
          decorateSectionItemNumbers(container, displayNumbers);
          decorateClassicSpeechPlayers(container);
        }
      } finally {
        if (!disposed) {
          observer.observe(root, { childList: true, subtree: true });
        }
      }

      const pending = pendingScrollTargetRef.current;
      if (pending && scrollToBookletItem(container, pending, "auto")) {
        pendingScrollTargetRef.current = null;
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(decorate, 50);
    };

    const observer = new MutationObserver(schedule);
    decorate();

    const onTestLoaded = () => schedule();
    qtiTestElement?.addEventListener("cito-test-rendered", onTestLoaded);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      observer.disconnect();
      qtiTestElement?.removeEventListener("cito-test-rendered", onTestLoaded);
    };
  }, [
    displayNumbers,
    isBookletLayout,
    isVerticalLayout,
    qtiTestElement,
    showIntro,
    isOverviewOpen,
    toggleBookmark,
  ]);

  /**
   * Line references ("(r. 1 en 2)", "alinea 2"): click a question and the
   * lines it names light up in its reading text. Rewired after every render --
   * the runner swaps items and stimuli behind our back, and on a booklet page
   * the decoration pass moves sources around -- with the clicked question kept
   * across re-runs.
   */
  /**
   * A page that never renders gets one silent retry, then a message with a
   * retry button instead of an empty page.
   */
  const { failure: itemLoadFailure, retry: retryItemLoad } =
    useItemLoadWatchdog(qtiTestElement, isVerticalLayout);

  /** Toolbar volume, applied to every audio/video the runner renders. */
  const pageHasMedia = useMediaVolume(testContainerElement, volume);

  const pinnedReferenceRef = useRef<string | null>(null);
  useEffect(() => {
    if (showIntro || isOverviewOpen) return;
    const container = testContainerRef.current;
    const root = container?.shadowRoot;
    if (!container || !root) return;

    let cleanup = applyStimulusReferences(container, pinnedReferenceRef);
    let timer = 0;
    const rewire = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        cleanup();
        cleanup = applyStimulusReferences(container, pinnedReferenceRef);
      }, 150);
    };
    const observer = new MutationObserver(rewire);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      cleanup();
    };
  }, [qtiTestElement, layoutMode, showIntro, isOverviewOpen]);

  /**
   * The booklet's bookmark buttons are plain DOM, so they do not re-render with
   * the side pane and the overview. Repaint them whenever the set changes.
   */
  useEffect(() => {
    if (!isVerticalLayout) return;
    syncBookmarkButtons(testContainerRef.current, bookmarkedItemRefIds);
  }, [bookmarkedItemRefIds, isVerticalLayout]);

  /**
   * Vertical mode only: the scroll position is what "the current question"
   * means, so watch it and tell the chrome.
   */
  useEffect(() => {
    if (!isVerticalLayout || showIntro || isOverviewOpen) return;
    return observeBookletScroll(
      testContainerRef.current,
      scrollAreaRef.current,
      setScrolledItemRefIdentifier,
    );
  }, [isOverviewOpen, isVerticalLayout, showIntro, stampContext]);

  useEffect(() => {
    initialZoomRef.current = document.documentElement.style.zoom || "";
    initialBodyZoomRef.current = document.body.style.zoom || "";
    return () => {
      document.documentElement.style.zoom = initialZoomRef.current;
      document.body.style.zoom = initialBodyZoomRef.current;
    };
  }, []);

  useEffect(() => {
    // Use numeric zoom; more consistently supported than percentage strings.
    const zoom = String(zoomLevel);
    document.documentElement.style.zoom = zoom;
    document.body.style.zoom = zoom;
  }, [zoomLevel]);

  // Render as an overlay and prevent page scrolling behind it
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  if (!assessment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-medium text-gray-700">
            Assessment Not Found
          </h2>
          <p className="mb-6 text-gray-600">
            The requested assessment could not be found.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePrevious}>
              Previous
            </Button>
            <Button onClick={handleBackNavigation}>Select new package</Button>
          </div>
        </div>
      </div>
    );
  }

  /** The overview replaces the page, unless the intro or the hand-in result is on screen. */
  const overviewShown = isOverviewOpen && !showIntro && !handInResult;

  const overviewNavButtons = (
    <>
      <Button
        size="sm"
        onClick={goToPrevFromOverview}
        disabled={!overviewNavTargets.prevId}
        className="shrink-0"
        title="Previous item"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>
      <div className="flex-1 min-w-0 flex justify-center">
        <Button
          size="sm"
          variant="secondary"
          onClick={closeOverview}
          title="Close overview"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Close overview
        </Button>
      </div>
      <Button
        size="sm"
        onClick={goToNextFromOverview}
        disabled={!overviewNavTargets.nextId}
        className="shrink-0"
        title="Next item"
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </>
  );

  return (
    <div
      data-player-theme={playerTheme}
      className="fixed inset-0 z-50 flex w-full flex-col bg-gray-200 overflow-hidden"
    >
      {/* Fixed Header - Always visible */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white px-4 py-3 border-b border-gray-300 shadow-md z-10">
        <div className="flex min-w-0 items-center space-x-3">
          {isEmbedded ? null : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitOverlay}
              title="Back"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="sm:mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          <h1 className="truncate text-base font-medium text-gray-800 sm:text-lg">
            {assessmentTitle || "Assessment"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={showVariables ? "secondary" : "ghost"}
            onClick={() => setShowVariables((current) => !current)}
          >
            <Code className="sm:mr-1 h-4 w-4" />
            <span className="hidden sm:inline">
              {showVariables ? "Hide Output" : "Show Output"}
            </span>
          </Button>
          <Button
            size="sm"
            variant={isOverviewOpen ? "secondary" : "ghost"}
            onClick={() => setOverviewMode(!isOverviewOpen)}
            title="Overview"
          >
            <LayoutGrid className="sm:mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </Button>
        </div>
      </div>

      {/* Main content area - takes remaining space */}
      <div className="flex-1 flex items-center justify-center p-0 sm:px-4 sm:py-4 min-h-0 overflow-hidden">
        <div className={`${PLAYER_SURFACE} h-full flex flex-col bg-white sm:rounded-lg sm:shadow-lg overflow-hidden`}>
          {/* The layout is decided before the test loads, and the scan that
              decides it (which items share a stimulus) reads the item XML. So
              the player waits for it: `<test-container>` starts fetching the
              test the moment it connects, and a transform that arrives after
              that is a transform that never ran. */}
          {!stimulusRefs.ready ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Preparing test...
            </div>
          ) : (
          <>
          <qti-test
            key={`${layoutMode}:${attempt}`}
            ref={refCallback}
            cache-transform
            className={`${overviewShown ? "flex-none" : "h-full"} min-h-0 flex flex-col`}
          >
            <test-navigation
              initContext={items
                .filter((item) => !!item.itemRefIdentifier)
                .map((item) => ({
                  identifier: item.itemRefIdentifier as string,
                  title: item.title,
                  externalScored: item.interactionType === "extendedTextEntry",
                }))}
              auto-score-items
              className="h-full min-h-0 flex flex-col"
            >
              <test-stamp class="h-full min-h-0 flex flex-col">
                {/* Mode Switch - Fixed at top of content */}
                <div className="flex-shrink-0 flex justify-center p-2 sm:p-4 bg-gray-50 border-b">
                  {/* Spans the surface rather than the item measure, and wraps. Capped at `max-w-4xl` it was
                        narrower than its own controls -- ModeSwitch plus the toolbar group plus Download, none
                        of which can shrink -- so the row overflowed the panel and the panel's `overflow-hidden`
                        clipped the Download button off the right edge where it could not be clicked. */}
                  <div
                    className={`${PLAYER_SURFACE} flex min-w-0 flex-wrap items-center justify-between gap-3`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ModeSwitch
                        initialMode="candidate"
                        onCheck={handleToggle}
                      />
                      <PlayerOptionsMenu
                        layout={layoutMode}
                        mode={playerMode}
                        theme={playerTheme}
                        device={DEFAULT_PLAYER_DEVICE}
                        onLayoutChange={setLayoutMode}
                        onModeChange={(value) =>
                          setSessionOption("mode", value, DEFAULT_PLAYER_MODE)
                        }
                        onThemeChange={(value) =>
                          setSessionOption("theme", value, DEFAULT_PLAYER_THEME)
                        }
                        // Inside a device preview the frame's own bar switches device.
                        onDeviceChange={
                          isEmbedded
                            ? undefined
                            : (value) =>
                                setSessionOption(
                                  "device",
                                  value,
                                  DEFAULT_PLAYER_DEVICE,
                                )
                        }
                      />
                    </div>

                    <div
                      id="toolbar"
                      className="flex flex-wrap items-center gap-2 rounded p-1"
                    >
                      <ToolBar
                        marked={bookmarkedItemRefIds.has(
                          currentPositionItemRefId,
                        )}
                        onMarkCurrentItem={handleMarkCurrentItem}
                        // Vertical mode carries a bookmark on every question it
                        // shows, so the toolbar's own -- which can only ever
                        // mean "the one in view" -- would be a second, vaguer
                        // way to do the same thing. Classic keeps it, and on a
                        // shared-stimulus page it marks the page's first
                        // question, the one its nav pill opens on.
                        showBookmark={!isVerticalLayout}
                        // The toolbar player reads the current item. A booklet
                        // page has none -- every question and source there
                        // carries its own player instead.
                        showSpeech={
                          !isBookletLayout && !showIntro && !isOverviewOpen
                        }
                        // Only when the page has something to play.
                        volume={pageHasMedia ? volume : undefined}
                        onVolumeChange={handleVolumeChange}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onResetZoom={handleResetZoom}
                        zoomLevel={zoomLevel}
                        editing={isEditorOpen}
                        onToggleEdit={
                          // The in-place editor edits "the current item", which
                          // a page holding three of them cannot name. Hidden
                          // there, as it already is on the intro and overview.
                          showIntro || isOverviewOpen || isBookletLayout
                            ? undefined
                            : onToggleEditor
                        }
                      />
                      <DownloadPackageButton
                        label="Download"
                        className="hidden h-10 rounded-full border border-gray-200 bg-white px-3 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white hover:text-gray-900 sm:inline-flex"
                      />
                    </div>
                  </div>
                </div>

                {/* Content area. Vertical mode puts its navigation in a left
                    pane instead of the footer bar, so this becomes a row. */}
                <div
                  className={`relative flex-1 min-h-0 ${
                    showVerticalPane ? "flex flex-col lg:flex-row" : ""
                  } ${overviewShown ? "hidden" : ""}`}
                >
                  {showVerticalPane && (
                    <VerticalNavigationPane
                      items={items}
                      displayNumbers={displayNumbers}
                      responseStateByItemRefId={responseStateByItemRefId}
                      bookmarkedItemRefIds={bookmarkedItemRefIds}
                      activeItemRefId={currentPositionItemRefId}
                      onSelectItem={goToItem}
                      isOverviewOpen={isOverviewOpen}
                      onToggleOverview={() => setOverviewMode(!isOverviewOpen)}
                    />
                  )}
                  <div
                    ref={scrollAreaRef}
                    className="h-full min-w-0 flex-1 overflow-auto"
                    aria-hidden={isEditorOpen}
                  >
                  {showIntro ? (
                    <AssessmentIntroScreen
                      assessmentName={assessmentTitle}
                      itemCount={items.filter((i) => i.type !== "info").length}
                      initialSettings={{
                        layout: layoutMode,
                        mode: playerMode,
                        theme: playerTheme,
                        device: parsePlayerDevice(queryParams.get("device")),
                      }}
                      onStart={startAssessment}
                      onOpenOverview={() => {
                        setShowIntro(false);
                        setOverviewMode(true);
                      }}
                    />
                  ) : handInResult ? (
                    <HandedInScreen
                      result={handInResult}
                      onReview={() => {
                        setHandInResult(null);
                        setOverviewMode(true);
                      }}
                      onStartAgain={startAgain}
                    />
                  ) : isOverviewOpen ? null : (
                    <div
                      className={
                        isVerticalLayout
                          ? // A booklet reads at one column, and needs a
                            // viewport of slack below the last question so it
                            // can still be scrolled to the top of the pane.
                            "relative mx-auto w-full max-w-3xl px-4 pt-6 pb-[70vh]"
                          : `relative flex justify-center p-3 sm:p-6 min-h-full ${
                              // Room for the practice coach below the last line.
                              playerMode === "practice" ? "pb-40" : ""
                            }`
                      }
                    >
                      <test-container
                        ref={attachTestContainer}
                        customElementRegistry={scopedRegistry}
                        // Hidden, not unmounted: the runner needs a laid-out
                        // container to render into while the page loads.
                        className={`transition-opacity duration-200 ${
                          pageLoading ? "invisible opacity-0" : "opacity-100"
                        } ${
                          isVerticalLayout
                            ? "custom-qti-style cito-style block w-full"
                            : groupsSharedStimuli
                              ? // Room for the source beside its questions;
                                // booklet-classic.css narrows a page without
                                // one back to the single-item width.
                                "custom-qti-style cito-style block w-full max-w-7xl"
                              : "custom-qti-style cito-style w-full max-w-4xl"
                        }`}
                        testURL={assessment?.testUrl}
                      >
                        <template
                          dangerouslySetInnerHTML={{
                            __html: `<style>${itemCss}\n${stimulusReferenceCss}</style>${
                              isBookletLayout
                                ? `<style>${bookletCssFor(layoutMode)}</style>`
                                : ""
                            }`,
                          }}
                        ></template>
                      </test-container>
                      {itemLoadFailure && (
                        <div
                          role="alert"
                          className="absolute inset-0 z-10 flex items-start justify-center bg-white/95 p-6 pt-24"
                        >
                          <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-lg">
                            <h2 className="mb-2 text-lg font-semibold text-gray-900">
                              This question could not be loaded
                            </h2>
                            <p className="mb-5 text-sm text-gray-600">
                              Something went wrong while loading{" "}
                              {itemLoadFailure.type === "section"
                                ? "this page"
                                : "this question"}
                              . Your answers are saved.
                            </p>
                            <div className="flex flex-col items-center gap-3">
                              <Button onClick={retryItemLoad}>Try again</Button>
                              <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="text-sm text-citolab-700 underline hover:text-citolab-800"
                              >
                                Reload the page
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {showPageSkeleton && (
                        <div className="absolute inset-x-0 top-0 px-6 pt-6">
                          <PageLoadingSkeleton
                            withStimulus={pageSkeletonShape.withStimulus}
                            questionCount={pageSkeletonShape.questionCount}
                          />
                        </div>
                      )}
                      {/* The end of the booklet. Vertical mode has no footer
                          bar, so the way on from the last question has to live
                          on the page -- and reaching it costs a scroll past
                          every question, which is the point. The playground has
                          no hand-in, so "done" means the overview. */}
                      {isVerticalLayout && (
                        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                          <Button
                            size="sm"
                            data-vertical-finish
                            onClick={() => setOverviewMode(true)}
                            title="Finished - review your answers in the overview"
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Finish
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  </div>

                  {playerMode === "practice" &&
                    !showIntro &&
                    !handInResult &&
                    !isOverviewOpen &&
                    !isEditorOpen && (
                      <PracticeCoach
                        character={coachCharacter}
                        mood={coach.mood}
                        message={coach.message}
                        bubbleVisible={coach.bubbleVisible}
                        checkCount={coach.checkCount}
                        checkLabel={
                          isVerticalLayout
                            ? "Check my answers"
                            : groupsSharedStimuli
                              ? "Check this page"
                              : "Check"
                        }
                        busy={coach.busy}
                        canShowAnswer={coach.wrongItems.length > 0}
                        answerShown={coach.answerShown}
                        onCheck={() => void handlePracticeCheck()}
                        onToggleAnswer={handleToggleAnswer}
                        onDismiss={() =>
                          setCoach((current) => ({
                            ...current,
                            bubbleVisible: false,
                          }))
                        }
                      />
                    )}

                  {/* In-place editor: replaces the item content without
                      unmounting the test underneath. */}
                  {isEditorOpen && !showIntro && !isOverviewOpen && (
                    <div className="absolute inset-0 z-20 flex flex-col bg-white">
                      <div className="flex flex-shrink-0 items-center border-b border-gray-200 px-4 py-2">
                        <span className="text-sm font-medium text-gray-700">
                          Editing {currentItemIdentifier || "item"}
                        </span>
                      </div>
                      <div className="min-h-0 flex-1 overflow-auto">
                        {/* Same wrapper the test-container above gets, so the item keeps its
                            column when the editor covers it. */}
                        <QtiCitolabEditorPanel
                          key={editorSessionKey}
                          editorSessionKey={editorSessionKey}
                          active
                          sourceXml={editorSourceXml || ""}
                          assetBaseHref={editorAssetBaseHref}
                          onSourceChange={pushEditorSource}
                          surfaceClassName="flex justify-center p-6"
                          contentClassName="max-w-4xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed bottom navigation. Absent in vertical mode: the left
                    pane is the navigation there, and a booklet has no pages to
                    step through. */}
                {!showIntro && !showVerticalPane && !overviewShown && (
                  <div className="flex-shrink-0 border-t bg-white">
                    <nav className="flex items-center justify-between px-6 py-4 w-full min-w-0">
                      {isOverviewOpen ? (
                        overviewNavButtons
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* `test-prev`/`test-next` step by item and need an
                                active one, which a section navigation
                                deliberately does not have. On a booklet page
                                prev/next therefore drive the page itself: the
                                neighbouring question in vertical mode, the
                                neighbouring section when questions are grouped. */}
                            {isBookletLayout ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  goToItem(pageNavTargets.prevId)
                                }
                                disabled={!pageNavTargets.prevId}
                                title={
                                  isVerticalLayout
                                    ? "Previous question"
                                    : "Previous page"
                                }
                              >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                              </Button>
                            ) : (
                              <test-prev className="inline-flex items-center rounded-md bg-citolab-700 px-4 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm">
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                              </test-prev>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setOverviewMode(!isOverviewOpen)}
                              title="Overview"
                            >
                              <LayoutGrid className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 min-w-0 flex justify-center">
                            <NavigationBar
                              onClick={handleNavigationBarClick}
                              stampContext={navStampContext}
                              groupOf={
                                groupsSharedStimuli ? sectionOf : undefined
                              }
                              bookmarkedItemIds={Array.from(
                                bookmarkedItemRefIds,
                              )}
                            />
                          </div>
                          {/* An adaptive item moves on only when an attempt ends: the runner's own button takes
                              the place of "Next" until the item is completed. One question per screen only. */}
                          {!isBookletLayout && showEndAttempt ? (
                            <test-end-attempt
                              data-testid="end-attempt"
                              className="inline-flex items-center rounded-md bg-citolab-700 px-5 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm flex-shrink-0"
                            >
                              End attempt
                            </test-end-attempt>
                          ) : isBookletLayout ? (
                            <Button
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => goToItem(pageNavTargets.nextId)}
                              disabled={!pageNavTargets.nextId}
                              title={
                                isVerticalLayout
                                  ? "Next question"
                                  : "Next page"
                              }
                            >
                              Next
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          ) : (
                            <test-next className="inline-flex items-center rounded-md bg-citolab-700 px-5 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm flex-shrink-0">
                              Next
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </test-next>
                          )}
                        </>
                      )}
                    </nav>
                  </div>
                )}
              </test-stamp>
              <HandInDialog
                open={handInOpen}
                answered={answeredCount}
                total={regularItemCount}
                onConfirm={handIn}
                onCancel={() => setHandInOpen(false)}
              />
              <DraggablePopup
                isOpen={
                  showRubricPanel && rubricPanelOpen && !!scoringRubricHtml
                }
                onClose={() => setRubricPanelOpen(false)}
                setIsOpen={setRubricPanelOpen}
                title="Scoring rubric"
                storageKey="rubricPanelState"
              >
                {/* The item's own rubric markup, already rendered in the
                    player; the package is the user's, nothing leaves the page. */}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: scoringRubricHtml ?? "" }}
                />
              </DraggablePopup>
              <DraggablePopup
                isOpen={showVariables}
                onClose={() => setShowVariables(false)}
                setIsOpen={setShowVariables}
                title="Item output"
                storageKey="itemOutputPanelState"
                defaultSize={{ width: 440, height: 520 }}
              >
                <ItemOutputPanel
                  item={outputItem}
                  itemIdentifier={
                    outputItem?.identifier === currentItemRefIdentifier
                      ? currentItemIdentifier
                      : undefined
                  }
                />
              </DraggablePopup>
            </test-navigation>
          </qti-test>
          {/* The overview sits below <qti-test>, not inside it: its thumbnails
              are item players of their own, and inside the runner their
              composed events would be taken for the test's items. */}
          {overviewShown && (
            <>
              <div className="min-h-0 flex-1 overflow-auto">
                <AssessmentOverviewPage
                  items={items}
                  responseStateByItemRefId={responseStateByItemRefId}
                  bookmarkedItemRefIds={bookmarkedItemRefIds}
                  primaryStimulusByItem={stimulusRefs.primaryStimulusByItem}
                  onOpenItem={(itemRefIdentifier) => {
                    setOverviewMode(false);
                    goToItem(itemRefIdentifier);
                  }}
                  onHandIn={() => setHandInOpen(true)}
                />
              </div>
              <div className="flex-shrink-0 border-t bg-white">
                <nav className="flex items-center justify-between px-6 py-4 w-full min-w-0">
                  {overviewNavButtons}
                </nav>
              </div>
            </>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};
