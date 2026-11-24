import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Classes for the box that scrolls: its padding, whether its text can be selected. */
  className?: string;
  children: ReactNode;
}

interface Reach {
  /** There is more than fits: the rail with the buttons shows. */
  scrollable: boolean;
  up: boolean;
  down: boolean;
  /** Where the part in view starts and how much of the whole it is, in percent. */
  from: number;
  share: number;
}

const NONE: Reach = { scrollable: false, up: false, down: false, from: 0, share: 100 };

/**
 * A box that scrolls, with the up and down buttons a game has. When there is
 * more than fits, a rail appears beside the text: a button at either end and a
 * marker between them that shows where you are. So it is clear at a glance that
 * a text goes on, and you can get there without a scroll wheel: on a touch
 * screen, or with the keyboard busy steering the hero. The rail stands beside
 * the text, not on it, so it never covers a word.
 *
 * It fills the room its parent gives it (a flex column), like the plain
 * `min-h-0 flex-1 overflow-y-auto` box it replaces.
 */
export function Scroller({ className, children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [reach, setReach] = useState<Reach>(NONE);

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const hidden = box.scrollHeight - box.clientHeight;
    const next: Reach =
      hidden <= 6
        ? NONE
        : {
            scrollable: true,
            up: box.scrollTop > 6,
            down: box.scrollTop < hidden - 6,
            from: Math.round((box.scrollTop / box.scrollHeight) * 100),
            share: Math.round((box.clientHeight / box.scrollHeight) * 100),
          };
    setReach((now) =>
      now.scrollable === next.scrollable && now.up === next.up && now.down === next.down && now.from === next.from && now.share === next.share
        ? now
        : next,
    );
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;
    // Reports once on observing, and again whenever the box or what is in it changes size:
    // another question, a picture that finished loading, a turned screen.
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(content);
    box.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      box.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const box = boxRef.current;
    if (!box) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Most of a screenful, so the last line read stays in view as the first.
    box.scrollBy({ top: direction * Math.max(48, box.clientHeight * 0.75), behavior: calm ? "auto" : "smooth" });
  };

  const button = (direction: 1 | -1) => {
    const Icon = direction === 1 ? ChevronDown : ChevronUp;
    const more = direction === 1 ? reach.down : reach.up;
    return (
      <button
        type="button"
        disabled={!more}
        // On press, and without taking the focus: Space must go on making the hero jump.
        onPointerDown={(e) => {
          e.preventDefault();
          page(direction);
        }}
        // A click without a pointer comes from the keyboard.
        onClick={(e) => {
          if (e.detail === 0) page(direction);
        }}
        aria-label={direction === 1 ? "Scroll down" : "Scroll up"}
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition",
          more
            ? "border-amber-500 bg-amber-300 text-amber-950 shadow-[0_3px_0_#b45309] hover:bg-amber-200 active:translate-y-0.5 active:shadow-[0_1px_0_#b45309]"
            : "border-slate-200 bg-slate-100 text-slate-300",
          // Until you have scrolled, the way down asks for attention.
          direction === 1 && more && !reach.up && "quest-bounce",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={3} />
      </button>
    );
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div
        ref={boxRef}
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto",
          // The rail takes over from the browser's own scroll bar.
          reach.scrollable && "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {reach.scrollable && (
        <div className="flex shrink-0 flex-col items-center gap-1.5 py-1.5 pl-0.5 pr-1.5">
          {button(-1)}
          <div className="relative min-h-0 w-1.5 flex-1 rounded-full bg-slate-200" aria-hidden="true">
            <div className="absolute inset-x-0 rounded-full bg-amber-400" style={{ top: `${reach.from}%`, height: `${reach.share}%` }} />
          </div>
          {button(1)}
        </div>
      )}
    </div>
  );
}
