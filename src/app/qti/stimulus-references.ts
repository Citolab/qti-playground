/**
 * Click a question that refers to its reading text ("(r. 1 en 2)", "alinea 2")
 * and the reference and the lines it names light up, in the question and in the
 * text. Hovering another question previews its reference; leaving it puts the
 * clicked one back.
 *
 * Lines are the `<li>` children of the stimulus's `<ol>`, Cito's line-numbered
 * reading text; a paragraph reference falls back to the text's `<p>` elements
 * when there is no such list.
 *
 * Works on whatever is rendered: a shared source lifted into its own block
 * (booklet pages, see booklet.ts) or a stimulus still inside its question.
 * Highlights use the CSS Custom Highlight API, so the DOM is never touched and
 * the scan is safe to re-run after every render.
 *
 * Adapted from `applyStimulusReferences.ts` in cito-test-uit.
 */
import { referenceRules, type StimulusReference } from "./reference-rules";
import { bookletRoot } from "./booklet";

export const RULES_HIGHLIGHT = "rules-highlight";

/** Styles the highlight; goes into <test-container>'s shadow root. */
export const stimulusReferenceCss = `::highlight(${RULES_HIGHLIGHT}) { background-color: #fde68a; color: inherit; }`;

const supportsHighlightApi = (): boolean =>
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

/** Inline markup a reference can sit inside without stopping the scan. */
const inlineTags = new Set(["em", "br", "strong", "i", "b", "span"]);

function textNodesOf(element: Node): Text[] {
  const out: Text[] = [];
  const walker = element.ownerDocument!.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if ((node.textContent ?? "").trim() !== "") out.push(node as Text);
  }
  return out;
}

/** Every reference in a question, its reading text excluded. */
function collectReferences(itemRef: Element): StimulusReference[] {
  const references: StimulusReference[] = [];
  itemRef.querySelectorAll("*").forEach((element) => {
    if (element.closest("[data-stimulus-idref]")) return;
    const isLeaf = Array.from(element.children).every((child) =>
      inlineTags.has(child.localName),
    );
    if (!isLeaf) return;
    for (const rule of referenceRules) {
      const reference = rule.match(element);
      if (reference) references.push(reference);
    }
  });
  return references;
}

/** The reference text itself, narrowed to the `Lees: "X … Y"` hint if there is one. */
function sourceRange(element: Element, texts: StimulusReference["texts"]): Range {
  const range = new Range();
  range.selectNodeContents(element);
  const [start, end] = texts;
  if (!start || !end) return range;
  const nodes = textNodesOf(element);
  if (nodes.length === 0) return range;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const startIndex = first.textContent!.indexOf(start);
  const endIndex = last.textContent!.indexOf(end);
  if (startIndex === -1 || endIndex === -1) return range;
  range.setStart(first, startIndex);
  range.setEnd(last, endIndex + end.length);
  return range;
}

/** The lines (or paragraphs) a reference names, inside one reading text. */
function targetRange(stimulus: Element, reference: StimulusReference): Range | null {
  const [start, end] = reference.numArray;
  const list = stimulus.querySelector("qti-stimulus-body ol") ?? stimulus.querySelector("ol");
  let units: Element[] = list ? Array.from(list.querySelectorAll(":scope > li")) : [];
  if (units.length === 0 && reference.kind === "paragraph") {
    units = Array.from(stimulus.querySelectorAll("qti-stimulus-body p, p"));
  }
  if (units.length === 0) return null;

  const startUnit = units[start - 1];
  const endUnit = units[end - 1];
  if (!startUnit || !endUnit) return null;
  const startNodes = textNodesOf(startUnit);
  const endNodes = textNodesOf(endUnit);
  if (startNodes.length === 0 || endNodes.length === 0) return null;

  let startNode: Text = startNodes[0];
  let startOffset = 0;
  let endNode: Text = endNodes[endNodes.length - 1];
  let endOffset = endNode.textContent!.length;

  // Narrow to the quoted start/end words when the question gives them,
  // dropping words from the far end until something matches.
  let [startText, endText] = reference.texts;
  for (const node of startNodes) {
    if (!startText) break;
    const text = node.textContent!.toLowerCase();
    let index = text.indexOf(startText.toLowerCase());
    while (index === -1 && startText.includes(" ")) {
      startText = startText.substring(0, startText.lastIndexOf(" ")).trim();
      index = text.indexOf(startText.toLowerCase());
    }
    if (index > -1) {
      startNode = node;
      startOffset = index;
      break;
    }
  }
  for (const node of endNodes) {
    if (!endText) break;
    const text = node.textContent!.toLowerCase();
    let index = text.indexOf(endText.toLowerCase());
    while (index === -1 && endText.includes(" ")) {
      endText = endText.substring(endText.indexOf(" ") + 1).trim();
      index = text.indexOf(endText.toLowerCase());
    }
    if (index > -1) {
      endNode = node;
      endOffset = index + endText.length;
    }
  }

  const range = new Range();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range.collapsed ? null : range;
}

