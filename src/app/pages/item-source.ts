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
 * The interaction each example is built around. The editor's example list is
 * filtered on this, so an example can only be offered there once the editor can
 * actually round-trip its interaction.
 */
type ExampleItem = {
  name: string;
  href: string;
  current: boolean;
  interaction: string;
};

const EXAMPLES: ExampleItem[] = [
  // { name: "adaptive", href: "/adaptive.xml", current: false, interaction: "qti-choice-interaction" },
  {
    name: "associate",
    href: "/associate.xml",
    current: false,
    interaction: "qti-associate-interaction",
  },
  {
    name: "choice",
    href: "/choice.xml",
    current: true,
    interaction: "qti-choice-interaction",
  },
  {
    name: "extended text",
    href: "/extended_text.xml",
    current: false,
    interaction: "qti-extended-text-interaction",
  },
  {
    name: "gap match",
    href: "/gap-match.xml",
    current: false,
    interaction: "qti-gap-match-interaction",
  },
  {
    name: "graphic gap match",
    href: "/graphic_gap_match.xml",
    current: false,
    interaction: "qti-graphic-gap-match-interaction",
  },
  {
    name: "graphic order",
    href: "/graphic_order.xml",
    current: false,
    interaction: "qti-graphic-order-interaction",
  },
  {
    name: "hottext",
    href: "/hottext.xml",
    current: false,
    interaction: "qti-hottext-interaction",
  },
  // { name: "hotspot", href: "/hotspot.xml", current: false, interaction: "qti-hotspot-interaction" },
  {
    name: "inline choice",
    href: "/inline_choice.xml",
    current: false,
    interaction: "qti-inline-choice-interaction",
  },
  {
    name: "inline choice math",
    href: "/inline_choice_math.xml",
    current: false,
    interaction: "qti-inline-choice-interaction",
  },
  {
    name: "match",
    href: "/match.xml",
    current: false,
    interaction: "qti-match-interaction",
  },
  {
    name: "order",
    href: "/order.xml",
    current: false,
    interaction: "qti-order-interaction",
  },
  {
    name: "select point",
    href: "/select_point.xml",
    current: false,
    interaction: "qti-select-point-interaction",
  },
  {
    name: "text entry",
    href: "/text_entry.xml",
    current: false,
    interaction: "qti-text-entry-interaction",
  },
  // A template-processing showcase rather than an interaction showcase: the
  // editor has no ProseMirror node for template declarations, so it stays out
  // of the editor list below.
  {
    name: "mc_stat2",
    href: "/mc_stat2.xml",
    current: false,
    interaction: "qti-template-processing",
  },
];

/**
 * Interactions the QTI editor can import and write back, mirroring
 * `listInteractionDescriptors()` in @citolab/prose-qti. Kept as a plain list
 * rather than read from the package so that loading the /edit page's example
 * menu does not pull the editor bundle into the main chunk; the editor asserts
 * the two still agree in dev — see `unsupported-interactions.ts`.
 */
export const EDITOR_SUPPORTED_INTERACTIONS = [
  "qti-choice-interaction",
  "qti-extended-text-interaction",
  "qti-gap-match-interaction",
  "qti-hottext-interaction",
  "qti-inline-choice-interaction",
  "qti-match-interaction",
  "qti-order-interaction",
  "qti-select-point-interaction",
  "qti-text-entry-interaction",
];

/** Every example, for the preview player, which renders all of them. */
export const ALL_EXAMPLE_ITEMS: ExampleItem[] = EXAMPLES;

/** Only what the editor can open without dropping part of the item. */
export const EDITOR_EXAMPLE_ITEMS: ExampleItem[] = EXAMPLES.filter((example) =>
  EDITOR_SUPPORTED_INTERACTIONS.includes(example.interaction),
);
