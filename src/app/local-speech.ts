/**
 * Keeps read-aloud on the reader's machine.
 *
 * `<test-item-to-speech>` (qti-components) speaks through the Web Speech API
 * and sets only `utterance.lang`, leaving the voice to the browser. Not every
 * voice is local: Chrome's "Google …" voices and Edge's "… Online (Natural)"
 * voices send the text to the vendor's cloud, and for a language like Dutch
 * Chrome will happily pick one. Item text is user content, and nothing a user
 * loads into the playground may leave the browser (see AGENTS.md, "Privacy").
 *
 * So `speechSynthesis.speak` is wrapped once, globally: every utterance gets a
 * voice with `localService === true` in its language, or it is not spoken at
 * all. A refused utterance fails the way a real synthesis error does, so the
 * player drops back to idle, and `LOCAL_SPEECH_UNAVAILABLE` tells the UI why.
 */

export const LOCAL_SPEECH_UNAVAILABLE = "local-speech-unavailable";

export type LocalSpeechUnavailableDetail = { lang: string };

export const speechSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const normalizeLang = (lang: string) => lang.trim().toLowerCase().replace(/_/g, "-");
const primaryLang = (lang: string) => normalizeLang(lang).split("-")[0];

/**
 * The local voice for a language: an exact match first (`nl-be` before
 * `nl-nl`), then the platform's default for the primary language, then the
 * language's home region (a bare `nl` reads as `nl-nl`, not `nl-be`), then any
 * voice in that language.
 */
export function pickLocalVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  const local = voices.filter((voice) => voice.localService);
  const wanted = normalizeLang(lang);
  const primary = primaryLang(lang);
  const samePrimary = local.filter((voice) => primaryLang(voice.lang) === primary);
  return (
    local.find((voice) => normalizeLang(voice.lang) === wanted) ??
    samePrimary.find((voice) => voice.default) ??
    samePrimary.find((voice) => normalizeLang(voice.lang) === `${primary}-${primary}`) ??
    samePrimary[0] ??
    null
  );
}

/**
 * Chrome fills the voice list asynchronously: the first `getVoices()` of a page
 * returns nothing. Wait for `voiceschanged`, but not forever -- a browser with
 * no voices installed may never fire it.
 */
function voicesReady(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const voices = synth.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  return new Promise((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      synth.removeEventListener("voiceschanged", done);
      resolve(synth.getVoices());
    };
    const timer = window.setTimeout(done, 1500);
    synth.addEventListener("voiceschanged", done);
  });
}

/** Fire the utterance's own error, which the player already handles. */
function failUtterance(utterance: SpeechSynthesisUtterance): void {
  let event: Event;
  try {
    event = new SpeechSynthesisErrorEvent("error", {
      utterance,
      error: "voice-unavailable",
    });
  } catch {
    // Not every browser exposes the constructor.
    event = new Event("error");
  }
  utterance.dispatchEvent(event);
}

let installed = false;

export function installLocalSpeechGuard(): void {
  if (installed || !speechSupported()) return;
  installed = true;

  const synth = window.speechSynthesis;
  const speak = synth.speak.bind(synth);
  const cancel = synth.cancel.bind(synth);

  // Choosing a voice can wait on `voiceschanged`. A cancel in the meantime
  // (stop, navigation, another player starting) must keep the utterance that
  // was waiting from being spoken after all.
  let generation = 0;
  synth.cancel = () => {
    generation += 1;
    cancel();
  };

  synth.speak = (utterance: SpeechSynthesisUtterance) => {
    const queuedAt = generation;
    void voicesReady(synth).then((voices) => {
      if (queuedAt !== generation) return;
      const lang =
        utterance.lang || document.documentElement.lang || navigator.language;
      const voice = utterance.voice?.localService
        ? utterance.voice
        : pickLocalVoice(voices, lang);
      if (!voice) {
        failUtterance(utterance);
        window.dispatchEvent(
          new CustomEvent<LocalSpeechUnavailableDetail>(LOCAL_SPEECH_UNAVAILABLE, {
            detail: { lang },
          }),
        );
        return;
      }
      utterance.voice = voice;
      // Some engines prefer the voice's own tag over a bare primary language.
      if (!utterance.lang) utterance.lang = voice.lang;
      speak(utterance);
    });
  };
}
