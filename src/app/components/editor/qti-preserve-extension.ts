import { defineNodeAttr, defineNodeSpec, union } from "prosekit/core";
import type { DOMOutputSpec } from "prosekit/pm/model";

/*
 * Item content the editor has no use for but must not lose. Every edit re-exports the whole item
 * from the ProseMirror document, so anything the schema has no slot for is gone on the first
 * keystroke -- which is why the round-trip guard (content-loss.ts) refuses to open such an item.
 * Each piece here gives one kind of content a slot, so it comes back out exactly as it went in.
 *
 * The shared-stimulus placeholder and the `class` attrs follow qti-construction
 * (`qti/schema/deliveryExtension.ts`, `qti/schema/classExtension.ts`); MathML and table captions
 * are not handled there.
 */

const MATHML_NS = "http://www.w3.org/1998/Math/MathML";

const readClass = (element: HTMLElement) =>
  element.getAttribute("class") || null;
const writeClass = (value: string | null): [string, string] | null =>
  value ? ["class", value] : null;

/*
 * `class` on text blocks: `qti-align-center` and its siblings, and any class the package's own
 * stylesheet reads.
 */
const NODES_WITH_CLASS = ["paragraph", "heading"] as const;

/*
 * Interaction attributes prose-qti's node specs do not model. The editor offers no control for
 * them, so they are carried as they were written.
 */
const INTERACTION_ATTRIBUTES: readonly (readonly [
  type: string,
  attribute: string,
])[] = [
  ["qtiTextEntryInteraction", "expected-length"],
  ["qtiTextEntryInteraction", "pattern-mask"],
  ["qtiTextEntryInteraction", "data-patternmask-message"],
  ["qtiMatchInteraction", "max-associations"],
  ["qtiMatchInteraction", "min-associations"],
];

/*
 * The import hands the schema an HTML copy of the item body (prose-qti's `importXmlAsHtml`), so
 * `<math>` arrives as an HTML element. Rebuilt here in the MathML namespace and kept as its
 * source: the node is an atom, edited in the XML editor, never in the text.
 */
function mathmlSource(element: Element): string {
  const doc = document.implementation.createDocument(MATHML_NS, null);
  const rebuild = (node: Node): Node => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return doc.createTextNode(node.textContent ?? "");
    }
    const source = node as Element;
    const copy = doc.createElementNS(MATHML_NS, source.localName);
    for (const attribute of Array.from(source.attributes)) {
      if (attribute.name === "xmlns" || attribute.name.startsWith("xmlns:"))
        continue;
      copy.setAttribute(attribute.name, attribute.value);
    }
    for (const child of Array.from(source.childNodes))
      copy.appendChild(rebuild(child));
    return copy;
  };
  return new XMLSerializer().serializeToString(rebuild(element));
}

function mathmlElement(source: string): Element {
  const parsed = new DOMParser().parseFromString(source, "application/xml");
  if (parsed.getElementsByTagName("parsererror").length > 0) {
    const fallback = document.createElement("span");
    fallback.textContent = source;
    return fallback;
  }
  return document.importNode(parsed.documentElement, true);
}

export function defineQtiPreserveExtension() {
  return union(
    ...NODES_WITH_CLASS.map((type) =>
      defineNodeAttr<string, string, string | null>({
        type,
        attr: "class",
        default: null,
        splittable: true,
        parseDOM: readClass,
        toDOM: writeClass,
      }),
    ),
    ...INTERACTION_ATTRIBUTES.map(([type, attribute]) =>
      defineNodeAttr<string, string, string | null>({
        type,
        attr: attribute,
        default: null,
        parseDOM: (element) => element.getAttribute(attribute),
        toDOM: (value) => (value == null ? null : [attribute, value]),
      }),
    ),

    /*
     * `<caption>`, as the table's text. A caption cannot be a child node: prosemirror-tables
     * reads every child of a table as a row. So it is an attribute, and the `caption` element is
     * skipped when the content is parsed, or its text would land in the table as a stray row.
     */
    defineNodeSpec({
      name: "table",
      attrs: { caption: { default: null } },
      parseDOM: [
        {
          // Ahead of the table's own rule, which reads no attributes.
          tag: "table",
          priority: 60,
          getAttrs: (element) => ({
            caption:
              Array.from((element as HTMLElement).children)
                .find((child) => child.localName === "caption")
                ?.textContent?.trim() || null,
          }),
        },
        { tag: "caption", ignore: true },
      ],
      toDOM: (node): DOMOutputSpec =>
        node.attrs.caption
          ? [
              "table",
              {},
              ["caption", node.attrs.caption as string],
              ["tbody", 0],
            ]
          : ["table", {}, ["tbody", 0]],
    }),

    /*
     * `div.qti-shared-stimulus[data-stimulus-idref]`: where the player puts the shared text the
     * item's `qti-assessment-stimulus-ref` points at. Empty in the item, so an atom.
     */
    defineNodeSpec({
      name: "sharedStimulusPlaceholder",
      group: "block",
      atom: true,
      selectable: true,
      draggable: true,
      attrs: { class: { default: null }, "data-stimulus-idref": {} },
      parseDOM: [
        {
          tag: "div[data-stimulus-idref]",
          priority: 60,
          getAttrs: (element) => ({
            class: (element as HTMLElement).getAttribute("class"),
            "data-stimulus-idref": (element as HTMLElement).getAttribute(
              "data-stimulus-idref",
            ),
          }),
        },
      ],
      toDOM: (node): DOMOutputSpec => {
        const attrs: Record<string, string> = {
          "data-stimulus-idref": node.attrs["data-stimulus-idref"] as string,
        };
        if (node.attrs.class) attrs.class = node.attrs.class as string;
        return ["div", attrs];
      },
    }),

    defineNodeSpec({
      name: "mathml",
      inline: true,
      group: "inline",
      atom: true,
      selectable: true,
      draggable: true,
      attrs: { source: {} },
      parseDOM: [
        {
          tag: "math",
          getAttrs: (element) => ({
            source: mathmlSource(element as HTMLElement),
          }),
        },
      ],
      toDOM: (node) => mathmlElement(node.attrs.source as string),
    }),
    // `match-max` is required on a gap text, but prose-qti writes it only when it is above 1.
    defineNodeSpec({
      name: "qtiGapText",
      toDOM: (node): DOMOutputSpec => {
        const attrs: Record<string, string> = {};
        if (node.attrs.identifier)
          attrs.identifier = node.attrs.identifier as string;
        attrs["match-max"] = String(node.attrs.matchMax ?? 1);
        return ["qti-gap-text", attrs, 0];
      },
    }),
    // Choices and prompts name their inline content instead of taking the `inline` group, so
    // they have to be told about MathML: a fraction as a choice is the common case.
    defineNodeSpec({
      name: "qtiSimpleChoiceParagraph",
      content: "(text | image | mathml)*",
    }),
    defineNodeSpec({
      name: "qtiPromptParagraph",
      content: "(text | image | mathml)*",
    }),
  );
}
