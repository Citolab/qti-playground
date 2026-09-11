import { listInteractionDescriptors } from "@citolab/prose-qti/core/interactions/composer";
import {
  EDITOR_SUPPORTED_BLOCKS,
  EDITOR_SUPPORTED_INTERACTIONS,
} from "../../pages/item-source";

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
 * Response processing is absent from this list because a tag scan is the wrong
 * shape for it: whether an item's scoring survives depends on which rules it is
 * built from, not on any single tag being present. `findUnrepresentableScoring`
 * below answers that question separately.
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
 * SCORING THE EDITOR CANNOT WRITE BACK.
 *
 * The exporter holds three scoring models -- `match_correct`, `map_response`,
 * `map_response_point` -- while QTI expresses scoring as a general-purpose
 * program. Anything outside those three is dropped on save, and dropped
 * *silently*: the item imports looking perfectly right, exports as a complete
 * `<qti-assessment-item>`, and is worth different marks than the one the author
 * opened. That is the worst failure this module exists to prevent, and a tag
 * scan cannot find it -- there is no one tag whose presence means "lost
 * scoring".
 *
 * The rules below mirror @citolab/prose-qti's own importer
 * (`qti3-item-import/_shared/response-processing.ts`), which is the authority on
 * what the exporter can round-trip. They are duplicated rather than imported
 * because the package keeps that module under `_shared` with no export key, so
 * it is unreachable from here. Kept deliberately in step with it: if the
 * importer learns a fourth model, this list is what has to follow.
 *
 * Silence is the expected result. An item scored by one of the three standard
 * models -- by template reference or written out inline -- reports nothing, and
 * that matters: a notice that fires on every import teaches the author to
 * dismiss it, and the next one, about real loss, goes with it.
 */
const SCORING_TEMPLATES = new Set([
  "match_correct",
  "map_response",
  "map_response_point",
]);

/**
 * `SCORE`/`MAXSCORE` are the outcomes the exporter declares itself, so a
 * reference to one is structure (the running total in an accumulating rule),
 * never the response a rule is scoring.
 */
const RESERVED_OUTCOMES = new Set(["SCORE", "MAXSCORE"]);

const localTag = (element: Element) => element.localName.toLowerCase();

const childElements = (element: Element) => Array.from(element.children);

/**
 * `localName`-based lookups throughout, where the package matches on `tagName`.
 * Same reason the tag scan above does it: a prefixed document
 * (`<qti:qti-match>`) would slip past a `tagName` comparison and be read as
 * unrecognised scoring, which would fire this warning on an item that is
 * actually fine.
 */
const hasDescendant = (element: Element, tag: string) =>
  Array.from(element.getElementsByTagName("*")).some(
    (candidate) => localTag(candidate) === tag,
  );

const descendants = (element: Element, tag: string) =>
  Array.from(element.getElementsByTagName("*")).filter(
    (candidate) => localTag(candidate) === tag,
  );

/**
 * Reduce a template URI to its bare name the way the runtime does: last `/`
 * segment, `.xml` suffix stripped. So `.../rptemplates/map_response_point.xml`
 * and `.../rptemplates/map_response_point` are one template, and a host serving
 * the standard templates from its own URL still matches.
 */
function normalizeTemplateUri(uri: string): string {
  const lastSegment = uri.trim().split("/").pop() ?? "";
  return lastSegment.replace(/\.xml$/, "");
}

/**
 * Whether a SCORE expression is one the exporter can rebuild.
 *
 * Recursive because of `qti-sum`: the accumulating shape is a sum of the running
 * SCORE variable and one contribution per response.
 */
function isRepresentableScoreExpression(expression: Element): boolean {
  const tag = localTag(expression);

  if (tag === "qti-map-response" || tag === "qti-map-response-point") {
    return expression.hasAttribute("identifier");
  }

  if (tag === "qti-sum") {
    let recognizedAny = false;
    for (const operand of childElements(expression)) {
      // The running total, not a contribution.
      if (
        localTag(operand) === "qti-variable" &&
        RESERVED_OUTCOMES.has(operand.getAttribute("identifier") ?? "")
      ) {
        recognizedAny = true;
        continue;
      }
      if (!isRepresentableScoreExpression(operand)) return false;
      recognizedAny = true;
    }
    return recognizedAny;
  }

  // A bare literal: `0` is the SCORE initialisation every corpus item opens
  // with, and a positive literal is a flat award.
  return tag === "qti-base-value";
}

