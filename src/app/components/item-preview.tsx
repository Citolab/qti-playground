import React, { useState, useEffect, memo, useRef } from "react";
import { qtiTransform, type ModuleResolutionConfig } from "@citolab/qti-convert/qti-transformer";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemInfoWithBlobRef } from "../store/store";
import { itemCss } from "../itemCss";
import { QTI_PKG_URL_PREFIX } from "../store/qti-package-cache";

const moduleResolutionConfigCache = new Map<
  string,
  Promise<ModuleResolutionConfig | null>
>();

const moduleScriptUrlCache = new Map<string, Promise<string | null>>();
const urlExistsCache = new Map<string, Promise<boolean>>();

interface ItemPreviewProps {
  item: ItemInfoWithBlobRef & { assessmentId: string };
  index: number;
}

export const ItemPreview: React.FC<ItemPreviewProps> = memo(
  ({ item, index }) => {
    const [itemContent, setItemContent] = useState<string>("");
    const [itemDoc, setItemDoc] = useState<DocumentFragment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const packageRootUrl = (() => {
      try {
        const u = new URL(item.href, window.location.origin);
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.indexOf(QTI_PKG_URL_PREFIX.replace(/^\//, ""));
        if (idx < 0) return null;
        const packageId = parts[idx + 1] || "";
        if (!packageId) return null;
        return `${QTI_PKG_URL_PREFIX}/${decodeURIComponent(packageId)}`;
      } catch {
        return null;
      }
    })();

    const itemDirUrl = (() => {
      try {
        const u = new URL(item.href, window.location.origin);
        const pathname = u.pathname;
        const idx = pathname.lastIndexOf("/");
        return idx >= 0 ? pathname.slice(0, idx) : null;
      } catch {
        return null;
      }
    })();

    const itemStemDirUrl = (() => {
      try {
        const u = new URL(item.href, window.location.origin);
        const pathname = u.pathname;
        const last = pathname.split("/").pop() || "";
        const dot = last.lastIndexOf(".");
        if (dot <= 0) return null;
        const withoutExt = last.slice(0, dot);
        const baseDir = pathname
          .slice(0, pathname.length - last.length)
          .replace(/\/+$/, "");
        const parent = baseDir.split("/").filter(Boolean).pop() || "";
        // Only derive `.../items/<stem>` when the XML is directly under an `items/` directory.
        // If the item is `.../items/<item>/qti.xml`, then the modules are typically under `.../items/<item>/modules`
        // and we should not derive `.../items/<item>/qti`.
        if (parent.toLowerCase() !== "items") return null;
        return `${baseDir}/${withoutExt}`;
      } catch {
        return null;
      }
    })();

    useEffect(() => {
      const loadItemContent = async () => {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(item.href, { method: "GET" });
          if (!res.ok) {
            throw new Error(`Failed to fetch item (${res.status})`);
          }
          const content = await res.text();
          setItemContent(content);
        } catch (err) {
          console.error("Failed to load item content:", err);
          setError("Failed to load item");
        } finally {
          setIsLoading(false);
        }
      };

      loadItemContent();
    }, [item.href]);

    useEffect(() => {
      if (!itemContent) return;

      let cancelled = false;
      setItemDoc(null);
      setError("");

      const run = async () => {
        try {
          const transformer = qtiTransform(itemContent)
            .fnCh(($) => {
              // Process type classes
              $(`[class*="type:"]`).each((_, element) => {
                const $el = $(element);
                const classes = $el.attr("class");
                if (classes) {
                  const tagName = $el[0].tagName;
                  const match = classes.match(/type:(\w+)/);
                  if (match) {
                    const type = match[1];
                    const newTag = `${tagName}-${type}`;
                    const newClasses = classes.replace(`type:${type}`, "").trim();
                    const $newElement = $(
                      `<${newTag} class="${newClasses}">${$el.html()}</${newTag}>`,
                    );
                    $el[0].attributes.forEach((attr) => {
                      if (attr.name !== "class") {
                        $newElement.attr(attr.name, attr.value);
                      }
                    });
                    $el.replaceWith($newElement);
                  }
                }
              });
            })
            .fnCh(($) => {
              // Remove media
              $(`qti-media-interaction, audio, video`).replaceWith(
                `<div>Removed media</div>`,
              );
            });

          // Resolve relative asset URLs (images, object data, etc) against the item location.
          // In the assessment flow, qti-components resolves these via item/test base URLs; in the /package
          // grid preview we need to do it ourselves to avoid broken images.
          if (packageRootUrl && itemDirUrl) {
            transformer.fnCh(($) => {
              const origin =
                typeof window !== "undefined" ? window.location.origin : "";
              const base = origin
                ? `${origin}${itemDirUrl.replace(/\/+$/, "")}/`
                : `${itemDirUrl.replace(/\/+$/, "")}/`;

              const normalizePathname = (pathname: string) => {
                const absolute = pathname.startsWith("/");
                const parts = pathname.split("/");
                const out: string[] = [];
                for (const part of parts) {
                  if (!part || part === ".") continue;
                  if (part === "..") {
                    out.pop();
                    continue;
                  }
                  out.push(part);
                }
                return `${absolute ? "/" : ""}${out.join("/")}`;
              };

              const resolveUrl = (raw: string) => {
                const value = raw.trim();
                if (!value) return raw;
                if (value.startsWith("#")) return raw;
                if (/^(data:|blob:|https?:)/.test(value)) return raw;
                if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return raw;
                if (value.startsWith("/assets/")) return raw;

                try {
                  // QTI packages sometimes use rooted paths (e.g. `/ref/...`) that are rooted at the package.
                  const normalizedValue = value.startsWith("/") &&
                    !value.startsWith(QTI_PKG_URL_PREFIX)
                    ? `${packageRootUrl}${value}`
                    : value;

                  const u = new URL(normalizedValue, base);
                  const normalized = normalizePathname(u.pathname);
                  return `${normalized}${u.search}${u.hash}`;
                } catch {
                  return raw;
                }
              };

              $("[src],[href],[data]").each((_, el) => {
                for (const attr of ["src", "href", "data"] as const) {
                  const current = $(el).attr(attr);
                  if (!current) continue;
                  const next = resolveUrl(current);
                  if (next !== current) $(el).attr(attr, next);
                }
              });
            });
          }

          // Best-effort PCI support for the /package grid:
          // - ensure iframe mode (isolation)
          // - set correct baseUrl (/__qti_pkg__/<id>) so RequireJS resolves modules
          // - load module_resolution.* and apply it (configurePciAsync)
          const hasPci = itemContent.includes("qti-portable-custom-interaction");
          if (hasPci && packageRootUrl) {
            const encodePathSegments = (value: string) =>
              value
                .split("/")
                .map((seg) => encodeURIComponent(seg))
                .join("/");

            const urlExists = async (url: string): Promise<boolean> => {
              if (urlExistsCache.has(url)) return await urlExistsCache.get(url)!;
              const p = (async () => {
                try {
                  const res = await fetch(url, { method: "GET" });
                  return res.ok;
                } catch {
                  return false;
                }
              })();
              urlExistsCache.set(url, p);
              return await p;
            };

            const tryFetchJson = async (url: string) => {
              try {
                if (moduleResolutionConfigCache.has(url))
                  return await moduleResolutionConfigCache.get(url)!;

                const p = (async () => {
                  const res = await fetch(url, { method: "GET" });
                  if (!res.ok) return null;
                  const txt = await res.text();
                  const parsed = JSON.parse(txt) as Partial<ModuleResolutionConfig>;
                  if (!parsed || typeof parsed !== "object") return null;
                  if (!parsed.paths || typeof parsed.paths !== "object") return null;
                  return {
                    ...parsed,
                    paths: parsed.paths,
                  } as ModuleResolutionConfig;
                })();

                moduleResolutionConfigCache.set(url, p);
                return await p;
              } catch {
                return null;
              }
            };

            const pciModuleNames: string[] = [];
            transformer.fnCh(($) => {
              $("qti-portable-custom-interaction[module]").each((_, el) => {
                const name = ($(el).attr("module") || "").trim();
                if (name && !pciModuleNames.includes(name)) pciModuleNames.push(name);
              });
            });

            const detectPciBaseUrl = async (): Promise<string> => {
              // Prefer an item-local baseUrl when modules live at:
              //   /items/<itemname>/modules/<Module>.js
              if ((itemDirUrl || itemStemDirUrl) && pciModuleNames.length > 0) {
                for (const moduleName of pciModuleNames) {
                  const encoded = encodePathSegments(moduleName);
                  if (
                    itemDirUrl &&
                    (await urlExists(`${itemDirUrl}/modules/${encoded}.js`))
                  ) {
                    return itemDirUrl;
                  }
                  if (
                    itemStemDirUrl &&
                    (await urlExists(`${itemStemDirUrl}/modules/${encoded}.js`))
                  ) {
                    return itemStemDirUrl;
                  }
                }
                for (const moduleName of pciModuleNames) {
                  const encoded = encodePathSegments(moduleName);
                  if (
                    await urlExists(
                      `${packageRootUrl}/modules/${encoded}.js`,
                    )
                  ) {
                    return packageRootUrl;
                  }
                }
              }

              // Otherwise fall back to the package root. Most packages have `modules/` at the root.
              return packageRootUrl;
            };

            const pciBaseUrl = await detectPciBaseUrl();

            const getModuleResolutionConfig = async (
              fileUrl: string,
            ): Promise<ModuleResolutionConfig> => {
              const emptyConfig: ModuleResolutionConfig = { paths: {} };

              const candidates: string[] = [];
              const seen = new Set<string>();
              const push = (url: string) => {
                if (seen.has(url)) return;
                seen.add(url);
                candidates.push(url);
              };

              push(`${packageRootUrl}${fileUrl}`);
              push(`${pciBaseUrl}${fileUrl}`);
              if (itemDirUrl) push(`${itemDirUrl}${fileUrl}`);
              if (itemStemDirUrl) push(`${itemStemDirUrl}${fileUrl}`);

              if (fileUrl.endsWith(".js")) {
                const alt = `${fileUrl.slice(0, -3)}.json`;
                push(`${packageRootUrl}${alt}`);
                push(`${pciBaseUrl}${alt}`);
                if (itemDirUrl) push(`${itemDirUrl}${alt}`);
                if (itemStemDirUrl) push(`${itemStemDirUrl}${alt}`);
              }

              for (const url of candidates) {
                const parsed = await tryFetchJson(url);
                if (parsed) return parsed;
              }
              return emptyConfig;
            };

            await transformer.configurePciAsync(
              pciBaseUrl,
              getModuleResolutionConfig,
            );

            transformer.fnCh(($) => {
              $("qti-portable-custom-interaction").each((_, el) => {
                // Ensure iframe mode for isolation (multiple PCIs on one screen).
                if (!$(el).attr("data-use-iframe")) {
                  $(el).attr("data-use-iframe", "");
                }
              });

              // Normalize module paths to package-relative so qti-components can prefix baseUrl once.
              const stripLeadingPrefix = (value: string, prefix: string) => {
                const withSlash = prefix.endsWith("/") ? prefix : `${prefix}/`;
                if (value.startsWith(withSlash)) return value.slice(withSlash.length);
                if (value === prefix) return "";
                return value;
              };

              const normalize = (value: string | undefined) => {
                if (!value) return value;
                if (/^(data:|blob:|https?:)/.test(value)) return value;
                if (value.startsWith("/assets/")) return value;

                const packageRootPath = packageRootUrl.replace(/^\/+/, "");
                const pciBasePath = pciBaseUrl.replace(/^\/+/, "");
                const itemDirPath = (itemDirUrl || "").replace(/^\/+/, "");
                const itemStemDirPath = (itemStemDirUrl || "").replace(
                  /^\/+/,
                  "",
                );

                let next = value.replace(/^\/+/, "");
                for (let i = 0; i < 4; i++) {
                  const prev = next;
                  if (itemStemDirPath)
                    next = stripLeadingPrefix(next, itemStemDirPath);
                  if (itemDirPath) next = stripLeadingPrefix(next, itemDirPath);
                  next = stripLeadingPrefix(next, pciBasePath);
                  next = stripLeadingPrefix(next, packageRootPath);
                  next = next.replace(/^\/+/, "");
                  if (next === prev) break;
                }
                return next;
              };

              $("qti-interaction-module").each((_, el) => {
                const primary = normalize($(el).attr("primary-path"));
                if (primary !== undefined) $(el).attr("primary-path", primary);
                const fallback = normalize($(el).attr("fallback-path"));
                if (fallback !== undefined) $(el).attr("fallback-path", fallback);
              });
            });

            // Some packages don't ship a JSON-parsable module_resolution.* at a discoverable path.
            // In that case, qti-components will try to `require([moduleName])` without a `paths` map,
            // which typically resolves to `${baseUrl}/${moduleName}.js` and 404s.
            // Try to detect the actual module script location and inject a minimal mapping.
            await transformer.fnChAsync(async ($) => {
              const origin =
                typeof window !== "undefined" ? window.location.origin : "";

              const resolveModuleUrl = async (
                moduleName: string,
              ): Promise<string | null> => {
                const cacheKey = `${packageRootUrl}|${pciBaseUrl}|${itemStemDirUrl || ""}|${moduleName}`;
                if (moduleScriptUrlCache.has(cacheKey))
                  return await moduleScriptUrlCache.get(cacheKey)!;

                const p = (async () => {
                  const encodedModule = moduleName
                    .split("/")
                    .map((seg) => encodeURIComponent(seg))
                    .join("/");
                  const candidates = [
                    itemDirUrl ? `${itemDirUrl}/modules/${encodedModule}.js` : null,
                    itemStemDirUrl
                      ? `${itemStemDirUrl}/modules/${encodedModule}.js`
                      : null,
                    `${packageRootUrl}/modules/${encodedModule}.js`,
                    `${pciBaseUrl}/modules/${encodedModule}.js`,
                    `${pciBaseUrl}/${encodedModule}.js`,
                  ].filter(Boolean) as string[];

                  for (const url of candidates) {
                    try {
                      const res = await fetch(url, { method: "GET" });
                      if (!res.ok) continue;
                      const noJs = url.endsWith(".js") ? url.slice(0, -3) : url;
                      return origin ? `${origin}${noJs}` : noJs;
                    } catch {
                      // ignore
                    }
                  }
                  return null;
                })();

                const cached = p.then((value) => {
                  if (value === null) moduleScriptUrlCache.delete(cacheKey);
                  return value;
                });
                moduleScriptUrlCache.set(cacheKey, cached);
                return await cached;
              };

              const pcis = $("qti-portable-custom-interaction");
              for (const pci of pcis) {
                const $pci = $(pci);
                const moduleName = ($pci.attr("module") || "").trim();
                if (!moduleName) continue;

                const resolved = await resolveModuleUrl(moduleName);
                if (!resolved) continue;

                let modulesEl = $pci.find("qti-interaction-modules").first();
                if (modulesEl.length === 0) {
                  $pci.append("<qti-interaction-modules></qti-interaction-modules>");
                  modulesEl = $pci.find("qti-interaction-modules").first();
                }

                const existing = modulesEl
                  .find(`qti-interaction-module[id="${moduleName}"]`)
                  .first();
                if (existing.length > 0) {
                  existing.attr("primary-path", resolved);
                } else {
                  modulesEl.append(
                    `<qti-interaction-module id="${moduleName}" primary-path="${resolved}"/>`,
                  );
                }
              }
            });
          }

          const nextDoc = transformer.browser.htmldoc();
          if (!cancelled) setItemDoc(nextDoc);
        } catch (err) {
          console.error("Failed to transform item for preview:", err);
          if (!cancelled) setError("Failed to render item");
        }
      };

      void run();

      return () => {
        cancelled = true;
      };
    }, [itemContent, itemDirUrl, itemStemDirUrl, packageRootUrl]);

    // Scale the rendered qti-assessment-item to fit the preview tile.
    // We inject CSS into the item-container shadowRoot and drive the scale via CSS variables on the host.
    useEffect(() => {
      if (!containerRef.current || !itemDoc) return;

      const host = containerRef.current;
      const previewScaleAttr = "data-qti-preview-scale";
      const targetWidthPx = 800;
      const targetHeightPx = 600; // 4:3

      const ensureInjected = (itemContainer: Element) => {
        const el = itemContainer as HTMLElement & { shadowRoot?: ShadowRoot | null };
        const shadow = el.shadowRoot;
        if (!shadow) return false;
        if (shadow.querySelector(`style[${previewScaleAttr}]`)) return true;

        const styleElement = document.createElement("style");
        styleElement.setAttribute(previewScaleAttr, "true");
        styleElement.textContent = `
          :host {
            --qti-preview-scale: 0.25;
            --qti-preview-width: ${targetWidthPx}px;
          }

          qti-assessment-item {
            margin-top: -50px;
            padding: 1rem;
            display: block;
            aspect-ratio: 4 / 3;
            width: var(--qti-preview-width);
            transform: scale(var(--qti-preview-scale));
            transform-origin: top left;
          }
        `;
        shadow.appendChild(styleElement);
        return true;
      };

      const updateScale = () => {
        const availableWidth = host.clientWidth;
        const availableHeight = host.clientHeight;
        if (!availableWidth || !availableHeight) return;

        const scale = Math.min(
          1,
          Math.min(
            availableWidth / targetWidthPx,
            availableHeight / targetHeightPx,
          ),
        );

        const itemContainers = Array.from(host.querySelectorAll("item-container"));
        for (const itemContainer of itemContainers) {
          if (!ensureInjected(itemContainer)) continue;
          (itemContainer as HTMLElement).style.setProperty(
            "--qti-preview-scale",
            String(scale),
          );
        }
      };

      // Wait briefly for item-container to attach and create its shadowRoot.
      let tries = 0;
      const intervalId = window.setInterval(() => {
        tries += 1;
        updateScale();
        if (tries > 30) window.clearInterval(intervalId);
      }, 50);

      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => updateScale())
          : null;
      ro?.observe(host);

      // Initial pass.
      updateScale();

      return () => {
        window.clearInterval(intervalId);
        ro?.disconnect();
        const itemContainers = Array.from(host.querySelectorAll("item-container"));
        for (const itemContainer of itemContainers) {
          const el = itemContainer as HTMLElement & { shadowRoot?: ShadowRoot | null };
          el.shadowRoot?.querySelector(`style[${previewScaleAttr}]`)?.remove();
        }
      };
    }, [itemDoc]);

    if (isLoading) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden m-3 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden m-3 flex items-center justify-center">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        </div>
      );
    }

    if (!itemDoc) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden m-3 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Rendering...</div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
      >
        <div className="aspect-[4/3] overflow-hidden m-3" ref={containerRef}>
          <qti-item>
            <item-container itemDoc={itemDoc}>
              <template
                dangerouslySetInnerHTML={{
                  __html: `<style>${itemCss}</style>`,
                }}
              ></template>
            </item-container>
          </qti-item>
        </div>

        <div
          onClick={() =>
            navigate(
              `/assessment/${item.assessmentId}/?item=${item.identifier}`,
            )
          }
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-end justify-center"
        >
          <div className="w-full p-3 text-white font-medium flex items-center justify-center">
            <span>{item.identifier}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    );
  },
);

// Add display name for debugging
ItemPreview.displayName = "ItemPreview";
