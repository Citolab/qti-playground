/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface NavigationBarProps {
  stampContext: any;
  onClick: (identifier: string) => void;
}

export function NavigationBar({ stampContext, onClick }: NavigationBarProps) {
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
      isAnswered:
        item.completionStatus === "completed" ||
        (item.response && item.response !== "") ||
        item.numAttempts > 0,
    };
  });

  // Calculate available space (rough estimate) - now responsive
  const containerWidth = windowWidth - 200; // Account for prev/next buttons and padding
  const itemWidth = 50; // Approximate width per item including margins
  const maxVisibleItems = Math.floor(containerWidth / itemWidth);

  const shouldShowAll = displayItems.length <= maxVisibleItems;
  const shouldShowNumbers = maxVisibleItems >= 7;

  if (!shouldShowNumbers) {
    return null; // Don't show navigation if less than 7 items fit
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
    <div className="flex items-center justify-center gap-1 px-2">
      {visibleItems.map((item: any) => {
        if (item.isDots) {
          return (
            <span key={item.key} className="px-2 text-citolab-400">
              ...
            </span>
          );
        }

        const baseClasses =
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 select-none";

        let itemClasses = baseClasses;

        if (item.isActive) {
          if (item.isAnswered) {
            // Active and answered - strong citolab with darker border
            itemClasses +=
              " bg-citolab-600 text-white border-2 border-citolab-800 shadow-lg";
          } else {
            // Active but not answered - white background with citolab border
            itemClasses +=
              " bg-white text-citolab-700 border-2 border-citolab-600 shadow-md";
          }
        } else if (item.isAnswered) {
          // Answered but not active - light citolab background
          itemClasses +=
            " bg-citolab-200 text-citolab-800 border border-citolab-300 hover:bg-citolab-300";
        } else {
          // Not answered and not active - neutral colors with citolab hover
          itemClasses +=
            " bg-white text-gray-700 border border-gray-300 hover:border-citolab-400 hover:bg-citolab-50";
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
          >
            {item.displayNumber}
          </button>
        );
      })}
    </div>
  );
}
