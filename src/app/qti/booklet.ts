/**
 * DOM work for the booklet page — the layouts that render several questions at
 * once (vertical mode, and classic mode's shared-stimulus sections).
 *
 * Both things here run *after* qti-components has rendered a navigation, over
 * the items it put in <test-container>'s shadow root, and both are safe to
 * re-run: the runner re-renders items behind our back on every navigation and
 * on every stimulus load.
 *
 * Adapted from `applyStimulusReferences.ts` in cito-test-uit's ui package.
 */
import bookletCss from "./booklet.css?inline";

export { bookletCss };

/** Marks the block a hoisted stimulus is lifted into. */
const BLOCK_ATTR = "data-shared-stimulus-block";
/** Marks a layout column whose stimulus has been lifted out of the card. */
const HOISTED_COLUMN_ATTR = "data-stimulus-hoisted";
/** Cito's booklet layout wraps each side of a question in a `qti-layout-col*`. */
const COLUMN_SELECTOR = '[class*="qti-layout-col"]';

/** The items the runner actually rendered, in document order. */
const renderedItemRefs = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>("qti-assessment-item-ref")).filter(
    (itemRef) => itemRef.querySelector("qti-assessment-item") !== null,
  );

/** The shadow root the runner rendered into, or the element itself in tests. */
export const bookletRoot = (
  testContainer: HTMLElement | null | undefined,
): ParentNode | null =>
  (testContainer?.shadowRoot ?? testContainer ?? null) as ParentNode | null;

/**
 * What a question is worth, straight from the rendered item.
 *
 * The authoritative MAXSCORE is the item's own outcome declaration; the test XML
 * often carries no `qti-weight`, so reading the item is the only way to show a
 * 2-point question as 2 points.
 */
const readRenderedMaxScore = (itemRef: Element): number | null => {
  const declared = itemRef
    .querySelector('qti-outcome-declaration[identifier="MAXSCORE"] qti-value')
    ?.textContent?.trim();
  if (!declared) return null;
  const parsed = Number(declared);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The booklet question header: the sequence number and what the question is
 * worth, as two badges in the card's top corners.
 *
 * Real elements rather than CSS pseudo-elements because a question needs two
 * independent badges and `::before`/`::after` are already spoken for (the
 * section heading uses one). An existing header is updated in place.
 *
 * `displayNumbers` maps an item-ref identifier to its 1-based question number.
 */
export const decorateQuestionBadges = (
  testContainer: HTMLElement | null,
  displayNumbers: ReadonlyMap<string, number>,
): void => {
  const root = bookletRoot(testContainer);
  if (!root) return;

  root.querySelectorAll("qti-assessment-item-ref").forEach((itemRef) => {
    const id = itemRef.getAttribute("identifier") ?? "";
    const number = displayNumbers.get(id);
    const isRendered = itemRef.querySelector("qti-assessment-item") !== null;

    const existing = itemRef.querySelector(":scope > [data-question-header]");
    if (!isRendered || typeof number !== "number") {
      existing?.remove();
      return;
    }

    const maxScore = readRenderedMaxScore(itemRef);
    const scoreText =
      typeof maxScore === "number" && maxScore > 0 ? `${maxScore}p` : null;

    const header = existing ?? itemRef.ownerDocument.createElement("div");
    if (!existing) {
      header.setAttribute("data-question-header", "");
      itemRef.insertBefore(header, itemRef.firstChild);
    }

    const numberBadge =
      header.querySelector("[data-question-number-badge]") ??
      header.appendChild(itemRef.ownerDocument.createElement("span"));
    numberBadge.setAttribute("data-question-number-badge", "");
    numberBadge.textContent = String(number);

    const scoreBadge = header.querySelector("[data-question-score-badge]");
    if (scoreText) {
      const badge =
        scoreBadge ??
        header.appendChild(itemRef.ownerDocument.createElement("span"));
      badge.setAttribute("data-question-score-badge", "");
      badge.textContent = scoreText;
    } else {
      scoreBadge?.remove();
    }
  });
};

/**
 * The column a placeholder owns outright, if any.
 *
 * "Outright" means the column holds nothing but the placeholder — the shape the
 * booklet layout produces, and the only shape where hiding the column cannot
 * take question content with it.
 */
const owningColumn = (placeholder: HTMLElement): HTMLElement | null => {
  const parent = placeholder.parentElement;
  if (!parent?.matches(COLUMN_SELECTOR)) return null;
  const hasOtherContent = Array.from(parent.childNodes).some(
    (node) =>
      node !== placeholder &&
      (node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? "").trim() !== "")),
  );
  return hasOtherContent ? null : parent;
};

/**
 * Remove a hoisted block, handing back the chapter heading it took with it.
 *
 * The heading moves onto the block so it introduces the source rather than
 * being stranded between the source and question 1, and the item-ref it came
 * from loses the attribute — so dropping the block without giving it back would
 * lose the heading for good the next time this group is rendered.
 */
function dropBlock(block: HTMLElement): void {
  if (block.hasAttribute("data-section-start")) {
    block.nextElementSibling?.setAttribute("data-section-start", "true");
  }
  block.remove();
}

