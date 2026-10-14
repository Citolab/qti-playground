import { AlertTriangle, CheckCircle, LayoutGrid, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

/**
 * Confirm handing in: how much is answered, and a warning when not everything
 * is. Adapted from cito-test-uit's HandInDialog. Nothing is sent anywhere --
 * the playground has no server; handing in ends the attempt locally.
 */
export function HandInDialog({
  open,
  answered,
  total,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  answered: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const unanswered = total - answered;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hand in</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {unanswered === 0 ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-citolab-600" />
              <div>
                <p className="mb-1 font-medium text-gray-800">
                  All questions are answered.
                </p>
                <p className="text-sm text-gray-600">
                  Hand in the test now?
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="mb-1 font-medium text-gray-800">
                  Not every question is answered
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-amber-600">
                    {unanswered}
                  </span>{" "}
                  {unanswered === 1 ? "question is" : "questions are"} still
                  unanswered. Hand in anyway?
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>
                {answered} of {total} answered
              </span>
            </div>
            <Progress value={percent} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Keep working
            </Button>
            {/* autoFocus: Enter confirms, as in cito-test-uit. */}
            <Button autoFocus onClick={onConfirm}>
              Hand in
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type HandInResult = {
  answered: number;
  total: number;
  /** Summed SCORE of the auto-scored questions; MAXSCORE only when all are known. */
  score: number | null;
  maxScore: number | null;
  /** Questions the runner cannot score itself (open answers). */
  manuallyScored: number;
};

/** What the reader sees after handing in. */
export function HandedInScreen({
  result,
  onReview,
  onStartAgain,
}: {
  result: HandInResult;
  onReview: () => void;
  onStartAgain: () => void;
}) {
  const { answered, total, score, maxScore, manuallyScored } = result;
  return (
    <div className="flex min-h-full items-start justify-center p-6 pt-16">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle className="mx-auto mb-4 h-10 w-10 text-citolab-600" />
        <h2 className="mb-1 text-xl font-semibold text-gray-900">Handed in</h2>
        <p className="mb-6 text-sm text-gray-600">
          {answered} of {total} questions answered.
        </p>

        {score !== null && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-3xl font-semibold text-gray-900">
              {Number(score.toFixed(2))}
              {/* Only when every question's maximum is known. */}
              {maxScore !== null && maxScore > 0 && (
                <span className="text-lg font-normal text-gray-500">
                  {" "}
                  / {Number(maxScore.toFixed(2))}
                </span>
              )}
            </p>
            {manuallyScored > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Not counted: {manuallyScored} open{" "}
                {manuallyScored === 1 ? "question needs" : "questions need"}{" "}
                manual scoring.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={onReview}>
            <LayoutGrid className="mr-1 h-4 w-4" />
            Review answers
          </Button>
          <Button variant="outline" onClick={onStartAgain}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Start again
          </Button>
        </div>
      </div>
    </div>
  );
}
