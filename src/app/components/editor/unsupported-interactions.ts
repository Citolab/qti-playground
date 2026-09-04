import { listInteractionDescriptors } from "@citolab/prose-qti/core/interactions/composer";

/**
 * Tags the editor knows how to represent — the same registry the Insert menu
 * is built from, so the two can never drift apart.
 */
const SUPPORTED_TAGS = new Set(
  listInteractionDescriptors().map((descriptor) =>
    descriptor.tagName.toLowerCase(),
  ),
);

/**
 * QTI interaction elements all end in `-interaction`, portable custom
 * interactions included. Anything outside the descriptor registry has no
 * ProseMirror node, so the importer silently drops it and an export would
 * write the item back without it — we refuse to open such an item instead.
 */
export function findUnsupportedInteractions(xml: string): string[] {
  if (!xml.trim()) return [];

  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return [];

  const unsupported = new Set<string>();
  for (const element of Array.from(doc.getElementsByTagName("*"))) {
    const tag = element.tagName.toLowerCase();
    if (!tag.endsWith("-interaction")) continue;
    if (SUPPORTED_TAGS.has(tag)) continue;
    unsupported.add(tag);
  }

  return Array.from(unsupported).sort();
}

/**
 * The /edit example menu filters on a hand-written copy of this registry (it
 * cannot import the registry itself without pulling the editor bundle into the
 * main chunk). This runs when the editor chunk loads and says so if the copy
 * has fallen behind the package.
 */
if (import.meta.env.DEV) {
  void import("../../pages/item-source").then(
    ({ EDITOR_SUPPORTED_INTERACTIONS }) => {
      const listed = new Set(EDITOR_SUPPORTED_INTERACTIONS);
      const missing = Array.from(SUPPORTED_TAGS).filter(
        (tag) => !listed.has(tag),
      );
      const stale = EDITOR_SUPPORTED_INTERACTIONS.filter(
        (tag) => !SUPPORTED_TAGS.has(tag),
      );
      if (missing.length || stale.length) {
        console.warn(
          "[editor] EDITOR_SUPPORTED_INTERACTIONS is out of date with @citolab/prose-qti.",
          { missingFromList: missing, noLongerSupported: stale },
        );
      }
    },
  );
}
