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
  return roundtripXmlToPm(xmlDoc, schema);
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
export function exportItem(doc: ProseMirrorNode, identity: QtiComposeContext): string {
  return stripFlatListAttributes(
    qtiItemFromProsemirror(
      doc,
      identity,
      ListDOMSerializer.fromSchema(doc.type.schema),
    ),
  );
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
