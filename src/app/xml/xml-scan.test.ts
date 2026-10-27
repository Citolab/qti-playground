import { describe, expect, it } from "vitest";
import { xmlContextAt, xmlNameAt, xmlStartTags } from "./xml-scan";

/** The context at the `|` in `marked` (the marker removed). */
const at = (marked: string) => xmlContextAt(marked.replace("|", ""), marked.indexOf("|"));

describe("xmlContextAt", () => {
  it("finds the open elements and the siblings before a new tag", () => {
    expect(at("<item><body><p>a</p><br/><|")).toEqual({
      kind: "element-name",
      path: ["item", "body"],
      siblings: ["p", "br"],
      prefix: "",
      start: 26,
    });
    expect(at("<item><body><qti-ch|oice>")).toMatchObject({ kind: "element-name", path: ["item", "body"], prefix: "qti-ch" });
  });

  it("reads an end tag, also with the > Monaco closed the < with", () => {
    expect(at("<item><body></|>")).toMatchObject({ kind: "end-tag", path: ["item", "body"], prefix: "" });
    expect(at("<item><body></body></|")).toMatchObject({ kind: "end-tag", path: ["item"] });
  });

  it("knows attribute names and values, with the attributes already there", () => {
    expect(at("<item><decl identifier=\"R\" |")).toEqual({
      kind: "attribute-name",
      path: ["item", "decl"],
      present: ["identifier"],
      prefix: "",
      start: 27,
    });
    expect(at("<item><decl identifier=\"R\" card|")).toMatchObject({ kind: "attribute-name", prefix: "card", start: 27 });
    expect(at("<item><decl cardinality=\"si|\"/>")).toMatchObject({
      kind: "attribute-value",
      path: ["item", "decl"],
      attribute: "cardinality",
      prefix: "si",
    });
    expect(at("<item><decl cardinality='|")).toMatchObject({ kind: "attribute-value", attribute: "cardinality", prefix: "" });
  });

  it("skips comments, CDATA and processing instructions, and suggests nothing inside them", () => {
    expect(at("<?xml version=\"1.0\"?><item><!-- <x> --><![CDATA[<y>]]><|")).toMatchObject({ kind: "element-name", path: ["item"] });
    expect(at("<item><!-- <|")).toEqual({ kind: "none" });
    expect(at("<item><![CDATA[ <|")).toEqual({ kind: "none" });
  });

  it("tolerates what is not well-formed yet", () => {
    // A > inside a value, a stray <, an unfinished tag before the next one, an end tag that matches nothing.
    expect(at("<item><p title=\"a>b\">x < y</p><|")).toMatchObject({ kind: "element-name", path: ["item"], siblings: ["p"] });
    expect(at("<item><p <span>|")).toMatchObject({ kind: "text", path: ["item", "span"] });
    expect(at("<item><body></nope>|")).toMatchObject({ kind: "text", path: ["item", "body"] });
    expect(at("<item><body><p></body>|")).toMatchObject({ kind: "text", path: ["item"] });
  });
});

describe("xmlNameAt", () => {
  const name = (marked: string) => xmlNameAt(marked.replace("|", ""), marked.indexOf("|"));

  it("finds the element or attribute under the cursor", () => {
    expect(name("<item><bo|dy>")).toEqual({ kind: "element", path: ["item", "body"], name: "body", start: 7, end: 11 });
    expect(name("<item><body></bo|dy>")).toMatchObject({ kind: "element", path: ["item", "body"], name: "body" });
    expect(name("<item><decl card|inality=\"single\"/>")).toMatchObject({ kind: "attribute", path: ["item", "decl"], name: "cardinality" });
    expect(name("<item><decl cardinality=\"sin|gle\"/>")).toBeNull();
    expect(name("<item>so|me text")).toBeNull();
  });
});

describe("xmlStartTags", () => {
  it("lists every complete start tag with its attributes", () => {
    expect(xmlStartTags("<item a=\"1\"><decl identifier=\"R\" /><!-- <x y=\"2\"> --><p>t</p><unfinished b=\"")).toEqual([
      { name: "item", attributes: { a: "1" } },
      { name: "decl", attributes: { identifier: "R" } },
      { name: "p", attributes: {} },
    ]);
  });
});
