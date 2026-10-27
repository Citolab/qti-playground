/**
 * Practice mode: score what is on the page and say how it went.
 *
 * Works on whatever the runner has rendered, so one function serves every
 * layout: the single question of a classic screen, the questions grouped
 * around a shared text, or the whole booklet in vertical mode.
 */
import type { CoachMood } from "../components/practice-coach";

type PracticeItem = HTMLElement & {
  processResponse?: (countNumAttempts?: boolean) => boolean;
  getOutcome?: (identifier: string) => { value: unknown } | undefined;
  variables?: { identifier: string; type: string; value: unknown }[];
  showCorrectResponse?: (show: boolean) => void;
};

type ItemRef = HTMLElement & { assessmentItem?: PracticeItem };

export interface PageCheck {
  mood: CoachMood;
  message: string;
  /** Items answered but not (fully) right: the ones "show me the answer" reveals. */
  wrongItems: PracticeItem[];
}

const pick = (messages: string[]) =>
  messages[Math.floor(Math.random() * messages.length)];

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const numberOf = (item: PracticeItem, identifier: string) => {
  const value = Number(item.getOutcome?.(identifier)?.value);
  return Number.isFinite(value) ? value : null;
};

/** The items on the page that ask something, with the tags that decide how to judge them. */
const pageItems = (root: ShadowRoot) =>
  Array.from(root.querySelectorAll<ItemRef>("qti-assessment-item-ref"))
    .map((ref) => ref.assessmentItem)
    .filter((item): item is PracticeItem => !!item)
    .map((item) => ({
      item,
      hasInteraction: Array.from(item.querySelectorAll("*")).some((el) =>
        el.localName.endsWith("-interaction"),
      ),
      isOpen: !!item.querySelector("qti-extended-text-interaction"),
    }))
    .filter(({ hasInteraction }) => hasInteraction);

const hasResponse = (item: PracticeItem) =>
  (item.variables ?? []).some(
    (variable) =>
      variable.type === "response" &&
      variable.identifier !== "numAttempts" &&
      variable.identifier !== "duration" &&
      !isEmpty(variable.value),
  );

/** Response processing reports back through an event, so give it a moment to land. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

export async function checkPage(root: ShadowRoot): Promise<PageCheck> {
  const items = pageItems(root);
  if (items.length === 0) {
    return {
      mood: "idle",
      message: "Nothing to check on this page. On to the next one!",
      wrongItems: [],
    };
  }

  const answered = items.filter(({ item }) => hasResponse(item));
  if (answered.length === 0) {
    return {
      mood: "unanswered",
      message: pick([
        "Have a go first, then press Check. I'll wait!",
        "No answer yet. Give it a try, there's no wrong in trying.",
      ]),
      wrongItems: [],
    };
  }

  answered.forEach(({ item }) => item.processResponse?.(false));
  await settle();

  let right = 0;
  let partial = 0;
  let open = 0;
  const wrongItems: PracticeItem[] = [];
  for (const { item, isOpen } of answered) {
    if (isOpen) {
      open += 1;
      continue;
    }
    const score = numberOf(item, "SCORE") ?? 0;
    const max = numberOf(item, "MAXSCORE") ?? 1;
    if (max > 0 && score >= max) right += 1;
    else {
      if (score > 0) partial += 1;
      wrongItems.push(item);
    }
  }

  const scored = answered.length - open;
  const unanswered = items.length - answered.length;
  // "All 3 right" only makes sense when more than one answer was scored.
  const several = scored > 1;
  const stillToDo = unanswered > 0 ? ` ${unanswered} still to go on this page.` : "";

  if (scored === 0) {
    return {
      mood: "open",
      message:
        "Thanks for writing that! Open answers like this one are marked by a teacher, so I can't score it, but every word counts.",
      wrongItems: [],
    };
  }
  if (right === scored) {
    return {
      mood: "correct",
      message:
        (several
          ? pick([`All ${scored} right. Brilliant!`, `${scored} out of ${scored}. You're on fire!`])
          : pick(["Yes! That's exactly right.", "Brilliant, spot on!", "Correct! You really know this."])) +
        stillToDo,
      wrongItems,
    };
  }
  if (right > 0 || partial > 0) {
    return {
      mood: "partial",
      message:
        (several
          ? `${right} of ${scored} right. Nearly there, have another look at the rest.`
          : "Part of that is right! Have another look and try again.") + stillToDo,
      wrongItems,
    };
  }
  return {
    mood: "incorrect",
    message:
      pick([
        "Not quite. Read the question once more and try again.",
        "Oops, that's not it yet. You can change your answer and check again.",
      ]) + stillToDo,
    wrongItems,
  };
}

export const showAnswers = (items: PracticeItem[], show: boolean) =>
  items.forEach((item) => item.showCorrectResponse?.(show));
