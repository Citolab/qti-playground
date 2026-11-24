/**
 * The rules of the answer arena. A 3D interaction component (interactions-3d.ts)
 * describes itself as an `ArenaSpec`; this module lays out the pads for it and
 * works out what a jump means. The arena is only another way to fill in the
 * response; the item's own response processing still decides whether it is right.
 *
 *   choice / inline choice → jump on the answer
 *   choice (several)       → jump on every right answer, then on ✔
 *   text entry             → hop the digits (or letters) like hopscotch, then ✔
 *   order                  → jump on them from first to last, then ✔
 *   match                  → jump on one, then on its partner, then ✔
 *   match as a table       → the table lies on the floor: jump on a box in each row, then ✔
 *   slider                 → walk along the number line and jump on the spot
 *   hotspot                → the picture lies on the floor: jump on the right spot
 *   select point           → the same, and where you land is the point you mark
 *   gap match              → carry: jump on a word to pick it up, jump on a gap to put it in, then ✔
 *   graphic gap match      → the same, and the gaps are places on the picture on the floor
 */
import type { PadView } from "./types";

export type ArenaKind = "choice" | "entry" | "order" | "match" | "slider" | "hotspot" | "point" | "gap";

/** The picture of a hotspot or select-point interaction. Sizes are in the picture's own pixels, as its coords are. */
export interface Picture {
  src: string;
  width: number;
  height: number;
  /**
   * Graphic gap match: how many things to carry stand beside the picture. The
   * picture then leaves room for them: a row behind it, or a list above it on
   * an upright screen.
   */
  shelf?: number;
}

/** A hotspot: a QTI shape with its coords, in picture pixels. */
export interface Area {
  id: string;
  shape: string;
  coords: number[];
}

export interface Choice {
  id: string;
  /** The choice as plain text. */
  label: string;
  /** The choice as safe HTML, when it holds more than text: a picture or a formula. */
  html?: string;
  /** Match: in how many pairs this choice may take part; 0 means as many as you like. Left out means once. */
  matchMax?: number;
  /** Graphic gap match: the picture you carry, drawn on the floor picture where you put it down. */
  image?: string;
  /** A gap: a few words on either side of it, with `GAP_MARK` where the gap is. */
  context?: string;
}

/** Stands for the gap itself in a gap's `context`. */
export const GAP_MARK = "___";

export interface ArenaSpec {
  kind: ArenaKind;
  responseId: string;
  /** Choice with more than one answer. */
  multiple: boolean;
  choices: Choice[];
  /**
   * The second set of a match interaction. For a gap match: the gaps, numbered
   * in reading order; with a picture they are its hotspots (`areas`).
   */
  targets: Choice[];
  /**
   * Match shown as a table: the first set are the rows, the second the columns,
   * and an answer is a ticked box. For a match the author marked as tabular, or
   * one whose columns are used more than once (true/false, yes/no).
   */
  tabular: boolean;
  min: number;
  max: number;
  step: number;
  /** Text entry: the characters there are pads for, and how many may be entered. */
  keys: string[];
  maxLength: number;
  /**
   * Text entry: the answers the item declares (correct response and mapping
   * keys). The pads have no shift key, so an answer that differs from one of
   * these only in capitals is handed over the way the item spells it.
   */
  accepted: string[];
  /** Hotspot and select point: the picture that is laid out on the floor, and its hotspots. */
  picture: Picture | null;
  areas: Area[];
  /** Hotspot and select point: how many may be chosen; 0 means as many as you like. */
  maxChoices: number;
  /** The declared correct response; used only for "show answer". */
  correct: string[];
}

export interface Pad {
  id: string;
  /** `cell` is a box in a match table; `label` is only a sign (a row or column heading), not something to jump on. */
  role: "choice" | "target" | "key" | "back" | "check" | "cell" | "label";
  /** A cell: the row and column it ticks. A row label: the row it names. */
  pair?: [string, string];
  row?: string;
  /** Where a label hangs: above its spot (a column heading) or to the left of it (a row heading). */
  anchor?: "above" | "left";
  /**
   * Portrait: the pad's own label sits beside it instead of behind it, on this
   * side, and may be `span` arena units wide. Answers then read as a list.
   * Without a side, `span` is how wide the label behind the pad may be.
   */
  side?: "left" | "right";
  span?: number;
  /** Portrait: how deep the pad's row is, in arena units. A picture label is shrunk to fit it. */
  high?: number;
  x: number;
  z: number;
  size: number;
  label: string;
  html?: string;
  /** Labelled by an HTML label floating over the scene instead of a painted sign. */
  overlay: boolean;
}

export interface Answer {
  picked: string[];
  /** What was hopped on a text entry's pads so far. */
  digits: string;
  pairs: [string, string][];
  /** Match: the one jumped on first, waiting for its partner. Gap match: what the hero carries. */
  pending: string | null;
  value: number | null;
  /** Select point: the points marked, in picture pixels. */
  points: [number, number][];
  eliminated: string[];
}

export const emptyAnswer = (): Answer => ({
  picked: [],
  digits: "",
  pairs: [],
  pending: null,
  value: null,
  points: [],
  eliminated: [],
});

/**
 * The playing field, in arena units. On a wide screen it is wide and shallow;
 * on a phone held upright it is narrow and deep, and everything is laid out to
 * suit: answers as a list, a keypad, a number line that runs up the screen.
 * The hero starts at `spawn`.
 */
export interface Field {
  portrait: boolean;
  halfW: number;
  halfD: number;
  spawn: [number, number];
}

export const fieldFor = (portrait: boolean): Field =>
  portrait
    ? // The start is in the middle: the bottom corners are under the thumb-stick and the Jump button.
      { portrait: true, halfW: 5.6, halfD: 9.4, spawn: [0, 6.5] }
    : { portrait: false, halfW: 9.2, halfD: 6.2, spawn: [0, 4.4] };

export const PAIR_COLORS = ["#f43f5e", "#3b82f6", "#f59e0b", "#a855f7", "#14b8a6"];

/** An empty gap: a dark slot, so it reads as a hole to fill. */
export const GAP_EMPTY = "#64748b";

/**
 * The number line of a slider: which way it runs, from where to where, where
 * it lies across, and half its width. Upright, the lowest value is nearest and
 * you walk forward to go up.
 */
export const runwayOf = (field: Field) =>
  field.portrait
    ? { axis: "z" as const, from: 6.4, to: -8.2, cross: 1.4, half: 1.2 }
    : { axis: "x" as const, from: -7.5, to: 7.5, cross: -1.4, half: 1.1 };

