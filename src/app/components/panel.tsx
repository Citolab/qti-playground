import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  title: string;
  actionComponents: ReactNode[];
  pinnedActions?: ReactNode[];
  children: ReactNode | ReactNode[];
}

export function Panel({
  title,
  actionComponents,
  pinnedActions = [],
  children,
}: Props) {
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pinnedOnlyRef = useRef<HTMLDivElement>(null);
  const [useOverflowMenu, setUseOverflowMenu] = useState(false);
  const overflowRef = useRef(false);

  useEffect(() => {
    const header = headerRef.current;
    const titleEl = titleRef.current;
    const measure = measureRef.current;
    if (!header || !titleEl || !measure) return;

    let raf = 0;
    const updateLayout = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const pinnedWidth = pinnedOnlyRef.current?.offsetWidth ?? 0;
        // Space left for action buttons — do NOT include the actions themselves,
        // or toggling overflow changes the measurement and flickers forever.
        const availableWidth =
          header.clientWidth - titleEl.offsetWidth - pinnedWidth - 24;
        const actionsWidth = measure.scrollWidth;
        const menuButtonWidth = 40;
        const needsOverflow =
          header.clientWidth < 560 ||
          actionsWidth > Math.max(availableWidth - menuButtonWidth, 0);

        // Hysteresis: once in overflow, require a bit of spare room to exit
        let next = needsOverflow;
        if (overflowRef.current && !needsOverflow) {
          next = actionsWidth > availableWidth - menuButtonWidth - 12;
        }

        if (next !== overflowRef.current) {
          overflowRef.current = next;
          setUseOverflowMenu(next);
        }
      });
    };

    const observer = new ResizeObserver(updateLayout);
    observer.observe(header);
    observer.observe(measure);
    if (pinnedOnlyRef.current) observer.observe(pinnedOnlyRef.current);
    updateLayout();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // Intentionally not depending on actionComponents arrays (new every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, actionComponents.length, pinnedActions.length]);

  return (
    <div className="h-full w-full relative p-4">
      <Card className="h-full overflow-hidden">
        <CardHeader
          ref={headerRef}
          className={cn(
            "relative flex-row items-center gap-2 space-y-0 p-0 px-3 py-2.5 min-h-11",
          )}
        >
          <CardTitle
            ref={titleRef}
            className="shrink-0 text-sm font-semibold leading-none whitespace-nowrap"
          >
            {title}
          </CardTitle>

          {/* Off-screen full-width measure of all actions */}
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible fixed -left-[9999px] top-0 flex items-center gap-1.5"
          >
            {actionComponents.map((action, index) => (
              <div key={index} className="shrink-0">
                {action}
              </div>
            ))}
          </div>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5">
            <div ref={pinnedOnlyRef} className="flex shrink-0 items-center gap-1.5">
              {pinnedActions.map((action, index) => (
                <div key={`pinned-${index}`} className="shrink-0">
                  {action}
                </div>
              ))}
            </div>

            {useOverflowMenu ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 shrink-0 p-0"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto p-2">
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {actionComponents.map((action, index) => (
                      <div key={index} className="shrink-0">
                        {action}
                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              actionComponents.map((action, index) => (
                <div key={index} className="shrink-0">
                  {action}
                </div>
              ))
            )}
          </div>
        </CardHeader>
        <CardContent className="relative mt-2 px-3 pt-0">{children}</CardContent>
      </Card>
    </div>
  );
}
