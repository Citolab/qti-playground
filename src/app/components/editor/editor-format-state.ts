import { useEffect, useState } from "react";
import {
  defineFocusChangeHandler,
  defineUpdateHandler,
  isMarkActive,
  type Editor,
} from "prosekit/core";
import { isInLayoutRow } from "./qti-layout-commands";

export type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletList: boolean;
  twoColumns: boolean;
};

export type MarkCommands = {
  toggleBold?: () => boolean;
  toggleItalic?: () => boolean;
  toggleUnderline?: () => boolean;
  toggleList?: (attrs?: { kind?: "bullet" | "ordered" }) => boolean;
  clearFormatting?: () => boolean;
};

function readFormatState(editor: Editor): FormatState {
  const nodes = editor.nodes as {
    list?: { isActive: (attrs?: { kind?: string }) => boolean };
  };

  return {
    bold: isMarkActive(editor.state, "bold"),
    italic: isMarkActive(editor.state, "italic"),
    underline: isMarkActive(editor.state, "underline"),
    bulletList: nodes.list?.isActive({ kind: "bullet" }) ?? false,
    twoColumns: isInLayoutRow(editor.state.doc, editor.state.selection.from),
  };
}

/** What the caret is in, re-read on every update and focus change -- the toolbar and bubble's pressed states. */
export function useFormatState(editor: Editor | null) {
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

  return editor ? readFormatState(editor) : null;
}
