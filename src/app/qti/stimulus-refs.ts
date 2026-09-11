/**
 * Shared stimuli: finding them, and splitting an item away from the one it
 * references.
 *
 * A booklet question that belongs to a reading text or a figure carries that
 * source by reference, not by value:
 *
 *   <qti-assessment-stimulus-ref identifier="_86be…" href="Stimulus/86be….xml"/>
 *   <qti-item-body>
 *     <div class="qti-layout-row">
 *       <div class="qti-layout-col6">
 *         <div class="qti-shared-stimulus" data-stimulus-idref="_86be…"></div>
 *       </div>
 *       <div class="qti-layout-col6"> …the question… </div>
 *     </div>
 *   </qti-item-body>
 *
 * qti-components fetches the stimulus at render time and fills every
 * placeholder that names it. That is right for a single item on its own screen
 * and wrong everywhere else: in a thumbnail the reading text fills the frame and
 * pushes the question — the thing the thumbnail exists to show — out of sight,
 * and on a booklet page the same text is repeated once per question.
 *
 * Adapted from `packages/ui/src/qti/stimulusDoc.ts` in cito-test-uit.
 */

/** Placeholder marking where qti-components will inject a shared stimulus. */
const PLACEHOLDER_SELECTOR = "[data-stimulus-idref]";
/** The item's declaration of which stimulus to fetch. */
const REF_SELECTOR = "qti-assessment-stimulus-ref";
/** Cito's booklet layout wraps each side of a question in a `qti-layout-col*`. */
const COLUMN_SELECTOR = '[class*="qti-layout-col"]';

export interface StimulusRef {
  /** Matches the `data-stimulus-idref` of the placeholder it fills. */
  identifier: string;
  /** Path to the stimulus XML, when the item declares one. */
  href: string | null;
}

const queryPlaceholders = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(PLACEHOLDER_SELECTOR));

/**
 * The column a placeholder owns outright, if any.
 *
 * "Outright" means the column holds nothing but the placeholder — the shape the
 * booklet layout produces, and the only shape where dropping the column cannot
 * take question content with it. A column that mixes the placeholder with other
 * content belongs to the question, so it has no owning column and every caller
 * below falls back to leaving the layout alone.
 */
const owningColumn = (placeholder: HTMLElement): HTMLElement | null => {
  const parent = placeholder.parentElement;
  if (!parent?.matches(COLUMN_SELECTOR)) return null;
  const hasSiblingElement = Array.from(parent.children).some(
    (child) => child !== placeholder,
  );
  const hasOwnText = Array.from(parent.childNodes).some(
    (node) =>
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent ?? "").trim() !== "",
  );
  return hasSiblingElement || hasOwnText ? null : parent;
};

/** Let a column that has lost its neighbour use the full width. */
const stretchColumn = (column: HTMLElement): void => {
  column.style.flex = "1 1 100%";
  column.style.width = "100%";
  column.style.maxWidth = "100%";
};

/**
 * The stimuli this document places, in document order.
 *
 * Empty for a standalone question, which is the common case — callers use that
 * to decide whether a separate "source" card is worth drawing at all.
 */
export const findStimulusRefs = (
  doc: ParentNode | null | undefined,
): StimulusRef[] => {
  if (!doc) return [];

  const hrefByIdentifier = new Map<string, string | null>();
  doc.querySelectorAll(REF_SELECTOR).forEach((ref) => {
    const identifier = ref.getAttribute("identifier")?.trim();
    if (identifier) {
      hrefByIdentifier.set(identifier, ref.getAttribute("href"));
    }
  });

  // The placeholder is what actually renders, so it decides both the order and
  // which declarations matter; an item may declare a stimulus it never places.
  const seen = new Set<string>();
  const refs: StimulusRef[] = [];
  queryPlaceholders(doc).forEach((placeholder) => {
    const identifier =
      placeholder.getAttribute("data-stimulus-idref")?.trim() ?? "";
    if (!identifier || seen.has(identifier)) return;
    seen.add(identifier);
    refs.push({ identifier, href: hrefByIdentifier.get(identifier) ?? null });
  });
  return refs;
};

/**
 * The item without its shared stimulus — the question, at the width of the card
 * it is drawn in.
 *
 * The `qti-assessment-stimulus-ref` goes too, so the runtime never fetches the
 * text it is no longer going to show. Returns a clone; the input is left alone.
 */
