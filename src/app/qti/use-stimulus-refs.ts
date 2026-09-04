import { useEffect, useMemo, useState } from "react";
import { ItemInfoWithBlobRef } from "../store/store";
import { loadStimulusIdsByKey, sharedStimulusIds } from "./stimulus-refs";

export const itemKey = (item: ItemInfoWithBlobRef): string =>
  item.itemRefIdentifier || item.identifier;

export interface StimulusRefMap {
  /** Item key → the stimulus identifiers that item places, in document order. */
  stimulusIdsByItem: ReadonlyMap<string, string[]>;
  /** Item key → the one stimulus that decides its group, when it has one. */
  primaryStimulusByItem: ReadonlyMap<string, string>;
  /** Stimuli more than one item places — the ones worth a section of their own. */
  sharedIds: ReadonlySet<string>;
  /** True once the scan has finished (successfully or not). */
  ready: boolean;
}

const PENDING: StimulusRefMap = {
  stimulusIdsByItem: new Map(),
  primaryStimulusByItem: new Map(),
  sharedIds: new Set(),
  ready: false,
};

const NOTHING_TO_SCAN: StimulusRefMap = { ...PENDING, ready: true };

/**
 * Which shared stimulus each item of this assessment places.
 *
 * Read from the item XML rather than from the rendered DOM: the grouping
 * transform has to restructure the test document before the runner loads a
 * single item, and the overview has to know how many cards to draw before any
 * of them has rendered.
 */
export const useStimulusRefs = (
  items: ItemInfoWithBlobRef[],
): StimulusRefMap => {
  // The items array is rebuilt on every store read, so key the scan on what it
  // actually contains — otherwise it refetches on every render.
  const scanKey = useMemo(
    () => items.map((item) => `${itemKey(item)}::${item.href}`).join("|"),
    [items],
  );

  const [scan, setScan] = useState<{
    key: string;
    ids: ReadonlyMap<string, string[]>;
  } | null>(null);

  useEffect(() => {
    // No items to read means nothing to wait for; the result below says so
    // without a state write.
    if (items.length === 0) return;

    const controller = new AbortController();
    let cancelled = false;

    void (async () => {
      const ids = await loadStimulusIdsByKey(
        items.map((item) => ({ key: itemKey(item), href: item.href })),
        controller.signal,
      );
      if (!cancelled) setScan({ key: scanKey, ids });
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // `scanKey` stands in for `items`: same identifiers and hrefs, same scan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanKey]);

  return useMemo(() => {
    if (items.length === 0) return NOTHING_TO_SCAN;
    // A scan for a different item set is a stale answer, not a partial one.
    if (scan?.key !== scanKey) return PENDING;

    const primaryStimulusByItem = new Map<string, string>();
    scan.ids.forEach((ids, key) => {
      if (ids[0]) primaryStimulusByItem.set(key, ids[0]);
    });

    return {
      stimulusIdsByItem: scan.ids,
      primaryStimulusByItem,
      sharedIds: sharedStimulusIds(scan.ids),
      ready: true,
    };
  }, [items.length, scan, scanKey]);
};
