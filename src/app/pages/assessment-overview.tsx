import { useEffect, useMemo, useRef, useState } from "react";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { Bookmark } from "lucide-react";
import { ItemInfoWithBlobRef } from "../store/store";
import { itemCss } from "../itemCss";

type ResponseState = "missing" | "incomplete" | "complete";

function OverviewGridItem({
  item,
  displayNumber,
  responseState,
  bookmarked,
  onOpen,
}: {
  item: ItemInfoWithBlobRef;
  displayNumber: number;
  responseState: ResponseState;
  bookmarked: boolean;
  onOpen: () => void;
}) {
  const [itemContent, setItemContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;
    const loadItemContent = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(item.href, { method: "GET" });
        if (!res.ok) {
          throw new Error(`Failed to fetch item (${res.status})`);
        }
        const content = await res.text();
        if (!isActive) return;
        setItemContent(content);
      } catch (err) {
        console.error("Failed to load item content:", err);
        if (!isActive) return;
        setError("Failed to load preview");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    void loadItemContent();
    return () => {
      isActive = false;
    };
  }, [item.href]);

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
  }, [itemContent]);

  const qti = useMemo(() => {
    if (!itemContent) return "";
    return qtiTransform(itemContent)
      .fnCh(($) => {
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
        $(`qti-media-interaction, audio, video`).replaceWith(
          `<div>Removed media</div>`,
        );
      })
      .browser.htmldoc();
  }, [itemContent]);

  const stateLabel =
    responseState === "complete"
      ? "Answered"
      : responseState === "incomplete"
        ? "In progress"
        : "Not answered";

  const numberBg =
    responseState === "complete"
      ? "bg-citolab-600"
      : responseState === "incomplete"
        ? "bg-citolab-400"
        : "bg-gray-400";

  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${numberBg}`}
          >
            {displayNumber}
          </div>
          <div className="text-xs font-semibold text-gray-600">{stateLabel}</div>
          {bookmarked && <Bookmark className="h-4 w-4 text-amber-500" />}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="mb-2 aspect-[4/3] w-full overflow-hidden rounded bg-white border border-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-citolab-500"
      >
        <div className="h-full w-full" ref={containerRef}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center px-2 text-[11px] text-gray-400">
              Preview laden...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-2 text-[11px] text-rose-500">
              {error}
            </div>
          ) : (
            <qti-item>
              <item-container itemDoc={qti}>
                <template
                  dangerouslySetInnerHTML={{
                    __html: `<style>${itemCss}</style>`,
                  }}
                ></template>
              </item-container>
            </qti-item>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssessmentOverviewPage({
  items,
  responseStateByItemRefId,
  bookmarkedItemRefIds,
  onOpenItem,
}: {
  items: ItemInfoWithBlobRef[];
  responseStateByItemRefId: Map<string, ResponseState>;
  bookmarkedItemRefIds: Set<string>;
  onOpenItem: (itemRefIdentifier: string) => void;
}) {
  const regularItems = items.filter((i) => i.type !== "info");
  const displayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let nr = 1;
    for (const item of regularItems) {
      map.set(item.itemRefIdentifier || item.identifier, nr);
      nr += 1;
    }
    return map;
  }, [regularItems]);

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4">
        <p className="text-xl font-semibold text-gray-900">Overview</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {regularItems.map((item) => {
            const itemRefId = item.itemRefIdentifier || item.identifier;
            const displayNumber = displayNumbers.get(itemRefId) ?? 0;
            const responseState =
              responseStateByItemRefId.get(itemRefId) ?? "missing";
            const bookmarked = bookmarkedItemRefIds.has(itemRefId);
            return (
              <OverviewGridItem
                key={itemRefId}
                item={item}
                displayNumber={displayNumber}
                responseState={responseState}
                bookmarked={bookmarked}
                onOpen={() => onOpenItem(itemRefId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