/**
 * The reading text a question refers to: the lifted block for its stimulus on
 * a booklet page, else the stimulus rendered inside the question.
 */
function readingTextFor(root: ParentNode, itemRef: Element): Element | null {
  const placeholder = itemRef.querySelector("[data-stimulus-idref]");
  // The question whose copy was lifted into the block has no placeholder left,
  // so its stimulus ref is what names the source.
  const id =
    placeholder?.getAttribute("data-stimulus-idref") ??
    itemRef.querySelector("qti-assessment-stimulus-ref")?.getAttribute("identifier");
  if (id) {
    const block = root.querySelector(
      `[data-shared-stimulus-block="${CSS.escape(id)}"]`,
    );
    if (block) return block;
  }
  return placeholder?.childElementCount ? placeholder : null;
}

/** Scroll a reading text that scrolls on its own, when every target is out of view. */
function scrollIntoReadingText(container: Element, ranges: Range[]): void {
  if (container.scrollHeight <= container.clientHeight) return;
  const box = container.getBoundingClientRect();
  const tops = ranges.map((range) => range.getBoundingClientRect());
  const allAbove = tops.every((rect) => rect.top < box.top);
  const allBelow = tops.every((rect) => rect.bottom > box.bottom);
  if (allAbove || allBelow) {
    container.scrollTo({
      top: container.scrollTop + tops[0].top - box.top - 20,
      behavior: "smooth",
    });
  }
}

/**
 * Wire the questions currently rendered in `testContainer`. Returns a cleanup.
 * `pinned` carries the clicked question across re-runs, so a re-render does
 * not drop the highlight the reader asked for.
 */
export function applyStimulusReferences(
  testContainer: HTMLElement | null,
  pinned: { current: string | null },
): () => void {
  const root = bookletRoot(testContainer);
  if (!root || !supportsHighlightApi()) return () => undefined;

  type Wired = { itemRef: Element; references: StimulusReference[]; text: Element };
  const wired = new Map<string, Wired>();

  const clear = () => CSS.highlights.delete(RULES_HIGHLIGHT);

  const highlight = (id: string, scroll: boolean): boolean => {
    const entry = wired.get(id);
    if (!entry) return false;
    // A reference inside an answer option only counts once that option is
    // chosen -- or while nothing is chosen yet.
    const item = entry.itemRef.querySelector("qti-assessment-item") as
      | (Element & { getResponse?: (id: string) => { value?: unknown } | undefined })
      | null;
    const response = item?.getResponse?.("RESPONSE")?.value;
    const active = entry.references.filter(
      (r) => !r.choiceIdentifier || !response || response === r.choiceIdentifier,
    );
    const targets = active
      .map((r) => targetRange(entry.text, r))
      .filter((r): r is Range => r !== null);
    if (targets.length === 0) return false;
    const sources = active.map((r) => sourceRange(r.element, r.texts));
    const set = new Highlight(...sources, ...targets);
    set.priority = 1;
    CSS.highlights.set(RULES_HIGHLIGHT, set);
    if (scroll) scrollIntoReadingText(entry.text, targets);
    return true;
  };

  const cleanups: (() => void)[] = [];
  root.querySelectorAll("qti-assessment-item-ref").forEach((itemRef) => {
    const id = itemRef.getAttribute("identifier");
    if (!id || !itemRef.querySelector("qti-assessment-item")) return;
    const text = readingTextFor(root, itemRef);
    if (!text) return;
    const references = collectReferences(itemRef);
    if (references.length === 0) return;
    wired.set(id, { itemRef, references, text });

    const onClick = () => {
      if (highlight(id, true)) pinned.current = id;
    };
    const onEnter = () => highlight(id, false);
    const onLeave = () => {
      if (pinned.current && pinned.current !== id && wired.has(pinned.current)) {
        highlight(pinned.current, false);
      } else if (pinned.current !== id) {
        clear();
      }
    };
    itemRef.addEventListener("click", onClick);
    itemRef.addEventListener("mouseenter", onEnter);
    itemRef.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      itemRef.removeEventListener("click", onClick);
      itemRef.removeEventListener("mouseenter", onEnter);
      itemRef.removeEventListener("mouseleave", onLeave);
    });
  });

  // Restore what the reader had pinned, if that question is still on screen.
  if (!pinned.current || !highlight(pinned.current, false)) clear();

  return () => {
    cleanups.forEach((fn) => fn());
    clear();
  };
}
