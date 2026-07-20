import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, List, Redo2, Underline, Undo2 } from "lucide-react";
import {
  createEditor,
  defineFocusChangeHandler,
  defineUpdateHandler,
  isMarkActive,
  type Editor,
} from "prosekit/core";
import { redo, undo } from "prosekit/pm/history";
import { qtiItemFromProsemirror } from "@citolab/prose-qti/integration/save-qti-item";
import { roundtripXmlToPm } from "@citolab/prose-qti/components/shared";
import { roundtripQtiItem } from "@citolab/prose-qti/qti3-item-import/roundtrip-qti-item";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { defineQtiPlaygroundExtension } from "./qti-citolab-editor-extensions";

import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import "@qti-components/theme/item.css";
import "@citolab/prose-qti/core-css.css";
import "./qti-citolab-editor.css";

type FormatToolbarState = {
  bold: boolean;
  underline: boolean;
  bulletList: boolean;
};

function readFormatToolbarState(editor: Editor): FormatToolbarState {
  const nodes = editor.nodes as {
    list?: { isActive: (attrs?: { kind?: string }) => boolean };
  };

  return {
    bold: isMarkActive(editor.state, "bold"),
    underline: isMarkActive(editor.state, "underline"),
    bulletList: nodes.list?.isActive({ kind: "bullet" }) ?? false,
  };
}

function useFormatToolbarState(editor: Editor | null) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const bump = () => setRevision((value) => value + 1);
    const removeUpdateListener = editor.use(defineUpdateHandler(bump));
    const removeFocusListener = editor.use(defineFocusChangeHandler(bump));

    return () => {
      removeUpdateListener();
      removeFocusListener();
    };
  }, [editor]);

  return editor ? readFormatToolbarState(editor) : null;
}

function QtiCitolabEditorToolbar({ editor }: { editor: Editor }) {
  const formatState = useFormatToolbarState(editor);
  const commands = editor.commands as {
    toggleBold?: () => boolean;
    toggleUnderline?: () => boolean;
    toggleList?: (attrs?: { kind?: "bullet" }) => boolean;
  };

  const runCommand = (command?: () => boolean) => {
    editor.focus();
    command?.();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-3 py-2"
      onMouseDown={(event) => event.preventDefault()}
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={!editor.canExec(undo)}
        onClick={() => editor.exec(undo)}
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={!editor.canExec(redo)}
        onClick={() => editor.exec(redo)}
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <Button
        type="button"
        size="sm"
        variant={formatState?.bold ? "secondary" : "ghost"}
        aria-label="Bold"
        aria-pressed={formatState?.bold ?? false}
        onClick={() => runCommand(commands.toggleBold)}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={formatState?.underline ? "secondary" : "ghost"}
        aria-label="Underline"
        aria-pressed={formatState?.underline ?? false}
        onClick={() => runCommand(commands.toggleUnderline)}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={formatState?.bulletList ? "secondary" : "ghost"}
        aria-label="Bullet list"
        aria-pressed={formatState?.bulletList ?? false}
        onClick={() =>
          runCommand(() => commands.toggleList?.({ kind: "bullet" }) ?? false)
        }
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

type Props = {
  editorSessionKey: number;
  sourceXml: string;
  onSourceChange: (nextXml: string) => void;
  className?: string;
};

export function QtiCitolabEditor({
  editorSessionKey,
  sourceXml,
  onSourceChange,
  className,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onSourceChangeRef = useRef(onSourceChange);
  const initialXmlRef = useRef(sourceXml);
  const baselineDocJsonRef = useRef<string | null>(null);
  const isReadyForExportRef = useRef(false);
  const lastEmittedXmlRef = useRef(sourceXml);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  onSourceChangeRef.current = onSourceChange;

  useEffect(() => {
    initialXmlRef.current = sourceXml;
  }, [editorSessionKey]);

  const extension = useMemo(() => defineQtiPlaygroundExtension(), []);

  const debouncedExport = useDebouncedCallback((nextEditor: Editor) => {
    if (!isReadyForExportRef.current) return;

    try {
      const xml = qtiItemFromProsemirror(nextEditor.state.doc);
      if (xml === lastEmittedXmlRef.current) return;
      lastEmittedXmlRef.current = xml;
      baselineDocJsonRef.current = JSON.stringify(nextEditor.state.doc.toJSON());
      onSourceChangeRef.current(xml);
    } catch (error) {
      console.error("Failed to export QTI item from editor:", error);
    }
  }, 600);

  const debouncedExportRef = useRef(debouncedExport);
  debouncedExportRef.current = debouncedExport;

  useEffect(() => {
    const mountEl = mountRef.current;
    const initialXml = initialXmlRef.current;
    if (!mountEl || !initialXml.trim()) {
      setImportError(
        initialXml.trim() ? null : "Load or paste a QTI item to edit.",
      );
      return;
    }

    setImportError(null);
    isReadyForExportRef.current = false;
    baselineDocJsonRef.current = null;
    lastEmittedXmlRef.current = initialXml;

    let removeUpdateListener: (() => void) | undefined;
    let readyTimer: number | undefined;

    try {
      const bootstrap = createEditor({ extension });
      const schema = bootstrap.state.schema;
      const itemBodyXml = roundtripQtiItem(initialXml);
      const xmlDoc = new DOMParser().parseFromString(itemBodyXml, "application/xml");
      const doc = roundtripXmlToPm(xmlDoc, schema);
      const nextEditor = createEditor({
        extension,
        defaultContent: doc.toJSON(),
      });
      nextEditor.mount(mountEl);
      editorRef.current = nextEditor;
      setEditor(nextEditor);

      removeUpdateListener = nextEditor.use(
        defineUpdateHandler(() => {
          if (!isReadyForExportRef.current) return;

          const currentDocJson = JSON.stringify(nextEditor.state.doc.toJSON());
          if (
            baselineDocJsonRef.current !== null &&
            currentDocJson === baselineDocJsonRef.current
          ) {
            return;
          }

          debouncedExportRef.current(nextEditor);
        }),
      );

      // Let Lit node views and inline-choice plugins settle before exporting.
      readyTimer = window.setTimeout(() => {
        baselineDocJsonRef.current = JSON.stringify(nextEditor.state.doc.toJSON());
        isReadyForExportRef.current = true;
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "This item could not be opened in the Citolab editor.";
      setImportError(message);
      return undefined;
    }

    return () => {
      if (readyTimer !== undefined) {
        window.clearTimeout(readyTimer);
      }
      isReadyForExportRef.current = false;
      removeUpdateListener?.();
      debouncedExportRef.current.cancel();
      editorRef.current?.unmount();
      editorRef.current = null;
      setEditor(null);
    };
  }, [editorSessionKey, extension]);

  useEffect(() => {
    return () => {
      debouncedExport.cancel();
    };
  }, [debouncedExport]);

  if (importError) {
    return (
      <div
        className={`qti-citolab-editor flex min-h-[75vh] items-center justify-center p-6 ${className ?? ""}`}
      >
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">QTI editor unavailable</p>
          <p className="mt-1">{importError}</p>
          <p className="mt-2 text-amber-800">
            Switch back to the XML editor to keep editing this item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`qti-citolab-editor flex min-h-[75vh] flex-col ${className ?? ""}`}
    >
      {editor ? <QtiCitolabEditorToolbar editor={editor} /> : null}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-3">
        <div ref={mountRef} className="ProseMirror-host w-full" />
      </div>
    </div>
  );
}
