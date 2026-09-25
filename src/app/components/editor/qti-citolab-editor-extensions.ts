import "@citolab/prose-qti/components/register";
import { defineBasicExtension } from "prosekit/basic";
import {
  defineKeymap,
  defineNodeSpec,
  definePlugin,
  union,
} from "prosekit/core";
import {
  blockSelectExtension,
  nodeAttrsSyncExtension,
} from "@citolab/prose-extensions/prosekit-extensions";
import type { Command } from "prosekit/pm/state";
import {
  listInteractionDecoratorPluginFactories,
  listInteractionDescriptors,
  listInteractionPluginFactories,
  listInteractionSchemaNodeSpecs,
} from "@citolab/prose-qti/core/interactions/composer";
import { defineClearFormattingExtension } from "@citolab/prose-qti/integration/interactions/prosekit";
import {
  constrainedEnd,
  constrainedHome,
  constrainedShiftEnd,
  constrainedShiftHome,
} from "@citolab/prose-qti/components/shared";
import { qtiLayoutDivNodeSpec } from "@citolab/prose-qti/schema";
import {
  deleteBlockSelection,
  moveBlockSelection,
} from "./block-select-commands";

function defineQtiPlaygroundInteractionsExtension() {
  const descriptors = listInteractionDescriptors();
  const nodeSpecs = listInteractionSchemaNodeSpecs();
  const rubricIncluded = nodeSpecs.some((spec) => spec.name === "qtiRubricBlock");

  const nodeSpecExtensions = nodeSpecs.map(({ name, spec }) =>
    defineNodeSpec({ name, ...spec }),
  );

  // Rubric blocks use `content: 'richtext+'`; host schema must expose that group.
  if (rubricIncluded) {
    nodeSpecExtensions.push(
      defineNodeSpec({ name: "paragraph", group: "block richtext" }),
      defineNodeSpec({ name: "table", group: "block richtext" }),
    );
  }

  // ProseKit's cell content is `block+`, and interactions are `group: 'block'` too, so filling a
  // new empty cell picked whichever block node sorts first -- an interaction, not a paragraph.
  // Naming paragraph first makes it the filler without narrowing what a cell accepts. prose-qti
  // ships this in `@citolab/prose-extensions`' basic extension; this app uses ProseKit's own.
  nodeSpecExtensions.push(
    defineNodeSpec({ name: "tableCell", content: "(paragraph | block)+" }),
    defineNodeSpec({ name: "tableHeaderCell", content: "(paragraph | block)+" }),
  );

  // prose-qti's choice and prompt paragraphs are `(text | image)*`, which only builds when `image`
  // is inline. ProseKit's image is a block node, so without this the schema throws "Mixing inline
  // and block content" and the editor never mounts. prose-qti's own basic extension ships the same
  // inline image; this app keeps ProseKit's basic extension for its bold/italic/underline marks.
  nodeSpecExtensions.push(
    defineNodeSpec({
      name: "image",
      inline: true,
      group: "inline",
      draggable: true,
      attrs: {
        src: { default: null },
        alt: { default: null },
        title: { default: null },
        width: { default: null },
        height: { default: null },
      },
      parseDOM: [
        {
          tag: "img[src]",
          getAttrs: (element) => ({
            src: element.getAttribute("src") || null,
            alt: element.getAttribute("alt") || null,
            title: element.getAttribute("title") || null,
            width: element.getAttribute("width") || null,
            height: element.getAttribute("height") || null,
          }),
        },
      ],
      toDOM: (node) => ["img", node.attrs],
    }),
  );

  const keymap: Record<string, Command> = {};
  const enterCommands = descriptors
    .map((descriptor) => descriptor.enterCommand)
    .filter((command) => command != null);

  if (enterCommands.length > 0) {
    keymap.Enter = (state, dispatch, view) =>
      enterCommands.some((command) => command(state, dispatch, view));
  }

  const backspaceCommands = descriptors
    .map((descriptor) => descriptor.backspaceCommand)
    .filter((command) => command != null);

  // `deleteBlockSelection` goes first and returns false unless the selection really is a block
  // run, so the interaction handlers keep every case they had. It has to be ahead of them because
  // the base keymap's `deleteSelection` would otherwise take the block case and leave a selection
  // pointing at deleted blocks, drawing no cursor -- see block-select-commands.ts.
  keymap.Backspace = (state, dispatch, view) =>
    deleteBlockSelection(state, dispatch, view) ||
    backspaceCommands.some((command) => command(state, dispatch, view));
  keymap.Delete = (state, dispatch, view) =>
    deleteBlockSelection(state, dispatch, view);

  // Block-selection operations. `Alt-Arrow` is the move-block convention; the plugin already owns
  // bare and shifted arrows for navigating and extending the selection, so this is the free slot.
  keymap["Alt-ArrowUp"] = moveBlockSelection(-1);
  keymap["Alt-ArrowDown"] = moveBlockSelection(1);

  keymap.Home = constrainedHome;
  keymap["Shift-Home"] = constrainedShiftHome;
  keymap.End = constrainedEnd;
  keymap["Shift-End"] = constrainedShiftEnd;

  for (const descriptor of descriptors) {
    if (descriptor.insertCommand && descriptor.keyboardShortcut) {
      keymap[descriptor.keyboardShortcut] = descriptor.insertCommand;
    }
  }

  const pluginExtensions = listInteractionPluginFactories().map((pluginFactory) =>
    definePlugin(pluginFactory),
  );

  return union(...nodeSpecExtensions, defineKeymap(keymap), ...pluginExtensions);
}

