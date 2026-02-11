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
import { QTI_PKG_URL_PREFIX } from "../store/qti-package-cache";

import DraggablePopup from "../components/draggable-popup";
import ModeSwitch from "../components/mode-switcher";
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

      const encodePathSegments = (value: string) =>
        value
          .split("/")
          .map((seg) => encodeURIComponent(seg))
          .join("/");

      const existsCache = new Map<string, Promise<boolean>>();
      const urlExistsPath = async (path: string): Promise<boolean> => {
        const absolute = `${window.location.origin}${path}`;
        if (existsCache.has(absolute)) return await existsCache.get(absolute)!;
        const p = (async () => {
          try {
            const res = await fetch(absolute, { method: "GET" });
            return res.ok;
          } catch {
            return false;
          }
        })();
        existsCache.set(absolute, p);
        return await p;
      };

      const detectPciBaseUrl = async (): Promise<string> => {
        if (!itemDirUrl && !itemStemDirUrl) return packageRootUrl;

        const doc = transformer?.xmlDoc?.();
        if (!doc) return packageRootUrl;

        const moduleNames = Array.from(
          doc.querySelectorAll("qti-portable-custom-interaction[module]"),
        )
          .map((el) => (el.getAttribute("module") || "").trim())
          .filter(Boolean);

        if (moduleNames.length === 0) return packageRootUrl;

        for (const moduleName of moduleNames) {
          const encoded = encodePathSegments(moduleName);
          if (
            itemDirUrl &&
            (await urlExistsPath(`${itemDirUrl}/modules/${encoded}.js`))
          ) {
            return itemDirUrl;
          }
          if (
            itemStemDirUrl &&
            (await urlExistsPath(`${itemStemDirUrl}/modules/${encoded}.js`))
          ) {
            return itemStemDirUrl;
          }
        }

        for (const moduleName of moduleNames) {
          const encoded = encodePathSegments(moduleName);
          if (await urlExistsPath(`${packageRootUrl}/modules/${encoded}.js`)) {
            return packageRootUrl;
          }
        }

        return packageRootUrl;
      };

      // Prefer an item-local baseUrl when modules live under `/items/<item>/modules`.
      const pciBaseUrl = await detectPciBaseUrl();

      const parseModuleResolutionConfig = (
        text: string,
      ): ModuleResolutionConfig | null => {
        const tryJson = (t: string) => {
          try {
            return JSON.parse(t) as ModuleResolutionConfig;
          } catch {
            return null;
          }
        };

        const normalize = (cfg: ModuleResolutionConfig | null) => {
          if (!cfg) return null;
          if (!cfg.paths || typeof cfg.paths !== "object") return null;
          return cfg;
        };

        const trimmed = text.trim();

        // 1) Plain JSON
        const direct = normalize(tryJson(trimmed));
        if (direct) return direct;

        // 2) Common wrappers: define(...), require.config(...), requirejs.config(...)
        const cleaned = trimmed
          .replace(/^define\(/, "")
          .replace(/^requirejs\.config\(/, "")
          .replace(/^require\.config\(/, "")
          .replace(/\);?\s*$/, "")
          .replace(/^\(/, "")
          .replace(/\)\s*$/, "")
          .trim();
        const wrapped = normalize(tryJson(cleaned));
        if (wrapped) return wrapped;

        // 3) Last-resort: extract the first JSON object from inside the file (handles
        // `define({...})`, `var x = {...};`, etc as long as it's JSON-compatible).
        const firstBrace = trimmed.indexOf("{");
        const lastBrace = trimmed.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          const inner = trimmed.slice(firstBrace, lastBrace + 1);
          const extracted = normalize(tryJson(inner));
          if (extracted) return extracted;
        }

        return null;
      };

      const getModuleResolutionConfig = async (
        baseUrl: string,
        fileUrl: string,
      ): Promise<ModuleResolutionConfig | null> => {
        const tryFetchJson = async (url: string) => {
          const res = await fetch(url, { method: "GET" });
          if (!res.ok) return null;
          const txt = await res.text();
          return parseModuleResolutionConfig(txt);
        };

        const candidates: string[] = [];
        const seen = new Set<string>();
        const push = (url: string) => {
          if (seen.has(url)) return;
          seen.add(url);
          candidates.push(url);
        };

        const maybePushConfigAtBase = (base: string, url: string) => {
          // If `baseUrl` already points at `/modules`, also try without the `/modules/` prefix
          // (so `/modules/module_resolution.js` becomes `/module_resolution.js`).
          if (base.endsWith("/modules") && url.startsWith("/modules/")) {
            push(`${base}${url.slice("/modules".length)}`);
          }
          push(`${base}${url}`);
        };

        // Prefer item-specific configs over package-root aliases. Some packages contain multiple
        // `module_resolution.*` files and only the item-local one matches the current PCI.
        maybePushConfigAtBase(itemDirUrl, fileUrl);
        if (itemStemDirUrl) maybePushConfigAtBase(itemStemDirUrl, fileUrl);
        maybePushConfigAtBase(baseUrl, fileUrl);
        maybePushConfigAtBase(packageRootUrl, fileUrl);

        if (fileUrl.endsWith(".js")) {
          const alt = `${fileUrl.slice(0, -3)}.json`;
          maybePushConfigAtBase(itemDirUrl, alt);
          if (itemStemDirUrl) maybePushConfigAtBase(itemStemDirUrl, alt);
          maybePushConfigAtBase(baseUrl, alt);
          maybePushConfigAtBase(packageRootUrl, alt);
        } else if (fileUrl.endsWith(".json")) {
          const alt = `${fileUrl.slice(0, -5)}.js`;
          maybePushConfigAtBase(itemDirUrl, alt);
          if (itemStemDirUrl) maybePushConfigAtBase(itemStemDirUrl, alt);
          maybePushConfigAtBase(baseUrl, alt);
          maybePushConfigAtBase(packageRootUrl, alt);
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
          doc.querySelectorAll("qti-portable-custom-interaction");
          // Add default paths/shims attributes to PCIs in TAO items
          if (doc.querySelector('qti-assessment-item[tool-name="TAO"]')) {
            doc
              .querySelectorAll("qti-portable-custom-interaction")
              .forEach((el) => {
                el.setAttribute("data-use-default-paths", "true");
                el.setAttribute("data-use-default-shims", "true");
              });
          }

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
                  : `${window.location.origin}${
                      new URL(href, `${window.location.origin}${itemDirUrl}/`)
                        .pathname
                    }`;
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

          const debugEnabled =
            typeof window !== "undefined" &&
            typeof window.localStorage !== "undefined" &&
            window.localStorage.getItem("__qti_debug_pci__") === "1";
          const debug = (...args: unknown[]) => {
            if (debugEnabled) console.debug("[pci]", ...args);
          };

          const toScriptUrl = (baseUrl: string, maybePath: string) => {
            const base = `${window.location.origin}${baseUrl.replace(/\/+$/, "")}/`;
            const abs = /^(data:|blob:|https?:)/.test(maybePath)
              ? maybePath
              : maybePath.startsWith("/")
                ? `${window.location.origin}${maybePath}`
                : new URL(maybePath, base).toString();
            const u = new URL(abs, window.location.origin);
            const pathname = u.pathname;
            if (pathname.endsWith(".js")) return u.toString();
            u.pathname = `${pathname}.js`;
            return u.toString();
          };

          const extractAmdDeps = (source: string): string[] => {
            const match = source.match(
              /define\s*\(\s*(?:["'][^"']+["']\s*,\s*)?\[([\s\S]*?)\]/,
            );
            if (!match) return [];
            const deps: string[] = [];
            const body = match[1] || "";
            const re = /["']([^"']+)["']/g;
            let m: RegExpExecArray | null = null;
            while ((m = re.exec(body))) {
              if (m[1]) deps.push(m[1]);
            }
            return deps;
          };

          const isSkippableDep = (dep: string) => {
            const d = dep.trim();
            if (!d) return true;
            if (d === "require" || d === "exports" || d === "module")
              return true;
            if (d.includes("!")) return true;
            if (d.startsWith(".")) return true;
            return false;
          };

          const escapeCss = (value: string) => {
            if (
              typeof CSS !== "undefined" &&
              typeof CSS.escape === "function"
            ) {
              return CSS.escape(value);
            }
            return value.replace(/["\\]/g, "\\$&");
          };

          const findModuleScript = async (
            moduleId: string,
          ): Promise<string | null> => {
            const id = moduleId.replace(/\.js$/i, "");
            const encoded = encodePathSegments(id);
            const candidates: string[] = [];
            const push = (p: string | null) => {
              if (!p) return;
              if (!p.startsWith("/")) return;
              if (!candidates.includes(p)) candidates.push(p);
            };

            push(`${itemDirUrl}/modules/${encoded}.js`);
            if (itemStemDirUrl) push(`${itemStemDirUrl}/modules/${encoded}.js`);
            push(`${packageRootUrl}/modules/${encoded}.js`);
            push(`${itemDirUrl}/${encoded}.js`);
            if (itemStemDirUrl) push(`${itemStemDirUrl}/${encoded}.js`);
            push(`${packageRootUrl}/${encoded}.js`);
            push(`${packageRootUrl}/runtime/${encoded}.js`);
            push(`${packageRootUrl}/runtime/${encoded}.min.js`);

            for (const path of candidates) {
              if (await urlExistsPath(path)) {
                // RequireJS expects paths without the .js extension.
                return `${window.location.origin}${path.slice(0, -3)}`;
              }
            }
            return null;
          };

          const ensurePciModuleMappings = async () => {
            const pcis = Array.from(
              doc.querySelectorAll("qti-portable-custom-interaction"),
            );
            if (pcis.length === 0) return;

            debug("assessment pciBaseUrl", pciBaseUrl);

            for (const pci of pcis) {
              const entryRaw = (pci.getAttribute("module") || "").trim();
              if (!entryRaw) continue;
              const entryModule = entryRaw.replace(/\.js$/i, "");

              let interactionModules = pci.querySelector(
                "qti-interaction-modules",
              );
              if (!interactionModules) {
                interactionModules = doc.createElement(
                  "qti-interaction-modules",
                );
                pci.appendChild(interactionModules);
              }

              const moduleEls = Array.from(
                interactionModules.querySelectorAll("qti-interaction-module"),
              );
              const moduleMap = new Map<
                string,
                { el: Element; primary: string | null; fallback: string | null }
              >();
              for (const el of moduleEls) {
                const id = el.getAttribute("id")?.trim() || "";
                if (!id) continue;
                moduleMap.set(id, {
                  el,
                  primary: el.getAttribute("primary-path"),
                  fallback: el.getAttribute("fallback-path"),
                });
              }

              const upsertModule = (id: string, primary: string) => {
                const escaped = escapeCss(id);
                let el =
                  interactionModules!.querySelector(
                    `qti-interaction-module[id="${escaped}"]`,
                  ) || null;
                if (!el) {
                  el = doc.createElement("qti-interaction-module");
                  el.setAttribute("id", id);
                  interactionModules!.appendChild(el);
                }
                el.setAttribute("primary-path", primary);
                moduleMap.set(id, {
                  el,
                  primary,
                  fallback: el.getAttribute("fallback-path"),
                });
              };

              const ensureMapped = async (id: string) => {
                if (moduleMap.has(id)) return true;

                const encoded = encodePathSegments(id);
                if (await urlExistsPath(`${pciBaseUrl}/${encoded}.js`)) {
                  // It's directly resolvable by RequireJS baseUrl; no mapping needed.
                  return true;
                }

                const found = await findModuleScript(id);
                if (found) {
                  upsertModule(id, found);
                  return true;
                }
                return false;
              };

              // Ensure the PCI entry module itself is mapped if it isn't directly resolvable.
              await ensureMapped(entryModule);

              const maxDepth = 3;
              const maxScan = 20;
              const visited = new Set<string>();
              const queue: Array<{ id: string; depth: number }> = [
                { id: entryModule, depth: 0 },
              ];

              let scanned = 0;
              while (queue.length > 0 && scanned < maxScan) {
                const { id, depth } = queue.shift()!;
                if (visited.has(id)) continue;
                visited.add(id);
                scanned++;

                const record = moduleMap.get(id);
                const primary = record?.primary?.trim() || "";
                const fallback = record?.fallback?.trim() || "";

                const scriptCandidates: string[] = [];
                if (primary) scriptCandidates.push(primary);
                if (fallback && fallback !== primary)
                  scriptCandidates.push(fallback);

                // If we still have no mapping, try to locate it on disk.
                if (scriptCandidates.length === 0) {
                  const located = await findModuleScript(id);
                  if (located) {
                    upsertModule(id, located);
                    scriptCandidates.push(located);
                  }
                }
                if (scriptCandidates.length === 0) continue;

                let source: string | null = null;
                for (const candidate of scriptCandidates) {
                  try {
                    const url = toScriptUrl(pciBaseUrl, candidate);
                    const res = await fetch(url, { method: "GET" });
                    if (!res.ok) continue;
                    source = await res.text();
                    break;
                  } catch {
                    // try next
                  }
                }
                if (!source) {
                  const located = await findModuleScript(id);
                  if (located) {
                    upsertModule(id, located);
                    try {
                      const url = toScriptUrl(pciBaseUrl, located);
                      const res = await fetch(url, { method: "GET" });
                      if (res.ok) source = await res.text();
                    } catch {
                      // ignore
                    }
                  }
                }
                if (!source) continue;

                const deps = extractAmdDeps(source).filter(
                  (d) => !isSkippableDep(d),
                );
                if (deps.length === 0) continue;

                for (const dep of deps) {
                  const depId = dep.replace(/\.js$/i, "");
                  const ok = await ensureMapped(depId);
                  if (!ok) continue;
                  if (depth + 1 <= maxDepth) {
                    queue.push({ id: depId, depth: depth + 1 });
                  }
                }
              }
            }
          };

          await ensurePciModuleMappings();

          const ensureRuntimeRequirePaths = async () => {
            const pcis = Array.from(
              doc.querySelectorAll("qti-portable-custom-interaction"),
            );
            for (const pci of pcis) {
              const moduleName = (pci.getAttribute("module") || "").trim();
              if (!moduleName) continue;

              const encoded = encodePathSegments(moduleName);
              const runtimeCandidates = [
                `${packageRootUrl}/runtime/${encoded}.js`,
                `${packageRootUrl}/runtime/${encoded}.min.js`,
              ];
              let hasRuntime = false;
              for (const path of runtimeCandidates) {
                if (await urlExistsPath(path)) {
                  hasRuntime = true;
                  break;
                }
              }
              if (!hasRuntime) continue;

              let existing: Record<string, string> = {};
              const existingRaw = pci.getAttribute("data-require-paths");
              if (existingRaw) {
                try {
                  const parsed = JSON.parse(existingRaw);
                  if (parsed && typeof parsed === "object") {
                    existing = parsed as Record<string, string>;
                  }
                } catch {
                  // ignore
                }
              }

              const key = `${moduleName}/runtime`;
              const value = `${packageRootUrl}/runtime`;
              if (existing[key] !== value) {
                existing[key] = value;
                pci.setAttribute(
                  "data-require-paths",
                  JSON.stringify(existing),
                );
              }
              if (!pci.hasAttribute("data-use-default-paths")) {
                pci.setAttribute("data-use-default-paths", "true");
              }
            }
          };

          await ensureRuntimeRequirePaths();

          const stripLeadingPrefix = (value: string, prefix: string) => {
            const withSlash = prefix.endsWith("/") ? prefix : `${prefix}/`;
            if (value.startsWith(withSlash))
              return value.slice(withSlash.length);
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
              value.startsWith("modules/") ||
              value.startsWith("/modules/") ||
              value.startsWith(packageRootUrl) ||
              value.startsWith(itemDirUrl) ||
              (itemStemDirUrl ? value.startsWith(itemStemDirUrl) : false) ||
              value.startsWith(pciBaseUrl);
            if (!shouldNormalize) return value;

            const packageRootPath = packageRootUrl.replace(/^\/+/, "");
            const pciBasePath = pciBaseUrl.replace(/^\/+/, "");
            const itemDirPath = itemDirUrl.replace(/^\/+/, "");
            const itemStemDirPath = (itemStemDirUrl || "").replace(/^\/+/, "");

            // Normalize to a package-relative path so qti-components can safely prefix `baseUrl`.
            let next = value.replace(/^\/+/, "");
            for (let i = 0; i < 4; i++) {
              const prev = next;
              if (itemStemDirPath)
                next = stripLeadingPrefix(next, itemStemDirPath);
              next = stripLeadingPrefix(next, itemDirPath);
              next = stripLeadingPrefix(next, pciBasePath);
              next = stripLeadingPrefix(next, packageRootPath);
              next = next.replace(/^\/+/, "");
              if (next === prev) break;
            }
            // If baseUrl is already the modules folder, strip a leading `modules/` to avoid `/modules/modules/...`.
            if (pciBaseUrl.endsWith("/modules")) {
              if (next.startsWith("modules/"))
                next = next.slice("modules/".length);
              if (next.startsWith("/modules/"))
                next = next.slice("/modules/".length);
            }
            return next;
          };

          doc.querySelectorAll("qti-interaction-module").forEach((el) => {
            const primary = maybeNormalize(el.getAttribute("primary-path"));
            if (primary !== null) el.setAttribute("primary-path", primary);
            const fallback = maybeNormalize(el.getAttribute("fallback-path"));
            if (fallback !== null) el.setAttribute("fallback-path", fallback);
          });

          // Normalize PCI entry module values that were turned into absolute package paths.
          doc
            .querySelectorAll("qti-portable-custom-interaction[module]")
            .forEach((el) => {
              const moduleValue = el.getAttribute("module")?.trim() || "";
              if (!moduleValue) return;
              if (/^(data:|blob:|https?:)/.test(moduleValue)) return;
              const normalized = maybeNormalize(moduleValue);
              if (normalized !== null && normalized !== moduleValue) {
                el.setAttribute("module", normalized);
              }
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
      return;
    }
    if (!assessment?.id) return;

    const stored = testContexts.find(
      (ctx) => ctx.assessmentId === assessment.id,
    );
    if (!stored || lastAppliedContextRef.current === stored) return;

    qtiTestElement.testContext = {
      items: stored.items.map((item) => ({
        ...item,
        variables: item.variables?.map((variable) => ({ ...variable })),
        state: item.state ? { ...item.state } : undefined,
      })),
      testOutcomeVariables: stored.testOutcomeVariables,
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
