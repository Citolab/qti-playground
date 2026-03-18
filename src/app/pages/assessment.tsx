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
import { IQtiTest, QtiAssessmentItem } from "@citolab/qti-components";
import type { TestContext } from "@citolab/qti-components";
// import { QtiTest } from "@citolab/qti-components";
import {
  ChevronLeft,
  Edit,
  Code,
  ChevronRight,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { itemCss } from "../itemCss";
import {
  QTI_PKG_URL_PREFIX,
  detectPciBaseUrl,
  createModuleResolutionFetcher,
  normalizePciPaths,
} from "@citolab/qti-browser-import";

import DraggablePopup from "../components/draggable-popup";
import ModeSwitch from "../components/mode-switcher";
import { Button } from "@/components/ui/button";
import { ToolBar } from "../components/tool-bar";
import { NavigationBar } from "./nav-list";
import { AssessmentOverviewPage } from "./assessment-overview";
import { AssessmentIntroScreen } from "./assessment-intro";
import { ExtendedItemContext, ExtendedTestContext } from "@citolab/qti-api";

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

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const qtiTestRef = useRef<IQtiTest>(null);
  const [qtiTestElement, setQtiTestElement] = useState<IQtiTest | null>(null);
  const hasRedirectedForMissingPackageCacheRef = useRef(false);
  const [queryParams, setQueryParams] = useSearchParams();
  const [showVariables, setShowVariables] = useState(false);
  const [currentItemIdentifier, setCurrentItemIdentifier] = useState("");
  const [currentItemRefIdentifier, setCurrentItemRefIdentifier] = useState("");
  const isOverviewOpen = queryParams.get("overview") === "true";
  const [showIntro, setShowIntro] = useState(() => {
    const hasItemParam = !!queryParams.get("item");
    const overview = queryParams.get("overview") === "true";
    return !hasItemParam && !overview;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stampContext, setStampContext] = useState<any>(null);
  const [bookmarkedItemRefIds, setBookmarkedItemRefIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const initialZoomRef = useRef<string>("");

  useEffect(() => {
    const handleContextUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        itemContext?: {
          identifier?: string;
          state?: Record<string, string | null> | undefined;
        };
      }>;

      const state = customEvent.detail?.itemContext?.state;
      if (!state || Object.keys(state).length === 0) return;

      console.log(
        "[PCI STATE]->",
        customEvent.detail?.itemContext?.identifier || "unknown",
        state,
      );
    };

    window.addEventListener("qti-item-context-updated", handleContextUpdated);
    return () => {
      window.removeEventListener(
        "qti-item-context-updated",
        handleContextUpdated,
      );
    };
  }, []);
  const initialBodyZoomRef = useRef<string>("");

  // Zustand store - use selectors for optimal re-renders
  const assessments = useStore((state) => state.assessments);
  const selectedAssessment = useStore((state) => state.selectedAssessment);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);
  const editItem = useStore((state) => state.editItem);
  const testContexts = useStore((state) => state.testContexts);
  const updateTestContext = useStore((state) => state.updateTestContext);

  const { assessmentId } = useParams<{
    assessmentId: string;
  }>();

  const selectedAssessmentData = assessments?.find(
    (a) => a.id === selectedAssessment,
  );
  const assessment = assessments?.find((a) => a.id === assessmentId);
  const packageRootUrl = useMemo(() => {
    if (!assessment?.packageId) return null;
    return `${QTI_PKG_URL_PREFIX}/${encodeURIComponent(assessment.packageId)}`;
  }, [assessment?.packageId]);

  const testContextsRef = useRef<AssessmentTestContext[]>([]);
  useEffect(() => {
    testContextsRef.current = testContexts;
  }, [testContexts]);
  const lastAppliedContextRef = useRef<ExtendedTestContext | null>(null);
  const hasReceivedLiveContextRef = useRef(false);

  type TransformItemApi = {
    configurePci: (
      baseUrl: string,
      getModuleResolutionConfig: (
        baseUrl: string,
        fileUrl: string,
      ) => Promise<{ paths: Record<string, string | string[]> } | null>,
    ) => Promise<TransformItemApi>;
    xmlDoc?: () => XMLDocument;
  };

  const postLoadTransformCallback = useCallback(
    async (
      transformer: TransformItemApi,
      itemRef?: { getAttribute: (name: string) => string | null },
    ) => {
      if (!packageRootUrl || !transformer?.configurePci) return transformer;

      const itemHref = itemRef?.getAttribute?.("href") || "";
      const itemDirUrl = (() => {
        if (!itemHref) return packageRootUrl;
        try {
          // `href` on qti-assessment-item-ref is relative to the *test XML URL* (not the app route URL).
          // If we resolve against `window.location.href`, PCI modules will be requested from `/items/...`
          // instead of `/__qti_pkg__/<packageId>/items/...`, causing 404s.
          const testUrl = assessment?.testUrl || packageRootUrl;
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
          const testUrl = assessment?.testUrl || packageRootUrl;
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

      const transformerXml = (): string => {
        const maybeXml = (transformer as unknown as { xml?: () => string })?.xml;
        return typeof maybeXml === "function" ? maybeXml() : "";
      };

      try {
        const rawXml = transformerXml();
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

        const doc = configured.xmlDoc?.();
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
    [assessment?.testUrl, packageRootUrl],
  );

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
    window.dispatchEvent(new CustomEvent("qti-test-loaded"));
  }, []);

  const handleTestContextUpdated = useCallback(
    (event: CustomEvent<TestContext>) => {
      const assessmentId = assessment?.id;
      if (!assessmentId) return;
      const detail = event.detail;
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

      hasReceivedLiveContextRef.current = true;
      // This update comes from the active qti-test instance, so avoid immediately replaying it back.
      lastAppliedContextRef.current = nextContext;
      updateTestContext(nextContext);
    },
    [assessment?.id, updateTestContext],
  );

  // Stable ref callback for QTI test element
  const refCallback: RefCallback<IQtiTest> = useCallback(
    (element) => {
      if (element) {
        qtiTestRef.current = element;
        setQtiTestElement(element);
        (
          element as unknown as { postLoadTransformCallback?: unknown }
        ).postLoadTransformCallback = postLoadTransformCallback;
      } else {
        qtiTestRef.current = null;
        setQtiTestElement(null);
      }
    },
    [postLoadTransformCallback],
  );

  useEffect(() => {
    if (!qtiTestElement) return;
    qtiTestElement.addEventListener(
      "qti-assessment-item-connected",
      handleItemConnected,
    );
    return () => {
      qtiTestElement.removeEventListener(
        "qti-assessment-item-connected",
        handleItemConnected,
      );
    };
  }, [handleItemConnected, qtiTestElement]);

  useEffect(() => {
    if (!qtiTestRef.current) return;
    (
      qtiTestRef.current as unknown as { postLoadTransformCallback?: unknown }
    ).postLoadTransformCallback = postLoadTransformCallback;
  }, [postLoadTransformCallback]);

  useEffect(() => {
    if (!qtiTestElement) return;
    const listener = (event: Event) =>
      handleTestContextUpdated(event as CustomEvent<TestContext>);
    qtiTestElement.addEventListener("qti-test-context-updated", listener);
    return () => {
      qtiTestElement.removeEventListener("qti-test-context-updated", listener);
    };
  }, [handleTestContextUpdated, qtiTestElement]);

  useEffect(() => {
    if (!qtiTestElement) {
      lastAppliedContextRef.current = null;
      hasReceivedLiveContextRef.current = false;
      return;
    }
    if (!assessment?.id) return;
    // Only restore persisted context after the runtime has produced at least one live context snapshot.
    // This avoids clobbering declaration defaults (e.g. QTI_CONTEXT) during initial item boot.
    if (!hasReceivedLiveContextRef.current) return;

    const stored = testContexts.find(
      (ctx) => ctx.assessmentId === assessment.id,
    );
    if (!stored || lastAppliedContextRef.current === stored) return;

    const merged = mergeRestoredTestContext(
      qtiTestElement.testContext as ExtendedTestContext | undefined,
      stored,
    );

    qtiTestElement.testContext = {
      items: merged.items.map((item) => ({
        ...item,
        variables: item.variables?.map((variable) => ({ ...variable })),
        state: item.state ? { ...item.state } : undefined,
      })),
      testOutcomeVariables: merged.testOutcomeVariables,
    };

    lastAppliedContextRef.current = stored;
  }, [assessment?.id, qtiTestElement, testContexts]);

  const handleToggle = useCallback((mode: string) => {
    if (qtiTestRef.current)
      qtiTestRef.current.dispatchEvent(
        new CustomEvent("on-test-switch-view", {
          composed: true,
          bubbles: true,
          detail: mode,
        }),
      );
  }, []);

  // QTI test setup effect
  useEffect(() => {
    if (!qtiTestRef.current || !assessment?.testUrl) return;

    const itemId = queryParams.get("item");

    const handleTestConnected = () => {
      if (itemId && assessment.items) {
        const matchingItem = assessment.items.find(
          (i) => i.identifier === itemId,
        );
        if (qtiTestRef.current && matchingItem) {
          qtiTestRef.current.navigateTo("item", matchingItem.itemRefIdentifier);
        }
      } else if (assessment.items?.length) {
        // Ensure the test starts by navigating to the first item when no explicit item is requested
        qtiTestRef.current?.navigateTo(
          "item",
          assessment.items[0].itemRefIdentifier,
        );
      }
    };

    qtiTestRef.current.addEventListener(
      "qti-assessment-test-connected",
      handleTestConnected,
    );

    return () => {
      if (qtiTestRef.current) {
        qtiTestRef.current.removeEventListener(
          "qti-assessment-test-connected",
          handleTestConnected,
        );
      }
    };
  }, [assessment?.content, assessment?.items, queryParams]);

  const items =
    itemsPerAssessment.find((i) => i.assessmentId === assessmentId)?.items ||
    [];

  // Navigation handlers
  const onEditItem = useCallback(async () => {
    try {
      await editItem(currentItemIdentifier);
      navigate(
        `/preview?itemId=${encodeURIComponent(currentItemIdentifier || "")}`,
      );
    } catch (error) {
      console.error("Edit item error:", error);
    }
  }, [currentItemIdentifier, editItem, navigate]);

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

  const handleNavigationBarClick = useCallback((id: string) => {
    if (qtiTestRef.current) {
      qtiTestRef.current.navigateTo("item", id);
    }
  }, []);

  const responseStateByItemRefId = useMemo(() => {
    const map = new Map<string, "missing" | "incomplete" | "complete">();
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
      map.set(item.identifier, responseState);
    }
    return map;
  }, [stampContext]);

  const overviewNavTargets = useMemo(() => {
    const ctxItems = stampContext?.activeTestpart?.items || [];
    const ids: string[] = ctxItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((i: any) => i.identifier)
      .filter(Boolean);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeIndex = ctxItems.findIndex((i: any) => i.active);
    return {
      activeIndex,
      prevId: activeIndex > 0 ? ids[activeIndex - 1] : null,
      nextId:
        activeIndex >= 0 && activeIndex < ids.length - 1
          ? ids[activeIndex + 1]
          : null,
    };
  }, [stampContext]);

  const closeOverview = useCallback(() => {
    setOverviewMode(false);
  }, [setOverviewMode]);

  const goToPrevFromOverview = useCallback(() => {
    const prevId = overviewNavTargets.prevId;
    closeOverview();
    if (prevId) {
      qtiTestRef.current?.navigateTo("item", prevId);
    }
  }, [closeOverview, overviewNavTargets.prevId]);

  const goToNextFromOverview = useCallback(() => {
    const nextId = overviewNavTargets.nextId;
    closeOverview();
    if (nextId) {
      qtiTestRef.current?.navigateTo("item", nextId);
    }
  }, [closeOverview, overviewNavTargets.nextId]);

  useEffect(() => {
    // If overview is opened via URL, skip intro
    if (isOverviewOpen) {
      setShowIntro(false);
    }
  }, [isOverviewOpen]);

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

  const handleMarkCurrentItem = useCallback(
    (marked: boolean) => {
      if (!currentItemRefIdentifier) return;
      setBookmarkedItemRefIds((prev) => {
        const next = new Set(prev);
        if (marked) next.add(currentItemRefIdentifier);
        else next.delete(currentItemRefIdentifier);
        return next;
      });
    },
    [currentItemRefIdentifier],
  );

  // Stamp context handler with change detection to prevent unnecessary re-renders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStampContextUpdate = useCallback((e: any) => {
    const newContext = e.detail;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setStampContext((prevContext: any) => {
      if (JSON.stringify(prevContext) === JSON.stringify(newContext)) {
        return prevContext;
      }
      return newContext;
    });
  }, []);

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

  return (
    <div className="fixed inset-0 z-50 flex w-full flex-col bg-gray-200 overflow-hidden">
      {/* Fixed Header - Always visible */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white px-4 py-3 border-b border-gray-300 shadow-md z-10">
        <div className="flex items-center space-x-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleExitOverlay}
            title="Close assessment"
          >
            <LogOut className="sm:mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Close assessment</span>
          </Button>
          <h1 className="text-lg font-medium text-gray-800">
            {selectedAssessmentData?.name || "Assessment"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={onEditItem}>
            <Edit className="sm:mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Edit QTI</span>
          </Button>
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
      <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <qti-test
            ref={refCallback}
            cache-transform
            className="h-full min-h-0 flex flex-col"
          >
            <test-navigation
              initContext={items.map((item) => ({
                identifier: item.itemRefIdentifier,
                title: item.title,
                externalScored: item.interactionType === "extendedTextEntry",
              }))}
              auto-score-items
              className="h-full min-h-0 flex flex-col"
            >
              <test-stamp
                class="h-full min-h-0 flex flex-col"
                onqti-stamp-context-updated={handleStampContextUpdate}
              >
                {/* Mode Switch - Fixed at top of content */}
                <div className="flex-shrink-0 flex justify-center p-4 bg-gray-50 border-b">
                  <div className="w-full max-w-4xl flex items-center justify-between gap-3">
                    <ModeSwitch
                      initialMode="candidate"
                      onCheck={handleToggle}
                    />

                    <div
                      id="toolbar"
                      className="flex items-center gap-2 rounded p-1"
                    >
                      <ToolBar
                        marked={bookmarkedItemRefIds.has(
                          currentItemRefIdentifier,
                        )}
                        onMarkCurrentItem={handleMarkCurrentItem}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onResetZoom={handleResetZoom}
                        zoomLevel={zoomLevel}
                      />
                    </div>
                  </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 min-h-0 overflow-auto">
                  {showIntro ? (
                    <AssessmentIntroScreen
                      assessmentName={selectedAssessmentData?.name}
                      itemCount={items.filter((i) => i.type !== "info").length}
                      onStart={() => {
                        setShowIntro(false);
                        setOverviewMode(false);
                        const first = assessment.items?.[0]?.itemRefIdentifier;
                        if (first) {
                          qtiTestRef.current?.navigateTo("item", first);
                        }
                      }}
                      onOpenOverview={() => {
                        setShowIntro(false);
                        setOverviewMode(true);
                      }}
                    />
                  ) : isOverviewOpen ? (
                    <AssessmentOverviewPage
                      items={items}
                      responseStateByItemRefId={responseStateByItemRefId}
                      bookmarkedItemRefIds={bookmarkedItemRefIds}
                      onOpenItem={(itemRefIdentifier) => {
                        setOverviewMode(false);
                        qtiTestRef.current?.navigateTo(
                          "item",
                          itemRefIdentifier,
                        );
                      }}
                    />
                  ) : (
                    <div className="flex justify-center p-6 min-h-full">
                      <test-container
                        className="custom-qti-style cito-style w-full max-w-4xl"
                        testURL={assessment?.testUrl}
                      >
                        <template
                          dangerouslySetInnerHTML={{
                            __html: `<style>${itemCss}</style>`,
                          }}
                        ></template>
                      </test-container>
                    </div>
                  )}
                </div>

                {/* Fixed Bottom navigation - Always visible */}
                {!showIntro && (
                  <div className="flex-shrink-0 border-t bg-white">
                    <nav className="flex items-center justify-between px-6 py-4 w-full min-w-0">
                      {isOverviewOpen ? (
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
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <test-prev className="inline-flex items-center rounded-md bg-citolab-700 px-4 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm">
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Previous
                            </test-prev>
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
                              stampContext={stampContext}
                              bookmarkedItemIds={Array.from(
                                bookmarkedItemRefIds,
                              )}
                            />
                          </div>
                          <test-next className="inline-flex items-center rounded-md bg-citolab-700 px-5 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm flex-shrink-0">
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </test-next>
                        </>
                      )}
                    </nav>
                  </div>
                )}
              </test-stamp>
              <DraggablePopup
                isOpen={showVariables}
                onClose={() => setShowVariables(false)}
                setIsOpen={setShowVariables}
                title={`Item Variable`}
              >
                <div className="bg-gray-50 p-3 rounded">
                  Item Id: {currentItemIdentifier}
                  <test-print-item-variables></test-print-item-variables>
                </div>
              </DraggablePopup>
            </test-navigation>
          </qti-test>
        </div>
      </div>
    </div>
  );
};
