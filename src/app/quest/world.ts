/**
 * The quest map: a small tile world in three zones, built from rectangles so it
 * is easy to tweak. The layout is the same in every theme; themes only dress it.
 * One tile is one world unit. Nothing here knows about QTI.
 */
import type { ZoneId } from "./themes";

export const MAP_W = 40;
export const MAP_H = 28;

export type Tile =
  | "grass"
  | "forest"
  | "stone"
  | "path"
  | "water"
  | "bridge"
  | "tree"
  | "pine"
  | "rock"
  | "castle"
  | "flower";

const BLOCKING: ReadonlySet<Tile> = new Set(["water", "tree", "pine", "rock", "castle"]);

/** Where chests can stand, per zone, in the order they are handed out. */
const SPOTS: Record<ZoneId, [number, number][]> = {
  meadow: [
    [4, 13],
    [15, 13],
    [12, 23],
    [16, 22],
    [7, 14],
    [2, 20],
    [12, 11],
    [17, 15],
    [8, 21],
    [16, 25],
  ],
  forest: [
    [26, 12],
    [35, 15],
    [30, 23],
    [24, 23],
    [36, 21],
    [31, 11],
    [37, 12],
    [24, 15],
    [34, 25],
    [27, 21],
  ],
  mountain: [
    [5, 6],
    [33, 2],
    [28, 6],
    [13, 2],
    [25, 2],
    [2, 2],
    [8, 2],
    [36, 6],
    [14, 7],
    [30, 2],
  ],
};
/** The final chest, in front of the landmark. */
const BOSS_SPOT: [number, number] = [20, 4];
const ZONE_ORDER: ZoneId[] = ["meadow", "forest", "mountain"];

/** As many questions as the world has room for. */
export const MAX_QUESTIONS = ZONE_ORDER.reduce((n, zone) => n + SPOTS[zone].length, 1);

export interface ChestSpot {
  id: string;
  tile: [number, number];
  zone: ZoneId;
  boss?: boolean;
}

export interface Gate {
  id: string;
  zone: ZoneId;
  tiles: [number, number][];
  /** The crossing runs north-south (true) or east-west (false). */
  alongZ: boolean;
}

/** Where one game's questions stand, and how many must be open before each gate lifts. */
export interface Layout {
  chests: ChestSpot[];
  gateNeeds: Record<string, number>;
  /** The final chest opens once this many others are open. */
  bossNeeds: number;
}

export const SPAWN: [number, number] = [5, 22];

export const GATES: Gate[] = [
  {
    id: "forest-bridge",
    zone: "forest",
    alongZ: false,
    tiles: [
      [20, 17],
      [21, 17],
      [20, 18],
      [21, 18],
    ],
  },
  {
    id: "mountain-bridge",
    zone: "mountain",
    alongZ: true,
    tiles: [
      [9, 8],
      [10, 8],
      [9, 9],
      [10, 9],
    ],
  },
];

/**
 * Spreads questions over the world in their own order: the last one is the
 * final challenge at the landmark, the rest fill the three zones evenly. A gate
 * opens when (nearly) everything before it is open, so one hard question never
 * blocks the way.
 */
/** Beside the final challenge: where questions of its own group stand. */
const FORECOURT: [number, number][] = [
  [BOSS_SPOT[0] - 1, BOSS_SPOT[1]],
  [BOSS_SPOT[0] + 1, BOSS_SPOT[1]],
];

/** How many chests of one group stand side by side at one spot: what fits in the clearing around it. */
const ROW = 3;

/** The tiles of a row of chests at a spot. */
export const rowTiles = ([x, y]: [number, number], size: number): [number, number][] =>
  size <= 1
    ? [[x, y]]
    : size === 2
      ? [
          [x, y],
          [x + 1, y],
        ]
      : [
          [x - 1, y],
          [x, y],
          [x + 1, y],
        ];

/** Every spot a chest (or a row of them) can stand at, for tests. */
export const CHEST_SPOTS: [number, number][] = ZONE_ORDER.flatMap((zone) => SPOTS[zone]);

/**
 * `groups` names, per question, what it belongs to: the shared text it is
 * about. Questions that follow each other in the same group are kept together:
 * their chests stand side by side in a row (three at most; a longer run goes on
 * at the nearest spot), and no gate comes between them where that can be helped.
 */
