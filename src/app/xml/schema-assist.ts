import type { QtiSchemaAttribute, QtiSchemaCatalog, QtiSchemaChild, QtiSchemaType } from "./schema-catalog";
import { declaredIdentifiers, referenceKinds } from "./identifier-references";
import { localName, xmlContextAt, xmlNameAt, xmlStartTags, type XmlContext, type XmlPath } from "./xml-scan";

/** The completion and hover details (the schema's own names and documentation stay as they are). */
const t = {
  required: "required",
  defaultValue: (value: string) => `default: ${value}`,
  once: "at most once",
  declared: "declared variable",
  closeTag: "close tag",
};

const last = <T>(list: readonly T[]): T | undefined => list[list.length - 1];

/**
 * One suggestion of the XML editor, editor-neutral: `insert` (snippet syntax: `$1`, `${1|a,b|}`, `$0`) replaces the
 * characters `start`..`end`. `retrigger` opens the suggestions again after inserting (an attribute whose value can be
 * picked from the declared variables).
 */
export interface XmlCompletion {
  label: string;
  kind: "element" | "end-tag" | "attribute" | "value" | "reference";
  insert: string;
  start: number;
  end: number;
  sort: string;
  detail?: string;
  doc?: string;
  retrigger?: boolean;
}

/** The schema type of the last element of `path`, resolved from the document root down; undefined off the schema. */
export function typeAt(catalog: QtiSchemaCatalog, path: XmlPath): QtiSchemaType | undefined {
  const [root, ...rest] = path;
  let id = root === undefined ? undefined : catalog.roots[localName(root)];
  for (const name of rest) {
    if (id === undefined) return undefined;
    id = catalog.types[id]?.children[localName(name)]?.type;
  }
  return id === undefined ? undefined : catalog.types[id];
}

/** What the schema (and the document's declarations) allow at `offset`. */
export function schemaCompletions(catalog: QtiSchemaCatalog, text: string, offset: number): XmlCompletion[] {
  const context = xmlContextAt(text, offset);
  // Monaco closes a typed `<` with `>`; an element or end tag inserted before it takes it over.
  const tagEnd = offset + (text[offset] === ">" ? 1 : 0);
  switch (context.kind) {
    case "element-name":
      return elementCompletions(catalog, context, tagEnd);
    case "end-tag": {
      const open = last(context.path);
      return open === undefined
        ? []
        : [{ label: open, kind: "end-tag", insert: `${open}>`, start: context.start, end: tagEnd, sort: "0", detail: t.closeTag }];
    }
    case "attribute-name":
      return attributeCompletions(catalog, context, offset);
    case "attribute-value":
      return valueCompletions(catalog, context, text, offset);
    default:
      return [];
  }
}

/** The documentation of the element or attribute name under `offset` (markdown), with the name's range. */
export function schemaHover(catalog: QtiSchemaCatalog, text: string, offset: number): { markdown: string; start: number; end: number } | null {
  const at = xmlNameAt(text, offset);
  const type = at && typeAt(catalog, at.path);
  if (!at || !type) return null;
  if (at.kind === "element") {
    return { markdown: [`**${at.name}**`, type.doc].filter(Boolean).join("\n\n"), start: at.start, end: at.end };
  }
  const attribute = type.attributes.find((a) => a.name === at.name);
  if (!attribute) return null;
  const values = attribute.values?.map((v) => `\`${v}\``).join(" | ");
  const markdown = [`**${attribute.name}**${attribute.type ? ` — ${attribute.type}` : ''}`, attributeFacts(attribute), values, attribute.doc]
    .filter(Boolean)
    .join("\n\n");
  return { markdown, start: at.start, end: at.end };
}

