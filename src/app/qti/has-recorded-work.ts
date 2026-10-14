import type { ExtendedTestContext } from "@citolab/qti-api";

/**
 * Does this context carry any candidate work: a recorded response, a saved
 * interaction state or a completed item?
 *
 * Decides whether the persisted context may still be written into the runner.
 * Once the runner holds answers it is the only up-to-date copy, and writing an
 * older stored snapshot over it silently discards the answers given since.
 *
 * Copied from cito-test-uit (`hasRecordedWork.ts`).
 */
export const hasRecordedWork = (
  context: ExtendedTestContext | null | undefined,
): boolean =>
  (context?.items ?? []).some((item) => {
    if (item?.state) return true;
    return (item?.variables ?? []).some((variable) => {
      const identifier = variable?.identifier;
      if (identifier === "completionStatus") {
        return variable.value === "completed";
      }
      if (!identifier?.startsWith("RESPONSE")) return false;
      const value = variable.value;
      if (value == null || value === "") return false;
      return !(Array.isArray(value) && value.length === 0);
    });
  });