export function makeLayout(ids: string[], groups: (string | undefined)[] = []): Layout {
  const list = ids.slice(0, MAX_QUESTIONS);
  /** Everything but the final challenge. */
  const n = Math.max(0, list.length - 1);
  const together = (i: number, j: number) => groups[i] !== undefined && groups[i] === groups[j];

  // The final challenge stands at the landmark; the questions of its group that come right before it stand beside it.
  let mates = 0;
  while (mates < FORECOURT.length && n - mates - 1 >= 0 && together(n - mates - 1, n)) mates += 1;
  const loose = n - mates;

  // A unit is what stands at one spot: a single chest, or a row of one group.
  const units: { from: number; size: number }[] = [];
  for (let i = 0; i < loose; ) {
    let size = 1;
    while (size < ROW && i + size < loose && together(i, i + size)) size += 1;
    units.push({ from: i, size });
    i += size;
  }

  // Where the zones begin, as a unit index. Evenly, as far as that keeps a group in one zone.
  const before = (u: number) => (u < units.length ? units[u].from : loose);
  const ideal1 = Math.ceil(n / 3);
  const ideal2 = ideal1 + Math.ceil((n - ideal1) / 2);
  const splits = (u: number) =>
    u > 0 && (u < units.length ? together(units[u - 1].from, units[u].from) : mates > 0 && together(units[u - 1].from, n));
  const room = SPOTS.meadow.length;
  let cuts: [number, number] = [0, 0];
  let least = Infinity;
  for (let u1 = 0; u1 <= units.length; u1++) {
    for (let u2 = u1; u2 <= units.length; u2++) {
      if (u1 > room || u2 - u1 > room || units.length - u2 > room) continue;
      const cost =
        Math.abs(before(u1) - ideal1) +
        Math.abs(before(u2) - ideal2) +
        1000 * (Number(splits(u1)) + Number(splits(u2))) +
        // A zone without a chest is dull: only when a group asks for it.
        0.25 * (Number(u1 === 0) + Number(u2 === u1));
      if (cost < least) {
        least = cost;
        cuts = [u1, u2];
      }
    }
  }
  const first = before(cuts[0]);
  const second = before(cuts[1]) - first;

  const chests: ChestSpot[] = [];
  const starts = [0, cuts[0], cuts[1], units.length];
  ZONE_ORDER.forEach((zone, z) => {
    const free = [...SPOTS[zone]];
    let last: [number, number] | null = null;
    for (let u = starts[z]; u < starts[z + 1]; u++) {
      const unit = units[u];
      // A group that needs a second row gets the spot nearest to its first; anything else the next spot in line.
      let take = 0;
      if (last && u > starts[z] && together(units[u - 1].from, unit.from)) {
        const [lx, ly] = last;
        free.forEach(([x, y], i) => {
          if (Math.hypot(x - lx, y - ly) < Math.hypot(free[take][0] - lx, free[take][1] - ly)) take = i;
        });
      }
      const spot = free.splice(take, 1)[0];
      last = spot;
      rowTiles(spot, unit.size).forEach((tile, i) => chests.push({ id: list[unit.from + i], tile, zone }));
    }
  });
  for (let i = 0; i < mates; i++) chests.push({ id: list[loose + i], tile: FORECOURT[i], zone: "mountain" });
  if (list.length) chests.push({ id: list[list.length - 1], tile: BOSS_SPOT, zone: "mountain", boss: true });
  const spare = (count: number, from: number) => (count >= from ? count - 1 : count);
  return {
    chests,
    gateNeeds: {
      "forest-bridge": spare(first, 3),
      "mountain-bridge": spare(first + second, 5),
    },
    bossNeeds: n,
  };
}

