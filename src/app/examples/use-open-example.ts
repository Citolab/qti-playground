import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { DEFAULT_LAYOUT_MODE } from "../qti/layout-mode";
import { hasSeenPlayerTour } from "../qti/tour-seen";
import {
  DEFAULT_COACH_CHARACTER,
  DEFAULT_PLAYER_MODE,
} from "../qti/session-options";
import { buildExamplePackage, EXAMPLE_PACKAGES } from "./catalog";

/**
 * Load an example package into the store, as if the user had dropped it in,
 * and go to it: straight into the player in the example's own layout (`play`),
 * or to the player's overview of all its items (`browse`), from where the
 * player's Edit button opens them in the editor.
 */
export function useOpenExample() {
  const navigate = useNavigate();
  const processPackage = useStore((state) => state.processPackage);
  const resetAssessmentProgress = useStore(
    (state) => state.resetAssessmentProgress,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openExample = useCallback(
    async (id: string, target: "play" | "browse") => {
      setLoadingId(id);
      setError("");
      try {
        const file = await buildExamplePackage(id);
        const state = await processPackage(file, {
          removeStylesheets: false,
          skipValidation: false,
          source: "example",
        });
        const assessmentId = state.assessments[0]?.id;
        if (target === "play" && assessmentId) {
          // A fresh run every time: an example is a demo, not a saved attempt.
          resetAssessmentProgress(assessmentId);
          // `start=1` skips the intro screen: its only question is the layout,
          // and each example already has one.
          // `example` lets the player dress the page in the example's backdrop.
          const params = new URLSearchParams({ start: "1", example: id });
          const example = EXAMPLE_PACKAGES.find((e) => e.id === id);
          if (example && example.layout !== DEFAULT_LAYOUT_MODE) {
            params.set("layout", example.layout);
          }
          if (example?.mode && example.mode !== DEFAULT_PLAYER_MODE) {
            params.set("mode", example.mode);
          }
          if (example?.coach && example.coach !== DEFAULT_COACH_CHARACTER) {
            params.set("coach", example.coach);
          }
          // The intro is where the mode is chosen; skipping it, the coach shows
          // the way instead, once per browser.
          if (!hasSeenPlayerTour()) params.set("tour", "1");
          navigate(`/assessment/${assessmentId}?${params.toString()}`);
        } else if (assessmentId) {
          // The player's overview, not the assessment player page: that page
          // is for the user's own package and never shows an example.
          navigate(`/assessment/${assessmentId}?overview=true`);
        }
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not open example.",
        );
      } finally {
        setLoadingId(null);
      }
    },
    [navigate, processPackage, resetAssessmentProgress],
  );

  return { openExample, loadingId, error };
}
