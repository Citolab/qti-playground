/**
 * 3D variants of the standard QTI interactions, as extended web components.
 *
 * qti-components lets a host rename an interaction's tag with a suffix
 * (`extendElementName("qti-choice-interaction", "3d")`) and register its own
 * class under the new name. That is what happens here: every class below is a
 * subclass of the real interaction (`QtiChoiceInteraction`, ...), so it still
 * registers with its `qti-assessment-item`, still owns the response variable
 * and still validates. What it adds is the 3D side:
 *
 *  - `arenaSpec()` describes the interaction, read from its own attributes and
 *    children, so the game can build a stage for it;
 *  - `answer(value)` takes what the child jumped on and stores it the way any
 *    answer is stored: through the interaction's own `response` and
 *    `saveResponse`.
 *
 * The item then scores itself with its own response processing. Nothing in the
 * game decides what is right.
 */
import {
  QtiChoiceInteraction,
  QtiGapMatchInteraction,
  QtiGraphicGapMatchInteraction,
  QtiHotspotInteraction,
  QtiInlineChoiceInteraction,
  QtiMatchInteraction,
  QtiOrderInteraction,
  QtiSelectPointInteraction,
  QtiSliderInteraction,
  QtiTextEntryInteraction,
} from "@citolab/qti-components";
import { DIGITS, GAP_MARK, LETTERS, richHtml, type Area, type ArenaSpec, type Choice, type Picture } from "./arena";

export const SUFFIX_3D = "3d";

export interface Arena3dInteraction extends HTMLElement {
  /** Whether the item has handed this interaction its response declaration yet. */
  arenaReady(): boolean;
  arenaSpec(): ArenaSpec;
  /** The declared correct response, for "show answer". Empty when the item declares none. */
  correctValues(): string[];
  answer(value: string | string[]): void;
}

type InteractionBase = HTMLElement & {
  response: string | string[] | null;
  saveResponse(value: string | string[]): void;
  responseVariable?: {
    baseType?: string;
    correctResponse?: string | string[] | null;
    mapping?: { mapEntries?: { mapKey: string }[] };
  };
};

const label = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();

const choicesOf = (root: Element, tag: string): Choice[] =>
  Array.from(root.querySelectorAll(tag)).map((c) => {
    const matchMax = c.getAttribute("match-max");
    return {
      id: c.getAttribute("identifier") ?? "",
      label: label(c),
      html: richHtml(c),
      ...(matchMax !== null && /^\d+$/.test(matchMax) ? { matchMax: Number(matchMax) } : {}),
    };
  });

const asList = (value: string | string[] | null | undefined) =>
  value === null || value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

/**
 * Which pads a text entry needs. A number gets the digits (and a decimal point
 * or minus sign when an expected answer has one); anything else gets letters.
 * The answers the item declares decide: its base type alone cannot, because a
 * numeric answer is often declared as a string with a mapping.
 */
function entrySpec(el: InteractionBase): Partial<ArenaSpec> {
  const variable = el.responseVariable;
  const accepted = [
    ...asList(variable?.correctResponse),
    ...(variable?.mapping?.mapEntries ?? []).map((entry) => entry.mapKey),
  ];
  const numeric =
    variable?.baseType === "integer" ||
    variable?.baseType === "float" ||
    accepted.some((value) => /^-?\d+([.,]\d+)?$/.test(value.trim()));
  const has = (ch: string) => accepted.some((value) => value.includes(ch));
  const keys = numeric
    ? [...DIGITS, ...(variable?.baseType === "float" || has(".") ? ["."] : []), ...(has(",") ? [","] : []), ...(has("-") ? ["-"] : [])]
    : [...LETTERS, " "];
  const typeable = accepted.filter((value) => [...value.toLowerCase()].every((ch) => keys.includes(ch)));
  const longest = typeable.reduce((n, value) => Math.max(n, value.length), 0);
  return {
    kind: "entry",
    keys,
    accepted,
    maxLength: Math.min(14, Math.max(Number(el.getAttribute("expected-length")) || 4, longest)),
  };
}

const DEFAULTS: ArenaSpec = {
  kind: "choice",
  responseId: "RESPONSE",
  multiple: false,
  choices: [],
  targets: [],
  min: 0,
  max: 100,
  step: 1,
  keys: DIGITS,
  maxLength: 4,
  accepted: [],
  picture: null,
  areas: [],
  maxChoices: 1,
  tabular: false,
  correct: [],
};

