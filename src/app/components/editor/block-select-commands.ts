/**
 * Move and delete operations for a whole-block selection.
 *
 * `@citolab/prose-extensions`' block-select plugin makes the selection and navigates it -- arrows,
 * shift+arrows, drag, Escape to collapse -- and overrides `content()` so cut and copy carry whole
 * blocks. It stops there: nothing in it moves or removes the blocks it selects, and qti-editor,
 * which uses the same plugin, has no such commands either. These are ours.
 *
 * Everything below works off `state.selection`, never off whatever the pointer last hovered: the
 * block handle opens its menu on click, and by the time an item in that menu runs, the pointer has
 * left the editor and the hover state is gone.
 */
import { TextSelection, type Command, type Selection, type Transaction } from "prosekit/pm/state";
import type { Node as ProseMirrorNode } from "prosekit/pm/model";
import { NodeRangeSelection } from "@citolab/prose-extensions/block-select";

/** The two fields NodeRangeSelection adds, which is what distinguishes it from a NodeSelection. */
type NodeRangeLike = Selection & {
  $anchorNode?: { pos: number };
  $headNode?: { pos: number };
};

/**
 * Duck-typed rather than `instanceof`: the plugin keeps a `Symbol.for(...)` registry of its own
 * class registrations, which only exists because a page can end up with more than one copy of the
 * module. Under two copies `instanceof` is false for a selection made by the other one, and every
 * command here would silently no-op.
 */
function isNodeRangeSelection(selection: Selection): boolean {
  const candidate = selection as NodeRangeLike;
  return candidate.$anchorNode?.pos != null && candidate.$headNode?.pos != null;
}

export function isBlockSelection(selection: Selection): boolean {
  return isNodeRangeSelection(selection) && selection.ranges.length > 0;
}

/** The span the selection covers, as a single contiguous block run. */
function selectedSpan(selection: Selection): { from: number; to: number } | null {
  if (!isBlockSelection(selection)) return null;
  return {
    from: selection.ranges[0].$from.pos,
    to: selection.ranges[selection.ranges.length - 1].$to.pos,
  };
}

function selectedNodes(
  doc: ProseMirrorNode,
  from: number,
  to: number,
): ProseMirrorNode[] {
  const nodes: ProseMirrorNode[] = [];
  let pos = from;
  while (pos < to) {
    const node = doc.resolve(pos).nodeAfter;
    if (!node) break;
    nodes.push(node);
    pos += node.nodeSize;
  }
  return nodes;
}

/**
 * Reselect the run that has just been re-inserted at `from`, so a block can be moved repeatedly
 * without re-aiming. `NodeRangeSelection.create` takes positions BEFORE nodes and derives its end
 * from `$headNode.nodeAfter.nodeSize` -- so the head is the position before the LAST node in the
 * run, not the end of it.
 */
function reselectRun(
  tr: Transaction,
  from: number,
  nodes: ProseMirrorNode[],
): void {
  const headOffset = nodes
    .slice(0, -1)
    .reduce((total, node) => total + node.nodeSize, 0);
  try {
    tr.setSelection(NodeRangeSelection.create(tr.doc, from, from + headOffset));
  } catch {
    // Keep whatever selection the mapping produced rather than throwing away the move.
  }
}

/**
 * Move the selected blocks one sibling up or down.
 *
 * Delete-then-reinsert rather than a swap, because the run can be several blocks long. The two
 * directions differ only in where the insert lands, and only the downward case needs mapping:
 * deleting the run shifts everything after it left by the run's size, while a position before the
 * run is untouched by that delete.
 */
export function moveBlockSelection(direction: -1 | 1): Command {
  return (state, dispatch) => {
    const span = selectedSpan(state.selection);
    if (!span) return false;

    const { from, to } = span;
    const neighbour =
      direction === -1
        ? state.doc.resolve(from).nodeBefore
        : state.doc.resolve(to).nodeAfter;
    // Already against the top or bottom of its parent.
    if (!neighbour) return false;

    const nodes = selectedNodes(state.doc, from, to);
    if (nodes.length === 0) return false;
    if (!dispatch) return true;

    const content = state.doc.slice(from, to).content;
    const tr = state.tr.delete(from, to);
    const insertAt =
      direction === -1
        ? from - neighbour.nodeSize
        : tr.mapping.map(to + neighbour.nodeSize);

    tr.insert(insertAt, content);
    reselectRun(tr, insertAt, nodes);
    dispatch(tr.scrollIntoView());
    return true;
  };
}

/**
 * Delete the selected blocks and leave a cursor where they were.
 *
 * The base keymap's `deleteSelection` already removes them -- `tr.deleteSelection()` goes through
 * `selection.ranges`, which this selection defines over whole blocks. What it leaves behind is the
 * problem: a `NodeRangeSelection` mapped through its own deletion, pointing at blocks that no
 * longer exist and drawing no cursor at all, because the class sets `visible = false`. Putting a
 * text selection at the hole is the reason this command exists rather than reusing that one.
 */
export const deleteBlockSelection: Command = (state, dispatch) => {
  const span = selectedSpan(state.selection);
  if (!span) return false;
  if (!dispatch) return true;

  const tr = state.tr.delete(span.from, span.to);
  const target = Math.min(span.from, tr.doc.content.size);
  // `near` looks forwards from the hole first, then back, for somewhere a cursor can actually go.
  tr.setSelection(TextSelection.near(tr.doc.resolve(target), 1));
  dispatch(tr.scrollIntoView());
  return true;
};
