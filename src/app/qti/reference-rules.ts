/**
 * Pluggable rules that recognise a question's reference to its reading text,
 * e.g. "(r. 1 en 2)", "(alinea 2 en 3)", "eerste alinea".
 *
 * To add a recogniser, write a `ReferenceRule` and add it to `referenceRules`.
 *
 * Adapted from `referenceRules.ts` in cito-test-uit (itself from the
 * qti-peiling-playground `clickrules.ts`). Unlike there, rules only read: the
 * reference text stays in the question, because the playground shows items as
 * authored, and a read-only scan can run again on every re-render.
 */

export interface StimulusReference {
  /** The question element that contained the reference. */
  element: Element;
  /** [start, end] line/paragraph numbers in the stimulus (1-based, inclusive). */
  numArray: [number, number];
  /** [startText, endText] snippets from a `Lees: "X … Y"` style hint. */
  texts: [string | undefined, string | undefined];
  /** Set when the reference lives inside a specific answer option. */
  choiceIdentifier?: string;
  kind: "line" | "paragraph";
}

export interface ReferenceRule {
  name: string;
  /** Return a reference when `element` contains a match, else null. */
  match: (element: Element) => StimulusReference | null;
}

const lineNumberRegex =
  /\(r\. (\d+) en (\d+)\)|\(r\. (\d+)\)|\(r\. (\d+)\s*-\s*(\d+)\)|\(r\. (\d+) t\/m (\d+)\)|regel (\d+)-(\d+)/g;

const alineaRegex =
  /([Aa]linea\s(\d+)\st\/m\s(\d+)|[Aa]linea\s(\d+)\s(?:en\s(\d+))?|[Aa]linea\s(\d+)|(?:eerste|tweede|derde|vierde|vijfde|zesde|zevende|achtste|negende|tiende)\salinea)/g;

const ordinalMap: Record<string, number> = {
  eerste: 1,
  tweede: 2,
  derde: 3,
  vierde: 4,
  vijfde: 5,
  zesde: 6,
  zevende: 7,
  achtste: 8,
  negende: 9,
  tiende: 10,
};

/** Extract the `Lees: "X … Y"` start/end snippets used to narrow the range. */
function extractTexts(element: Element): [string | undefined, string | undefined] {
  const text = element.textContent ?? "";
  const startTextMatch = text.match(/\b[A-Z][^.]*?(?:…|\.\.\.)/g);
  const endTextMatch = text.match(/(?:…|\.\.\.).*?(\.|,|!|\?|…|\()/g);
  const altTextMatch = text.match(/.*?\(/g);

  let startText = startTextMatch?.[0]?.trim() ?? altTextMatch?.[0]?.trim();
  let endText = endTextMatch?.[0] ?? altTextMatch?.[0]?.trim();

  for (const strip of ["Lees:", "Uit:", "...", "…", "(", ")"]) {
    startText = startText?.replace(strip, "").trim();
    endText = endText?.replace(strip, "").trim();
  }
  return [startText, endText];
}

const asPair = (nums: number[]): [number, number] =>
  nums.length === 1 ? [nums[0], nums[0]] : [nums[0], nums[nums.length - 1]];

const choiceOf = (element: Element) =>
  element.closest("qti-simple-choice")?.getAttribute("identifier") ?? undefined;

/** Line references: "(r. 5)", "(r. 1 en 2)", "(r. 3-7)", "(r. 3 t/m 7)", "regel 3-7". */
export const lineNumberRule: ReferenceRule = {
  name: "lineNumber",
  match(element) {
    const text = element.textContent ?? "";
    lineNumberRegex.lastIndex = 0;
    const match = lineNumberRegex.exec(text);
    if (!match) return null;
    const nums = match
      .slice(1)
      .map((n) => parseInt(n, 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return null;
    return {
      element,
      numArray: asPair(nums),
      texts: extractTexts(element),
      choiceIdentifier: choiceOf(element),
      kind: "line",
    };
  },
};

/** Paragraph references: "alinea 2 en 3", "alinea 4 t/m 6", "eerste alinea". */
export const alineaRule: ReferenceRule = {
  name: "alinea",
  match(element) {
    const text = element.textContent ?? "";
    const nums = [...text.matchAll(alineaRegex)]
      .flatMap((m) => {
        const ordinal = ordinalMap[m[0].toLowerCase().split(" ")[0]];
        if (ordinal) return [ordinal];
        return m
          .slice(1)
          .map((n) => parseInt(n, 10))
          .filter((n) => !isNaN(n));
      })
      .sort((a, b) => a - b);
    if (nums.length === 0) return null;
    return {
      element,
      numArray: asPair(nums),
      texts: extractTexts(element),
      choiceIdentifier: choiceOf(element),
      kind: "paragraph",
    };
  },
};

/** Active recognisers, in priority order. */
export const referenceRules: ReferenceRule[] = [lineNumberRule, alineaRule];
