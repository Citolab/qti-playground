import catalogUrl from "./qti3-schema/qti3-catalog.json?url";

/**
 * What the QTI 3.0 XML schema allows per element type: the XML editors' completion and hover. `roots` maps the document
 * elements to their type id. The data is `qti3-schema/qti3-catalog.json` (see the README there).
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

let loading: Promise<QtiSchemaCatalog | undefined> | undefined;

/**
 * The catalog, fetched once (a static asset of the app, ~1 MB; nothing of the user's is sent). Undefined when it cannot
 * be loaded; the next call tries again.
 */
export function loadSchemaCatalog(): Promise<QtiSchemaCatalog | undefined> {
  loading ??= fetch(catalogUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`QTI schema catalog: ${response.status}`);
      return response.json() as Promise<QtiSchemaCatalog>;
    })
    .catch((error: unknown) => {
      console.warn("QTI schema catalog could not be loaded", error);
      loading = undefined;
      return undefined;
    });
  return loading;
}
