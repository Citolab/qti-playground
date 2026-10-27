/**
 * Shared plumbing for the two item surfaces: /edit (QTI editor) and /preview
 * (XML + player). Both load the same store item, share the same `sharedQti`
 * links and offer the same example list, so the helpers live here rather than
 * being duplicated per page.
 */

export const encodeXmlToShareParam = (xml: string) => {
  const bytes = new TextEncoder().encode(xml);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return encodeURIComponent(window.btoa(binary));
};

export const decodeSharedParamToXml = (encoded: string) => {
  const binary = window.atob(decodeURIComponent(encoded));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const buildShareUrl = (xml: string, pathname = "/preview") => {
  const shareUrl = new URL(window.location.href);
  shareUrl.pathname = pathname;
  shareUrl.search = `sharedQti=${encodeXmlToShareParam(xml)}`;
  return shareUrl.toString();
};

/**
 * The interaction each example is built around. It pre-filters the editor's
 * example list — cheaply ruling out an example whose interaction the editor
 * cannot represent, before `useEditorExamples()` reads the survivors and asks
 * the gate itself.
 */
export type ExampleItem = {
  name: string;
  /** The example package the item belongs to, for grouping the menu. */
  group: string;
  href: string;
  current: boolean;
  interaction: string;
};

/**
 * The items of the showcase packages in `public/examples/` (see
 * app/examples/catalog.ts), offered one by one. `href` is the item's own URL,
 * so the editor and the preview resolve its images against its folder.
 */
const example = (
  group: string,
  pkg: string,
  file: string,
  name: string,
  interaction: string,
): ExampleItem => ({
  name,
  group,
  href: `/examples/${pkg}/${file}`,
  current: false,
  interaction,
});

const SOLAR = "Journey Through the Solar System";
const MATHS = "Everyday Maths";
const READING = "Reading Lab";

const EXAMPLES: ExampleItem[] = [
  example(SOLAR, "solar-system", "item-01.xml", "The Red Planet", "qti-choice-interaction"),
  example(SOLAR, "solar-system", "item-02.xml", "Lining up the planets", "qti-order-interaction"),
  example(SOLAR, "solar-system", "item-03.xml", "Planet facts", "qti-match-interaction"),
  example(SOLAR, "solar-system", "item-04.xml", "Lord of the rings", "qti-hotspot-interaction"),
  example(SOLAR, "solar-system", "item-05.xml", "Counting planets", "qti-text-entry-interaction"),
  example(SOLAR, "solar-system", "item-06.xml", "Once around the Sun", "qti-inline-choice-interaction"),
  example(SOLAR, "solar-system", "item-07.xml", "Day and night", "qti-extended-text-interaction"),
  example(MATHS, "everyday-maths", "item-01.xml", "Juice jug fractions", "qti-choice-interaction"),
  example(MATHS, "everyday-maths", "item-02.xml", "X marks the spot", "qti-select-point-interaction"),
  example(MATHS, "everyday-maths", "item-03.xml", "Pancakes for six", "qti-text-entry-interaction"),
  example(MATHS, "everyday-maths", "item-04.xml", "A trip to the cinema", "qti-gap-match-interaction"),
  example(MATHS, "everyday-maths", "item-05.xml", "Estimate the angle", "qti-slider-interaction"),
  example(MATHS, "everyday-maths", "item-06.xml", "From smallest to largest", "qti-order-interaction"),
  example(READING, "reading-lab", "item-01.xml", "A visitor in the storm", "qti-choice-interaction"),
  example(READING, "reading-lab", "item-02.xml", "Words in context", "qti-inline-choice-interaction"),
  example(READING, "reading-lab", "item-03.xml", "Tell the story in short", "qti-gap-match-interaction"),
  example(READING, "reading-lab", "item-04.xml", "Reading the dance", "qti-choice-interaction"),
  example(READING, "reading-lab", "item-05.xml", "Find the evidence", "qti-hottext-interaction"),
  example(READING, "reading-lab", "item-06.xml", "Dance like a bee", "qti-extended-text-interaction"),
];

/** Examples grouped by the package they come from, in the shape `Dropdown` takes. */
export const groupExamples = (items: ExampleItem[]) =>
  [SOLAR, MATHS, READING]
    .map((group) => ({
      name: group,
      items: items.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length > 0);

/**
 * Interactions the QTI editor can import and write back — the one list both the
 * example menu below and the editor's own gate read, so neither can go stale
 * against the other (`findUnsupportedItemFeatures` in
 * `unsupported-interactions.ts` refuses to open anything else).
 *
 * Deliberately NARROWER than `listInteractionDescriptors()` in
 * @citolab/prose-qti: that registry says which interactions have a ProseMirror
 * node, which is not the same as round-tripping without loss. An interaction
 * joins this list once it has been checked end to end — opened, edited, saved,
 * re-opened — not once it renders. The editor asserts in dev that every tag here
 * is at least registered upstream.
 *
 * Kept as a plain list rather than read from the package so that loading the
 * /edit page's example menu does not pull the editor bundle into the main chunk.
 *
 * Not listed because the scan never looks at them: `qti-rubric-block` (not an
 * interaction, and it round-trips), and the tabular variant of match, which
 * shares the `qti-match-interaction` tag.
 */
export const EDITOR_SUPPORTED_INTERACTIONS = [
  "qti-choice-interaction",
  "qti-inline-choice-interaction",
  "qti-match-interaction",
  "qti-order-interaction",
  "qti-select-point-interaction",
  "qti-text-entry-interaction",
];

/**
 * Blocks the editor can insert and write back.
 *
 * Kept apart from the interaction list because the gate never consults it: a
 * block does not end in `-interaction`, so `findUnsupportedItemFeatures` walks
 * straight past it and an unlisted block is simply left alone rather than
 * refused. The Insert menu does need it, to know which of the registry's
 * non-interaction nodes to offer.
 */
export const EDITOR_SUPPORTED_BLOCKS = ["qti-rubric-block"];

/** Every example, for the preview player, which renders all of them. */
export const ALL_EXAMPLE_ITEMS: ExampleItem[] = EXAMPLES;

/**
 * The examples whose interaction the editor can represent -- a pre-filter, not
 * the answer. It rules out an example by the one tag it is labelled with, which
 * cannot see what surrounds the interaction; `useEditorExamples()` reads each
 * survivor and drops any the editor would actually refuse.
 */
export const EDITOR_EXAMPLE_ITEMS: ExampleItem[] = EXAMPLES.filter((example) =>
  EDITOR_SUPPORTED_INTERACTIONS.includes(example.interaction),
);
