import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Feather,
  BookOpen,
  Check,
  Code2,
  Eye,
  Flame,
  FlaskConical,
  Footprints,
  Lightbulb,
  ListChecks,
  Lock,
  Monitor,
  RotateCcw,
  Smartphone,
  Star,
  Tablet,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assessmentTitleOf } from "../qti/assessment-title";
import { availableDevices, type PlayerDevice } from "../qti/session-options";
import { useStore } from "../store/store";
import {
  HOTSPOT_SLACK,
  afterWrong,
  areaAt,
  displayText,
  entryMode,
  emptyAnswer,
  fieldFor,
  focusOf,
  fromPicture,
  gapKey,
  howTo,
  isFork,
  landOnPicture,
  layoutPads,
  onRunway,
  overflowsPortrait,
  padAt,
  padViews,
  pictureFrame,
  revealAnswer,
  runwayPoint,
  runwayValue,
  spawnOf,
  startAnswer,
  stemHtml,
  stomp,
  throwInto,
  throws,
  typeInto,
  toPicture,
  toResponse,
  type Answer,
  type ArenaSpec,
  type Field,
  type Focus,
  type Outcome,
  type Pad,
} from "../quest/arena";
import { EXAMPLE_PACKAGES, buildExamplePackage } from "../examples/catalog";
import { loadAssessmentQuestions, whyLeftOut, type AssessmentQuestions } from "../quest/assessment-items";
import { ClassicDialog } from "../quest/classic-dialog";
import { Scroller } from "../quest/scroller";
import { buildItems, type QuestItem } from "../quest/items";
import { QtiItemHost, type QtiHandle } from "../quest/qti-item-host";
import { starsForAttempt } from "../quest/rewards";
import type { QuestScene } from "../quest/scene3d";
import { setMuted, sfx } from "../quest/sound";
import { THEMES, THEME_LIST, type Theme, type ThemeId, type ZoneId } from "../quest/themes";
import type { ChestProgress, FrameState, PadView } from "../quest/types";
import {
  GATES,
  SPAWN,
  findPath,
  isBlocked,
  makeLayout,
  standingSpot,
  zoneAt,
  type Blockers,
  type Layout,
} from "../quest/world";
import "../quest/quest.css";

// ── Saved progress (this browser only) ──────────────────────────────

interface WorldSave {
  color: string;
  chests: Record<string, ChestProgress>;
  streak: number;
  bestStreak: number;
}

interface Save {
  name: string;
  muted: boolean;
  /** Progress per set of questions and world, keyed `<source>:<theme>`. */
  worlds: Record<string, WorldSave>;
}

const SAVE_KEY = "qti-quest-v2";
const ZONES: ZoneId[] = ["meadow", "forest", "mountain"];

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return { name: "", muted: false, worlds: {}, ...(JSON.parse(raw) as Partial<Save>) };
  } catch {
    // No storage (private window): the game still works, it just forgets.
  }
  return { name: "", muted: false, worlds: {} };
}

function storeSave(save: Save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // ignore
  }
}

const newWorld = (theme: Theme): WorldSave => ({ color: theme.heroColors[0], chests: {}, streak: 0, bestStreak: 0 });
/** Set once the page reloaded itself to get the service worker back in charge. */
const RELOADED_KEY = "qti_quest_reloaded_once";

