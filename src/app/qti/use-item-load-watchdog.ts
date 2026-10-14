import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A navigation that never renders shows an empty page with a working toolbar:
 * qti-components only logs a failed item fetch. These bound the recovery --
 * long enough not to fire on a slow machine.
 */
const ITEM_LOAD_TIMEOUT_MS = 15000;
/** Vertical mode loads the whole test in one navigation. */
const VERTICAL_ITEM_LOAD_TIMEOUT_MS = 60000;
const ITEM_LOAD_AUTO_RETRIES = 1;

export interface ItemLoadFailure {
  type: "item" | "section";
  id: string;
}

type Navigable = HTMLElement & {
  navigateTo?: (type: "item" | "section", id?: string) => void;
};

/**
 * Catches navigations that never produce a rendered page.
 *
 * `cito-test-navigation-started` always fires; `cito-test-rendered` only when
 * the page actually rendered, and `cito-test-navigation-failed` when the runner
 * knows it did not. A navigation that fails, or is still unrendered after the
 * timeout, is retried once silently; after that the caller gets a failure to
 * show, with `retry` for the reader's own attempt.
 *
 * Adapted from cito-test-uit's `useItemLoadWatchdog`.
 */
export function useItemLoadWatchdog(
  testElement: Navigable | null,
  vertical: boolean,
): { failure: ItemLoadFailure | null; retry: () => void } {
  const [failure, setFailure] = useState<ItemLoadFailure | null>(null);
  const retriesRef = useRef(new Map<string, number>());

  const reissue = useCallback(
    (type: "item" | "section", id: string) => {
      testElement?.navigateTo?.(type, id);
    },
    [testElement],
  );

  useEffect(() => {
    if (!testElement) return;

    let timer = 0;
    let current: ItemLoadFailure | null = null;

    const giveUpOrRetry = () => {
      window.clearTimeout(timer);
      if (!current) return;
      const { type, id } = current;
      const key = `${type}:${id}`;
      const retries = retriesRef.current.get(key) ?? 0;
      if (retries < ITEM_LOAD_AUTO_RETRIES) {
        retriesRef.current.set(key, retries + 1);
        console.warn(`${type} ${id} did not load; retrying the navigation`);
        reissue(type, id);
        return;
      }
      setFailure({ type, id });
    };

    const onStarted = (event: Event) => {
      const detail = (event as CustomEvent<Partial<ItemLoadFailure>>).detail;
      if (!detail?.id || !detail.type) return;
      current = { type: detail.type, id: detail.id };
      setFailure(null);
      window.clearTimeout(timer);
      timer = window.setTimeout(
        giveUpOrRetry,
        vertical ? VERTICAL_ITEM_LOAD_TIMEOUT_MS : ITEM_LOAD_TIMEOUT_MS,
      );
    };
    const onRendered = () => {
      window.clearTimeout(timer);
      current = null;
      setFailure(null);
      retriesRef.current.clear();
    };

    testElement.addEventListener("cito-test-navigation-started", onStarted);
    testElement.addEventListener("cito-test-rendered", onRendered);
    testElement.addEventListener("cito-test-navigation-failed", giveUpOrRetry);
    return () => {
      window.clearTimeout(timer);
      testElement.removeEventListener("cito-test-navigation-started", onStarted);
      testElement.removeEventListener("cito-test-rendered", onRendered);
      testElement.removeEventListener(
        "cito-test-navigation-failed",
        giveUpOrRetry,
      );
    };
  }, [testElement, vertical, reissue]);

  const retry = useCallback(() => {
    if (!failure) return;
    // A fresh allowance, so the reader's retry is not refused on the spent count.
    retriesRef.current.delete(`${failure.type}:${failure.id}`);
    setFailure(null);
    reissue(failure.type, failure.id);
  }, [failure, reissue]);

  return { failure, retry };
}
