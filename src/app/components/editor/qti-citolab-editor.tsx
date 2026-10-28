import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Columns2,
  GripVertical,
  Italic,
  List,
  Redo2,
  RemoveFormatting,
  Square,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import { createEditor, defineUpdateHandler, type Editor } from "prosekit/core";
import { redo, undo } from "prosekit/pm/history";
import {
  BlockHandlePositioner,
  BlockHandleRoot,
} from "prosekit/react/block-handle";
import { NodeRangeSelection } from "@citolab/prose-extensions/block-select";
import {
  deleteBlockSelection,
  moveBlockSelection,
} from "./block-select-commands";
import type { QtiComposeContext } from "@citolab/prose-qti/item-export/pm-qti-item";
import { useDebouncedCallback } from "use-debounce";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defineQtiPlaygroundExtension } from "./qti-citolab-editor-extensions";
import {
  findUnsupportedItemFeatures,
  type UnsupportedItemFeature,
} from "./unsupported-interactions";
import {
  CONTENT_LOSS_LABELS,
  findContentLoss,
  type ContentLoss,
} from "./content-loss";
import { EditorGuardPanel } from "./editor-guard-panel";
import { makeOneColumn, makeTwoColumns } from "./qti-layout-commands";
import {
  exportItem,
  importItemDoc,
  readItemIdentity,
} from "./editor-roundtrip";
import { useFormatState, type MarkCommands } from "./editor-format-state";
import { INSERT_ENTRIES } from "./insert-entries";
import { InsertMenu } from "./insert-menu";
import { SlashMenu } from "./slash-menu";
import { SelectionBubble } from "./selection-bubble";
import { EditorContextMenu } from "./editor-context-menu";
import {
  createItemAssetResolver,
  mapItemAssetUrls,
} from "../../qti/asset-urls";

// prosekit's structural sheet only. Its sibling `typography.css` is a general-purpose prose
// theme -- 16px paragraphs with their own padding, px-sized headings, a bar down the side of
// every blockquote -- and it is unlayered, so it outranks the whole item theme. That is the
// second reason the editor and the preview disagreed: the item's own type never got a say.
import "prosekit/basic/style.css";
// The item theme, through prose-qti's own entry point. It re-exports exactly the sheet the
// player adopts into item-container's shadow root (byte-identical to
// @citolab/qti-components/item.css) and pulls core-css.css in after it -- an order the package
// documents as load-bearing, because a cascade layer's position is fixed at its first mention.
// Importing @qti-components/theme/item.css directly resolved to the app's own hoisted copy of
// that package, a major version behind the one qti-components ships, which is what made the
// editor paint a different item than the preview next to it.
import "@citolab/prose-qti/qti-prose.css";
// The other half of the decorator opt-in wired up in qti-citolab-editor-extensions.ts. Kept out of
// qti-prose.css by the package on purpose, so a player host never picks it up. It declares its own
// `--qti-edit-*` tokens as well as the rules reading them, and stays unlayered by design -- app CSS
// is meant to win -- so it must load before item.css and this component's own sheet below.
import "@citolab/prose-qti/decorations.css";
import "../../qti/item.css";
import "./qti-citolab-editor.css";

/**
 * ProseMirror renders the item into the app's own document, so an asset path that
 * is relative to the item file ("../img/pic.jpg") is resolved by the browser
 * against the page URL instead -- which is why every image in an item opened
 * from an uploaded package came back broken. Resolve those paths against the
 * item's own location before importing, exactly as the preview player does.
 *
 * The rewrite is for display only: `assetOriginals` remembers what the author
 * wrote, keyed by the resolved URL, and `restoreAuthoredAssetUrls` puts it back
 * on the way out. Exporting the resolved URLs instead would bake this session's
 * package id into the item and orphan it from its own images.
 */
function restoreAuthoredAssetUrls(
  xml: string,
  assetOriginals: Map<string, string>,
): string {
  if (assetOriginals.size === 0) return xml;
  return mapItemAssetUrls(xml, (value) => assetOriginals.get(value) ?? value);
}

