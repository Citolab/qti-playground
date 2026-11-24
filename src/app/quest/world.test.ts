import { describe, expect, it } from "vitest";
import { CHEST_SPOTS, MAX_QUESTIONS, SPAWN, makeLayout, rowTiles, standingSpot, type Blockers, type ChestSpot } from "./world";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `q${i + 1}`);
const tileOf = (chests: ChestSpot[], id: string) => chests.find((c) => c.id === id)!.tile;
const zoneOf = (chests: ChestSpot[], id: string) => chests.find((c) => c.id === id)!.zone;
/** Can the hero get to stand next to every chest, with all gates open? */
const unreachable = (chests: ChestSpot[]) => {
  const blockers: Blockers = { closedGates: new Set(), chests };
  return chests.filter((chest) => !standingSpot(chest.tile, SPAWN, blockers)).map((chest) => chest.id);
};

describe("makeLayout", () => {
  it("spreads questions evenly over the three zones, the last one at the landmark", () => {
    const { chests, gateNeeds, bossNeeds } = makeLayout(ids(10));
    expect(chests.map((c) => c.id)).toEqual(ids(10));
    expect(chests.filter((c) => !c.boss).map((c) => c.zone)).toEqual([
      ...Array(3).fill("meadow"),
      ...Array(3).fill("forest"),
      ...Array(3).fill("mountain"),
    ]);
    expect(chests[9]).toMatchObject({ boss: true, zone: "mountain" });
    expect(gateNeeds).toEqual({ "forest-bridge": 2, "mountain-bridge": 5 });
    expect(bossNeeds).toBe(9);
  });

  it("gives every question its own tile, whatever the size of the test", () => {
    for (const n of [1, 2, 5, 17, MAX_QUESTIONS, MAX_QUESTIONS + 4]) {
      const { chests } = makeLayout(ids(n));
      expect(chests).toHaveLength(Math.min(n, MAX_QUESTIONS));
      expect(new Set(chests.map((c) => c.tile.join())).size).toBe(chests.length);
      expect(unreachable(chests)).toEqual([]);
    }
  });

  it("stands questions about the same text side by side", () => {
    // A reading test: three questions about one text, then two about another.
    const { chests } = makeLayout(ids(5), ["a", "a", "a", "b", "b"]);
    const [a1, a2, a3, b1, b2] = ids(5).map((id) => tileOf(chests, id));
    expect([a2[0] - a1[0], a3[0] - a2[0]]).toEqual([1, 1]);
    expect(new Set([a1[1], a2[1], a3[1]]).size).toBe(1);
    // The last text ends in the final challenge: its other question stands right beside it.
    expect(Math.abs(b1[0] - b2[0])).toBe(1);
    expect(b1[1]).toBe(b2[1]);
    expect(unreachable(chests)).toEqual([]);
  });

  it("puts no gate between the questions of one text", () => {
    // Evenly spread, the first gate would fall inside the group of four.
    const groups = [undefined, "a", "a", "a", "a", undefined, undefined, undefined, undefined, undefined];
    const { chests } = makeLayout(ids(10), groups);
    expect(new Set(["q2", "q3", "q4", "q5"].map((id) => zoneOf(chests, id))).size).toBe(1);
    // Four do not fit in one row: the fourth goes on at a spot close by.
    const [q4, q5] = [tileOf(chests, "q4"), tileOf(chests, "q5")];
    expect(Math.hypot(q5[0] - q4[0], q5[1] - q4[1])).toBeLessThan(8);
    expect(unreachable(chests)).toEqual([]);
  });

  it("only groups questions that follow each other", () => {
    const { chests } = makeLayout(ids(4), ["a", undefined, "a", undefined]);
    const [q1, q3] = [tileOf(chests, "q1"), tileOf(chests, "q3")];
    expect(Math.hypot(q3[0] - q1[0], q3[1] - q1[1])).toBeGreaterThan(1);
  });
});

describe("a row of chests", () => {
  it("can be reached at every spot in the world", () => {
    const chests = CHEST_SPOTS.flatMap((spot, s) =>
      rowTiles(spot, 3).map((tile, i): ChestSpot => ({ id: `${s}.${i}`, tile, zone: "meadow" })),
    );
    expect(unreachable(chests)).toEqual([]);
  });
});
