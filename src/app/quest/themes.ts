/**
 * The three worlds a child can pick. A theme only dresses the world: colours,
 * models, names and the little stories around the sums. The map, the maths and
 * the scoring are the same in all three.
 */
export type ThemeId = "knights" | "princess" | "aliens";
export type ZoneId = "meadow" | "forest" | "mountain";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  hero: "knight" | "princess" | "astronaut";
  heroColors: string[];
  guide: { emoji: string; name: string };
  landmarkName: string;
  treasure: string;
  zones: Record<ZoneId, { name: string; topic: string; color: string }>;
  /** CSS gradient for the picker card and loading screens. */
  card: string;
  sky: string;
  fog: { color: string; near: number; far: number };
  night: boolean;
  sun: { color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  water: { color: string; opacity: number; emissive: string; emissiveIntensity: number };
  ground: Record<"grass" | "forest" | "stone" | "path", string[]>;
  sand: string;
  tree: { kind: "round" | "mushroom"; trunk: string; crowns: string[]; fruit: string | null };
  pine: { kind: "pine" | "crystal"; trunk: string; low: string[]; high: string[] };
  rock: { kind: "rock" | "crystal"; colors: string[] };
  flowers: string[];
  bridge: { plank: string; rail: string; glow: boolean };
  landmark: { kind: "castle" | "ufo"; wall: string; wallDark: string; roof: string; flag: string; door: string };
  chest: { body: string; lid: string; trim: string; bossBody: string; bossLid: string };
  gate: string;
  arena: { floor: string; rim: string; pad: string; padEdge: string; accent: string };
}