/** The floor rectangle a picture covers, and how many arena units one of its pixels is. */
export function pictureFrame(picture: Picture, field: Field) {
  const shelf = picture.shelf ?? 0;
  let box = field.portrait ? { cx: 0, cz: -1.7, maxW: 10.4, maxD: 12.4 } : { cx: 0, cz: -1.3, maxW: 15, maxD: 8 };
  if (shelf > 0 && field.portrait) {
    // Under the list of things to carry, down to where the hero starts.
    const top = PORTRAIT_TOP + shelfDepth(shelf) + 0.6;
    box = { cx: 0, cz: (top + 4.6) / 2, maxW: 10.4, maxD: 4.6 - top };
  } else if (shelf > 0) {
    // In front of the row of things to carry.
    box = { cx: 0, cz: 0.9, maxW: 13, maxD: 6.2 };
  }
  const scale = Math.min(box.maxW / picture.width, box.maxD / picture.height);
  const w = picture.width * scale;
  const d = picture.height * scale;
  return { scale, w, d, x0: box.cx - w / 2, z0: box.cz - d / 2, cx: box.cx, cz: box.cz };
}

/** The box around a hotspot, in picture pixels: [left, top, right, bottom]. */
export function areaBox(area: Area, picture: Picture): [number, number, number, number] {
  const c = area.coords;
  if (area.shape === "circle" && c.length >= 3) return [c[0] - c[2], c[1] - c[2], c[0] + c[2], c[1] + c[2]];
  if (area.shape === "ellipse" && c.length >= 4) return [c[0] - c[2], c[1] - c[3], c[0] + c[2], c[1] + c[3]];
  if (area.shape === "rect" && c.length >= 4)
    return [Math.min(c[0], c[2]), Math.min(c[1], c[3]), Math.max(c[0], c[2]), Math.max(c[1], c[3])];
  if (area.shape === "poly" && c.length >= 6) {
    const xs = c.filter((_, i) => i % 2 === 0);
    const ys = c.filter((_, i) => i % 2 === 1);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  return [0, 0, picture.width, picture.height];
}

/** A spot on the floor as a picture pixel, or null when it is off the picture. */
export function toPicture(picture: Picture, field: Field, x: number, z: number): [number, number] | null {
  const f = pictureFrame(picture, field);
  const u = (x - f.x0) / f.scale;
  const v = (z - f.z0) / f.scale;
  return u < 0 || v < 0 || u > picture.width || v > picture.height ? null : [u, v];
}

export function fromPicture(picture: Picture, field: Field, u: number, v: number): [number, number] {
  const f = pictureFrame(picture, field);
  return [f.x0 + u * f.scale, f.z0 + v * f.scale];
}

/** How far a pixel is outside a hotspot; 0 when it is inside. */
function distanceToArea(area: Area, u: number, v: number): number {
  const c = area.coords;
  switch (area.shape) {
    case "circle":
      return Math.max(0, Math.hypot(u - c[0], v - c[1]) - c[2]);
    case "ellipse": {
      const n = Math.hypot((u - c[0]) / (c[2] || 1), (v - c[1]) / (c[3] || 1));
      return n <= 1 ? 0 : (n - 1) * Math.min(c[2], c[3]);
    }
    case "rect": {
      const dx = Math.max(Math.min(c[0], c[2]) - u, 0, u - Math.max(c[0], c[2]));
      const dy = Math.max(Math.min(c[1], c[3]) - v, 0, v - Math.max(c[1], c[3]));
      return Math.hypot(dx, dy);
    }
    case "poly": {
      let inside = false;
      let nearest = Infinity;
      for (let i = 0, j = c.length - 2; i + 1 < c.length; j = i, i += 2) {
        const [xi, yi, xj, yj] = [c[i], c[i + 1], c[j], c[j + 1]];
        if (yi > v !== yj > v && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi) inside = !inside;
        const len = (xj - xi) ** 2 + (yj - yi) ** 2 || 1;
        const t = Math.min(1, Math.max(0, ((u - xi) * (xj - xi) + (v - yi) * (yj - yi)) / len));
        nearest = Math.min(nearest, Math.hypot(u - (xi + t * (xj - xi)), v - (yi + t * (yj - yi))));
      }
      return inside ? 0 : nearest;
    }
    default:
      // "default" covers the whole picture.
      return 0;
  }
}

/**
 * The hotspot at a pixel. A near miss still counts (`slack` pixels): a hero is
 * not a mouse pointer, and small hotspots would be unfair to land on.
 */
export function areaAt(areas: Area[], u: number, v: number, slack = 0): Area | null {
  let best: Area | null = null;
  let bestDistance = Infinity;
  for (const area of areas) {
    const distance = distanceToArea(area, u, v);
    if (distance <= slack && distance < bestDistance) {
      best = area;
      bestDistance = distance;
    }
  }
  return best;
}

/** How far off a jump may be and still count for a hotspot, in arena units. */
export const HOTSPOT_SLACK = 0.3;

export const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
export const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const cn = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

const row = (n: number, spacing: number) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * spacing);

/** Text that is too long for a painted sign reads better as an HTML label. */
const LONG_LABEL = 22;

const choicePad = (choice: Choice, role: Pad["role"], x: number, z: number, size: number): Pad => ({
  id: choice.id,
  role,
  x,
  z,
  size,
  label: choice.label,
  html: choice.html,
  overlay: !!choice.html || choice.label.length > LONG_LABEL,
});

/** A pad whose label sits beside it, for the list layouts of an upright screen. */
const listPad = (choice: Choice, role: Pad["role"], x: number, row: { z: number; h: number }, size: number, field: Field): Pad => ({
  ...choicePad(choice, role, x, row.z, size),
  overlay: true,
  side: "right",
  span: field.halfW - 0.25 - (x + size / 2 + 0.35),
  high: row.h,
});

/** Where the pads of an upright field go: from here, this deep, above the controls in the bottom corners. */
const PORTRAIT_TOP = -8.3;
const PORTRAIT_DEEP = 12.4;

/** Upright, a graphic gap match lists what there is to carry above its picture: a row each, this deep. */
const SHELF_ROW = 1.35;
const SHELF_MAX = 5;
function shelfDepth(count: number) {
  return Math.min(count, SHELF_MAX) * SHELF_ROW;
}

/**
 * How deep a list row has to be for its label, in arena units. Text is counted
 * in lines of about 32 characters, which is what fits beside a pad on a phone.
 */
const rowNeed = (choice: Choice, perLine = 32) =>
  choice.html?.includes("<img") ? 2.3 : choice.html ? 1.5 : 0.42 + 0.68 * Math.max(1, Math.ceil(choice.label.length / perLine));

