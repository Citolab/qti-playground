import qti21Url from "./qti2-schema/qti21-catalog.json?url";
import qti22Url from "./qti2-schema/qti22-catalog.json?url";
import qti3Url from "./qti3-schema/qti3-catalog.json?url";
import { localName, xmlStartTags } from "./xml-scan";

/**
 * What a QTI XML schema allows per element type: the XML editors' completion and hover. `roots` maps the document
 * elements to their type id. The data is `qti3-schema/qti3-catalog.json` and `qti2-schema/*.json` (see the READMEs there).
 */
export interface QtiSchemaCatalog {
  roots: Record<string, string>;
  types: Record<string, QtiSchemaType>;
}

export interface QtiSchemaType {
  doc?: string;
  /** Holds text (mixed or simple content). */
  text: boolean;
  /** Local name → child; a child in another namespace (MathML's `math`) carries it in `ns`. */
  children: Record<string, QtiSchemaChild>;
  /** Required first. */
  attributes: QtiSchemaAttribute[];
  anyAttribute: boolean;
}

export interface QtiSchemaChild {
  type: string;
  ns?: string;
  /** May occur only once in its parent. */
  once?: boolean;
}

export interface QtiSchemaAttribute {
  name: string;
  required?: boolean;
  /** The XSD type name (`IdentifierDType`, `boolean`, …). */
  type?: string;
  /** The allowed values when the type is an enumeration. */
  values?: string[];
  default?: string;
  doc?: string;
}

const QTI3 = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";
const QTI22 = "http://www.imsglobal.org/xsd/imsqti_v2p2";

/** One catalog per QTI namespace, each a static asset of the app (~0.5–1 MB) fetched when a document in it is edited. */
const CATALOGS: Record<string, string> = {
  [QTI3]: qti3Url,
  [QTI22]: qti22Url,
  "http://www.imsglobal.org/xsd/imsqti_v2p1": qti21Url,
};

/** QTI 2 document elements, recognized without a namespace. */
const QTI2_ROOTS = new Set(["assessmentItem", "assessmentTest", "assessmentSection", "assessmentStimulus"]);

/**
 * The QTI namespace of the document: its root element's (default or prefixed) namespace when it is one with a catalog.
 * Without a namespace (typed from scratch) the root's name decides: `qti-…` is QTI 3, a QTI 2 element is 2.2 (which
 * knows the most). Undefined for other XML (a manifest, an unknown namespace).
 */
export function catalogNamespace(xml: string): string | undefined {
  const root = xmlStartTags(xml)[0];
  if (!root) return undefined;
  const colon = root.name.indexOf(":");
  const declared = root.attributes[colon >= 0 ? `xmlns:${root.name.slice(0, colon)}` : "xmlns"];
  if (declared !== undefined) return declared in CATALOGS ? declared : undefined;
  const name = localName(root.name);
  return name.startsWith("qti-") ? QTI3 : QTI2_ROOTS.has(name) ? QTI22 : undefined;
}

const loading = new Map<string, Promise<QtiSchemaCatalog | undefined>>();

/**
 * The catalog for the document `xml`, fetched once per namespace (nothing of the user's is sent). Undefined when there
 * is none for it or it cannot be loaded; a failed load is tried again on the next call.
 */
export function loadSchemaCatalog(xml: string): Promise<QtiSchemaCatalog | undefined> {
  const namespace = catalogNamespace(xml);
  if (namespace === undefined) return Promise.resolve(undefined);
  let catalog = loading.get(namespace);
  if (!catalog) {
    catalog = fetch(CATALOGS[namespace])
      .then((response) => {
        if (!response.ok) throw new Error(`QTI schema catalog: ${response.status}`);
        return response.json() as Promise<QtiSchemaCatalog>;
      })
      .catch((error: unknown) => {
        console.warn("QTI schema catalog could not be loaded", namespace, error);
        loading.delete(namespace);
        return undefined;
      });
    loading.set(namespace, catalog);
  }
  return catalog;
}
