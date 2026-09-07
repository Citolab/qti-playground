import { listInteractionDescriptors } from "@citolab/prose-qti/core/interactions/composer";
import { EDITOR_SUPPORTED_INTERACTIONS } from "../../pages/item-source";

/**
 * One reason the editor refuses to open an item.
 *
 * `label` is the tag or attribute as it appears in the author's XML, so they can
 * find it; `detail` says what the editor would do to it, because "unsupported"
 * on its own reads as a missing feature rather than as data loss.
 */
export type UnsupportedItemFeature = {
  label: string;
  detail: string;
};

/**
 * The interactions the editor is allowed to open.
 *
 * A deliberate SUBSET of what @citolab/prose-qti registers: having a
 * ProseMirror node is not the same as round-tripping without loss, and the gate
 * is set to what has been checked end to end. `item-source.ts` owns the list
 * because the /edit example menu filters on it too, and it cannot import the
 * registry without pulling the editor bundle into the main chunk.
 *
 * `qti-rubric-block` is absent on purpose rather than by omission: it is not an
 * interaction, so the scan below never looks at it, and rubric blocks round-trip.
 */
const SUPPORTED_INTERACTION_TAGS = new Set(EDITOR_SUPPORTED_INTERACTIONS);

/**
 * Item content the exporter cannot write back.
 *
 * The exporter does not patch the source, it rebuilds the item from the
 * ProseMirror document: it emits the response declarations it derives from the
 * body, SCORE/MAXSCORE, and a scoring template -- and nothing else. So anything
 * here survives being opened but not being saved, which is worse than being
 * refused, because the author has no way to see what went missing.
 *
 * Scoring templates themselves are fine and deliberately absent from this list:
 * `<qti-response-processing template="...">` is exactly what the exporter emits.
 */
const UNSUPPORTED_ELEMENTS: readonly (readonly [tag: string, detail: string])[] =
  [
    // Feedback has no node in the schema, and the exporter declares no outcome
    // beyond SCORE/MAXSCORE for it to be driven by.
    ["qti-feedback-block", "feedback is dropped when the item is saved"],
    ["qti-feedback-inline", "feedback is dropped when the item is saved"],
    ["qti-modal-feedback", "feedback is dropped when the item is saved"],
    // Template processing: the exporter writes no template declarations, so the
    // item keeps its body but loses the variables the body refers to.
    [
      "qti-template-declaration",
      "the editor writes no template processing, so the item's variables are lost",
    ],
    [
      "qti-template-processing",
      "the editor writes no template processing, so the item's variables are lost",
    ],
    [
      "qti-template-constraint",
      "the editor writes no template processing, so the item's variables are lost",
    ],
    [
      "qti-printed-variable",
      "a printed variable has no editor node and is dropped from the body",
    ],
  ];

const DETAIL_BY_TAG = new Map(UNSUPPORTED_ELEMENTS);

/**
 * QTI interaction elements all end in `-interaction`, portable and legacy custom
 * interactions included, so the suffix catches interactions this build has never
 * heard of as well as the ones it knowingly leaves out.
 */
const isInteractionTag = (tag: string) => tag.endsWith("-interaction");

/**
 * Everything about `xml` that stops the editor from opening it, in the order an
 * author would want to read it: the interactions first, then the item-level
 * features. Empty means the item round-trips.
 *
 * An item that cannot be parsed is not reported here -- the editor's own import
 * fails on it and says so, which is the more accurate message.
 */
export function findUnsupportedItemFeatures(
  xml: string,
): UnsupportedItemFeature[] {
  if (!xml.trim()) return [];

  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return [];

  const interactions = new Map<string, UnsupportedItemFeature>();
  const features = new Map<string, UnsupportedItemFeature>();

  for (const element of Array.from(doc.getElementsByTagName("*"))) {
    // `localName`, not `tagName`: a prefixed document (`<qti:qti-choice-interaction>`)
    // would otherwise slip past every comparison below.
    const tag = element.localName.toLowerCase();

    if (isInteractionTag(tag)) {
      if (SUPPORTED_INTERACTION_TAGS.has(tag)) continue;
      interactions.set(tag, {
        label: tag,
        detail: "the editor cannot represent this interaction",
      });
      continue;
    }

    const detail = DETAIL_BY_TAG.get(tag);
    if (detail) features.set(tag, { label: tag, detail });
  }

  // The exporter hardcodes `adaptive="false"` on the item root, so an adaptive
  // item opens, looks right, and saves as a non-adaptive one.
  const root = doc.querySelector("qti-assessment-item");
  if (root?.getAttribute("adaptive")?.trim().toLowerCase() === "true") {
    features.set("adaptive", {
      label: 'adaptive="true"',
      detail: "the editor always saves items as non-adaptive",
    });
  }

  const byLabel = (left: UnsupportedItemFeature, right: UnsupportedItemFeature) =>
    left.label.localeCompare(right.label);

  return [
    ...Array.from(interactions.values()).sort(byLabel),
    ...Array.from(features.values()).sort(byLabel),
  ];
}

/**
 * The allowlist above is narrower than the registry on purpose, so a registered
 * interaction missing from it is not a defect. The reverse is: a tag we let
 * through that the package has no descriptor for imports as a hole in the item
 * and exports without it -- exactly what this gate exists to prevent.
 */
if (import.meta.env.DEV) {
  const registered = new Set(
    listInteractionDescriptors().map((descriptor) =>
      descriptor.tagName.toLowerCase(),
    ),
  );
  const unregistered = EDITOR_SUPPORTED_INTERACTIONS.filter(
    (tag) => !registered.has(tag),
  );
  if (unregistered.length > 0) {
    console.warn(
      "[editor] EDITOR_SUPPORTED_INTERACTIONS allows interactions @citolab/prose-qti does not register.",
      { unregistered },
    );
  }
}
