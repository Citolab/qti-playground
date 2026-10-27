import { describe, expect, it } from "vitest";
import type { QtiSchemaCatalog } from "./schema-catalog";
import { schemaCompletions, schemaHover, typeAt } from "./schema-assist";

const MATHML = "http://www.w3.org/1998/Math/MathML";

/** A slice of the real catalog (`GET /api/qti/schema-catalog`), same shape. */
const catalog: QtiSchemaCatalog = {
  roots: { "qti-assessment-item": "Item" },
  types: {
    Item: {
      doc: "An assessment item.",
      text: false,
      children: {
        "qti-response-declaration": { type: "Decl" },
        "qti-outcome-declaration": { type: "Decl" },
        "qti-item-body": { type: "Body", once: true },
      },
      attributes: [{ name: "identifier", required: true, type: "IdentifierDType" }],
      anyAttribute: false,
    },
    Decl: {
      text: false,
      children: {},
      attributes: [
        { name: "cardinality", required: true, values: ["multiple", "single"] },
        { name: "identifier", required: true, type: "IdentifierDType" },
        { name: "base-type", values: ["identifier", "string"] },
      ],
      anyAttribute: false,
    },
    Body: {
      text: false,
      children: {
        p: { type: "Text" },
        "qti-choice-interaction": { type: "Choice" },
        math: { type: "Math", ns: MATHML },
      },
      attributes: [],
      anyAttribute: false,
    },
    Text: { text: true, children: {}, attributes: [], anyAttribute: false },
    Choice: {
      doc: "The choice interaction presents a set of choices.",
      text: false,
      children: { "qti-simple-choice": { type: "Text" } },
      attributes: [
        { name: "response-identifier", required: true, type: "IdentifierDType" },
        { name: "aria-label", type: "normalizedString" },
        { name: "orientation", values: ["horizontal", "vertical"], default: "vertical", doc: "A rendering hint." },
        { name: "shuffle", values: ["true", "false"], default: "false" },
      ],
      anyAttribute: false,
    },
    Math: { text: false, children: { mfrac: { type: "Empty" } }, attributes: [], anyAttribute: false },
    Empty: { text: false, children: {}, attributes: [], anyAttribute: false },
  },
};

const ITEM = "<qti-assessment-item identifier=\"I\">";
const DECLARED = `${ITEM}<qti-response-declaration identifier="RESPONSE" cardinality="single"/><qti-outcome-declaration identifier="SCORE" cardinality="single"/>`;

/** The completions at the `|` in `marked`. */
const complete = (marked: string) => schemaCompletions(catalog, marked.replace("|", ""), marked.indexOf("|"));
const labels = (marked: string) => complete(marked).map((c) => c.label);

describe("typeAt", () => {
  it("resolves a path from the document root, by local name", () => {
    expect(typeAt(catalog, ["qti-assessment-item", "qti-item-body", "qti-choice-interaction"])).toBe(catalog.types.Choice);
    expect(typeAt(catalog, ["qti:qti-assessment-item", "qti:qti-item-body"])).toBe(catalog.types.Body);
    expect(typeAt(catalog, ["qti-assessment-item", "nope", "p"])).toBeUndefined();
    expect(typeAt(catalog, ["html"])).toBeUndefined();
  });
});

describe("schemaCompletions", () => {
  it("offers the children the schema allows, without a once-only child that is already there", () => {
    expect(labels(`${ITEM}<|`)).toEqual(["qti-response-declaration", "qti-outcome-declaration", "qti-item-body"]);
    expect(labels(`${ITEM}<qti-item-body></qti-item-body><|`)).toEqual(["qti-response-declaration", "qti-outcome-declaration"]);
    expect(labels("<html><|")).toEqual([]);
  });

  it("inserts an element with its required attributes, closed or self-closing, over the > Monaco added", () => {
    const text = `${ITEM}<qti-item-body><>`;
    const items = schemaCompletions(catalog, text, text.length - 1);
    const choice = items.find((c) => c.label === "qti-choice-interaction");
    expect(choice).toMatchObject({ insert: "qti-choice-interaction response-identifier=\"$1\">$0</qti-choice-interaction>", end: text.length });
    expect(choice?.doc).toBe("The choice interaction presents a set of choices.");
    // The cursor lands in response-identifier="": the declared variables open there.
    expect(choice?.retrigger).toBe(true);
    expect(items.find((c) => c.label === "math")?.insert).toBe(`math xmlns="${MATHML}">$0</math>`);
    // QTI elements sort first, other namespaces last.
    expect(items.sort((a, b) => a.sort.localeCompare(b.sort)).map((c) => c.label)).toEqual(["qti-choice-interaction", "p", "math"]);

    const declaration = complete(`${ITEM}<|`).find((c) => c.label === "qti-response-declaration");
    expect(declaration?.insert).toBe("qti-response-declaration cardinality=\"${1|multiple,single|}\" identifier=\"$2\"/>$0");
    expect(declaration?.retrigger).toBe(false);
  });

  it("keeps the parent prefix for children in its namespace", () => {
    expect(labels(`${ITEM}<qti-item-body><m:math xmlns:m="${MATHML}"><|`)).toEqual(["m:mfrac"]);
  });

  it("closes the innermost open element", () => {
    expect(complete(`${ITEM}<qti-item-body><p></|>`)).toMatchObject([{ label: "p", insert: "p>", kind: "end-tag" }]);
  });

  it("offers the missing attributes, required first and ARIA last, with their facts", () => {
    const items = complete(`${ITEM}<qti-item-body><qti-choice-interaction shuffle="true" |`);
    expect(items.sort((a, b) => a.sort.localeCompare(b.sort)).map((c) => c.label)).toEqual(["response-identifier", "orientation", "aria-label"]);
    expect(items.find((c) => c.label === "orientation")).toMatchObject({
      insert: "orientation=\"${1|horizontal,vertical|}\"",
      detail: "default: vertical",
      doc: "A rendering hint.",
    });
    // A reference opens the suggestions again for the declared variables.
    expect(items.find((c) => c.label === "response-identifier")).toMatchObject({ insert: "response-identifier=\"$1\"", retrigger: true });
  });

  it("offers enumerated values and declared variables of the right kind", () => {
    expect(labels(`${DECLARED}<qti-response-declaration identifier="R2" cardinality="|"`)).toEqual(["multiple", "single"]);
    const references = complete(`${DECLARED}<qti-item-body><qti-choice-interaction response-identifier="|"`);
    expect(references.map((c) => c.label)).toEqual(["RESPONSE", "numAttempts", "duration"]);
    expect(references[0]).toMatchObject({ kind: "reference", detail: "declared variable" });
    // Off the schema, references still come from the document.
    expect(labels(`${DECLARED}<qti-response-processing><qti-set-outcome-value identifier="|`)).toEqual(["SCORE", "completionStatus"]);
  });
});

describe("schemaHover", () => {
  const hover = (marked: string) => schemaHover(catalog, marked.replace("|", ""), marked.indexOf("|"));

  it("documents elements and attributes", () => {
    expect(hover(`${ITEM}<qti-item-body><qti-choice-inter|action/>`)?.markdown).toBe(
      "**qti-choice-interaction**\n\nThe choice interaction presents a set of choices.",
    );
    expect(hover(`${ITEM}<qti-item-body><qti-choice-interaction orien|tation="vertical"/>`)?.markdown).toBe(
      "**orientation**\n\ndefault: vertical\n\n`horizontal` | `vertical`\n\nA rendering hint.",
    );
    expect(hover(`${ITEM}<qti-item-body><qti-choice-interaction orientation="vert|ical"/>`)).toBeNull();
  });
});
