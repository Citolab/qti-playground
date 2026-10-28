import {
  qtiItemFromProsemirror,
  type QtiComposeContext,
} from "@citolab/prose-qti/item-export/pm-qti-item";
import { roundtripXmlToPm } from "@citolab/prose-qti/components/shared";
import { roundtripQtiItem } from "@citolab/prose-qti/qti3-item-import/roundtrip-qti-item";
import { ListDOMSerializer } from "prosekit/extensions/list";
import type { ProseMirrorNode, Schema } from "prosekit/pm/model";

/*
 * The editor's two halves of a round trip, as plain functions: QTI in to a ProseMirror document,
 * and the document out to QTI again. The editor uses them to load and save, and the loss check
 * (content-loss.ts) uses them to load and save once with nothing in between.
 */

/** The item's body as a document of `schema`. */
export function importItemDoc(xml: string, schema: Schema): ProseMirrorNode {
  const itemBodyXml = roundtripQtiItem(xml);
  const xmlDoc = new DOMParser().parseFromString(itemBodyXml, "application/xml");
  removeComments(xmlDoc);
  return roundtripXmlToPm(xmlDoc, schema);
}

// prose-qti's import rebuilds every non-element node as a text node, so an XML comment in the body
// came back as a visible paragraph of its text. A comment has no place in the document.
function removeComments(xmlDoc: XMLDocument) {
  const walker = xmlDoc.createTreeWalker(xmlDoc, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const comment of comments) comment.parentNode?.removeChild(comment);
}

// The importer only carries the item BODY into ProseMirror, so the identity on the
// `<qti-assessment-item>` root is not in the document the exporter sees. Without it the exporter
// mints a fresh `item-xxxxxx` identifier and the title "Untitled Item" on the first keystroke --
// which, for an item inside a package, silently orphans it from the manifest and from any test
// that references it. Read the identity off the source once and hand it back on every export.
export function readItemIdentity(xml: string): QtiComposeContext {
  const root = new DOMParser()
    .parseFromString(xml, "application/xml")
    .querySelector("qti-assessment-item");
  if (!root) return {};

  const identity: QtiComposeContext = {};
  const identifier = root.getAttribute("identifier");
  const title = root.getAttribute("title");
  const lang = root.getAttribute("xml:lang") ?? root.getAttribute("lang");
  if (identifier) identity.identifier = identifier;
  if (title) identity.title = title;
  if (lang) identity.lang = lang;
  return identity;
}

/**
 * The item as QTI XML.
 *
 * The serializer is the point. This app's lists are ProseKit's flat lists, one node per item,
 * whose `toDOM` is the editor's own markup -- `<div class="prosemirror-flat-list">` -- and the
 * exporter's default serializer wrote exactly that into the item, which is not QTI. prose-qti
 * assumes `bullet_list`/`ordered_list` nodes, which serialise to `<ul>`/`<ol>` on their own;
 * `ListDOMSerializer` is ProseKit's answer for flat lists, grouping the items back into real lists.
 */
export function exportItem(
  doc: ProseMirrorNode,
  identity: QtiComposeContext,
  sourceXml: string,
): string {
  return mergeIntoSource(
    stripFlatListAttributes(
      qtiItemFromProsemirror(
        doc,
        identity,
        ListDOMSerializer.fromSchema(doc.type.schema),
      ),
    ),
    sourceXml,
  );
}

const firstChild = (parent: Element, localName: string): Element | null =>
  Array.from(parent.children).find((child) => child.localName === localName) ?? null;

const childElements = (parent: Element, localName: string): Element[] =>
  Array.from(parent.children).filter((child) => child.localName === localName);

/** The order QTI 3 puts the children of `<qti-assessment-item>` in. */
const ITEM_CHILD_ORDER = [
  "qti-context-declaration",
  "qti-response-declaration",
  "qti-outcome-declaration",
  "qti-template-declaration",
  "qti-template-processing",
  "qti-assessment-stimulus-ref",
  "qti-companion-materials-info",
  "qti-stylesheet",
  "qti-item-body",
  "qti-response-processing",
  "qti-modal-feedback",
];

/** The outcomes the exporter declares itself; any other outcome is the author's. */
const EXPORTER_OUTCOMES = new Set(["SCORE", "MAXSCORE"]);

/** Children of the item the exporter never writes, so they come from the source as they were. */
const isCarriedOver = (element: Element) =>
  element.localName === "qti-outcome-declaration"
    ? !EXPORTER_OUTCOMES.has(element.getAttribute("identifier") ?? "")
    : ![
        "qti-response-declaration",
        "qti-item-body",
        "qti-response-processing",
      ].includes(element.localName);

function correctValues(declaration: Element): string {
  const correct = firstChild(declaration, "qti-correct-response");
  const values = correct
    ? childElements(correct, "qti-value").map((value) => (value.textContent ?? "").trim())
    : [];
  if (declaration.getAttribute("cardinality") !== "ordered") values.sort();
  return values.join("|");
}

