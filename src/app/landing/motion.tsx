import {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { reducedMotion, useInView } from "./in-view";

// The landing page's motion: what comes into sight fades up, code types itself, cards follow the pointer.
// All of it stands still for a visitor who asks for reduced motion (styles.css).

/** Its children fade up when they come into sight, after `delay` ms. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  ...handlers
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
} & Pick<HTMLAttributes<HTMLElement>, "onPointerMove" | "onPointerLeave">) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag
      {...handlers}
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** `text`, typed out character by character once it comes into sight, with a blinking caret while it types. */
export function Typewriter({ text, speed = 14 }: { text: string; speed?: number }) {
  const [ref, inView] = useInView<HTMLElement>();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || reducedMotion()) return;
    const timer = setInterval(
      () =>
        setShown((n) => {
          if (n >= text.length) clearInterval(timer);
          return Math.min(text.length, n + 1);
        }),
      speed,
    );
    return () => clearInterval(timer);
  }, [inView, text, speed]);
  const all = reducedMotion() ? text.length : shown;
  return (
    <code ref={ref} className="relative block">
      {/* the whole text keeps the room, so the box does not grow as it types */}
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {text.slice(0, all)}
        {all < text.length && (
          <span className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-citolab-300" />
        )}
      </span>
    </code>
  );
}
