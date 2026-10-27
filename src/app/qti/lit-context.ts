/**
 * Follow a context that qti-components provides (`computedContext`,
 * `itemContext`, ...) from outside Lit, the way its own elements do.
 *
 * This is the community context protocol: a `context-request` event that
 * bubbles from `from` up to the nearest provider, which calls back with the
 * current value and again on every change. A provider ignores requests from its
 * own host, so `from` must be a *descendant* of the providing element.
 *
 * Returns the unsubscribe.
 */
import { ContextEvent, type Context } from "@lit/context";

export function subscribeToContext<T>(
  from: Element,
  context: Context<unknown, T>,
  onValue: (value: T) => void,
): () => void {
  let unsubscribe: (() => void) | undefined;
  let stopped = false;
  from.dispatchEvent(
    new ContextEvent(
      context,
      from,
      (value, unsub) => {
        if (stopped) {
          unsub?.();
          return;
        }
        unsubscribe = unsub;
        onValue(value);
      },
      true,
    ),
  );
  return () => {
    stopped = true;
    unsubscribe?.();
  };
}
