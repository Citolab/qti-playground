import { Code2, PenLine } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MODES = [
  { href: "/edit", label: "Visual", icon: PenLine },
  { href: "/preview", label: "XML", icon: Code2 },
];

/**
 * /edit and /preview work on the same item in the store, so they are one
 * Editor with two ways in: a visual editor next to the generated XML, or the
 * XML by hand next to the live player.
 */
export function EditorModeSwitch() {
  const { pathname } = useLocation();

  return (
    <div
      role="tablist"
      aria-label="Editor mode"
      className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5"
    >
      {MODES.map((mode) => {
        const active = pathname === mode.href;
        return (
          <Link
            key={mode.href}
            to={mode.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
              active
                ? "bg-white text-citolab-700 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-900",
            )}
          >
            <mode.icon className="h-3.5 w-3.5" />
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
