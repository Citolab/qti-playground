import { useId, useMemo } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoachCharacter } from "../qti/session-options";

export type CoachMood =
  | "idle"
  | "thinking"
  | "correct"
  | "partial"
  | "incorrect"
  | "unanswered"
  | "open";

/**
 * The practice-mode coach: a little sprout that reacts to each check. Drawn in
 * the brand scale (`--color-citolab-*`), so it takes on the player theme.
 * Animations live in styles.css and stop under `prefers-reduced-motion`.
 */
function Sprout({ mood }: { mood: CoachMood }) {
  const happy = mood === "correct";
  const sad = mood === "incorrect";
  const unsure = mood === "thinking" || mood === "unanswered";

  // Mouth per mood, in the 120x120 box: a wide open grin, a small smile, a
  // wobbly "oops", a flat line while it waits.
  const mouth = happy
    ? "M46 74 Q60 92 74 74 Z"
    : sad
      ? "M48 82 Q54 76 60 80 Q66 84 72 78"
      : unsure
        ? "M52 79 H68"
        : "M48 76 Q60 86 72 76";

  return (
    <svg viewBox="0 0 120 130" className="h-full w-full overflow-visible" aria-hidden="true">
      {happy ? <Confetti /> : null}
      <ellipse cx="60" cy="124" rx="30" ry="5" fill="#004119" opacity="0.12" />
      <g className="coach-body" data-mood={mood}>
        {/* the sprout on its head */}
        <path d="M60 30 C60 22 60 16 62 10" stroke="var(--color-citolab-800)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M62 12 C70 2 84 4 86 8 C80 16 70 18 62 12 Z" fill="var(--color-citolab-700)" />
        <path d="M60 16 C52 8 40 10 38 14 C44 20 54 21 60 16 Z" fill="var(--color-citolab-600)" />
        {/* arms: up in the air when it is pleased */}
        <ellipse
          cx={happy ? 18 : 20}
          cy={happy ? 50 : 84}
          rx="9"
          ry="14"
          fill="var(--color-citolab-700)"
          transform={happy ? "rotate(-35 18 50)" : "rotate(20 20 84)"}
        />
        <ellipse
          cx={happy ? 102 : 100}
          cy={happy ? 50 : 84}
          rx="9"
          ry="14"
          fill="var(--color-citolab-700)"
          transform={happy ? "rotate(35 102 50)" : "rotate(-20 100 84)"}
        />
        {/* body */}
        <path d="M60 28 C88 28 104 48 104 76 C104 104 86 118 60 118 C34 118 16 104 16 76 C16 48 32 28 60 28 Z" fill="var(--color-citolab-600)" />
        <ellipse cx="60" cy="92" rx="28" ry="22" fill="var(--color-citolab-100)" opacity="0.9" />
        {/* eyes: looking up while it thinks */}
        <g className="coach-eye">
          <ellipse cx="45" cy="62" rx="9" ry="10" fill="#fff" />
          <ellipse cx="75" cy="62" rx="9" ry="10" fill="#fff" />
          {happy ? (
            <>
              <path d="M38 63 Q45 55 52 63" stroke="#1f2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M68 63 Q75 55 82 63" stroke="#1f2937" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx={unsure ? 47 : 46} cy={unsure ? 58 : 64} r="4.5" fill="#1f2937" />
              <circle cx={unsure ? 77 : 76} cy={unsure ? 58 : 64} r="4.5" fill="#1f2937" />
              <circle cx={unsure ? 48.5 : 47.5} cy={unsure ? 56.5 : 62.5} r="1.5" fill="#fff" />
              <circle cx={unsure ? 78.5 : 77.5} cy={unsure ? 56.5 : 62.5} r="1.5" fill="#fff" />
            </>
          )}
        </g>
        {sad ? (
          <>
            <path d="M36 49 L50 52" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <path d="M84 49 L70 52" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : null}
        <circle cx="34" cy="76" r="5" fill="#ff8fa3" opacity="0.55" />
        <circle cx="86" cy="76" r="5" fill="#ff8fa3" opacity="0.55" />
        <path
          d={mouth}
          stroke="#1f2937"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={happy ? "#7a1f2b" : "none"}
        />
      </g>
    </svg>
  );
}

const CONFETTI_COLOURS = ["#f6c900", "#00b1a9", "#ff6b8b", "#7c5cff", "#00a748", "#ff9f1c"];

/** Blob's dome: a half circle on a rounded-off column, in a 120x150 box. */
const MARTIAN_BODY =
  "M10 70a50 50 0 0 1 100 0v54q0 14 -14 14H24q-14 0 -14 -14z";

/**
 * Blob the martian, from Woordmars: a teal dome with one big glossy eye, lit from the upper left
 * like the planets there. Drawn in fixed colours rather than the brand scale -- the teal is who
 * Blob is. Woordmars' Blob has no mouth; this one gets a small one, because a coach has to show
 * "well done" and "not quite" at a glance, and one eye alone reads too subtly for that.
 */
function Martian({ mood }: { mood: CoachMood }) {
  const happy = mood === "correct";
  const sad = mood === "incorrect";
  const unsure = mood === "thinking" || mood === "unanswered";

  // Several coaches can be on screen at once, and svg ids are global: without this they would all
  // paint with the first instance's gradients.
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;

  // Where the pupil looks: up and away while it thinks, down when it got one wrong.
  const gaze = unsure ? { x: 5, y: -7 } : sad ? { x: 0, y: 6 } : { x: 0, y: 0 };

  // Mouth per mood, a little right of the eye so the face keeps Blob's lopsided look.
  const mouth = happy
    ? "M50 96 Q62 110 74 96 Z"
    : sad
      ? "M52 104 Q57 98 62 102 Q67 106 72 100"
      : unsure
        ? "M55 101 H69"
        : "M52 98 Q62 106 72 98";

  return (
    <svg viewBox="0 0 120 150" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <clipPath id={id("body")}>
          <path d={MARTIAN_BODY} />
        </clipPath>
        <radialGradient id={id("skin")} cx="32%" cy="24%" r="88%">
          <stop offset="0%" stopColor="#A7F7E6" />
          <stop offset="45%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#23B9A3" />
        </radialGradient>
        <radialGradient id={id("sclera")} cx="50%" cy="34%" r="72%">
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C6E4DF" />
        </radialGradient>
        {/* darker at the rim, so the iris reads as a dish rather than a disc */}
        <radialGradient id={id("iris")} cx="50%" cy="66%" r="62%">
          <stop offset="0%" stopColor="#2A8F82" />
          <stop offset="68%" stopColor="#134E4A" />
          <stop offset="100%" stopColor="#0A2F2C" />
        </radialGradient>
        <mask id={id("eye")}>
          <circle cx="50" cy="60" r="20" fill="white" />
        </mask>
      </defs>

      {happy ? <Confetti cx={60} cy={55} /> : null}
      <ellipse cx="60" cy="144" rx="44" ry="5" fill="#0A2F2C" opacity="0.14" />
      <g className="coach-body" data-mood={mood}>
        <path d={MARTIAN_BODY} fill={`url(#${id("skin")})`} />
        <g clipPath={`url(#${id("body")})`}>
          {/* the shadow side, falling away from the light */}
          <ellipse cx="120" cy="88" rx="62" ry="88" fill="#0F766E" opacity="0.3" />
          {/* rim light picking out the lit edge */}
          <ellipse cx="23" cy="64" rx="9" ry="30" fill="#D5FFF6" opacity="0.35" transform="rotate(-18 23 64)" />
          {/* mottled skin, in the spirit of the craters on Mars */}
          <ellipse cx="86" cy="122" rx="11" ry="7" fill="#2FC9B2" opacity="0.45" transform="rotate(-20 86 122)" />
          <ellipse cx="32" cy="126" rx="8" ry="5" fill="#2FC9B2" opacity="0.35" />
          <ellipse cx="72" cy="35" rx="7" ry="4.5" fill="#8CF2E0" opacity="0.4" />
        </g>
        {/* socket: a touch of shadow so the eye sits in the head -- not around a closed eye,
            where it reads as an empty hole */}
        {happy ? null : <circle cx="50" cy="60" r="21.5" fill="#0F766E" opacity="0.25" />}
        {happy ? (
          // Eye closed in a smile: the lid line where the eye was.
          <path d="M34 64 Q50 46 66 64" stroke="#0A2F2C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        ) : (
          <g className="coach-eye">
            <circle cx="50" cy="60" r="20" fill={`url(#${id("sclera")})`} />
            <g mask={`url(#${id("eye")})`}>
              <g className="coach-gaze" data-mood={mood}>
                <circle cx={50 + gaze.x} cy={60 + gaze.y} r="14" fill={`url(#${id("iris")})`} />
                <circle cx={50 + gaze.x} cy={60 + gaze.y} r="6.5" fill="#06211F" />
              </g>
              {/* brow shadow cast down onto the eyeball */}
              <ellipse cx="50" cy="39" rx="23" ry="12" fill="#0A2F2C" opacity="0.28" />
              {sad ? (
                // A heavy, slanted lid: "oh no".
                <path d="M28 36 H72 V50 L28 58 Z" fill="#3fd8c0" />
              ) : null}
            </g>
            {sad ? (
              <path d="M30 58 L70 50" stroke="#0A2F2C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            ) : null}
            {/* Corneal reflections sit still while the pupil moves: they follow the light, not the gaze. */}
            <circle cx="42.5" cy="51" r="5" fill="#fff" opacity="0.92" />
            <circle cx="57" cy="68" r="2.4" fill="#fff" opacity="0.45" />
          </g>
        )}

        <path
          d={mouth}
          stroke="#0A2F2C"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={happy ? "#0F5C55" : "none"}
        />
      </g>
    </svg>
  );
}

/** The coach on its own, for surfaces that bring their own bubble (the landing hero). */
export function CoachAvatar({
  character,
  mood,
}: {
  character: CoachCharacter;
  mood: CoachMood;
}) {
  return character === "martian" ? <Martian mood={mood} /> : <Sprout mood={mood} />;
}

function Confetti({ cx = 60, cy = 60, scale = 1 }: { cx?: number; cy?: number; scale?: number }) {
  // Fixed rather than random so a re-render does not reshuffle mid-flight.
  const pieces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        const distance = 62 + (index % 3) * 18;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance - 20,
          colour: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
          delay: (index % 4) * 0.05,
          square: index % 2 === 0,
        };
      }),
    [],
  );
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {pieces.map((piece, index) =>
        piece.square ? (
          <rect
            key={index}
            className="coach-confetti"
            x="-5"
            y="-5"
            width="10"
            height="10"
            rx="1"
            fill={piece.colour}
            style={{
              ["--dx" as string]: `${piece.dx}px`,
              ["--dy" as string]: `${piece.dy}px`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ) : (
          <circle
            key={index}
            className="coach-confetti"
            r="5.5"
            fill={piece.colour}
            style={{
              ["--dx" as string]: `${piece.dx}px`,
              ["--dy" as string]: `${piece.dy}px`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ),
      )}
    </g>
  );
}

export function PracticeCoach({
  character = "sprout",
  mood,
  message,
  bubbleVisible,
  checkCount,
  checkLabel,
  busy,
  canShowAnswer,
  answerShown,
  onCheck,
  onToggleAnswer,
  onDismiss,
}: {
  character?: CoachCharacter;
  mood: CoachMood;
  message: string;
  bubbleVisible: boolean;
  /** Bumped per check, so the same mood twice in a row still replays its animation. */
  checkCount: number;
  checkLabel: string;
  busy: boolean;
  canShowAnswer: boolean;
  answerShown: boolean;
  onCheck: () => void;
  onToggleAnswer: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-30 flex max-w-[calc(100%-1.5rem)] items-end gap-2 sm:right-6 sm:bottom-6">
      <div className="flex min-w-0 flex-col items-end gap-2">
        {bubbleVisible ? (
          <div
            key={`bubble-${checkCount}`}
            role="status"
            aria-live="polite"
            className="coach-bubble pointer-events-auto relative max-w-64 rounded-2xl border border-citolab-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-lg"
          >
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-1.5 right-1.5 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Hide the coach's message"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="pr-4 leading-snug">{message}</p>
            {canShowAnswer ? (
              <button
                type="button"
                onClick={onToggleAnswer}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-citolab-700 hover:text-citolab-800"
              >
                {answerShown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {answerShown ? "Hide the answer" : "Show me the answer"}
              </button>
            ) : null}
            <span className="absolute -right-2 bottom-4 h-4 w-4 rotate-45 border-t border-r border-citolab-200 bg-white" />
          </div>
        ) : null}
        <button
          type="button"
          onClick={onCheck}
          disabled={busy}
          className={cn(
            "pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-citolab-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-citolab-700",
            busy && "opacity-60",
          )}
        >
          <Check className="h-4 w-4" />
          {checkLabel}
        </button>
      </div>
      <div
        key={`sprout-${checkCount}`}
        className="h-20 w-16 shrink-0 sm:h-28 sm:w-24"
      >
        <CoachAvatar character={character} mood={busy ? "thinking" : mood} />
      </div>
    </div>
  );
}
