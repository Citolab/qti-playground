import type { ReactNode } from "react";
import { Bold, Italic, RemoveFormatting, Underline } from "lucide-react";
import type { Editor } from "prosekit/core";
import {
  InlinePopoverPopup,
  InlinePopoverPositioner,
  InlinePopoverRoot,
} from "prosekit/react/inline-popover";
import { useFormatState, type MarkCommands } from "./editor-format-state";

function BubbleButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 aria-pressed:bg-gray-200 aria-pressed:text-gray-900"
    >
      {children}
    </button>
  );
}

/**
 * Floats over selected text with the marks and "clear formatting", so formatting a word does not
 * mean travelling up to the toolbar and back.
 */
export function SelectionBubble({ editor }: { editor: Editor }) {
  const format = useFormatState(editor);
  const commands = editor.commands as MarkCommands;

  return (
    <InlinePopoverRoot editor={editor}>
      <InlinePopoverPositioner placement="top" offset={8} hoist className="z-40 block">
        <InlinePopoverPopup
          className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          // Keep the text selected: a click on a button must not move the caret.
          onMouseDown={(event) => event.preventDefault()}
          data-testid="selection-bubble"
        >
          <BubbleButton
            label="Bold"
            pressed={format?.bold}
            onClick={() => commands.toggleBold?.()}
          >
            <Bold className="h-4 w-4" />
          </BubbleButton>
          <BubbleButton
            label="Italic"
            pressed={format?.italic}
            onClick={() => commands.toggleItalic?.()}
          >
            <Italic className="h-4 w-4" />
          </BubbleButton>
          <BubbleButton
            label="Underline"
            pressed={format?.underline}
            onClick={() => commands.toggleUnderline?.()}
          >
            <Underline className="h-4 w-4" />
          </BubbleButton>
          <div className="mx-0.5 h-5 w-px bg-gray-200" />
          <BubbleButton
            label="Clear formatting"
            onClick={() => commands.clearFormatting?.()}
          >
            <RemoveFormatting className="h-4 w-4" />
          </BubbleButton>
        </InlinePopoverPopup>
      </InlinePopoverPositioner>
    </InlinePopoverRoot>
  );
}