/** Whether two declarations describe the same response with the same key. */
const sameKey = (a: Element, b: Element) =>
  a.getAttribute("cardinality") === b.getAttribute("cardinality") &&
  a.getAttribute("base-type") === b.getAttribute("base-type") &&
  correctValues(a) === correctValues(b);

/**
 * Puts the exported item back into the item it was opened from.
 *
 * The exporter writes the item body and only the scoring it can derive from it: one correct
 * response per interaction, a mapping of its own making, and one of three templates. Everything
 * else the item had is not in its output -- the shared stimulus it references, its stylesheet,
 * its own outcomes, and any scoring richer than that: partial credit on a match, the alternative
 * answers a text entry accepts, a MAXSCORE of 0 on an unscored item. Each of these is the author's
 * and the editor offers no way to change it, so it comes back from the source.
 *
 * Scoring is kept for as long as the key is: a declaration whose correct response the author has
 * not changed keeps its authored form (mapping, area mapping), and while every declaration is
 * kept, so are the response processing and SCORE/MAXSCORE. Once the author changes a key in the
 * editor, the old mapping no longer describes it, and the editor's own scoring takes over.
 */
export function mergeIntoSource(exportedXml: string, sourceXml: string): string {
  const parser = new DOMParser();
  const exported = parser.parseFromString(exportedXml, "application/xml");
  const source = parser.parseFromString(sourceXml, "application/xml");
  const item = exported.documentElement;
  const sourceItem = source.documentElement;
  if (
    exported.getElementsByTagName("parsererror").length > 0 ||
    source.getElementsByTagName("parsererror").length > 0 ||
    item.localName !== "qti-assessment-item" ||
    sourceItem.localName !== "qti-assessment-item"
  ) {
    return exportedXml;
  }

  for (const attribute of Array.from(sourceItem.attributes)) {
    if (!item.hasAttribute(attribute.name)) {
      item.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
    }
  }

  const insertInOrder = (element: Element) => {
    const rank = ITEM_CHILD_ORDER.indexOf(element.localName);
    const before = Array.from(item.children).find(
      (child) => ITEM_CHILD_ORDER.indexOf(child.localName) > rank,
    );
    const copy = exported.importNode(element, true);
    item.insertBefore(copy, before ?? null);
    item.insertBefore(exported.createTextNode("\n  "), before ?? null);
  };
  const replace = (current: Element, original: Element) =>
    item.replaceChild(exported.importNode(original, true), current);

  for (const element of Array.from(sourceItem.children)) {
    if (isCarriedOver(element)) insertInOrder(element);
  }

  const sourceDeclarations = childElements(sourceItem, "qti-response-declaration");
  const exportedDeclarations = childElements(item, "qti-response-declaration");
  let scoringKept = sourceDeclarations.length === exportedDeclarations.length;
  for (const declaration of exportedDeclarations) {
    const original = sourceDeclarations.find(
      (candidate) =>
        candidate.getAttribute("identifier") === declaration.getAttribute("identifier"),
    );
    if (original && sameKey(original, declaration)) {
      replace(declaration, original);
    } else {
      scoringKept = false;
    }
  }
  if (!scoringKept) return serialize(exported, exportedXml);

  const sourceProcessing = firstChild(sourceItem, "qti-response-processing");
  const exportedProcessing = firstChild(item, "qti-response-processing");
  if (exportedProcessing) item.removeChild(exportedProcessing);
  if (sourceProcessing) insertInOrder(sourceProcessing);

  for (const identifier of EXPORTER_OUTCOMES) {
    const byId = (parent: Element) =>
      childElements(parent, "qti-outcome-declaration").find(
        (outcome) => outcome.getAttribute("identifier") === identifier,
      );
    const original = byId(sourceItem);
    const current = byId(item);
    if (original && current) replace(current, original);
    else if (original) insertInOrder(original);
  }

  return serialize(exported, exportedXml);
}

function serialize(doc: XMLDocument, like: string): string {
  const xml = new XMLSerializer().serializeToString(doc);
  const declaration = /^\s*<\?xml[^>]*\?>/.exec(like)?.[0];
  return declaration && !xml.startsWith("<?xml") ? `${declaration.trim()}\n${xml}` : xml;
}

// ...which still marks each `<li>` with the editor's own `class="prosemirror-flat-list"` and
// `data-list-*` attributes. The `<ul>`/`<ol>` around it already says everything they do.
function stripFlatListAttributes(xml: string): string {
  return xml.replace(/<li\b[^>]*>/g, (tag) =>
    tag
      .replace(/\s+class="prosemirror-flat-list"/, "")
      .replace(/\s+data-list-[\w-]+="[^"]*"/g, ""),
  );
}
