import { describe, expect, it } from "vitest";
import { catalogNamespace } from "./schema-catalog";

describe("catalogNamespace", () => {
  it("takes the root element's namespace when there is a catalog for it", () => {
    expect(catalogNamespace('<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">')).toBe(
      "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
    );
    expect(catalogNamespace('<?xml version="1.0"?><!-- x --><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1">')).toBe(
      "http://www.imsglobal.org/xsd/imsqti_v2p1",
    );
    expect(catalogNamespace('<q:assessmentTest xmlns:q="http://www.imsglobal.org/xsd/imsqti_v2p2">')).toBe(
      "http://www.imsglobal.org/xsd/imsqti_v2p2",
    );
    expect(catalogNamespace('<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">')).toBeUndefined();
  });

  it("goes by the root's name without a namespace, and waits for a complete root tag", () => {
    expect(catalogNamespace("<qti-assessment-item>")).toBe("http://www.imsglobal.org/xsd/imsqtiasi_v3p0");
    expect(catalogNamespace("<assessmentItem>")).toBe("http://www.imsglobal.org/xsd/imsqti_v2p2");
    expect(catalogNamespace("<html>")).toBeUndefined();
    expect(catalogNamespace("<assessmentItem identif")).toBeUndefined();
  });
});
