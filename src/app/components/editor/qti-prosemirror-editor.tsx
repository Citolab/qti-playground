import { useEffect, useMemo, useRef } from "react";
import {
  createEditor,
  defineKeymap,
  defineNodeSpec,
  definePlugin,
  type Editor as ProsekitEditor,
  union,
} from "prosekit/core";
import { defineBasicExtension } from "prosekit/basic";
import { DOMParser as PMDOMParser, DOMSerializer } from "prosekit/pm/model";
import { Plugin, type Command, type EditorState, type Transaction } from "prosekit/pm/state";
import type { EditorView } from "prosekit/pm/view";
import type { NodeSpec } from "prosekit/pm/model";

import "@citolab/qti-components/item.css";
import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import "./qti-prosemirror-editor.css";

type Props = {
  sourceXml: string;
  onSourceChange: (nextXml: string) => void;
  className?: string;
};

const ITEM_BODY_PATTERN = /(<qti-item-body\b[^>]*>)[\s\S]*?(<\/qti-item-body>)/i;

const qtiPromptNodeSpec: NodeSpec = {
  group: "block",
  content: "paragraph",
  parseDOM: [
    { tag: "qti-prompt" },
    { tag: 'div[data-qti-node="prompt"]' },
  ],
  toDOM() {
    return ["div", { "data-qti-node": "prompt", class: "qti-beta-prompt" }, 0];
  },
};

const qtiSimpleChoiceNodeSpec: NodeSpec = {
  group: "block",
  content: "inline*",
  attrs: { identifier: { default: "A" } },
  parseDOM: [
    {
      tag: "qti-simple-choice",
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return { identifier: node.getAttribute("identifier") || "A" };
      },
    },
    {
      tag: 'div[data-qti-node="simple-choice"]',
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          identifier:
            node.getAttribute("data-identifier") ||
            node.getAttribute("identifier") ||
            "A",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "div",
      {
        "data-qti-node": "simple-choice",
        "data-identifier": node.attrs.identifier,
        class: "qti-beta-simple-choice",
      },
      0,
    ];
  },
};

const qtiChoiceInteractionNodeSpec: NodeSpec = {
  group: "block",
  // Allow prompts/choices to be optional so imperfect source does not lock parsing.
  content: "qtiPrompt? qtiSimpleChoice*",
  attrs: {
    maxChoices: { default: 0 },
    class: { default: null },
    correctResponse: { default: null },
    responseIdentifier: { default: null },
  },
  parseDOM: [
    {
      tag: "qti-choice-interaction",
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        const maxChoices = node.getAttribute("max-choices");
        return {
          maxChoices: maxChoices ? parseInt(maxChoices, 10) : 0,
          class: node.getAttribute("class") || null,
          correctResponse: node.getAttribute("correct-response"),
          responseIdentifier: node.getAttribute("response-identifier"),
        };
      },
    },
    {
      tag: 'div[data-qti-node="choice-interaction"]',
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        const maxChoices =
          node.getAttribute("data-max-choices") ||
          node.getAttribute("max-choices");
        return {
          maxChoices: maxChoices ? parseInt(maxChoices, 10) : 0,
          class: node.getAttribute("class") || null,
          correctResponse:
            node.getAttribute("data-correct-response") ||
            node.getAttribute("correct-response"),
          responseIdentifier:
            node.getAttribute("data-response-identifier") ||
            node.getAttribute("response-identifier"),
        };
      },
    },
  ],
  toDOM(node) {
    const attrs: Record<string, string> = {
      "data-qti-node": "choice-interaction",
      "data-max-choices": String(node.attrs.maxChoices),
      class: "qti-beta-choice-interaction",
    };
    if (node.attrs.class) attrs.class += ` ${node.attrs.class}`;
    if (node.attrs.correctResponse) {
      attrs["data-correct-response"] = node.attrs.correctResponse;
    }
    if (node.attrs.responseIdentifier) {
      attrs["data-response-identifier"] = node.attrs.responseIdentifier;
    }
    return ["div", attrs, 0];
  },
  defining: true,
  isolating: true,
};

const qtiInlineChoiceNodeSpec: NodeSpec = {
  attrs: { identifier: { default: "A" } },
  content: "inline*",
  group: "block",
  parseDOM: [
    {
      tag: "qti-inline-choice",
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return { identifier: node.getAttribute("identifier") || "A" };
      },
    },
  ],
  toDOM(node) {
    return ["qti-inline-choice", { identifier: node.attrs.identifier }, 0];
  },
  selectable: true,
};

