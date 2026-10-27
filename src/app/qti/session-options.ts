/**
 * How a test is taken, besides its layout (see layout-mode.ts). Chosen on the
 * intro screen and kept in the URL with the layout, so a reload or a shared
 * link keeps the session the way it was started.
 *
 * Modelled on the options of the reference QTI player
 * (https://github.com/Citolab/qti-player): its theme picker and its formative
 * "check" flow, here as a practice mode with a coach.
 */

/**
 * - `test`      answer everything, hand in at the end, then see the score.
 * - `practice`  check each answer straight away; a coach reacts to it.
 */
export type PlayerMode = "test" | "practice";

export const DEFAULT_PLAYER_MODE: PlayerMode = "test";

export const PLAYER_MODES: {
  value: PlayerMode;
  label: string;
  description: string;
}[] = [
  {
    value: "test",
    label: "Test",
    description: "Answer every question, hand in, then see your score.",
  },
  {
    value: "practice",
    label: "Practice",
    description: "Check each answer straight away, with a coach cheering you on.",
  },
];

export const parsePlayerMode = (value: string | null | undefined): PlayerMode =>
  value === "practice" ? "practice" : DEFAULT_PLAYER_MODE;

export type PlayerTheme = "citolab" | "plum" | "ocean" | "sunset";

export const DEFAULT_PLAYER_THEME: PlayerTheme = "citolab";

/**
 * `swatch` is only for the picker; the colours themselves live in styles.css,
 * under `[data-player-theme]`, where they re-point the brand scale for the
 * player chrome and `--qti-primary` for the items.
 */
export const PLAYER_THEMES: {
  value: PlayerTheme;
  label: string;
  swatch: string;
}[] = [
  { value: "citolab", label: "CitoLab", swatch: "#00a748" },
  { value: "plum", label: "Plum", swatch: "#74288c" },
  { value: "ocean", label: "Ocean", swatch: "#2563eb" },
  { value: "sunset", label: "Sunset", swatch: "#ea580c" },
];

export const parsePlayerTheme = (
  value: string | null | undefined,
): PlayerTheme =>
  PLAYER_THEMES.some((theme) => theme.value === value)
    ? (value as PlayerTheme)
    : DEFAULT_PLAYER_THEME;

/**
 * The screen the test is previewed on. Tablet and mobile render the player in
 * an iframe of that size (see pages/device-preview.tsx), so its media queries
 * answer to the device, not to the browser window around it.
 */
export type PlayerDevice = "desktop" | "tablet" | "mobile";

export const DEFAULT_PLAYER_DEVICE: PlayerDevice = "desktop";

export const PLAYER_DEVICES: {
  value: PlayerDevice;
  label: string;
  width: number;
  height: number;
}[] = [
  { value: "desktop", label: "Desktop", width: 0, height: 0 },
  { value: "tablet", label: "Tablet", width: 820, height: 1180 },
  { value: "mobile", label: "Mobile", width: 390, height: 844 },
];

export const parsePlayerDevice = (
  value: string | null | undefined,
): PlayerDevice =>
  value === "tablet" || value === "mobile" ? value : DEFAULT_PLAYER_DEVICE;

/**
 * Only devices smaller than the screen in use are worth offering: on a phone,
 * "preview on a phone" is just the page itself. Desktop always stays, as the
 * way back to the full window.
 */
export const availableDevices = (viewportWidth: number) =>
  PLAYER_DEVICES.filter(
    (device) => device.value === "desktop" || device.width + 160 <= viewportWidth,
  );
