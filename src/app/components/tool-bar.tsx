import { Bookmark, BookmarkCheck, Pencil } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolBar({
  marked,
  onMarkCurrentItem,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomLevel,
  editing,
  onToggleEdit,
}: {
  marked: boolean;
  onMarkCurrentItem: (marked: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  zoomLevel: number;
  editing?: boolean;
  onToggleEdit?: () => void;
}) {
  const handleMark = useCallback(() => {
    onMarkCurrentItem(!marked);
  }, [marked, onMarkCurrentItem]);

  const zoomPercent = Math.round(zoomLevel * 100);
  const BookmarkIcon = marked ? BookmarkCheck : Bookmark;

  return (
    <div className="toolbar relative flex flex-row items-center gap-2 rounded p-1">
      <Button
        type="button"
        size="icon"
        title={
          marked
            ? "This question is bookmarked - click to remove bookmark"
            : "Bookmark this question to find it later"
        }
        onClick={handleMark}
        className={cn(
          "rounded-full w-10 h-10 border shadow-sm",
          marked
            ? "bg-citolab-yellow-500 text-white border-citolab-yellow-500 hover:bg-citolab-yellow-600"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-white"
        )}
      >
        <BookmarkIcon
          className={cn("w-4 h-4", marked ? "fill-white text-white" : "text-gray-700")}
        />
      </Button>

      <div className="flex items-center gap-1 bg-white text-gray-800 rounded-full border border-gray-200 shadow-sm px-2 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="w-8 h-8 rounded-full text-sm font-semibold hover:bg-gray-100"
          title="Zoom out"
        >
          -
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetZoom}
          className="min-w-[52px] h-8 px-2 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
          title="Reset zoom to 100%"
        >
          {zoomPercent}%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="w-8 h-8 rounded-full text-sm font-semibold hover:bg-gray-100"
          title="Zoom in"
        >
          +
        </Button>
      </div>

      {onToggleEdit ? (
        <Button
          type="button"
          size="sm"
          onClick={onToggleEdit}
          aria-pressed={editing ?? false}
          title={
            editing
              ? "Close the QTI editor and go back to the item"
              : "Edit this item in the QTI editor (beta)"
          }
          className={cn(
            "h-10 rounded-full border shadow-sm px-3",
            editing
              ? "bg-citolab-700 text-white border-citolab-700 hover:bg-citolab-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-white"
          )}
        >
          <Pencil className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">
            {editing ? "Close editor" : "Edit"}
          </span>
          <span className="ml-1 rounded bg-citolab-600/90 px-1 py-px text-[7px] font-semibold uppercase leading-none tracking-wide text-white">
            Beta
          </span>
        </Button>
      ) : null}
    </div>
  );
}
