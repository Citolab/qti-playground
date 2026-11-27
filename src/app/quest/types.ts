export interface ChestProgress {
  attempts: number;
  solved: boolean;
  /** Gave up and looked at the answer: the chest opens, without stars. */
  revealed: boolean;
  stars: number;
}

export type PadLook = "idle" | "selected" | "correct" | "wrong" | "gone";

export interface PadView {
  look: PadLook;
  /** Small marker on the pad's sign: a rank ("1") or a pair number. */
  badge?: string;
  /** Overrides the pad colour, e.g. to show which two pads are paired. */
  tint?: string;
  /** What is written on the pad instead of its label: the tick in a table box, the word put in a gap. */
  mark?: string;
  /** The same as safe HTML, when what was put in a gap is a picture or a formula. */
  html?: string;
  /** The hero points at this pad: a throw or a put-down would end here. */
  aimed?: boolean;
}

export interface ArenaFrame {
  pads: Record<string, PadView>;
  /** Text on the big board at the back, or null to hide it. */
  display: string | null;
  /** Value floating above the hero on the number line, or null. */
  marker: string | null;
  /** Where an answer was planted (number line, select point), on the floor, or null. */
  flag: [number, number] | null;
  flagLook: "idle" | "correct" | "wrong";
  /** A hotspot or select-point picture on the floor, or null. */
  picture: PictureView | null;
  /** Gap match and order: the hero carries something above its head. */
  carrying: boolean;
  /** Where a throw would land, on the floor, and how wide a ring to draw around it; null when nothing is aimed at. */
  aim: [number, number, number] | null;
  /** Something thrown, on its way: where it is now. */
  flying: [number, number, number] | null;
}

export interface PictureView {
  selected: string[];
  eliminated: string[];
  /** The hotspot the hero stands on. */
  hover: string | null;
  /** Marked points, in picture pixels. */
  points: [number, number][];
  /** Graphic gap match: what lies on which hotspot, as [hotspot, choice]. */
  placed: [string, string][];
  look: "idle" | "correct" | "wrong";
}

/** What the 3D scene needs to know each frame. Positions are in world units (one tile = 1). */
export interface FrameState {
  player: { x: number; y: number; z: number; heading: number; walking: boolean; step: number; color: string };
  chests: Record<string, ChestProgress>;
  openCount: number;
  closedGates: Set<string>;
  nearChest: string | null;
  target: [number, number] | null;
  arena: ArenaFrame | null;
}
