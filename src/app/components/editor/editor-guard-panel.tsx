import { useState } from "react";
import { AlertTriangle, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardItem = { label: string; detail: string };

/**
 * Shown instead of the editor when it cannot edit the item without changing it: says what, and
 * offers the way out -- the XML editor for the same item -- as the main action.
 *
 * "Edit anyway" is offered only where the editor demonstrably can load the item (the round-trip
 * check, not the allowlist), and behind a second click that names the cost, as qti-construction
 * does: the losses land on the first keystroke and there is no way back from inside the editor.
 */
export function EditorGuardPanel({
  className,
  title,
  intro,
  items = [],
  outro,
  onEditXml,
  onEditAnyway,
}: {
  className: string;
  title: string;
  intro: string;
  items?: GuardItem[];
  outro: string;
  onEditXml?: () => void;
  onEditAnyway?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={className}>
      <div
        className="w-full max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm"
        role="alert"
        data-testid="editor-guard"
      >
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-amber-900">{intro}</p>
            {items.length > 0 && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md bg-white/60 px-3 py-2 text-xs">
                {items.map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    <span className="text-amber-900">{item.label}: </span>
                    <span className="font-mono text-amber-800">{item.detail}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-amber-900">{outro}</p>

            {confirming ? (
              <div className="mt-3 rounded-md border border-amber-300 bg-white p-3">
                <p className="text-amber-950">
                  The listed content is removed from the item as soon as you
                  make your first change. Edit it here anyway?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={onEditAnyway}
                    data-testid="editor-guard-confirm"
                  >
                    Yes, edit and drop it
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              (onEditXml || onEditAnyway) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {onEditXml && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={onEditXml}
                      data-testid="editor-guard-xml"
                    >
                      <Code2 className="mr-1.5 h-4 w-4" />
                      Edit in XML editor
                    </Button>
                  )}
                  {onEditAnyway && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirming(true)}
                      data-testid="editor-guard-anyway"
                    >
                      Edit anyway
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
