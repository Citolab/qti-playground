import {
  XmlDocument,
  XmlParseError,
  XmlValidateError,
  XsdValidator,
  xmlRegisterInputProvider,
  type ErrorDetail,
} from "libxml2-wasm";
import type { XmlIssue } from "./xml-validation.worker";

const QTI3_NAMESPACE = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";
const QTI3_SCHEMA = "imsqti_asiv3p0_v1p0.xsd";
const QTI3_SCHEMA_URL = `https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/${QTI3_SCHEMA}`;
/** Longer messages are cut: libxml2's "Expected is one of ( … )" lists run to kilobytes. */
const MAX_MESSAGE_CHARS = 400;
/** libxml2's XML_ERR_WARNING. */
const LEVEL_WARNING = 1;

// The schema's imports (absolute purl.imsglobal.org URLs, and relative ones inside mathml3.xsd) resolve by file name
// to the copies in qti3-schema/, never the network.
const encoder = new TextEncoder();
const schemaFiles = new Map(
  Object.entries(
    import.meta.glob<string>("./qti3-schema/*.xsd", { query: "?raw", import: "default", eager: true }),
  ).map(([path, text]) => [fileName(path), encoder.encode(text)]),
);
const openFiles = new Map<number, { bytes: Uint8Array; offset: number }>();
let nextFd = 1;

xmlRegisterInputProvider({
  match: (url) => schemaFiles.has(fileName(url)),
  open: (url) => {
    const fd = nextFd++;
    openFiles.set(fd, { bytes: schemaFiles.get(fileName(url))!, offset: 0 });
    return fd;
  },
  read: (fd, buf) => {
    const file = openFiles.get(fd);
    if (!file) return -1;
    const chunk = file.bytes.subarray(file.offset, file.offset + buf.byteLength);
    buf.set(chunk);
    file.offset += chunk.length;
    return chunk.length;
  },
  close: (fd) => openFiles.delete(fd),
});

/**
 * Compiled on the first QTI 3 document (~1 s); the schema document stays alive alongside it. Null when the schema does
 * not compile: its errors are not the user's, so QTI 3 is then only checked for well-formedness.
 */
let qti3: { schema: XmlDocument; validator: XsdValidator } | null | undefined;

function qti3Validator(): XsdValidator | undefined {
  if (qti3 === undefined) {
    const schema = XmlDocument.fromBuffer(schemaFiles.get(QTI3_SCHEMA)!, { url: QTI3_SCHEMA_URL });
    try {
      qti3 = { schema, validator: XsdValidator.fromDoc(schema) };
    } catch (error) {
      console.error("The QTI 3 schema does not compile; checking well-formedness only", error);
      schema.dispose();
      qti3 = null;
    }
  }
  return qti3?.validator;
}

/** The XML's issues: libxml2's parse errors, and for QTI 3 (by root namespace) the schema violations. */
export function validateXml(xml: string): XmlIssue[] {
  let doc: XmlDocument;
  try {
    doc = XmlDocument.fromString(xml);
  } catch (error) {
    if (error instanceof XmlParseError) return issuesOf(error.details);
    throw error;
  }
  try {
    if (doc.root.namespaceUri === QTI3_NAMESPACE) qti3Validator()?.validate(doc);
    return [];
  } catch (error) {
    if (error instanceof XmlValidateError) return issuesOf(error.details);
    throw error;
  } finally {
    doc.dispose();
  }
}

function issuesOf(details: ErrorDetail[]): XmlIssue[] {
  return details.map((d) => {
    const message = d.message.split(`{${QTI3_NAMESPACE}}`).join("").trim();
    return {
      message: message.length <= MAX_MESSAGE_CHARS ? message : `${message.slice(0, MAX_MESSAGE_CHARS)}…`,
      line: d.line,
      column: d.col,
      severity: d.level === LEVEL_WARNING ? "warning" : "error",
    };
  });
}

function fileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}
