/**
 * What saving an item from the editor would lose, found by doing it: the item is loaded into the
 * editor's document and saved straight back with no edit in between, and that save is compared
 * with the original. Ported from qti-construction (`qti/contentLoss.ts`, `qti/attributeBag.ts`),
 * where the same verdict decides whether an item opens for editing.
 *
 * It catches what the tag allowlist in unsupported-interactions.ts cannot see: an attribute the
 * schema has no slot for, text that does not come back, a changed image reference, a correct
 * response the exporter derives differently. Added wrappers (prose-qti puts choice text in a <p>)
 * and whitespace are not losses.
 */

export type ContentLossCode =
  | "not-an-item"
  | "element-removed"
  | "text-changed"
  | "attribute-removed"
  | "media-changed"
  | "response-changed";

export type ContentLoss = {
  code: ContentLossCode;
  /** The specifics, in QTI vocabulary (tag, attribute, identifier), so the author can find them. */
  detail: string;
};

export const CONTENT_LOSS_LABELS: Record<ContentLossCode, string> = {
  "not-an-item": "The XML could not be read",
  "element-removed": "Elements the editor cannot hold",
  "text-changed": "Text would change",
  "attribute-removed": "Attributes would be dropped",
  "media-changed": "Media references would change",
  "response-changed": "Correct responses would change",
};

const XML_NS = "http://www.w3.org/XML/1998/namespace";

/*
 * Attribute values that are QTI's own default on every interaction that has the attribute, so
 * an exporter that leaves them out changes nothing. Kept to the values that hold everywhere:
 * `max-choices` and `max-associations` are deliberately absent, their defaults differ per
 * interaction.
 */
const SPEC_DEFAULTS: Record<string, string> = {
  shuffle: "false",
  "min-choices": "0",
  "min-associations": "0",
};

function parseXml(xml: string): XMLDocument | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return doc.getElementsByTagName("parsererror").length > 0 ? null : doc;
}

const descendants = (root: Element | null): Element[] =>
  root ? Array.from(root.getElementsByTagName("*")) : [];

const childElements = (parent: Element, localName: string): Element[] =>
  Array.from(parent.children).filter((child) => child.localName === localName);

const firstChild = (parent: Element, localName: string): Element | null =>
  childElements(parent, localName)[0] ?? null;

const squash = (text: string | null | undefined) =>
  (text ?? "").replace(/\s+/g, "");

function countTags(root: Element | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const element of descendants(root)) {
    counts.set(element.localName, (counts.get(element.localName) ?? 0) + 1);
  }
  return counts;
}

const keyOf = (element: Element) => {
  const responseIdentifier = element.getAttribute("response-identifier");
  if (responseIdentifier) {
    return `${element.localName}[response-identifier=${responseIdentifier}]`;
  }
  const identifier = element.getAttribute("identifier");
  return identifier ? `${element.localName}[identifier=${identifier}]` : null;
};

function mediaRefs(root: Element | null): string[] {
  return descendants(root)
    .flatMap((element) =>
      ["src", "data", "href", "poster"]
        .map((name) => element.getAttribute(name))
        .filter((value): value is string => !!value),
    )
    .sort();
}

function correctValues(declaration: Element | undefined): string {
  const correct = declaration
    ? firstChild(declaration, "qti-correct-response")
    : null;
  if (!correct) return "";
  const values = childElements(correct, "qti-value").map((value) =>
    (value.textContent ?? "").trim(),
  );
  if (declaration?.getAttribute("cardinality") !== "ordered") values.sort();
  return values.join("|");
}

/**
 * Whether anything reads response declaration `id`: an interaction in the body, or the response
 * processing (an element with that identifier, or a standard template, which reads RESPONSE).
 */
function isReferenced(root: Element, body: Element | null, id: string): boolean {
  if (
    descendants(body).some(
      (element) => element.getAttribute("response-identifier") === id,
    )
  ) {
    return true;
  }
  const processing = firstChild(root, "qti-response-processing");
  if (!processing) return false;
  if (processing.getAttribute("template") && id === "RESPONSE") return true;
  return descendants(processing).some(
    (element) => element.getAttribute("identifier") === id,
  );
}

