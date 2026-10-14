/**
 * The read-aloud player, `<test-item-to-speech>` from qti-components, as plain
 * DOM for the booklet page (the toolbar's copy is JSX in `tool-bar.tsx`).
 *
 * The element works out what to read from where it sits:
 *  - inside a `qti-assessment-item-ref` it reads that question;
 *  - next to a `[data-stimulus-idref]` placeholder (same parent) it reads that
 *    shared source;
 *  - anywhere else inside `<test-navigation>` it follows the current item.
 *
 * Every voice goes through the guard in `app/local-speech.ts`, so text is only
 * ever spoken by a voice on this machine.
 */
import { speechSupported } from "../local-speech";

export const SPEECH_LABELS = {
  play: "Read aloud",
  pause: "Pause reading",
  stop: "Stop reading",
  prev: "Previous sentence",
  next: "Next sentence",
  pick: "Click a sentence to start reading there",
};

/** Marks a player this module created, so a re-run finds it again. */
const PLAYER_ATTR = "data-speech-player";

const createPlayer = (doc: Document): HTMLElement => {
  const player = doc.createElement("test-item-to-speech");
  player.setAttribute(PLAYER_ATTR, "");
  const play = doc.createElement("test-tts-play");
  play.setAttribute("label", SPEECH_LABELS.play);
  play.setAttribute("pause-label", SPEECH_LABELS.pause);
  play.setAttribute("title", SPEECH_LABELS.play);
  const stop = doc.createElement("test-tts-stop");
  stop.setAttribute("label", SPEECH_LABELS.stop);
  stop.setAttribute("title", SPEECH_LABELS.stop);
  const pick = doc.createElement("test-tts-pick");
  pick.setAttribute("label", SPEECH_LABELS.pick);
  pick.setAttribute("title", SPEECH_LABELS.pick);
  player.append(play, stop, pick);
  return player;
};

/**
 * The player that is a direct child of `parent`, created if missing.
 * `before` places a new one; an existing player is left where it is.
 */
export const ensureSpeechPlayer = (
  parent: Element,
  before: Node | null = parent.firstChild,
): HTMLElement | null => {
  if (!speechSupported()) return null;
  const existing = parent.querySelector<HTMLElement>(`:scope > [${PLAYER_ATTR}]`);
  if (existing) return existing;
  const player = createPlayer(parent.ownerDocument);
  parent.insertBefore(player, before);
  return player;
};

export const removeSpeechPlayer = (parent: Element): void => {
  parent.querySelector(`:scope > [${PLAYER_ATTR}]`)?.remove();
};
