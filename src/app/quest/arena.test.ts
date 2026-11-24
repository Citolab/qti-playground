import { describe, expect, it } from "vitest";
import {
  emptyAnswer,
  fieldFor,
  landOnPicture,
  layoutPads,
  padViews,
  revealAnswer,
  stomp,
  toResponse,
  type Answer,
  type ArenaSpec,
} from "./arena";

const base: ArenaSpec = {
  kind: "gap",
  responseId: "RESPONSE",
  multiple: false,
  choices: [],
  targets: [],
  tabular: false,
  min: 0,
  max: 100,
  step: 1,
  keys: [],
  maxLength: 4,
  accepted: [],
  picture: null,
  areas: [],
  maxChoices: 1,
  correct: [],
};

/** Two gaps and three words; "the" may be used twice. */
const gaps: ArenaSpec = {
  ...base,
  choices: [
    { id: "CAT", label: "cat" },
    { id: "DOG", label: "dog" },
    { id: "THE", label: "the", matchMax: 2 },
  ],
  targets: [
    { id: "G1", label: "1" },
    { id: "G2", label: "2" },
  ],
  correct: ["CAT G1", "DOG G2"],
};

const wide = fieldFor(false);
const pads = layoutPads(gaps, wide);
const pad = (id: string) => pads.find((p) => p.id === id)!;
/** Jumps on the pads in turn and returns the answer after the last one. */
const jumps = (ids: string[], from: Answer = emptyAnswer()) => ids.reduce((answer, id) => stomp(gaps, answer, pad(id)).answer, from);

describe("carry (gap match)", () => {
  it("lays out a pad for every word and every gap, and ✔", () => {
    expect(pads.filter((p) => p.role === "choice").map((p) => p.id)).toEqual(["CAT", "DOG", "THE"]);
    expect(pads.filter((p) => p.role === "target").map((p) => p.id)).toEqual(["G1", "G2"]);
    expect(pads.some((p) => p.role === "check")).toBe(true);
  });

  it("picks a word up and puts it in a gap", () => {
    const held = jumps(["CAT"]);
    expect(held.pending).toBe("CAT");
    expect(held.pairs).toEqual([]);
    const placed = jumps(["G1"], held);
    expect(placed.pending).toBeNull();
    expect(toResponse(gaps, placed)).toEqual(["CAT G1"]);
  });

  it("puts a word back with a second jump on where it came from", () => {
    expect(jumps(["CAT", "CAT"]).pending).toBeNull();
  });

  it("explains itself when the hero jumps on an empty gap with empty hands", () => {
    const result = stomp(gaps, emptyAnswer(), pad("G1"));
    expect(result.nudge).toMatch(/pick it up/);
    expect(result.answer.pairs).toEqual([]);
  });

  it("takes a word out of a gap again, to move it or put it back", () => {
    const taken = jumps(["CAT", "G1", "G1"]);
    expect(taken.pending).toBe("CAT");
    expect(taken.pairs).toEqual([]);
    expect(toResponse(gaps, jumps(["G2"], taken))).toEqual(["CAT G2"]);
  });

  it("makes room in a full gap: what was there goes back", () => {
    expect(toResponse(gaps, jumps(["CAT", "G1", "DOG", "G1"]))).toEqual(["DOG G1"]);
  });

  it("fetches a used-up word back from its gap when it is picked up again", () => {
    const again = jumps(["CAT", "G1", "CAT"]);
    expect(again.pending).toBe("CAT");
    expect(again.pairs).toEqual([]);
  });

  it("lets a word be used as often as its match-max allows", () => {
    expect(toResponse(gaps, jumps(["THE", "G1", "THE", "G2"]))).toEqual(["THE G1", "THE G2"]);
  });

  it("wants something in a gap before ✔, and lets go of what is still carried", () => {
    expect(stomp(gaps, jumps(["CAT"]), pad("__check")).submit).toBe(false);
    const checked = stomp(gaps, jumps(["CAT", "G1", "DOG"]), pad("__check"));
    expect(checked.submit).toBe(true);
    expect(checked.answer.pending).toBeNull();
  });

  it("shows the word in its gap and empties its place on the shelf", () => {
    const answer = jumps(["CAT", "G1"]);
    const views = padViews(gaps, pads, answer, "playing");
    expect(views.G1).toMatchObject({ look: "selected", mark: "cat" });
    expect(views.G2.look).toBe("idle");
    expect(views.CAT.look).toBe("gone");
    // One of the two copies of "the" is still on the shelf.
    expect(padViews(gaps, pads, jumps(["THE", "G2"], answer), "playing").THE.look).toBe("idle");
  });

  it("fills the gaps from the correct response for show answer", () => {
    expect(toResponse(gaps, revealAnswer(gaps))).toEqual(["CAT G1", "DOG G2"]);
  });

  it("writes the word into the sentence where a gap is listed with the words around it", () => {
    const listed: ArenaSpec = {
      ...gaps,
      targets: [
        { id: "G1", label: "1", context: "The ___ sat down." },
        { id: "G2", label: "2", context: "…and the ___ barked." },
      ],
    };
    const upright = layoutPads(listed, fieldFor(true));
    const first = upright.find((p) => p.id === "G1")!;
    expect(first.label).toBe("1. The ___ sat down.");
    const answer = stomp(listed, stomp(listed, emptyAnswer(), upright.find((p) => p.id === "CAT")!).answer, first).answer;
    expect(padViews(listed, upright, answer, "playing").G1.mark).toBe("1. The cat sat down.");
  });
});

describe("carry onto a picture (graphic gap match)", () => {
  const graphic: ArenaSpec = {
    ...gaps,
    picture: { src: "map.png", width: 400, height: 200, shelf: 3 },
    areas: [
      { id: "G1", shape: "rect", coords: [0, 0, 100, 100] },
      { id: "G2", shape: "rect", coords: [300, 100, 400, 200] },
    ],
  };
  const floor = layoutPads(graphic, wide);

  it("keeps the words on a shelf and the gaps on the picture", () => {
    expect(floor.filter((p) => p.role === "choice")).toHaveLength(3);
    expect(floor.filter((p) => p.role === "target")).toHaveLength(0);
  });

  it("puts down what is carried on the hotspot the hero lands on", () => {
    const held = stomp(graphic, emptyAnswer(), floor.find((p) => p.id === "DOG")!).answer;
    // The picture is 13 wide, centred, in front of the shelf: its bottom right corner is hotspot G2.
    const landed = landOnPicture(graphic, wide, held, 6, 3.5);
    expect(landed && toResponse(graphic, landed.answer)).toEqual(["DOG G2"]);
  });

  it("says so when the landing is on the picture but not on a hotspot", () => {
    const held = stomp(graphic, emptyAnswer(), floor.find((p) => p.id === "DOG")!).answer;
    expect(landOnPicture(graphic, wide, held, 0, 0.9)?.nudge).toMatch(/marked spot/);
  });
});
