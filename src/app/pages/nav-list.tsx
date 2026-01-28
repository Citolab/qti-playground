/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface NavigationBarProps {
  stampContext: any;
  bookmarkedItemIds?: string[];
  onClick: (identifier: string) => void;
}

type ResponseState = "missing" | "incomplete" | "complete";

export function NavigationBar({
  stampContext,
  bookmarkedItemIds = [],
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
  const activeIndex = items.findIndex((item: any) => item.active);

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

  // Calculate available space more accurately
  // The navigation is in a flex justify-between layout with prev/next buttons
  // Use a more conservative estimate to prevent overflow
  const maxContainerWidth = Math.min(windowWidth, 896); // max-w-4xl = 896px
  const prevNextButtonsWidth = 240; // More conservative estimate for prev/next buttons with padding
  const containerPadding = 64; // Account for various paddings and margins
  const availableWidth =
    maxContainerWidth - prevNextButtonsWidth - containerPadding;

  // Each item: w-10 (40px) + gap-1 (4px) = 44px per item
  const itemWidth = 44;

  const maxVisibleItems = Math.max(1, Math.floor(availableWidth / itemWidth));

  const shouldShowAll = displayItems.length <= maxVisibleItems;
  const shouldShowNumbers = maxVisibleItems >= 5; // Lower threshold for better mobile experience

  if (!shouldShowNumbers || displayItems.length === 0) {
    return null; // Don't show navigation if less than 5 items fit or no items
  }

  let visibleItems = displayItems;

  if (!shouldShowAll && displayItems.length > maxVisibleItems) {
    // Calculate how many items we can show around active item
    // Reserve space for: first item + dots + last item + dots = 4 slots
    const reservedSlots = 4;
    const availableSlots = maxVisibleItems - reservedSlots;

    // Try to center the active item with equal items on both sides
    const activeIdx = activeIndex;
    const itemsPerSide = Math.floor(availableSlots / 2);

    // Calculate the range around active item
    let startIdx = Math.max(1, activeIdx - itemsPerSide); // Don't include first item (index 0)
    let endIdx = Math.min(displayItems.length - 2, activeIdx + itemsPerSide); // Don't include last item

    // Adjust range if we hit boundaries to use available space
    const rangeSize = endIdx - startIdx + 1;
    if (rangeSize < availableSlots) {
      if (startIdx === 1) {
        // Hit left boundary, extend right
        endIdx = Math.min(
          displayItems.length - 2,
          startIdx + availableSlots - 1
        );
      } else if (endIdx === displayItems.length - 2) {
        // Hit right boundary, extend left
        startIdx = Math.max(1, endIdx - availableSlots + 1);
      }
    }

    visibleItems = [];

    // Always show first item
    visibleItems.push(displayItems[0]);

    // Add dots if there's a gap between first and our range
    if (startIdx > 1) {
      visibleItems.push({ isDots: true, key: "dots1" });
    }

    // Add the range of items around active
    for (let i = startIdx; i <= endIdx; i++) {
      visibleItems.push(displayItems[i]);
    }

    // Add dots if there's a gap between our range and last
    if (endIdx < displayItems.length - 2) {
      visibleItems.push({ isDots: true, key: "dots2" });
    }

    // Always show last item (if it's not already included)
    if (displayItems.length > 1 && endIdx < displayItems.length - 1) {
      visibleItems.push(displayItems[displayItems.length - 1]);
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

        const baseClasses =
          "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-300 select-none transform";

        let itemClasses = baseClasses;

        const isComplete = item.responseState === "complete";
        const isIncomplete = item.responseState === "incomplete";

        if (item.isActive) {
          if (isComplete) {
            // Active and answered - strong citolab with darker border
            itemClasses +=
              " bg-citolab-600 text-white border-2 border-citolab-800 shadow-lg";
          } else {
            // Active but not answered - white background with citolab border
            itemClasses +=
              " bg-white text-citolab-700 border-2 border-citolab-600 shadow-md";
          }
        } else {
          if (isComplete) {
            if (item.isMarked) {
              itemClasses +=
                " bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200";
            } else {
              itemClasses +=
                " bg-citolab-500 text-citolab-900 border border-citolab-600 hover:bg-citolab-600";
            }
          } else {
            // Not answered and not active - neutral colors with citolab hover
            if (item.isMarked) {
              itemClasses +=
                " bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100";
            } else {
              itemClasses +=
                " bg-white text-gray-700 border border-gray-300 hover:border-citolab-400 hover:bg-citolab-50";
            }
          }
        }

        if (item.isInfo) {
          itemClasses += " italic";
        }

        return (
          <button
            key={item.identifier || item.originalIndex}
            className={itemClasses}
            onClick={() => handleItemClick(item)}
            title={item.label || `Item ${item.displayNumber}`}
            style={
              isIncomplete
                ? {
                    backgroundImage:
                      "linear-gradient(135deg, var(--color-citolab-200) 0%, var(--color-citolab-200) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)",
                  }
                : undefined
            }
          >
            {item.isMarked && (
              <div
                key={`${item.identifier}-bookmark`}
                className="absolute -top-0.5 -right-0.5 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm z-10"
                title="Bookmarked question"
              >
                !
              </div>
            )}
            {item.displayNumber}
          </button>
        );
      })}
    </div>
  );
}
