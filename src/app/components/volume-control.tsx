import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Toolbar volume for the item's audio and video: an icon button that opens a
 * slider. Adapted from cito-test-uit's ToolBar.
 */
export function VolumeControl({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on a click elsewhere or Escape, like the other toolbar popovers.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const percent = Math.round(level * 100);
  const Icon = level === 0 ? VolumeX : level < 0.5 ? Volume1 : Volume2;

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        title={`Volume of audio and video: ${percent}%`}
        className="rounded-full w-10 h-10 border shadow-sm bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-white"
      >
        <Icon className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-52 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
            <span>Volume</span>
            <span>{percent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={percent}
            onChange={(event) =>
              onChange(Math.max(0, Math.min(1, Number(event.target.value) / 100)))
            }
            className="h-2 w-full cursor-pointer accent-citolab-600"
            aria-label="Volume of audio and video"
          />
        </div>
      )}
    </div>
  );
}