/**
 * The gutter affordance for `blockSelectExtension`. That extension gives whole-block selection
 * behaviour but no way to see or reach it -- until now it only answered to shift+arrow and to a
 * drag across block boundaries. This puts a grip in the left margin of whatever block the pointer
 * is over, and clicking it makes the same `NodeRangeSelection` those two gestures produce, so the
 * blocks highlight the way the extension already draws them.
 *
 * prosekit resolves the hovered block for us, and its rule is a good fit for QTI: it descends to
 * the nearest textblock/atom/isolating node, then hands back the PARENT when the pointer is over
 * that parent's first child. So hovering a prompt offers the whole interaction, while hovering the
 * second choice onwards offers just that choice.
 *
 * Deliberately not `BlockHandleDraggable`, prosekit's other handle: it adds drag-to-move, which
 * would let a `qti-simple-choice` be dragged clean out of its interaction. Selection only here.
 */
function BlockSelectHandle({ editor }: { editor: Editor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // A ref, not state: the selection has to be made from a pointerdown handler, and a state value
  // read there would be a render behind.
  const hoveredPosRef = useRef<number | null>(null);

  const selectHoveredBlock = () => {
    const pos = hoveredPosRef.current;
    if (pos == null) return;
    editor.exec((state, dispatch) => {
      if (!dispatch) return true;
      try {
        dispatch(state.tr.setSelection(NodeRangeSelection.create(state.doc, pos)));
      } catch {
        // The document moved under the hover (an async node view settling, say). Losing the
        // click is the right outcome; selecting the wrong block is not.
        return false;
      }
      return true;
    });
  };

  const run = (command: Parameters<Editor["exec"]>[0]) => {
    editor.exec(command);
    setMenuOpen(false);
  };

  return (
    <BlockHandleRoot
      editor={editor}
      onStateChange={(event) => {
        // Hold the last block while the menu is open. Radix puts `pointer-events: none` on the
        // body when it opens, which takes the pointer off the editor and makes prosekit report
        // "no block hovered" -- clearing the very block the menu is about to act on.
        if (menuOpen) return;
        hoveredPosRef.current = event.detail ? event.detail.pos : null;
      }}
    >
      {/* Hoisted because both of the editor's own wrappers clip: the body scrolls on
          `overflow-y-auto`, and the landing page's frame adds `overflow-hidden`. Hoisting puts the
          grip in the top layer, and the positioner's autoUpdate keeps it with its block on scroll. */}
      {/* Hidden while closed: before the first hover the positioner sits at the page's top-left
          corner and painted a stray grip there. Kept visible while its own menu is open, because
          that is exactly when Radix takes the pointer away and prosekit reports it closed. */}
      <BlockHandlePositioner
        placement="left"
        hoist
        offset={6}
        className="data-[state=closed]:not-has-[[data-state=open]]:invisible"
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Block actions"
              title="Select this block"
              // Radix opens the menu on pointerdown; selecting here runs first, so the block is
              // already selected -- and visibly ringed -- before the menu appears over it.
              onPointerDown={selectHoveredBlock}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-700"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-44"
            // Radix restores focus to the trigger -- the grip -- when the menu closes, and it does
            // so asynchronously, so focusing the editor from the click handler loses the race and
            // the keyboard shortcuts stay dead until the user clicks back into the text. Take the
            // restore over and put focus where the selection is. `focus()` leaves it untouched.
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              editor.focus();
            }}
          >
            <DropdownMenuItem
              disabled={!editor.canExec(moveBlockSelection(-1))}
              onSelect={() => run(moveBlockSelection(-1))}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Move up
              <span className="ml-auto text-xs text-gray-400">⌥↑</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.canExec(moveBlockSelection(1))}
              onSelect={() => run(moveBlockSelection(1))}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Move down
              <span className="ml-auto text-xs text-gray-400">⌥↓</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editor.canExec(deleteBlockSelection)}
              onSelect={() => run(deleteBlockSelection)}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
              <span className="ml-auto text-xs text-gray-400">⌫</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  );
}

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-citolab-50 aria-pressed:text-citolab-800 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

const ToolbarDivider = () => <div className="mx-1 h-5 w-px bg-gray-200" />;

/**
 * A floating bar over the top of the item rather than a strip across the frame: it reads as a
 * tool, not as part of the item. It dims while the author is elsewhere on the page and lights up
 * on focus, hover, or while one of its menus is open (`group/editor` on the editor root).
 */