/**
 * The picture of a hotspot or select-point interaction. Its `width` and
 * `height` attributes define the pixel grid the coords are written in.
 */
function pictureOf(el: HTMLElement): Picture | null {
  // Not a picture you carry (graphic gap match): those are choices, not the background.
  const image = Array.from(el.querySelectorAll("img, object")).find((candidate) => !candidate.closest("qti-gap-img"));
  if (!image) return null;
  const src = image.getAttribute("src") ?? image.getAttribute("data") ?? "";
  const width = Number(image.getAttribute("width")) || (image instanceof HTMLImageElement ? image.naturalWidth : 0);
  const height = Number(image.getAttribute("height")) || (image instanceof HTMLImageElement ? image.naturalHeight : 0);
  return src && width > 0 && height > 0 ? { src, width, height } : null;
}

const areaOf = (choice: Element): Area => ({
  id: choice.getAttribute("identifier") ?? "",
  shape: choice.getAttribute("shape") ?? "default",
  coords: (choice.getAttribute("coords") ?? "").split(",").map(Number).filter(Number.isFinite),
});

/** What there is to carry in a gap match: words, and in a graphic one usually pictures. */
const carriedOf = (el: Element): Choice[] => {
  const sources = Array.from(el.querySelectorAll("qti-gap-text, qti-gap-img"));
  return choicesOf(el, "qti-gap-text, qti-gap-img").map((choice, i) => {
    const img = sources[i].localName === "qti-gap-img" ? sources[i].querySelector("img") : null;
    const image = img?.getAttribute("src");
    return image ? { ...choice, label: choice.label || img?.getAttribute("alt") || "", image } : choice;
  });
};

/**
 * A few words on either side of a gap ("Three tickets cost ___ altogether"),
 * so a gap can be recognised where the text itself is out of sight: on a phone
 * the question card is small and the gaps are a list.
 */
function gapContext(gap: Element): string {
  const block = gap.closest("p, li, td, th, h1, h2, h3, h4") ?? gap.parentElement;
  if (!block) return "";
  let text = "";
  const read = (node: Node) => {
    if (node === gap) text += " \u0000 ";
    else if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      // Another gap in the same sentence is only hinted at; other QTI elements are not text.
      if (el.localName === "qti-gap") text += " … ";
      else if (!el.localName.startsWith("qti-")) el.childNodes.forEach(read);
    }
  };
  block.childNodes.forEach(read);
  const [before = "", after = ""] = text.split("\u0000").map((part) => part.replace(/\s+/g, " ").trim());
  const head = before ? before.split(" ").slice(-4) : [];
  const tail = after ? after.split(" ").slice(0, 3) : [];
  if (!head.length && !tail.length) return "";
  const cutBefore = before && head.join(" ").length < before.length ? "…" : "";
  const cutAfter = after && tail.join(" ").length < after.length ? "…" : "";
  return `${cutBefore}${head.join(" ")} ${GAP_MARK} ${tail.join(" ")}${cutAfter}`.replace(/ ([.,;:!?])/g, "$1").trim();
}

/** `max-choices`: left out it is 1, and 0 means no limit. */
const maxChoicesOf = (el: HTMLElement) => {
  const value = el.getAttribute("max-choices");
  return value !== null && /^\d+$/.test(value) ? Number(value) : 1;
};

function arena3d(
  Base: CustomElementConstructor,
  describe: (el: HTMLElement) => Partial<ArenaSpec>,
  /** How this interaction keeps a response internally, when that differs from what it saves. */
  held: (value: string | string[]) => string | string[] = (value) => value,
) {
  const Parent = Base as unknown as new () => InteractionBase;
  return class extends Parent implements Arena3dInteraction {
    #spec: ArenaSpec | null = null;

    arenaReady() {
      return this.responseVariable !== undefined;
    }

    arenaSpec(): ArenaSpec {
      // Read once: some interactions rearrange their children after rendering.
      this.#spec ??= {
        ...DEFAULTS,
        responseId: this.getAttribute("response-identifier") ?? "RESPONSE",
        ...describe(this),
      };
      return { ...this.#spec, correct: this.correctValues() };
    }

    correctValues(): string[] {
      return asList(this.responseVariable?.correctResponse);
    }

    answer(value: string | string[]) {
      this.response = held(value);
      this.saveResponse(value);
    }
  } as unknown as CustomElementConstructor;
}

