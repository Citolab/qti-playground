/**
 * Where the cursor is in XML that is being typed: which elements are open around it and whether it sits in a tag name,
 * an end tag, an attribute name or an attribute value. The XML editor's completion and hover read it.
 *
 * A tolerant scanner, not `DOMParser`: text being typed is not well-formed (`<qti-`,
 * `identifier="` without its closing quote, a missing end tag), and DOMParser answers that with an error document only.
 * It walks the markup character by character (comments, CDATA, processing instructions, quoted attribute values) and
 * never matches tag names as substrings. Use DOMParser wherever the XML is complete.
 */

/** Ancestors of the cursor, outermost first, by the name as written (`m:mfrac` stays prefixed). */
export type XmlPath = readonly string[];

export type XmlContext =
  /** After `<`: a child of `path` is being named; `siblings` are the children of the parent before the cursor. */
  | { kind: "element-name"; path: XmlPath; siblings: readonly string[]; prefix: string; start: number }
  /** After `</`: the end tag of the innermost open element (the last of `path`). */
  | { kind: "end-tag"; path: XmlPath; prefix: string; start: number }
  /** In the start tag of the last element of `path`, where an attribute name goes; `present` are its attributes so far. */
  | { kind: "attribute-name"; path: XmlPath; present: readonly string[]; prefix: string; start: number }
  /** Inside the quoted value of `attribute` on the last element of `path`. */
  | { kind: "attribute-value"; path: XmlPath; attribute: string; prefix: string; start: number }
  | { kind: "text"; path: XmlPath }
  /** In a comment, CDATA, a processing instruction or a part of a tag nothing can be suggested for. */
  | { kind: "none" };

/** A complete start tag (also self-closing) with its attributes. */
export interface XmlStartTag {
  name: string;
  attributes: Readonly<Record<string, string>>;
}

/** The local name of a qualified name (`m:mfrac` → `mfrac`). */
export const localName = (name: string) => name.slice(name.indexOf(":") + 1);

/** The context at `offset` (a character offset into `text`). */
export function xmlContextAt(text: string, offset: number): XmlContext {
  return scan(text, Math.max(0, Math.min(offset, text.length)), () => {});
}

/** Every complete start tag of `text`, in document order (also of text that is not well-formed). */
export function xmlStartTags(text: string): XmlStartTag[] {
  const tags: XmlStartTag[] = [];
  scan(text, text.length, (tag) => tags.push(tag));
  return tags;
}

/**
 * The name under `offset` in a start tag, end tag or attribute, with its range: what the hover describes. `path` ends
 * with the element the name belongs to (for an attribute: the element that carries it).
 */
export function xmlNameAt(
  text: string,
  offset: number,
): { kind: "element" | "attribute"; path: XmlPath; name: string; start: number; end: number } | null {
  let start = Math.max(0, Math.min(offset, text.length));
  while (start > 0 && isNameChar(text[start - 1])) start--;
  let end = start;
  while (end < text.length && isNameChar(text[end])) end++;
  if (end === start || offset > end) return null;
  const name = text.slice(start, end);
  const context = xmlContextAt(text, start);
  switch (context.kind) {
    case "element-name":
      return { kind: "element", path: [...context.path, name], name, start, end };
    case "end-tag":
      return { kind: "element", path: context.path, name, start, end };
    case "attribute-name":
      return { kind: "attribute", path: context.path, name, start, end };
    default:
      return null;
  }
}

const NAME_CHAR = /[\p{L}\p{N}_.:-]/u;
const isNameChar = (c: string | undefined) => c !== undefined && NAME_CHAR.test(c);
const isSpace = (c: string | undefined) => c === " " || c === "\t" || c === "\n" || c === "\r";

interface Open {
  name: string;
  children: string[];
}

/** Markup that is skipped as a whole: its opener and closer. */
const SKIPPED: readonly (readonly [string, string])[] = [
  ["<!--", "-->"],
  ["<![CDATA[", "]]>"],
  ["<?", "?>"],
  ["<!", ">"],
];

/** Scans `text` up to `end` and returns the context there; `onStartTag` sees every start tag completed before `end`. */
function scan(text: string, end: number, onStartTag: (tag: XmlStartTag) => void): XmlContext {
  const stack: Open[] = [];
  const names = () => stack.map((o) => o.name);
  let i = 0;
  scanning: while (i < end) {
    if (text[i] !== "<") {
      i++;
      continue;
    }
    for (const [open, close] of SKIPPED) {
      if (!text.startsWith(open, i)) continue;
      const closed = text.indexOf(close, i + open.length);
      if (closed === -1 || closed + close.length > end) return { kind: "none" };
      i = closed + close.length;
      continue scanning;
    }

    if (text[i + 1] === "/") {
      const nameEnd = readName(text, i + 2);
      if (nameEnd >= end) return { kind: "end-tag", path: names(), prefix: text.slice(i + 2, end), start: i + 2 };
      const closed = text.indexOf(">", nameEnd);
      if (closed === -1 || closed >= end) return { kind: "none" };
      // Close up to the matching open element; an end tag that matches nothing is ignored.
      const name = text.slice(i + 2, nameEnd);
      const at = names().lastIndexOf(name);
      if (at >= 0) stack.length = at;
      i = closed + 1;
      continue;
    }

    const nameEnd = readName(text, i + 1);
    if (nameEnd >= end) {
      return { kind: "element-name", path: names(), siblings: stack[stack.length - 1]?.children ?? [], prefix: text.slice(i + 1, end), start: i + 1 };
    }
    const name = text.slice(i + 1, nameEnd);
    if (name === "") {
      i++; // a stray `<` in text
      continue;
    }

    const path = [...names(), name];
    const attributes: Record<string, string> = {};
    let k = nameEnd;
    for (;;) {
      while (k < end && isSpace(text[k])) k++;
      if (k >= end) return { kind: "attribute-name", path, present: Object.keys(attributes), prefix: "", start: end };
      const c = text[k];
      if (c === ">" || (c === "/" && text[k + 1] === ">")) {
        onStartTag({ name, attributes });
        stack[stack.length - 1]?.children.push(name);
        if (c === ">") stack.push({ name, children: [] });
        i = k + (c === ">" ? 1 : 2);
        continue scanning;
      }
      if (c === "<") {
        i = k; // an unfinished tag: the next one starts here
        continue scanning;
      }
      if (!isNameChar(c)) {
        k++;
        continue;
      }

      const attributeEnd = readName(text, k);
      if (attributeEnd >= end) {
        return { kind: "attribute-name", path, present: Object.keys(attributes), prefix: text.slice(k, end), start: k };
      }
      const attribute = text.slice(k, attributeEnd);
      attributes[attribute] = "";
      k = attributeEnd;
      while (k < end && isSpace(text[k])) k++;
      if (text[k] !== "=") continue;
      k++;
      while (k < end && isSpace(text[k])) k++;
      if (k >= end) return { kind: "none" };
      const quote = text[k];
      if (quote !== "\"" && quote !== "'") continue;
      const valueEnd = text.indexOf(quote, k + 1);
      if (valueEnd === -1 || valueEnd >= end) {
        return { kind: "attribute-value", path, attribute, prefix: text.slice(k + 1, end), start: k + 1 };
      }
      attributes[attribute] = text.slice(k + 1, valueEnd);
      k = valueEnd + 1;
    }
  }
  return { kind: "text", path: names() };
}

function readName(text: string, from: number): number {
  let i = from;
  while (i < text.length && isNameChar(text[i])) i++;
  return i;
}
