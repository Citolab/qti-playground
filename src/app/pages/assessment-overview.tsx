import { useMemo } from "react";
import { Bookmark } from "lucide-react";
import { ItemInfoWithBlobRef } from "../store/store";
import { ItemPreview } from "../components/item-preview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const numberBg =
    responseState === "complete"
      ? "bg-citolab-600"
      : responseState === "incomplete"
        ? "bg-citolab-400"
        : "bg-gray-400";

  const headerContent = (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shrink-0",
          numberBg
        )}
      >
        {displayNumber}
      </div>
      <Badge
        variant={
          responseState === "complete"
            ? "default"
            : responseState === "incomplete"
              ? "secondary"
              : "outline"
        }
        className={cn(
          responseState === "complete" && "bg-citolab-600 hover:bg-citolab-700",
          responseState === "incomplete" && "bg-citolab-yellow-500 text-white hover:bg-citolab-yellow-600 border-transparent",
          responseState === "missing" && "text-gray-500"
        )}
      >
        {responseState === "complete"
          ? "Answered"
          : responseState === "incomplete"
            ? "In progress"
            : "Not answered"}
      </Badge>
      {bookmarked && <Bookmark className="h-4 w-4 text-citolab-yellow-500" />}
    </div>
  );

  return (
    <ItemPreview
      item={item}
      onItemClick={onOpen}
      headerContent={headerContent}
    />
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