function QtiCitolabEditorToolbar({ editor }: { editor: Editor }) {
  const formatState = useFormatState(editor);
  const commands = editor.commands as MarkCommands;

  const runCommand = (command?: () => boolean) => {
    editor.focus();
    command?.();
  };

  return (
    <div className="flex justify-center bg-white px-3 pt-3 pb-1">
      <div
        className="flex flex-wrap items-center gap-0.5 rounded-xl border border-gray-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur transition-opacity duration-200 opacity-70 group-focus-within/editor:opacity-100 hover:opacity-100 has-[[data-state=open]]:opacity-100"
        onMouseDown={(event) => event.preventDefault()}
        data-testid="editor-toolbar"
      >
        <InsertMenu editor={editor} entries={INSERT_ENTRIES} />

        <ToolbarDivider />

        <ToolbarButton
          label="Undo"
          disabled={!editor.canExec(undo)}
          onClick={() => editor.exec(undo)}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.canExec(redo)}
          onClick={() => editor.exec(redo)}
        >
          <Redo2 />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          pressed={formatState?.bold ?? false}
          onClick={() => runCommand(commands.toggleBold)}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          pressed={formatState?.italic ?? false}
          onClick={() => runCommand(commands.toggleItalic)}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          pressed={formatState?.underline ?? false}
          onClick={() => runCommand(commands.toggleUnderline)}
        >
          <Underline />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          pressed={formatState?.bulletList ?? false}
          onClick={() =>
            runCommand(() => commands.toggleList?.({ kind: "bullet" }) ?? false)
          }
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="Clear formatting (Ctrl/Cmd+\)"
          onClick={() => runCommand(commands.clearFormatting)}
        >
          <RemoveFormatting />
        </ToolbarButton>

        <ToolbarDivider />

        {/* One column / two columns, as a state rather than an action: the pressed button is the
            layout the caret is in, so the pair doubles as a read-out of where you are. Only these
            two, and only 6/6 -- an imported item's other widths are preserved but not authored
            here. Each stays enabled while its command reports it can run, which is what makes "one
            column" dead outside a row and "two columns" dead inside one. */}
        <ToolbarButton
          label="One column"
          pressed={formatState ? !formatState.twoColumns : true}
          disabled={!editor.canExec(makeOneColumn) && !!formatState?.twoColumns}
          onClick={() => runCommand(() => editor.exec(makeOneColumn))}
        >
          <Square />
        </ToolbarButton>
        <ToolbarButton
          label="Two columns"
          pressed={formatState?.twoColumns ?? false}
          disabled={!editor.canExec(makeTwoColumns) && !formatState?.twoColumns}
          onClick={() => runCommand(() => editor.exec(makeTwoColumns))}
        >
          <Columns2 />
        </ToolbarButton>
      </div>
    </div>
  );
}

type Props = {
  editorSessionKey: number;
  sourceXml: string;
  onSourceChange: (nextXml: string) => void;
  /**
   * Where the item being edited lives, when it lives somewhere: the package URL
   * of an item opened from an uploaded package, or the path of an example file.
   * Its asset paths are resolved against this for display -- see
   * `restoreAuthoredAssetUrls`. Omitted for a new or shared item, which has no
   * location of its own, so its paths are left exactly as authored.
   */
  assetBaseHref?: string;
  className?: string;
  /**
   * The two classes below mirror whatever wraps the PLAYER on the host page, so the item is laid
   * out the same in both. They are two knobs rather than one because the player's own wrapper is
   * two elements -- a padded scroll area and a width-capped column inside it -- and folding them
   * together would put the page's padding inside the cap and narrow the column by it.
   *
   * The preview page renders the player as a full-width `qti-item` with `p-4`, which is the
   * default here. The assessment page centres it, so it passes its own pair.
   *
   * The default's extra LEFT padding is the one place the editor deliberately does not mirror the
   * player: the block handle is positioned in the margin to the left of each block, so without a
   * gutter it lands on the frame border and gets clipped. The assessment page needs none of this,
   * because it centres the item column and there is already room beside it.
   */
  surfaceClassName?: string;
  contentClassName?: string;
  /**
   * Height of the editor frame. The default suits a full-page editor; hosts that give the editor
   * a fixed box of their own (the landing hero) pass `h-full` so the frame fills that box and the
   * item scrolls inside it rather than growing past it. Kept separate from `className` because
   * this class has to be *replaced*, not appended -- two competing height classes in one string
   * resolve by stylesheet order, not by argument order.
   */
  heightClassName?: string;
  /**
   * Emit the editor's own serialisation of the item once, as soon as the document has settled,
   * before the user has touched anything.
   *
   * The exporter rebuilds the item from the ProseMirror document rather than patching the source,
   * so its output has its own shape: attributes in its own order, `xsi:schemaLocation` rather than
   * `xsi:schema-location`, SCORE/MAXSCORE outcome declarations filled in, prompt text wrapped in a
   * `<p>`. A host that shows the XML next to the editor would otherwise watch all of that land the
   * instant the first character is typed, which reads as the editor mangling the item.
   *
   * Emitting it up front trades that for one reformat at open, which is legible: from then on the
   * XML pane only moves where the edit moved. Off by default because the emit is a real change
   * notification -- a host that persists what it receives (the assessment page writes back into
   * the package) would record an edit for merely opening the editor.
   */
  normalizeOnLoad?: boolean;
  /**
   * Where to send the author when the item cannot be edited here without losing content: the
   * host's XML editor for the same item. Omitted where the host has none (the assessment page),
   * and the refusal then only explains.
   */
  onEditXml?: () => void;
};

