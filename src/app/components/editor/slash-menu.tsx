import { useState } from "react";
import { canUseRegexLookbehind, type Editor } from "prosekit/core";
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from "prosekit/react/autocomplete";
import { groupEntries, runEntry, type InsertEntry } from "./insert-entries";

// A "/" that starts a word, so a fraction or "and/or" typed mid-sentence does not open the menu.
// Safari before 16.4 has no lookbehind; there any "/" opens it, which is the lesser evil.
const SLASH = canUseRegexLookbehind() ? /(?<!\S)\/(\S.*)?$/u : /\/(\S.*)?$/u;

/**
 * The "/" menu: type a slash in the document and pick what goes there, filtered as you type on.
 *
 * Offers only the entries that can run at the caret, dry-run once when the menu opens -- so typing
 * "/" inside a choice does not offer a second interaction there.
 */
export function SlashMenu({
  editor,
  entries,
}: {
  editor: Editor;
  entries: InsertEntry[];
}) {
  const [shown, setShown] = useState(entries);

  return (
    <AutocompleteRoot
      editor={editor}
      regex={SLASH}
      onOpenChange={(event) => {
        if (event.detail) setShown(entries.filter((entry) => entry.canRun(editor)));
      }}
    >
      {/* Hoisted for the same reason as the block handle: the editor body clips. */}
      <AutocompletePositioner hoist className="z-50 block">
        <AutocompletePopup
          className="flex max-h-80 w-64 flex-col overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg"
          data-testid="slash-menu"
        >
          {groupEntries(shown).map((section) => (
            <div key={section.group}>
              <div className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                {section.label}
              </div>
              {section.entries.map((entry) => (
                <AutocompleteItem
                  key={entry.id}
                  value={`${entry.label} ${entry.id}`}
                  // ProseKit removes the typed "/query" after this returns; running the entry on the
                  // next microtask makes it act on the cleaned-up block, not on the slash text.
                  onSelect={() => queueMicrotask(() => runEntry(editor, entry))}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-gray-100"
                  data-testid={`slash-${entry.id}`}
                >
                  <entry.icon className="size-5 shrink-0 text-gray-600" />
                  <span className="truncate">{entry.label}</span>
                </AutocompleteItem>
              ))}
            </div>
          ))}
          <AutocompleteEmpty className="px-2 py-1.5 text-gray-500">
            Nothing matches
          </AutocompleteEmpty>
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  );
}
