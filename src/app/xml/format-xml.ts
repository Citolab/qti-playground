/**
 * Inline elements: whitespace next to them shows up in the rendered item, so a parent holding any of them keeps its
 * whitespace exactly as written. HTML phrasing content plus the QTI 3 and QTI 2.x inline elements.
 */
const INLINE = new Set([
  "a", "abbr", "audio", "b", "bdi", "bdo", "br", "button", "cite", "code", "data", "dfn", "em", "i", "img", "input",
  "kbd", "label", "mark", "math", "object", "picture", "q", "ruby", "s", "samp", "select", "small", "span", "strong",
  "sub", "sup", "svg", "time", "u", "var", "video", "wbr",
  "qti-end-attempt-interaction", "qti-feedback-inline", "qti-gap", "qti-gap-img", "qti-gap-text", "qti-hottext",
  "qti-inline-choice-interaction", "qti-printed-variable", "qti-template-inline", "qti-text-entry-interaction",
  "endAttemptInteraction", "feedbackInline", "gap", "gapImg", "gapText", "hottext", "inlineChoiceInteraction",
  "printedVariable", "templateInline", "textEntryInteraction",
]);

/** Elements whose content is kept byte-for-byte, descendants included. */
const VERBATIM = new Set(["pre", "script", "style", "textarea"]);

const XML_DECLARATION = /^\s*(<\?xml[^?]*\?>)/;

/**
 * Re-indents `xml` for Monaco's "Format Document"; null when it does not parse. Only element-only content is
 * re-indented (no text, no inline children), so the rendered item stays the same: mixed content, xml:space="preserve",
 * comments, CDATA and the XML declaration are kept as written.
 */
export function formatXml(xml: string, indentUnit = "  "): string | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return null;

  const indent = (el: Element, depth: number) => {
    if (VERBATIM.has(el.localName) || el.getAttribute("xml:space") === "preserve") return;
    const kids = Array.from(el.childNodes);
    const nodes = kids.filter((n) => n.nodeType !== Node.TEXT_NODE);
    const elementOnly =
      nodes.length > 0 &&
      kids.every((n) => n.nodeType !== Node.TEXT_NODE || !(n.nodeValue ?? "").trim()) &&
      nodes.every((n) => n.nodeType !== Node.CDATA_SECTION_NODE && !INLINE.has((n as Element).localName));
    if (elementOnly) {
      for (const k of kids) if (k.nodeType === Node.TEXT_NODE) el.removeChild(k);
      const pad = "\n" + indentUnit.repeat(depth + 1);
      for (const n of nodes) el.insertBefore(doc.createTextNode(pad), n);
      el.appendChild(doc.createTextNode("\n" + indentUnit.repeat(depth)));
    }
    for (const child of Array.from(el.children)) indent(child, depth + 1);
  };
  indent(doc.documentElement, 0);

  const serializer = new XMLSerializer();
  const declaration = XML_DECLARATION.exec(xml)?.[1];
  const parts = Array.from(doc.childNodes).map((n) => serializer.serializeToString(n));
  return [...(declaration ? [declaration] : []), ...parts].join("\n") + (xml.endsWith("\n") ? "\n" : "");
}
