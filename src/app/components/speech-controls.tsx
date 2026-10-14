import { useEffect, useState } from "react";

import {
  LOCAL_SPEECH_UNAVAILABLE,
  type LocalSpeechUnavailableDetail,
  speechSupported,
} from "../local-speech";
import { SPEECH_LABELS } from "../qti/speech-player";

/**
 * The language read-aloud last refused to speak for want of a local voice, for
 * a few seconds. Any player can trigger it, including the booklet's own.
 */
function useMissingLocalVoice(): string | null {
  const [lang, setLang] = useState<string | null>(null);
  useEffect(() => {
    let timer = 0;
    const onUnavailable = (event: Event) => {
      setLang((event as CustomEvent<LocalSpeechUnavailableDetail>).detail.lang);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLang(null), 8000);
    };
    window.addEventListener(LOCAL_SPEECH_UNAVAILABLE, onUnavailable);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOCAL_SPEECH_UNAVAILABLE, onUnavailable);
    };
  }, []);
  return lang;
}

/**
 * Read-aloud for the current item. Must sit inside `<test-navigation>`: with no
 * item-ref or stimulus around it, `<test-item-to-speech>` follows the item the
 * runner is on.
 */
export function SpeechControls() {
  if (!speechSupported()) return null;
  return (
    <test-item-to-speech className="speech-controls flex items-center gap-1 bg-white rounded-full border border-gray-200 shadow-sm px-2 py-1">
      {/* Transport order: step back, play/stop in the middle, step forward;
          pick mode apart at the end. */}
      <test-tts-prev label={SPEECH_LABELS.prev} title={SPEECH_LABELS.prev} />
      <test-tts-play
        label={SPEECH_LABELS.play}
        pause-label={SPEECH_LABELS.pause}
        title={SPEECH_LABELS.play}
      />
      <test-tts-stop label={SPEECH_LABELS.stop} title={SPEECH_LABELS.stop} />
      <test-tts-next label={SPEECH_LABELS.next} title={SPEECH_LABELS.next} />
      <span aria-hidden className="mx-0.5 h-5 w-px bg-gray-200" />
      <test-tts-pick label={SPEECH_LABELS.pick} title={SPEECH_LABELS.pick} />
    </test-item-to-speech>
  );
}

/** Says why nothing was read, wherever the refused player was. */
export function MissingVoiceNotice() {
  const lang = useMissingLocalVoice();
  if (!lang) return null;
  return (
    <div
      role="status"
      className="absolute right-0 top-full z-30 mt-2 w-72 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow"
    >
      No offline voice is installed for “{lang}”. The playground only reads
      aloud with voices on this computer, so no text is sent anywhere. Add a
      voice for this language in your system’s speech settings.
    </div>
  );
}
