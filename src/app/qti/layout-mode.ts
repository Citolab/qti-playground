/**
 * The two player layouts the assessment preview offers, mirroring the
 * `verticalScroll` setting in cito-test-uit:
 *
 * - `classic`  one question per screen, clicked through with prev/next. Items
 *              that share a stimulus are grouped onto a single screen and
 *              navigated by section (see `groupItemRefsBySharedStimulus`).
 * - `vertical` the whole test as one scrolling page, the way a paper booklet
 *              reads. Implemented by collapsing the test into one section and
 *              navigating to it once.
 */
export type AssessmentLayoutMode = "classic" | "vertical";

export const DEFAULT_LAYOUT_MODE: AssessmentLayoutMode = "classic";

export const LAYOUT_MODES: {
  value: AssessmentLayoutMode;
  label: string;
  description: string;
}[] = [
  {
    value: "classic",
    label: "Classic",
    description: "One question per screen, clicked through page by page.",
  },
  {
    value: "vertical",
    label: "Vertical",
    description: "The whole test on one scrolling page, like a paper booklet.",
  },
];

export const isLayoutMode = (
  value: string | null | undefined,
): value is AssessmentLayoutMode => value === "classic" || value === "vertical";

export const parseLayoutMode = (
  value: string | null | undefined,
): AssessmentLayoutMode => (isLayoutMode(value) ? value : DEFAULT_LAYOUT_MODE);