/**
 * Show each shared source once, in a block of its own directly above the
 * questions that use it.
 *
 * qti-components copies a stimulus into every `[data-stimulus-idref]`
 * placeholder that names it, and in a booklet several questions share one
 * source — so on a multi-question page the same figure or reading text would
 * appear three or four times, each one inside a numbered question card. Lifting
 * the first copy out into a block of its own puts the source where the printed
 * booklet has it: above the group, before the numbering starts. The remaining
 * copies are marked (rather than deleted) so the runner stays free to re-inject
 * content without us fighting it, and CSS collapses the now-empty column.
 *
 * Walks rendered items in DOM order, so the copy that gets lifted is always the
 * first one on the page — regardless of the order the loads resolved in.
 *
 * Safe to re-run: a block that still holds its placeholder is left alone, and
 * one whose content was cleared behind our back re-claims a filled copy.
 */
export const hoistSharedStimuli = (testContainer: HTMLElement | null): void => {
  const root = bookletRoot(testContainer);
  if (!root) return;

  const blocks = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>(`[${BLOCK_ATTR}]`).forEach((block) => {
    const stimulusId = block.getAttribute(BLOCK_ATTR) ?? "";
    const placeholder = block.querySelector("[data-stimulus-idref]");
    // A block the runner re-rendered out from under us has nothing left to show.
    if (!stimulusId || !placeholder) {
      dropBlock(block);
      return;
    }
    blocks.set(stimulusId, block);
  });

  /** The sources this pass found a rendered question for. */
  const claimed = new Set<string>();

  root.querySelectorAll("qti-assessment-item-ref").forEach((itemRef) => {
    itemRef
      .querySelectorAll<HTMLElement>("[data-stimulus-idref]")
      .forEach((placeholder) => {
        const stimulusId =
          placeholder.getAttribute("data-stimulus-idref") ?? "";
        if (!stimulusId) return;
        claimed.add(stimulusId);

        // The card never shows the source itself, so its column always goes —
        // whether this copy is the one being lifted or one of the repeats.
        owningColumn(placeholder)?.setAttribute(HOISTED_COLUMN_ATTR, "true");

        const existing = blocks.get(stimulusId);
        if (existing) {
          // The runner fills whichever copy it finds first. If it filled this
          // one and left the block empty, the block takes this copy instead.
          const blockPlaceholder = existing.querySelector(
            "[data-stimulus-idref]",
          );
          if (
            blockPlaceholder &&
            !blockPlaceholder.childElementCount &&
            placeholder.childElementCount
          ) {
            existing.replaceChild(placeholder, blockPlaceholder);
            return;
          }
          placeholder.setAttribute("data-stimulus-duplicate", "true");
          return;
        }

        const block = itemRef.ownerDocument.createElement("div");
        block.setAttribute(BLOCK_ATTR, stimulusId);
        // A chapter heading introduces the source as much as the questions, so
        // it moves up with it rather than being stranded in between.
        const sectionTitle = itemRef.getAttribute("data-source-section-title");
        if (itemRef.hasAttribute("data-section-start") && sectionTitle) {
          block.setAttribute("data-section-start", "true");
          block.setAttribute("data-source-section-title", sectionTitle);
          itemRef.removeAttribute("data-section-start");
        }
        block.appendChild(placeholder);
        itemRef.parentNode?.insertBefore(block, itemRef);
        blocks.set(stimulusId, block);
      });
  });

  // A source whose questions are no longer on the page. Classic mode renders
  // one section at a time, so every block from a section the reader has left
  // would otherwise sit there holding a stale copy of a reading text, kept out
  // of sight only by whatever hides its section.
  blocks.forEach((block, stimulusId) => {
    if (!claimed.has(stimulusId)) dropBlock(block);
  });
};

/** Scroll one question of the booklet page into view. */
export const scrollToBookletItem = (
  testContainer: HTMLElement | null,
  itemRefIdentifier: string,
  behavior: ScrollBehavior = "smooth",
): boolean => {
  const root = bookletRoot(testContainer);
  const target = root?.querySelector(
    `qti-assessment-item-ref[identifier="${CSS.escape(itemRefIdentifier)}"]`,
  );
  if (!target) return false;
  target.scrollIntoView({ behavior, block: "start" });
  return true;
};

/**
 * Mark which question the reader is on, so the nav bar and the page agree.
 *
 * On a page where everything is visible at once there is no "current item" the
 * runner can tell us about, so it is whichever card is nearest the top of the
 * scroller. Returns a cleanup function.
 */
export const observeBookletScroll = (
  testContainer: HTMLElement | null,
  scrollContainer: HTMLElement | null,
  onActiveItemChange: (itemRefIdentifier: string) => void,
): (() => void) => {
  const root = bookletRoot(testContainer);
  if (!root || !scrollContainer) return () => undefined;

  let frame = 0;
  let lastActive = "";

  const update = () => {
    frame = 0;
    const items = renderedItemRefs(root);
    if (items.length === 0) return;

    const containerTop = scrollContainer.getBoundingClientRect().top;
    // The card that has crossed the top edge most recently: the last one whose
    // top is still above the fold, falling back to the first card while the
    // reader is above question 1 (on the intro, say).
    let active = items[0];
    for (const item of items) {
      if (item.getBoundingClientRect().top - containerTop <= 24) {
        active = item;
      } else {
        break;
      }
    }

    const identifier = active.getAttribute("identifier") ?? "";
    items.forEach((item) => {
      if (item === active) item.setAttribute("data-question-current", "");
      else item.removeAttribute("data-question-current");
    });

    if (identifier && identifier !== lastActive) {
      lastActive = identifier;
      onActiveItemChange(identifier);
    }
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };

  scrollContainer.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    scrollContainer.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
};
