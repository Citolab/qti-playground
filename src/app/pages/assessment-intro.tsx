import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  onStart: () => void;
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

            <div className="mt-auto flex flex-wrap gap-3">
              <Button onClick={onStart}>Start</Button>
              <Button variant="secondary" onClick={onOpenOverview}>
                Open overview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
