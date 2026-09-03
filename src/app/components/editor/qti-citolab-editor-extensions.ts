import "@citolab/prose-qti/components/register";
import { defineBasicExtension } from "prosekit/basic";
import {
  defineKeymap,
  defineNodeSpec,
  definePlugin,
  union,
} from "prosekit/core";
import { nodeAttrsSyncExtension } from "@citolab/prose-extensions/prosekit-extensions";
import type { Command } from "prosekit/pm/state";
import {
  listInteractionDescriptors,
  listInteractionPluginFactories,
  listInteractionSchemaNodeSpecs,
} from "@citolab/prose-qti/core/interactions/composer";
import {
  constrainedEnd,
  constrainedHome,
  constrainedShiftEnd,
  constrainedShiftHome,
} from "@citolab/prose-qti/components/shared";

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

  if (backspaceCommands.length > 0) {
    keymap.Backspace = (state, dispatch, view) =>
      backspaceCommands.some((command) => command(state, dispatch, view));
  }

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

export function defineQtiPlaygroundExtension() {
  return union(
    defineBasicExtension(),
    defineQtiPlaygroundInteractionsExtension(),
    nodeAttrsSyncExtension,
  );
}
