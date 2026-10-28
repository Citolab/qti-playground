/**
 * Whether this browser has had the coach's tour of the player (see
 * components/player-tour.tsx). A per-browser convenience, so storage may fail.
 */
const STORAGE_KEY = "qti-playground-tour-seen";

export function hasSeenPlayerTour(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Blocked storage: better to offer the tour again than to never show it.
    return false;
  }
}

export function markPlayerTourSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // The tour comes back next time; harmless.
  }
}
