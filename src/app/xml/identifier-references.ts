import { localName, type XmlStartTag } from "./xml-scan";

/** The variable declarations of an item or test, by kind. */
type DeclarationKind = "response" | "outcome" | "template" | "context";

/** QTI 3 (kebab-case) and QTI 2 (camelCase) declaration elements. */
const DECLARATIONS: Readonly<Record<string, DeclarationKind>> = {
  "qti-response-declaration": "response",
  "qti-outcome-declaration": "outcome",
  "qti-template-declaration": "template",
  "qti-context-declaration": "context",
  responseDeclaration: "response",
  outcomeDeclaration: "outcome",
  templateDeclaration: "template",
};

/** Variables every item has without declaring them (QTI 3.0 "Built-in variables"). */
const BUILT_IN: Readonly<Record<DeclarationKind, readonly string[]>> = {
  response: ["numAttempts", "duration"],
  outcome: ["completionStatus"],
  template: [],
  context: ["QTI_CONTEXT"],
};

const ANY: readonly DeclarationKind[] = ["response", "outcome", "template", "context"];

/**
 * Attributes that name a declared variable, and which declarations they may name: by attribute name on any element, or
 * `element@attribute` where the attribute (`identifier`) means something else elsewhere; QTI 3 and QTI 2 names. The
 * XSD types them all as plain identifiers, so this table is the only place that knows.
 */
const REFERENCES: Readonly<Record<string, readonly DeclarationKind[]>> = {
  "response-identifier": ["response"],
  "outcome-identifier": ["outcome"],
  "template-identifier": ["template"],
  "qti-variable@identifier": ANY,
  "qti-default@identifier": ANY,
  "qti-correct@identifier": ["response"],
  "qti-map-response@identifier": ["response"],
  "qti-map-response-point@identifier": ["response"],
  "qti-set-correct-response@identifier": ["response"],
  "qti-set-default-value@identifier": ["response", "outcome"],
  "qti-set-outcome-value@identifier": ["outcome"],
  "qti-lookup-outcome-value@identifier": ["outcome"],
  "qti-set-template-value@identifier": ["template"],
  "qti-printed-variable@identifier": ["outcome", "template"],
  // QTI 2.x
  responseIdentifier: ["response"],
  outcomeIdentifier: ["outcome"],
  templateIdentifier: ["template"],
  "variable@identifier": ANY,
  "default@identifier": ANY,
  "correct@identifier": ["response"],
  "mapResponse@identifier": ["response"],
  "mapResponsePoint@identifier": ["response"],
  "setCorrectResponse@identifier": ["response"],
  "setDefaultValue@identifier": ["response", "outcome"],
  "setOutcomeValue@identifier": ["outcome"],
  "lookupOutcomeValue@identifier": ["outcome"],
  "setTemplateValue@identifier": ["template"],
  "printedVariable@identifier": ["outcome", "template"],
};

/** The kinds of declaration `attribute` on `element` refers to; undefined when it is not a reference. */
export function referenceKinds(element: string, attribute: string): readonly DeclarationKind[] | undefined {
  return REFERENCES[`${localName(element)}@${attribute}`] ?? REFERENCES[attribute];
}

/** The identifiers of the declarations of `kinds` in the document's start tags, declared ones first, then built-ins. */
export function declaredIdentifiers(tags: readonly XmlStartTag[], kinds: readonly DeclarationKind[]): string[] {
  const declared = tags
    .filter((t) => kinds.includes(DECLARATIONS[localName(t.name)]))
    .map((t) => t.attributes.identifier)
    .filter((id): id is string => !!id);
  return [...new Set([...declared, ...kinds.flatMap((k) => BUILT_IN[k])])];
}
