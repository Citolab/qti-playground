import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemInfoWithBlobRef } from "../store/store";
import { itemCss } from "../itemCss";

interface ItemPreviewProps {
  item: ItemInfoWithBlobRef & { assessmentId: string };
  index: number;
}

export const ItemPreview: React.FC<ItemPreviewProps> = memo(
  ({ item, index }) => {
    const [itemContent, setItemContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Add styles to item-container within this component instance only
    useEffect(() => {
      if (!containerRef.current || !itemContent) return;

      const previewScaleAttr = "data-qti-preview-scale";
      const itemContainers = Array.from(
        containerRef.current.querySelectorAll("item-container"),
      );
      for (const itemContainer of itemContainers) {
        if (
          itemContainer.shadowRoot &&
          !itemContainer.shadowRoot.querySelector(`style[${previewScaleAttr}]`)
        ) {
          const styleElement = document.createElement("style");
          styleElement.setAttribute(previewScaleAttr, "true");
          styleElement.textContent = `
            qti-assessment-item {
              margin-top: -50px;
              padding: 1rem;
              display: block;
              aspect-ratio: 4 / 3;
              width: 800px;
              transform: scale(0.25);
              transform-origin: top left;
            }
          `;
          itemContainer.shadowRoot.appendChild(styleElement);
        }
      }
      return () => {
        for (const itemContainer of itemContainers) {
          itemContainer.shadowRoot
            ?.querySelector(`style[${previewScaleAttr}]`)
            ?.remove();
        }
      };
    }, [itemContent]); // Trigger when content changes

    const qti = useMemo(() => {
      if (!itemContent) return "";

      return qtiTransform(itemContent)
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
          $(`qti-media-interaction, audio, video`).replaceWith(`
          <div>Removed media</div>`);
        })
        .fnCh(($) => {
          // In the /package grid we render many items at once. Rendering PCIs here is fragile
          // (multiple iframes/RequireJS contexts) and slows the page down.
          // Keep a lightweight placeholder; the PCI will render properly in /assessment.
          $("qti-portable-custom-interaction").replaceWith(
            `<div class="rounded border border-dashed border-gray-300 bg-gray-50 p-2 text-[11px] text-gray-600">PCI will be rendered in the assessment</div>`,
          );
        })
        .browser.htmldoc();
    }, [itemContent]);

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

    return (
      <div
        key={index}
        className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
      >
        <div className="aspect-[4/3] overflow-hidden m-3" ref={containerRef}>
          <qti-item>
            <item-container itemDoc={qti}>
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