export function QtiCitolabEditor({
  editorSessionKey,
  sourceXml,
  onSourceChange,
  assetBaseHref,
  className,
  surfaceClassName = "p-4 pl-11",
  contentClassName = "",
  heightClassName = "min-h-[75vh]",
  normalizeOnLoad = false,
  onEditXml,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onSourceChangeRef = useRef(onSourceChange);
  const initialXmlRef = useRef(sourceXml);
  const assetBaseHrefRef = useRef(assetBaseHref);
  // Authored asset path per resolved URL, for the session the editor is mounted
  // on. Rebuilt on every import, because the item -- and its folder -- changes.
  const assetOriginalsRef = useRef<Map<string, string>>(new Map());
  const itemIdentityRef = useRef<QtiComposeContext>(readItemIdentity(sourceXml));
  const normalizeOnLoadRef = useRef(normalizeOnLoad);
  const baselineDocJsonRef = useRef<string | null>(null);
  const isReadyForExportRef = useRef(false);
  const lastEmittedXmlRef = useRef(sourceXml);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<
    UnsupportedItemFeature[]
  >([]);
  // What a load-and-save of this item would lose (content-loss.ts), and whether the author chose
  // to edit it anyway. Both belong to one item: the hosts remount the editor per session key.
  const [contentLosses, setContentLosses] = useState<ContentLoss[]>([]);
  const [editDespiteLosses, setEditDespiteLosses] = useState(false);

  onSourceChangeRef.current = onSourceChange;

  // Only read inside the settle timer, 500ms after mount, so an effect is early enough -- and it
  // keeps the flag out of the mount effect's deps, where it would remount the editor on a toggle.
  useEffect(() => {
    normalizeOnLoadRef.current = normalizeOnLoad;
  }, [normalizeOnLoad]);

  useEffect(() => {
    initialXmlRef.current = sourceXml;
    assetBaseHrefRef.current = assetBaseHref;
    itemIdentityRef.current = readItemIdentity(sourceXml);
  }, [editorSessionKey]);

  const extension = useMemo(() => defineQtiPlaygroundExtension(), []);

  const debouncedExport = useDebouncedCallback((nextEditor: Editor) => {
    if (!isReadyForExportRef.current) return;

    try {
      const xml = restoreAuthoredAssetUrls(
        exportItem(nextEditor.state.doc, itemIdentityRef.current),
        assetOriginalsRef.current,
      );
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

    // Opening an item the exporter can't write back would save it without the
    // parts it cannot represent, so refuse before the editor mounts. This covers
    // more than interactions -- see findUnsupportedItemFeatures.
    const unsupported = findUnsupportedItemFeatures(initialXml);
    setUnsupportedFeatures(unsupported);
    if (unsupported.length > 0) {
      setImportError(null);
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
      const resolveAssetUrl = createItemAssetResolver(assetBaseHrefRef.current);
      const assetOriginals = new Map<string, string>();
      const displayXml = resolveAssetUrl
        ? mapItemAssetUrls(initialXml, resolveAssetUrl, (from, to) =>
            assetOriginals.set(to, from),
          )
        : initialXml;
      assetOriginalsRef.current = assetOriginals;
      const doc = importItemDoc(displayXml, schema);

      // The allowlist above knows tags; this knows outcomes. Save the document straight back
      // and compare: an attribute without a slot in the schema, MathML, a class the theme reads,
      // a correct response the exporter derives differently -- each survives opening and is gone
      // on the first keystroke, because every edit re-exports the whole item. Checked before the
      // editor mounts, so a refused item is never written back.
      if (!editDespiteLosses) {
        const losses = findContentLoss(
          initialXml,
          restoreAuthoredAssetUrls(
            exportItem(doc, itemIdentityRef.current),
            assetOriginals,
          ),
        );
        setContentLosses(losses);
        if (losses.length > 0) return undefined;
      }

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

        // Same moment, same reason: the doc is only worth serialising once the node views have
        // stopped moving. Emitted directly rather than through the debounce so it cannot be
        // coalesced with -- or land after -- the user's first real edit.
        if (!normalizeOnLoadRef.current) return;
        try {
          const normalizedXml = restoreAuthoredAssetUrls(
            exportItem(nextEditor.state.doc, itemIdentityRef.current),
            assetOriginalsRef.current,
          );
          if (normalizedXml === lastEmittedXmlRef.current) return;
          lastEmittedXmlRef.current = normalizedXml;
          onSourceChangeRef.current(normalizedXml);
        } catch (error) {
          // A source the editor can open but not serialise is the exporter's problem, not the
          // host's: leave the original XML on screen rather than blanking it.
          console.error("Failed to normalize QTI item on load:", error);
        }
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
      // Emit whatever is still sitting in the export debounce before tearing the editor
      // down: closing it within 600ms of the last keystroke used to drop that edit. The
      // flush has to happen while `isReadyForExportRef` is still true, or it no-ops.
      debouncedExportRef.current.flush();
      isReadyForExportRef.current = false;
      removeUpdateListener?.();
      editorRef.current?.unmount();
      editorRef.current = null;
      setEditor(null);
    };
  }, [editorSessionKey, extension, editDespiteLosses]);

  useEffect(() => {
    return () => {
      debouncedExport.cancel();
    };
  }, [debouncedExport]);

  const guardClassName = `qti-citolab-editor flex ${heightClassName} items-center justify-center overflow-y-auto p-6 ${className ?? ""}`;

  if (unsupportedFeatures.length > 0) {
    return (
      <EditorGuardPanel
        className={guardClassName}
        title="This item can't be edited visually"
        intro="It uses QTI the editor cannot edit yet:"
        // Each entry names what was found and what saving would do to it: the tag alone reads
        // as a missing feature rather than as data loss.
        items={unsupportedFeatures.map((feature) => ({
          label: feature.label,
          detail: feature.detail,
        }))}
        outro="Editing it here would drop that content, so change it in its XML instead."
        onEditXml={onEditXml}
      />
    );
  }

  if (contentLosses.length > 0 && !editDespiteLosses) {
    return (
      <EditorGuardPanel
        className={guardClassName}
        title="Editing this item here would change it"
        intro="The editor would save this item without some of what it contains:"
        items={contentLosses.map((loss) => ({
          label: CONTENT_LOSS_LABELS[loss.code],
          detail: loss.detail,
        }))}
        outro="Edit it in the XML editor to keep everything as it is."
        onEditXml={onEditXml}
        onEditAnyway={() => setEditDespiteLosses(true)}
      />
    );
  }

  if (importError) {
    return (
      <EditorGuardPanel
        className={guardClassName}
        title="QTI editor unavailable"
        intro={importError}
        outro="Switch to the XML editor to keep editing this item."
        onEditXml={onEditXml}
      />
    );
  }

  return (
    <div
      className={`qti-citolab-editor group/editor flex ${heightClassName} flex-col ${className ?? ""}`}
    >
      {editor ? <QtiCitolabEditorToolbar editor={editor} /> : null}
      <div
        className={`min-h-0 flex-1 overflow-y-auto bg-white ${surfaceClassName}`}
      >
        {/* Rendered before the editor exists too, so the mount div keeps its place in the tree:
            wrapping it only once the editor is up would make React replace the div ProseMirror
            just mounted into. */}
        <EditorContextMenu editor={editor} entries={INSERT_ENTRIES}>
          <div
            ref={mountRef}
            className={`ProseMirror-host w-full ${contentClassName}`}
          />
        </EditorContextMenu>
        {editor ? (
          <>
            <BlockSelectHandle editor={editor} />
            <SlashMenu editor={editor} entries={INSERT_ENTRIES} />
            <SelectionBubble editor={editor} />
          </>
        ) : null}
      </div>
    </div>
  );
}
