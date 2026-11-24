/**
 * Game mode for an assessment: picks the questions of a loaded package that the
 * game can present, and gets them ready to play.
 *
 * A question gets a jump stage when every interaction in it has a 3D variant
 * (interactions-3d.ts) and the item can score itself. An item with several
 * interactions is played one part at a time and scored at the end; for that the
 * item has to declare its MAXSCORE.
 *
 * Any other question that can score itself is played as a mini game in a dialog,
 * with the real interaction (classic-dialog.tsx): hottext, associate, a custom
 * interaction and so on. Only questions nothing can score are left out (an essay,
 * an upload) and counted, so the game can say so.
 *
 * Nothing leaves the browser: the items come from the package cache the player
 * itself reads from.
 */
import { createItemAssetResolver, mapItemAssetUrls } from "../qti/asset-urls";
import type { ItemInfoWithBlobRef } from "../store/store";
import { bodyHtml } from "./arena";
import { ARENA_TAGS } from "./interactions-3d";
import type { QuestItem } from "./items";
import { MAX_QUESTIONS } from "./world";

export interface AssessmentQuestions {
  items: QuestItem[];
  /** Questions the game cannot present. */
  skipped: number;
  /** Playable questions that did not fit in the world. */
  leftOut: number;
}

const fetchText = async (href: string) => {
  const response = await fetch(href);
  if (!response.ok) throw new Error(`Could not read ${href} (${response.status})`);
  return response.text();
};

/** Item markup with its picture, stylesheet and stimulus paths made absolute. */
const withResolvedAssets = (xml: string, href: string) => {
  const resolve = createItemAssetResolver(href);
  return resolve ? mapItemAssetUrls(xml, resolve) : xml;
};

const PICTURE_TAGS = ["qti-hotspot-interaction", "qti-select-point-interaction", "qti-graphic-gap-match-interaction"];

/**
 * A gap match is carried by hand, one piece at a time. With more pieces or gaps
 * than this the arena would be a crowd of tiny pads, and the real interaction
 * (the mini game) serves the question better.
 */
const MAX_CARRIED = 8;
const MAX_GAPS = 8;
const CARRY_TAGS = ["qti-gap-match-interaction", "qti-graphic-gap-match-interaction"];
const carryFits = (el: Element) =>
  el.querySelectorAll("qti-gap-text, qti-gap-img").length <= MAX_CARRIED &&
  el.querySelectorAll("qti-gap, qti-associable-hotspot").length <= MAX_GAPS;

const interactionsOf = (doc: Document) =>
  Array.from(doc.getElementsByTagName("*")).filter((el) => el.localName.endsWith("-interaction"));

const isPlayable = (doc: Document) => {
  const interactions = interactionsOf(doc);
  if (!interactions.length || !interactions.every((el) => ARENA_TAGS.includes(el.localName))) return false;
  if (!doc.getElementsByTagName("qti-response-processing").length) return false;
  const declarations = Array.from(doc.getElementsByTagName("qti-response-declaration"));
  const responseIds = interactions.map((el) => el.getAttribute("response-identifier") ?? "");
  if (new Set(responseIds).size !== responseIds.length) return false;
  const answerable = responseIds.every((responseId) => {
    const declaration = declarations.find((d) => d.getAttribute("identifier") === responseId);
    return (
      !!declaration &&
      (declaration.getElementsByTagName("qti-correct-response").length > 0 ||
        declaration.getElementsByTagName("qti-mapping").length > 0 ||
        declaration.getElementsByTagName("qti-area-mapping").length > 0)
    );
  });
  if (!answerable) return false;
  // A picture interaction is laid out on the floor by its pixel grid, so the picture must state its size.
  const pictured = interactions.filter((el) => PICTURE_TAGS.includes(el.localName));
  const sized = pictured.every((el) => {
    const image = el.getElementsByTagName("img")[0] ?? el.getElementsByTagName("object")[0];
    return !!image && Number(image.getAttribute("width")) > 0 && Number(image.getAttribute("height")) > 0;
  });
  if (!sized) return false;
  if (!interactions.filter((el) => CARRY_TAGS.includes(el.localName)).every(carryFits)) return false;
  // With several parts, "all right" is only knowable when the item says what its full score is.
  if (interactions.length === 1) return true;
  const maxScore = Array.from(doc.getElementsByTagName("qti-outcome-declaration")).find(
    (d) => d.getAttribute("identifier") === "MAXSCORE",
  );
  return Number(maxScore?.getElementsByTagName("qti-value")[0]?.textContent) > 0;
};

