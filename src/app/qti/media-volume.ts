import { useEffect, useState } from "react";

/**
 * One volume for every `<audio>`/`<video>` the player renders.
 *
 * Media lives in <test-container>'s shadow root and is created and replaced by
 * the runner on every navigation, so the level is applied three ways: to what
 * is there now, to what gets added (MutationObserver), and on `play` -- which
 * also catches media an item builds or re-sets its volume on itself. `play`
 * does not bubble, hence the capture listener on the root.
 *
 * Media inside a PCI's iframe is out of reach; a PCI owns its own player.
 *
 * Returns whether the page currently holds any media, so the control can hide
 * when there is nothing to turn up or down.
 *
 * Adapted from cito-test-uit's AssessmentPlayerView volume handling.
 */
export function useMediaVolume(
  testContainer: HTMLElement | null,
  level: number,
): boolean {
  const [hasMedia, setHasMedia] = useState(false);

  useEffect(() => {
    const root = testContainer?.shadowRoot;
    if (!root) return;

    const apply = () => {
      const media = root.querySelectorAll<HTMLMediaElement>("audio, video");
      media.forEach((element) => {
        element.volume = level;
      });
      setHasMedia(media.length > 0);
    };
    const onPlay = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLMediaElement) target.volume = level;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener("play", onPlay, true);
    return () => {
      observer.disconnect();
      root.removeEventListener("play", onPlay, true);
    };
  }, [testContainer, level]);

  // No container (intro, overview) means no media, whatever was seen last.
  return testContainer ? hasMedia : false;
}

const STORAGE_KEY = "qti-playground-volume";

/** The last level the reader chose; a per-browser convenience, so storage may fail. */
export function readStoredVolume(): number {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (localStorage.getItem(STORAGE_KEY) !== null && Number.isFinite(stored)) {
      return Math.max(0, Math.min(1, stored));
    }
  } catch {
    // Private mode or blocked storage: start at full volume.
  }
  return 1;
}

export function storeVolume(level: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(level));
  } catch {
    // Not worth surfacing; the level still applies for this visit.
  }
}
