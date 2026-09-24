/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  questionPillClasses,
  questionPillStyle,
  type ResponseState,
} from "../components/question-pill";

interface NavigationBarProps {
  stampContext: any;
  bookmarkedItemIds?: string[];
  /**
   * The screen an item is shown on, when several share one (classic mode's
   * shared-stimulus sections). Consecutive items on the same screen collapse
   * into one pill labelled with their range, e.g. "3-4".
   */
  groupOf?: (identifier: string) => string | null | undefined;
  onClick: (identifier: string) => void;
}

/** A group is as far along as its least-finished question. */
const aggregateResponseState = (states: ResponseState[]): ResponseState =>
  states.every((state) => state === "complete")
    ? "complete"
    : states.some((state) => state !== "missing")
      ? "incomplete"
      : "missing";

export function NavigationBar({
  stampContext,
  bookmarkedItemIds = [],
  groupOf,
  onClick,
}: NavigationBarProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!stampContext?.activeTestpart?.items) {
    return null;
  }

  const items = stampContext.activeTestpart.items;

  // Create display items with proper numbering
  const displayItems = items.map((item: any, index: number) => {
    const isInfo = item.categories?.some((cat: string) =>
      cat.toLowerCase().includes("info")
    );

    // Calculate display number (excluding info items from numbering)
    let displayNumber = 1;
    if (!isInfo) {
      const previousNonInfoItems = items
        .slice(0, index)
        .filter(
          (prevItem: any) =>
            !prevItem.categories?.some((cat: string) =>
              cat.toLowerCase().includes("info")
            )
        );
      displayNumber = previousNonInfoItems.length + 1;
    }

    return {
      ...item,
      originalIndex: index,
      displayNumber: isInfo ? "i" : displayNumber,
      isInfo,
      isActive: item.active,
      isMarked: bookmarkedItemIds?.includes(item.identifier) ?? false,
      responseState: (() => {
        const hasNonEmptyResponse =
          item.response &&
          item.response !== "" &&
          !(Array.isArray(item.response) && item.response.length === 0);

        const responseState: ResponseState =
          item.completionStatus === "completed"
            ? "complete"
            : hasNonEmptyResponse
              ? "incomplete"
              : "missing";
        return responseState;
      })(),
    };
  });

  // One pill per screen: items that share a screen merge into a single pill
  // whose label spans their numbers, and which opens on the first of them.
  const groups: any[][] = [];
  let lastKey: string | null = null;
  for (const item of displayItems) {
    const key = groupOf?.(item.identifier) || `item:${item.identifier}`;
    if (groups.length > 0 && key === lastKey) {
      groups[groups.length - 1].push(item);
    } else {
      groups.push([item]);
    }
    lastKey = key;
  }

  const pills = groups.map((members, index) => {
    if (members.length === 1) return members[0];
    const numbers = members
      .filter((member) => !member.isInfo)
      .map((member) => member.displayNumber as number);
    const displayNumber =
      numbers.length === 0
        ? "i"
        : numbers.length === 1
          ? numbers[0]
          : `${numbers[0]}-${numbers[numbers.length - 1]}`;
    return {
      identifier: members[0].identifier,
      originalIndex: index,
      displayNumber,
      label: `Items ${displayNumber}`,
      isInfo: numbers.length === 0,
      isGroup: numbers.length > 1,
      isActive: members.some((member) => member.isActive),
      isMarked: members.some((member) => member.isMarked),
      responseState: aggregateResponseState(
        members.map((member) => member.responseState),
      ),
    };
  });
  const activeIndex = pills.findIndex((pill: any) => pill.isActive);

  // Calculate available space more accurately
  // The navigation is in a flex justify-between layout with prev/next buttons
  // Use a more conservative estimate to prevent overflow
  const maxContainerWidth = Math.min(windowWidth, 896); // max-w-4xl = 896px
  const prevNextButtonsWidth = 240; // More conservative estimate for prev/next buttons with padding
  const containerPadding = 64; // Account for various paddings and margins
  const availableWidth =
    maxContainerWidth - prevNextButtonsWidth - containerPadding;

  // Each item: w-10 (40px) + gap-1 (4px) = 44px per item; a range pill ("3-4")
  // is w-14 (56px), so budget every pill at that once there is one.
  const itemWidth = pills.some((pill: any) => pill.isGroup) ? 60 : 44;

  const maxVisibleItems = Math.max(1, Math.floor(availableWidth / itemWidth));

  const shouldShowAll = pills.length <= maxVisibleItems;
  const shouldShowNumbers = maxVisibleItems >= 5; // Lower threshold for better mobile experience

  if (!shouldShowNumbers || pills.length === 0) {
    return null; // Don't show navigation if less than 5 items fit or no items
  }

  let visibleItems = pills;

  if (!shouldShowAll && pills.length > maxVisibleItems) {
    // Calculate how many items we can show around active item
    // Reserve space for: first item + dots + last item + dots = 4 slots
    const reservedSlots = 4;
    const availableSlots = maxVisibleItems - reservedSlots;

    // Try to center the active item with equal items on both sides
    const activeIdx = activeIndex;
    const itemsPerSide = Math.floor(availableSlots / 2);

    // Calculate the range around active item
    let startIdx = Math.max(1, activeIdx - itemsPerSide); // Don't include first item (index 0)
    let endIdx = Math.min(pills.length - 2, activeIdx + itemsPerSide); // Don't include last item

    // Adjust range if we hit boundaries to use available space
    const rangeSize = endIdx - startIdx + 1;
    if (rangeSize < availableSlots) {
      if (startIdx === 1) {
        // Hit left boundary, extend right
        endIdx = Math.min(
          pills.length - 2,
          startIdx + availableSlots - 1
        );
      } else if (endIdx === pills.length - 2) {
        // Hit right boundary, extend left
        startIdx = Math.max(1, endIdx - availableSlots + 1);
      }
    }

    visibleItems = [];

    // Always show first item
    visibleItems.push(pills[0]);

    // Add dots if there's a gap between first and our range
    if (startIdx > 1) {
      visibleItems.push({ isDots: true, key: "dots1" });
    }

    // Add the range of items around active
    for (let i = startIdx; i <= endIdx; i++) {
      visibleItems.push(pills[i]);
    }

    // Add dots if there's a gap between our range and last
    if (endIdx < pills.length - 2) {
      visibleItems.push({ isDots: true, key: "dots2" });
    }

    // Always show last item (if it's not already included)
    if (pills.length > 1 && endIdx < pills.length - 1) {
      visibleItems.push(pills[pills.length - 1]);
    }
  }

  const handleItemClick = (item: any) => {
    if (item.isDots) return;
    onClick(item.identifier);
  };

  return (
    <div className="flex items-center justify-center gap-1 px-2 py-2 overflow-hidden max-w-full">
      {visibleItems.map((item: any) => {
        if (item.isDots) {
          return (
            <span key={item.key} className="px-2 text-citolab-400">
              ...
            </span>
          );
        }

        return (
          <Button
            key={item.identifier || item.originalIndex}
            className={questionPillClasses(item.responseState, {
              isActive: item.isActive,
              isMarked: item.isMarked,
              isInfo: item.isInfo,
              isGroup: item.isGroup,
            })}
            onClick={() => handleItemClick(item)}
            title={item.label || `Item ${item.displayNumber}`}
            style={questionPillStyle(item.responseState)}
          >
            {item.isMarked && (
              <div
                key={`${item.identifier}-bookmark`}
                className="absolute -top-0.5 -right-0.5 bg-citolab-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm z-10"
                title="Bookmarked question"
              >
                !
              </div>
            )}
            {item.displayNumber}
          </Button>
        );
      })}
    </div>
  );
}