type AttributeBag = Map<string, number>;

/**
 * Class tokens, ids and xml:lang in the body -- attributes on elements without an identifier,
 * which the per-element comparison in `findContentLoss` cannot match up.
 */
function attributeBag(body: Element | null): AttributeBag {
  const bag: AttributeBag = new Map();
  const add = (key: string) => bag.set(key, (bag.get(key) ?? 0) + 1);
  for (const element of descendants(body)) {
    for (const token of (element.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter(Boolean)) {
      add(`class ${token}`);
    }
    const id = element.getAttribute("id");
    if (id) add(`id ${id}`);
    const lang =
      element.getAttributeNS(XML_NS, "lang") ?? element.getAttribute("xml:lang");
    if (lang) add(`xml:lang ${lang}`);
  }
  return bag;
}

/** Compares a stored item with what the editor saves for it when nothing was edited. */
export function findContentLoss(
  originalXml: string,
  savedXml: string,
): ContentLoss[] {
  const original = parseXml(originalXml);
  const saved = parseXml(savedXml);
  if (!original || !saved) return [{ code: "not-an-item", detail: "XML" }];

  const losses: ContentLoss[] = [];
  const bodyBefore = firstChild(original.documentElement, "qti-item-body");
  const bodyAfter = firstChild(saved.documentElement, "qti-item-body");

  const after = countTags(bodyAfter);
  for (const [tag, count] of countTags(bodyBefore)) {
    const kept = after.get(tag) ?? 0;
    if (kept < count) {
      losses.push({ code: "element-removed", detail: `<${tag}> ×${count - kept}` });
    }
  }

  if (squash(bodyBefore?.textContent) !== squash(bodyAfter?.textContent)) {
    losses.push({ code: "text-changed", detail: "qti-item-body" });
  }

  const matched = new Map<string, Element>();
  for (const element of descendants(bodyAfter)) {
    const key = keyOf(element);
    if (key && !matched.has(key)) matched.set(key, element);
  }
  for (const element of descendants(bodyBefore)) {
    const key = keyOf(element);
    const other = key ? matched.get(key) : undefined;
    if (!key || !other) continue;
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === "xmlns" || other.hasAttribute(attribute.name)) {
        continue;
      }
      if (SPEC_DEFAULTS[attribute.name] === attribute.value) continue;
      losses.push({
        code: "attribute-removed",
        detail: `${key} @${attribute.name}`,
      });
    }
  }

  const bagAfter = attributeBag(bodyAfter);
  for (const [key, count] of attributeBag(bodyBefore)) {
    const kept = bagAfter.get(key) ?? 0;
    if (kept < count) {
      losses.push({ code: "attribute-removed", detail: `${key} ×${count - kept}` });
    }
  }

  if (mediaRefs(bodyBefore).join("\n") !== mediaRefs(bodyAfter).join("\n")) {
    losses.push({ code: "media-changed", detail: "src" });
  }

  const declarationsAfter = new Map(
    childElements(saved.documentElement, "qti-response-declaration").map(
      (declaration) => [declaration.getAttribute("identifier") ?? "", declaration],
    ),
  );
  for (const declaration of childElements(
    original.documentElement,
    "qti-response-declaration",
  )) {
    const id = declaration.getAttribute("identifier") ?? "";
    const other = declarationsAfter.get(id);
    if (!other) {
      // A declaration nothing reads carries nothing the editor could lose.
      if (!isReferenced(original.documentElement, bodyBefore, id)) continue;
      losses.push({ code: "response-changed", detail: `${id} (removed)` });
      continue;
    }
    const before = correctValues(declaration);
    if (before && before !== correctValues(other)) {
      losses.push({
        code: "response-changed",
        detail: `${id}: ${before} → ${correctValues(other) || "∅"}`,
      });
    }
    for (const name of ["cardinality", "base-type"]) {
      if (declaration.getAttribute(name) !== other.getAttribute(name)) {
        losses.push({
          code: "response-changed",
          detail: `${id} @${name}: ${declaration.getAttribute(name)} → ${other.getAttribute(name)}`,
        });
      }
    }
  }

  return losses;
}