/** Small seeded generator so the world looks the same on every visit. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function build(): Tile[][] {
  const map: Tile[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => "grass" as Tile),
  );
  const rect = (x: number, y: number, w: number, h: number, t: Tile) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (map[j]?.[i] !== undefined) map[j][i] = t;
  };

  // Zones
  rect(0, 0, MAP_W, 8, "stone");
  rect(22, 10, MAP_W - 22, MAP_H - 10, "forest");

  // Rivers and bridges
  rect(0, 8, MAP_W, 2, "water");
  rect(20, 10, 2, MAP_H - 10, "water");
  rect(9, 8, 2, 2, "bridge");
  rect(20, 17, 2, 2, "bridge");

  // Paths
  rect(4, 17, 16, 2, "path"); // first zone → second zone bridge
  rect(4, 17, 2, 7, "path"); // spawn → main road
  rect(9, 10, 2, 7, "path"); // main road → third zone bridge
  rect(22, 17, 12, 2, "path"); // into the second zone
  rect(26, 13, 2, 4, "path");
  rect(30, 19, 2, 4, "path");
  rect(9, 4, 2, 4, "path"); // up the hill
  rect(5, 5, 30, 1, "path"); // ridge road
  rect(19, 4, 3, 2, "path"); // landmark forecourt

  // The landmark (castle, palace or mothership)
  rect(17, 0, 7, 4, "castle");

  // Border
  rect(0, 0, MAP_W, 1, "rock");
  rect(0, MAP_H - 1, MAP_W, 1, "tree");
  rect(0, 10, 1, MAP_H - 10, "tree");
  rect(MAP_W - 1, 10, 1, MAP_H - 10, "pine");
  rect(0, 0, 1, 8, "rock");
  rect(MAP_W - 1, 0, 1, 8, "rock");

  // Keep the spots around chests, the spawn and the landmark door walkable.
  const keepClear = new Set<string>();
  const clear = (x: number, y: number, r = 1) => {
    for (let j = y - r; j <= y + r; j++) for (let i = x - r; i <= x + r; i++) keepClear.add(`${i},${j}`);
  };
  ZONE_ORDER.forEach((zone) => SPOTS[zone].forEach(([x, y]) => clear(x, y)));
  clear(SPAWN[0], SPAWN[1], 2);
  clear(20, 5, 2);
  clear(20, 4, 2);

  // Scatter decoration.
  const rand = rng(11);
  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      if (keepClear.has(`${x},${y}`)) continue;
      const t = map[y][x];
      const r = rand();
      if (t === "grass") {
        if (r < 0.09) map[y][x] = "tree";
        else if (r < 0.17) map[y][x] = "flower";
      } else if (t === "forest") {
        if (r < 0.22) map[y][x] = "pine";
      } else if (t === "stone") {
        if (r < 0.07) map[y][x] = "rock";
      }
    }
  }
  return map;
}

export const MAP = build();

export function zoneAt(x: number, y: number): ZoneId {
  if (y < 8) return "mountain";
  if (x >= 22) return "forest";
  return "meadow";
}

/** How high the ground is at a tile row: the third zone sits on a plateau. */
export const groundHeight = (z: number) => (z < 8 ? 0.12 : 0);

/** What stands in the way in one game, besides the map itself. */
export interface Blockers {
  closedGates: Set<string>;
  chests: ChestSpot[];
}

export const isBlocked = (tx: number, ty: number, blockers: Blockers) => {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
  if (BLOCKING.has(MAP[ty][tx])) return true;
  for (const gate of GATES) {
    if (blockers.closedGates.has(gate.id) && gate.tiles.some(([gx, gy]) => gx === tx && gy === ty)) return true;
  }
  // Chests are solid: you stand next to them.
  return blockers.chests.some((chest) => chest.tile[0] === tx && chest.tile[1] === ty);
};

/** Breadth-first path between tiles, or null when the target cannot be reached. */
export function findPath(
  from: [number, number],
  to: [number, number],
  blockers: Blockers,
): [number, number][] | null {
  const key = (x: number, y: number) => y * MAP_W + x;
  const prev = new Map<number, number>();
  const queue: [number, number][] = [from];
  prev.set(key(...from), -1);
  while (queue.length) {
    const [x, y] = queue.shift()!;
    if (x === to[0] && y === to[1]) {
      const path: [number, number][] = [];
      let k = key(x, y);
      while (k !== -1) {
        path.unshift([k % MAP_W, Math.floor(k / MAP_W)]);
        k = prev.get(k)!;
      }
      return path;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      const nk = key(nx, ny);
      if (prev.has(nk) || isBlocked(nx, ny, blockers)) continue;
      prev.set(nk, key(x, y));
      queue.push([nx, ny]);
    }
  }
  return null;
}

/** A walkable tile next to a chest, nearest to where the player is. */
export function standingSpot(
  chest: [number, number],
  player: [number, number],
  blockers: Blockers,
): [number, number] | null {
  const options: [number, number][] = [
    [chest[0], chest[1] + 1],
    [chest[0] - 1, chest[1]],
    [chest[0] + 1, chest[1]],
    [chest[0], chest[1] - 1],
  ];
  let best: { path: [number, number][]; spot: [number, number] } | null = null;
  for (const spot of options) {
    if (isBlocked(spot[0], spot[1], blockers)) continue;
    const path = findPath(player, spot, blockers);
    if (path && (!best || path.length < best.path.length)) best = { path, spot };
  }
  return best?.spot ?? null;
}
