import type * as Monaco from "monaco-editor";
import type { QtiSchemaCatalog } from "./schema-catalog";
import { schemaCompletions, schemaHover, type XmlCompletion } from "./schema-assist";

/**
 * Completion and hover from the QTI schema of the document in every XML editor (`schemaAssist`). `catalog` gives the
 * catalog for the document's text; undefined when there is none for it or it cannot be loaded, and the editor then offers
 * nothing extra.
 */
export function registerSchemaAssist(monaco: typeof Monaco, catalog: (xml: string) => Promise<QtiSchemaCatalog | undefined>) {
  const kinds: Record<XmlCompletion["kind"], Monaco.languages.CompletionItemKind> = {
    element: monaco.languages.CompletionItemKind.Class,
    "end-tag": monaco.languages.CompletionItemKind.Class,
    attribute: monaco.languages.CompletionItemKind.Property,
    value: monaco.languages.CompletionItemKind.EnumMember,
    reference: monaco.languages.CompletionItemKind.Variable,
  };

  monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: ["<", "/", " ", "\"", "'"],
    provideCompletionItems: async (model, position) => {
      const loaded = await catalog(model.getValue());
      if (!loaded || model.isDisposed()) return { suggestions: [] };
      const offset = model.getOffsetAt(position);
      // A completion range stays on the cursor's line.
      const lineStart = model.getOffsetAt({ lineNumber: position.lineNumber, column: 1 });
      const suggestions = schemaCompletions(loaded, model.getValue(), offset).map((item) => ({
        label: item.label,
        kind: kinds[item.kind],
        insertText: item.insert,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: monaco.Range.fromPositions(model.getPositionAt(Math.max(item.start, lineStart)), model.getPositionAt(item.end)),
        sortText: item.sort,
        detail: item.detail,
        documentation: item.doc ? { value: item.doc } : undefined,
        command: item.retrigger ? { id: "editor.action.triggerSuggest", title: "" } : undefined,
      }));
      return { suggestions };
    },
  });

  monaco.languages.registerHoverProvider("xml", {
    provideHover: async (model, position) => {
      const loaded = await catalog(model.getValue());
      if (!loaded || model.isDisposed()) return null;
      const hover = schemaHover(loaded, model.getValue(), model.getOffsetAt(position));
      if (!hover) return null;
      return {
        contents: [{ value: hover.markdown }],
        range: monaco.Range.fromPositions(model.getPositionAt(hover.start), model.getPositionAt(hover.end)),
      };
    },
  });
}
