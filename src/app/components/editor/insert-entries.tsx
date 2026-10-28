import type { ComponentType } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table,
  Type,
} from "lucide-react";
import type { Editor } from "prosekit/core";
import { TextSelection } from "prosekit/pm/state";
import { listInteractionDescriptors } from "@citolab/prose-qti/core/interactions/composer";
import type { InteractionDescriptor } from "@citolab/prose-qti/interfaces";
import { InteractionIcon } from "./interaction-icons";
import {
  EDITOR_SUPPORTED_BLOCKS,
  EDITOR_SUPPORTED_INTERACTIONS,
} from "../../pages/item-source";

/**
 * One list of what can be put into an item, shared by every way of putting it there: the toolbar's
 * Insert tiles, the "/" menu and the right-click menu. Kept in one place so the three cannot drift
 * -- an interaction the toolbar refuses must not sneak in through the slash menu.
 *
 * Each entry runs and dry-runs itself against the editor. The dry run is what lets the "/" menu
 * offer only what fits at the caret: no interaction inside an interaction, no heading inside a
 * choice.
 */
export type InsertGroup = "text" | "interactions" | "blocks";

export type InsertEntry = {
  id: string;
  group: InsertGroup;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Changes the block the caret is in rather than adding one: the "Turn into" submenu. */
  turnInto?: boolean;
  run: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
};

export const INSERT_GROUP_LABELS: Record<InsertGroup, string> = {
  text: "Text",
  interactions: "Interactions",
  blocks: "Blocks",
};

const INSERT_GROUP_ORDER: InsertGroup[] = ["text", "interactions", "blocks"];

type LooseCommand = ((...args: unknown[]) => boolean) & {
  canExec: (...args: unknown[]) => boolean;
};

// ProseKit's typed `editor.commands` only knows the extension it was built from, and these entries
// are built without one. Looked up by name instead; a command the schema lacks reads as "can't run".
function byName(name: string, ...args: unknown[]) {
  const lookup = (editor: Editor) =>
    (editor.commands as Record<string, LooseCommand | undefined>)[name];
  return {
    run: (editor: Editor) => lookup(editor)?.(...args) ?? false,
    canRun: (editor: Editor) => lookup(editor)?.canExec(...args) ?? false,
  };
}

function textEntry(
  id: string,
  label: string,
  icon: InsertEntry["icon"],
  command: ReturnType<typeof byName>,
  turnInto = true,
): InsertEntry {
  return { id, group: "text", label, icon, turnInto, ...command };
}

const TEXT_ENTRIES: InsertEntry[] = [
  textEntry("paragraph", "Text", Type, byName("setParagraph")),
  textEntry("heading1", "Heading 1", Heading1, byName("setHeading", { level: 1 })),
  textEntry("heading2", "Heading 2", Heading2, byName("setHeading", { level: 2 })),
  textEntry("heading3", "Heading 3", Heading3, byName("setHeading", { level: 3 })),
  textEntry("bulletList", "Bulleted list", List, byName("toggleList", { kind: "bullet" })),
  textEntry("orderedList", "Numbered list", ListOrdered, byName("toggleList", { kind: "ordered" })),
  textEntry("table", "Table", Table, insertTableWithCaret(), false),
];

// `insertTable` leaves the caret where it was, so the author's next keystroke lands under the
// table instead of in it. Put it in the first cell: the table nearest before the old caret is
// the one just inserted.
function insertTableWithCaret() {
  const insert = byName("insertTable", { row: 3, col: 3 });
  return {
    canRun: insert.canRun,
    run: (editor: Editor) => {
      const before = editor.state.selection.from;
      if (!insert.run(editor)) return false;
      const { doc } = editor.state;
      let tablePos = -1;
      doc.nodesBetween(0, Math.min(before + 1, doc.content.size), (node, pos) => {
        if (node.type.name === "table") tablePos = pos;
        return node.type.name !== "table";
      });
      if (tablePos >= 0) {
        editor.view.dispatch(
          editor.state.tr.setSelection(
            TextSelection.near(doc.resolve(tablePos + 1)),
          ),
        );
      }
      return true;
    },
  };
}

// The published package ships the insert commands but no menu UI, so the labels are ours.
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
 * The registry, narrowed to what the editor is allowed to open again.
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

const QTI_ENTRIES: InsertEntry[] = listInteractionDescriptors()
  .filter(
    (descriptor) =>
      descriptor.insertCommand != null &&
      EDITOR_SUPPORTED_TAGS.has(descriptor.tagName.toLowerCase()),
  )
  .sort((left, right) => displayRank(left) - displayRank(right))
  .map((descriptor) => {
    const command = descriptor.insertCommand!;
    const nodeTypeName = descriptor.nodeTypeName;
    return {
      id: nodeTypeName,
      group: nodeTypeName === "qtiRubricBlock" ? "blocks" : "interactions",
      label: interactionLabel(descriptor),
      icon: ({ className }: { className?: string }) => (
        <InteractionIcon nodeTypeName={nodeTypeName} className={className} />
      ),
      run: (editor: Editor) => editor.exec(command),
      canRun: (editor: Editor) => editor.canExec(command),
    };
  });

export const INSERT_ENTRIES: InsertEntry[] = [...TEXT_ENTRIES, ...QTI_ENTRIES];

/** Node types the right-click menu treats as one object: "Delete" removes the whole thing. */
export const OBJECT_NODE_LABELS: ReadonlyMap<string, string> = new Map([
  ...QTI_ENTRIES.map((entry) => [entry.id, entry.label] as const),
  ["image", "Image"],
  ["table", "Table"],
]);

export function groupEntries(entries: InsertEntry[]) {
  return INSERT_GROUP_ORDER.map((group) => ({
    group,
    label: INSERT_GROUP_LABELS[group],
    entries: entries.filter((entry) => entry.group === group),
  })).filter((section) => section.entries.length > 0);
}

/** Runs an entry and hands the keyboard back to the document, wherever the click came from. */
export function runEntry(editor: Editor, entry: InsertEntry) {
  editor.focus();
  entry.run(editor);
}