/**
 * Stacks one or more lists under each other, each row as deep as its label
 * needs. With room to spare the rows grow; `overflow` says the labels need
 * more room than there is.
 */
function stackRows(groups: Choice[][], gap: number, perLine = 32, skip = 0) {
  const needs = groups.map((group) => group.map((choice) => Math.max(1.2, rowNeed(choice, perLine))));
  const room = PORTRAIT_DEEP - skip - gap * (groups.length - 1);
  const total = needs.flat().reduce((sum, n) => sum + n, 0) || 1;
  const stretch = Math.min(1.9, room / total);
  let z = PORTRAIT_TOP + skip + 0.3;
  const rows = needs.map((group) => {
    const placed = group.map((need) => {
      const h = need * stretch;
      const row = { z: z + h / 2, h };
      z += h;
      return row;
    });
    z += gap;
    return placed;
  });
  const shallowest = Math.min(...needs.flat()) * stretch;
  return { rows, size: Math.min(2.2, Math.max(0.9, shallowest - 0.35)), overflow: stretch < 0.97 };
}

/** A table's rows: the statements stand left of the boxes, in a narrower column, under the column headings. */
const TABLE_HEADINGS = 1.5;
const tableRows = (spec: ArenaSpec) => stackRows([spec.choices], 0, 24, TABLE_HEADINGS);

/** The lists an upright layout stacks for this interaction, or null when it is not laid out as a list. */
const portraitLists = (spec: ArenaSpec): { groups: Choice[][]; gap: number } | null =>
  spec.kind === "choice" || spec.kind === "order"
    ? { groups: [spec.choices], gap: 0 }
    : spec.kind === "match" && !spec.tabular
      ? { groups: [spec.choices, spec.targets], gap: 0.9 }
      : spec.kind === "gap" && !spec.picture
        ? // The question card is small on a phone, so every gap brings the words around it.
          { groups: [spec.choices, spec.targets.map((gap) => (gap.context ? { ...gap, label: `${gap.label}. ${gap.context}` } : gap))], gap: 0.9 }
        : null;

/**
 * Whether an interaction has more text than fits beside its pads on an upright
 * phone. Such a question is better played with the real interaction.
 */
export function overflowsPortrait(spec: ArenaSpec, field: Field): boolean {
  if (!field.portrait) return false;
  if (spec.kind === "match" && spec.tabular) return tableRows(spec).overflow;
  // More to carry than fits above the picture would leave no room for the picture itself.
  if (spec.kind === "gap" && spec.picture) return spec.choices.length > SHELF_MAX;
  const lists = portraitLists(spec);
  return !!lists && stackRows(lists.groups, lists.gap).overflow;
}

/** The layouts for a phone held upright. */
function layoutPortrait(spec: ArenaSpec, field: Field): Pad[] {
  const pads: Pad[] = [];
  // ✔ is at the bottom, between the thumb-stick and the Jump button.
  const check: Pad = { id: "__check", role: "check", x: 0, z: 8.3, size: 2, label: "✔", overlay: false };
  const lists = portraitLists(spec);
  if (lists) {
    // A list: a pad on the left, its answer beside it. A match is two lists under each
    // other: pick one from the first, then its partner from the second.
    const stack = stackRows(lists.groups, lists.gap);
    const x = -field.halfW + stack.size / 2 + 0.45;
    lists.groups.forEach((group, g) =>
      group.forEach((choice, i) => pads.push(listPad(choice, g === 0 ? "choice" : "target", x, stack.rows[g][i], stack.size, field))),
    );
    if (spec.multiple || spec.kind !== "choice") pads.push(check);
  } else if (spec.kind === "gap") {
    // What there is to carry, as a list above the picture.
    const size = SHELF_ROW - 0.3;
    const x = -field.halfW + size / 2 + 0.45;
    spec.choices.forEach((choice, i) =>
      pads.push(listPad(choice, "choice", x, { z: PORTRAIT_TOP + 0.3 + (i + 0.5) * SHELF_ROW, h: SHELF_ROW }, size, field)),
    );
    pads.push(check);
  } else if (spec.kind === "match" && spec.tabular) {
    // The table hugs the right edge; the statements get the room on the left.
    const cols = spec.targets;
    const dx = Math.min(1.9, 5.4 / cols.length);
    const stack = tableRows(spec);
    const cell = Math.min(1.7, dx - 0.3, stack.size);
    const r = { size: cell, z: (i: number) => stack.rows[0][i].z };
    const xs = cols.map((_, j) => field.halfW - 0.45 - r.size / 2 - (cols.length - 1 - j) * dx);
    cols.forEach((col, j) =>
      pads.push({
        ...choicePad(col, "label", xs[j], PORTRAIT_TOP + TABLE_HEADINGS - 0.1, r.size),
        id: `col:${col.id}`,
        anchor: "above",
      }),
    );
    spec.choices.forEach((choice, i) => {
      const z = r.z(i);
      pads.push({
        ...choicePad(choice, "label", xs[0] - r.size / 2 - 0.35, z, r.size),
        id: `row:${choice.id}`,
        row: choice.id,
        anchor: "left",
        overlay: true,
      });
      cols.forEach((col, j) =>
        pads.push({ id: `${choice.id} ${col.id}`, role: "cell", pair: [choice.id, col.id], x: xs[j], z, size: r.size, label: "", overlay: false }),
      );
    });
    pads.push(check);
  } else if (spec.kind === "entry") {
    // A phone keypad for numbers; five letters to a row for words.
    const letters = spec.keys.some((k) => k >= "a" && k <= "z");
    const cols = letters ? 5 : 3;
    const zero = !letters && spec.keys.includes("0");
    const keys = spec.keys.filter((k) => !(zero && k === "0"));
    // Numbers end on a row of ⌫ 0 ✔, like a phone; words get ⌫ and ✔ after the last letter.
    const cells: { id: string; role: Pad["role"]; label: string }[] = keys.map((k) => ({ id: k, role: "key", label: k === " " ? "␣" : k }));
    if (!letters) while (cells.length % cols !== 0) cells.push({ id: "", role: "label", label: "" });
    cells.push({ id: "__back", role: "back", label: "⌫" });
    if (zero) cells.push({ id: "0", role: "key", label: "0" });
    cells.push({ id: "__check", role: "check", label: "✔" });
    const count = Math.ceil(cells.length / cols);
    const dx = Math.min(3.3, (field.halfW * 2 - 0.8) / cols);
    const dz = Math.min(dx, 12.4 / count);
    const size = Math.min(dx, dz) - 0.3;
    cells.forEach((cell, i) => {
      if (!cell.id) return;
      const column = i % cols;
      pads.push({
        id: cell.id,
        role: cell.role,
        x: (column - (cols - 1) / 2) * dx,
        z: -7.9 + size / 2 + Math.floor(i / cols) * dz,
        size,
        label: cell.label,
        overlay: false,
      });
    });
  } else if ((spec.kind === "hotspot" || spec.kind === "point") && spec.multiple) {
    pads.push(check);
  }
  return pads;
}