const qtiInlineChoiceInteractionNodeSpec: NodeSpec = {
  attrs: {
    responseIdentifier: { default: null },
    shuffle: { default: false },
    class: { default: null },
    correctResponse: { default: null },
  },
  content: "qtiInlineChoice+",
  group: "block",
  parseDOM: [
    {
      tag: "qti-inline-choice-interaction",
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          responseIdentifier: node.getAttribute("response-identifier"),
          shuffle: node.getAttribute("shuffle") === "true",
          class: node.getAttribute("class") || null,
          correctResponse: node.getAttribute("correct-response"),
        };
      },
    },
  ],
  toDOM(node) {
    const attrs: Record<string, string> = { shuffle: String(Boolean(node.attrs.shuffle)) };
    if (node.attrs.responseIdentifier) attrs["response-identifier"] = node.attrs.responseIdentifier;
    if (node.attrs.class) attrs.class = node.attrs.class;
    if (node.attrs.correctResponse) attrs["correct-response"] = node.attrs.correctResponse;
    return ["qti-inline-choice-interaction", attrs, 0];
  },
  selectable: true,
  isolating: true,
};

const qtiTextEntryInteractionNodeSpec: NodeSpec = {
  attrs: {
    responseIdentifier: { default: null },
    correctResponse: { default: null },
  },
  parseDOM: [
    {
      tag: "qti-text-entry-interaction",
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          responseIdentifier: node.getAttribute("response-identifier"),
          correctResponse: node.getAttribute("correct-response"),
        };
      },
    },
  ],
  toDOM(node) {
    const attrs: Record<string, string> = {};
    if (node.attrs.responseIdentifier) attrs["response-identifier"] = node.attrs.responseIdentifier;
    if (node.attrs.correctResponse) attrs["correct-response"] = node.attrs.correctResponse;
    return ["qti-text-entry-interaction", attrs];
  },
  inline: true,
  group: "inline",
  marks: "_",
  atom: true,
  selectable: true,
};

const insertChoiceInteraction: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const { schema } = state;
  const promptType = schema.nodes.qtiPrompt;
  const choiceType = schema.nodes.qtiSimpleChoice;
  const interactionType = schema.nodes.qtiChoiceInteraction;
  if (!promptType || !choiceType || !interactionType) return false;

  const timestamp = Date.now();
  const prompt = promptType.create(
    null,
    schema.nodes.paragraph.create(null, schema.text("Which option is correct?"))
  );
  const choices = [
    choiceType.create({ identifier: `CHOICE_${timestamp}_A` }, schema.text("Option A")),
    choiceType.create({ identifier: `CHOICE_${timestamp}_B` }, schema.text("Option B")),
    choiceType.create({ identifier: `CHOICE_${timestamp}_C` }, schema.text("Option C")),
  ];
  const interaction = interactionType.create(
    { responseIdentifier: `CHOICE_${timestamp}`, maxChoices: 1 },
    [prompt, ...choices]
  );
  if (dispatch) dispatch(state.tr.replaceSelectionWith(interaction).scrollIntoView());
  return true;
};

const insertInlineChoiceInteraction: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const { schema } = state;
  const interactionType = schema.nodes.qtiInlineChoiceInteraction;
  const inlineChoiceType = schema.nodes.qtiInlineChoice;
  if (!interactionType || !inlineChoiceType) return false;

  const interaction = interactionType.create(
    { responseIdentifier: "RESPONSE", shuffle: false },
    [
      inlineChoiceType.create({ identifier: "G" }, schema.text("Gloucester")),
      inlineChoiceType.create({ identifier: "L" }, schema.text("Lancaster")),
      inlineChoiceType.create({ identifier: "Y" }, schema.text("York")),
    ]
  );
  if (dispatch) dispatch(state.tr.replaceSelectionWith(interaction).scrollIntoView());
  return true;
};

const insertTextEntryInteraction: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const type = state.schema.nodes.qtiTextEntryInteraction;
  if (!type) return false;
  const node = type.create({ responseIdentifier: `RESPONSE_${Date.now()}` });
  if (dispatch) dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
  return true;
};

function extractItemBody(sourceXml: string): string {
  const match = sourceXml.match(ITEM_BODY_PATTERN);
  if (!match) return "";
  return sourceXml.slice(match.index! + match[1].length, match.index! + match[0].length - match[2].length);
}

