import { BookOpenText, ChevronDown, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  AssessmentLayoutMode,
  LAYOUT_MODES,
} from "../qti/layout-mode";

/** The icon each layout is recognised by, here and on the intro screen. */
export const LayoutModeIcon = ({
  mode,
  className,
}: {
  mode: AssessmentLayoutMode;
  className?: string;
}) => {
  const Icon = mode === "vertical" ? BookOpenText : MonitorPlay;
  return <Icon className={className} />;
};

/**
 * Switch the player between the paged and the scrolling layout.
 *
 * Changing it reloads the test: the two layouts are different section
 * structures, not different stylesheets (see `test-layout-transforms.ts`).
 */
export function LayoutModeSelect({
  value,
  onChange,
  className,
}: {
  value: AssessmentLayoutMode;
  onChange: (mode: AssessmentLayoutMode) => void;
  className?: string;
}) {
  const active = LAYOUT_MODES.find((mode) => mode.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={active?.description}
          className={cn(
            "h-10 gap-2 rounded-full border border-gray-200 bg-white px-3 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white hover:text-gray-900",
            className,
          )}
        >
          <LayoutModeIcon mode={value} className="h-4 w-4" />
          <span className="hidden sm:inline">{active?.label ?? "Layout"}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Layout</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as AssessmentLayoutMode)}
        >
          {LAYOUT_MODES.map((mode) => (
            <DropdownMenuRadioItem
              key={mode.value}
              value={mode.value}
              className="items-start gap-2 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  <LayoutModeIcon mode={mode.value} className="h-4 w-4" />
                  {mode.label}
                </span>
                <span className="text-xs text-gray-500">
                  {mode.description}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