export const THEMES: Record<ThemeId, Theme> = {
  knights: {
    id: "knights",
    name: "Knights",
    emoji: "🛡️",
    tagline: "Ride out, open the chests and win a seat at the Round Table.",
    hero: "knight",
    heroColors: ["#dc2626", "#2563eb", "#16a34a", "#f59e0b"],
    guide: { emoji: "🦉", name: "Sir Hoot" },
    landmarkName: "The King's Castle",
    treasure: "chest",
    zones: {
      meadow: { name: "Training Fields", topic: "Numbers & calculating", color: "#3f9d4a" },
      forest: { name: "Dragon Woods", topic: "Fractions & percentages", color: "#2f7a5b" },
      mountain: { name: "Castle Hills", topic: "Measuring & shapes", color: "#8a6d4b" },
    },
    card: "linear-gradient(160deg,#60a5fa 0%,#34d399 60%,#166534 100%)",
    sky: "#9fd8f5",
    fog: { color: "#9fd8f5", near: 22, far: 48 },
    night: false,
    sun: { color: "#fff6e0", intensity: 2.4 },
    hemi: { sky: "#dff3ff", ground: "#5d8a3c", intensity: 1.3 },
    water: { color: "#3ea8e0", opacity: 0.92, emissive: "#000000", emissiveIntensity: 0 },
    ground: {
      grass: ["#8fd46c", "#86cc63", "#97da74"],
      forest: ["#5fb15d", "#58a856", "#66b964"],
      stone: ["#d3c6a8", "#c9bb9c", "#dacdb0"],
      path: ["#efdca5", "#e9d49a", "#f3e2ae"],
    },
    sand: "#f0dca0",
    tree: { kind: "round", trunk: "#8a5a2b", crowns: ["#3f9a3a", "#4caa44", "#56b24c", "#3a8f35"], fruit: "#e8453c" },
    pine: { kind: "pine", trunk: "#7a4d24", low: ["#1f6b3a", "#26774a", "#1d6236"], high: ["#2f8a50", "#349457", "#2a8048"] },
    rock: { kind: "rock", colors: ["#8f8a85", "#9c968f", "#7f7a75"] },
    flowers: ["#ff7eb6", "#ffd23f", "#ffffff", "#b388ff"],
    bridge: { plank: "#b8804a", rail: "#8d5a2b", glow: false },
    landmark: { kind: "castle", wall: "#a7afc0", wallDark: "#8f98ab", roof: "#c2475a", flag: "#facc15", door: "#7a4b25" },
    chest: { body: "#a0632b", lid: "#b8743a", trim: "#f4c430", bossBody: "#7f1d1d", bossLid: "#991b1b" },
    gate: "#7a4b25",
    arena: { floor: "#e7cf96", rim: "#b8804a", pad: "#f8fafc", padEdge: "#94a3b8", accent: "#dc2626" },
  },

  princess: {
    id: "princess",
    name: "Princess",
    emoji: "👑",
    tagline: "Wander the royal gardens and collect every jewel for the grand ball.",
    hero: "princess",
    heroColors: ["#ec4899", "#a855f7", "#0ea5e9", "#f59e0b"],
    guide: { emoji: "🦄", name: "Sparkle" },
    landmarkName: "The Royal Palace",
    treasure: "jewel box",
    zones: {
      meadow: { name: "Rose Garden", topic: "Numbers & calculating", color: "#db2777" },
      forest: { name: "Enchanted Forest", topic: "Fractions & percentages", color: "#7c3aed" },
      mountain: { name: "Crystal Hills", topic: "Measuring & shapes", color: "#0891b2" },
    },
    card: "linear-gradient(160deg,#f9a8d4 0%,#c4b5fd 55%,#7dd3fc 100%)",
    sky: "#ffd9ec",
    fog: { color: "#ffd9ec", near: 22, far: 48 },
    night: false,
    sun: { color: "#fff1f7", intensity: 2.3 },
    hemi: { sky: "#ffe9f5", ground: "#9bd1a8", intensity: 1.45 },
    water: { color: "#5fd4d6", opacity: 0.9, emissive: "#000000", emissiveIntensity: 0 },
    ground: {
      grass: ["#b4e9a6", "#aae39b", "#bdeeb0"],
      forest: ["#c9b8f2", "#c0aeee", "#d2c2f6"],
      stone: ["#f6d5e4", "#f1cadb", "#fadeea"],
      path: ["#fff3d6", "#fdecc8", "#fff7e2"],
    },
    sand: "#ffe9c2",
    tree: { kind: "round", trunk: "#a0704a", crowns: ["#ff9ec7", "#ffb3d4", "#f786b8", "#ffc4de"], fruit: "#ffffff" },
    pine: { kind: "pine", trunk: "#8b5e83", low: ["#8b5cf6", "#7c3aed", "#9466f7"], high: ["#a78bfa", "#b197fc", "#9f7af9"] },
    rock: { kind: "crystal", colors: ["#f9a8d4", "#a5f3fc", "#ddd6fe"] },
    flowers: ["#ff5fa2", "#ffd23f", "#ffffff", "#c084fc"],
    bridge: { plank: "#fbe3c0", rail: "#f4b6d2", glow: false },
    landmark: { kind: "castle", wall: "#fff7fb", wallDark: "#f7dceb", roof: "#f472b6", flag: "#fde047", door: "#c084fc" },
    chest: { body: "#f472b6", lid: "#f9a8d4", trim: "#fde047", bossBody: "#a855f7", bossLid: "#c084fc" },
    gate: "#e9a8cc",
    arena: { floor: "#fde4f0", rim: "#f472b6", pad: "#ffffff", padEdge: "#f9a8d4", accent: "#a855f7" },
  },

  aliens: {
    id: "aliens",
    name: "Aliens",
    emoji: "👽",
    tagline: "Land on planet Zorb and power up the mothership, one sum at a time.",
    hero: "astronaut",
    heroColors: ["#f8fafc", "#f97316", "#22d3ee", "#a3e635"],
    guide: { emoji: "🤖", name: "Bleep" },
    landmarkName: "The Mothership",
    treasure: "energy pod",
    zones: {
      meadow: { name: "Crater Plains", topic: "Numbers & calculating", color: "#7c3aed" },
      forest: { name: "Glow Jungle", topic: "Fractions & percentages", color: "#0d9488" },
      mountain: { name: "Meteor Ridge", topic: "Measuring & shapes", color: "#be185d" },
    },
    card: "linear-gradient(160deg,#1e1b4b 0%,#6d28d9 55%,#22d3ee 100%)",
    sky: "#120b2e",
    fog: { color: "#1a1040", near: 20, far: 46 },
    night: true,
    sun: { color: "#ffffff", intensity: 1.9 },
    hemi: { sky: "#d9d2ff", ground: "#3a2a6e", intensity: 1.25 },
    water: { color: "#12c97a", opacity: 0.9, emissive: "#0aa860", emissiveIntensity: 0.45 },
    ground: {
      grass: ["#5a4aa8", "#53439e", "#6151b2"],
      forest: ["#1f7f78", "#1b7670", "#238880"],
      stone: ["#8d3a68", "#843361", "#964170"],
      path: ["#a79fd6", "#9e96cf", "#b0a8dd"],
    },
    sand: "#4c3a9c",
    tree: { kind: "mushroom", trunk: "#e9e4ff", crowns: ["#ff3fc8", "#ff9a1f", "#22d3ee", "#84e61a"], fruit: null },
    pine: { kind: "crystal", trunk: "#1c5f6b", low: ["#5ef0ff", "#7dffcf", "#69b8ff"], high: ["#b6fbff", "#c8ffe9", "#bfe0ff"] },
    rock: { kind: "rock", colors: ["#5b4a8a", "#6b5a9a", "#4d3d78"] },
    flowers: ["#5ef0ff", "#ff5fd2", "#a3ff5e", "#ffe45e"],
    bridge: { plank: "#5ef0ff", rail: "#e9e4ff", glow: true },
    landmark: { kind: "ufo", wall: "#cfd6e6", wallDark: "#8f98ab", roof: "#5ef0ff", flag: "#a3ff5e", door: "#39ff9c" },
    chest: { body: "#64748b", lid: "#94a3b8", trim: "#5ef0ff", bossBody: "#0f766e", bossLid: "#14b8a6" },
    gate: "#ff5fd2",
    arena: { floor: "#2b2060", rim: "#5ef0ff", pad: "#e9e4ff", padEdge: "#8b7bff", accent: "#39ff9c" },
  },
};

export const THEME_LIST: Theme[] = [THEMES.knights, THEMES.princess, THEMES.aliens];
