import React, { useState, useRef, useEffect } from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggablePopupProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  storageKey?: string;
  defaultSize?: { width: number; height: number };
}

const DraggablePopup = ({
  isOpen,
  title,
  children,
  onClose,
  storageKey = "draggablePopupState", // Default key for localStorage
  defaultSize = { width: 384, height: 300 }, // 384px = w-96
}: DraggablePopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize state from localStorage or defaults
  const [popupState, setPopupState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState
      ? JSON.parse(savedState)
      : {
          position: { x: 100, y: 100 },
          size: defaultSize,
        };
  });

  const { position, size } = popupState;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(storageKey, JSON.stringify(popupState));
    }
  }, [popupState, isOpen, storageKey]);

  const startDrag = (e: any) => {
    if (popupRef.current) {
      // From where it is drawn, which the viewport clamp below may have moved.
      const rect = popupRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const onDrag = (e: MouseEvent) => {
    if (isDragging) {
      // Calculate new position but keep popup within viewport bounds
      const newX = Math.min(
        Math.max(0, e.clientX - dragOffset.x),
        window.innerWidth - size.width,
      );
      const newY = Math.min(
        Math.max(0, e.clientY - dragOffset.y),
        window.innerHeight - size.height,
      );

      setPopupState((prev) => ({
        ...prev,
        position: { x: newX, y: newY },
      }));
    }
  };

  const startResize = (e: any) => {
    setIsResizing(true);
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY,
    });
    e.preventDefault();
  };

  const onResize = (e: any) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      const newWidth = Math.max(200, size.width + deltaX);
      const newHeight = Math.max(150, size.height + deltaY);

      setResizeStartPos({
        x: e.clientX,
        y: e.clientY,
      });

      setPopupState((prev) => ({
        ...prev,
        size: {
          width: Math.min(newWidth, window.innerWidth - position.x),
          height: Math.min(newHeight, window.innerHeight - position.y),
        },
      }));
    }
  };

  const endDragOrResize = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Setup and cleanup event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onDrag(e);
      }
      if (isResizing) {
        onResize(e);
      }
    };

    const handleMouseUp = () => {
      endDragOrResize();
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  if (!isOpen) return null;

  // A position saved on a bigger window can sit off-screen on this one.
  const left = Math.max(0, Math.min(position.x, window.innerWidth - size.width));
  const top = Math.max(0, Math.min(position.y, window.innerHeight - size.height));

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label={title}
      className={`
        fixed flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50
        shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-shadow
        ${isDragging || isResizing ? "shadow-[0_20px_50px_-8px_rgba(0,0,0,0.35)] select-none" : ""}
      `}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 9999,
      }}
    >
      {/* Header with drag handle */}
      <div
        className={`flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white py-2 pl-3 pr-2 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={startDrag}
      >
        <div className="flex min-w-0 items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
          <h3 className="truncate text-sm font-semibold text-gray-800">
            {title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onClose()}
          className="h-7 w-7 shrink-0 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

      {/* Resize handle - bottom right corner */}
      <div
        ref={resizeHandleRef}
        className="absolute bottom-0 right-0 flex h-4 w-4 cursor-nwse-resize items-end justify-end p-0.5 text-gray-400 hover:text-gray-600"
        onMouseDown={startResize}
        aria-hidden
      >
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
          <path
            d="M9 1L1 9M9 5L5 9"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default DraggablePopup;
