import {
  Bookmark,
  GraduationCap,
  LayoutGrid,
  Monitor,
  Play,
  Smartphone,
  Sparkles,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LayoutModeIcon } from "../components/layout-mode-select";
import { AssessmentLayoutMode, LAYOUT_MODES } from "../qti/layout-mode";
import {
  availableDevices,
  PLAYER_MODES,
  PLAYER_THEMES,
  type PlayerDevice,
  type PlayerMode,
  type PlayerTheme,
} from "../qti/session-options";

/** Everything the reader chooses before the test starts. */
export interface SessionSettings {
  layout: AssessmentLayoutMode;
  mode: PlayerMode;
  theme: PlayerTheme;
  device: PlayerDevice;
}

const MODE_ICONS: Record<PlayerMode, LucideIcon> = {
  test: GraduationCap,
  practice: Sparkles,
};

const DEVICE_ICONS: Record<PlayerDevice, LucideIcon> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

/**
 * The tools this screen promises, each shown as the control the player actually
 * has.
 *
 * The icon is the point: a magnifying glass next to "zoom" reads as a control
 * to hunt for, and the player has no such button -- zooming is a
 * minus/percentage/plus pill. So the icon *is* that pill, and the bookmark is
 * the same glyph the question header carries.
 */
const TOOLS: { key: string; title: string; description: string; icon: ReactNode }[] =
  [
    {
      key: "zoom",
      title: "Zoom",
      description:
        "Use the plus and minus buttons to zoom in and out, or click the percentage to reset to 100%.",
      icon: (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-citolab-700">
          <span aria-hidden="true">&minus;</span>
          <span>100%</span>
          <span aria-hidden="true">+</span>
        </span>
      ),
    },
    {
      key: "bookmark",
      title: "Bookmark",
      description:
        "Flag a question to come back to it later. Bookmarked questions are marked in the question list and the overview.",
      icon: <Bookmark className="h-5 w-5 text-citolab-700" />,
    },
  ];

/** A row of mutually exclusive cards: one setting of the session. */
function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; description?: string; icon: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </legend>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          "grid gap-2",
          options.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : options.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              title={option.description}
              className={cn(
                "flex min-w-0 items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600 focus-visible:ring-offset-1",
                selected
                  ? "border-citolab-600 bg-citolab-50 text-citolab-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              <span className="shrink-0">{option.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{option.label}</span>
                {option.description ? (
                  <span className="block text-xs leading-snug text-gray-500">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AssessmentIntroScreen({
  assessmentName,
  itemCount,
  maxScore,
  initialSettings,
  onStart,
  onOpenOverview,
}: {
  assessmentName?: string;
  itemCount: number;
  maxScore?: number;
  initialSettings: SessionSettings;
  onStart: (settings: SessionSettings) => void;
  onOpenOverview: () => void;
}) {
  const roundedMaxScore =
    typeof maxScore === "number" ? Math.round(maxScore * 100) / 100 : null;
  const [settings, setSettings] = useState(initialSettings);
  const update = <K extends keyof SessionSettings>(key: K, value: SessionSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));
  // Read once: a device preview only makes sense on a screen larger than the device.
  const [devices] = useState(() => availableDevices(window.innerWidth));

  return (
    // The card takes the chosen theme as it is picked, as a preview of the player to come.
    <div
      data-player-theme={settings.theme}
      className="flex min-h-full w-full items-start justify-center bg-gray-100 px-3 py-4 sm:items-center sm:px-4 sm:py-6"
    >
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader className="border-b border-gray-200 px-5 py-4 md:px-8 md:py-5">
          <CardTitle className="font-display text-xl sm:text-2xl">
            {assessmentName || "Unknown assessment"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? "question" : "questions"}
            {roundedMaxScore !== null ? ` · max score ${roundedMaxScore}` : ""}
          </p>
        </CardHeader>
        <CardContent className="grid gap-8 p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:p-8">
          {/* After the options on a phone, so Start is in reach without scrolling past the tools. */}
          <div className="order-2 space-y-3 text-sm text-gray-700 md:order-1">
            <h2 className="text-base font-semibold text-gray-900">Tools</h2>
            <ul className="space-y-3">
              {TOOLS.map((tool) => (
                <li
                  key={tool.key}
                  // The player has no zoom buttons on a phone; pinching does it.
                  className={cn(
                    "flex items-start gap-3",
                    tool.key === "zoom" && "hidden sm:flex",
                  )}
                >
                  {/* Width grows with the content rather than being a fixed
                      circle: the zoom "icon" is a three-part pill, not a
                      glyph, and a 2.5rem circle would clip it. */}
                  <span className="mt-0.5 flex h-10 w-auto min-w-10 shrink-0 items-center justify-center rounded-full bg-citolab-50 px-2 text-citolab-700">
                    {tool.icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900">
                      {tool.title}
                    </span>
                    <span className="block text-gray-600">{tool.description}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={onOpenOverview}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Open overview
            </Button>
          </div>

          <div className="order-1 flex flex-col gap-5 md:order-2">
            <OptionGroup
              label="Layout"
              value={settings.layout}
              onChange={(value) => update("layout", value)}
              options={LAYOUT_MODES.map((mode) => ({
                value: mode.value,
                label: mode.label,
                description: mode.description,
                icon: <LayoutModeIcon mode={mode.value} className="h-6 w-6" />,
              }))}
            />
            <OptionGroup
              label="Mode"
              value={settings.mode}
              onChange={(value) => update("mode", value)}
              options={PLAYER_MODES.map((mode) => {
                const Icon = MODE_ICONS[mode.value];
                return {
                  value: mode.value,
                  label: mode.label,
                  description: mode.description,
                  icon: <Icon className="h-6 w-6" />,
                };
              })}
            />
            <OptionGroup
              label="Theme"
              value={settings.theme}
              onChange={(value) => update("theme", value)}
              options={PLAYER_THEMES.map((theme) => ({
                value: theme.value,
                label: theme.label,
                icon: (
                  <span
                    className="block h-5 w-5 rounded-full ring-2 ring-white shadow"
                    style={{ background: theme.swatch }}
                  />
                ),
              }))}
            />
            {devices.length > 1 ? (
              <OptionGroup
                label="Preview on"
                value={settings.device}
                onChange={(value) => update("device", value)}
                options={devices.map((device) => {
                  const Icon = DEVICE_ICONS[device.value];
                  return {
                    value: device.value,
                    label: device.label,
                    icon: <Icon className="h-5 w-5" />,
                  };
                })}
              />
            ) : null}

            <Button
              size="lg"
              className="mt-1 h-12 w-full text-base"
              onClick={() => onStart(settings)}
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