export const withoutStimulus = (doc: DocumentFragment): DocumentFragment => {
  const clone = doc.cloneNode(true) as DocumentFragment;

  queryPlaceholders(clone).forEach((placeholder) => {
    const column = owningColumn(placeholder);
    if (!column) {
      placeholder.remove();
      return;
    }
    const row = column.parentElement;
    column.remove();
    row
      ?.querySelectorAll<HTMLElement>(`:scope > ${COLUMN_SELECTOR}`)
      .forEach(stretchColumn);
  });

  clone.querySelectorAll(REF_SELECTOR).forEach((ref) => ref.remove());
  return clone;
};

/**
 * Just the shared stimulus, as an item document that can go through the same
 * preview components as a question.
 *
 * Everything in the body outside the placeholder's own column is dropped — for a
 * booklet question that is the question itself, leaving a fragment whose only
 * content is the source. The `qti-assessment-stimulus-ref` is deliberately kept:
 * it is what makes qti-components fetch the text in the first place.
 *
 * Null when the document places no shared stimulus, or when the placeholder
 * shares its column with the question and so cannot be separated.
 */
export const stimulusOnly = (
  doc: DocumentFragment,
): DocumentFragment | null => {
  const clone = doc.cloneNode(true) as DocumentFragment;
  const placeholder = queryPlaceholders(clone)[0];
  if (!placeholder) return null;
  const column = owningColumn(placeholder);
  if (!column) return null;

  const row = column.parentElement;
  row
    ?.querySelectorAll<HTMLElement>(`:scope > ${COLUMN_SELECTOR}`)
    .forEach((sibling) => {
      if (sibling !== column) sibling.remove();
    });
  stretchColumn(column);

  // A later placeholder for a *different* stimulus would pull in a second
  // source that belongs to a different group of questions.
  queryPlaceholders(clone).forEach((other) => {
    if (other !== placeholder) other.remove();
  });

  // Nothing here is answerable, and an interaction left in the body would
  // render inputs the reader cannot use.
  clone
    .querySelectorAll('[class*="qti-layout-row"] :is([response-identifier])')
    .forEach((interaction) => interaction.remove());

  return clone;
};

/**
 * Which stimulus each item places, read straight from the item XML.
 *
 * Needed *before* anything renders: the grouping transform has to restructure
 * the test document, and the overview has to know how many cards to draw. Both
 * run before the runtime has fetched a single item, so the only source of truth
 * is the XML itself.
 *
 * Keyed by whatever key the caller supplies (item-ref identifier in the test,
 * item identifier in the overview) so the result drops straight into a lookup.
 * Items whose XML cannot be fetched are simply absent — a missing entry means
 * "no shared stimulus", which is also the safe fallback.
 */
export const loadStimulusIdsByKey = async (
  items: { key: string; href: string }[],
  signal?: AbortSignal,
): Promise<Map<string, string[]>> => {
  const parser = new DOMParser();
  // Several item-refs commonly point at one file (and a booklet's items sit in
  // one directory), so fetch each distinct href once.
  const byHref = new Map<string, Promise<string[]>>();

  const readOne = async (href: string): Promise<string[]> => {
    try {
      const response = await fetch(href, { signal });
      if (!response.ok) return [];
      const xml = parser.parseFromString(await response.text(), "text/xml");
      return findStimulusRefs(xml).map((ref) => ref.identifier);
    } catch {
      return [];
    }
  };

  const entries = await Promise.all(
    items.map(async ({ key, href }) => {
      if (!href) return [key, [] as string[]] as const;
      let pending = byHref.get(href);
      if (!pending) {
        pending = readOne(href);
        byHref.set(href, pending);
      }
      return [key, await pending] as const;
    }),
  );

  const result = new Map<string, string[]>();
  for (const [key, ids] of entries) {
    if (ids.length > 0) result.set(key, ids);
  }
  return result;
};

/**
 * Stimuli that more than one item places — the ones worth grouping.
 *
 * A stimulus used by a single item needs no section of its own: that item
 * already shows it, once, on its own screen.
 */
export const sharedStimulusIds = (
  stimulusIdsByKey: ReadonlyMap<string, string[]>,
): Set<string> => {
  const counts = new Map<string, number>();
  stimulusIdsByKey.forEach((ids) => {
    // Only the first placed stimulus decides an item's group; an item that
    // places two would otherwise want to be in two sections at once.
    const primary = ids[0];
    if (!primary) return;
    counts.set(primary, (counts.get(primary) ?? 0) + 1);
  });
  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
  );
};
