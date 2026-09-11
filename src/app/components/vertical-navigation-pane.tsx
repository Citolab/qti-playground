import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Menu, X } from "lucide-react";
import { ItemInfoWithBlobRef } from "../store/store";
import { itemKey } from "../qti/use-stimulus-refs";
import {
  questionPillClasses,
  questionPillStyle,
  type ResponseState,
} from "./question-pill";

export interface VerticalNavigationPaneProps {
  items: ItemInfoWithBlobRef[];
  /** Item-ref identifier → visible question number (info items are skipped). */
  displayNumbers: ReadonlyMap<string, number>;
  responseStateByItemRefId: ReadonlyMap<string, ResponseState>;
  bookmarkedItemRefIds: ReadonlySet<string>;
  /** The question under the reading position, from the scroll spy. */
  activeItemRefId?: string;
  onSelectItem: (itemRefIdentifier: string) => void;
  isOverviewOpen: boolean;
  onToggleOverview: () => void;
}

/**
 * Vertical mode's navigation, as a left pane — a PDF viewer's sidebar.
 *
 * The paged layout navigates from a footer bar because there is one question on
 * screen and prev/next is the whole story. A booklet has no pages to step
 * through, so the same information becomes a rail you read alongside the text:
 * where you are, how far along you are, and one click to anywhere.
 *
 * Below `lg` there is no room for a permanent 16rem pane beside a readable
 * booklet, so the same pane becomes an off-canvas drawer behind a slim bar.
 * Everything in it is the same markup; only where it sits changes.
 *
 * Renders a fragment — the mobile bar and the pane are siblings inside the
 * player's `flex-col lg:flex-row` content area, with the booklet's scroller
 * following them.
 *
 * Adapted from `VerticalSidebar` / `VerticalPlayerChrome` in cito-test-uit.
 */
export function VerticalNavigationPane({
  items,
  displayNumbers,
  responseStateByItemRefId,
  bookmarkedItemRefIds,
  activeItemRefId,
  onSelectItem,
  isOverviewOpen,
  onToggleOverview,
}: VerticalNavigationPaneProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const pills = useMemo(
    () =>
      items.map((item) => {
        const id = itemKey(item);
        const isInfo = item.type === "info";
        return {
          id,
          label: isInfo ? "i" : `${displayNumbers.get(id) ?? ""}`,
          isInfo,
          responseState: responseStateByItemRefId.get(id) ?? "missing",
          isMarked: bookmarkedItemRefIds.has(id),
          isActive: id === activeItemRefId,
        };
      }),
    [
      activeItemRefId,
      bookmarkedItemRefIds,
      displayNumbers,
      items,
      responseStateByItemRefId,
    ],
  );

  const answerable = pills.filter((pill) => !pill.isInfo);
  const total = answerable.length;
  const answeredCount = answerable.filter(
    (pill) => pill.responseState === "complete",
  ).length;
  const percentage = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const activeNumber = activeItemRefId
    ? displayNumbers.get(activeItemRefId)
    : undefined;

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  // Follow the reader: keep the active question visible in the rail.
  useEffect(() => {
    const list = listRef.current;
    if (!activeItemRefId || !list) return;
    const activePill = list.querySelector<HTMLElement>(
      `[data-vertical-nav-item="${CSS.escape(activeItemRefId)}"]`,
    );
    if (!activePill) return;

    // Drive scrollTop directly rather than calling scrollIntoView: that also
    // acts on other scroll ancestors, which cancels the booklet's own smooth
    // scroll when a click and this effect land in the same frame.
    const target =
      activePill.offsetTop -
      list.clientHeight / 2 +
      activePill.offsetHeight / 2;
    const maxScroll = list.scrollHeight - list.clientHeight;
    list.scrollTop = Math.max(0, Math.min(target, maxScroll));
  }, [activeItemRefId]);

  const positionLabel = activeNumber
    ? `Question ${activeNumber} of ${total}`
    : `${total} ${total === 1 ? "question" : "questions"}`;

  return (
    <>
      {/* Phones and tablets: the drawer handle, where you are, and the way to
          the overview. */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-2 py-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={isDrawerOpen}
          aria-label="Open the question list"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-xs text-gray-500">
          {positionLabel}
          {" · "}
          {answeredCount} answered
        </p>
        <button
          type="button"
          onClick={onToggleOverview}
          aria-expanded={isOverviewOpen}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded bg-citolab-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-citolab-600"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </button>
      </div>

      {isDrawerOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close the question list"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
        />
      )}

      <div
        className={`${
          isDrawerOpen ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl" : "hidden"
        } lg:static lg:z-auto lg:flex lg:shadow-none`}
      >
        <aside className="flex h-full w-64 max-w-[85vw] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex shrink-0 items-start gap-2 border-b border-gray-200 px-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-gray-800">
                  {positionLabel}
                </span>
                <span className="text-xs text-gray-500">{percentage}%</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                aria-label="Progress"
              >
                <div
                  className="h-full rounded-full bg-citolab-600 transition-[width] duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {answeredCount} of {total} answered
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close the question list"
              className="-mr-1 -mt-1 shrink-0 rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
          >
            <div className="grid grid-cols-4 gap-1.5">
              {pills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  data-vertical-nav-item={pill.id}
                  className={questionPillClasses(pill.responseState, {
                    isActive: pill.isActive,
                    isMarked: pill.isMarked,
                    isInfo: pill.isInfo,
                  })}
                  style={questionPillStyle(pill.responseState)}
                  title={
                    pill.isInfo
                      ? "Information"
                      : `Go to question ${pill.label}`
                  }
                  aria-current={pill.isActive ? "true" : undefined}
                  onClick={() => {
                    setDrawerOpen(false);
                    onSelectItem(pill.id);
                  }}
                >
                  {pill.isMarked && (
                    <span
                      className="absolute -top-0.5 -right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-citolab-yellow-500 text-xs font-bold text-white shadow-sm"
                      title="Bookmarked question"
                    >
                      !
                    </span>
                  )}
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto shrink-0 border-t border-gray-200 px-3 py-3">
            <button
              type="button"
              onClick={onToggleOverview}
              aria-expanded={isOverviewOpen}
              className="flex w-full items-center justify-center gap-2 rounded bg-citolab-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-citolab-600"
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