export function layoutPads(spec: ArenaSpec, field: Field): Pad[] {
  const pads = field.portrait ? layoutPortrait(spec, field) : layoutWide(spec, field);
  // The answers of one set get the same kind of label, so they look like one set: when one of
  // them needs an HTML label (a picture, a formula, a long sentence), they all get one.
  for (const role of ["choice", "target"] as const)
    if (pads.some((pad) => pad.role === role && pad.overlay)) for (const pad of pads) if (pad.role === role) pad.overlay = true;
  // A gap shows what was put in it, so it follows the things there are to carry.
  if (spec.kind === "gap" && pads.some((pad) => pad.role === "choice" && pad.overlay))
    for (const pad of pads) if (pad.role === "target") pad.overlay = true;
  return pads;
}

/** The layouts for a wide screen. */
function layoutWide(spec: ArenaSpec, field: Field): Pad[] {
  void field;
  const pads: Pad[] = [];
  const check: Pad = { id: "__check", role: "check", x: 7, z: 3.2, size: 2, label: "✔", overlay: false };
  if (spec.kind === "choice" || spec.kind === "order") {
    const n = spec.choices.length;
    const spacing = Math.min(4.2, 16.5 / n);
    row(n, spacing).forEach((x, i) => pads.push(choicePad(spec.choices[i], "choice", x, -1.6, Math.min(2.4, spacing - 0.7))));
    if (spec.multiple || spec.kind === "order") pads.push(check);
  } else if (spec.kind === "match" && spec.tabular) {
    // The table on the floor: a row of boxes per choice, a column per target.
    const rows = spec.choices;
    const cols = spec.targets;
    const dx = Math.min(2.6, 9 / cols.length);
    const dz = Math.min(2.2, 8 / rows.length);
    const size = Math.min(1.8, dx - 0.35, dz - 0.35);
    const xs = row(cols.length, dx).map((x) => x + 3);
    const zs = rows.map((_, i) => -3.3 + i * dz);
    cols.forEach((col, j) =>
      pads.push({
        ...choicePad(col, "label", xs[j], zs[0] - size / 2 - 0.25, size),
        id: `col:${col.id}`,
        anchor: "above",
      }),
    );
    rows.forEach((choice, i) => {
      pads.push({
        ...choicePad(choice, "label", xs[0] - size / 2 - 0.35, zs[i], size),
        id: `row:${choice.id}`,
        row: choice.id,
        anchor: "left",
        // A row heading is always an HTML label: it is often a whole sentence.
        overlay: true,
      });
      cols.forEach((col, j) =>
        pads.push({ id: `${choice.id} ${col.id}`, role: "cell", pair: [choice.id, col.id], x: xs[j], z: zs[i], size, label: "", overlay: false }),
      );
    });
    // ✔ sits under the last column, in walking distance and clear of the Jump button.
    pads.push({ ...check, x: xs[xs.length - 1], z: zs[zs.length - 1] + Math.max(dz, 1.9), size: 1.6 });
  } else if (spec.kind === "gap" && spec.picture) {
    // What there is to carry stands in a row behind the picture.
    const n = spec.choices.length;
    const spacing = Math.min(3.4, 13 / n);
    const size = Math.min(1.7, spacing - 0.7);
    // A label may be as wide as the room between two neighbours.
    row(n, spacing).forEach((x, i) => pads.push({ ...choicePad(spec.choices[i], "choice", x, -4.3, size), span: spacing - 0.3 }));
    pads.push({ ...check, x: 7.6, z: 3.7, size: 1.5 });
  } else if (spec.kind === "gap") {
    // The words stand at the back, the gaps in front. Each row is spread over the width by itself, and a
    // sign is never wider than the room between two neighbours.
    const signed = (pad: Pad, spacing: number): Pad => ({ ...pad, span: Math.min(3.2, spacing - 0.15) });
    const n = spec.choices.length;
    if (n > 5) {
      // Many words: two rows, far enough apart that the signs of the front row do not hide the pads behind them.
      const back = Math.ceil(n / 2);
      const spacing = Math.min(4.2, 15 / back);
      const size = Math.min(1.6, spacing - 1);
      row(back, spacing).forEach((x, i) => pads.push(signed(choicePad(spec.choices[i], "choice", x - spacing / 4, -5.2, size), spacing)));
      row(n - back, spacing).forEach((x, i) =>
        pads.push(signed(choicePad(spec.choices[back + i], "choice", x + spacing / 4, -1.9, size), spacing)),
      );
    } else {
      const spacing = Math.min(4.4, 15 / n);
      const size = Math.min(2, spacing - 0.8);
      row(n, spacing).forEach((x, i) => pads.push(signed(choicePad(spec.choices[i], "choice", x, -3.7, size), spacing)));
    }
    const apart = Math.min(4.4, 15 / spec.targets.length);
    row(spec.targets.length, apart).forEach((x, i) =>
      pads.push(signed(choicePad(spec.targets[i], "target", x, n > 5 ? 2.4 : 1.7, Math.min(2, apart - 0.8)), apart)),
    );
    pads.push({ ...check, x: 7.4, z: n > 5 ? 4.4 : 3.7, size: 1.8 });
  } else if (spec.kind === "match") {
    const widest = Math.max(spec.choices.length, spec.targets.length);
    const spacing = Math.min(4.4, 15 / widest);
    const size = Math.min(2, spacing - 0.8);
    row(spec.choices.length, spacing).forEach((x, i) => pads.push(choicePad(spec.choices[i], "choice", x, -3.7, size)));
    row(spec.targets.length, spacing).forEach((x, i) => pads.push(choicePad(spec.targets[i], "target", x, 1.7, size)));
    pads.push({ ...check, x: 7, z: 3.7, size: 1.8 });
  } else if ((spec.kind === "hotspot" || spec.kind === "point") && spec.multiple) {
    pads.push({ ...check, x: 8.4, z: 3.9, size: 1.5 });
  } else if (spec.kind === "entry") {
    const rows = spec.keys.length <= 12 ? 2 : 3;
    const perRow = Math.ceil(spec.keys.length / rows);
    const spacing = Math.min(2.5, 12.6 / Math.max(1, perRow - 1));
    const size = Math.min(1.9, spacing - 0.25);
    const depth = rows === 2 ? [-2.9, -0.3] : [-3.7, -1.9, -0.1];
    for (let r = 0; r < rows; r++) {
      const keys = spec.keys.slice(r * perRow, (r + 1) * perRow);
      row(keys.length, spacing).forEach((x, i) =>
        pads.push({ id: keys[i], role: "key", x, z: depth[r], size, label: keys[i] === " " ? "␣" : keys[i], overlay: false }),
      );
    }
    pads.push({ id: "__back", role: "back", x: -8.3, z: -1.6, size: 1.5, label: "⌫", overlay: false });
    pads.push({ ...check, x: 8.3, z: -1.6, size: 1.5 });
  }
  return pads;
}