/*
 * `<div class="qti-layout-row">` / `<div class="qti-layout-colN">`, the QTI 3.0 layout wrappers.
 *
 * Registering this is not an enhancement, it is the difference between keeping an item's layout and
 * silently destroying it. The spec's own note is blunt about what omitting it costs: "a schema
 * without this node silently DROPS every wrapper on import", which is exactly what the editor was
 * doing -- a two-column item came in, came back out as one column, and the exported XML was the
 * damage. The theme already styles the classes, so the wrappers render as columns the moment the
 * document model keeps them.
 *
 * `qtiLayoutDivLockPlugin` ships next to the node spec and is deliberately NOT registered: it
 * rejects any transaction that changes the number of wrappers, which is precisely what the toolbar's
 * one-column/two-column commands do. The package documents that trade -- "a host that genuinely
 * wants editable grids simply does not add it."
 */
function defineQtiLayoutExtension() {
  return defineNodeSpec({
    name: "qtiLayoutDiv",
    ...qtiLayoutDivNodeSpec,
    /*
     * `class` is required here, where the package ships it as `{ default: null }`.
     *
     * Not a preference -- without it the schema cannot be built at all. ProseMirror fills required
     * content by asking a content expression for its `defaultType`, which is the first admitted type
     * with no required attributes. `doc` is `block+` and so is this node, so with a defaulted
     * `class` a layout div is a legal answer for both: filling an empty `doc` produces a layout div,
     * filling THAT produces another, and `createEditor` dies with "Maximum call stack size
     * exceeded" before the editor ever mounts. Requiring one attribute takes the node out of every
     * `defaultType` in the schema and the recursion with it.
     *
     * Nothing loses out: the two places that build these nodes -- the spec's own `parseDOM`, and the
     * toolbar commands in qti-layout-commands.ts -- both always pass a class, since a wrapper
     * without one would be neither a row nor a column.
     *
     * The package does not hit this because its host schema answers `block+` with a divider node
     * this app does not have; its note on `allowGapCursor` says as much.
     */
    attrs: { class: {} },
  });
}

/*
 * Editor-only affordances for the interactions that ship one (choice, today): a hover boundary
 * around the interaction and its choices, a per-choice x, a trailing + and a node-action pill.
 *
 * prose-qti holds these apart from `pluginFactories` in a separate `decoratorPluginFactories`
 * bucket precisely so a host has to ask -- they are an opinion about how authoring should feel,
 * and a read-only or player host must not inherit them. So this is opt-in in two places and both
 * are required: the plugins here, and `@citolab/prose-qti/decorations.css` in
 * qti-citolab-editor.tsx. With only one of the two you get behaviour that paints nothing, or
 * tokens nothing reads.
 *
 * Enumerated rather than named: the list is whatever the registered descriptors contribute, so an
 * interaction that gains a decorator upstream arrives without a change here.
 */
function defineQtiPlaygroundDecorationsExtension() {
  return union(
    ...listInteractionDecoratorPluginFactories().map((pluginFactory) =>
      definePlugin(pluginFactory),
    ),
  );
}

export function defineQtiPlaygroundExtension() {
  return union(
    defineBasicExtension(),
    defineQtiPlaygroundInteractionsExtension(),
    defineQtiPlaygroundDecorationsExtension(),
    defineQtiLayoutExtension(),
    // "Opmaak wissen": a `clearFormatting` command plus `Mod-\`. Opt-in upstream, like the
    // decorators, because it is an authoring affordance.
    defineClearFormattingExtension(),
    // Shift+arrows / mouse drag select whole blocks (e.g. a full interaction),
    // matching the qti-editor apps.
    blockSelectExtension,
    nodeAttrsSyncExtension,
  );
}
