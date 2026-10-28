import { useState, type ReactNode } from "react";
import {
  Bold,
  ClipboardPaste,
  Copy,
  Italic,
  Plus,
  Scissors,
  Trash2,
  Underline,
  WandSparkles,
} from "lucide-react";
import type { Editor } from "prosekit/core";
import type { Node as PmNode } from "prosekit/pm/model";
import { NodeSelection, TextSelection } from "prosekit/pm/state";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { MarkCommands } from "./editor-format-state";
import {
  groupEntries,
  OBJECT_NODE_LABELS,
  runEntry,
  type InsertEntry,
} from "./insert-entries";

const MOD = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl+";

type MenuState = {
  hasRange: boolean;
  inText: boolean;
  /** What can run where the menu was opened -- the same dry run the "/" menu does. */
  runnable: InsertEntry[];
  /** The interaction, image or table under the pointer. */
  target: { pos: number; label: string } | null;
};

const EMPTY_MENU: MenuState = {
  hasRange: false,
  inText: false,
  runnable: [],
  target: null,
};

/** The nearest object at or around `inside` (posAtCoords' innermost node; -1 = top level). */
function objectAt(doc: PmNode, inside: number): MenuState["target"] {
  if (inside < 0) return null;
  const node = doc.nodeAt(inside);
  const label = node && OBJECT_NODE_LABELS.get(node.type.name);
  if (label) return { pos: inside, label };
  const $pos = doc.resolve(inside);
  for (let depth = $pos.depth; depth > 0; depth--) {
    const ancestorLabel = OBJECT_NODE_LABELS.get($pos.node(depth).type.name);
    if (ancestorLabel) return { pos: $pos.before(depth), label: ancestorLabel };
  }
  return null;
}

/**
 * Right-click menu on the document: clipboard, marks, "turn into", insert, and deleting the
 * interaction (or image, or table) under the pointer as one piece. Shift+right-click keeps the
 * browser's own menu, which is where the spellchecker's suggestions live.
 */
export function EditorContextMenu({
  editor,
  entries,
  children,
}: {
  /** Null until the editor has mounted; the menu stays out of the way until then. */
  editor: Editor | null;
  entries: InsertEntry[];
  children: ReactNode;
}) {
  const [menu, setMenu] = useState<MenuState>(EMPTY_MENU);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger
        asChild
        disabled={!editor}
        onContextMenuCapture={(event) => {
          // Stops Radix (bubble phase) but keeps the browser default.
          if (event.shiftKey) event.stopPropagation();
        }}
        onContextMenu={(event) => {
          if (editor) setMenu(prepareMenu(editor, entries, event));
        }}
      >
        {children}
      </ContextMenuTrigger>
      {editor ? <EditorContextMenuContent editor={editor} menu={menu} /> : null}
    </ContextMenu>
  );
}

// Like a native editor: a right-click outside the selection moves the caret (or selects the atom)
// there first, so the menu acts on what was clicked, not on wherever the caret was.
function prepareMenu(
  editor: Editor,
  entries: InsertEntry[],
  event: React.MouseEvent,
): MenuState {
  const view = editor.view;
  const hit = view.posAtCoords({ left: event.clientX, top: event.clientY });
  let selection = view.state.selection;
  if (hit && (selection.empty || hit.pos < selection.from || hit.pos > selection.to)) {
    const { doc } = view.state;
    const node = hit.inside >= 0 ? doc.nodeAt(hit.inside) : null;
    selection =
      node?.isAtom && NodeSelection.isSelectable(node)
        ? NodeSelection.create(doc, hit.inside)
        : TextSelection.near(doc.resolve(hit.pos));
    view.dispatch(view.state.tr.setSelection(selection));
  }
  return {
    hasRange: !selection.empty,
    inText:
      !(selection instanceof NodeSelection) &&
      selection.$from.parent.isTextblock,
    runnable: entries.filter((entry) => entry.canRun(editor)),
    target: hit ? objectAt(view.state.doc, hit.inside) : null,
  };
}

