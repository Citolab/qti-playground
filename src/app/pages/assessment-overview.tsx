import { useCallback, useMemo } from "react";
import { Bookmark, BookOpenText } from "lucide-react";
import { ItemInfoWithBlobRef } from "../store/store";
import { ItemPreview } from "../components/item-preview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stimulusOnly, withoutStimulus } from "../qti/stimulus-refs";
import { itemKey } from "../qti/use-stimulus-refs";

type ResponseState = "missing" | "incomplete" | "complete";

function OverviewGridItem({
  item,
  displayNumber,
  responseState,
  bookmarked,
  hasStimulus,
  onOpen,
}: {
  item: ItemInfoWithBlobRef;
  displayNumber: number;
  responseState: ResponseState;
  bookmarked: boolean;
  hasStimulus: boolean;
  onOpen: () => void;
}) {
  const numberBg =
    responseState === "complete"
      ? "bg-citolab-600"
      : responseState === "incomplete"
        ? "bg-citolab-400"
        : "bg-gray-400";

  const headerContent = (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shrink-0",
          numberBg
        )}
      >
        {displayNumber}
      </div>
      <Badge
        variant={
          responseState === "complete"
            ? "default"
            : responseState === "incomplete"
              ? "secondary"
              : "outline"
        }
        className={cn(
          responseState === "complete" && "bg-citolab-600 hover:bg-citolab-700",
          responseState === "incomplete" && "bg-citolab-yellow-500 text-white hover:bg-citolab-yellow-600 border-transparent",
          responseState === "missing" && "text-gray-500"
        )}
      >
        {responseState === "complete"
          ? "Answered"
          : responseState === "incomplete"
            ? "In progress"
            : "Not answered"}
      </Badge>
      {bookmarked && <Bookmark className="h-4 w-4 text-citolab-yellow-500" />}
    </div>
  );

  // The source has a card of its own, so this thumbnail shows the question.
  // Left in, a reading text fills the frame and pushes the question -- the thing
  // the thumbnail exists to show -- out of sight.
  const docTransform = useCallback(
    (doc: DocumentFragment) => (hasStimulus ? withoutStimulus(doc) : doc),
    [hasStimulus],
  );

  return (
    <ItemPreview
      item={item}
      onItemClick={onOpen}
      headerContent={headerContent}
      docTransform={docTransform}
    />
  );
}

/**
 * A referenced stimulus, as its own thumbnail above the question(s) that use it.
 *
 * Rendered from the first item that references it: a stimulus only exists in the
 * package as something an item points at, so showing it means rendering that
 * item with everything but the source stripped away.
 */
function OverviewStimulusItem({
  item,
  questionLabels,
  onOpen,
}: {
  item: ItemInfoWithBlobRef;
  questionLabels: string[];
  onOpen: () => void;
}) {
  const docTransform = useCallback(
    // A source that cannot be lifted out cleanly (it shares its column with the
    // question) stays where it is -- better an unwieldy thumbnail than a
    // missing reading text.
    (doc: DocumentFragment) => stimulusOnly(doc) ?? doc,
    [],
  );

  const headerContent = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white shrink-0">
        <BookOpenText className="h-4 w-4" />
      </div>
      <Badge variant="outline" className="text-gray-600">
        {questionLabels.length > 1 ? "Shared source" : "Source"}
      </Badge>
      {questionLabels.length > 0 && (
        <span className="text-xs text-gray-500">
          {questionLabels.length === 1 ? "Question" : "Questions"}{" "}
          {questionLabels.join(", ")}
        </span>
      )}
    </div>
  );

  return (
    <ItemPreview
      item={item}
      onItemClick={onOpen}
      headerContent={headerContent}
      docTransform={docTransform}
      overlayLabel={
        questionLabels.length > 0
          ? `Source for ${questionLabels.join(", ")}`
          : "Source"
      }
    />
  );
}

export function AssessmentOverviewPage({
  items,
  responseStateByItemRefId,
  bookmarkedItemRefIds,
  primaryStimulusByItem,
  onOpenItem,
}: {
  items: ItemInfoWithBlobRef[];
  responseStateByItemRefId: Map<string, ResponseState>;
  bookmarkedItemRefIds: Set<string>;
  /** Item key → the stimulus it places. See `useStimulusRefs`. */
  primaryStimulusByItem?: ReadonlyMap<string, string>;
  onOpenItem: (itemRefIdentifier: string) => void;
}) {
  const regularItems = items.filter((i) => i.type !== "info");
  const displayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let nr = 1;
    for (const item of regularItems) {
      map.set(itemKey(item), nr);
      nr += 1;
    }
    return map;
  }, [regularItems]);

  /**
   * The grid, with each referenced source announced once above the questions
   * that use it: its own card, then its questions as ordinary cards.
   *
   * A source is emitted at the first question that references it, so it always
   * lands directly above its own group and in reading order.
   */
  const cards = useMemo(() => {
    const questionLabelsByStimulus = new Map<string, string[]>();
    if (primaryStimulusByItem) {
      for (const item of regularItems) {
        const stimulusId = primaryStimulusByItem.get(itemKey(item));
        if (!stimulusId) continue;
        const label = String(displayNumbers.get(itemKey(item)) ?? "");
        const existing = questionLabelsByStimulus.get(stimulusId) ?? [];
        questionLabelsByStimulus.set(
          stimulusId,
          label ? [...existing, label] : existing,
        );
      }
    }

    const entries: (
      | { kind: "question"; key: string; item: ItemInfoWithBlobRef }
      | {
          kind: "stimulus";
          key: string;
          item: ItemInfoWithBlobRef;
          questionLabels: string[];
        }
    )[] = [];
    const seen = new Set<string>();

    for (const item of regularItems) {
      const key = itemKey(item);
      const stimulusId = primaryStimulusByItem?.get(key);
      if (stimulusId && !seen.has(stimulusId)) {
        seen.add(stimulusId);
        entries.push({
          kind: "stimulus",
          key: `stimulus:${stimulusId}`,
          item,
          questionLabels: questionLabelsByStimulus.get(stimulusId) ?? [],
        });
      }
      entries.push({ kind: "question", key, item });
    }
    return entries;
  }, [displayNumbers, primaryStimulusByItem, regularItems]);

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4">
        <p className="text-xl font-semibold text-gray-900">Overview</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((entry) => {
            const itemRefId = itemKey(entry.item);
            if (entry.kind === "stimulus") {
              return (
                <OverviewStimulusItem
                  key={entry.key}
                  item={entry.item}
                  questionLabels={entry.questionLabels}
                  onOpen={() => onOpenItem(itemRefId)}
                />
              );
            }

            const displayNumber = displayNumbers.get(itemRefId) ?? 0;
            const responseState =
              responseStateByItemRefId.get(itemRefId) ?? "missing";
            return (
              <OverviewGridItem
                key={entry.key}
                item={entry.item}
                displayNumber={displayNumber}
                responseState={responseState}
                bookmarked={bookmarkedItemRefIds.has(itemRefId)}
                hasStimulus={!!primaryStimulusByItem?.get(itemRefId)}
                onOpen={() => onOpenItem(itemRefId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