/** The pad under a point on the floor, if any. */
export const padAt = (pads: Pad[], x: number, z: number) =>
  pads.find((p) => p.role !== "label" && Math.abs(x - p.x) <= p.size / 2 && Math.abs(z - p.z) <= p.size / 2) ?? null;

export function onRunway(field: Field, x: number, z: number) {
  const r = runwayOf(field);
  const along = r.axis === "x" ? x : z;
  const across = r.axis === "x" ? z : x;
  return along >= Math.min(r.from, r.to) - 0.3 && along <= Math.max(r.from, r.to) + 0.3 && Math.abs(across - r.cross) <= r.half;
}

/** The value the number line shows where the hero stands, snapped to the slider's step. */
export function runwayValue(spec: ArenaSpec, field: Field, x: number, z: number) {
  const r = runwayOf(field);
  const t = Math.min(1, Math.max(0, ((r.axis === "x" ? x : z) - r.from) / (r.to - r.from)));
  const raw = spec.min + t * (spec.max - spec.min);
  return Math.min(spec.max, Math.max(spec.min, Math.round(raw / spec.step) * spec.step));
}

/** Where a value lies on the number line, on the floor. */
export function runwayPoint(spec: ArenaSpec, field: Field, value: number): [number, number] {
  const r = runwayOf(field);
  const along = r.from + ((value - spec.min) / (spec.max - spec.min)) * (r.to - r.from);
  return r.axis === "x" ? [along, r.cross] : [r.cross, along];
}

export interface StompResult {
  answer: Answer;
  /** Hand the answer to the QTI item now. */
  submit: boolean;
  /** Nothing happened (e.g. ✔ with no answer yet): the guide explains why. */
  nudge?: string;
}

const lettersOnly = (spec: ArenaSpec) => spec.keys.some((k) => k >= "a" && k <= "z");

/** The hero landed on a pad. */
export function stomp(spec: ArenaSpec, answer: Answer, pad: Pad): StompResult {
  const a: Answer = { ...answer, picked: [...answer.picked], pairs: [...answer.pairs] };
  if (pad.role === "check") {
    if (spec.kind === "entry" && !a.digits.trim())
      return { answer, submit: false, nudge: lettersOnly(spec) ? "Hop on the letters first!" : "Hop on the numbers first!" };
    if (spec.kind === "order" && a.picked.length < spec.choices.length)
      return { answer, submit: false, nudge: "Jump on all of them first, from first to last." };
    if (spec.kind === "match" && a.pairs.length === 0)
      return {
        answer,
        submit: false,
        nudge: spec.tabular ? "Tick a box first: jump on it." : "Make a pair first: jump on one, then on its partner.",
      };
    if (spec.kind === "choice" && a.picked.length === 0)
      return { answer, submit: false, nudge: "Jump on the answers you think are right first." };
    if (spec.kind === "hotspot" && a.picked.length === 0)
      return { answer, submit: false, nudge: "Jump on a spot in the picture first." };
    if (spec.kind === "point" && a.points.length === 0)
      return { answer, submit: false, nudge: "Mark a point in the picture first: jump on it." };
    if (spec.kind === "gap" && a.pairs.length === 0)
      return {
        answer,
        submit: false,
        nudge: spec.picture
          ? "Nothing is in place yet. Pick one up and carry it to its spot on the picture."
          : "The gaps are still empty. Pick one up and carry it to its gap.",
      };
    // Whatever is still in the hero's hands goes back where it came from.
    if (spec.kind === "gap") a.pending = null;
    return { answer: a, submit: true };
  }
  if (pad.role === "key") {
    if (a.digits.length >= spec.maxLength) return { answer, submit: false, nudge: "That's long enough. Jump on ✔ or ⌫." };
    // A lone leading zero is replaced, as on a calculator.
    a.digits = a.digits === "0" && pad.id >= "0" && pad.id <= "9" ? pad.id : a.digits + pad.id;
    return { answer: a, submit: false };
  }
  if (pad.role === "back") {
    a.digits = a.digits.slice(0, -1);
    return { answer: a, submit: false };
  }
  if (spec.kind === "choice") {
    if (a.eliminated.includes(pad.id)) return { answer, submit: false };
    if (!spec.multiple) return { answer: { ...a, picked: [pad.id] }, submit: true };
    a.picked = a.picked.includes(pad.id) ? a.picked.filter((id) => id !== pad.id) : [...a.picked, pad.id];
    return { answer: a, submit: false };
  }
  if (spec.kind === "order") {
    a.picked = a.picked.includes(pad.id) ? a.picked.filter((id) => id !== pad.id) : [...a.picked, pad.id];
    return { answer: a, submit: false };
  }
  if (pad.role === "cell" && pad.pair) {
    // A box in the table. A row or column that may be used once behaves like a
    // radio button: ticking another box moves the tick.
    const [rowId, colId] = pad.pair;
    const ticked = a.pairs.findIndex(([l, r]) => l === rowId && r === colId);
    if (ticked >= 0) {
      a.pairs.splice(ticked, 1);
      return { answer: a, submit: false };
    }
    const rowRoom = roomOf(spec.choices.find((c) => c.id === rowId));
    while (a.pairs.filter(([l]) => l === rowId).length >= rowRoom) a.pairs.splice(a.pairs.findIndex(([l]) => l === rowId), 1);
    const colRoom = roomOf(spec.targets.find((c) => c.id === colId));
    if (a.pairs.filter(([, r]) => r === colId).length >= colRoom) {
      if (colRoom !== 1) return { answer, submit: false, nudge: "That column is full. Untick one of its boxes first." };
      a.pairs.splice(a.pairs.findIndex(([, r]) => r === colId), 1);
    }
    a.pairs.push([rowId, colId]);
    return { answer: a, submit: false };
  }
  if (spec.kind === "gap") {
    if (pad.role === "target") return dropInGap(spec, answer, a, pad.id);
    if (a.pending === pad.id) {
      // A second jump on where it came from puts it back.
      a.pending = null;
      return { answer: a, submit: false };
    }
    // When every copy of it is out in a gap, the first one is fetched back.
    const source = spec.choices.find((c) => c.id === pad.id);
    if (a.pairs.filter(([l]) => l === pad.id).length >= roomOf(source)) a.pairs.splice(a.pairs.findIndex(([l]) => l === pad.id), 1);
    a.pending = pad.id;
    return { answer: a, submit: false };
  }
  if (spec.kind === "match") {
    if (pad.role === "choice") {
      if (a.pending === pad.id) {
        // A second jump on the same one lets go of it, and of what it was paired with.
        a.pending = null;
        a.pairs = a.pairs.filter(([l]) => l !== pad.id);
      } else a.pending = pad.id;
      return { answer: a, submit: false };
    }
    const from = a.pending;
    if (!from) return { answer, submit: false, nudge: "Start with one from the back row, then jump on its partner." };
    const same = a.pairs.findIndex(([l, r]) => l === from && r === pad.id);
    if (same >= 0) {
      a.pairs.splice(same, 1);
      a.pending = null;
      return { answer: a, submit: false };
    }
    // Make room on the side you came from: its oldest pair goes when it may not have more.
    const left = spec.choices.find((c) => c.id === from);
    while (a.pairs.filter(([l]) => l === from).length >= roomOf(left)) {
      a.pairs.splice(a.pairs.findIndex(([l]) => l === from), 1);
    }
    const target = spec.targets.find((c) => c.id === pad.id);
    if (a.pairs.filter(([, r]) => r === pad.id).length >= roomOf(target))
      return { answer, submit: false, nudge: "That one is already taken. Free it first, or pick another." };
    a.pairs.push([from, pad.id]);
    a.pending = null;
    return { answer: a, submit: false };
  }
  return { answer, submit: false };
}

