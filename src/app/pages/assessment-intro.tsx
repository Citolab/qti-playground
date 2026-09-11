import { LayoutGrid, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutModeIcon } from "../components/layout-mode-select";
import { AssessmentLayoutMode, LAYOUT_MODES } from "../qti/layout-mode";

/**
 * One way into the test: the layout it starts in.
 *
 * Two buttons rather than a start button plus a setting, because which layout
 * you want is the only choice this screen exists to make — and seeing both side
 * by side is what tells you the player has two. The icon carries the difference
 * (a booklet against a screen), the play badge says the button starts the test,
 * and the tooltip spells the layout out for anyone the icon does not reach.
 */
function StartLayoutButton({
  mode,
  label,
  description,
  onStart,
}: {
  mode: AssessmentLayoutMode;
  label: string;
  description: string;
  onStart: (mode: AssessmentLayoutMode) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onStart(mode)}
          aria-label={`Start – ${label}: ${description}`}
          className="group flex flex-1 flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-citolab-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600"
        >
          <span className="relative">
            <LayoutModeIcon
              mode={mode}
              className="h-10 w-10 text-gray-500 transition-colors group-hover:text-citolab-700"
            />
            <span className="absolute -bottom-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-citolab-600 text-white shadow-sm">
              <Play className="h-3 w-3 fill-current" />
            </span>
          </span>
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          <span className="text-xs text-gray-500">Start</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-56 text-center">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

export function AssessmentIntroScreen({
  assessmentName,
  itemCount,
  maxScore,
  onStart,
  onOpenOverview,
}: {
  assessmentName?: string;
  itemCount: number;
  maxScore?: number;
  onStart: (mode: AssessmentLayoutMode) => void;
  onOpenOverview: () => void;
}) {
  const roundedMaxScore =
    typeof maxScore === "number" ? Math.round(maxScore * 100) / 100 : null;

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 py-6">
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader className="border-b border-gray-200 px-6 py-5 md:px-8">
          <CardTitle className="text-2xl">Assessment overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6">
              <dt className="text-sm font-semibold text-gray-700">
                Assessment name
              </dt>
              <dd className="text-sm text-right text-gray-900">
                {assessmentName || "Unknown assessment"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 bg-gray-50 px-4 py-3 sm:px-6">
              <dt className="text-sm font-semibold text-gray-700">
                Number of questions
              </dt>
              <dd className="text-sm text-right text-gray-900">{itemCount}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6">
              <dt className="text-sm font-semibold text-gray-700">Max score</dt>
              <dd className="text-sm text-right text-gray-900">
                {roundedMaxScore ?? "n/a"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-4">
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                This assessment contains {itemCount}{" "}
                {itemCount === 1 ? "question" : "questions"}. Below are the
                tools you can use.
              </p>
              <h2 className="text-lg font-semibold text-gray-900">Tools</h2>
              <ul className="space-y-2">
                <li>
                  You can zoom in/out or use the bookmark to flag a question.
                </li>
                <li>
                  You can highlight text and insert symbols via the toolbar.
                </li>
              </ul>
            </div>

            <div className="mt-auto space-y-3">
              <TooltipProvider delayDuration={200}>
                <div className="flex flex-wrap gap-3">
                  {LAYOUT_MODES.map((mode) => (
                    <StartLayoutButton
                      key={mode.value}
                      mode={mode.value}
                      label={mode.label}
                      description={mode.description}
                      onStart={onStart}
                    />
                  ))}
                </div>
              </TooltipProvider>
              <Button
                variant="secondary"
                className="w-full"
                onClick={onOpenOverview}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Open overview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