function EditorContextMenuContent({
  editor,
  menu,
}: {
  editor: Editor;
  menu: MenuState;
}) {
  const commands = editor.commands as MarkCommands;

  const clipboardBlocked = () =>
    window.alert(
      `The browser did not allow access to the clipboard. Use ${MOD}C, ${MOD}X and ${MOD}V instead.`,
    );

  const copy = async (cut: boolean) => {
    const view = editor.view;
    const { dom, text } = view.serializeForClipboard(
      view.state.selection.content(),
    );
    if (cut) view.dispatch(view.state.tr.deleteSelection().scrollIntoView());
    view.focus();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([dom.innerHTML], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } catch {
      clipboardBlocked();
    }
  };

  const paste = async () => {
    const view = editor.view;
    view.focus();
    try {
      const [item] = await navigator.clipboard.read();
      if (item?.types.includes("text/html")) {
        view.pasteHTML(await (await item.getType("text/html")).text());
      } else if (item?.types.includes("text/plain")) {
        view.pasteText(await (await item.getType("text/plain")).text());
      }
    } catch {
      clipboardBlocked();
    }
  };

  const removeTarget = () => {
    if (!menu.target) return;
    const view = editor.view;
    const { tr } = view.state;
    tr.setSelection(NodeSelection.create(tr.doc, menu.target.pos));
    view.dispatch(tr.deleteSelection().scrollIntoView());
    view.focus();
  };

  const turnInto = menu.runnable.filter((entry) => entry.turnInto);
  const insertable = groupEntries(menu.runnable);

  return (
    <ContextMenuContent
      className="w-56"
      data-testid="editor-context-menu"
      // Back to the document, not to the trigger, so typing carries on where the menu acted.
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        editor.focus();
      }}
    >
      <ContextMenuItem disabled={!menu.hasRange} onSelect={() => void copy(true)}>
        <Scissors />
        Cut
        <ContextMenuShortcut>{MOD}X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled={!menu.hasRange} onSelect={() => void copy(false)}>
        <Copy />
        Copy
        <ContextMenuShortcut>{MOD}C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => void paste()}>
        <ClipboardPaste />
        Paste
        <ContextMenuShortcut>{MOD}V</ContextMenuShortcut>
      </ContextMenuItem>

      {menu.inText && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => commands.toggleBold?.()}>
            <Bold />
            Bold
            <ContextMenuShortcut>{MOD}B</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => commands.toggleItalic?.()}>
            <Italic />
            Italic
            <ContextMenuShortcut>{MOD}I</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => commands.toggleUnderline?.()}>
            <Underline />
            Underline
            <ContextMenuShortcut>{MOD}U</ContextMenuShortcut>
          </ContextMenuItem>
          {turnInto.length > 0 && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <WandSparkles />
                Turn into
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {turnInto.map((entry) => (
                  <ContextMenuItem
                    key={entry.id}
                    onSelect={() => runEntry(editor, entry)}
                  >
                    <entry.icon className="text-gray-500" />
                    {entry.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        </>
      )}

      {insertable.length > 0 && (
        <>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Plus />
              Insert
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-[70vh] w-56 overflow-y-auto">
              {insertable.map((section, index) => (
                <ContextMenuGroup key={section.group}>
                  {index > 0 && <ContextMenuSeparator />}
                  <ContextMenuLabel className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    {section.label}
                  </ContextMenuLabel>
                  {section.entries.map((entry) => (
                    <ContextMenuItem
                      key={entry.id}
                      onSelect={() => runEntry(editor, entry)}
                    >
                      <entry.icon className="text-gray-600" />
                      {entry.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuGroup>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </>
      )}

      {menu.target && (
        <>
          <ContextMenuSeparator />
          <ContextMenuLabel className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
            {menu.target.label}
          </ContextMenuLabel>
          <ContextMenuItem variant="destructive" onSelect={removeTarget}>
            <Trash2 />
            Delete
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );
}
