/**
 * The look of one question pill.
 *
 * Its own module rather than living next to a component, because both the paged
 * footer bar (`pages/nav-list.tsx`) and vertical mode's left pane import it —
 * "answered" has to read the same wherever the pill appears.
 */
import { CSSProperties } from "react";

export type ResponseState = "missing" | "incomplete" | "complete";

export type QuestionPillFlags = {
  isActive?: boolean;
  isMarked?: boolean;
  isInfo?: boolean;
};

/**
 * Classes for one question pill.
 *
 * Shared by this footer bar and vertical mode's left pane so the two cannot
 * drift apart — "answered" has to read the same wherever the pill appears.
 */
export function questionPillClasses(
  responseState: ResponseState,
  { isActive, isMarked, isInfo }: QuestionPillFlags = {},
): string {
  let classes =
    "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-300 select-none transform";

  const isComplete = responseState === "complete";

  if (isActive) {
    if (isComplete) {
      // Active and answered - strong citolab with darker border
      classes +=
        " bg-citolab-600 text-white border-2 border-citolab-800 shadow-lg";
    } else {
      // Active but not answered - white background with citolab border
      classes +=
        " bg-white text-citolab-700 border-2 border-citolab-600 shadow-md";
    }
  } else if (isComplete) {
    if (isMarked) {
      classes +=
        " bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200";
    } else {
      classes +=
        " bg-citolab-500 text-citolab-900 border border-citolab-600 hover:bg-citolab-600";
    }
  } else {
    // Not answered and not active - neutral colors with citolab hover
    if (isMarked) {
      classes +=
        " bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100";
    } else {
      classes +=
        " bg-white text-gray-700 border border-gray-300 hover:border-citolab-400 hover:bg-citolab-50";
    }
  }

  if (isInfo) {
    classes += " italic";
  }

  // The "incomplete" half-fill is painted by questionPillStyle, not by a class.
  return classes;
}

/** Half-fill gradient marking a started-but-unfinished question. */
export function questionPillStyle(
  responseState: ResponseState,
): CSSProperties | undefined {
  if (responseState !== "incomplete") return undefined;
  return {
    backgroundImage:
      "linear-gradient(135deg, var(--color-citolab-200) 0%, var(--color-citolab-200) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)",
  };
}
