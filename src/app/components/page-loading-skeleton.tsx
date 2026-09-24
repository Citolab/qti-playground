/**
 * The placeholder shown while a page is loading (see `usePageLoading`).
 *
 * Shaped like the page it stands in for — a source column beside the questions
 * when the page has a stimulus, one question column otherwise — so the switch
 * to the real page reads as content filling in rather than a jump.
 */
const Bar = ({ className }: { className: string }) => (
  <div className={`h-3 rounded bg-gray-200 ${className}`} />
);

const QuestionLines = () => (
  <div className="space-y-4">
    <Bar className="w-3/4" />
    <div className="space-y-3 pl-4">
      <Bar className="w-1/3" />
      <Bar className="w-1/4" />
    </div>
  </div>
);

export function PageLoadingSkeleton({
  withStimulus,
  questionCount = 1,
}: {
  withStimulus: boolean;
  questionCount?: number;
}) {
  const questions = (
    <div className="space-y-10">
      {Array.from({ length: Math.max(1, questionCount) }, (_, index) => (
        <QuestionLines key={index} />
      ))}
    </div>
  );

  return (
    <div role="status" aria-live="polite" className="w-full animate-pulse">
      <p className="mb-6 text-sm text-gray-400">Loading…</p>
      {withStimulus ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-3">
            <Bar className="w-full" />
            <Bar className="w-5/6" />
            <div className="mt-4 h-40 w-48 rounded bg-gray-200" />
          </div>
          {questions}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">{questions}</div>
      )}
    </div>
  );
}
