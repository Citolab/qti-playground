import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Columns2,
  GripVertical,
  List,
  Plus,
  Redo2,
  Square,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import {
  createEditor,
  defineFocusChangeHandler,
  defineUpdateHandler,
  isMarkActive,
  type Editor,
} from "prosekit/core";
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
import {
  qtiItemFromProsemirror,
  type QtiComposeContext,
} from "@citolab/prose-qti/integration/save-qti-item";
import { roundtripXmlToPm } from "@citolab/prose-qti/components/shared";
import { roundtripQtiItem } from "@citolab/prose-qti/qti3-item-import/roundtrip-qti-item";
import { listInteractionDescriptors } from "@citolab/prose-qti/core/interactions/composer";
import type { InteractionDescriptor } from "@citolab/prose-qti/interfaces";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defineQtiPlaygroundExtension } from "./qti-citolab-editor-extensions";
import {
  findUnsupportedItemFeatures,
  type UnsupportedItemFeature,
} from "./unsupported-interactions";
import { InteractionIcon } from "./interaction-icons";
import {
  isInLayoutRow,
  makeOneColumn,
  makeTwoColumns,
} from "./qti-layout-commands";
import {
  createItemAssetResolver,
  mapItemAssetUrls,
} from "../../qti/asset-urls";
import {
  EDITOR_SUPPORTED_BLOCKS,
  EDITOR_SUPPORTED_INTERACTIONS,
} from "../../pages/item-source";

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
import "../../qti/item.css";
import "./qti-citolab-editor.css";

// The importer only carries the item BODY into ProseMirror, so the identity on the
// `<qti-assessment-item>` root is not in the document the exporter sees. Without it the exporter
// mints a fresh `item-xxxxxx` identifier and the title "Untitled Item" on the first keystroke --
// which, for an item inside a package, silently orphans it from the manifest and from any test
// that references it. Read the identity off the source once and hand it back on every export.
function readItemIdentity(xml: string): QtiComposeContext {
  const root = new DOMParser()
    .parseFromString(xml, "application/xml")
    .querySelector("qti-assessment-item");
  if (!root) return {};

  const identity: QtiComposeContext = {};
  const identifier = root.getAttribute("identifier");
  const title = root.getAttribute("title");
  const lang = root.getAttribute("xml:lang") ?? root.getAttribute("lang");
  if (identifier) identity.identifier = identifier;
  if (title) identity.title = title;
  if (lang) identity.lang = lang;
  return identity;
}

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

type InsertableInteraction = InteractionDescriptor & {
  insertCommand: NonNullable<InteractionDescriptor["insertCommand"]>;
};

// The published package ships the insert commands but no menu UI, so the menu
// is ours: one entry per registered descriptor that can insert itself.
const INTERACTION_LABELS: Record<string, string> = {
  qtiChoiceInteraction: "Choice",
  qtiExtendedTextInteraction: "Extended text",
  qtiGapMatchInteraction: "Gap match",
  qtiHottextInteraction: "Hottext",
  qtiInlineChoiceInteraction: "Inline choice",
  qtiMatchInteraction: "Match",
  qtiMatchInteractionTabular: "Match (tabular)",
  qtiOrderInteraction: "Order",
  qtiSelectPointInteraction: "Select point",
  qtiTextEntryInteraction: "Text entry",
  qtiRubricBlock: "Rubric block",
};

function interactionLabel(descriptor: InteractionDescriptor): string {
  return (
    INTERACTION_LABELS[descriptor.nodeTypeName] ??
    descriptor.tagName
      .replace(/^qti-/, "")
      .replace(/-interaction$/, "")
      .replace(/-/g, " ")
      .replace(/^./, (character) => character.toUpperCase())
  );
}

// Registry order is alphabetical by package, which scatters related
// interactions across the grid. Group them by family instead; anything
// registered upstream that we don't list yet lands at the end.
const INTERACTION_ORDER = [
  "qtiChoiceInteraction",
  "qtiTextEntryInteraction",
  "qtiInlineChoiceInteraction",
  "qtiExtendedTextInteraction",
  "qtiOrderInteraction",
  "qtiMatchInteraction",
  "qtiMatchInteractionTabular",
  "qtiGapMatchInteraction",
  "qtiHottextInteraction",
  "qtiSelectPointInteraction",
];

function displayRank(descriptor: InteractionDescriptor): number {
  const index = INTERACTION_ORDER.indexOf(descriptor.nodeTypeName);
  return index === -1 ? INTERACTION_ORDER.length : index;
}

/**
 * What the Insert menu offers: the registry, narrowed to what the editor is
 * allowed to open again.
 *
 * The allowlist has to apply here too, not just at the door. Offering an
 * interaction the gate refuses lets an author insert one, save it into the
 * package, and then be locked out of the item they just wrote -- the one failure
 * mode the gate exists to prevent, reached from inside the editor.
 *
 * Filtered on `tagName`, so match and its tabular variant both survive: they are
 * two descriptors over one tag, and each is its own menu entry.
 */
const EDITOR_SUPPORTED_TAGS = new Set([
  ...EDITOR_SUPPORTED_INTERACTIONS,
  ...EDITOR_SUPPORTED_BLOCKS,
]);

const INSERTABLE_INTERACTIONS = listInteractionDescriptors()
  .filter(
    (descriptor): descriptor is InsertableInteraction =>
      descriptor.insertCommand != null &&
      EDITOR_SUPPORTED_TAGS.has(descriptor.tagName.toLowerCase()),
  )
  .sort((left, right) => displayRank(left) - displayRank(right));