/** The item's stylesheets, as far as they come out of the package itself. */
const sameOriginStylesheets = (doc: Document) =>
  Array.from(doc.getElementsByTagName("qti-stylesheet"))
    .map((sheet) => sheet.getAttribute("href") ?? "")
    .filter((href) => {
      try {
        return !!href && new URL(href, window.location.href).origin === window.location.origin;
      } catch {
        return false;
      }
    });

/** Interactions a machine cannot score: an item with one of these can never be "all right". */
const UNSCORABLE = ["qti-extended-text-interaction", "qti-upload-interaction", "qti-drawing-interaction"];

/**
 * Interactions that render in the dialog but cannot be answered there yet. The
 * older custom interaction (`qti-custom-interaction`, CES) shows up and reacts
 * to clicks, but its response never reaches the item -- in the normal player
 * as well, with the 2025 vmbo exam's "oog" item. A question nobody can answer
 * would lock the final challenge, so it stays out until that works.
 */
const UNANSWERABLE = ["qti-custom-interaction"];

/** Can the real item be played in a dialog and scored? */
const isDialogPlayable = (doc: Document) => {
  const interactions = interactionsOf(doc);
  if (!interactions.length || interactions.some((el) => UNSCORABLE.includes(el.localName) || UNANSWERABLE.includes(el.localName)))
    return false;
  const processing = doc.getElementsByTagName("qti-response-processing")[0];
  if (!processing) return false;
  const declared = Array.from(doc.getElementsByTagName("qti-response-declaration")).some(
    (d) =>
      d.getElementsByTagName("qti-correct-response").length > 0 ||
      d.getElementsByTagName("qti-mapping").length > 0 ||
      d.getElementsByTagName("qti-area-mapping").length > 0,
  );
  // Rules written out in the item (as a custom interaction's often are) can score without a declared answer.
  return declared || processing.getElementsByTagName("*").length > 0;
};

/**
 * The full score of an item that does not declare MAXSCORE, as far as its
 * declarations tell: a mapping's upper bound or the sum of its positive values,
 * and 1 for a plain correct response. Undefined when the item declares its own.
 */
const fullScoreOf = (doc: Document): number | undefined => {
  const declaredMax = Array.from(doc.getElementsByTagName("qti-outcome-declaration")).find(
    (d) => d.getAttribute("identifier") === "MAXSCORE",
  );
  if (Number(declaredMax?.getElementsByTagName("qti-value")[0]?.textContent) > 0) return undefined;
  let total = 0;
  for (const declaration of Array.from(doc.getElementsByTagName("qti-response-declaration"))) {
    const mapping = declaration.getElementsByTagName("qti-mapping")[0] ?? declaration.getElementsByTagName("qti-area-mapping")[0];
    if (mapping) {
      const upper = Number(mapping.getAttribute("upper-bound"));
      const sum = Array.from(mapping.getElementsByTagName("*")).reduce(
        (n, entry) => n + Math.max(0, Number(entry.getAttribute("mapped-value")) || 0),
        0,
      );
      total += upper > 0 ? upper : sum;
    } else if (declaration.getElementsByTagName("qti-correct-response").length) total += 1;
  }
  return total > 0 ? total : 1;
};

/** Marks a title that still needs its question number. */
const CODE_TITLE = "\u0000";

/**
 * A title a child can read. Item banks often title an item with its code
 * ("32eudr"); such an item is named after its place in the test instead, with
 * the heading of its text when it has one ("Question 5 · Bananen").
 */