/** In how many pairs a choice may take part: once when it does not say, without limit when it says 0. */
const roomOf = (choice: Choice | undefined) => (choice?.matchMax === 0 ? Infinity : (choice?.matchMax ?? 1));

/**
 * Carry: the hero jumped on a gap. With something in hand it goes in, and what
 * was there makes room; empty-handed, the hero takes out what is in the gap.
 * `a` is the working copy of `answer`.
 */
function dropInGap(spec: ArenaSpec, answer: Answer, a: Answer, gapId: string): StompResult {
  const held = a.pending;
  const inGap = (pair: [string, string]) => pair[1] === gapId;
  if (!held) {
    const last = a.pairs.map(inGap).lastIndexOf(true);
    if (last < 0) return { answer, submit: false, nudge: "Your hands are empty. Jump on one to pick it up first." };
    a.pending = a.pairs[last][0];
    a.pairs.splice(last, 1);
    return { answer: a, submit: false };
  }
  a.pending = null;
  // It is in this gap already: just let go.
  if (a.pairs.some((pair) => inGap(pair) && pair[0] === held)) return { answer: a, submit: false };
  const gap = spec.targets.find((c) => c.id === gapId);
  while (a.pairs.filter(inGap).length >= roomOf(gap)) a.pairs.splice(a.pairs.findIndex(inGap), 1);
  a.pairs.push([held, gapId]);
  return { answer: a, submit: false };
}

/** The hero landed on the picture of a hotspot or select-point interaction; null when off the picture. */
export function landOnPicture(spec: ArenaSpec, field: Field, answer: Answer, x: number, z: number): StompResult | null {
  if (!spec.picture) return null;
  const pixel = toPicture(spec.picture, field, x, z);
  if (!pixel) return null;
  const { scale } = pictureFrame(spec.picture, field);
  const full = (count: number) => spec.maxChoices > 0 && count >= spec.maxChoices;
  if (spec.kind === "gap") {
    const area = areaAt(spec.areas, pixel[0], pixel[1], HOTSPOT_SLACK / scale);
    if (!area)
      return answer.pending
        ? { answer, submit: false, nudge: "That is not one of the places. Jump on a marked spot to put it down." }
        : { answer, submit: false };
    return dropInGap(spec, answer, { ...answer, pairs: [...answer.pairs] }, area.id);
  }
  if (spec.kind === "hotspot") {
    const area = areaAt(spec.areas, pixel[0], pixel[1], HOTSPOT_SLACK / scale);
    if (!area) return { answer, submit: false, nudge: "Nothing to pick there. Jump on one of the marked spots." };
    if (answer.eliminated.includes(area.id)) return { answer, submit: false };
    if (!spec.multiple) return { answer: { ...answer, picked: [area.id] }, submit: true };
    if (answer.picked.includes(area.id))
      return { answer: { ...answer, picked: answer.picked.filter((id) => id !== area.id) }, submit: false };
    if (full(answer.picked.length)) return { answer, submit: false, nudge: "That's as many as you may pick. Jump on ✔, or on one to let it go." };
    return { answer: { ...answer, picked: [...answer.picked, area.id] }, submit: false };
  }
  const point: [number, number] = [Math.round(pixel[0]), Math.round(pixel[1])];
  if (!spec.multiple) return { answer: { ...answer, points: [point] }, submit: true };
  // Landing on a mark again takes it away.
  const near = answer.points.findIndex(([u, v]) => Math.hypot(u - point[0], v - point[1]) * scale < 0.45);
  if (near >= 0) return { answer: { ...answer, points: answer.points.filter((_, i) => i !== near) }, submit: false };
  if (full(answer.points.length)) return { answer, submit: false, nudge: "That's as many as you may mark. Jump on ✔, or on a mark to remove it." };
  return { answer: { ...answer, points: [...answer.points, point] }, submit: false };
}

/** The response in the shape the QTI item expects. */
export function toResponse(spec: ArenaSpec, answer: Answer): string | string[] {
  switch (spec.kind) {
    case "choice":
      return spec.multiple ? answer.picked : (answer.picked[0] ?? "");
    case "order":
      return answer.picked;
    case "entry": {
      const typed = answer.digits.trim();
      return spec.accepted.find((value) => value.toLowerCase() === typed.toLowerCase()) ?? typed;
    }
    case "match":
    case "gap":
      return answer.pairs.map(([l, r]) => `${l} ${r}`);
    case "slider":
      return String(answer.value ?? "");
    case "hotspot":
      return spec.multiple ? answer.picked : (answer.picked[0] ?? "");
    case "point": {
      const points = answer.points.map(([u, v]) => `${u} ${v}`);
      return spec.multiple ? points : (points[0] ?? "");
    }
  }
}

