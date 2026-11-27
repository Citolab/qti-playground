import { describe, expect, it } from "vitest";
import {
  displayText,
  emptyAnswer,
  entryMode,
  fieldFor,
  focusOf,
  howTo,
  isFork,
  landOnPicture,
  layoutPads,
  overflowsPortrait,
  padViews,
  revealAnswer,
  slotId,
  spawnOf,
  startAnswer,
  startOrder,
  stomp,
  throwInto,
  throws,
  toResponse,
  typeInto,
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

describe("pick up and put in (gap match)", () => {
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

describe("throw (gap match)", () => {
  const held = jumps(["CAT"]);
  // The words stand at the back (z < 0), the gaps in front: G1 on the left, G2 on the right.
  const g1 = pad("G1");
  const g2 = pad("G2");

  it("aims at nothing with empty hands", () => {
    expect(focusOf(gaps, pads, wide, emptyAnswer(), 0, 0, 0)).toBeNull();
  });

  it("aims at the gap in front of the hero's nose", () => {
    // From the middle, between the rows: turned towards the left gap, then towards the right one.
    expect(focusOf(gaps, pads, wide, held, 0, -1, Math.atan2(g1.x, g1.z + 1))?.id).toBe("G1");
    expect(focusOf(gaps, pads, wide, held, 0, -1, Math.atan2(g2.x, g2.z + 1))?.id).toBe("G2");
  });

  it("always aims at some gap, so a throw cannot miss", () => {
    // Facing the back, away from both gaps, a little to the right: the nearer one.
    expect(focusOf(gaps, pads, wide, held, 1, 3.5, Math.PI)?.id).toBe("G2");
  });

  it("aims at the gap the hero stands on, whichever way it faces", () => {
    expect(focusOf(gaps, pads, wide, held, g1.x, g1.z, Math.atan2(g2.x - g1.x, 0))?.id).toBe("G1");
  });

  it("aims at nothing on a word or on ✔: there a jump is a jump", () => {
    expect(focusOf(gaps, pads, wide, held, pad("DOG").x, pad("DOG").z, 0)).toBeNull();
    expect(focusOf(gaps, pads, wide, held, pad("__check").x, pad("__check").z, 0)).toBeNull();
  });

  it("puts what was thrown in the gap, and what was there makes room", () => {
    const first = throwInto(gaps, emptyAnswer(), "CAT", "G1").answer;
    expect(first.pending).toBeNull();
    expect(toResponse(gaps, first)).toEqual(["CAT G1"]);
    expect(toResponse(gaps, throwInto(gaps, first, "DOG", "G1").answer)).toEqual(["DOG G1"]);
  });

  it("marks the gap that is aimed at", () => {
    const views = padViews(gaps, pads, held, "playing", "G2");
    expect(views.G2.aimed).toBe(true);
    expect(views.G1.aimed).toBeUndefined();
  });
});

describe("throw onto a picture (graphic gap match)", () => {
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

  it("aims at the place on the picture the hero faces, or stands on", () => {
    const held = stomp(graphic, emptyAnswer(), floor.find((p) => p.id === "DOG")!).answer;
    // From the middle of the picture: G1 is its top left corner, G2 its bottom right one.
    expect(focusOf(graphic, floor, wide, held, 0, 0.9, Math.atan2(-1, -0.4))?.id).toBe("G1");
    const spot = focusOf(graphic, floor, wide, held, 0, 0.9, Math.atan2(1, 0.4));
    expect(spot?.id).toBe("G2");
    // Standing on G2, facing G1: still G2.
    expect(focusOf(graphic, floor, wide, held, spot!.x, spot!.z, Math.atan2(-1, -0.4))?.id).toBe("G2");
  });
});

describe("throw to its partner (match)", () => {
  /** Three capitals and two countries; a country may take two capitals. */
  const match: ArenaSpec = {
    ...base,
    kind: "match",
    choices: [
      { id: "PARIS", label: "Paris" },
      { id: "LYON", label: "Lyon" },
      { id: "ROME", label: "Rome" },
    ],
    targets: [
      { id: "FR", label: "France", matchMax: 2 },
      { id: "IT", label: "Italy" },
    ],
    correct: ["PARIS FR", "LYON FR", "ROME IT"],
  };
  const matchPads = layoutPads(match, wide);
  const at = (id: string) => matchPads.find((p) => p.id === id)!;
  const hop = (ids: string[], from: Answer = emptyAnswer()) => ids.reduce((answer, id) => stomp(match, answer, at(id)).answer, from);
  const held = hop(["PARIS"]);

  it("throws in a match of two lists, not in one laid out as a table", () => {
    expect(throws(match)).toBe(true);
    expect(throws({ ...match, tabular: true })).toBe(false);
    expect(throws({ ...match, kind: "order" })).toBe(false);
  });

  it("picks one up with a jump", () => {
    expect(held.pending).toBe("PARIS");
    expect(held.pairs).toEqual([]);
  });

  it("aims at the partner in front of the hero's nose, and at nothing with empty hands", () => {
    const fr = at("FR");
    const it = at("IT");
    expect(focusOf(match, matchPads, wide, emptyAnswer(), 0, -1, 0)).toBeNull();
    expect(focusOf(match, matchPads, wide, held, 0, -1, Math.atan2(fr.x, fr.z + 1))?.id).toBe("FR");
    expect(focusOf(match, matchPads, wide, held, 0, -1, Math.atan2(it.x, it.z + 1))?.id).toBe("IT");
  });

  it("aims at nothing on one of the first list: there a jump picks that one up", () => {
    expect(focusOf(match, matchPads, wide, held, at("ROME").x, at("ROME").z, 0)).toBeNull();
  });

  it("pairs what was thrown with the partner it lands on", () => {
    const thrown = throwInto(match, emptyAnswer(), "PARIS", "FR").answer;
    expect(thrown.pending).toBeNull();
    expect(toResponse(match, thrown)).toEqual(["PARIS FR"]);
  });

  it("pairs the same way with a jump on the partner", () => {
    expect(toResponse(match, hop(["PARIS", "FR", "ROME", "IT"]))).toEqual(["PARIS FR", "ROME IT"]);
  });

  it("moves one that is thrown at another partner", () => {
    const first = throwInto(match, emptyAnswer(), "PARIS", "IT").answer;
    expect(toResponse(match, throwInto(match, first, "PARIS", "FR").answer)).toEqual(["PARIS FR"]);
  });

  it("makes room on a partner that is full: its oldest pair goes", () => {
    const rome = throwInto(match, emptyAnswer(), "ROME", "IT").answer;
    expect(toResponse(match, throwInto(match, rome, "LYON", "IT").answer)).toEqual(["LYON IT"]);
    // France takes two: the third pushes out the first.
    const two = throwInto(match, throwInto(match, emptyAnswer(), "PARIS", "FR").answer, "LYON", "FR").answer;
    expect(toResponse(match, two)).toEqual(["PARIS FR", "LYON FR"]);
    expect(toResponse(match, throwInto(match, two, "ROME", "FR").answer)).toEqual(["LYON FR", "ROME FR"]);
  });

  it("keeps a pair that is made again", () => {
    const pair = throwInto(match, emptyAnswer(), "PARIS", "FR").answer;
    const again = throwInto(match, pair, "PARIS", "FR").answer;
    expect(again.pending).toBeNull();
    expect(toResponse(match, again)).toEqual(["PARIS FR"]);
  });

  it("lets go of one, and of its pair, with a second jump on it", () => {
    const pair = hop(["PARIS", "FR"]);
    expect(hop(["PARIS", "PARIS"], pair).pairs).toEqual([]);
  });

  it("explains empty hands on a partner", () => {
    const result = stomp(match, emptyAnswer(), at("FR"));
    expect(result.nudge).toMatch(/pick it up/);
    expect(result.answer.pairs).toEqual([]);
  });

  it("drops what is still in hand when the answer is handed in", () => {
    const result = stomp(match, hop(["ROME"], hop(["PARIS", "FR"])), at("__check"));
    expect(result.submit).toBe(true);
    expect(result.answer.pending).toBeNull();
    expect(toResponse(match, result.answer)).toEqual(["PARIS FR"]);
  });

  it("marks the partner that is aimed at, and tells how it is played", () => {
    expect(padViews(match, matchPads, held, "playing", "IT").IT.aimed).toBe(true);
    expect(padViews(match, matchPads, held, "playing", "IT").FR.aimed).toBeUndefined();
    expect(howTo(match, wide)).toMatch(/throw/);
  });
});

describe("type the answer (text entry)", () => {
  const number: ArenaSpec = { ...base, kind: "entry", keys: [..."0123456789"], maxLength: 4, accepted: ["42"], correct: ["42"] };
  const word: ArenaSpec = { ...base, kind: "entry", keys: [..."abcdefghijklmnopqrstuvwxyz", " "], maxLength: 6, accepted: ["Paris"], correct: ["Paris"] };
  const typed = (spec: ArenaSpec, text: string, from: Answer = emptyAnswer()) => typeInto(spec, from, text);

  it("tells a number from a word", () => {
    expect(entryMode(number)).toBe("number");
    expect(entryMode(word)).toBe("word");
  });

  it("keeps the digits to hop on for a number, on a wide screen and on a phone", () => {
    for (const field of [wide, fieldFor(true)]) {
      const roles = layoutPads(number, field).map((p) => p.role);
      expect(roles.filter((role) => role === "key")).toHaveLength(10);
      expect(roles).toContain("back");
      expect(roles).toContain("check");
    }
  });

  it("has no pads for the letters of a word: only ✔", () => {
    for (const field of [wide, fieldFor(true)]) expect(layoutPads(word, field).map((p) => p.role)).toEqual(["check"]);
  });

  it("takes whatever is typed for a word, also what there never were pads for", () => {
    expect(typed(word, "Saint-Étienne 2").digits).toBe("Saint-Étienne 2");
    expect(typed(word, "  Paris").digits).toBe("Paris");
    expect(typed(word, "Pa\tris\n").digits).toBe("Paris");
  });

  it("keeps only what a number is written with", () => {
    expect(typed(number, "4x2").digits).toBe("42");
    expect(typed(number, "-3,5 kg").digits).toBe("-3,5");
    expect(typed(number, "abc").digits).toBe("");
  });

  it("gives back the same answer when nothing changed, so nothing is redrawn", () => {
    const answer = typed(number, "42");
    expect(typed(number, "42", answer)).toBe(answer);
    expect(typed(number, "4w2", answer)).toBe(answer);
  });

  it("lets a typed answer run longer than the board, but not without end", () => {
    expect(typed(word, "a".repeat(30)).digits).toHaveLength(30);
    expect(typed(word, "a".repeat(200)).digits).toHaveLength(40);
  });

  it("hands in what was typed, in the item's own spelling when it only differs in case", () => {
    expect(toResponse(word, typed(word, "paris "))).toBe("Paris");
    expect(toResponse(word, typed(word, "Lyon"))).toBe("Lyon");
    expect(toResponse(number, typed(number, "42"))).toBe("42");
  });

  it("fills the same answer from the floor and from the keyboard", () => {
    const pads = layoutPads(number, wide);
    const hopped = stomp(number, typed(number, "4"), pads.find((p) => p.id === "2")!).answer;
    expect(hopped.digits).toBe("42");
    expect(stomp(number, hopped, pads.find((p) => p.role === "back")!).answer.digits).toBe("4");
  });

  it("asks for an answer before it checks", () => {
    const check = (spec: ArenaSpec) => stomp(spec, emptyAnswer(), layoutPads(spec, wide).find((p) => p.role === "check")!);
    expect(check(word).nudge).toMatch(/Type your answer/);
    expect(check(number).nudge).toMatch(/Type your number/);
    expect(stomp(word, typed(word, "Paris"), layoutPads(word, wide)[0]).submit).toBe(true);
  });

  it("shows the answer on the board: a place per character, or plainly when it is longer", () => {
    expect(displayText(number, typed(number, "42"))).toBe("4 2 _");
    expect(displayText(word, typed(word, "the cat sat"))).toBe("the cat sat_");
  });

  it("tells how it is played", () => {
    expect(howTo(word, wide)).toMatch(/Type your answer/);
    expect(howTo(number, wide)).toMatch(/hop on the digits/);
  });
});

describe("a row to rearrange (order)", () => {
  const order: ArenaSpec = {
    ...base,
    kind: "order",
    choices: [
      { id: "C", label: "three" },
      { id: "A", label: "one" },
      { id: "B", label: "two" },
    ],
    correct: ["A", "B", "C"],
  };
  const row = layoutPads(order, wide);
  const slot = (i: number) => row.find((p) => p.id === slotId(i))!;
  const hops = (slots: number[], from: Answer = startAnswer(order)) => slots.reduce((answer, i) => stomp(order, answer, slot(i)).answer, from);

  it("lays out a place for every choice, and ✔", () => {
    expect(row.filter((p) => p.role === "choice").map((p) => p.slot)).toEqual([0, 1, 2]);
    expect(row.some((p) => p.role === "check")).toBe(true);
  });

  it("starts with every choice in the row, in the order the item shows them", () => {
    expect(toResponse(order, startAnswer(order))).toEqual(["C", "A", "B"]);
  });

  it("mixes the row when the item's own order is the answer, the same way every time", () => {
    const mixed = startOrder(["A", "B", "C"], ["A", "B", "C"]);
    expect(mixed).not.toEqual(["A", "B", "C"]);
    expect([...mixed].sort()).toEqual(["A", "B", "C"]);
    expect(startOrder(["A", "B", "C"], ["A", "B", "C"])).toEqual(mixed);
    // Nothing is declared: nothing to keep away from.
    expect(startOrder(["A", "B", "C"], [])).toEqual(["A", "B", "C"]);
  });

  it("lifts one out and leaves its place empty", () => {
    const lifted = hops([0]);
    expect(lifted.pending).toBe("C");
    const views = padViews(order, row, lifted, "playing");
    expect(views[slotId(0)]).toMatchObject({ mark: "", badge: "1" });
    expect(views[slotId(1)]).toMatchObject({ mark: "one", badge: "2" });
  });

  it("puts it in where the hero jumps, and the others move over", () => {
    const moved = hops([0, 2]);
    expect(moved.pending).toBeNull();
    expect(toResponse(order, moved)).toEqual(["A", "B", "C"]);
    // And back to the front again.
    expect(toResponse(order, hops([2, 0], moved))).toEqual(["C", "A", "B"]);
  });

  it("puts it back with a second jump on its own place", () => {
    expect(toResponse(order, hops([1, 1]))).toEqual(["C", "A", "B"]);
  });

  it("hands in a whole row at any time, and puts back what is still in hand", () => {
    const checked = stomp(order, hops([0]), row.find((p) => p.role === "check")!);
    expect(checked.submit).toBe(true);
    expect(checked.answer.pending).toBeNull();
    expect(toResponse(order, checked.answer)).toEqual(["C", "A", "B"]);
  });

  it("shows what stands where, and the place the hero would put down on", () => {
    const views = padViews(order, row, hops([0]), "playing", slotId(2));
    expect(views[slotId(2)]).toMatchObject({ mark: "two", badge: "3", aimed: true });
    expect(focusOf(order, row, wide, hops([0]), slot(2).x, slot(2).z, 0)?.id).toBe(slotId(2));
    expect(focusOf(order, row, wide, startAnswer(order), slot(2).x, slot(2).z, 0)).toBeNull();
  });

  it("puts the row in the declared order for show answer", () => {
    expect(toResponse(order, revealAnswer(order))).toEqual(["A", "B", "C"]);
  });

  it("gives every place in a list the room of the longest choice", () => {
    const long: ArenaSpec = { ...order, choices: [...order.choices, { id: "D", label: "a much longer choice that needs two lines beside its pad" }] };
    const upright = layoutPads(long, fieldFor(true)).filter((p) => p.role === "choice");
    expect(new Set(upright.map((p) => p.high?.toFixed(3))).size).toBe(1);
    expect(upright.every((p) => p.overlay)).toBe(true);
  });
});

describe("a fork in the road (a choice between two)", () => {
  const yesNo: ArenaSpec = {
    ...base,
    kind: "choice",
    choices: [
      { id: "Y", label: "Yes" },
      { id: "N", label: "No" },
    ],
    correct: ["Y"],
  };
  const gates = layoutPads(yesNo, wide);
  const [startX, startZ] = spawnOf(yesNo, wide);

  it("is any single choice between two, not one between more or one with several answers", () => {
    expect(isFork(yesNo, wide)).toBe(true);
    expect(isFork({ ...yesNo, choices: [...yesNo.choices, { id: "M", label: "Maybe" }] }, wide)).toBe(false);
    expect(isFork({ ...yesNo, multiple: true }, wide)).toBe(false);
  });

  it("puts the first choice on the left and the second on the right, level with the start", () => {
    expect(gates.map((p) => [p.id, p.gate])).toEqual([
      ["Y", "left"],
      ["N", "right"],
    ]);
    expect(gates[0].x).toBeLessThan(0);
    expect(gates[1].x).toBe(-gates[0].x);
    expect(startX).toBe(0);
    expect(gates.every((p) => p.z === startZ)).toBe(true);
  });

  it("lights up the side the hero steps towards, and nothing in the middle", () => {
    expect(focusOf(yesNo, gates, wide, emptyAnswer(), 0.2, startZ, 0)).toBeNull();
    expect(focusOf(yesNo, gates, wide, emptyAnswer(), -2, startZ, 0)?.id).toBe("Y");
    expect(focusOf(yesNo, gates, wide, emptyAnswer(), 2, startZ, 0)?.id).toBe("N");
    expect(padViews(yesNo, gates, emptyAnswer(), "playing", "N").N.look).toBe("selected");
  });

  it("answers at the gate", () => {
    const result = stomp(yesNo, emptyAnswer(), gates[1]);
    expect(result.submit).toBe(true);
    expect(toResponse(yesNo, result.answer)).toBe("N");
  });

  it("closes a side that was wrong", () => {
    const wrong = { ...emptyAnswer(), eliminated: ["N"] };
    expect(focusOf(yesNo, gates, wide, wrong, 2, startZ, 0)).toBeNull();
    expect(padViews(yesNo, gates, wrong, "playing", null).N.look).toBe("gone");
  });

  it("says how it is played", () => {
    expect(howTo(yesNo, wide)).toMatch(/left or right/);
  });

  it("stays a list on an upright phone when the choices are long", () => {
    const upright = fieldFor(true);
    expect(isFork(yesNo, upright)).toBe(true);
    expect(overflowsPortrait(yesNo, upright)).toBe(false);
    const wordy: ArenaSpec = {
      ...yesNo,
      choices: [
        { id: "Y", label: "Yes, because the two sides are equally long" },
        { id: "N", label: "No, because one of the sides is longer than the other" },
      ],
    };
    expect(isFork(wordy, upright)).toBe(false);
    expect(isFork(wordy, wide)).toBe(true);
    expect(layoutPads(wordy, upright).some((p) => p.gate)).toBe(false);
  });
});
