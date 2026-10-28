import {
  ChevronDown,
  GraduationCap,
  Monitor,
  Route,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssessmentLayoutMode, LAYOUT_MODES } from "../qti/layout-mode";
import {
  availableDevices,
  PLAYER_MODES,
  PLAYER_THEMES,
  type PlayerDevice,
  type PlayerMode,
  type PlayerTheme,
} from "../qti/session-options";
import { LayoutModeIcon } from "./layout-mode-select";

const MODE_ICONS: Record<PlayerMode, LucideIcon> = {
  test: GraduationCap,
  practice: Sparkles,
};

const DEVICE_ICONS: Record<PlayerDevice, LucideIcon> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-wider text-gray-400";

/**
 * Everything the intro screen asks, changeable mid-test from the toolbar.
 *
 * Layout and device reload the player (a layout is a different section
 * structure; a device is a different frame), so picking one closes the menu.
 * Mode and theme apply in place, so the menu stays open to try them out.
 */
export function PlayerOptionsMenu({
  layout,
  mode,
  theme,
  device,
  onLayoutChange,
  onModeChange,
  onThemeChange,
  onDeviceChange,
  onShowTour,
}: {
  layout: AssessmentLayoutMode;
  mode: PlayerMode;
  theme: PlayerTheme;
  device: PlayerDevice;
  onLayoutChange: (layout: AssessmentLayoutMode) => void;
  onModeChange: (mode: PlayerMode) => void;
  onThemeChange: (theme: PlayerTheme) => void;
  /** Left out where the device cannot change, e.g. inside a device preview. */
  onDeviceChange?: (device: PlayerDevice) => void;
  /** The coach's tour of the player, again. */
  onShowTour?: () => void;
}) {
  const [devices] = useState(() => availableDevices(window.innerWidth));
  const summary = [
    LAYOUT_MODES.find((option) => option.value === layout)?.label,
    PLAYER_MODES.find((option) => option.value === mode)?.label,
    PLAYER_THEMES.find((option) => option.value === theme)?.label,
  ]
    .filter(Boolean)
    .join(" · ");
  const keepOpen = (event: Event) => event.preventDefault();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={summary}
          data-tour="player-options"
          className="h-10 gap-2 rounded-full border border-gray-200 bg-white px-3 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white hover:text-gray-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Mode</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[80vh] w-72 overflow-y-auto"
        data-player-theme={theme}
      >
        <DropdownMenuLabel className={SECTION_LABEL}>Layout</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={layout}
          onValueChange={(next) => onLayoutChange(next as AssessmentLayoutMode)}
        >
          {LAYOUT_MODES.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="items-start gap-2 py-2"
            >
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  <LayoutModeIcon mode={option.value} className="h-4 w-4" />
                  {option.label}
                </span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={SECTION_LABEL}>Test or practice</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(next) => onModeChange(next as PlayerMode)}
        >
          {PLAYER_MODES.map((option) => {
            const Icon = MODE_ICONS[option.value];
            return (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                onSelect={keepOpen}
                className="items-start gap-2 py-2"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={SECTION_LABEL}>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(next) => onThemeChange(next as PlayerTheme)}
          className="grid grid-cols-2"
        >
          {PLAYER_THEMES.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              onSelect={keepOpen}
              className="gap-2"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ background: option.swatch }}
              />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {onDeviceChange && devices.length > 1 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className={SECTION_LABEL}>Preview on</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={device}
              onValueChange={(next) => onDeviceChange(next as PlayerDevice)}
            >
              {devices.map((option) => {
                const Icon = DEVICE_ICONS[option.value];
                return (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                    {option.width ? (
                      <span className="ml-auto text-xs text-gray-400">
                        {option.width} × {option.height}
                      </span>
                    ) : null}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </>
        ) : null}

        {onShowTour ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onShowTour} className="gap-2">
              <Route className="h-4 w-4" />
              Show me around
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