/** Tidy up after a wrong try, so the next one starts sensibly. */
export function afterWrong(spec: ArenaSpec, answer: Answer): Answer {
  if ((spec.kind === "choice" || spec.kind === "hotspot") && !spec.multiple)
    return { ...answer, eliminated: [...answer.eliminated, ...answer.picked], picked: [] };
  if (spec.kind === "point") return { ...answer, points: [] };
  if (spec.kind === "entry") return { ...answer, digits: "" };
  if (spec.kind === "slider") return { ...answer, value: null };
  return answer;
}

/** The answer filled in from the item's correct response, for "show answer". */
export function revealAnswer(spec: ArenaSpec): Answer {
  const a = emptyAnswer();
  if (spec.kind === "choice" || spec.kind === "order" || spec.kind === "hotspot") a.picked = [...spec.correct];
  else if (spec.kind === "point")
    a.points = spec.correct
      .map((value) => value.trim().split(/\s+/).map(Number) as [number, number])
      .filter(([u, v]) => Number.isFinite(u) && Number.isFinite(v));
  else if (spec.kind === "entry") a.digits = spec.correct[0] ?? "";
  else if (spec.kind === "match" || spec.kind === "gap")
    a.pairs = spec.correct.map((v) => v.trim().split(/\s+/) as [string, string]).filter((pair) => pair.length === 2);
  else if (spec.kind === "slider") a.value = Number(spec.correct[0]);
  return a;
}

export type Outcome = "playing" | "correct" | "wrong" | "revealed";

export function padViews(spec: ArenaSpec, pads: Pad[], answer: Answer, outcome: Outcome): Record<string, PadView> {
  const views: Record<string, PadView> = {};
  const done = outcome === "correct" || outcome === "revealed";
  for (const pad of pads) {
    let view: PadView = { look: "idle" };
    if (pad.role === "check") view = { look: done ? "gone" : "idle", tint: "#22c55e" };
    else if (pad.role === "cell" && pad.pair) {
      const [rowId, colId] = pad.pair;
      if (answer.pairs.some(([l, r]) => l === rowId && r === colId))
        view = { look: done ? "correct" : outcome === "wrong" ? "wrong" : "selected", mark: "✓" };
    } else if (pad.role === "label") {
      // A row heading lights up once its row has a tick.
      if (pad.row && answer.pairs.some(([l]) => l === pad.row)) view = { look: done ? "correct" : "selected" };
    }
    else if (pad.role === "back") view = { look: done ? "gone" : "idle", tint: "#fb923c" };
    else if (pad.role === "key") view = { look: "idle" };
    else if (spec.kind === "choice") {
      if (answer.eliminated.includes(pad.id)) view = { look: "gone" };
      else if (answer.picked.includes(pad.id))
        view = { look: done ? "correct" : outcome === "wrong" ? "wrong" : "selected" };
    } else if (spec.kind === "order") {
      const rank = answer.picked.indexOf(pad.id);
      if (rank >= 0)
        view = { look: done ? "correct" : outcome === "wrong" ? "wrong" : "selected", badge: String(rank + 1) };
    } else if (spec.kind === "gap") {
      if (pad.role === "target") {
        // A gap shows what was put in it.
        const inside = answer.pairs.filter(([, r]) => r === pad.id).map(([l]) => spec.choices.find((c) => c.id === l));
        if (inside.length) {
          const rich = inside.find((choice) => choice?.html)?.html;
          const words = inside.map((choice) => choice?.label || "●").join(", ");
          view = {
            look: done ? "correct" : outcome === "wrong" ? "wrong" : "selected",
            // Where the gap is shown with the words around it, the word goes into that sentence.
            mark: pad.label.includes(GAP_MARK) ? pad.label.replace(GAP_MARK, words) : words,
            ...(rich && inside.length === 1 && !pad.label.includes(GAP_MARK) ? { html: rich } : {}),
          };
        } else view = { look: "idle", tint: GAP_EMPTY };
      } else if (answer.pending === pad.id) view = { look: "selected" };
      else if (answer.pairs.filter(([l]) => l === pad.id).length >= roomOf(spec.choices.find((c) => c.id === pad.id)))
        // Every copy of it is out in a gap: its place on the shelf is empty.
        view = { look: "gone" };
    } else if (spec.kind === "match") {
      // A pair wears the colour and number of its target, so a target that takes several stays readable.
      const pair = answer.pairs.find(([l, r]) => l === pad.id || r === pad.id);
      if (answer.pending === pad.id) view = { look: "selected" };
      else if (pair) {
        const target = spec.targets.findIndex((c) => c.id === pair[1]);
        view = {
          look: done ? "correct" : outcome === "wrong" ? "wrong" : "selected",
          badge: String(target + 1),
          tint: done || outcome === "wrong" ? undefined : PAIR_COLORS[target % PAIR_COLORS.length],
        };
      }
    }
    views[pad.id] = view;
  }
  return views;
}

/** Text for the big board behind the key pads. */
export function displayText(spec: ArenaSpec, answer: Answer): string | null {
  if (spec.kind !== "entry") return null;
  const shown = answer.digits.replace(/ /g, "␣");
  return shown.padEnd(Math.max(1, Math.min(spec.maxLength, shown.length + 1)), "_").split("").join(" ");
}

export const HOW_TO: Record<ArenaKind, (spec: ArenaSpec) => string> = {
  choice: (spec) => (spec.multiple ? "Jump on every right answer, then on ✔" : "Jump on the right answer!"),
  entry: (spec) =>
    lettersOnly(spec) ? "Hop on the letters to spell your answer, then on ✔" : "Hop on the digits to make your number, then on ✔",
  order: () => "Jump on them in order, first to last, then on ✔",
  match: (spec) =>
    spec.tabular ? "Jump on the right box in every row, then on ✔" : "Jump on one, then on its partner. Then on ✔",
  slider: () => "Walk along the number line and jump on the right spot",
  hotspot: (spec) =>
    spec.multiple ? "Jump on every right spot in the picture, then on ✔" : "Walk onto the picture and jump on the right spot!",
  point: (spec) =>
    spec.multiple ? "Jump on each point you want to mark, then on ✔" : "Walk onto the picture and jump exactly on the right point",
  gap: (spec) =>
    spec.picture
      ? "Jump on one to pick it up, carry it to its place on the picture and jump again. Then on ✔"
      : "Jump on one to pick it up, carry it to its gap and jump again. Then on ✔",
};

// ── Safe HTML out of item markup ─────────────────────────────────────

