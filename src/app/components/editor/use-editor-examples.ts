import { useEffect, useState } from "react";
import {
  EDITOR_EXAMPLE_ITEMS,
  EXAMPLE_BASE_PATH,
  type ExampleItem,
} from "../../pages/item-source";

/**
 * The example list, filtered by the gate that actually decides -- reading each
 * example and running `findUnsupportedItemFeatures` over it, rather than
 * trusting the one interaction each example is tagged with.
 *
 * The tag cannot answer the question on its own: an example can showcase a
 * supported interaction and still be refused for what surrounds it (feedback,
 * template processing, `adaptive="true"`). Offering such an example would open
 * the editor on it and immediately refuse -- a dead menu entry.
 *
 * `EDITOR_EXAMPLE_ITEMS` is still the starting point, as the cheap pre-filter:
 * an example whose interaction the editor cannot represent needs no reading to
 * be ruled out, and starting from it means the menu only ever shrinks as the
 * check lands, never gains entries a moment after opening.
 */
const checkExamples = async (): Promise<ExampleItem[]> => {
  const { findUnsupportedItemFeatures } = await import(
    "./unsupported-interactions"
  );

  const results = await Promise.all(
    EDITOR_EXAMPLE_ITEMS.map(async (example) => {
      try {
        const response = await fetch(`${EXAMPLE_BASE_PATH}${example.href}`);
        if (!response.ok) return null;
        const unsupported = findUnsupportedItemFeatures(await response.text());
        if (unsupported.length === 0) return example;
        if (import.meta.env.DEV) {
          // Not an error: the pre-filter only knows the example's interaction.
          // Worth saying out loud, because the alternative is an example that
          // silently vanishes from the menu.
          console.warn(
            `[editor] example "${example.name}" is tagged as editable but the editor refuses it.`,
            { unsupported },
          );
        }
        return null;
      } catch (error) {
        console.warn(
          `[editor] could not read example "${example.name}" to check it.`,
          error,
        );
        return null;
      }
    }),
  );

  return results.filter((example): example is ExampleItem => example !== null);
};

/**
 * Shared across mounts: the examples are static files, so the answer cannot
 * change within a session and navigating back to /edit should not re-read them.
 */
let checkedExamples: Promise<ExampleItem[]> | null = null;

export function useEditorExamples(): ExampleItem[] {
  const [examples, setExamples] = useState<ExampleItem[]>(EDITOR_EXAMPLE_ITEMS);

  useEffect(() => {
    let active = true;
    checkedExamples ??= checkExamples();
    void checkedExamples.then((verified) => {
      if (active) setExamples(verified);
    });
    return () => {
      active = false;
    };
  }, []);

  return examples;
}
