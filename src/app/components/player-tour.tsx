import { GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COACH_NAMES,
  PLAYER_MODES,
  type CoachCharacter,
  type PlayerMode,
  type PlayerTheme,
} from "../qti/session-options";
import { markPlayerTourSeen } from "../qti/tour-seen";
import { CoachAvatar, type CoachMood } from "./practice-coach";

/**
 * The coach's tour of the player, for readers who came in through an example.
 *
 * An example skips the intro screen (it already knows its layout and mode), so
 * nothing would tell the reader that test and practice are a switch away. The
 * coach says so, with the switch in its bubble, and points out the rest.
 *
 * Steps point at the page through `data-tour` attributes. A step whose target
 * is not on the page (the Check button in test mode) is left out, so the tour
 * follows the mode as the reader flips it.
 */
export type TourStepId = "welcome" | "mode" | "check" | "tools" | "done";

const TOUR_TARGETS: Partial<Record<TourStepId, string>> = {
  mode: "player-options",
  check: "practice-coach",
  tools: "player-tools",
};

const MODE_ICONS: Record<PlayerMode, LucideIcon> = {
  test: GraduationCap,
  practice: Sparkles,
};

const tourTarget = (step: TourStepId) => {
  const name = TOUR_TARGETS[step];
  return name ? document.querySelector<HTMLElement>(`[data-tour="${name}"]`) : null;
};

type Rect = { top: number; left: number; width: number; height: number };

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a &&
    !!b &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height);

/** The target's box, followed while the player lays out around it (items load, fonts swap). */
function useTargetRect(step: TourStepId) {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    let frame = 0;
    let last: Rect | null = null;
    const measure = () => {
      const box = tourTarget(step)?.getBoundingClientRect();
      const next = box?.width
        ? { top: box.top, left: box.left, width: box.width, height: box.height }
        : null;
      if (!sameRect(last, next)) {
        last = next;
        setRect(next);
      }
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [step]);
  return rect;
}

const SPOTLIGHT_PADDING = 6;
const GUTTER = 16;