/** Interactions that sit inside a sentence, and so leave a blank in it. */
const INLINE_INTERACTIONS = ["qti-text-entry-interaction", "qti-inline-choice-interaction"];

const ALLOWED = new Set([
  "p", "strong", "em", "b", "i", "u", "span", "br", "sub", "sup", "div", "ul", "ol", "li", "img",
  "table", "caption", "thead", "tbody", "tr", "td", "th", "h1", "h2", "h3", "h4", "blockquote", "figure", "figcaption",
]);

/** A picture may come from inside the item (data URI) or from this origin (the package cache). */
const safeImageSrc = (src: string) => {
  if (src.startsWith("data:image/")) return true;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

/** A formula keeps its own markup; only scripting hooks and links are stripped. */
function importMath(el: Element): Element {
  const math = document.importNode(el, true);
  for (const node of [math, ...Array.from(math.querySelectorAll("*"))]) {
    for (const attr of Array.from(node.attributes)) {
      if (attr.name.startsWith("on") || attr.name === "href" || attr.name.endsWith(":href")) node.removeAttribute(attr.name);
    }
  }
  return math;
}

interface CopyOptions {
  /** What an inline interaction's blank shows when nothing is known about it. */
  blank: string;
  /** What each inline interaction's blank shows, by response identifier. */
  blanks?: Record<string, string>;
  /** The interaction being answered now: its blank or prompt is marked. */
  current?: string;
  /** Keep `class` (and a picture's size), for markup that is shown with the item's own stylesheet. */
  keepClass?: boolean;
  /** Inside a gap match: whose gaps these are, and how many were numbered so far. */
  gaps?: { owner: string; count: number; current: boolean };
}

/** The key under which a gap's blank is looked up in `blanks`. */
export const gapKey = (responseId: string, gapId: string) => `${responseId}\u0002${gapId}`;

/**
 * Copies item markup into `target` through an allow-list of tags and
 * attributes. Works on the item's XML as well as on the rendered item.
 * An interaction is not copied: a block one leaves its prompt, an inline one a
 * blank showing `blank`. A gap match is the exception: its sentences are the
 * question, so they stay, with every gap as a numbered blank.
 */
function copySafe(node: Node, target: HTMLElement, options: CopyOptions) {
  const { blank, keepClass } = options;
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.append(child.textContent ?? "");
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    const name = el.localName;
    if (name.includes("-interaction")) {
      const responseId = el.getAttribute("response-identifier") ?? "";
      const isCurrent = !!options.current && responseId === options.current;
      const prompt = el.getElementsByTagName("qti-prompt")[0];
      if (prompt) {
        const p = document.createElement("p");
        p.className = isCurrent ? "quest-prompt quest-current" : "quest-prompt";
        copySafe(prompt, p, options);
        target.append(p);
      } else if (INLINE_INTERACTIONS.some((tag) => name.startsWith(tag))) {
        const span = document.createElement("span");
        span.className = isCurrent ? "quest-blank quest-current" : "quest-blank";
        span.textContent = options.blanks?.[responseId] ?? blank;
        target.append(span);
      }
      // A block interaction without a prompt leaves nothing behind: the question is in the text around it.
      if (name.startsWith("qti-gap-match-interaction")) {
        // The words to carry are pads in the arena, and are skipped below like any other QTI element.
        const text = document.createElement("div");
        text.className = "quest-gap-text";
        copySafe(el, text, { ...options, gaps: { owner: responseId, count: 0, current: isCurrent } });
        target.append(text);
      }
      return;
    }
    if (name === "qti-gap" && options.gaps) {
      // Numbered in reading order, as the gaps in the arena are.
      const gaps = options.gaps;
      gaps.count += 1;
      const span = document.createElement("span");
      const filled = options.blanks?.[gapKey(gaps.owner, el.getAttribute("identifier") ?? "")];
      span.className = cn("quest-blank", filled ? "quest-filled" : "quest-gap", gaps.current && "quest-current");
      span.textContent = filled ?? String(gaps.count);
      target.append(span);
      return;
    }
    if (name === "math") {
      target.append(importMath(el));
      return;
    }
    // Feedback, rubrics and other QTI machinery are not part of the question text.
    if (name.startsWith("qti-")) return;
    // The shared text has its own reader (see the page); its placeholder stays empty.
    if (el.hasAttribute("data-stimulus-idref")) return;
    if (!ALLOWED.has(name)) {
      copySafe(el, target, options);
      return;
    }
    const html = document.createElement(name);
    if (name === "img") {
      const src = el.getAttribute("src") ?? "";
      if (!safeImageSrc(src)) return;
      html.setAttribute("src", src);
      html.setAttribute("alt", el.getAttribute("alt") ?? "");
      if (keepClass) {
        for (const attr of ["width", "height"]) {
          const value = el.getAttribute(attr);
          if (value && /^\d+$/.test(value)) html.setAttribute(attr, value);
        }
      }
    }
    const className = keepClass ? el.getAttribute("class") : null;
    if (className) html.setAttribute("class", className);
    if (name === "td" || name === "th") {
      for (const attr of ["colspan", "rowspan"]) {
        const value = el.getAttribute(attr);
        if (value && /^\d+$/.test(value)) html.setAttribute(attr, value);
      }
    }
    copySafe(el, html, options);
    target.append(html);
  });
}

/** The body of an item or a shared stimulus as safe HTML, minus its interaction. */
export function bodyHtml(xml: string, bodyTag: "qti-item-body" | "qti-stimulus-body", blank = "?"): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const body = doc.getElementsByTagName(bodyTag)[0];
  if (!body) return "";
  const out = document.createElement("div");
  copySafe(body, out, { blank });
  return out.innerHTML;
}

/**
 * The question for the panel. `blanks` says what each inline interaction's blank
 * shows; `current` is the response identifier of the part being answered.
 */
export function stemHtml(xml: string, blanks: Record<string, string>, current?: string): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const body = doc.getElementsByTagName("qti-item-body")[0];
  if (!body) return "";
  const out = document.createElement("div");
  copySafe(body, out, { blank: "?", blanks, current });
  return out.innerHTML;
}

/**
 * A choice as safe HTML when it is more than text (a picture or a formula),
 * else undefined. Class names are kept: the label is shown with the item's own
 * stylesheet, so a choice looks the way the item's author styled it.
 */
export function richHtml(choice: Element): string | undefined {
  if (!choice.querySelector("img") && !choice.querySelector("math")) return undefined;
  const out = document.createElement("div");
  copySafe(choice, out, { blank: "?", keepClass: true });
  return out.innerHTML || undefined;
}