/** The response a condition is about, or null if it names none. */
function conditionResponseIdentifier(condition: Element): string | null {
  for (const correct of descendants(condition, "qti-correct")) {
    const identifier = correct.getAttribute("identifier");
    if (identifier) return identifier;
  }
  for (const variable of descendants(condition, "qti-variable")) {
    const identifier = variable.getAttribute("identifier");
    if (identifier && !RESERVED_OUTCOMES.has(identifier)) return identifier;
  }
  return null;
}

/** Whether one top-level response-processing rule round-trips. */
function isRepresentableRule(rule: Element): boolean {
  const tag = localTag(rule);

  if (tag === "qti-set-outcome-value") {
    // A rule driving any other outcome -- FEEDBACK, a custom RAW_SCORE -- has
    // nothing to map onto, because the exporter declares only SCORE/MAXSCORE.
    if (rule.getAttribute("identifier") !== "SCORE") return false;
    const expression = rule.firstElementChild;
    return expression != null && isRepresentableScoreExpression(expression);
  }

  if (tag === "qti-response-condition") {
    // `match_correct` in longhand. Without a response to attach it to, or
    // without the `qti-match` that makes it all-or-nothing, it is some other
    // program -- a `qti-member` test against one specific pair, say.
    return (
      conditionResponseIdentifier(rule) != null &&
      hasDescendant(rule, "qti-match")
    );
  }

  return false;
}

/**
 * Everything about the item's scoring that will not survive a save.
 *
 * Reported per distinct rule tag rather than per occurrence: sixteen
 * `qti-response-condition` rules the exporter cannot write are one piece of news
 * to the author, and the fix is the same for all of them.
 */
function findUnrepresentableScoring(doc: Document): UnsupportedItemFeature[] {
  const processing = Array.from(
    doc.getElementsByTagName("*"),
  ).find((element) => localTag(element) === "qti-response-processing");

  // No response processing at all is not a gap: the exporter derives scoring
  // from the body and emits a template, which is a complete item.
  if (!processing) return [];

  const template = processing.getAttribute("template")?.trim();
  if (template) {
    // A template attribute wins outright and any inline rules alongside it are
    // dead code -- the runtime replaces its own children when it sees one -- so
    // there is nothing else to look at.
    const name = normalizeTemplateUri(template);
    if (SCORING_TEMPLATES.has(name)) return [];
    return [
      {
        label: `template="${name}"`,
        detail:
          "the editor can only save the match_correct, map_response and map_response_point templates, so this item's scoring is lost",
      },
    ];
  }

  const unrepresentable = new Map<string, UnsupportedItemFeature>();
  for (const rule of childElements(processing)) {
    if (isRepresentableRule(rule)) continue;
    const tag = localTag(rule);
    unrepresentable.set(tag, {
      label: tag,
      detail:
        "the editor cannot represent this scoring rule, so the item's scoring is lost when it is saved",
    });
  }
  return Array.from(unrepresentable.values());
}

/**
 * QTI interaction elements all end in `-interaction`, portable and legacy custom
 * interactions included, so the suffix catches interactions this build has never
 * heard of as well as the ones it knowingly leaves out.
 */
const isInteractionTag = (tag: string) => tag.endsWith("-interaction");

/**
 * Everything about `xml` that stops the editor from opening it, in the order an
 * author would want to read it: the interactions first, then the item-level
 * features -- unsupported elements, scoring the exporter cannot write back, and
 * adaptivity. Empty means the item round-trips.
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

  // Scoring is structural, not a tag: see `findUnrepresentableScoring`.
  for (const feature of findUnrepresentableScoring(doc)) {
    features.set(feature.label, feature);
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
 * The allowlists are narrower than the registry on purpose, so a registered
 * interaction missing from them is not a defect. The reverse is: a tag we allow
 * that the package has no descriptor for. For an interaction that means letting
 * an item through that imports as a hole and exports without it -- exactly what
 * this gate exists to prevent; for a block it means an Insert menu entry that
 * silently never appears.
 */
if (import.meta.env.DEV) {
  const registered = new Set(
    listInteractionDescriptors().map((descriptor) =>
      descriptor.tagName.toLowerCase(),
    ),
  );
  const unregistered = [
    ...EDITOR_SUPPORTED_INTERACTIONS,
    ...EDITOR_SUPPORTED_BLOCKS,
  ].filter((tag) => !registered.has(tag));
  if (unregistered.length > 0) {
    console.warn(
      "[editor] the editor allows tags @citolab/prose-qti does not register.",
      { unregistered },
    );
  }
}