const VARIANTS: [
  tag: string,
  base: CustomElementConstructor,
  describe: (el: HTMLElement) => Partial<ArenaSpec>,
  held?: (value: string | string[]) => string | string[],
][] = [
  [
    "qti-choice-interaction",
    QtiChoiceInteraction,
    (el) => ({
      kind: "choice",
      multiple: el.getAttribute("max-choices") !== "1",
      choices: choicesOf(el, "qti-simple-choice"),
    }),
  ],
  [
    "qti-inline-choice-interaction",
    QtiInlineChoiceInteraction,
    (el) => ({ kind: "choice", choices: choicesOf(el, "qti-inline-choice") }),
  ],
  ["qti-order-interaction", QtiOrderInteraction, (el) => ({ kind: "order", choices: choicesOf(el, "qti-simple-choice") })],
  [
    "qti-match-interaction",
    QtiMatchInteraction,
    (el) => {
      const sets = Array.from(el.querySelectorAll("qti-simple-match-set"));
      const choices = sets[0] ? choicesOf(sets[0], "qti-simple-associable-choice") : [];
      const targets = sets[1] ? choicesOf(sets[1], "qti-simple-associable-choice") : [];
      // A table when the author asked for one, or when the columns are answers that
      // serve several rows (true/false, yes/no) -- as long as it fits on the floor.
      const fits = choices.length > 0 && choices.length <= 6 && targets.length > 0 && targets.length <= 5;
      const tabular =
        fits && (el.classList.contains("qti-match-tabular") || targets.some((t) => t.matchMax !== undefined && t.matchMax !== 1));
      return { kind: "match", choices, targets, tabular };
    },
  ],
  [
    "qti-text-entry-interaction",
    QtiTextEntryInteraction,
    (el) => entrySpec(el as InteractionBase),
  ],
  [
    "qti-hotspot-interaction",
    QtiHotspotInteraction,
    (el) => ({
      kind: "hotspot",
      multiple: maxChoicesOf(el) !== 1,
      maxChoices: maxChoicesOf(el),
      picture: pictureOf(el),
      areas: Array.from(el.querySelectorAll("qti-hotspot-choice")).map(areaOf),
    }),
  ],
  [
    // Carry: the words are picked up and put into the gaps of the text.
    "qti-gap-match-interaction",
    QtiGapMatchInteraction,
    (el) => ({
      kind: "gap",
      choices: carriedOf(el),
      // A gap has no text of its own: it is known by its number, in reading order.
      targets: Array.from(el.querySelectorAll("qti-gap")).map((gap, i) => ({
        id: gap.getAttribute("identifier") ?? "",
        label: String(i + 1),
        context: gapContext(gap),
      })),
    }),
  ],
  [
    // The same, and the gaps are hotspots on the picture.
    "qti-graphic-gap-match-interaction",
    QtiGraphicGapMatchInteraction,
    (el) => {
      const choices = carriedOf(el);
      const hotspots = Array.from(el.querySelectorAll("qti-associable-hotspot"));
      const picture = pictureOf(el);
      return {
        kind: "gap",
        choices,
        targets: choicesOf(el, "qti-associable-hotspot").map((target, i) => ({ ...target, label: String(i + 1) })),
        picture: picture && { ...picture, shelf: choices.length },
        areas: hotspots.map(areaOf),
      };
    },
  ],
  [
    "qti-select-point-interaction",
    QtiSelectPointInteraction,
    (el) => ({ kind: "point", multiple: maxChoicesOf(el) !== 1, maxChoices: maxChoicesOf(el), picture: pictureOf(el) }),
    // The element keeps its points as a list, also when the response is a single point.
    (value) => (Array.isArray(value) ? value : value ? [value] : []),
  ],
  [
    "qti-slider-interaction",
    QtiSliderInteraction,
    (el) => ({
      kind: "slider",
      min: Number(el.getAttribute("lower-bound") ?? 0),
      max: Number(el.getAttribute("upper-bound") ?? 100),
      step: Number(el.getAttribute("step")) || 1,
    }),
  ],
];

/** The interaction tags that have a 3D variant. */
export const ARENA_TAGS = VARIANTS.map(([tag]) => tag);

/** Defines `<tag>-3d` for every supported interaction. Safe to call more than once. */
export function registerArenaInteractions() {
  for (const [tag, base, describe, held] of VARIANTS) {
    const name = `${tag}-${SUFFIX_3D}`;
    if (!customElements.get(name)) customElements.define(name, arena3d(base, describe, held));
  }
}

export const isArenaInteraction = (el: Element | null | undefined): el is Arena3dInteraction =>
  !!el && typeof (el as Partial<Arena3dInteraction>).arenaSpec === "function";