function readableTitle(doc: Document, info: ItemInfoWithBlobRef): string {
  const title = (doc.documentElement.getAttribute("title") || info.title || "").trim();
  const codes = [info.identifier, doc.documentElement.getAttribute("identifier"), doc.documentElement.getAttribute("label")]
    .filter((code): code is string => !!code)
    .map((code) => code.toLowerCase());
  const looksLikeCode = !title || !/\s/.test(title) && codes.some((code) => code === title.toLowerCase() || code.endsWith(title.toLowerCase()));
  if (!looksLikeCode) return title;
  // A paragraph that is nothing but bold text is a heading.
  const heading = Array.from(doc.getElementsByTagName("p"))
    .map((p) => (p.children.length === 1 && ["strong", "b"].includes(p.children[0].localName) ? (p.textContent ?? "").trim() : ""))
    .find((text) => text.length > 0 && text.length <= 40 && !/[?.:]$/.test(text));
  return `${CODE_TITLE}${heading ?? ""}`;
}

async function loadStimulus(doc: Document): Promise<QuestItem["stimulus"]> {
  const ref = doc.getElementsByTagName("qti-assessment-stimulus-ref")[0];
  const href = ref?.getAttribute("href");
  if (!ref || !href) return undefined;
  try {
    const xml = withResolvedAssets(await fetchText(href), href);
    const stimulus = new DOMParser().parseFromString(xml, "application/xml");
    const title =
      ref.getAttribute("title") || stimulus.documentElement.getAttribute("title") || "The text for this question";
    const html = bodyHtml(xml, "qti-stimulus-body");
    return html ? { title, html } : undefined;
  } catch (error) {
    console.warn("Could not load the shared text of a question:", error);
    return undefined;
  }
}

export async function loadAssessmentQuestions(list: ItemInfoWithBlobRef[]): Promise<AssessmentQuestions> {
  // Whether an item is a question is read from the item itself: a page without an
  // interaction (an intro, a text) is not one, and is not counted as left out.
  let questions = 0;
  // Numbered in test order, counting every question, so "Question 7" is the test's seventh.
  const numbers = new Map<ItemInfoWithBlobRef, number>();
  const loaded = await Promise.all(
    list.map(async (info): Promise<QuestItem | null> => {
      try {
        const xml = withResolvedAssets(await fetchText(info.href), info.href);
        const doc = new DOMParser().parseFromString(xml, "application/xml");
        if (doc.getElementsByTagName("parsererror").length) return null;
        if (interactionsOf(doc).length > 0) {
          questions += 1;
          numbers.set(info, 0);
        }
        const staged = isPlayable(doc);
        if (!staged && !isDialogPlayable(doc)) return null;
        return {
          id: info.itemRefIdentifier || info.identifier,
          // Filled in below, once every question has its number.
          title: readableTitle(doc, info),
          stimulus: await loadStimulus(doc),
          // By the text's own address, so the questions stay together even when the text could not be loaded.
          group: doc.getElementsByTagName("qti-assessment-stimulus-ref")[0]?.getAttribute("href") || undefined,
          stylesheets: sameOriginStylesheets(doc),
          dialog: !staged,
          href: info.href,
          maxScore: fullScoreOf(doc),
          xml,
        };
      } catch (error) {
        console.warn(`Could not prepare "${info.identifier}" for the game:`, error);
        return null;
      }
    }),
  );
  let n = 0;
  for (const info of list) if (numbers.has(info)) numbers.set(info, (n += 1));
  loaded.forEach((item, i) => {
    // An item named after its own code gets its place in the test as a name.
    if (item && item.title.startsWith(CODE_TITLE)) {
      const subject = item.title.slice(CODE_TITLE.length);
      item.title = `Question ${numbers.get(list[i]) ?? i + 1}${subject ? ` · ${subject}` : ""}`;
    }
  });
  const playable = loaded.filter((item): item is QuestItem => item !== null);
  return {
    items: playable.slice(0, MAX_QUESTIONS),
    skipped: questions - playable.length,
    leftOut: Math.max(0, playable.length - MAX_QUESTIONS),
  };
}
