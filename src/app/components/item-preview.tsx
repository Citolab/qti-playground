import React, { useState, useEffect, memo, useRef } from "react";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemInfoWithBlobRef } from "../store/store";
import { itemCss } from "../itemCss";
import {
  QTI_PKG_URL_PREFIX,
  detectPciBaseUrl,
  createModuleResolutionFetcher,
} from "@citolab/qti-browser-import";

interface ItemPreviewProps {
  item: ItemInfoWithBlobRef & { assessmentId?: string };
  index?: number;
  onItemClick?: () => void;
  headerContent?: React.ReactNode;
}

export const ItemPreview: React.FC<ItemPreviewProps> = memo(
  ({ item, index, onItemClick, headerContent }) => {
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
                    const newClasses = classes
                      .replace(`type:${type}`, "")
                      .trim();
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

          // Legacy CES / "qti-custom-interaction" support (non-RequireJS).
          // qti-components expects:
          // - <qti-custom-interaction data="...manifest.json" data-base-item="..." data-base-ref="...">
          // but some packages use <qti-custom-interaction><object data="...manifest.json" ... /></qti-custom-interaction>.
          if (packageRootUrl && itemDirUrl) {
            transformer.fnCh(($) => {
              const origin =
                typeof window !== "undefined" ? window.location.origin : "";
              const itemBasePath = itemDirUrl.replace(/\/+$/, "");
              const itemBase = origin
                ? `${origin}${itemBasePath}/`
                : `${itemBasePath}/`;

              const dirnamePath = (pathname: string) => {
                const idx = pathname.lastIndexOf("/");
                return idx >= 0 ? pathname.slice(0, idx) : pathname;
              };

              const relativePath = (
                fromDirPath: string,
                toPathname: string,
              ) => {
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

              $("qti-custom-interaction").each((_, el) => {
                const $ci = $(el);

                const object = $ci.find("object[data]").first();
                const objectData = (object.attr("data") || "").trim();

                let data = ($ci.attr("data") || "").trim();
                if (!data && objectData) data = objectData;
                if (!data) return;

                // Ensure width/height are on the host element (qti-components reads them from the host).
                const width =
                  ($ci.attr("width") || "").trim() ||
                  (object.attr("width") || "").trim();
                const height =
                  ($ci.attr("height") || "").trim() ||
                  (object.attr("height") || "").trim();
                if (width && !$ci.attr("width")) $ci.attr("width", width);
                if (height && !$ci.attr("height")) $ci.attr("height", height);

                $ci.attr("data-base-item", itemBasePath);

                try {
                  const isAbsolute = /^(data:|blob:|https?:)/.test(data);
                  const isPkgRooted =
                    data.startsWith("/") &&
                    !data.startsWith(QTI_PKG_URL_PREFIX);

                  const abs = isAbsolute
                    ? data
                    : isPkgRooted
                      ? `${origin}${packageRootUrl}${data}`
                      : new URL(data, itemBase).toString();
                  const u = new URL(abs, origin);
                  const baseRefPath = dirnamePath(u.pathname);
                  $ci.attr("data-base-ref", baseRefPath);

                  if (!isAbsolute) {
                    const rel = relativePath(itemBasePath, u.pathname);
                    const nextData = `${rel}${u.search}${u.hash}`;
                    $ci.attr("data", nextData);
                    if (object.length > 0) object.attr("data", nextData);
                  } else {
                    $ci.attr("data", data);
                    if (object.length > 0) object.attr("data", data);
                  }
                } catch {
                  // ignore
                }
              });
            });
          }

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
                  const normalizedValue =
                    value.startsWith("/") &&
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
                const tagName = (
                  ((el as unknown as HTMLElement)?.tagName as
                    | string
                    | undefined) || ""
                ).toLowerCase();
                const inLegacyCustomInteraction =
                  tagName === "qti-custom-interaction" ||
                  (tagName === "object" &&
                    $(el).closest("qti-custom-interaction").length > 0);
                for (const attr of ["src", "href", "data"] as const) {
                  const current = $(el).attr(attr);
                  if (!current) continue;
                  if (attr === "data" && inLegacyCustomInteraction) continue;
                  const next = resolveUrl(current);
                  if (next !== current) $(el).attr(attr, next);
                }
              });
            });
          }

          const hasPci = itemContent.includes("qti-portable-custom-interaction");
          if (hasPci && packageRootUrl) {
            const pciBaseUrl = await detectPciBaseUrl({
              packageRootUrl,
              itemDirUrl,
              itemStemDirUrl,
              xmlText: itemContent,
            });
            const getModuleResolutionConfig = createModuleResolutionFetcher({
              packageRootUrl,
              itemDirUrl,
              itemStemDirUrl,
            });
            await transformer.configurePciAsync(
              pciBaseUrl,
              getModuleResolutionConfig,
              { packageRootUrl, itemDirUrl, itemStemDirUrl },
            );
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
        const el = itemContainer as HTMLElement & {
          shadowRoot?: ShadowRoot | null;
        };
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

        const itemContainers = Array.from(
          host.querySelectorAll("item-container"),
        );
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
        const itemContainers = Array.from(
          host.querySelectorAll("item-container"),
        );
        for (const itemContainer of itemContainers) {
          const el = itemContainer as HTMLElement & {
            shadowRoot?: ShadowRoot | null;
          };
          el.shadowRoot?.querySelector(`style[${previewScaleAttr}]`)?.remove();
        }
      };
    }, [itemDoc]);

    if (isLoading) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {headerContent && <div className="px-4 pt-4">{headerContent}</div>}
          <div className="aspect-[4/3] overflow-hidden m-3 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {headerContent && <div className="px-4 pt-4">{headerContent}</div>}
          <div className="aspect-[4/3] overflow-hidden m-3 flex items-center justify-center">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        </div>
      );
    }

    if (!itemDoc) {
      return (
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {headerContent && <div className="px-4 pt-4">{headerContent}</div>}
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
        {headerContent && <div className="px-4 pt-4">{headerContent}</div>}
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
          onClick={() => {
            if (onItemClick) {
              onItemClick();
            } else if (item.assessmentId) {
              navigate(
                `/assessment/${item.assessmentId}/?item=${item.identifier}`,
              );
            }
          }}
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
