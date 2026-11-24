/** Stars for getting it right on this attempt: 3 first time, 2 second, 1 after that. */
export const starsForAttempt = (attempt: number) => Math.max(1, 4 - attempt);