export function PlayerTour({
  character,
  mode,
  theme,
  onModeChange,
  onStepChange,
  onClose,
}: {
  character: CoachCharacter;
  mode: PlayerMode;
  /** On the body, outside the player, so the theme has to be carried over. */
  theme: PlayerTheme;
  onModeChange: (mode: PlayerMode) => void;
  /** So the player can bring the real coach on stage for the Check step. */
  onStepChange?: (step: TourStepId) => void;
  onClose: () => void;
}) {
  const name = COACH_NAMES[character];
  const [step, setStep] = useState<TourStepId>("welcome");
  // Practice puts the Check button on the page; a step without its target is skipped.
  const steps = (["welcome", "mode", "check", "tools", "done"] as const).filter(
    (id) => id !== "check" || mode === "practice",
  );
  const index = Math.max(0, steps.indexOf(step as (typeof steps)[number]));
  const rect = useTargetRect(steps[index]);
  const current = steps[index];
  const centred = !TOUR_TARGETS[current];

  useEffect(() => {
    onStepChange?.(current);
  }, [current, onStepChange]);

  const finish = () => {
    markPlayerTourSeen();
    onClose();
  };
  const next = () =>
    index < steps.length - 1 ? setStep(steps[index + 1]) : finish();
  const back = () => index > 0 && setStep(steps[index - 1]);

  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primaryRef.current?.focus();
  }, [current]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const content: Record<TourStepId, { mood: CoachMood; title: string; body: string }> = {
    welcome: {
      mood: "idle",
      title: `Hi, I'm ${name}!`,
      body:
        mode === "practice"
          ? "This example is a practice run, and I'm your coach. Shall I show you around first?"
          : "This example plays as a test. I coach practice runs, so let me show you how to call me in.",
    },
    mode: {
      mood: mode === "practice" ? "idle" : "thinking",
      title: "Test or practice?",
      body:
        mode === "practice"
          ? "Practice checks each answer straight away, with me cheering you on. Prefer a real test? Switch here, any time."
          : "A test is handed in at the end. Practice checks every answer straight away, and I come along. Try it:",
    },
    check: {
      mood: "idle",
      title: "Check your answer",
      body: "Answer the question, then press Check. I'll tell you how you did, and show you the right answer if you ask.",
    },
    tools: {
      mood: "idle",
      title: "Your tools",
      body: "Bookmarks, reading aloud, the QTI editor and more live up here. The Mode menu also changes the layout and colours.",
    },
    done: {
      mood: "correct",
      title: mode === "practice" ? "Ready? Let's go!" : "Good luck!",
      body: "You can take this tour again from the Mode menu.",
    },
  };
  const { mood, title, body } = content[current];

  // Below the target when it fits, else above; the card's own size is not known
  // up front, so "fits" is judged against a typical card.
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(360, viewportWidth - GUTTER * 2);
  const placement: React.CSSProperties = {};
  if (!centred && rect) {
    const below = rect.top + rect.height + SPOTLIGHT_PADDING + 12;
    if (viewportHeight - below >= 240) placement.top = below;
    else placement.bottom = viewportHeight - rect.top + SPOTLIGHT_PADDING + 12;
    // Right-aligned to a target on the right, so a corner target (the coach) keeps its card on screen.
    const left =
      rect.left + rect.width / 2 > viewportWidth / 2
        ? rect.left + rect.width - cardWidth
        : rect.left;
    placement.left = Math.max(GUTTER, Math.min(left, viewportWidth - cardWidth - GUTTER));
  }
  // The real coach is in the spotlight on the Check step; a second one in the card would be one too many.
  const showAvatar = current !== "check";

  // On the body: a transformed ancestor in the player would pin a `fixed` overlay to itself.
  return createPortal(
    <div
      className="fixed inset-0 z-50"
      data-player-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-tour-title"
      aria-describedby="player-tour-body"
      data-testid="player-tour"
      data-step={current}
    >
      {!centred && rect ? (
        <div
          className="pointer-events-none fixed rounded-2xl shadow-[0_0_0_9999px_rgb(15_23_42/0.55)] ring-2 ring-white transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/55" />
      )}

      <div
        key={current}
        className={cn(
          "coach-bubble fixed flex items-end gap-3",
          centred && "inset-0 m-auto h-fit flex-col items-center px-4",
        )}
        style={centred ? undefined : { ...placement, width: cardWidth }}
      >
        {showAvatar && centred ? (
          <div className="h-36 w-28">
            <CoachAvatar character={character} mood={mood} />
          </div>
        ) : null}
        <div
          className={cn(
            "relative min-w-0 flex-1 rounded-2xl border border-citolab-200 bg-white p-4 text-sm text-gray-700 shadow-xl",
            centred && "w-full max-w-sm flex-none",
          )}
        >
          <div className="flex items-start gap-3">
            {showAvatar && !centred ? (
              <div className="-mt-1 h-16 w-12 shrink-0">
                <CoachAvatar character={character} mood={mood} />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2
                id="player-tour-title"
                className="font-display text-base font-semibold text-gray-900"
              >
                {title}
              </h2>
              <p id="player-tour-body" className="mt-1 leading-snug">
                {body}
              </p>
            </div>
          </div>

          {current === "mode" ? (
            <div
              role="radiogroup"
              aria-label="Test or practice"
              className="mt-3 grid grid-cols-2 gap-2"
            >
              {PLAYER_MODES.map((option) => {
                const Icon = MODE_ICONS[option.value];
                const selected = option.value === mode;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onModeChange(option.value)}
                    data-testid={`player-tour-mode-${option.value}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600",
                      selected
                        ? "border-citolab-600 bg-citolab-50 text-citolab-800"
                        : "border-gray-200 text-gray-700 hover:border-gray-300",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <span className="mr-auto text-xs text-gray-400" aria-hidden="true">
              {index + 1} / {steps.length}
            </span>
            {current === "done" ? null : (
              <Button
                variant="ghost"
                size="sm"
                onClick={finish}
                data-testid="player-tour-skip"
              >
                Skip
              </Button>
            )}
            {index > 0 && current !== "done" ? (
              <Button variant="outline" size="sm" onClick={back}>
                Back
              </Button>
            ) : null}
            <Button
              ref={primaryRef}
              size="sm"
              onClick={next}
              data-testid="player-tour-next"
            >
              {current === "welcome"
                ? "Show me around"
                : current === "done"
                  ? "Let's go"
                  : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
