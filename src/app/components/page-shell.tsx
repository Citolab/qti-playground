import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// One cap for every page and for the nav bar above them, so the logo, the page titles and the
// content all share the same left and right edges. `max-w-7xl` alone left ~1000px of dead margin on
// either side of a 3328px display while squeezing the editors into a 550px column, so the wider
// steps hand that space back to the content; text inside stays capped separately by its own
// `max-w-*`. Each step stays comfortably under the width that activates it, so the page never ends
// up capped at exactly the viewport with its margins collapsed to nothing.
export const PAGE_CONTAINER =
  "mx-auto w-full max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[128rem]";

/** The side gutter that goes with `PAGE_CONTAINER`, kept apart so a band can pad itself vertically. */
export const PAGE_GUTTER = "px-4 sm:px-6 lg:px-8";

/**
 * Height for a code editor in a workspace panel: the viewport less the nav, the page header, the
 * panel header and the paddings around them, so both panels end just above the fold instead of
 * pushing the page into a scroll.
 */
export const WORKSPACE_EDITOR_HEIGHT = "max(24rem, calc(100dvh - 15rem))";

interface PageShellProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Small pill next to the title, e.g. "Beta". */
  badge?: string;
  /** Right-aligned controls in the page header. */
  actions?: ReactNode;
  /**
   * `document` pages scroll and keep the header generous; `workspace` pages (side-by-side editors)
   * get a compact header so the panels keep the height.
   */
  variant?: "document" | "workspace";
  children: ReactNode;
}

export function PageShell({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  variant = "document",
  children,
}: PageShellProps) {
  const compact = variant === "workspace";

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div
          className={cn(
            PAGE_CONTAINER,
            PAGE_GUTTER,
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            compact ? "py-3" : "py-6",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? (
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-citolab-600 to-citolab-teal-700 text-white shadow-sm",
                  compact ? "h-8 w-8" : "h-10 w-10",
                )}
              >
                <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h1
                className={cn(
                  "flex items-center gap-2 font-semibold tracking-tight text-gray-900",
                  compact ? "text-base" : "text-xl",
                )}
              >
                <span className="truncate">{title}</span>
                {badge ? (
                  <span className="shrink-0 rounded-full bg-citolab-50 px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-citolab-700 ring-1 ring-inset ring-citolab-600/20">
                    {badge}
                  </span>
                ) : null}
              </h1>
              {description ? (
                <p
                  className={cn(
                    "text-gray-500",
                    compact ? "truncate text-xs" : "mt-1 max-w-3xl text-sm",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      <div
        className={cn(
          PAGE_CONTAINER,
          PAGE_GUTTER,
          "flex-1",
          compact ? "py-4" : "py-6 lg:py-8",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** The white surface that document pages put their content on. */
export function PageCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
