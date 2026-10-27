import { describe, expect, it } from "vitest";
import { declaredIdentifiers, referenceKinds } from "./identifier-references";
import { xmlStartTags } from "./xml-scan";

describe("identifier references", () => {
  it("knows the QTI 3 and QTI 2 names", () => {
    expect(referenceKinds("qti-choice-interaction", "response-identifier")).toEqual(["response"]);
    expect(referenceKinds("choiceInteraction", "responseIdentifier")).toEqual(["response"]);
    expect(referenceKinds("setOutcomeValue", "identifier")).toEqual(["outcome"]);
    expect(referenceKinds("simpleChoice", "identifier")).toBeUndefined();
  });

  it("lists the declarations of the right kind, then the built-ins", () => {
    const tags = xmlStartTags(
      '<assessmentItem><responseDeclaration identifier="RESPONSE"/><outcomeDeclaration identifier="SCORE"/></assessmentItem>',
    );
    expect(declaredIdentifiers(tags, ["outcome"])).toEqual(["SCORE", "completionStatus"]);
    expect(declaredIdentifiers(tags, referenceKinds("variable", "identifier")!)).toEqual([
      "RESPONSE",
      "SCORE",
      "numAttempts",
      "duration",
      "completionStatus",
      "QTI_CONTEXT",
    ]);
  });
});