const isOpen = (p: ChestProgress | undefined) => !!p && (p.solved || p.revealed);
/** Stars and opened chests, counting only the questions that are in the game now. */
const tally = (world: WorldSave | undefined, ids: string[]) => {
  let stars = 0;
  let open = 0;
  for (const id of ids) {
    const progress = world?.chests[id];
    stars += progress?.stars ?? 0;
    if (isOpen(progress)) open += 1;
  }
  return { stars, open };
};

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
/** "a chest", "an energy pod". */
const withArticle = (noun: string) => `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;

// ── Page ────────────────────────────────────────────────────────────

/**
 * Math Quest on its own (`/quest`, with its built-in maths questions), or the
 * game mode of an assessment (`/assessment/:id?mode=game`), where the
 * questions come from the loaded package.
 */
export function QuestPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const assessment = useStore((state) => (assessmentId ? state.assessments.find((a) => a.id === assessmentId) : undefined));
  const assessmentItems = useStore((state) =>
    assessmentId ? state.itemsPerAssessment.find((entry) => entry.assessmentId === assessmentId)?.items : undefined,
  );

  const [save, setSave] = useState<Save>(loadSave);
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  // Kept with the list they were made from, so a list that changes (an example fetched again)
  // is not judged by the questions of the old one.
  const [prepared, setPrepared] = useState<{ list: unknown; result: AssessmentQuestions } | null>(null);
  const questions = prepared && prepared.list === assessmentItems ? prepared.result : null;
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => storeSave(save), [save]);
  useEffect(() => setMuted(save.muted), [save.muted]);

  useEffect(() => {
    if (!assessmentItems) return;
    let cancelled = false;
    loadAssessmentQuestions(assessmentItems)
      .then((result) => {
        if (!cancelled) setPrepared({ list: assessmentItems, result });
      })
      .catch((error) => {
        console.error("Could not prepare the assessment for the game:", error);
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [assessmentItems]);

  // Every question's file failed to load: the package is gone from this browser's storage (it was
  // cleared, or the page was loaded around the service worker that serves it), which says nothing
  // about the questions themselves.
  const filesGone = !!questions && questions.items.length === 0 && questions.why.unreadable > 0 && questions.why.unreadable === questions.skipped;
  const isExample = !!assessmentId && EXAMPLE_PACKAGES.some((example) => example.id === assessmentId);
  const processPackage = useStore((state) => state.processPackage);
  const [restoring, setRestoring] = useState(false);
  /** The one attempt to fetch the example again is over, whatever came of it. */
  const [restoreDone, setRestoreDone] = useState(false);
  const triedRestore = useRef(false);
  useEffect(() => {
    if (!assessmentId || triedRestore.current) return;
    if (assessmentItems && !filesGone) return;
    // A hard reload goes around the service worker, and then no package file can be read.
    // A normal reload puts it back in charge; once, so a real problem cannot loop.
    if (filesGone && "serviceWorker" in navigator && !navigator.serviceWorker.controller && !sessionStorage.getItem(RELOADED_KEY)) {
      triedRestore.current = true;
      sessionStorage.setItem(RELOADED_KEY, "1");
      void navigator.serviceWorker.ready.then(() => window.location.reload());
      return;
    }
    // An example comes with the app, so it can simply be fetched again: after its files were
    // cleared, or when someone opens a link to its game without having opened it first.
    if (!isExample) return;
    triedRestore.current = true;
    // Not cancelled when this effect runs again: the store changing under it is the fetch succeeding.
    void Promise.resolve()
      .then(() => {
        setRestoring(true);
        return buildExamplePackage(assessmentId);
      })
      .then((file) => processPackage(file, { removeStylesheets: false, skipValidation: false, source: "example" }))
      .catch((error) => console.error("Could not fetch the example again:", error))
      .finally(() => {
        setRestoring(false);
        setRestoreDone(true);
      });
  }, [assessmentId, assessmentItems, filesGone, isExample, processPackage]);

  const sourceKey = assessmentId ? `assessment:${assessmentId}` : "built-in";
  const theme = themeId ? THEMES[themeId] : null;
  const builtIn = useMemo(() => (theme && !assessmentId ? buildItems(theme.id) : null), [assessmentId, theme]);
  const items = assessmentId ? (questions?.items ?? null) : builtIn;
  const worldKey = theme ? `${sourceKey}:${theme.id}` : "";

  const setWorld = useCallback(
    (update: (world: WorldSave) => WorldSave) => {
      if (!themeId) return;
      const key = `${sourceKey}:${themeId}`;
      setSave((s) => ({ ...s, worlds: { ...s.worlds, [key]: update(s.worlds[key] ?? newWorld(THEMES[themeId])) } }));
    },
    [sourceKey, themeId],
  );

  const backToAssessment = assessmentId ? () => navigate(`/assessment/${assessmentId}`) : undefined;

  // An assessment's game can be previewed on a tablet or a phone, in the same frame the player
  // uses (pages/device-preview.tsx): the `device` parameter makes app.tsx put this page in it.
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices] = useState(() => (window.self === window.top ? availableDevices(window.innerWidth) : []));
  const previewOn =
    assessmentId && devices.length > 1
      ? (device: PlayerDevice) => {
          const next = new URLSearchParams(searchParams);
          next.set("device", device);
          setSearchParams(next, { replace: true });
        }
      : undefined;

  if (assessmentId) {
    // Being fetched again (an example), or about to be: not a problem to report.
    if (restoring || (isExample && (!assessmentItems || filesGone) && !restoreDone)) return <Notice text="Getting the questions ready..." />;
    const problem =
      loadFailed || !assessmentItems
        ? "This assessment is not loaded in this browser (any more)."
        : filesGone
          ? "The files of this assessment are no longer in this browser's storage. Open the package again to play it."
          : questions && questions.items.length === 0
            ? `None of the ${questions.skipped === 1 ? "questions" : `${questions.skipped} questions`} in this assessment can be played as a game: ${whyLeftOut(questions.why)}.`
            : null;
    if (problem) {
      return (
        <Notice text={problem}>
          <Link
            to={assessmentItems ? `/assessment/${assessmentId}` : "/assessment-player"}
            className="rounded-full bg-white px-6 py-2.5 font-extrabold text-slate-900 hover:bg-yellow-300"
          >
            {assessmentItems ? "Back to the assessment" : "Open an assessment"}
          </Link>
        </Notice>
      );
    }
    if (!questions) return <Notice text="Getting the questions ready..." />;
  }

  if (!theme || !items) {
    // The picker counts the same questions whatever the world, so any theme's built-in set will do for the ids.
    const ids = (assessmentId ? (questions?.items ?? []) : buildItems("knights")).map((item) => item.id);
    return (
      <WorldPicker
        save={save}
        sourceKey={sourceKey}
        ids={ids}
        assessmentTitle={assessmentId ? (assessmentTitleOf(assessment) ?? "Your assessment") : null}
        writing={(questions?.items ?? []).filter((item) => item.writing).length}
        skipped={questions?.skipped ?? 0}
        why={questions ? whyLeftOut(questions.why) : ""}
        leftOut={questions?.leftOut ?? 0}
        onBack={backToAssessment}
        devices={previewOn ? devices.map((d) => d.value) : []}
        onPreview={previewOn}
        onName={(name) => setSave((s) => ({ ...s, name }))}
        onPick={(id) => {
          sfx.open();
          setThemeId(id);
        }}
      />
    );
  }

  return (
    <QuestGame
      key={worldKey}
      theme={theme}
      items={items}
      builtIn={!assessmentId}
      name={save.name.trim() || "explorer"}
      world={save.worlds[worldKey] ?? newWorld(theme)}
      setWorld={setWorld}
      muted={save.muted}
      onMuted={(muted) => setSave((s) => ({ ...s, muted }))}
      onExit={() => setThemeId(null)}
    />
  );
}

function Notice({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-indigo-950 via-indigo-800 to-fuchsia-700 p-6 text-center text-white">
      <p className="max-w-lg text-lg font-semibold">{text}</p>
      {children}
    </div>
  );
}

// ── This is a demo ──────────────────────────────────────────────────

/** Said in full where the game starts: what this mode is, and what it is not. */
function DemoNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex max-w-2xl items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-100 px-4 py-3 text-left text-amber-950 shadow-lg",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
      <p className="text-sm leading-snug">
        <strong className="mr-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white">Demo</strong>
        <strong>Game mode is a showcase, not a way to take a real test.</strong> It shows what can be built on QTI and is
        not used in production or in exams. Stars are for fun: no result is recorded or handed in.
      </p>
    </div>
  );
}

/** The short reminder that stays on screen while you play. */
function DemoBadge() {
  return (
    <span
      role="note"
      title="Game mode is a demo and showcase. It is not used in production, and no result is recorded."
      className="pointer-events-auto flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900 shadow-md"
    >
      <FlaskConical className="h-4 w-4 text-amber-600" aria-hidden="true" />
      Demo<span className="hidden font-bold normal-case tracking-normal md:inline">· not for real tests</span>
    </span>
  );
}

// ── Choosing a world ────────────────────────────────────────────────

interface PickerProps {
  save: Save;
  sourceKey: string;
  ids: string[];
  assessmentTitle: string | null;
  /** How many of the questions are writing questions: handed in, without stars. */
  writing: number;
  skipped: number;
  /** Why they were skipped, as the clauses of a sentence. */
  why: string;
  leftOut: number;
  onBack?: () => void;
  /** Devices the game can be previewed on from here, and how to switch to one. */
  devices: PlayerDevice[];
  onPreview?: (device: PlayerDevice) => void;
  onName: (name: string) => void;
  onPick: (id: ThemeId) => void;
}

const DEVICE_ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
const DEVICE_NAMES: Record<PlayerDevice, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Phone" };

function WorldPicker({ save, sourceKey, ids, assessmentTitle, writing, skipped, why, leftOut, onBack, devices, onPreview, onName, onPick }: PickerProps) {
  const total = ids.length;
  return (
    <div className="relative flex h-full flex-col items-center overflow-y-auto bg-gradient-to-b from-indigo-950 via-indigo-800 to-fuchsia-700 px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 26 }, (_, i) => (
          <Star
            key={i}
            className="quest-float absolute fill-yellow-200/70 text-yellow-200/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 8 + ((i * 7) % 14),
              height: 8 + ((i * 7) % 14),
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the assessment
        </button>
      )}

      {onPreview && (
        <div
          role="group"
          aria-label="Preview on"
          className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-full bg-white/15 p-1 text-sm font-bold backdrop-blur"
        >
          {devices.map((device) => {
            const Icon = DEVICE_ICONS[device];
            return (
              <button
                key={device}
                type="button"
                onClick={() => onPreview(device)}
                disabled={device === "desktop"}
                title={device === "desktop" ? "You are on the desktop view" : `Preview on a ${DEVICE_NAMES[device].toLowerCase()}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
                  device === "desktop" ? "bg-white text-slate-900" : "hover:bg-white/25",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{DEVICE_NAMES[device]}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        {/* On a narrow screen the back button sits above the title, not on it. */}
        <div className={cn("quest-pop-in text-center", (onBack || onPreview) && "mt-9 lg:mt-0")}>
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
            {assessmentTitle ? "Game mode" : "A QTI adventure"}
          </div>
          <h1 className="mt-1 font-display text-5xl font-extrabold tracking-tight drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] sm:text-6xl">
            {assessmentTitle ?? "Math Quest"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-indigo-100">
            Explore a world, find the treasures and jump on the right answers to collect stars.
          </p>
        </div>

        <DemoNotice className="mt-6" />

        <label className="mt-6 flex items-center gap-3 rounded-full bg-white/15 py-1.5 pl-5 pr-1.5 backdrop-blur">
          <span className="font-semibold">Your name</span>
          <input
            value={save.name}
            onChange={(e) => onName(e.target.value.slice(0, 16))}
            placeholder="Explorer"
            className="w-40 rounded-full bg-white px-4 py-2 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          />
        </label>

        <h2 className="mt-8 font-display text-2xl font-bold">Choose your world</h2>
        <div className="mt-4 grid w-full gap-5 md:grid-cols-3">
          {THEME_LIST.map((theme, i) => {
            const { stars, open } = tally(save.worlds[`${sourceKey}:${theme.id}`], ids);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onPick(theme.id)}
                style={{ background: theme.card, animationDelay: `${0.1 + i * 0.1}s` }}
                className="quest-pop-in group relative flex flex-col items-center overflow-hidden rounded-3xl border-4 border-white/70 p-6 text-center shadow-[0_8px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-1.5 hover:border-yellow-300 hover:shadow-[0_14px_0_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 active:translate-y-0.5"
              >
                <div className="quest-float text-7xl drop-shadow-lg" aria-hidden="true">
                  {theme.emoji}
                </div>
                <div className="mt-3 font-display text-3xl font-extrabold drop-shadow">{theme.name}</div>
                <p className="mt-2 min-h-[3.5rem] text-[15px] font-medium text-white/95 drop-shadow">{theme.tagline}</p>
                <div className="mt-3 flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-sm font-bold">
                  {/* Stars are for the questions that can be checked; a writing question has none. */}
                  {total > writing && (
                    <>
                      <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                      {stars} / {(total - writing) * 3}
                      <span className="opacity-70">·</span>
                    </>
                  )}
                  {open} / {total} found
                </div>
                <div className="mt-4 rounded-full bg-white px-7 py-2.5 text-lg font-extrabold text-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.2)] transition group-hover:bg-yellow-300">
                  {open === 0 ? "Play" : open === total ? "Play again" : "Continue"}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-8 max-w-2xl text-center text-sm text-indigo-200">
          {assessmentTitle
            ? `${total} ${total === 1 ? "question" : "questions"} from this assessment are hidden in the world.`
            : "Every question is a real QTI 3 item."}{" "}
          Each one is scored by its own response processing; the world is just a more adventurous way to answer it. Your
          progress stays in this browser.
          {writing > 0 &&
            ` ${writing === 1 ? "One is a writing question" : `${writing} are writing questions`}: you hand ${writing === 1 ? "it" : "those"} in, without stars, because only a person can mark ${writing === 1 ? "it" : "them"}.`}
          {skipped > 0 && ` Left out: ${why}.`}
          {leftOut > 0 && ` ${leftOut} more did not fit in the world.`}
        </p>
      </div>
    </div>
  );
}

// ── The game ────────────────────────────────────────────────────────

type Phase = "loading" | "playing" | "checking" | "wrong" | "correct" | "celebrate" | "revealed";

interface ArenaState {
  item: QuestItem;
  phase: Phase;
  /** One per interaction in the item: the parts of the question, played in order. */
  specs: ArenaSpec[];
  /** The answer to each part; the part being played lives in `answer` until you leave it. */
  answers: Answer[];
  stage: number;
  /** The shape of the stage: wide, or deep for a phone held upright. Fixed when the question opens. */
  field: Field;
  /** The part on stage now. */
  spec: ArenaSpec | null;
  pads: Pad[];
  answer: Answer;
  /** The pad or hotspot the hero points at: a side of a fork, the gap a throw would land in. */
  focus: string | null;
  /** What was thrown and is still in the air. */
  flying: string | null;
  message: string;
  mood: "idle" | "hint" | "happy";
  earned: number;
}

interface GameProps {
  theme: Theme;
  items: QuestItem[];
  /** The built-in maths set: its zones have a topic of their own. */
  builtIn: boolean;
  name: string;
  world: WorldSave;
  setWorld: (update: (world: WorldSave) => WorldSave) => void;
  muted: boolean;
  onMuted: (muted: boolean) => void;
  onExit: () => void;
}

const MOVE_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  w: [0, -1],
  ArrowDown: [0, 1],
  s: [0, 1],
  ArrowLeft: [-1, 0],
  a: [-1, 0],
  ArrowRight: [1, 0],
  d: [1, 0],
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

/**
 * How the pads should look. With several parts a wrong score does not say which
 * part was wrong, so no pad is painted red for it.
 */
const outcomeOf = (state: Pick<ArenaState, "phase" | "specs"> | null | undefined): Outcome => {
  const phase = state?.phase;
  if (phase === "wrong") return (state?.specs.length ?? 1) > 1 ? "playing" : "wrong";
  return phase === "correct" || phase === "celebrate" ? "correct" : phase === "revealed" ? "revealed" : "playing";
};

/** Where the flag stands: on the number line's answer, or on the last point marked on a picture. */
const flagAt = (spec: ArenaSpec, field: Field, answer: Answer): [number, number] | null => {
  if (spec.kind === "slider") return answer.value !== null ? runwayPoint(spec, field, answer.value) : null;
  const last = answer.points[answer.points.length - 1];
  return spec.kind === "point" && spec.picture && last ? fromPicture(spec.picture, field, last[0], last[1]) : null;
};

/** The hotspot the hero stands on, so it can light up before the jump. */
const hotspotUnder = (spec: ArenaSpec, field: Field, x: number, z: number): string | null => {
  if ((spec.kind !== "hotspot" && spec.kind !== "gap") || !spec.picture) return null;
  const pixel = toPicture(spec.picture, field, x, z);
  const slack = HOTSPOT_SLACK / pictureFrame(spec.picture, field).scale;
  return pixel ? (areaAt(spec.areas, pixel[0], pixel[1], slack)?.id ?? null) : null;
};

/** Something thrown at a gap, on its way there. Positions are in arena units. */
interface Flight {
  held: string;
  gap: string;
  from: [number, number, number];
  to: [number, number];
  t: number;
  time: number;
  /** The question and the part it was thrown in: a throw that outlives them is dropped. */
  item: string;
  stage: number;
}

/** Where a throw is now: an arc from the hero's hands down onto the gap. */
const flightPoint = (flight: Flight): [number, number, number] => {
  const p = Math.min(1, flight.t / flight.time);
  const [x0, y0, z0] = flight.from;
  const [x1, z1] = flight.to;
  const rise = 1.1 + 0.12 * Math.hypot(x1 - x0, z1 - z0);
  return [x0 + (x1 - x0) * p, y0 + (0.4 - y0) * p + Math.sin(Math.PI * p) * rise, z0 + (z1 - z0) * p];
};

/** How wide the ring around what is aimed at is drawn: around its pad, or around a place on the picture. */
const aimRadius = (pads: Pad[], focus: Focus) => {
  const pad = pads.find((candidate) => candidate.id === focus.id);
  return pad ? pad.size * 0.78 : 0.75;
};

/** What a part's blank in the question shows: the answer so far. */
const blankText = (spec: ArenaSpec, answer: Answer) =>
  spec.kind === "entry"
    ? answer.digits || "?"
    : spec.kind === "choice" && !spec.multiple
      ? (spec.choices.find((c) => c.id === answer.picked[0])?.label ?? "?")
      : spec.kind === "slider" && answer.value !== null
        ? String(answer.value)
        : "?";

/** What the blanks of a gap match show, as "key NUL text" entries: only the filled gaps; an empty one keeps its number. */
const gapBlanks = (spec: ArenaSpec, answer: Answer) =>
  spec.targets.flatMap((gap) => {
    const inside = answer.pairs.filter(([, target]) => target === gap.id).map(([id]) => spec.choices.find((c) => c.id === id)?.label || "●");
    return inside.length ? [`${gapKey(spec.responseId, gap.id)}\u0000${inside.join(", ")}`] : [];
  });

/** Straight on to the next question about the same text. */
function NextButton({ onClick, about }: { onClick: () => void; about?: string }) {
  return (
    <button
      type="button"
      autoFocus
      onClick={onClick}
      className="flex max-w-full flex-col items-center rounded-3xl bg-emerald-500 px-8 py-2.5 font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
    >
      <span className="flex items-center gap-1.5 text-lg">
        Next question <ArrowRight className="h-5 w-5" strokeWidth={3} />
      </span>
      {about && <span className="max-w-full truncate text-xs font-bold text-emerald-50">about “{about}”</span>}
    </button>
  );
}

const LABEL_LOOK: Record<PadView["look"], string> = {
  idle: "border-slate-300 bg-white",
  selected: "border-sky-500 bg-sky-50 ring-4 ring-sky-300/60",
  correct: "border-green-600 bg-green-100 ring-4 ring-green-300/70",
  wrong: "border-red-600 bg-red-100",
  gone: "border-slate-200 bg-slate-100 opacity-40 grayscale",
};

/**
 * The on-screen thumb-stick, for a device without a keyboard: drag from the
 * middle to walk that way, further to go faster. It reports each axis from -1
 * to 1 and returns to rest when let go.
 */
function ThumbStick({ onMove }: { onMove: (x: number, z: number) => void }) {
  const [knob, setKnob] = useState<[number, number]>([0, 0]);
  const steer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    let x = (e.clientX - rect.left - radius) / radius;
    let y = (e.clientY - rect.top - radius) / radius;
    const reach = Math.hypot(x, y);
    if (reach > 1) {
      x /= reach;
      y /= reach;
    }
    setKnob([x, y]);
    // A little dead zone in the middle, so a resting thumb does not creep.
    if (reach < 0.2) onMove(0, 0);
    else onMove(x, y);
  };
  const rest = () => {
    setKnob([0, 0]);
    onMove(0, 0);
  };
  return (
    <div
      role="group"
      aria-label="Walk: drag the stick"
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        steer(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) steer(e);
      }}
      onPointerUp={rest}
      onPointerCancel={rest}
      className="absolute bottom-4 left-4 z-20 grid h-28 w-28 touch-none place-items-center rounded-full border-4 border-white/80 bg-slate-900/25 shadow-lg backdrop-blur-sm"
    >
      <div
        aria-hidden="true"
        className="h-12 w-12 rounded-full border-2 border-white bg-white/90 shadow-md"
        style={{ transform: `translate(${knob[0] * 30}px, ${knob[1] * 30}px)` }}
      />
    </div>
  );
}

