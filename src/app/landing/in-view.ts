import { type PointerEvent, useEffect, useRef, useState } from "react";

// When something on the landing page comes into sight, and whether the visitor asks for reduced motion.

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Whether the element is (or, with `once`, has been) in sight; `margin` reaches ahead of the viewport. */
export function useInView<T extends Element>({
  once = true,
  margin = "0px 0px -10% 0px",
} = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [once, margin]);
  return [ref, inView] as const;
}

/** Where the pointer is on the element, as --x and --y (for a spotlight), and a tilt towards it. */
export function pointerLight(tilt = 0) {
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--x", `${x * 100}%`);
    element.style.setProperty("--y", `${y * 100}%`);
    if (tilt && !reducedMotion()) {
      element.style.transform = `perspective(900px) rotateX(${(0.5 - y) * tilt}deg) rotateY(${(x - 0.5) * tilt}deg) translateY(-4px)`;
    }
  };
  const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "";
  };
  return { onPointerMove, onPointerLeave };
}
