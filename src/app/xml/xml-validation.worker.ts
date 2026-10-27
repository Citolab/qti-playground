// libxml2-wasm awaits its wasm at the top level, and messages that reach a worker before its listener exists are
// lost. So the listener goes up first and the validator loads behind it.
const validator = import("./validate-xml");

/** One problem in the XML: not well-formed, or (QTI 3 only) a schema violation. `column` is 0 when libxml2 has none. */
export interface XmlIssue {
  message: string;
  line: number;
  column: number;
  severity: "error" | "warning";
}

export interface XmlValidationRequest {
  id: number;
  xml: string;
}

export interface XmlValidationResponse {
  id: number;
  issues: XmlIssue[];
}

self.addEventListener("message", async (event: MessageEvent<XmlValidationRequest>) => {
  const { id, xml } = event.data;
  let issues: XmlIssue[] = [];
  try {
    issues = (await validator).validateXml(xml);
  } catch (error) {
    console.error("XML validation failed", error);
  }
  postMessage({ id, issues } satisfies XmlValidationResponse);
});