const NO_STYLESHEETS: string[] = [];
/** How far behind its pad an HTML answer label hangs, in arena units. */
const LABEL_GAP = 1.5;

/**
 * A choice's own markup, shown the way the item shows it: in a shadow root with
 * the item's stylesheets, where the app's CSS cannot reach it. `html` comes out
 * of richHtml's allow-list and the stylesheets out of the package itself.
 */
function RichLabel({ html, stylesheets }: { html: string; stylesheets: string[] }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const links = stylesheets.map((href) => `<link rel="stylesheet" href="${href.replace(/"/g, "&quot;")}">`).join("");
    // Without a stylesheet of its own, a picture is simply kept small.
    const fallback = stylesheets.length
      ? ""
      : "img{display:block;max-height:4.5rem;max-width:100%;width:auto;height:auto;margin:0 auto;border-radius:.375rem}";
    root.innerHTML = `<style>:host{display:block;zoom:var(--quest-label-zoom,1)}p{margin:0}math{font-size:1.5em}${fallback}</style>${links}<div style="display:inline-block;width:max-content;max-width:14rem;vertical-align:top">${html}</div>`;
  }, [html, stylesheets]);
  return <span ref={hostRef} data-rich />;
}

function QuestGame({ theme, items, builtIn, name, world, setWorld, muted, onMuted, onExit }: GameProps) {
  const itemById = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const layout = useMemo<Layout>(
    () =>
      makeLayout(
        items.map((i) => i.id),
        items.map((i) => i.group),
      ),
    [items],
  );
  const spotById = useMemo(() => Object.fromEntries(layout.chests.map((c) => [c.id, c])), [layout]);
  const ids = useMemo(() => layout.chests.map((c) => c.id), [layout]);
  const total = ids.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const labelEls = useRef(new Map<string, HTMLElement>());
  const carryEl = useRef<HTMLDivElement>(null);
  /** The question to go straight on to when the current one is left: the next one about the same text. */
  const nextUpRef = useRef<string | null>(null);
  /** Set further down, where everything it needs exists: called when a question is left. */
  const goOnRef = useRef<() => void>(() => undefined);
  /** How far the question panel reaches in from the left, in pixels: labels keep clear of it. */
  const insetRef = useRef(0);
  const sceneRef = useRef<QuestScene | null>(null);
  const handleRef = useRef<QtiHandle | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState(false);

  const [arena, setArenaState] = useState<ArenaState | null>(null);
  const arenaRef = useRef<ArenaState | null>(null);
  const updateArena = useCallback((patch: Partial<ArenaState> | null) => {
    const next = patch === null || !arenaRef.current ? (patch as ArenaState | null) : { ...arenaRef.current, ...patch };
    arenaRef.current = next;
    setArenaState(next);
  }, []);

  const [fade, setFade] = useState(false);
  const [zone, setZone] = useState<ZoneId>("meadow");
  const [near, setNear] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [showList, setShowList] = useState(false);
  const [peek, setPeek] = useState(false);
  const [reading, setReading] = useState(false);
  const [finished, setFinished] = useState(false);
  /** A picture from the question, enlarged. */
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);
  /** A question being played as a mini game in a dialog, over the world. */
  const [classic, setClassic] = useState<QuestItem | null>(null);

  const { stars, open: openCount } = tally(world, ids);
  /** The most stars there are to win: three for every question that can be checked. A writing question has none. */
  const starMax = ids.filter((id) => !itemById[id]?.writing).length * 3;
  const closedGates = useMemo(
    () => new Set(GATES.filter((gate) => openCount < (layout.gateNeeds[gate.id] ?? 0)).map((gate) => gate.id)),
    [layout, openCount],
  );

  // What the frame loop reads. Refs, so the loop never works with stale values.
  const worldRef = useRef(world);
  const blockersRef = useRef<Blockers>({ closedGates, chests: layout.chests });
  const openCountRef = useRef(openCount);
  useEffect(() => {
    worldRef.current = world;
    blockersRef.current = { closedGates, chests: layout.chests };
    openCountRef.current = openCount;
  }, [world, closedGates, layout, openCount]);

  // The hero's live state. One object for the whole game, changed in place by the frame loop.
  const gRef = useRef({
    mode: "world" as "world" | "arena",
    x: SPAWN[0] + 0.5,
    z: SPAWN[1] + 0.5,
    y: 0,
    vy: 0,
    heading: 0,
    walking: false,
    step: 0,
    keys: new Set<string>(),
    path: [] as [number, number][],
    autoJump: false,
    pendingChest: null as string | null,
    worldPos: [SPAWN[0] + 0.5, SPAWN[1] + 0.5] as [number, number],
    nearChest: null as string | null,
    target: null as [number, number] | null,
    zone: "meadow" as ZoneId,
    /** The on-screen thumb-stick, each axis from -1 to 1. */
    stick: [0, 0] as [number, number],
    /** What the hero points at in the arena (see `focusOf`). */
    focus: null as Focus | null,
    /** The gate of a fork the hero stands in, so that walking in counts once. */
    onGate: null as string | null,
    /** What was thrown and has not landed yet. */
    flight: null as Flight | null,
    frozen: false,
    /** A dialog has the keyboard: the game leaves every key alone. */
    paused: false,
  });

  const say = useCallback((text: string) => setToast({ text, key: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const patchChest = useCallback(
    (id: string, patch: Partial<ChestProgress>, firstTry?: boolean) =>
      setWorld((w) => {
        const current = w.chests[id] ?? { attempts: 0, solved: false, revealed: false, stars: 0 };
        const streak = firstTry === undefined ? w.streak : firstTry ? w.streak + 1 : 0;
        return {
          ...w,
          streak,
          bestStreak: Math.max(w.bestStreak, streak),
          chests: { ...w.chests, [id]: { ...current, ...patch } },
        };
      }),
    [setWorld],
  );

  // ── Entering and leaving a question ───────────────────────────────

  const openChest = useCallback(
    (id: string) => {
      const g = gRef.current;
      const item = itemById[id];
      const spot = spotById[id];
      if (!item || !spot || g.frozen) return;
      const progress = worldRef.current.chests[id];
      if (spot.boss && openCountRef.current < layout.bossNeeds) {
        sfx.bump();
        say(`Locked! Open the other ${layout.bossNeeds} first (${openCountRef.current} / ${layout.bossNeeds}).`);
        return;
      }
      if (isOpen(progress)) {
        say(item.writing ? "Already handed in." : progress!.solved ? `Already opened: ${"★".repeat(progress!.stars)}` : "Already opened.");
        return;
      }
      sfx.open();
      g.frozen = true;
      g.path = [];
      g.keys.clear();
      g.stick = [0, 0];
      g.target = null;
      g.pendingChest = null;
      setShowList(false);
      if (item.dialog) {
        // No jump stage for this kind of question: it is played right here, as a mini game.
        g.paused = true;
        setClassic(item);
        return;
      }
      setFade(true);
      window.setTimeout(() => {
        const attempts = progress?.attempts ?? 0;
        arenaRef.current = {
          item,
          phase: "loading",
          specs: [],
          answers: [],
          stage: 0,
          field: fieldFor(false),
          spec: null,
          pads: [],
          answer: emptyAnswer(),
          focus: null,
          flying: null,
          message: spot.boss
            ? `This is the final challenge, ${name}. Take your time!`
            : attempts > 0
              ? `Welcome back, ${name}! Have another go.`
              : pick([`You found ${withArticle(theme.treasure)}, ${name}! Solve it to open it.`, `Look, ${withArticle(theme.treasure)}! Let's see what's inside...`]),
          mood: "idle",
          earned: 0,
        };
        setArenaState(arenaRef.current);
      }, 280);
    },
    [itemById, layout, name, say, spotById, theme.treasure],
  );

  const onItemReady = useCallback(
    (handle: QtiHandle | null) => {
      const g = gRef.current;
      const scene = sceneRef.current;
      // Only the first report counts: a second one (a hot reload, a re-render of the
      // item) must not store the arena position as the place to return to.
      if (arenaRef.current && arenaRef.current.phase !== "loading") {
        if (handle) handleRef.current = handle;
        return;
      }
      if (!handle || !scene || !arenaRef.current) {
        g.frozen = false;
        updateArena(null);
        setFade(false);
        if (!handle) say("This question could not be loaded.");
        return;
      }
      handleRef.current = handle;
      const specs = handle.interactions.map((interaction) => interaction.arenaSpec());
      const spec = specs[0];
      // A phone held upright gets a deep, narrow stage; everything else a wide one.
      const box = containerRef.current;
      const field = fieldFor(!!box && box.clientWidth < box.clientHeight * 0.8);
      if (specs.some((part) => overflowsPortrait(part, field))) {
        // More text than fits beside the pads on a phone: play the real interaction instead.
        const item = arenaRef.current.item;
        handleRef.current = null;
        updateArena(null);
        g.paused = true;
        setFade(false);
        setClassic(item);
        return;
      }
      const pads = layoutPads(spec, field);
      scene.setArena(spec, pads, field);
      g.worldPos = [g.x, g.z];
      g.mode = "arena";
      [g.x, g.z] = spawnOf(spec, field);
      g.y = 0;
      g.vy = 0;
      g.heading = Math.PI;
      g.focus = null;
      g.onGate = null;
      g.flight = null;
      g.frozen = false;
      const answers = specs.map(startAnswer);
      updateArena({ specs, answers, answer: answers[0], stage: 0, field, spec, pads, phase: "playing" });
      setFade(false);
    },
    [say, updateArena],
  );

  const leaveArena = useCallback(() => {
    const g = gRef.current;
    const current = arenaRef.current;
    if (!current || g.frozen) return;
    g.frozen = true;
    setFade(true);
    window.setTimeout(() => {
      const scene = sceneRef.current;
      scene?.setArena(null);
      g.mode = "world";
      [g.x, g.z] = g.worldPos;
      g.y = 0;
      g.vy = 0;
      g.heading = 0;
      g.path = [];
      g.target = null;
      g.focus = null;
      g.onGate = null;
      g.flight = null;
      g.frozen = false;
      handleRef.current = null;
      updateArena(null);
      setPeek(false);
      setReading(false);
      setZoomed(null);
      g.paused = false;
      setFade(false);
      const progress = worldRef.current.chests[current.item.id];
      const spot = spotById[current.item.id];
      // Going straight on to the next question, the stars would burst into its arena.
      if (spot && progress?.solved && current.earned > 0 && !nextUpRef.current) {
        window.setTimeout(() => scene?.celebrate(spot.tile[0] + 0.5, spot.tile[1] + 0.5, current.earned, !!spot.boss), 350);
      }
      if (spot?.boss && isOpen(progress)) window.setTimeout(() => setFinished(true), 1900);
      goOnRef.current();
    }, 280);
  }, [spotById, updateArena]);

  // Gates that opened while you were away: announce them once you are back.
  const announcedRef = useRef(openCount);
  useEffect(() => {
    if (arena || classic) return;
    const before = announcedRef.current;
    announcedRef.current = openCount;
    const opened = GATES.filter((gate) => {
      const needs = layout.gateNeeds[gate.id] ?? 0;
      return before < needs && openCount >= needs;
    });
    if (opened.length) {
      window.setTimeout(() => {
        sfx.gate();
        say(`The way to ${theme.zones[opened[opened.length - 1].zone].name} is open!`);
      }, 700);
    } else if (before < layout.bossNeeds && openCount >= layout.bossNeeds && openCount < total) {
      window.setTimeout(() => {
        sfx.gate();
        say(`${theme.landmarkName} is glowing... the final challenge is unlocked!`);
      }, 700);
    }
  }, [arena, classic, layout, openCount, say, theme, total]);

  // ── A question as a mini game in a dialog ─────────────────────────

  const classicSolved = useCallback(
    (earned: number) => {
      if (!classic) return;
      const attempts = (worldRef.current.chests[classic.id]?.attempts ?? 0) + 1;
      patchChest(classic.id, { attempts, solved: true, stars: earned }, attempts === 1);
      sfx.correct(earned);
      if (spotById[classic.id]?.boss) window.setTimeout(() => sfx.fanfare(), 500);
    },
    [classic, patchChest, spotById],
  );

  const classicWrong = useCallback(() => {
    if (!classic) return;
    patchChest(classic.id, { attempts: (worldRef.current.chests[classic.id]?.attempts ?? 0) + 1 }, false);
    sfx.wrong();
  }, [classic, patchChest]);

  /** A writing question was handed in: its chest opens, without stars and without touching the streak. */
  const classicHandedIn = useCallback(() => {
    if (!classic) return;
    patchChest(classic.id, { attempts: (worldRef.current.chests[classic.id]?.attempts ?? 0) + 1, solved: true, stars: 0 });
    sfx.correct(1);
    if (spotById[classic.id]?.boss) window.setTimeout(() => sfx.fanfare(), 500);
  }, [classic, patchChest, spotById]);

  const classicReveal = useCallback(() => {
    if (classic) patchChest(classic.id, { revealed: true, stars: 0 });
  }, [classic, patchChest]);

  const closeClassic = useCallback(() => {
    if (!classic) return;
    const g = gRef.current;
    const spot = spotById[classic.id];
    const progress = worldRef.current.chests[classic.id];
    g.frozen = false;
    g.paused = false;
    g.keys.clear();
    setClassic(null);
    if (spot && progress?.solved && !nextUpRef.current) {
      window.setTimeout(() => sceneRef.current?.celebrate(spot.tile[0] + 0.5, spot.tile[1] + 0.5, progress.stars, !!spot.boss), 250);
    }
    if (spot?.boss && isOpen(progress)) window.setTimeout(() => setFinished(true), 1800);
    goOnRef.current();
  }, [classic, spotById]);

  // ── Answering ─────────────────────────────────────────────────────

  /** Put another part of the question on stage, keeping what was answered so far. */
  const goToStage = useCallback(
    (index: number, patch: Partial<ArenaState> = {}) => {
      const g = gRef.current;
      const current = arenaRef.current;
      const scene = sceneRef.current;
      if (!current || !scene || index < 0 || index >= current.specs.length) return;
      const answers = current.answers.map((answer, i) => (i === current.stage ? current.answer : answer));
      const spec = current.specs[index];
      const pads = layoutPads(spec, current.field);
      scene.setArena(spec, pads, current.field);
      [g.x, g.z] = spawnOf(spec, current.field);
      g.y = 0;
      g.vy = 0;
      g.heading = Math.PI;
      g.path = [];
      g.target = null;
      g.autoJump = false;
      g.focus = null;
      g.onGate = null;
      g.flight = null;
      updateArena({ answers, stage: index, spec, pads, answer: answers[index], focus: null, flying: null, ...patch });
    },
    [updateArena],
  );

  const submit = useCallback(
    async (answer: Answer) => {
      const g = gRef.current;
      const current = arenaRef.current;
      const handle = handleRef.current;
      const scene = sceneRef.current;
      if (!current?.spec || !handle) return;
      const { spec, item, specs, stage } = current;
      const boss = !!spotById[item.id]?.boss;
      const parts = specs.length;
      const answers = current.answers.map((a, i) => (i === stage ? answer : a));
      updateArena({ phase: "checking", answer, answers });
      // Every part hands its answer to its own interaction; the item then scores itself.
      specs.forEach((partSpec, i) => handle.interactions[i]?.answer(toResponse(partSpec, answers[i])));
      const { score, max } = await handle.score();
      const correct = score >= max;
      if (arenaRef.current?.item.id !== item.id) return;
      const attempts = (worldRef.current.chests[item.id]?.attempts ?? 0) + 1;
      if (correct) {
        const earned = starsForAttempt(attempts);
        patchChest(item.id, { attempts, solved: true, stars: earned }, attempts === 1);
        sfx.correct(earned);
        if (boss) window.setTimeout(() => sfx.fanfare(), 500);
        scene?.celebrate(g.x, g.z, earned, boss);
        updateArena({
          phase: "correct",
          earned,
          mood: "happy",
          message: pick(["YES! That's it!", "Brilliant!", "Spot on!", "You got it!"]),
        });
        window.setTimeout(() => {
          if (arenaRef.current?.item.id === item.id && arenaRef.current.phase === "correct") updateArena({ phase: "celebrate" });
        }, 1500);
      } else {
        patchChest(item.id, { attempts }, false);
        sfx.wrong();
        const el = containerRef.current;
        if (el) {
          // Restart the shake animation on the canvas holder.
          el.classList.remove("quest-shake");
          void el.offsetWidth;
          el.classList.add("quest-shake");
        }
        const hint = item.hint ?? "Read the question once more, slowly. What exactly is it asking?";
        // With several parts the item's own score says how much is right, though not which part.
        const partly =
          parts > 1 && score > 0
            ? `Part of it is right: you have ${Number(score.toFixed(2))} of ${Number(max.toFixed(2))} points. Go through the parts again.`
            : parts > 1
              ? "That's not it yet. Go through the parts again."
              : score > 0
                ? // One part, but the item gives points for what is right: say so.
                  `Part of it is right: you have ${Number(score.toFixed(2))} of ${Number(max.toFixed(2))} points. Have another look at the rest.`
                : null;
        updateArena({
          phase: "wrong",
          mood: "hint",
          message:
            partly ??
            (attempts === 1
              ? `${pick(["Not quite!", "Oops, not yet!", "So close!"])} Hint: ${hint}`
              : attempts === 2
                ? `Still not it. ${hint}`
                : "Keep trying, or have a look at the answer. Every try teaches you something!"),
        });
        window.setTimeout(() => {
          const now = arenaRef.current;
          if (now?.item.id !== item.id || now.phase !== "wrong") return;
          if (parts > 1) {
            // Back to the first part, with every answer kept: change what you doubt, confirm the rest.
            goToStage(0, { phase: "playing" });
            return;
          }
          const next = afterWrong(spec, now.answer);
          handle.interactions[0]?.answer(toResponse(spec, next));
          updateArena({ phase: "playing", answer: next });
        }, parts > 1 ? 1600 : 1000);
      }
    },
    [goToStage, patchChest, spotById, updateArena],
  );

  /**
   * The hero landed a jump, or (`on`) got onto a pad without one: walked into
   * the gate of a fork, or ✔ was pressed.
   */
  const handleLand = useCallback((on?: Pad) => {
    const g = gRef.current;
    const scene = sceneRef.current;
    if (!on) scene?.puff(g.x, g.z);
    const current = arenaRef.current;
    const handle = handleRef.current;
    if (g.mode !== "arena" || !current?.spec || current.phase !== "playing" || !handle) return;
    const { spec, stage, specs, item, field } = current;
    /** This part is answered: score the item if it was the last part, else bring on the next one. */
    const finishPart = (answer: Answer) => {
      if (stage >= specs.length - 1) {
        void submit(answer);
        return;
      }
      sfx.select();
      handle.interactions[stage]?.answer(toResponse(spec, answer));
      updateArena({ answer, phase: "checking" });
      window.setTimeout(() => {
        if (arenaRef.current?.item.id !== item.id || arenaRef.current.phase !== "checking") return;
        goToStage(stage + 1, {
          phase: "playing",
          mood: "idle",
          message: `Part ${stage + 2} of ${specs.length}. ${stage + 2 === specs.length ? "Last one!" : "Keep going!"}`,
        });
      }, 550);
    };
    if (spec.kind === "slider") {
      if (!onRunway(field, g.x, g.z)) return;
      finishPart({ ...current.answer, value: runwayValue(spec, field, g.x, g.z) });
      return;
    }
    if (on && current.answer.eliminated.includes(on.id)) {
      sfx.bump();
      updateArena({ message: "That way is closed: it was not the answer. Try the other side!", mood: "hint" });
      return;
    }
    const pad = on ?? padAt(current.pads, g.x, g.z);
    // On a pad, or on the picture of a hotspot or select-point question.
    const result = pad ? stomp(spec, current.answer, pad) : landOnPicture(spec, field, current.answer, g.x, g.z);
    if (!result) return;
    if (result.nudge) {
      sfx.bump();
      updateArena({ message: result.nudge, mood: "hint" });
      return;
    }
    if (result.submit) {
      finishPart(result.answer);
      return;
    }
    const size = (a: Answer) => a.picked.length + a.pairs.length + a.digits.length + a.points.length + (a.pending ? 1 : 0);
    if (size(result.answer) >= size(current.answer)) sfx.select();
    else sfx.unselect();
    // Keep the real interaction in step with every jump, not only at the end.
    handle.interactions[stage]?.answer(toResponse(spec, result.answer));
    updateArena({ answer: result.answer });
  }, [goToStage, submit, updateArena]);

  const reveal = useCallback(() => {
    const current = arenaRef.current;
    const handle = handleRef.current;
    if (!current?.spec || !handle) return;
    const answers = current.specs.map((partSpec, i) => {
      const spec = { ...partSpec, correct: handle.interactions[i]?.correctValues() ?? [] };
      const answer = revealAnswer(spec);
      handle.interactions[i]?.answer(toResponse(spec, answer));
      return answer;
    });
    patchChest(current.item.id, { revealed: true, stars: 0 });
    updateArena({
      answers,
      answer: answers[current.stage],
      phase: "revealed",
      mood: "idle",
      message: `Here is the right answer. Have a good look! The ${theme.treasure} opens, but without stars this time.`,
    });
  }, [patchChest, theme.treasure, updateArena]);

  const jump = useCallback(() => {
    const g = gRef.current;
    if (g.frozen || g.y > 0) return;
    g.vy = 6.6;
    g.y = 0.001;
    sfx.jump();
  }, []);

  /**
   * The answer box of a text entry changed: `text` is everything that is in it
   * now. The digits on the floor fill the same answer, so the two stay in step.
   */
  const typeText = useCallback(
    (text: string) => {
      const current = arenaRef.current;
      if (gRef.current.frozen || current?.spec?.kind !== "entry" || current.phase !== "playing") return;
      const answer = typeInto(current.spec, current.answer, text);
      if (answer === current.answer) return;
      if (answer.digits.length >= current.answer.digits.length) sfx.select();
      else sfx.unselect();
      handleRef.current?.interactions[current.stage]?.answer(toResponse(current.spec, answer));
      updateArena({ answer });
    },
    [updateArena],
  );

  /**
   * A key was pressed outside the answer box, on a text entry: it is typed all
   * the same, so a keyboard works wherever the focus happens to be. False when
   * the key is not for the answer.
   */
  const typeKey = useCallback(
    (key: string) => {
      const current = arenaRef.current;
      if (gRef.current.mode !== "arena" || current?.spec?.kind !== "entry" || current.phase !== "playing") return false;
      const typed = current.answer.digits;
      if (key === "Backspace") {
        typeText([...typed].slice(0, -1).join(""));
        return true;
      }
      // A number leaves the letters to the hero's legs; a word has nothing to walk to, and takes them all.
      if (key.length !== 1 || (entryMode(current.spec) === "number" && !/[0-9.,-]/.test(key))) return false;
      typeText(typed + key);
      return true;
    },
    [typeText],
  );

  /**
   * Throw what is carried at a gap, or at its partner in a match. It always lands
   * there: aiming is choosing, not a test of skill. The answer changes when it lands.
   */
  const throwAt = useCallback(
    (target: Focus) => {
      const g = gRef.current;
      const current = arenaRef.current;
      const held = current?.answer.pending;
      if (g.frozen || g.y > 0 || g.flight || !current?.spec || !throws(current.spec) || current.phase !== "playing" || !held) return;
      const far = Math.hypot(target.x - g.x, target.z - g.z);
      if (far > 0.05) g.heading = Math.atan2(target.x - g.x, target.z - g.z);
      g.path = [];
      g.target = null;
      g.autoJump = false;
      g.flight = {
        held,
        gap: target.id,
        from: [g.x, 1.62 * (sceneRef.current?.heroScale ?? 1), g.z],
        to: [target.x, target.z],
        t: 0,
        time: 0.32 + 0.035 * far,
        item: current.item.id,
        stage: current.stage,
      };
      sfx.throw();
      updateArena({ answer: { ...current.answer, pending: null }, flying: held });
    },
    [updateArena],
  );

  /** What was thrown comes down in its gap, or on its partner. */
  const landThrow = useCallback(() => {
    const g = gRef.current;
    const flight = g.flight;
    g.flight = null;
    const current = arenaRef.current;
    if (!flight || !current) return;
    // The question or its part changed under the throw, or the answer is being shown: it goes back where it came from.
    if (!current.spec || current.item.id !== flight.item || current.stage !== flight.stage || current.phase !== "playing") {
      updateArena({ flying: null });
      return;
    }
    sceneRef.current?.puff(flight.to[0], flight.to[1]);
    const result = throwInto(current.spec, current.answer, flight.held, flight.gap);
    sfx.select();
    handleRef.current?.interactions[current.stage]?.answer(toResponse(current.spec, result.answer));
    updateArena({ answer: result.answer, flying: null });
  }, [updateArena]);

  /**
   * Hand in the answer from where the hero stands, as a jump on ✔ would: the ✔
   * button, or Enter. False when there is no ✔ to press, so Enter can do
   * something else.
   */
  const check = useCallback(() => {
    const g = gRef.current;
    const current = arenaRef.current;
    const pad = current?.pads.find((candidate) => candidate.role === "check");
    if (g.mode !== "arena" || g.frozen || !pad || current?.phase !== "playing") return false;
    // What is still in the air lands first, so it counts.
    if (g.flight) landThrow();
    handleLand(pad);
    return true;
  }, [handleLand, landThrow]);

  const act = useCallback(() => {
    const g = gRef.current;
    if (g.mode === "world" && g.nearChest) {
      openChest(g.nearChest);
      return;
    }
    // Something is in the air: one thing at a time.
    if (g.flight) return;
    const current = arenaRef.current;
    // Carrying something to throw, and not standing on something a jump is meant for: the jump is a throw.
    if (g.mode === "arena" && g.focus && g.y === 0 && current?.spec && throws(current.spec) && current.answer.pending) throwAt(g.focus);
    else jump();
  }, [jump, openChest, throwAt]);

  /** Walk to a chest and open it on arrival. */
  const goToChest = useCallback(
    (id: string) => {
      const g = gRef.current;
      const spot = spotById[id];
      if (!spot || g.mode !== "world" || g.frozen) return;
      const from: [number, number] = [Math.floor(g.x), Math.floor(g.z)];
      const stand = standingSpot(spot.tile, from, blockersRef.current);
      const path = stand && findPath(from, stand, blockersRef.current);
      if (!path) {
        sfx.bump();
        say("You can't get there yet. A gate is still closed!");
        return;
      }
      setShowList(false);
      if (path.length <= 1) {
        openChest(id);
        return;
      }
      g.path = path.slice(1).map(([x, z]) => [x + 0.5, z + 0.5]);
      g.pendingChest = id;
      g.autoJump = false;
      g.target = [spot.tile[0] + 0.5, spot.tile[1] + 0.5];
    },
    [openChest, say, spotById],
  );

  /** Walk onto a pad and jump on it. With something in hand, a gap or a partner is thrown at from where the hero stands. */
  const goToPad = useCallback((pad: Pad) => {
    const g = gRef.current;
    if (g.frozen || g.mode !== "arena") return;
    // A click on ✔ hands in at once: walking over to it only costs time.
    if (pad.role === "check") {
      check();
      return;
    }
    const current = arenaRef.current;
    if (pad.role === "target" && current?.spec && throws(current.spec) && current.answer.pending && current.phase === "playing") {
      throwAt({ id: pad.id, x: pad.x, z: pad.z });
      return;
    }
    g.path = [[pad.x, pad.z]];
    g.autoJump = true;
    g.pendingChest = null;
    g.target = [pad.x, pad.z];
  }, [check, throwAt]);

  /**
   * Back in the world with a next question lined up (the next one about the same
   * text): step over to its chest, which stands beside this one, and open it.
   */
  const goOn = useCallback(() => {
    const next = nextUpRef.current;
    nextUpRef.current = null;
    const spot = next ? spotById[next] : undefined;
    if (!next || !spot) return;
    const g = gRef.current;
    const stand = standingSpot(spot.tile, [Math.floor(g.x), Math.floor(g.z)], blockersRef.current);
    if (stand) {
      g.x = stand[0] + 0.5;
      g.z = stand[1] + 0.5;
      g.path = [];
      g.target = null;
    }
    // After the stars of the chest just opened have had their moment.
    window.setTimeout(() => openChest(next), 750);
  }, [openChest, spotById]);
  useEffect(() => {
    goOnRef.current = goOn;
  });

  /** Leave this question and go straight on to another one. */
  const goToNext = useCallback(
    (id: string, fromDialog: boolean) => {
      nextUpRef.current = id;
      if (fromDialog) closeClassic();
      else leaveArena();
    },
    [closeClassic, leaveArena],
  );

  // The frame loop calls these through a ref, so it always gets the latest ones.
  const live = useRef({ openChest, handleLand, act, check, leaveArena, landThrow, typeKey });
  useEffect(() => {
    live.current = { openChest, handleLand, act, check, leaveArena, landThrow, typeKey };
  });

  // ── Scene + frame loop ────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const g = gRef.current;
    const labels = labelEls.current;
    let disposed = false;
    let raf = 0;
    let scene: QuestScene | null = null;
    let observer: ResizeObserver | null = null;

    const collides = (x: number, z: number) => {
      const r = 0.26;
      for (const [ox, oz] of [
        [-r, -r],
        [r, -r],
        [-r, r],
        [r, r],
      ])
        if (isBlocked(Math.floor(x + ox), Math.floor(z + oz), blockersRef.current)) return true;
      return false;
    };

    /** Never leave the hero inside a rock, a tree or the water: move to the nearest free tile. */
    const unstick = () => {
      const tx = Math.floor(g.x);
      const tz = Math.floor(g.z);
      if (!isBlocked(tx, tz, blockersRef.current)) return;
      for (let r = 1; r < 12; r++)
        for (let dz = -r; dz <= r; dz++)
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
            if (isBlocked(tx + dx, tz + dz, blockersRef.current)) continue;
            g.x = tx + dx + 0.5;
            g.z = tz + dz + 0.5;
            g.path = [];
            g.target = null;
            return;
          }
    };

    const step = (dt: number) => {
      if (g.mode === "world") unstick();
      let dx = 0;
      let dz = 0;
      let limit = Infinity;
      if (!g.frozen) {
        for (const key of g.keys) {
          const move = MOVE_KEYS[key];
          if (move) {
            dx += move[0];
            dz += move[1];
          }
        }
        // The on-screen thumb-stick: how far it is pushed is how fast you walk.
        dx += g.stick[0];
        dz += g.stick[1];
        if (dx || dz) {
          g.path = [];
          g.pendingChest = null;
          g.autoJump = false;
          g.target = null;
        } else if (g.path.length) {
          const [tx, tz] = g.path[0];
          const ex = tx - g.x;
          const ez = tz - g.z;
          const dist = Math.hypot(ex, ez);
          if (dist < 0.05) {
            g.path.shift();
            if (!g.path.length) {
              g.target = null;
              const chest = g.pendingChest;
              g.pendingChest = null;
              if (chest) live.current.openChest(chest);
              else if (g.autoJump) {
                g.autoJump = false;
                live.current.act();
              }
            }
          } else {
            dx = ex;
            dz = ez;
            limit = dist;
          }
        }
      }
      const len = Math.hypot(dx, dz);
      g.walking = len > 0;
      if (len > 0) {
        dx /= len;
        dz /= len;
        const pace = g.path.length ? 1 : Math.min(1, len);
        const distance = Math.min(limit, (g.mode === "arena" ? 5.4 : 4.3) * dt * pace);
        g.heading = Math.atan2(dx, dz);
        g.step += dt;
        if (g.mode === "arena") {
          const field = arenaRef.current?.field ?? fieldFor(false);
          g.x = Math.min(field.halfW, Math.max(-field.halfW, g.x + dx * distance));
          g.z = Math.min(field.halfD, Math.max(-field.halfD, g.z + dz * distance));
        } else {
          const nx = g.x + dx * distance;
          const nz = g.z + dz * distance;
          const before = g.x + g.z;
          if (!collides(nx, g.z)) g.x = nx;
          if (!collides(g.x, nz)) g.z = nz;
          // Walked into something while following a path: give up rather than push forever.
          if (g.path.length && Math.abs(g.x + g.z - before) < 1e-5) {
            g.path = [];
            g.target = null;
          }
        }
      }
      if (g.y > 0 || g.vy > 0) {
        g.vy -= 20 * dt;
        g.y += g.vy * dt;
        if (g.y <= 0) {
          g.y = 0;
          g.vy = 0;
          live.current.handleLand();
        }
      }
      const flight = g.flight;
      if (flight) {
        flight.t += dt;
        if (flight.t >= flight.time) live.current.landThrow();
      }
      const a = arenaRef.current;
      if (g.mode === "arena" && a?.spec) {
        const playing = a.phase === "playing";
        g.focus = playing ? focusOf(a.spec, a.pads, a.field, a.answer, g.x, g.z, g.heading) : null;
        // The labels over the pads are drawn by the page: tell it when the hero points at another one.
        if ((g.focus?.id ?? null) !== a.focus) updateArena({ focus: g.focus?.id ?? null });
        if (isFork(a.spec, a.field)) {
          // A fork is answered by walking: stepping into a gate is the answer, once.
          const gate = g.y === 0 ? padAt(a.pads, g.x, g.z) : null;
          const id = gate?.gate ? gate.id : null;
          if (id !== g.onGate) {
            g.onGate = id;
            if (gate && id && playing) live.current.handleLand(gate);
          }
        }
      }
      if (g.mode === "world") {
        let nearest: string | null = null;
        let best = 1.35;
        for (const chest of blockersRef.current.chests) {
          const d = Math.hypot(chest.tile[0] + 0.5 - g.x, chest.tile[1] + 0.5 - g.z);
          if (d < best) {
            best = d;
            nearest = chest.id;
          }
        }
        if (nearest !== g.nearChest) {
          g.nearChest = nearest;
          setNear(nearest);
        }
        const z = zoneAt(Math.floor(g.x), Math.floor(g.z));
        if (z !== g.zone) {
          g.zone = z;
          setZone(z);
        }
      }
    };

    const frameState = (): FrameState => {
      const a = arenaRef.current;
      const inArena = g.mode === "arena" && !!a?.spec;
      const outcome = outcomeOf(a);
      return {
        player: { x: g.x, y: g.y, z: g.z, heading: g.heading, walking: g.walking, step: g.step, color: worldRef.current.color },
        chests: worldRef.current.chests,
        openCount: openCountRef.current,
        closedGates: blockersRef.current.closedGates,
        nearChest: g.nearChest,
        target: g.target,
        arena:
          inArena && a?.spec
            ? {
                pads: padViews(a.spec, a.pads, a.answer, outcome, g.focus?.id ?? null),
                display: displayText(a.spec, a.answer),
                marker:
                  a.spec.kind === "slider" && a.phase === "playing" && onRunway(a.field, g.x, g.z)
                    ? String(runwayValue(a.spec, a.field, g.x, g.z))
                    : null,
                flag: flagAt(a.spec, a.field, a.answer),
                flagLook: outcome === "wrong" ? "wrong" : outcome === "playing" ? "idle" : "correct",
                picture: a.spec.picture
                  ? {
                      selected: a.answer.picked,
                      eliminated: a.answer.eliminated,
                      // The spot a throw would land on, or else the one under the hero's feet.
                      hover: a.phase === "playing" ? (g.focus?.id ?? hotspotUnder(a.spec, a.field, g.x, g.z)) : null,
                      points: a.answer.points,
                      placed: a.spec.kind === "gap" ? a.answer.pairs.map(([choice, spot]): [string, string] => [spot, choice]) : [],
                      look: outcome === "wrong" ? "wrong" : outcome === "playing" ? "idle" : "correct",
                    }
                  : null,
                carrying: (throws(a.spec) || a.spec.kind === "order") && a.answer.pending !== null,
                aim: throws(a.spec) && g.focus ? [g.focus.x, g.focus.z, aimRadius(a.pads, g.focus)] : null,
                flying: g.flight ? flightPoint(g.flight) : null,
              }
            : null,
      };
    };

    /** Keep each HTML label on the sign position of its pad. */
    let labelTick = 0;
    const placeLabels = () => {
      labelTick += 1;
      const a = arenaRef.current;
      if (!scene || g.mode !== "arena" || !a) return;
      const held = carryEl.current;
      if (held) {
        // Above the crate the hero holds up, or with it through the air.
        const flown = g.flight ? flightPoint(g.flight) : null;
        const p = flown ? scene.screenPoint(flown[0], flown[1] + 0.45, flown[2]) : scene.screenPoint(g.x, g.y + 2.15 * scene.heroScale, g.z);
        held.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
      }
      for (const pad of a.pads) {
        if (!pad.overlay) continue;
        const el = labels.get(pad.id);
        if (!el) continue;
        if (pad.side) {
          // Beside its pad, as an entry in a list: as wide as the room there is.
          const right = pad.side === "right";
          const edge = pad.x + (right ? 1 : -1) * (pad.size / 2 + 0.35);
          const p = scene.screenPoint(edge, 0.2, pad.z);
          const far = scene.screenPoint(edge + (right ? 1 : -1) * (pad.span ?? 3), 0.2, pad.z);
          const wide = Math.max(72, Math.abs(far.x - p.x));
          el.style.maxWidth = `${wide.toFixed(0)}px`;
          el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(${right ? "0" : "-100%"}, -50%)`;
          if (pad.html?.includes("<img") && labelTick % 15 === 0) {
            // A picture is shrunk to its row, so the rows of a list never run into each other.
            const content = el.querySelector("[data-rich]")?.shadowRoot?.lastElementChild;
            const zoom = Number(el.dataset.zoom ?? 1);
            const size = content?.getBoundingClientRect();
            const high = pad.high ?? pad.size;
            const tall = Math.abs(scene.screenPoint(edge, 0.2, pad.z + high / 2).y - scene.screenPoint(edge, 0.2, pad.z - high / 2).y);
            if (size && size.width > 0 && size.height > 0) {
              const fit = Math.min(1, (wide - 24) / (size.width / zoom), Math.max(0.25, (tall - 16) / (size.height / zoom)));
              if (Math.abs(fit - zoom) > 0.02) {
                el.dataset.zoom = fit.toFixed(3);
                el.style.setProperty("--quest-label-zoom", fit.toFixed(3));
              }
            }
          }
          continue;
        }
        if (pad.anchor === "left") {
          // A row heading: ends at its row, and may use the room between the question panel and the table.
          const p = scene.screenPoint(pad.x, 0.2, pad.z);
          el.style.maxWidth = `${Math.max(90, p.x - insetRef.current - 12).toFixed(0)}px`;
          el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-100%, -50%)`;
          continue;
        }
        // Well behind the pad: an HTML label lies over the 3D picture, so anything under it is
        // hidden. This far back, the hero on the pad, the pad itself and the stars that pop out
        // of it all stay in view.
        const p = scene.screenPoint(pad.x, 0.3, pad.z - pad.size / 2 - LABEL_GAP);
        // As wide as the pad and a little more, so neighbours never overlap.
        const half = pad.span ? pad.span / 2 : pad.size / 2 + 0.3;
        const width = scene.screenPoint(pad.x + half, 0.3, pad.z).x - scene.screenPoint(pad.x - half, 0.3, pad.z).x;
        el.style.maxWidth = `${Math.max(72, width).toFixed(0)}px`;
        // A picture keeps its own size where there is room, and the label shrinks as a whole where
        // there is not. Measured now and then: the picture may still be loading, the window may resize.
        if (pad.html?.includes("<img") && labelTick % 15 === 0) {
          const content = el.querySelector("[data-rich]")?.shadowRoot?.lastElementChild;
          const zoom = Number(el.dataset.zoom ?? 1);
          const natural = content ? content.getBoundingClientRect().width / zoom : 0;
          if (natural > 0) {
            const next = Math.min(1, Math.max(0.4, (Math.max(72, width) - 28) / natural));
            if (Math.abs(next - zoom) > 0.02) {
              el.dataset.zoom = next.toFixed(3);
              el.style.setProperty("--quest-label-zoom", next.toFixed(3));
            }
          }
        }
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
      }
    };

    // three.js and the scene come in their own chunk, only once the game starts.
    void import("../quest/scene3d")
      .then(({ QuestScene }) => {
        if (disposed) return;
        scene = new QuestScene(container, theme, layout);
        sceneRef.current = scene;
        observer = new ResizeObserver(() => scene?.resize());
        observer.observe(container);
        setSceneReady(true);
        let last = performance.now();
        const frame = (now: number) => {
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          step(dt);
          scene?.update(frameState(), dt);
          placeLabels();
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      })
      .catch((error) => {
        console.error("Could not start the 3D world:", error);
        if (!disposed) setSceneError(true);
      });

    const onKeyDown = (e: KeyboardEvent) => {
      if (g.paused || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const box = e.target instanceof HTMLInputElement ? e.target.dataset.questEntry : undefined;
      if (box) {
        if (key === "Escape") {
          live.current.leaveArena();
          return;
        }
        // The answer box of a text entry. A word takes every key. A number leaves the hero the keys it
        // has no use for, so the digits on the floor can still be walked to. Enter hands in through the box.
        if (box === "word" || key === "Enter" || !(MOVE_KEYS[key] || key === " " || key === "e")) return;
      } else if (isTyping(e.target)) return;
      // On a text entry a key types the answer, also when the box does not have the focus.
      else if (!(e.target instanceof HTMLButtonElement && key === " ") && live.current.typeKey(e.key)) {
        e.preventDefault();
        return;
      }
      if (MOVE_KEYS[key]) {
        e.preventDefault();
        g.keys.add(key);
      } else if (key === " " || key === "Enter" || key === "e") {
        // Leave Enter and Space alone on a focused button.
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        if (e.repeat) return;
        // Enter hands in where there is a ✔; everywhere else it does what Space does.
        if (key !== "Enter" || !live.current.check()) live.current.act();
      } else if (key === "Escape" && g.mode === "arena") {
        live.current.leaveArena();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      g.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    };
    const onBlur = () => g.keys.clear();
    // Development only: lets a test stand the hero somewhere and jump, without aiming clicks at WebGL.
    const debugHost = window as unknown as { __quest?: unknown };
    if (import.meta.env.DEV) {
      debugHost.__quest = {
        hero: g,
        chests: layout.chests,
        // Advance the game by hand: a hidden tab gets no animation frames.
        tick: (dt = 1 / 60) => {
          step(dt);
          scene?.update(frameState(), dt);
          placeLabels();
        },
        arena: () => arenaRef.current,
        open: (id: string) => live.current.openChest(id),
        jump: () => live.current.act(),
        check: () => live.current.check(),
        leave: () => live.current.leaveArena(),
      };
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      scene?.dispose();
      sceneRef.current = null;
      delete debugHost.__quest;
    };
  }, [layout, theme, updateArena]);

  // On a wide screen the question sits in a panel on the left; frame the arena in what is left.
  const inArena = !!arena && arena.phase !== "loading";
  // With a keyboard at hand the answer box of a text entry is ready to type in. Not on a touch screen: there
  // it would raise the on-screen keyboard over the arena before the question was read.
  const entryKey = arena?.spec?.kind === "entry" && arena.phase === "playing" ? `${arena.item.id}:${arena.stage}` : null;
  useEffect(() => {
    if (entryKey && window.matchMedia("(hover: hover) and (pointer: fine)").matches) entryRef.current?.focus({ preventScroll: true });
  }, [entryKey]);
  useEffect(() => {
    const container = containerRef.current;
    const panel = panelRef.current;
    const scene = sceneRef.current;
    if (!scene) return;
    if (!inArena || !container || !panel) {
      insetRef.current = 0;
      scene.setInset(0, 0);
      return;
    }
    const measure = () => {
      // Beside the arena on a wide screen, above it on a narrow one.
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const box = container.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      insetRef.current = wide ? rect.right - box.left + 8 : 0;
      sceneRef.current?.setInset(insetRef.current, wide ? 0 : rect.bottom - box.top + 8);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(container);
    return () => observer.disconnect();
  }, [inArena, sceneReady]);

  const onPointerDown = (e: React.PointerEvent) => {
    const g = gRef.current;
    const scene = sceneRef.current;
    if (!scene || g.frozen || e.button !== 0) return;
    const point = scene.pickGround(e.clientX, e.clientY);
    if (!point) return;
    if (g.mode === "arena") {
      const field = arenaRef.current?.field ?? fieldFor(false);
      const x = Math.min(field.halfW, Math.max(-field.halfW, point[0]));
      const z = Math.min(field.halfD, Math.max(-field.halfD, point[1]));
      const pad = arenaRef.current ? padAt(arenaRef.current.pads, x, z) : null;
      if (pad) {
        goToPad(pad);
        return;
      }
      const picture = arenaRef.current?.spec?.picture;
      const now = arenaRef.current;
      if (picture && now?.spec?.kind === "gap" && now.answer.pending && now.phase === "playing") {
        // With something in hand, a click on a place on the picture throws it there.
        const spot = focusOf(now.spec, [], field, now.answer, x, z, 0);
        const pixel = toPicture(picture, field, x, z);
        const slack = HOTSPOT_SLACK / pictureFrame(picture, field).scale;
        if (spot && pixel && areaAt(now.spec.areas, pixel[0], pixel[1], slack)?.id === spot.id) {
          throwAt(spot);
          return;
        }
      }
      g.path = [[x, z]];
      // A click on the picture is an answer: walk there and jump.
      g.autoJump = !!picture && !!toPicture(picture, field, x, z);
      g.pendingChest = null;
      g.target = g.path[0];
      return;
    }
    // The nearest one: chests about the same text stand side by side.
    const reach = (c: Layout["chests"][number]) => Math.hypot(c.tile[0] + 0.5 - point[0], c.tile[1] + 0.3 - point[1]);
    const chest = layout.chests.filter((c) => reach(c) < 0.85).sort((a, b) => reach(a) - reach(b))[0];
    if (chest) {
      goToChest(chest.id);
      return;
    }
    const to: [number, number] = [Math.floor(point[0]), Math.floor(point[1])];
    const from: [number, number] = [Math.floor(g.x), Math.floor(g.z)];
    const path = isBlocked(to[0], to[1], blockersRef.current) ? null : findPath(from, to, blockersRef.current);
    if (!path) {
      sfx.bump();
      return;
    }
    g.path = path.slice(1).map(([x, z]) => [x + 0.5, z + 0.5]);
    g.pendingChest = null;
    g.autoJump = false;
    g.target = g.path.length ? g.path[g.path.length - 1] : null;
  };

  const setReader = (open: boolean) => {
    // The world waits while you read, and the arrow keys scroll the text.
    gRef.current.frozen = open;
    gRef.current.paused = open;
    gRef.current.keys.clear();
    setReading(open);
  };

  // ── HUD ───────────────────────────────────────────────────────────

  /** A touch screen: show the thumb-stick and the action button, and say "tap" where a keyboard says "Space". */
  const [touch] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0 ||
        // Inside the app's tablet or phone preview: show what that device would show.
        window.self !== window.top),
  );
  const steer = useCallback((x: number, z: number) => {
    gRef.current.stick = [x, z];
  }, []);

  const attempts = arena ? (world.chests[arena.item.id]?.attempts ?? 0) : 0;
  const possible = starsForAttempt(attempts + 1);
  // What every part's blank shows, keyed by response identifier and flattened so the stem is only rebuilt on a change.
  const blankKey = arena
    ? arena.specs
        .flatMap((spec, i) => {
          const answer = i === arena.stage ? arena.answer : arena.answers[i];
          // A gap match has a blank for every gap: it shows what was carried into it.
          if (spec.kind === "gap") return gapBlanks(spec, answer);
          return [`${spec.responseId}\u0000${blankText(spec, answer)}`];
        })
        .join("\u0001")
    : "";
  const currentId = arena?.specs.length && arena.specs.length > 1 ? arena.spec?.responseId : undefined;
  const stem = useMemo(() => {
    if (!arena) return "";
    const blanks = Object.fromEntries(blankKey ? blankKey.split("\u0001").map((entry) => entry.split("\u0000")) : []);
    return stemHtml(arena.item.xml, blanks, currentId);
  }, [arena?.item.xml, blankKey, currentId]); // eslint-disable-line react-hooks/exhaustive-deps
  const parts = arena?.specs.length ?? 0;
  const canSwitchPart = arena?.phase === "playing" || arena?.phase === "revealed";
  const overlayPads = useMemo(() => (inArena && arena ? arena.pads.filter((pad) => pad.overlay) : []), [arena, inArena]);
  const labelViews =
    arena?.spec && overlayPads.length ? padViews(arena.spec, arena.pads, arena.answer, outcomeOf(arena), arena.focus) : {};
  /** The next unopened question about the same text: the ones after this one first, then the ones before it. */
  const nextAbout = (item: QuestItem | null | undefined): QuestItem | null => {
    if (!item?.group) return null;
    const at = items.indexOf(item);
    return (
      [...items.slice(at + 1), ...items.slice(0, Math.max(0, at))].find((other) => {
        const spot = spotById[other.id];
        return other.group === item.group && !!spot && !isOpen(world.chests[other.id]) && !(spot.boss && openCount < layout.bossNeeds);
      }) ?? null
    );
  };
  const nextUp = nextAbout(arena?.item ?? classic);
  // In the hero's hands (a word for a gap, one of a match, one out of a row), or thrown and still in the air.
  const carriedId =
    inArena && arena?.spec && (throws(arena.spec) || arena.spec.kind === "order") ? (arena.answer.pending ?? arena.flying) : null;
  const carried = carriedId ? (arena?.spec?.choices.find((choice) => choice.id === carriedId) ?? null) : null;
  const throwing = !!arena?.spec && throws(arena.spec) && !!arena.answer.pending && !!arena.focus;
  const arenaSpot = arena ? spotById[arena.item.id] : undefined;
  const zoneInfo = theme.zones[arenaSpot ? arenaSpot.zone : zone];
  const topicOf = (zoneId: ZoneId) => (builtIn ? theme.zones[zoneId].topic : `Part ${ZONES.indexOf(zoneId) + 1} of 3`);
  const nearItem = near ? itemById[near] : null;
  const nearLocked = !!(near && spotById[near]?.boss) && openCount < layout.bossNeeds;
  const nearOpen = near ? isOpen(world.chests[near]) : false;
  const chip = "flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-800 shadow-md";
  // A phone has no room for the score while a question is on screen.
  const scoreChip = cn(chip, inArena && "hidden sm:flex");
  const swatches = theme.heroColors.map((color) => (
    <button
      key={color}
      type="button"
      onClick={() => setWorld((w) => ({ ...w, color }))}
      title="Change your colour"
      aria-label={`Outfit colour ${color}`}
      className={cn(
        "h-6 w-6 rounded-full border-2 transition hover:scale-110",
        world.color === color ? "border-slate-900 ring-2 ring-slate-300" : "border-white ring-1 ring-slate-300",
      )}
      style={{ background: color }}
    />
  ));
  const iconButton =
    "pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white hover:text-slate-900 active:scale-95";

  return (
    <div className="relative h-full select-none overflow-hidden" style={{ background: theme.sky }}>
      <div ref={containerRef} onPointerDown={onPointerDown} className="absolute inset-0 cursor-pointer" />

      {sceneError && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
          <p className="max-w-sm rounded-2xl bg-black/60 p-6">
            The 3D world could not start. Your browser may not support WebGL, or it is switched off.
          </p>
        </div>
      )}

      {/* Choices that are a picture, a formula or a long sentence: HTML labels riding on their pads */}
      {overlayPads.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          {overlayPads.map((pad) => {
            const view = labelViews[pad.id] ?? { look: "idle" as const };
            return (
              <button
                key={pad.id}
                type="button"
                ref={(el) => {
                  if (el) labelEls.current.set(pad.id, el);
                  else labelEls.current.delete(pad.id);
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  // A heading is not an answer; everything else walks there and jumps.
                  if (pad.role !== "label") goToPad(pad);
                }}
                style={view.tint ? { borderColor: view.tint } : undefined}
                className={cn(
                  pad.side === "right"
                    ? "quest-label-list text-left"
                    : pad.anchor === "left" || pad.side === "left"
                      ? cn("text-right", arena?.field.portrait && "quest-label-list")
                      : "quest-label-above text-center",
                  "quest-label pointer-events-auto absolute left-0 top-0 rounded-xl border-[3px] shadow-lg transition-colors",
                  pad.side ? "px-2 py-1" : "px-2.5 py-1.5",
                  // A place in a row always wears its number, and in a list a pair's number sits on a
                  // small label: keep the text clear of it.
                  (pad.slot !== undefined || (view.badge && pad.side)) && "pl-5",
                  LABEL_LOOK[view.look],
                  view.aimed && "quest-label-aimed",
                )}
              >
                {view.badge && (
                  <span
                    className="absolute -left-2.5 -top-2.5 grid h-6 w-6 place-items-center rounded-full bg-sky-500 text-xs font-extrabold text-white shadow"
                    style={view.tint ? { background: view.tint } : undefined}
                  >
                    {view.badge}
                  </span>
                )}
                {/* A gap shows what was put in it; any other label its own text. */}
                {(view.html ?? (view.mark === undefined ? pad.html : undefined)) ? (
                  <RichLabel html={view.html ?? pad.html ?? ""} stylesheets={arena?.item.stylesheets ?? NO_STYLESHEETS} />
                ) : (
                  // An empty place in a row keeps its height.
                  (view.mark ?? pad.label) || "\u00a0"
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* What the hero carries (gap match, order): it rides above the hero's head until it is thrown or put down. */}
      {carried && (
        <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
          <div
            ref={carryEl}
            className="quest-label quest-carried absolute left-0 top-0 rounded-xl border-[3px] border-amber-500 bg-amber-50 px-2.5 py-1.5 text-center shadow-xl"
          >
            {carried.html ? <RichLabel html={carried.html} stylesheets={arena?.item.stylesheets ?? NO_STYLESHEETS} /> : carried.label}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <button type="button" className={iconButton} onClick={inArena ? leaveArena : onExit} title={inArena ? "Back to the world" : "Choose another world"}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">{inArena ? "Back to the world" : "Choose another world"}</span>
          </button>
          <DemoBadge />
          {!inArena && (
            // On a phone the colours are in the quest list instead: the bar has no room.
            <div className={cn(chip, "pointer-events-auto hidden gap-1 py-1 pl-3 pr-1.5 sm:flex")}>
              <span className="mr-1">
                {theme.emoji} {name}
              </span>
              {swatches}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {starMax > 0 && (
            <div className={scoreChip} title="Stars collected">
              <Star key={stars} className="quest-count h-5 w-5 fill-yellow-400 text-amber-500" />
              {stars}
              <span className="font-medium text-slate-400">/ {starMax}</span>
            </div>
          )}
          <div className={scoreChip} title={`${theme.treasure}s opened`}>
            <span aria-hidden="true">🔑</span>
            {openCount}
            <span className="font-medium text-slate-400">/ {total}</span>
          </div>
          {world.streak >= 2 && (
            <div className={cn(scoreChip, "bg-orange-500 text-white")} title="Right first time, in a row">
              <Flame className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              {world.streak}
            </div>
          )}
          {arena && (
            <button
              type="button"
              className={cn(iconButton, peek && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white")}
              onClick={() => setPeek((p) => !p)}
              title="Show the real QTI item behind this question"
              aria-pressed={peek}
            >
              <Code2 className="h-5 w-5" />
              <span className="sr-only">Show the QTI item</span>
            </button>
          )}
          {!inArena && (
            <button type="button" className={iconButton} onClick={() => setShowList((s) => !s)} title="Quest list" aria-pressed={showList}>
              <ListChecks className="h-5 w-5" />
              <span className="sr-only">Quest list</span>
            </button>
          )}
          <button type="button" className={iconButton} onClick={() => onMuted(!muted)} title={muted ? "Sound on" : "Sound off"}>
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <span className="sr-only">{muted ? "Sound on" : "Sound off"}</span>
          </button>
        </div>
      </div>

      {/* World: zone banner, prompts, quest list */}
      {!arena && sceneReady && (
        <>
          <div key={zone} className="quest-banner pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4">
            <div className="rounded-2xl px-6 py-2 text-center text-white shadow-xl" style={{ background: zoneInfo.color }}>
              <div className="font-display text-2xl font-extrabold">{zoneInfo.name}</div>
              <div className="text-sm font-semibold opacity-90">{topicOf(zone)}</div>
            </div>
          </div>

          {nearItem && !nearOpen && (
            <div className={cn("pointer-events-none absolute inset-x-0 z-10 flex justify-center px-4", touch ? "bottom-40" : "bottom-24")}>
              <button
                type="button"
                onClick={() => openChest(nearItem.id)}
                className="quest-pop-in pointer-events-auto flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-base font-bold text-slate-900 shadow-xl ring-4 ring-yellow-300"
              >
                {nearLocked ? (
                  <>
                    <Lock className="h-4 w-4" /> Locked: open {layout.bossNeeds - openCount} more first
                  </>
                ) : (
                  <>
                    <kbd className="rounded-md bg-slate-900 px-2 py-0.5 text-sm text-white">{touch ? "Tap" : "Space"}</kbd> Open “
                    {nearItem.title}”
                  </>
                )}
              </button>
            </div>
          )}

          {!touch && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden rounded-xl bg-black/35 px-3 py-2 text-xs font-medium text-white backdrop-blur sm:block">
              <Footprints className="mr-1 inline h-3.5 w-3.5" />
              Arrow keys or WASD to walk · Space to jump · or just click where you want to go
            </div>
          )}

          {showList && (
            <div className="quest-pop-in absolute right-3 top-16 z-20 flex max-h-[calc(100%-5rem)] w-80 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
              <div className="mb-2 flex shrink-0 items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-slate-900">Quest list</h2>
                <button type="button" onClick={() => setShowList(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100" aria-label="Close quest list">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Scroller>
              {ZONES.map((zoneId) => {
                const here = layout.chests.filter((c) => c.zone === zoneId);
                if (!here.length) return null;
                return (
                  <div key={zoneId} className="mb-2">
                    <div className="mb-1 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-white" style={{ background: theme.zones[zoneId].color }}>
                      {theme.zones[zoneId].name}
                    </div>
                    {here.map((spot) => {
                      const progress = world.chests[spot.id];
                      const open = isOpen(progress);
                      const locked = !!spot.boss && openCount < layout.bossNeeds;
                      return (
                        <div key={spot.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                          <span
                            aria-hidden="true"
                            title={itemById[spot.id]?.writing ? "Writing question" : itemById[spot.id]?.dialog ? "Mini game" : undefined}
                          >
                            {spot.boss ? "👑" : open ? "📭" : itemById[spot.id]?.writing ? "✍️" : itemById[spot.id]?.dialog ? "🕹️" : "🎁"}
                          </span>
                          <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", open ? "text-slate-400" : "text-slate-800")}>
                            {itemById[spot.id]?.title}
                          </span>
                          {open && itemById[spot.id]?.writing ? (
                            // Handed in: a writing question has no stars to show.
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                              <Feather className="h-4 w-4" /> handed in
                            </span>
                          ) : open ? (
                            <span className="flex">
                              {[0, 1, 2].map((i) => (
                                <Star key={i} className={cn("h-4 w-4", i < progress!.stars ? "fill-yellow-400 text-amber-500" : "text-slate-300")} />
                              ))}
                            </span>
                          ) : locked ? (
                            <Lock className="h-4 w-4 text-slate-400" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => goToChest(spot.id)}
                              className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-400"
                            >
                              Go
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600 sm:hidden">
                Your colour <span className="flex gap-1.5">{swatches}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("Start this world again? Your stars here will be lost.")) return;
                  setWorld((w) => ({ ...w, chests: {}, streak: 0, bestStreak: 0 }));
                  announcedRef.current = 0;
                  gRef.current.path = [];
                  gRef.current.x = SPAWN[0] + 0.5;
                  gRef.current.z = SPAWN[1] + 0.5;
                  setShowList(false);
                }}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start this world again
              </button>
              </Scroller>
            </div>
          )}
        </>
      )}

      {/* Touch controls: a thumb-stick to walk, and in the world a button to jump or open a chest */}
      {touch && sceneReady && !classic && !reading && !finished && !zoomed && arena?.phase !== "celebrate" && arena?.phase !== "loading" && (
        <>
          <ThumbStick onMove={steer} />
          {!arena && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                act();
              }}
              className="absolute bottom-4 right-4 z-20 grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-base font-extrabold text-white shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-[0_2px_0_#047857]"
            >
              <span className="flex flex-col items-center leading-none">
                <ArrowUp className="h-7 w-7" />
                {nearItem && !nearOpen && !nearLocked ? "Open" : "Jump"}
              </span>
            </button>
          )}
        </>
      )}

      {/* Arena: the question panel, the guide and the buttons */}
      {arena && (
        <>
          <QtiItemHost key={arena.item.id} xml={arena.item.xml} maxScore={arena.item.maxScore} visible={peek} onReady={onItemReady} />
          {inArena && (
            <>
              <div
                ref={panelRef}
                className="quest-pop-in absolute inset-x-3 top-16 z-10 flex max-h-[36%] flex-col overflow-hidden rounded-2xl border-4 border-white bg-white/97 shadow-2xl lg:inset-x-auto lg:left-3 lg:max-h-[calc(100%-4.75rem)] lg:w-[23rem]"
              >
                <div className="flex shrink-0 items-center gap-3 px-4 py-1.5 text-white" style={{ background: zoneInfo.color }}>
                  <div className="min-w-0 flex-1 truncate font-display text-base font-bold">
                    {arenaSpot?.boss ? "👑 " : ""}
                    {arena.item.title}
                  </div>
                  {(arena.phase === "playing" || arena.phase === "checking" || arena.phase === "wrong") && (
                    <div className="flex items-center gap-0.5" title="Stars you can still win">
                      {[0, 1, 2].map((i) => (
                        <Star key={i} className={cn("h-4 w-4", i < possible ? "fill-yellow-300 text-yellow-300" : "text-white/40")} />
                      ))}
                    </div>
                  )}
                </div>
                <Scroller className="select-text px-4 py-2.5">
                  {arena.item.stimulus && (
                    <button
                      type="button"
                      onClick={() => setReader(true)}
                      className="mb-2 flex w-full items-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm font-bold text-sky-900 hover:bg-sky-100"
                    >
                      <BookOpen className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">Read: {arena.item.stimulus.title}</span>
                    </button>
                  )}
                  {/* Built by stemHtml from the item body, through a tag and attribute allow-list. */}
                  <div
                    className="quest-stem"
                    // A picture in the question is often what the question is about: a click enlarges it.
                    onClick={(e) => {
                      if (e.target instanceof HTMLImageElement) setZoomed({ src: e.target.src, alt: e.target.alt });
                    }}
                    dangerouslySetInnerHTML={{ __html: stem }}
                  />
                </Scroller>
                {parts > 1 && (
                  <div className="flex shrink-0 items-center gap-1.5 border-t border-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Part
                    {arena.specs.map((spec, i) => {
                      const given = i === arena.stage ? arena.answer : arena.answers[i];
                      const answered =
                        given.picked.length > 0 || given.pairs.length > 0 || given.points.length > 0 || !!given.digits || given.value !== null;
                      return (
                        <button
                          key={spec.responseId}
                          type="button"
                          disabled={!canSwitchPart}
                          onClick={() => goToStage(i)}
                          aria-current={i === arena.stage ? "step" : undefined}
                          aria-label={`Part ${i + 1} of ${parts}${answered ? ", answered" : ""}`}
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-full border-2 text-sm normal-case transition disabled:opacity-60",
                            i === arena.stage
                              ? "border-amber-500 bg-amber-400 text-white"
                              : answered
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
                {arena.spec?.kind === "entry" && (arena.phase === "playing" || arena.phase === "checking" || arena.phase === "wrong") && (
                  // The answer is typed here, with the keyboard the player already has: a phone opens its own.
                  <form
                    className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-3 py-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      check();
                    }}
                  >
                    <input
                      ref={entryRef}
                      data-quest-entry={entryMode(arena.spec)}
                      value={arena.answer.digits}
                      onChange={(e) => typeText(e.target.value)}
                      // Not disabled while the answer is checked: that would let go of the focus.
                      readOnly={arena.phase !== "playing"}
                      inputMode={entryMode(arena.spec) === "word" || arena.spec.keys.includes("-") ? "text" : "decimal"}
                      enterKeyHint="done"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-label="Your answer"
                      placeholder={entryMode(arena.spec) === "word" ? "Type your answer" : "Type your number"}
                      className="min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-lg font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={arena.phase !== "playing"}
                      title="Check your answer (Enter)"
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl border-2 border-emerald-600 bg-emerald-500 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" strokeWidth={3} /> Check
                    </button>
                  </form>
                )}
                {/* On a phone the card is small, and the answer box says for itself what to do with it. */}
                {arena.spec && arena.phase !== "revealed" && !(arena.spec.kind === "entry" && arena.field.portrait) && (
                  <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-bold text-slate-700">
                    <ArrowUp className="h-4 w-4 shrink-0 text-emerald-600" />
                    {howTo(arena.spec, arena.field)}
                  </div>
                )}
                <div
                  className={cn(
                    "flex shrink-0 items-start gap-2 border-t border-slate-200 px-3 py-2",
                    arena.mood === "hint" ? "bg-amber-50" : "bg-white",
                  )}
                >
                  <div className={cn("text-3xl leading-none", arena.mood === "happy" && "quest-bounce")} aria-hidden="true">
                    {theme.guide.emoji}
                  </div>
                  <p key={arena.message} aria-live="polite" className="quest-pop-in min-w-0 flex-1 text-sm font-medium leading-snug text-slate-800">
                    {arena.mood === "hint" && <Lightbulb className="mr-1 inline h-4 w-4 text-amber-500" />}
                    <span className="mr-1 font-bold text-slate-500">{theme.guide.name}:</span>
                    {arena.message}
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
                {arena.phase === "playing" && attempts >= 2 && (
                  <button
                    type="button"
                    onClick={reveal}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-md hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" /> Show answer
                  </button>
                )}
                {arena.phase === "revealed" ? (
                  <button
                    type="button"
                    onClick={nextUp ? () => goToNext(nextUp.id, false) : leaveArena}
                    className="pointer-events-auto rounded-full bg-sky-500 px-7 py-3 text-lg font-extrabold text-white shadow-[0_5px_0_#0369a1] hover:bg-sky-400 active:translate-y-0.5"
                  >
                    {nextUp ? "Next question" : "Continue"}
                  </button>
                ) : (
                  <div className="flex items-end gap-2">
                    {/* Hands in from anywhere, so nobody has to walk to the ✔ on the floor. On an upright
                        phone that ✔ lies right here between the controls, and a tap on it does the same. */}
                    {arena.phase === "playing" && !arena.field.portrait && arena.pads.some((pad) => pad.role === "check") && (
                      <button
                        type="button"
                        title="Check your answer (Enter)"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          check();
                        }}
                        className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full border-4 border-emerald-500 bg-white text-sm font-extrabold text-emerald-700 shadow-[0_5px_0_#047857] hover:bg-emerald-50 active:translate-y-1 active:shadow-[0_2px_0_#047857]"
                      >
                        <span className="flex flex-col items-center leading-none">
                          <Check className="h-6 w-6" strokeWidth={3.5} />
                          Check
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        act();
                      }}
                      className="pointer-events-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-base font-extrabold text-white shadow-[0_6px_0_#047857] hover:bg-emerald-400 active:translate-y-1 active:shadow-[0_2px_0_#047857]"
                    >
                      <span className="flex flex-col items-center leading-none">
                        <ArrowUp className="h-7 w-7" />
                        {throwing ? "Throw" : "Jump"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {reading && arena.item.stimulus && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-sm sm:p-6">
              <div className="quest-pop-in flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-4 border-sky-200 bg-white shadow-2xl">
                <div className="flex shrink-0 items-center gap-3 bg-sky-600 px-5 py-3 text-white">
                  <BookOpen className="h-5 w-5 shrink-0" />
                  <h2 className="min-w-0 flex-1 truncate font-display text-lg font-bold">{arena.item.stimulus.title}</h2>
                  <button type="button" onClick={() => setReader(false)} className="rounded-full p-1.5 hover:bg-black/20" aria-label="Close the text">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Built by bodyHtml from the stimulus, through the same allow-list. */}
                <Scroller className="select-text px-6 py-4">
                  <div className="quest-reader" dangerouslySetInnerHTML={{ __html: arena.item.stimulus.html }} />
                </Scroller>
                <div className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-3">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setReader(false)}
                    className="rounded-full bg-emerald-500 px-6 py-2.5 font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
                  >
                    Back to the question
                  </button>
                </div>
              </div>
            </div>
          )}

          {zoomed && (
            <button
              type="button"
              autoFocus
              onClick={() => setZoomed(null)}
              aria-label="Close the enlarged picture"
              className="absolute inset-0 z-40 flex cursor-zoom-out items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm sm:p-10"
            >
              <img src={zoomed.src} alt={zoomed.alt} className="quest-pop-in h-[85%] max-h-full w-auto max-w-full rounded-2xl bg-white object-contain p-2 shadow-2xl" />
            </button>
          )}

          {arena.phase === "celebrate" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]">
              <div className="quest-pop-in flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-amber-100 to-orange-200 p-7 text-center shadow-2xl">
                <div className="text-sm font-extrabold uppercase tracking-widest text-amber-800">
                  {arenaSpot?.boss ? "Final challenge beaten!" : `${theme.treasure} unlocked!`}
                </div>
                <div className="flex gap-3">
                  {[0, 1, 2].map((i) => (
                    <Star
                      key={i}
                      style={{ animationDelay: `${0.15 + i * 0.22}s` }}
                      className={cn(
                        "quest-star-pop h-20 w-20",
                        i < arena.earned ? "fill-yellow-400 text-amber-600 drop-shadow-[0_4px_0_rgba(180,83,9,0.5)]" : "fill-white/60 text-amber-300",
                      )}
                    />
                  ))}
                </div>
                <div className="font-display text-4xl font-extrabold text-amber-900">
                  {arena.earned === 3 ? "Perfect!" : arena.earned === 2 ? "Great job!" : "You did it!"}
                </div>
                <p className="text-amber-900">
                  +{arena.earned} {arena.earned === 1 ? "star" : "stars"}
                  {arena.earned === 3 ? ". Right the first time, wow!" : ". Get it right the first time for 3 stars!"}
                </p>
                {nextUp ? (
                  // More questions about the same text: go straight on, the text is still fresh.
                  <>
                    <NextButton onClick={() => goToNext(nextUp.id, false)} about={arena.item.stimulus?.title} />
                    <button type="button" onClick={leaveArena} className="text-sm font-bold text-amber-900 underline-offset-2 hover:underline">
                      Back to the world
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    autoFocus
                    onClick={leaveArena}
                    className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
                  >
                    Continue adventure
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {classic && (
        <ClassicDialog
          key={classic.id}
          item={classic}
          theme={theme}
          zoneColor={theme.zones[spotById[classic.id]?.zone ?? zone].color}
          boss={!!spotById[classic.id]?.boss}
          attempts={world.chests[classic.id]?.attempts ?? 0}
          name={name}
          onWrong={classicWrong}
          onSolved={classicSolved}
          onReveal={classicReveal}
          onHandedIn={classicHandedIn}
          onClose={closeClassic}
          onNext={nextUp ? () => goToNext(nextUp.id, true) : undefined}
          about={classic.stimulus?.title}
        />
      )}

      {/* Toast */}
      {toast && (
        <div key={toast.key} className="pointer-events-none absolute inset-x-0 top-36 z-30 flex justify-center px-4">
          <div className="quest-pop-in rounded-full bg-slate-900/90 px-5 py-2.5 text-center text-base font-bold text-white shadow-xl">{toast.text}</div>
        </div>
      )}

      {/* All done */}
      {finished && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="quest-pop-in flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl border-4 border-yellow-300 p-8 text-center text-white shadow-2xl" style={{ background: theme.card }}>
            <div className="quest-float text-7xl" aria-hidden="true">
              🏆
            </div>
            <div className="font-display text-4xl font-extrabold drop-shadow">Quest complete, {name}!</div>
            {starMax > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-black/30 px-5 py-2 text-2xl font-extrabold">
                <Star className="h-7 w-7 fill-yellow-300 text-yellow-300" /> {stars} / {starMax}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {ZONES.map((zoneId) => {
                const here = layout.chests.filter((c) => c.zone === zoneId);
                if (!here.length) return null;
                const earned = here.every((c) => world.chests[c.id]?.solved);
                return (
                  <span key={zoneId} className={cn("rounded-full px-3 py-1 text-sm font-bold", earned ? "bg-yellow-300 text-slate-900" : "bg-black/25 text-white/60")}>
                    {earned ? "🏅" : "🔒"} {theme.zones[zoneId].name} master
                  </span>
                );
              })}
              <span className={cn("rounded-full px-3 py-1 text-sm font-bold", world.bestStreak >= 3 ? "bg-orange-400 text-slate-900" : "bg-black/25 text-white/60")}>
                {world.bestStreak >= 3 ? "🔥" : "🔒"} Hot streak
              </span>
            </div>
            <p className="text-sm font-medium text-white/90">
              This was a demo: your stars stay in this browser and no result was recorded.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setFinished(false)} className="rounded-full bg-white/20 px-6 py-2.5 font-bold hover:bg-white/30">
                Keep exploring
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-full bg-white px-6 py-2.5 font-extrabold text-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.25)] hover:bg-yellow-300"
              >
                Try another world
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fade between the world and a question */}
      <div
        className={cn("pointer-events-none absolute inset-0 z-50 transition-opacity duration-300", fade || !sceneReady ? "opacity-100" : "opacity-0")}
        style={{ background: theme.card }}
      >
        {(!sceneReady || arena?.phase === "loading") && !sceneError && (
          <div className="grid h-full place-items-center text-white">
            <div className="text-center">
              <div className="quest-bounce text-6xl" aria-hidden="true">
                {theme.emoji}
              </div>
              <div className="mt-3 font-display text-xl font-bold drop-shadow">{sceneReady ? "Here we go..." : `Building ${theme.name.toLowerCase()} world...`}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestPage;