function elementCompletions(catalog: QtiSchemaCatalog, context: Extract<XmlContext, { kind: "element-name" }>, end: number): XmlCompletion[] {
  const parent = typeAt(catalog, context.path);
  if (!parent) return [];
  const present = new Set(context.siblings.map(localName));
  const parentName = last(context.path) ?? "";
  const prefix = parentName.includes(":") ? parentName.slice(0, parentName.indexOf(":") + 1) : "";
  return Object.entries(parent.children)
    .filter(([name, child]) => !(child.once && present.has(name)))
    .flatMap(([name, child]) => {
      const type = catalog.types[child.type];
      if (!type) return [];
      // A child in the parent's namespace keeps the parent's prefix (`m:mfrac` in `m:math`).
      const qualified = child.ns ? name : prefix + name;
      return [
        {
          label: qualified,
          kind: "element" as const,
          insert: elementSnippet(qualified, child, type),
          start: context.start,
          end,
          sort: `${child.ns ? 2 : name.startsWith('qti-') ? 0 : 1}${name}`,
          detail: child.once ? t.once : undefined,
          doc: type.doc,
          retrigger: firstPlaceholderIsReference(qualified, type),
        },
      ];
    });
}

/** Whether the cursor lands in a variable reference after inserting the element (`response-identifier="|"`). */
function firstPlaceholderIsReference(name: string, type: QtiSchemaType): boolean {
  const first = type.attributes.find((a) => a.required);
  return !!first && !first.values && referenceKinds(name, first.name) !== undefined;
}

/** The element with its required attributes (and `xmlns` in another namespace), closed or self-closing when it is empty. */
function elementSnippet(name: string, child: QtiSchemaChild, type: QtiSchemaType): string {
  const attributes = type.attributes
    .filter((a) => a.required)
    .map((a, i) => `${a.name}="${valueSnippet(a, i + 1)}"`);
  const head = [name, ...(child.ns ? [`xmlns="${child.ns}"`] : []), ...attributes].join(" ");
  const empty = !type.text && Object.keys(type.children).length === 0;
  return empty ? `${head}/>$0` : `${head}>$0</${name}>`;
}

function attributeCompletions(catalog: QtiSchemaCatalog, context: Extract<XmlContext, { kind: "attribute-name" }>, end: number): XmlCompletion[] {
  const type = typeAt(catalog, context.path);
  if (!type) return [];
  const element = last(context.path) ?? "";
  const present = new Set(context.present);
  return type.attributes
    .filter((a) => !present.has(a.name))
    .map((a) => ({
      label: a.name,
      kind: "attribute" as const,
      insert: `${a.name}="${valueSnippet(a, 1)}"`,
      start: context.start,
      end,
      // Required first, ARIA and data attributes last.
      sort: `${a.required ? 0 : /^(aria|data)-/.test(a.name) ? 2 : 1}${a.name}`,
      detail: [a.type, attributeFacts(a)].filter(Boolean).join(" · ") || undefined,
      doc: a.doc,
      retrigger: !a.values && referenceKinds(element, a.name) !== undefined,
    }));
}

function valueCompletions(
  catalog: QtiSchemaCatalog,
  context: Extract<XmlContext, { kind: "attribute-value" }>,
  text: string,
  end: number,
): XmlCompletion[] {
  const element = last(context.path) ?? "";
  const values = typeAt(catalog, context.path)?.attributes.find((a) => a.name === context.attribute)?.values ?? [];
  const kinds = referenceKinds(element, context.attribute);
  const references = kinds ? declaredIdentifiers(xmlStartTags(text), kinds) : [];
  const item = (label: string, kind: "value" | "reference", i: number): XmlCompletion => ({
    label,
    kind,
    insert: escapeSnippet(label),
    start: context.start,
    end,
    sort: String(i).padStart(4, "0"),
    detail: kind === "reference" ? t.declared : undefined,
  });
  return [...values.map((v, i) => item(v, "value", i)), ...references.map((r, i) => item(r, "reference", values.length + i))];
}

function attributeFacts(a: QtiSchemaAttribute): string {
  return [a.required ? t.required : "", a.default !== undefined ? t.defaultValue(a.default) : ""].filter(Boolean).join(" · ");
}

/** `$1`, or a choice of the enumerated values (`${1|single,multiple|}`). */
function valueSnippet(a: QtiSchemaAttribute, n: number): string {
  return a.values?.length ? `\${${n}|${a.values.map((v) => v.replace(/[\\$}|,]/g, "\\$&")).join(",")}|}` : `$${n}`;
}

const escapeSnippet = (text: string) => text.replace(/[\\$}]/g, "\\$&");