function InsertInteractionMenu({ editor }: { editor: Editor }) {
  const interactions = INSERTABLE_INTERACTIONS.filter(
    (descriptor) => descriptor.nodeTypeName !== "qtiRubricBlock",
  );
  const blocks = INSERTABLE_INTERACTIONS.filter(
    (descriptor) => descriptor.nodeTypeName === "qtiRubricBlock",
  );

  // Tiles rather than rows: at grid size the glyph carries the meaning, and
  // eleven entries fit in one popover without paging.
  const renderTile = (descriptor: InsertableInteraction) => {
    const command = descriptor.insertCommand;
    return (
      <DropdownMenuItem
        key={descriptor.nodeTypeName}
        disabled={!editor.canExec(command)}
        title={`Insert ${descriptor.tagName}`}
        onSelect={() => {
          editor.focus();
          editor.exec(command);
        }}
        className="h-auto cursor-pointer flex-col items-center gap-1.5 px-1 py-2 text-center [&_svg]:size-7"
      >
        <InteractionIcon
          nodeTypeName={descriptor.nodeTypeName}
          className="text-gray-600"
        />
        <span className="text-[11px] leading-tight font-medium">
          {interactionLabel(descriptor)}
        </span>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="ghost" title="Insert">
          <Plus className="mr-1 h-4 w-4" />
          Insert
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[19rem] p-2">
        <DropdownMenuLabel className="px-1 py-1 text-xs text-gray-500">
          Interactions
        </DropdownMenuLabel>
        <div className="grid grid-cols-3 gap-1">
          {interactions.map(renderTile)}
        </div>
        {blocks.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-1 py-1 text-xs text-gray-500">
              Blocks
            </DropdownMenuLabel>
            <div className="grid grid-cols-3 gap-1">
              {blocks.map(renderTile)}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
      <BlockHandlePositioner placement="left" hoist offset={6}>
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

type FormatToolbarState = {
  bold: boolean;
  underline: boolean;
  bulletList: boolean;
  twoColumns: boolean;
};

function readFormatToolbarState(editor: Editor): FormatToolbarState {
  const nodes = editor.nodes as {
    list?: { isActive: (attrs?: { kind?: string }) => boolean };
  };

  return {
    bold: isMarkActive(editor.state, "bold"),
    underline: isMarkActive(editor.state, "underline"),
    bulletList: nodes.list?.isActive({ kind: "bullet" }) ?? false,
    twoColumns: isInLayoutRow(editor.state.doc, editor.state.selection.from),
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

      <div className="mx-1 h-5 w-px bg-gray-200" />

      {/* One column / two columns, as a state rather than an action: the pressed button is the
          layout the caret is in, so the pair doubles as a read-out of where you are. Only these
          two, and only 6/6 -- an imported item's other widths are preserved but not authored here.
          Each stays enabled while its command reports it can run, which is what makes "one column"
          dead outside a row and "two columns" dead inside one. */}
      <Button
        type="button"
        size="sm"
        variant={formatState && !formatState.twoColumns ? "secondary" : "ghost"}
        disabled={!editor.canExec(makeOneColumn) && !!formatState?.twoColumns}
        aria-label="One column"
        aria-pressed={formatState ? !formatState.twoColumns : true}
        title="One column"
        onClick={() => runCommand(() => editor.exec(makeOneColumn))}
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={formatState?.twoColumns ? "secondary" : "ghost"}
        disabled={!editor.canExec(makeTwoColumns) && !formatState?.twoColumns}
        aria-label="Two columns"
        aria-pressed={formatState?.twoColumns ?? false}
        title="Two columns"
        onClick={() => runCommand(() => editor.exec(makeTwoColumns))}
      >
        <Columns2 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <InsertInteractionMenu editor={editor} />
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
        qtiItemFromProsemirror(nextEditor.state.doc, itemIdentityRef.current),
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
      const itemBodyXml = roundtripQtiItem(displayXml);
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

        // Same moment, same reason: the doc is only worth serialising once the node views have
        // stopped moving. Emitted directly rather than through the debounce so it cannot be
        // coalesced with -- or land after -- the user's first real edit.
        if (!normalizeOnLoadRef.current) return;
        try {
          const normalizedXml = restoreAuthoredAssetUrls(
            qtiItemFromProsemirror(
              nextEditor.state.doc,
              itemIdentityRef.current,
            ),
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
  }, [editorSessionKey, extension]);

  useEffect(() => {
    return () => {
      debouncedExport.cancel();
    };
  }, [debouncedExport]);

  if (unsupportedFeatures.length > 0) {
    return (
      <div
        className={`qti-citolab-editor flex ${heightClassName} items-center justify-center p-6 ${className ?? ""}`}
      >
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Unsupported item</p>
          <p className="mt-1">This item uses QTI the editor cannot edit yet:</p>
          {/* Each entry names what was found and what saving would do to it: the
              tag alone reads as a missing feature rather than as data loss. */}
          <ul className="mt-1 space-y-1 text-xs">
            {unsupportedFeatures.map((feature) => (
              <li key={feature.label}>
                <span className="font-mono">{feature.label}</span>
                <span className="text-amber-800"> — {feature.detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-amber-800">
            Editing it here would drop that content, so this item can only be
            changed in its XML.
          </p>
        </div>
      </div>
    );
  }

  if (importError) {
    return (
      <div
        className={`qti-citolab-editor flex ${heightClassName} items-center justify-center p-6 ${className ?? ""}`}
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
      className={`qti-citolab-editor flex ${heightClassName} flex-col ${className ?? ""}`}
    >
      {editor ? <QtiCitolabEditorToolbar editor={editor} /> : null}
      <div
        className={`min-h-0 flex-1 overflow-y-auto bg-white ${surfaceClassName}`}
      >
        <div
          ref={mountRef}
          className={`ProseMirror-host w-full ${contentClassName}`}
        />
        {editor ? <BlockSelectHandle editor={editor} /> : null}
      </div>
    </div>
  );
}
