import type { Monaco } from "@monaco-editor/react";
import type { editor, languages } from "monaco-editor";
import { formatXml } from "./format-xml";
import type { XmlIssue, XmlValidationRequest, XmlValidationResponse } from "./xml-validation.worker";

const VALIDATE_DELAY = 500;
const MARKER_OWNER = "xml-validation";

let formatterRegistered = false;
/** Started on the first validation; null once it failed to load. */
let worker: Worker | null | undefined;
let nextRequestId = 0;
const pending = new Map<number, (issues: XmlIssue[]) => void>();

/**
 * The XML editors' extras, for `<Editor onMount>`: "Format Document" (Shift+Alt+F, context menu) and validation while
 * typing. Every XML is checked for well-formedness, QTI 3 (by root namespace) also against the QTI 3.0 schema. Both run
 * in the browser (libxml2 in a worker), so the XML never leaves the machine.
 */
export function setupXmlEditor(ed: editor.IStandaloneCodeEditor, monaco: Monaco): void {
  registerFormatter(monaco);

  let timer: number | undefined;
  let run = 0;
  const validate = () => {
    const model = ed.getModel();
    if (!model) return;
    const current = ++run;
    const xml = model.getValue();
    const issues = xml.trim() ? validateInWorker(xml) : Promise.resolve([]);
    void issues.then((found) => {
      if (current !== run || model.isDisposed()) return;
      monaco.editor.setModelMarkers(model, MARKER_OWNER, found.map((issue) => markerOf(model, issue, monaco)));
    });
  };
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(validate, VALIDATE_DELAY);
  };
  const subscriptions = [ed.onDidChangeModelContent(schedule), ed.onDidChangeModel(validate)];
  ed.onDidDispose(() => {
    window.clearTimeout(timer);
    run++;
    for (const subscription of subscriptions) subscription.dispose();
  });
  validate();
}

function registerFormatter(monaco: Monaco) {
  if (formatterRegistered) return;
  formatterRegistered = true;
  monaco.languages.registerDocumentFormattingEditProvider("xml", {
    provideDocumentFormattingEdits: (model: editor.ITextModel, options: languages.FormattingOptions) => {
      const xml = model.getValue();
      const text = formatXml(xml, options.insertSpaces ? " ".repeat(options.tabSize) : "\t");
      return text === null || text === xml ? [] : [{ range: model.getFullModelRange(), text }];
    },
  });
}

function validateInWorker(xml: string): Promise<XmlIssue[]> {
  if (worker === null) return Promise.resolve([]);
  if (!worker) {
    worker = new Worker(new URL("./xml-validation.worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", (event: MessageEvent<XmlValidationResponse>) => {
      pending.get(event.data.id)?.(event.data.issues);
      pending.delete(event.data.id);
    });
    // A worker that fails to load answers nothing: validation is off from then on, and what is waiting gets no markers.
    worker.addEventListener("error", (event) => {
      console.warn("XML validation worker failed", event.message);
      worker?.terminate();
      worker = null;
      for (const resolve of pending.values()) resolve([]);
      pending.clear();
    });
  }
  const id = nextRequestId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    worker!.postMessage({ id, xml } satisfies XmlValidationRequest);
  });
}

/** Marks from `column` to the end of the line; the whole line when libxml2 gives no column (schema violations). */
function markerOf(model: editor.ITextModel, issue: XmlIssue, monaco: Monaco): editor.IMarkerData {
  const line = Math.min(Math.max(issue.line, 1), model.getLineCount());
  const end = model.getLineMaxColumn(line);
  const start = issue.column > 0 && issue.column < end ? issue.column : model.getLineFirstNonWhitespaceColumn(line) || 1;
  return {
    severity: issue.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
    message: issue.message,
    startLineNumber: line,
    startColumn: start,
    endLineNumber: line,
    endColumn: end,
  };
}
