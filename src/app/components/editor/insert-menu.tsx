import { useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import type { Editor } from "prosekit/core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupEntries, runEntry, type InsertEntry } from "./insert-entries";

const SECTION_LABEL =
  "px-1 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase";

/**
 * The toolbar's Insert menu: the same entries as the "/" menu, laid out for browsing rather than
 * typing. Text blocks are compact rows -- their icons are generic and the label does the work --
 * while interactions and blocks are tiles, because there the drawn glyph carries the meaning and
 * reads before the label does.
 */
export function InsertMenu({
  editor,
  entries,
}: {
  editor: Editor;
  entries: InsertEntry[];
}) {
  // The chosen entry runs once the menu has closed. While it is open its focus trap holds focus,
  // and Radix hands it back to the trigger on close -- after the click handler -- so an entry run
  // from `onSelect` left the caret in the document but the keyboard on the Insert button.
  const chosenRef = useRef<InsertEntry | null>(null);

  const item = (entry: InsertEntry, tile: boolean) => (
    <DropdownMenuItem
      key={entry.id}
      disabled={!entry.canRun(editor)}
      onSelect={() => {
        chosenRef.current = entry;
      }}
      data-testid={`insert-${entry.id}`}
      className={
        tile
          ? "h-auto cursor-pointer flex-col items-center gap-1.5 rounded-md px-1 pt-2.5 pb-2 text-center focus:bg-citolab-50 focus:text-citolab-900 [&_svg]:size-8"
          : "cursor-pointer rounded-md focus:bg-citolab-50 focus:text-citolab-900"
      }
    >
      <entry.icon className="text-gray-600" />
      <span className={tile ? "text-[11px] leading-tight font-medium" : ""}>
        {entry.label}
      </span>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 pr-2 pl-2.5"
          data-testid="insert-button"
        >
          <Plus className="h-4 w-4" />
          Insert
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[75vh] w-[22rem] overflow-y-auto p-2"
        onCloseAutoFocus={(event) => {
          const entry = chosenRef.current;
          chosenRef.current = null;
          if (!entry) return;
          event.preventDefault();
          runEntry(editor, entry);
        }}
      >
        {groupEntries(entries).map((section, index) => (
          <div key={section.group}>
            {index > 0 && <DropdownMenuSeparator className="my-2" />}
            <DropdownMenuLabel className={SECTION_LABEL}>
              {section.label}
            </DropdownMenuLabel>
            <div
              className={
                section.group === "text"
                  ? "grid grid-cols-2 gap-0.5"
                  : "grid grid-cols-3 gap-1"
              }
            >
              {section.entries.map((entry) =>
                item(entry, section.group !== "text"),
              )}
            </div>
          </div>
        ))}
        <p className="mt-2 border-t border-gray-100 px-1 pt-2 text-[11px] text-gray-500">
          Tip: type <kbd className="rounded border border-gray-200 bg-gray-50 px-1 font-mono">/</kbd>{" "}
          in the item to insert right where you are typing.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
