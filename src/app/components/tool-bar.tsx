import { Bookmark, BookmarkCheck } from "lucide-react";
import { useCallback } from "react";

export function ToolBar({
  marked,
  onMarkCurrentItem,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomLevel,
}: {
  marked: boolean;
  onMarkCurrentItem: (marked: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  zoomLevel: number;
}) {
  const handleMark = useCallback(() => {
    onMarkCurrentItem(!marked);
  }, [marked, onMarkCurrentItem]);

  const zoomPercent = Math.round(zoomLevel * 100);
  const BookmarkIcon = marked ? BookmarkCheck : Bookmark;

  return (
    <div className="toolbar relative flex flex-row items-center gap-2 rounded p-1">
      <button
        className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 border shadow-sm ${
          marked
            ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 active:scale-95"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900 active:scale-95"
        }`}
        title={
          marked
            ? "This question is bookmarked - click to remove bookmark"
            : "Bookmark this question to find it later"
        }
        onClick={handleMark}
        type="button"
      >
        <BookmarkIcon
          className={`w-4 h-4 ${
            marked ? "fill-white text-white" : "text-gray-700"
          }`}
        />
      </button>

      <div className="flex items-center gap-1 bg-white text-gray-800 rounded-full border border-gray-200 shadow-sm px-2 py-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all"
          title="Zoom out"
        >
          -
        </button>
        <button
          type="button"
          onClick={onResetZoom}
          className="min-w-[52px] h-8 px-2 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          title="Reset zoom to 100%"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all"
          title="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}

