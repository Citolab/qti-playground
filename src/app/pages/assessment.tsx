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
import { QTI_PKG_URL_PREFIX } from "../store/qti-package-cache";

import DraggablePopup from "../components/draggable-popup";
import ModeSwitch from "../components/mode-switcher";
import { ToolBar } from "../components/tool-bar";
import { NavigationBar } from "./nav-list";
import { AssessmentOverviewPage } from "./assessment-overview";
import { AssessmentIntroScreen } from "./assessment-intro";

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

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const qtiTestRef = useRef<IQtiTest>(null);
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
  const initialBodyZoomRef = useRef<string>("");

  // Zustand store - use selectors for optimal re-renders
  const assessments = useStore((state) => state.assessments);
  const selectedAssessment = useStore((state) => state.selectedAssessment);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);
  const editItem = useStore((state) => state.editItem);

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

  type ModuleResolutionConfig = {
    paths?: Record<string, string | string[]>;
    shim?: Record<string, unknown>;
    urlArgs?: string;
    [key: string]: unknown;
  };

  type TransformItemApi = {
    configurePci: (
      baseUrl: string,
      getModuleResolutionConfig: (
        baseUrl: string,
        fileUrl: string,
      ) => Promise<ModuleResolutionConfig | null>,
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

      // Most PCI bundles (and module_resolution.*) are rooted at the package root `modules/` folder.
      // Using the item directory as base would make RequireJS request `/items/.../modules/...` (404).
      const pciBaseUrl = packageRootUrl;

      const getModuleResolutionConfig = async (
        baseUrl: string,
        fileUrl: string,
      ): Promise<ModuleResolutionConfig | null> => {
        const tryFetchJson = async (url: string) => {
          const res = await fetch(url, { method: "GET" });
          if (!res.ok) return null;
          const txt = await res.text();
          try {
            return JSON.parse(txt) as ModuleResolutionConfig;
          } catch {
            return null;
          }
        };

        const candidates: string[] = [];
        const seen = new Set<string>();
        const push = (url: string) => {
          if (seen.has(url)) return;
          seen.add(url);
          candidates.push(url);
        };

        // qti-components asks for `/modules/module_resolution.*` relative to *the PCI baseUrl*.
        // In practice, module resolution files often live at the package root, but sometimes per-item.
        push(`${packageRootUrl}${fileUrl}`);
        push(`${baseUrl}${fileUrl}`);
        push(`${itemDirUrl}${fileUrl}`);

        if (fileUrl.endsWith(".js")) {
          const alt = `${fileUrl.slice(0, -3)}.json`;
          push(`${packageRootUrl}${alt}`);
          push(`${baseUrl}${alt}`);
          push(`${itemDirUrl}${alt}`);
        } else if (fileUrl.endsWith(".json")) {
          const alt = `${fileUrl.slice(0, -5)}.js`;
          push(`${packageRootUrl}${alt}`);
          push(`${baseUrl}${alt}`);
          push(`${itemDirUrl}${alt}`);
        }

        for (const url of candidates) {
          const parsed = await tryFetchJson(url);
          if (parsed) return parsed;
        }

        return null;
      };

      try {
        const configured = await transformer.configurePci(
          pciBaseUrl,
          getModuleResolutionConfig,
        );

        // qtiTransformItem().path(...) can turn module paths into absolute `/__qti_pkg__/...` paths.
        // qti-components' requirejs loader treats those as relative (not http) and prefixes baseUrl again.
        // Normalize to relative paths if they start with our base URLs.
        const doc = configured.xmlDoc?.();
        if (doc) {
          // Force iframe mode for PCIs. Many TAO-exported PCIs assume an iframe-based engine/runtime.
          // Without this, qti-components hides `qti-interaction-markup` and expects the PCI to render
          // its own UI, which some packages don't do correctly in non-iframe mode.
          doc
            .querySelectorAll("qti-portable-custom-interaction")
            .forEach((el) => {
              if (!el.hasAttribute("data-use-iframe"))
                el.setAttribute("data-use-iframe", "");
            });

          // In iframe mode (`data-use-iframe`), qti-components renders the PCI markup inside a data-URL iframe.
          // `qti-stylesheet` loads CSS into the *parent* document, so those styles won't apply inside the iframe.
          // Fix that by inlining referenced stylesheet CSS into `qti-interaction-markup`, which is sent to the iframe.
          const stylesheetCache = new Map<string, Promise<string | null>>();
          const fetchCssText = (href: string): Promise<string | null> => {
            if (stylesheetCache.has(href)) return stylesheetCache.get(href)!;
            const p = (async () => {
              const isAbsolute = /^(data:|blob:|https?:)/.test(href);
              const isRooted = href.startsWith("/");
              const resolved = isAbsolute
                ? href
                : isRooted
                  ? `${window.location.origin}${href}`
                  : `${window.location.origin}${new URL(
                      href,
                      `${window.location.origin}${itemDirUrl}/`,
                    ).pathname}`;
              try {
                const res = await fetch(resolved, { method: "GET" });
                if (!res.ok) return null;
                return await res.text();
              } catch {
                return null;
              }
            })();
            stylesheetCache.set(href, p);
            return p;
          };

          const inlineIframedPciStyles = async () => {
            const pcis = Array.from(
              doc.querySelectorAll(
                "qti-portable-custom-interaction[data-use-iframe]",
              ),
            );
            for (const pci of pcis) {
              const markup =
                pci.querySelector("qti-interaction-markup") ||
                (() => {
                  const el = doc.createElement("qti-interaction-markup");
                  pci.appendChild(el);
                  return el;
                })();

              if (markup.getAttribute("data-qti-playground-inline-css") === "1")
                continue;

              const stylesheets = Array.from(
                pci.querySelectorAll("qti-stylesheet[href]"),
              );
              if (stylesheets.length === 0) continue;

              const cssParts: string[] = [];
              for (const ss of stylesheets) {
                const href = ss.getAttribute("href")?.trim();
                if (!href) continue;
                const css = await fetchCssText(href);
                if (css) cssParts.push(css);
              }

              if (cssParts.length === 0) continue;

              const styleEl = doc.createElement("style");
              styleEl.setAttribute("data-qti-playground-inline", "1");
              styleEl.textContent = cssParts.join("\n\n");
              markup.insertBefore(styleEl, markup.firstChild);
              markup.setAttribute("data-qti-playground-inline-css", "1");
            }
          };

          await inlineIframedPciStyles();

          const stripLeadingPrefix = (value: string, prefix: string) => {
            const withSlash = prefix.endsWith("/") ? prefix : `${prefix}/`;
            if (value.startsWith(withSlash)) return value.slice(withSlash.length);
            if (value === prefix) return "";
            return value;
          };

          const maybeNormalize = (value: string | null) => {
            if (!value) return value;
            // Avoid rewriting real URLs.
            if (/^(data:|blob:|https?:)/.test(value)) return value;
            // Keep app/shared static assets rooted at the app origin.
            if (value.startsWith("/assets/")) return value;

            const shouldNormalize =
              value.startsWith("/") ||
              value.startsWith("__qti_pkg__/") ||
              value.startsWith("/__qti_pkg__/") ||
              value.startsWith("/items/") ||
              value.startsWith("/modules/") ||
              value.startsWith(packageRootUrl) ||
              value.startsWith(itemDirUrl);
            if (!shouldNormalize) return value;

            const packageRootPath = packageRootUrl.replace(/^\/+/, "");
            const itemDirPath = itemDirUrl.replace(/^\/+/, "");

            // Normalize to a package-relative path so qti-components can safely prefix `baseUrl`.
            let next = value.replace(/^\/+/, "");
            for (let i = 0; i < 4; i++) {
              const prev = next;
              next = stripLeadingPrefix(next, itemDirPath);
              next = stripLeadingPrefix(next, packageRootPath);
              next = next.replace(/^\/+/, "");
              if (next === prev) break;
            }
            return next;
          };

          doc.querySelectorAll("qti-interaction-module").forEach((el) => {
            const primary = maybeNormalize(el.getAttribute("primary-path"));
            if (primary !== null) el.setAttribute("primary-path", primary);
            const fallback = maybeNormalize(el.getAttribute("fallback-path"));
            if (fallback !== null) el.setAttribute("fallback-path", fallback);
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

  // Stable ref callback for QTI test element
  const refCallback: RefCallback<IQtiTest> = useCallback(
    (element) => {
      if (element) {
        qtiTestRef.current = element;
        (element as unknown as { postLoadTransformCallback?: unknown }).postLoadTransformCallback =
          postLoadTransformCallback;
        element.addEventListener(
          "qti-assessment-item-connected",
          handleItemConnected,
        );
      }
    },
    [handleItemConnected, postLoadTransformCallback],
  );

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (qtiTestRef.current) {
        qtiTestRef.current.removeEventListener(
          "qti-assessment-item-connected",
          handleItemConnected,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!qtiTestRef.current) return;
    (qtiTestRef.current as unknown as { postLoadTransformCallback?: unknown }).postLoadTransformCallback =
      postLoadTransformCallback;
  }, [postLoadTransformCallback]);

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
      navigate("/preview");
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
      .map((i: any) => i.identifier)
      .filter(Boolean);
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
    [currentItemRefIdentifier]
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
            <button
              onClick={handlePrevious}
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-200 transition-colors"
              type="button"
            >
              Previous
            </button>
            <button
              onClick={handleBackNavigation}
              className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-citolab-500 transition-colors"
              type="button"
            >
              Select new package
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex w-full flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header - Always visible */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white px-4 py-3 shadow-md z-10">
        <div className="flex items-center space-x-3">
          <button
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
            onClick={handleExitOverlay}
            title="Close assessment"
            type="button"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Close assessment
          </button>
          <h1 className="text-lg font-medium text-gray-800">
            {selectedAssessmentData?.name || "Assessment"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="inline-flex items-center rounded-md bg-citolab-600 px-3 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors"
            onClick={onEditItem}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit QTI
          </button>
          <button
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              showVariables
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setShowVariables((current) => !current)}
          >
            <Code className="mr-1 h-4 w-4" />
            {showVariables ? "Hide Output" : "Show Output"}
          </button>
          <button
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isOverviewOpen
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setOverviewMode(!isOverviewOpen)}
            title="Overview"
            type="button"
          >
            <LayoutGrid className="mr-1 h-4 w-4" />
            Overview
          </button>
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
                        marked={bookmarkedItemRefIds.has(currentItemRefIdentifier)}
                        onMarkCurrentItem={handleMarkCurrentItem}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onResetZoom={handleResetZoom}
                        zoomLevel={zoomLevel}
                      />

                      {/* DEP tools mount points (render into #toolbar via QtiBaseTool) */}
                      <dep-textmarker style={{ display: "none" }} />
                      <dep-symbolpicker style={{ display: "none" }} />
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
                          <button
                            type="button"
                            onClick={goToPrevFromOverview}
                            disabled={!overviewNavTargets.prevId}
                            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
                              overviewNavTargets.prevId
                                ? "bg-citolab-700 text-white hover:bg-citolab-600 shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            title="Previous item"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                          </button>
                          <div className="flex-1 min-w-0 flex justify-center">
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors shadow-sm"
                              onClick={closeOverview}
                              title="Close overview"
                            >
                              <LayoutGrid className="mr-2 h-4 w-4" />
                              Close overview
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={goToNextFromOverview}
                            disabled={!overviewNavTargets.nextId}
                            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
                              overviewNavTargets.nextId
                                ? "bg-citolab-700 text-white hover:bg-citolab-600 shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            title="Next item"
                          >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <test-prev className="inline-flex items-center rounded-md bg-citolab-700 px-4 py-2 text-sm font-semibold text-white hover:bg-citolab-600 transition-colors shadow-sm">
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Previous
                            </test-prev>
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors shadow-sm"
                              onClick={() => setOverviewMode(!isOverviewOpen)}
                              title="Overview"
                            >
                              <LayoutGrid className="h-4 w-4" />
                            </button>
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
