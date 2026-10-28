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
  | "response-changed"
  | "scoring-changed";

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
  "scoring-changed": "Scoring would change",
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

  // An image has no identifier, but its src is as good as one: the alt text and the size it was
  // given must come back on the image with the same src.
  const imagesAfter = descendants(bodyAfter).filter((element) => element.localName === "img");
  for (const image of descendants(bodyBefore).filter((element) => element.localName === "img")) {
    const src = image.getAttribute("src");
    const index = imagesAfter.findIndex((other) => other.getAttribute("src") === src);
    if (index < 0) continue;
    const [other] = imagesAfter.splice(index, 1);
    for (const attribute of Array.from(image.attributes)) {
      if (other.getAttribute(attribute.name) === attribute.value) continue;
      losses.push({
        code: "attribute-removed",
        detail: `img[src=${src}] @${attribute.name}`,
      });
    }
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
    for (const mapping of ["qti-mapping", "qti-area-mapping"]) {
      if (mappingOf(declaration, mapping) !== mappingOf(other, mapping)) {
        losses.push({ code: "scoring-changed", detail: `${id} <${mapping}>` });
      }
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

  const processingBefore = processingOf(original.documentElement);
  if (processingBefore !== processingOf(saved.documentElement)) {
    losses.push({ code: "scoring-changed", detail: "qti-response-processing" });
  }
  for (const outcome of ["SCORE", "MAXSCORE"]) {
    const before = outcomeDefault(original.documentElement, outcome);
    const after = outcomeDefault(saved.documentElement, outcome);
    if (before !== null && before !== after) {
      losses.push({ code: "scoring-changed", detail: `${outcome}: ${before} → ${after ?? "∅"}` });
    }
  }

  // Everything else on the item -- the shared stimulus it references, its stylesheets, its own
  // outcomes -- lives outside the body and must still be there.
  const keptParts = new Set(
    Array.from(saved.documentElement.children).map(partKey),
  );
  for (const part of Array.from(original.documentElement.children)) {
    if (OWNED_PARTS.has(part.localName)) continue;
    // SCORE and MAXSCORE are compared by value above.
    if (["SCORE", "MAXSCORE"].includes(part.getAttribute("identifier") ?? "")) continue;
    if (!keptParts.has(partKey(part))) {
      losses.push({ code: "element-removed", detail: partKey(part) });
    }
  }

  return losses;
}

/** Parts of the item that the checks above compare in their own way. */
const OWNED_PARTS = new Set([
  "qti-item-body",
  "qti-response-declaration",
  "qti-response-processing",
]);

const partKey = (part: Element) => {
  const name =
    part.getAttribute("identifier") ?? part.getAttribute("href") ?? "";
  return name ? `<${part.localName} ${name}>` : `<${part.localName}>`;
};

/** A mapping as its entries and bounds, in a fixed order. */
function mappingOf(declaration: Element, localName: string): string {
  const mapping = firstChild(declaration, localName);
  if (!mapping) return "";
  const attributes = (element: Element) =>
    Array.from(element.attributes)
      .map((attribute) => `${attribute.name}=${attribute.value}`)
      .sort()
      .join(",");
  return [
    attributes(mapping),
    ...Array.from(mapping.children).map(attributes).sort(),
  ].join(";");
}

/**
 * The response processing, as its template (with or without `.xml`, which name the same one) or
 * else its rules.
 */
function processingOf(root: Element): string {
  const processing = firstChild(root, "qti-response-processing");
  if (!processing) return "";
  const template = processing.getAttribute("template");
  if (template) return template.replace(/\.xml$/, "");
  return new XMLSerializer()
    .serializeToString(processing)
    .replace(/\s+/g, " ")
    .replace(/> </g, "><");
}

function outcomeDefault(root: Element, identifier: string): string | null {
  const outcome = childElements(root, "qti-outcome-declaration").find(
    (element) => element.getAttribute("identifier") === identifier,
  );
  if (!outcome) return null;
  const value = firstChild(outcome, "qti-default-value");
  return value ? (value.textContent ?? "").trim() : "";
}