function replaceItemBody(sourceXml: string, itemBodyHtml: string): string {
  if (!sourceXml.match(ITEM_BODY_PATTERN)) return sourceXml;
  return sourceXml.replace(ITEM_BODY_PATTERN, `$1${itemBodyHtml}$2`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractEditableBody(sourceXml: string): string {
  try {
    const xml = new DOMParser().parseFromString(sourceXml, "text/xml");
    const itemBody = xml.querySelector("qti-item-body");
    if (!itemBody) return "";

    const choice = itemBody.querySelector("qti-choice-interaction");
    if (choice) {
      const maxChoices = choice.getAttribute("max-choices") || "1";
      const responseIdentifier =
        choice.getAttribute("response-identifier") || "RESPONSE";
      const promptText =
        choice.querySelector("qti-prompt")?.textContent?.trim() ||
        "What is the correct answer?";
      const choices = Array.from(choice.querySelectorAll("qti-simple-choice"));
      const simpleChoices = (choices.length > 0
        ? choices
        : [
            Object.assign(document.createElement("qti-simple-choice"), {
              textContent: "Option A",
            }),
            Object.assign(document.createElement("qti-simple-choice"), {
              textContent: "Option B",
            }),
          ]
      )
        .map((node, index) => {
          const identifier =
            node.getAttribute("identifier") || `CHOICE_${index + 1}`;
          const text = node.textContent?.trim() || `Option ${index + 1}`;
          return `<qti-simple-choice identifier="${escapeHtml(identifier)}">${escapeHtml(text)}</qti-simple-choice>`;
        })
        .join("");

      return `<qti-choice-interaction response-identifier="${escapeHtml(
        responseIdentifier
      )}" max-choices="${escapeHtml(maxChoices)}"><qti-prompt>${escapeHtml(promptText)}</qti-prompt>${simpleChoices}</qti-choice-interaction>`;
    }

    return extractItemBody(sourceXml);
  } catch {
    return extractItemBody(sourceXml);
  }
}

function stripXmlEnvelope(sourceXml: string): string {
  return sourceXml
    .replace(/<\?xml-model[\s\S]*?\?>/gi, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .trim();
}

type ChoiceData = {
  responseIdentifier: string;
  maxChoices: number;
  prompt: string;
  choices: { identifier: string; text: string }[];
};

function extractChoiceData(sourceXml: string): ChoiceData | null {
  try {
    const xml = new DOMParser().parseFromString(
      stripXmlEnvelope(sourceXml),
      "text/xml"
    );
    const interaction = xml.querySelector("qti-choice-interaction");
    if (!interaction) return null;

    const responseIdentifier =
      interaction.getAttribute("response-identifier") || "RESPONSE";
    const maxChoices = Number(interaction.getAttribute("max-choices") || "1");
    const prompt =
      interaction.querySelector("qti-prompt")?.textContent?.trim() ||
      "What is the correct answer?";
    const choices = Array.from(
      interaction.querySelectorAll("qti-simple-choice")
    ).map((node, index) => ({
      identifier: node.getAttribute("identifier") || `CHOICE_${index + 1}`,
      text: node.textContent?.trim() || `Option ${index + 1}`,
    }));

    return {
      responseIdentifier,
      maxChoices: Number.isFinite(maxChoices) ? maxChoices : 1,
      prompt,
      choices: choices.length
        ? choices
        : [
            { identifier: "CHOICE_1", text: "Option A" },
            { identifier: "CHOICE_2", text: "Option B" },
          ],
    };
  } catch {
    return null;
  }
}

function applyChoiceDataToEditorView(view: EditorView, choiceData: ChoiceData) {
  const { schema } = view.state;
  const interactionType = schema.nodes.qtiChoiceInteraction;
  const promptType = schema.nodes.qtiPrompt;
  const paragraphType = schema.nodes.paragraph;
  const choiceType = schema.nodes.qtiSimpleChoice;
  if (!interactionType || !promptType || !paragraphType || !choiceType) return;

  const promptNode = promptType.create(
    null,
    paragraphType.create(null, schema.text(choiceData.prompt))
  );
  const choiceNodes = choiceData.choices.map((choice) =>
    choiceType.create({ identifier: choice.identifier }, schema.text(choice.text))
  );
  const interactionNode = interactionType.create(
    {
      responseIdentifier: choiceData.responseIdentifier,
      maxChoices: choiceData.maxChoices,
    },
    [promptNode, ...choiceNodes]
  );

  const tr = view.state.tr.replaceWith(
    0,
    view.state.doc.content.size,
    interactionNode
  );
  view.dispatch(tr);
}

function applySourceToEditorView(view: EditorView, sourceXml: string) {
  const choiceData = extractChoiceData(sourceXml);
  if (choiceData) {
    applyChoiceDataToEditorView(view, choiceData);
    return;
  }

  applyBodyHtmlToEditorView(view, extractEditableBody(sourceXml));
}

function defineQtiExtension() {
  return union(
    defineBasicExtension(),
    defineNodeSpec({ name: "qtiChoiceInteraction", ...qtiChoiceInteractionNodeSpec }),
    defineNodeSpec({ name: "qtiPrompt", ...qtiPromptNodeSpec }),
    defineNodeSpec({ name: "qtiSimpleChoice", ...qtiSimpleChoiceNodeSpec }),
    defineNodeSpec({
      name: "qtiInlineChoiceInteraction",
      ...qtiInlineChoiceInteractionNodeSpec,
    }),
    defineNodeSpec({ name: "qtiInlineChoice", ...qtiInlineChoiceNodeSpec }),
    defineNodeSpec({ name: "qtiTextEntryInteraction", ...qtiTextEntryInteractionNodeSpec }),
    defineKeymap({
      "Mod-Shift-q": insertChoiceInteraction,
      "Mod-Shift-t": insertTextEntryInteraction,
      "Mod-Shift-i": insertInlineChoiceInteraction,
    })
  );
}

function readBodyHtmlFromEditorView(view: EditorView): string {
  const serializer = DOMSerializer.fromSchema(view.state.schema);
  const fragment = serializer.serializeFragment(view.state.doc.content);
  const div = document.createElement("div");
  div.appendChild(fragment);
  return restoreQtiMarkupFromEditorHtml(div.innerHTML);
}

function restoreQtiMarkupFromEditorHtml(editorHtml: string): string {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = editorHtml || "";

  wrapper.querySelectorAll('div[data-qti-node="prompt"]').forEach((el) => {
    const replacement = document.createElement("qti-prompt");
    replacement.innerHTML = el.innerHTML;
    el.replaceWith(replacement);
  });

  wrapper
    .querySelectorAll('div[data-qti-node="simple-choice"]')
    .forEach((el) => {
      const replacement = document.createElement("qti-simple-choice");
      const identifier =
        el.getAttribute("data-identifier") ||
        el.getAttribute("identifier") ||
        "A";
      replacement.setAttribute("identifier", identifier);
      replacement.innerHTML = el.innerHTML;
      el.replaceWith(replacement);
    });

  wrapper
    .querySelectorAll('div[data-qti-node="choice-interaction"]')
    .forEach((el) => {
      const replacement = document.createElement("qti-choice-interaction");
      const maxChoices =
        el.getAttribute("data-max-choices") || el.getAttribute("max-choices");
      const responseIdentifier =
        el.getAttribute("data-response-identifier") ||
        el.getAttribute("response-identifier");
      const correctResponse =
        el.getAttribute("data-correct-response") ||
        el.getAttribute("correct-response");
      if (maxChoices) replacement.setAttribute("max-choices", maxChoices);
      if (responseIdentifier) {
        replacement.setAttribute("response-identifier", responseIdentifier);
      }
      if (correctResponse) {
        replacement.setAttribute("correct-response", correctResponse);
      }
      if (el.getAttribute("class")) {
        replacement.setAttribute("class", el.getAttribute("class") || "");
      }
      replacement.innerHTML = el.innerHTML;
      el.replaceWith(replacement);
    });

  return wrapper.innerHTML;
}

function sanitizeItemBodyForEditor(itemBodyHtml: string): string {
  let html = (itemBodyHtml || "").replace(/>\s+</g, "><");
  html = html
    .replace(/<qti-choice-interaction\b/gi, '<div data-qti-node="choice-interaction"')
    .replace(/<\/qti-choice-interaction>/gi, "</div>")
    .replace(/<qti-prompt\b/gi, '<div data-qti-node="prompt"')
    .replace(/<\/qti-prompt>/gi, "</div>")
    .replace(
      /<qti-simple-choice\b([^>]*)\bidentifier="([^"]+)"([^>]*)>/gi,
      '<div data-qti-node="simple-choice" data-identifier="$2"$1$3>'
    )
    .replace(/<qti-simple-choice\b([^>]*)>/gi, '<div data-qti-node="simple-choice"$1>')
    .replace(/<\/qti-simple-choice>/gi, "</div>");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  // Remove rich/embedded content that this beta schema does not support.
  wrapper
    .querySelectorAll("img,video,audio,iframe,object,embed,svg,canvas,math")
    .forEach((el) => el.remove());

  const allowedQtiTags = new Set([
    "qti-choice-interaction",
    "qti-prompt",
    "qti-simple-choice",
    "qti-inline-choice-interaction",
    "qti-inline-choice",
    "qti-text-entry-interaction",
  ]);

  wrapper.querySelectorAll("*").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!tag.startsWith("qti-")) return;
    if (allowedQtiTags.has(tag)) return;

    // Unwrap unsupported QTI elements but preserve user-visible text/children.
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
  });

  wrapper.querySelectorAll("p").forEach((p) => {
    if (!p.textContent?.trim() && p.children.length === 0) {
      p.remove();
    }
  });

  return wrapper.innerHTML.trim();
}

