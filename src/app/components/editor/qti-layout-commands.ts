/*
 * One column / two columns, over `<div class="qti-layout-row">` and `<div class="qti-layout-colN">`.
 *
 * The vocabulary and the node are not ours: they are author-written in the source QTI, the theme
 * styles them (`.qti-layout-row` is a flex row, `.qti-layout-colN` an N/12 width), and prose-qti
 * ships the document model as `qtiLayoutDivNodeSpec`. All that is here is the two commands the
 * toolbar needs, because the package deliberately ships no insert or remove command -- its note on
 * the lock plugin says "nothing can author one", which was true until this toolbar.
 *
 * Which is also why `qtiLayoutDivLockPlugin` is NOT registered alongside the node spec. That plugin
 * rejects any transaction that changes the number of wrappers, on the reasoning that an author who
 * deletes one has no way to rebuild it. These two commands are that way, so the lock would now only
 * block them. The package anticipates the choice: "a host that genuinely wants editable grids simply
 * does not add it."
 *
 * Only 6/6 is offered. A column can carry any of the twelve widths and an imported item's widths are
 * preserved untouched -- what is deliberately absent is a control for authoring the other eleven.
 */
import { Fragment, type Node as ProseMirrorNode } from "prosekit/pm/model";
import { TextSelection, type Command } from "prosekit/pm/state";
import type { ResolvedPos } from "prosekit/pm/model";

const LAYOUT_NODE = "qtiLayoutDiv";
const ROW_CLASS = "qti-layout-row";
/** Half of the theme's twelve, so a two-column row splits evenly. */
const COLUMN_CLASS = "qti-layout-col6";

function classTokens(node: ProseMirrorNode): string[] {
  const className = node.attrs.class;
  return typeof className === "string" ? className.split(/\s+/) : [];
}

function isLayoutRow(node: ProseMirrorNode): boolean {
  return node.type.name === LAYOUT_NODE && classTokens(node).includes(ROW_CLASS);
}

function isLayoutColumn(node: ProseMirrorNode): boolean {
  return (
    node.type.name === LAYOUT_NODE &&
    classTokens(node).some((token) => token.startsWith("qti-layout-col"))
  );
}

type FoundRow = { node: ProseMirrorNode; pos: number };

/** The innermost layout row containing `$pos`, with the position just before it. */
function findLayoutRow($pos: ResolvedPos): FoundRow | null {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (isLayoutRow(node)) {
      return { node, pos: $pos.before(depth) };
    }
  }
  return null;
}

/** True while the selection sits inside a layout row -- what the toolbar reflects as pressed. */
export function isInLayoutRow(doc: ProseMirrorNode, from: number): boolean {
  if (from > doc.content.size) return false;
  return findLayoutRow(doc.resolve(from)) != null;
}

/**
 * Wrap whatever the selection covers into the left column of a new two-column row, and leave an
 * empty right column with the caret in it.
 *
 * The unit is the top-level block, not the text selection: an author clicking inside a paragraph
 * means "put this paragraph in a column", and a selection spanning three blocks means all three.
 * That is what `before(1)`/`after(1)` pick out.
 */
export const makeTwoColumns: Command = (state, dispatch) => {
  const layoutType = state.schema.nodes[LAYOUT_NODE];
  const paragraphType = state.schema.nodes.paragraph;
  if (!layoutType || !paragraphType) return false;

  const { $from, $to } = state.selection;
  // Already in a row: this command only ever creates one, so there is nothing to do.
  if (findLayoutRow($from)) return false;
  if ($from.depth < 1 || $to.depth < 1) return false;

  const from = $from.before(1);
  const to = $to.after(1);
  const covered = state.doc.slice(from, to).content;
  if (covered.childCount === 0) return false;

  let left: ProseMirrorNode;
  let right: ProseMirrorNode;
  let row: ProseMirrorNode;
  try {
    left = layoutType.create({ class: COLUMN_CLASS }, covered);
    right = layoutType.create({ class: COLUMN_CLASS }, paragraphType.create());
    row = layoutType.create(
      { class: ROW_CLASS },
      Fragment.fromArray([left, right]),
    );
  } catch {
    // create() validates against the schema, so a selection holding something a column cannot
    // contain lands here rather than throwing out of a toolbar click.
    return false;
  }

  if (dispatch) {
    const tr = state.tr.replaceWith(from, to, row);
    // Into the empty right column: past the row's own open token, past the left column, then into
    // the right column and its paragraph.
    const caret = from + 1 + left.nodeSize + 2;
    tr.setSelection(
      TextSelection.near(tr.doc.resolve(Math.min(caret, tr.doc.content.size))),
    );
    dispatch(tr.scrollIntoView());
  }
  return true;
};

/**
 * Unwrap the enclosing row, putting every column's content back in the flow in reading order.
 *
 * Content is never dropped -- an author who has typed into the second column and then goes back to
 * one column keeps that text, appended after the first column's.
 */
export const makeOneColumn: Command = (state, dispatch) => {
  const found = findLayoutRow(state.selection.$from);
  if (!found) return false;

  const blocks: ProseMirrorNode[] = [];
  found.node.forEach((child) => {
    if (isLayoutColumn(child)) {
      child.forEach((grandChild) => blocks.push(grandChild));
    } else {
      blocks.push(child);
    }
  });
  if (blocks.length === 0) return false;

  if (dispatch) {
    const tr = state.tr.replaceWith(
      found.pos,
      found.pos + found.node.nodeSize,
      Fragment.fromArray(blocks),
    );
    tr.setSelection(
      TextSelection.near(
        tr.doc.resolve(Math.min(found.pos + 1, tr.doc.content.size)),
      ),
    );
    dispatch(tr.scrollIntoView());
  }
  return true;
};
