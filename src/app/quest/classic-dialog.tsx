import { useEffect, useRef, useState } from "react";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { QTI_PKG_URL_PREFIX, createModuleResolutionFetcher, detectPciBaseUrl } from "@citolab/qti-browser-import";
import { ArrowRight, BookOpen, Eye, Feather, Gamepad2, Lightbulb, PencilLine, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { itemCss } from "../itemCss";
import { syncScopedRegistry } from "../scoped-registry";
import { useScopedQtiRegistry } from "../use-scoped-registry";
import type { QuestItem } from "./items";
import { starsForAttempt } from "./rewards";
import { Scroller } from "./scroller";
import type { Theme } from "./themes";

/**
 * A question played as a mini game in a dialog: the real item, rendered by
 * qti-components exactly as the player renders it, with the game's Check
 * button, hints and stars around it.
 *
 * It is how a question is played when the game has no jump stage for its
 * interaction: gap match, hottext, a custom interaction (PCI), and anything a
 * package brings that the game has not seen before. The item scores itself
 * here as it does in the arena.
 */

type ItemElement = HTMLElement & {
  processResponse?: (countNumAttempts?: boolean, reportValidityAfterScoring?: boolean) => boolean;
  getOutcome?: (identifier: string) => { value: unknown } | undefined;
  variables?: { identifier: string; type: string; value: unknown }[];
  showCorrectResponse?: (show: boolean) => void;
};

type Transformer = ReturnType<typeof qtiTransformItem>;

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

const hasResponse = (item: ItemElement) =>
  (item.variables ?? []).some(
    (v) => v.type === "response" && v.identifier !== "numAttempts" && v.identifier !== "duration" && !isEmpty(v.value),
  );

/** Something was written: more than spaces. */
const hasWritten = (item: ItemElement) =>
  (item.variables ?? []).some(
    (v) =>
      v.type === "response" &&
      v.identifier !== "numAttempts" &&
      v.identifier !== "duration" &&
      [v.value].flat().some((value) => typeof value === "string" && value.trim().length > 0),
  );

const pick = (messages: string[]) => messages[Math.floor(Math.random() * messages.length)];

/** Where an item sits in the package cache: the package root, its own folder, and `items/q1/` for `items/q1.xml`. */
function packageLocations(href: string | undefined) {
  if (!href) return null;
  const { pathname } = new URL(href, window.location.origin);
  const parts = pathname.split("/").filter(Boolean);
  const at = parts.indexOf(QTI_PKG_URL_PREFIX.replace(/^\//, ""));
  if (at < 0 || !parts[at + 1]) return null;
  const itemDirUrl = pathname.slice(0, pathname.lastIndexOf("/"));
  const file = pathname.slice(pathname.lastIndexOf("/") + 1);
  return {
    packageRootUrl: `${QTI_PKG_URL_PREFIX}/${parts[at + 1]}`,
    itemDirUrl,
    itemStemDirUrl: file.includes(".") ? `${itemDirUrl}/${file.slice(0, file.lastIndexOf("."))}` : null,
  };
}

/**
 * A custom interaction loads its own modules, and has to be told where they are
 * in the package. Same steps as the player takes (pages/assessment.tsx); an item
 * that already carries its module paths is left alone.
 */
async function withPciModules(transformer: Transformer, href: string | undefined): Promise<Transformer> {
  const xml = transformer.xml();
  const locations = packageLocations(href);
  if (!locations || !/<qti-portable-custom-interaction\b/i.test(xml)) return transformer;
  if (/\bdata-base-url="/i.test(xml) && /<qti-interaction-module\b/i.test(xml)) return transformer;
  const baseUrl = await detectPciBaseUrl({ ...locations, xmlText: xml });
  const fetcher = createModuleResolutionFetcher(locations);
  return transformer.configurePci(baseUrl, (_base, fileUrl) => fetcher(fileUrl));
}

/** `a/b/c` as seen from the folder `a/x`: `../b/c`. */
function relativePath(fromDir: string, to: string) {
  const from = fromDir.split("/").filter(Boolean);
  const target = to.split("/").filter(Boolean);
  let same = 0;
  while (same < from.length && same < target.length && from[same] === target[same]) same += 1;
  return [...from.slice(same).map(() => ".."), ...target.slice(same)].join("/") || ".";
}

/**
 * The older custom interaction (`qti-custom-interaction`, with a manifest of
 * scripts and styles) wants three things on its element: where its manifest is
 * (`data`), where the item is (`data-base-item`), and what the manifest's own
 * paths are relative to (`data-base-ref`). Some manifests list paths from the
 * package root, others from their own folder; the first entry tells which.
 * The player does the same in pages/assessment.tsx.
 */
async function withLegacyCustomInteractions(transformer: Transformer, href: string | undefined): Promise<Transformer> {
  const locations = packageLocations(href);
  const hosts = Array.from(transformer.xmlDoc().querySelectorAll("qti-custom-interaction"));
  if (!locations || !hosts.length) return transformer;
  const { packageRootUrl, itemDirUrl } = locations;
  for (const host of hosts) {
    const object = host.querySelector("object[data]");
    const data = host.getAttribute("data")?.trim() || object?.getAttribute("data")?.trim() || "";
    if (!data || /^(data:|blob:|https?:)/.test(data)) continue;
    for (const size of ["width", "height"]) {
      const value = object?.getAttribute(size)?.trim();
      if (value && !host.getAttribute(size)) host.setAttribute(size, value);
    }
    const rooted = data.startsWith("/") && !data.startsWith(QTI_PKG_URL_PREFIX);
    const manifestUrl = new URL(rooted ? `${packageRootUrl}${data}` : data, `${window.location.origin}${itemDirUrl}/`);
    let firstEntry = "";
    try {
      const response = await fetch(manifestUrl);
      const manifest = response.ok ? ((await response.json()) as Record<string, unknown>) : {};
      firstEntry =
        [manifest.script, manifest.style, manifest.media]
          .flatMap((list) => (Array.isArray(list) ? list : []))
          .find((entry): entry is string => typeof entry === "string" && entry.trim() !== "")
          ?.trim() ?? "";
    } catch {
      // No readable manifest: fall back to paths relative to its folder.
    }
    const fromRoot = /^\/?(ref|items)\//.test(firstEntry) || firstEntry.startsWith("/");
    host.setAttribute("data-base-item", itemDirUrl);
    host.setAttribute("data-base-ref", fromRoot ? packageRootUrl : manifestUrl.pathname.slice(0, manifestUrl.pathname.lastIndexOf("/")));
    const relative = `${relativePath(itemDirUrl, manifestUrl.pathname)}${manifestUrl.search}`;
    host.setAttribute("data", relative);
    object?.setAttribute("data", relative);
  }
  return transformer;
}

/** `handed`: a writing question was handed in. It is not checked, so it is neither right nor wrong. */
type Phase = "answering" | "correct" | "revealed" | "handed";

interface Props {
  item: QuestItem;
  theme: Theme;
  zoneColor: string;
  boss: boolean;
  /** Wrong tries so far. */
  attempts: number;
  name: string;
  onWrong: () => void;
  onSolved: (stars: number) => void;
  onReveal: () => void;
  /** A writing question was handed in. */
  onHandedIn: () => void;
  onClose: () => void;
  /** Go straight on to the next question about the same text, when there is one. */
  onNext?: () => void;
  /** The title of that text. */
  about?: string;
}

export function ClassicDialog({ item, theme, zoneColor, boss, attempts, name, onWrong, onSolved, onReveal, onHandedIn, onClose, onNext, about }: Props) {
  const writing = !!item.writing;
  /** The text the question is about. It stands beside the question; on a narrow screen the two take turns. */
  const text = item.stimulus;
  const [pane, setPane] = useState<"text" | "question">("question");
  const hostRef = useRef<HTMLDivElement>(null);
  const { registry, attachRef } = useScopedQtiRegistry();
  const [itemDoc, setItemDoc] = useState<DocumentFragment | null>(null);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [earned, setEarned] = useState(0);
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);
  const [mood, setMood] = useState<"idle" | "hint" | "happy">("idle");
  const [message, setMessage] = useState(() =>
    writing
      ? `${boss ? "The final challenge is a writing question" : "A writing question"}, ${name}. Take your time, then hand it in.`
      : boss
      ? `The final challenge is a mini game, ${name}. Take your time!`
      : attempts > 0
        ? `Welcome back, ${name}! Have another go.`
        : pick([`A mini game, ${name}! Solve it to open the ${theme.treasure}.`, `This ${theme.treasure} hides a mini game. Can you crack it?`]),
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        let transformer = qtiTransformItem().parse(item.xml).extendElementsWithClass("type").convertCDATAtoComment();
        transformer = await withPciModules(transformer, item.href);
        transformer = await withLegacyCustomInteractions(transformer, item.href);
        if (cancelled) return;
        if (registry) syncScopedRegistry(registry, transformer.xmlDoc());
        setItemDoc(registry ? transformer.htmlDoc(registry) : transformer.htmlDoc());
      } catch (error) {
        console.error("Could not prepare the mini game:", error);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.href, item.xml, registry]);

  const itemElement = () =>
    (hostRef.current?.querySelector("item-container")?.shadowRoot?.querySelector("qti-assessment-item") ??
      null) as ItemElement | null;

  const check = async () => {
    const el = itemElement();
    if (!el || checking) return;
    if (!hasResponse(el)) {
      setMood("hint");
      setMessage(pick(["Have a go first, then press Check. I'll wait!", "No answer yet. Give it a try!"]));
      return;
    }
    setChecking(true);
    el.processResponse?.(false, false);
    // Response processing reports back through an event, so give it a moment to land.
    await new Promise((resolve) => setTimeout(resolve, 80));
    setChecking(false);
    const score = Number(el.getOutcome?.("SCORE")?.value ?? 0);
    const max = Number(el.getOutcome?.("MAXSCORE")?.value) || item.maxScore || 1;
    if (score >= max) {
      const stars = starsForAttempt(attempts + 1);
      setEarned(stars);
      setPhase("correct");
      setMood("happy");
      setMessage(pick(["YES! That's it!", "Brilliant!", "Spot on!"]));
      onSolved(stars);
      return;
    }
    onWrong();
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
    setMood("hint");
    setMessage(
      score > 0
        ? `Part of it is right: you have ${Number(score.toFixed(2))} of ${Number(max.toFixed(2))} points. Have another look at the rest.`
        : attempts === 0
          ? `${pick(["Not quite!", "Oops, not yet!", "So close!"])} ${item.hint ?? "Read the question once more, slowly. What exactly is it asking?"}`
          : "Still not it. You can change your answer and check again, or have a look at the answer.",
    );
  };

  /** A writing question is not checked: once something is written, it is handed in and the chest opens. */
  const handIn = () => {
    const el = itemElement();
    if (!el) return;
    if (!hasWritten(el)) {
      setMood("hint");
      setMessage(pick(["Nothing written yet. Write your answer first, then hand it in.", "The page is still empty! Write something first."]));
      return;
    }
    setPhase("handed");
    setMood("happy");
    setMessage("Handed in. Well done for writing it!");
    onHandedIn();
  };

  const reveal = () => {
    itemElement()?.showCorrectResponse?.(true);
    setPhase("revealed");
    setMood("idle");
    setMessage(`Here is the right answer. Have a good look! The ${theme.treasure} opens, but without stars this time.`);
    onReveal();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const possible = starsForAttempt(attempts + 1);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6">
      {/* Two elements, so the shake after a wrong try does not restart the pop-in. */}
      <div className={cn("quest-pop-in flex max-h-full w-full", text ? "max-w-6xl" : "max-w-4xl")}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className={cn(
          "relative flex min-h-0 w-full flex-col overflow-hidden rounded-[2rem] border-[6px] border-slate-800 bg-slate-800 shadow-2xl",
          shake && "quest-shake",
        )}
      >
        {/* The cabinet's marquee */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-2.5 text-white" style={{ background: zoneColor }}>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
            {writing ? <Feather className="h-4 w-4" /> : <Gamepad2 className="h-4 w-4" />}{" "}
            <span className="hidden sm:inline">{writing ? "Writing" : "Mini game"}</span>
          </span>
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-bold">
            {boss ? "👑 " : ""}
            {item.title}
          </h2>
          {phase === "answering" && !writing && (
            <div className="flex shrink-0 items-center gap-0.5" title="Stars you can still win">
              {[0, 1, 2].map((i) => (
                <Star key={i} className={cn("h-5 w-5", i < possible ? "fill-yellow-300 text-yellow-300" : "text-white/40")} />
              ))}
            </div>
          )}
          <button type="button" onClick={onClose} className="shrink-0 rounded-full p-1.5 hover:bg-black/20" aria-label="Close and come back later">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* The cabinet's lights. They stand still: a row of bouncing dots reads as "loading". */}
        <div className="flex shrink-0 justify-center gap-2 bg-slate-800 py-1.5" aria-hidden="true">
          {[theme.arena.accent, "#facc15", "#22c55e", "#38bdf8", "#f472b6"].map((color, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: color }} />
          ))}
        </div>

        {/* The screen: the real item */}
        <div ref={hostRef} className="mx-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
          {text && (
            <div className="flex shrink-0 gap-1 border-b border-slate-200 bg-slate-100 p-1 md:hidden" role="tablist" aria-label="Text or question">
              {(["text", "question"] as const).map((which) => {
                const Icon = which === "text" ? BookOpen : PencilLine;
                return (
                  <button
                    key={which}
                    type="button"
                    role="tab"
                    aria-selected={pane === which}
                    onClick={() => setPane(which)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold",
                      pane === which ? "bg-white text-sky-900 shadow" : "text-slate-600 hover:bg-white/60",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{which === "text" ? text.title : "Question"}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {text && (
              <div className={cn("min-h-0 min-w-0 flex-1 flex-col border-slate-200 md:flex md:border-r", pane === "text" ? "flex" : "hidden")}>
                <div className="hidden shrink-0 items-center gap-2 bg-sky-50 px-6 py-2 text-sm font-bold text-sky-900 md:flex">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{text.title}</span>
                </div>
                {/* Built by bodyHtml from the stimulus, through a tag and attribute allow-list. */}
                <Scroller className="select-text px-4 py-4 sm:px-6">
                  <div className="quest-reader" dangerouslySetInnerHTML={{ __html: text.html }} />
                </Scroller>
              </div>
            )}
            {/* Stays mounted while the text is read: what is written must not be lost. */}
            <div className={cn("min-h-0 min-w-0 flex-1 flex-col md:flex", !text || pane === "question" ? "flex" : "hidden")}>
              <Scroller className={cn("select-text px-4 py-4", text ? "sm:px-6" : "sm:px-8")}>
                {failed ? (
                  <p className="py-10 text-center text-slate-600">This mini game could not be loaded.</p>
                ) : !itemDoc ? (
                  <p className="py-10 text-center text-slate-500">Starting the mini game...</p>
                ) : (
                  <qti-item>
                    <item-container ref={attachRef} customElementRegistry={registry} itemDoc={itemDoc}>
                      <template dangerouslySetInnerHTML={{ __html: `<style>${itemCss}</style>` }}></template>
                    </item-container>
                  </qti-item>
                )}
              </Scroller>
            </div>
          </div>
        </div>

        {/* The controls */}
        <div className="flex shrink-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className={cn("text-4xl leading-none", mood === "happy" && "quest-bounce")} aria-hidden="true">
              {theme.guide.emoji}
            </div>
            <p
              key={message}
              aria-live="polite"
              className={cn(
                "quest-pop-in rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[15px] font-medium leading-snug text-slate-800",
                mood === "hint" && "ring-4 ring-amber-300",
              )}
            >
              {mood === "hint" && <Lightbulb className="mr-1 inline h-4 w-4 text-amber-500" />}
              <span className="mr-1 font-bold text-slate-500">{theme.guide.name}:</span>
              {message}
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            {phase === "answering" && !writing && attempts >= 2 && (
              <button
                type="button"
                onClick={reveal}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" /> Show answer
              </button>
            )}
            {phase === "answering" && (
              <button
                type="button"
                onClick={() => (writing ? handIn() : void check())}
                disabled={checking || !itemDoc}
                className="rounded-full bg-emerald-500 px-7 py-2.5 text-lg font-extrabold text-white shadow-[0_5px_0_#047857] transition hover:bg-emerald-400 active:translate-y-0.5 active:shadow-[0_2px_0_#047857] disabled:opacity-60"
              >
                {writing ? "Hand in" : "Check!"}
              </button>
            )}
            {phase === "revealed" && (
              <button
                type="button"
                onClick={onNext ?? onClose}
                className="rounded-full bg-sky-500 px-7 py-2.5 text-lg font-extrabold text-white shadow-[0_5px_0_#0369a1] hover:bg-sky-400 active:translate-y-0.5"
              >
                {onNext ? "Next question" : "Continue"}
              </button>
            )}
          </div>
        </div>

        {(phase === "correct" || phase === "handed") && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-amber-100 to-orange-200 p-6 text-center">
            <div className="text-sm font-extrabold uppercase tracking-widest text-amber-800">
              {phase === "handed" ? (boss ? "Final challenge handed in!" : `${theme.treasure} unlocked!`) : boss ? "Final challenge beaten!" : "Mini game won!"}
            </div>
            {phase === "handed" ? (
              // No stars: nothing checked the answer, so there is nothing to grade it with.
              <>
                <div className="quest-star-pop grid h-24 w-24 place-items-center rounded-full bg-white/70 text-amber-700 shadow-[0_5px_0_rgba(180,83,9,0.35)]">
                  <Feather className="h-14 w-14" strokeWidth={2.2} />
                </div>
                <div className="font-display text-4xl font-extrabold text-amber-900">Handed in!</div>
                <p className="max-w-sm text-amber-900">
                  A writing question has no stars: only a person can say how good an answer is, and in this demo nobody reads it.
                </p>
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  {[0, 1, 2].map((i) => (
                    <Star
                      key={i}
                      style={{ animationDelay: `${0.15 + i * 0.22}s` }}
                      className={cn(
                        "quest-star-pop h-20 w-20",
                        i < earned ? "fill-yellow-400 text-amber-600 drop-shadow-[0_4px_0_rgba(180,83,9,0.5)]" : "fill-white/60 text-amber-300",
                      )}
                    />
                  ))}
                </div>
                <div className="font-display text-4xl font-extrabold text-amber-900">
                  {earned === 3 ? "Perfect!" : earned === 2 ? "Great job!" : "You did it!"}
                </div>
                <p className="text-amber-900">
                  +{earned} {earned === 1 ? "star" : "stars"}
                  {earned === 3 ? ". Right the first time, wow!" : ". Get it right the first time for 3 stars!"}
                </p>
              </>
            )}
            {onNext ? (
              // More questions about the same text: go straight on, the text is still fresh.
              <>
                <button
                  type="button"
                  autoFocus
                  onClick={onNext}
                  className="flex max-w-full flex-col items-center rounded-3xl bg-emerald-500 px-8 py-2.5 font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
                >
                  <span className="flex items-center gap-1.5 text-lg">
                    Next question <ArrowRight className="h-5 w-5" strokeWidth={3} />
                  </span>
                  {about && <span className="max-w-full truncate text-xs font-bold text-emerald-50">about “{about}”</span>}
                </button>
                <button type="button" onClick={onClose} className="text-sm font-bold text-amber-900 underline-offset-2 hover:underline">
                  Back to the world
                </button>
              </>
            ) : (
              <button
                type="button"
                autoFocus
                onClick={onClose}
                className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
              >
                Continue adventure
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