function applyBodyHtmlToEditorView(view: EditorView, itemBodyHtml: string) {
  try {
    const parser = PMDOMParser.fromSchema(view.state.schema);
    const wrapper = document.createElement("div");
    const normalizedHtml = sanitizeItemBodyForEditor(itemBodyHtml);
    wrapper.innerHTML = normalizedHtml || "<p></p>";
    const parsedDoc = parser.parse(wrapper);
    const tr = view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      parsedDoc.content
    );
    view.dispatch(tr);
  } catch (error) {
    // Keep the editor responsive even when source contains unsupported markup.
    console.error("Failed to apply QTI body to ProseMirror, falling back", error);
    const fallback = view.state.schema.nodes.paragraph?.create(
      null,
      view.state.schema.text("Unable to parse this item body in beta editor.")
    );
    if (!fallback) return;
    const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, fallback);
    view.dispatch(tr);
  }
}

export function QtiProsemirrorEditor({
  sourceXml,
  onSourceChange,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ProsekitEditor | null>(null);
  const lastSourceXmlRef = useRef(sourceXml);
  const lastEmittedSourceXmlRef = useRef<string | null>(null);
  const canEmitChangesRef = useRef(false);
  const isApplyingExternalUpdateRef = useRef(false);

  useEffect(() => {
    lastSourceXmlRef.current = sourceXml;
  }, [sourceXml]);

  const extension = useMemo(() => {
    return union(
      defineQtiExtension(),
      definePlugin(() =>
        new Plugin({
          view() {
            return {
              update(updatedView: EditorView, prevState: EditorState) {
                if (!canEmitChangesRef.current) return;
                if (isApplyingExternalUpdateRef.current) return;
                if (prevState.doc.eq(updatedView.state.doc)) return;
                if (!updatedView.hasFocus()) return;

                const itemBodyHtml = readBodyHtmlFromEditorView(updatedView);
                const nextXml = replaceItemBody(lastSourceXmlRef.current, itemBodyHtml);
                if (nextXml === lastSourceXmlRef.current) return;
                lastEmittedSourceXmlRef.current = nextXml;
                onSourceChange(nextXml);
              },
            };
          },
        })
      )
    );
  }, [onSourceChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (editorRef.current) return;

    const editor = createEditor({ extension });
    editorRef.current = editor;
    editor.mount(containerRef.current);

    const view = (editor as ProsekitEditor & { view?: EditorView }).view;
    if (view) {
      // Defer initial hydration so the toggle click can complete first.
      requestAnimationFrame(() => {
        isApplyingExternalUpdateRef.current = true;
        applySourceToEditorView(view, sourceXml);
        isApplyingExternalUpdateRef.current = false;
        // Do not emit changes caused by initial content hydration.
        requestAnimationFrame(() => {
          canEmitChangesRef.current = true;
        });
      });
    }
  }, [extension, sourceXml]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const view = (editor as ProsekitEditor & { view?: EditorView }).view;
    if (!view) return;
    if (sourceXml === lastEmittedSourceXmlRef.current) {
      // Parent has acknowledged the change we just emitted; do not re-apply.
      lastEmittedSourceXmlRef.current = null;
      return;
    }

    const currentBodyHtml = readBodyHtmlFromEditorView(view);
    const nextBodyHtml = extractEditableBody(sourceXml);
    if (currentBodyHtml === nextBodyHtml && !extractChoiceData(sourceXml)) {
      return;
    }

    isApplyingExternalUpdateRef.current = true;
    applySourceToEditorView(view, sourceXml);
    isApplyingExternalUpdateRef.current = false;
    // Keep suppressing plugin updates caused by this external sync.
    requestAnimationFrame(() => {
      canEmitChangesRef.current = true;
    });
  }, [sourceXml]);

  return (
    <div
      className={
        className ||
        "h-[75vh] overflow-auto rounded border border-gray-200 bg-white p-4"
      }
    >
      <div ref={containerRef} />
    </div>
  );
}
