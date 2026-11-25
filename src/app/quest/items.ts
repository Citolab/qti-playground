/**
 * The quest's questions: plain, portable QTI 3 items for children of about
 * 10-11 (group 7 / grade 5). Each one scores itself through its own response
 * processing (SCORE 1 or 0); the game only decides where an item lives in the
 * world, how you answer it, and turns its SCORE into stars.
 *
 * The maths is the same in every world. Only the little story around it
 * changes with the theme.
 */
import type { ThemeId } from "./themes";

export interface QuestItem {
  id: string;
  title: string;
  /** What the guide says after a wrong try; a general nudge when the item has none. */
  hint?: string;
  /** A reading text or figure the question refers to, as safe HTML. */
  stimulus?: { title: string; html: string };
  /**
   * Answered in writing (an essay). Nothing can score it, so it is not checked:
   * you hand it in, and its chest opens without stars.
   */
  writing?: boolean;
  /** What the question belongs with: the shared text it is about. Questions of one group are kept together in the world. */
  group?: string;
  /** The item's own stylesheets, so pictures in its choices look the way its author styled them. */
  stylesheets?: string[];
  /**
   * Played as a mini game in a dialog, with the real interaction: for kinds the
   * game has no jump stage for (gap match, hottext, a custom interaction, ...).
   */
  dialog?: boolean;
  /** Where the item lives in the package cache; a custom interaction loads its modules from there. */
  href?: string;
  /** The full score, worked out from the declarations, for an item that does not declare MAXSCORE. */
  maxScore?: number;
  xml: string;
}

const NS = `xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"`;

/** SCORE 1 when RESPONSE matches the correct response, else 0. Written out rather than a template URL, so it scores offline. */
const MATCH_CORRECT = `
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match>
          <qti-variable identifier="RESPONSE"/>
          <qti-correct identifier="RESPONSE"/>
        </qti-match>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>`;

const item = (id: string, title: string, responseDeclaration: string, body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item ${NS} identifier="${id}" title="${title}" adaptive="false" time-dependent="false" xml:lang="en">
  ${responseDeclaration}
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>1</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
${body}
  </qti-item-body>${MATCH_CORRECT}
</qti-assessment-item>`;

const single = (baseType: string, value: string) =>
  `<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="${baseType}">
    <qti-correct-response><qti-value>${value}</qti-value></qti-correct-response>
  </qti-response-declaration>`;

const many = (cardinality: "multiple" | "ordered", baseType: string, values: string[]) =>
  `<qti-response-declaration identifier="RESPONSE" cardinality="${cardinality}" base-type="${baseType}">
    <qti-correct-response>${values.map((v) => `<qti-value>${v}</qti-value>`).join("")}</qti-correct-response>
  </qti-response-declaration>`;

const svg = (markup: string, width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${markup}</svg>`,
  )}`;

const rectangle = (label: string, fill: string, stroke: string) =>
  svg(
    `<rect x="20" y="24" width="240" height="160" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
   <text x="140" y="16" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#1f2937">12 m</text>
   <text x="270" y="110" font-family="sans-serif" font-size="16" fill="#1f2937">8 m</text>
   <text x="140" y="110" font-family="sans-serif" font-size="18" text-anchor="middle" fill="${stroke}">${label}</text>`,
    310,
    200,
  );

/** The words that change from world to world. */
interface Story {
  multiply: { title: string; text: string; question: string; unit: string };
  decimals: { title: string; text: string; question: string; names: [string, string, string, string] };
  order: { title: string };
  percent: { title: string; text: string; after: string };
  match: { title: string };
  slider: { title: string; text: string; prompt: string };
  area: { title: string; text: string; label: string; fill: string; stroke: string; thing: string };
  length: { title: string; text: string };
  angles: { title: string; text: string };
  boss: { title: string; text: string; who: string; vehicle: string; vehicles: string };
}

const STORIES: Record<ThemeId, Story> = {
  knights: {
    multiply: {
      title: "The king's army",
      text: "The king's army stands in <strong>48</strong> rows. Every row has <strong>25</strong> knights.",
      question: "How many knights are there in total?",
      unit: "knights",
    },
    decimals: {
      title: "The longest leap",
      text: "Four horses jumped over the moat. These are their jumps in metres.",
      question: "Which horse jumped the <strong>furthest</strong>?",
      names: ["Thunder", "Blaze", "Arrow", "Pepper"],
    },
    order: { title: "Count the gold coins" },
    percent: { title: "The dragon's dinner", text: "The dragon ate <strong>¾</strong> of the giant pie.", after: "of the pie." },
    match: { title: "Shield pairs" },
    slider: {
      title: "The blacksmith",
      text: "The blacksmith made <strong>250</strong> horseshoes. The knights use <strong>30%</strong> of them today.",
      prompt: "How many horseshoes do the knights use?",
    },
    area: {
      title: "The courtyard",
      text: "The knights train in the castle courtyard.",
      label: "courtyard",
      fill: "#e7cf96",
      stroke: "#7a4b25",
      thing: "courtyard",
    },
    length: { title: "The road to the castle", text: "The road to the castle is <strong>2.5 km</strong> long." },
    angles: { title: "The shield maker", text: "The shield maker makes shields in different shapes." },
    boss: {
      title: "The royal feast",
      text: "The king invites a school to a feast in the castle.",
      who: "<strong>125 children</strong> and <strong>9 teachers</strong>",
      vehicle: "carriage train",
      vehicles: "carriage trains",
    },
  },
  princess: {
    multiply: {
      title: "The rose garden",
      text: "The royal garden has <strong>48</strong> rows of roses. Every row has <strong>25</strong> roses.",
      question: "How many roses are there in total?",
      unit: "roses",
    },
    decimals: {
      title: "The unicorn show",
      text: "Four unicorns had a jumping contest. These are their jumps in metres.",
      question: "Which unicorn jumped the <strong>furthest</strong>?",
      names: ["Stardust", "Moonbeam", "Twinkle", "Glitter"],
    },
    order: { title: "Sort the pearls" },
    percent: { title: "The birthday cake", text: "The guests ate <strong>¾</strong> of the birthday cake.", after: "of the cake." },
    match: { title: "Jewel pairs" },
    slider: {
      title: "The fairy's diamonds",
      text: "The fairy has <strong>250</strong> diamonds. She gives away <strong>30%</strong> of them.",
      prompt: "How many diamonds does the fairy give away?",
    },
    area: {
      title: "The ballroom",
      text: "The palace ballroom gets a new dance floor.",
      label: "dance floor",
      fill: "#fde4f0",
      stroke: "#be185d",
      thing: "dance floor",
    },
    length: { title: "The path to the palace", text: "The path to the palace is <strong>2.5 km</strong> long." },
    angles: { title: "The palace windows", text: "The palace has windows in different shapes." },
    boss: {
      title: "The grand ball",
      text: "The queen invites a school to the grand ball in the palace.",
      who: "<strong>125 children</strong> and <strong>9 teachers</strong>",
      vehicle: "royal coach",
      vehicles: "royal coaches",
    },
  },
  aliens: {
    multiply: {
      title: "The rocket fleet",
      text: "The space fleet is parked in <strong>48</strong> rows. Every row has <strong>25</strong> rockets.",
      question: "How many rockets are there in total?",
      unit: "rockets",
    },
    decimals: {
      title: "Moon jumping",
      text: "Four aliens had a jumping contest on the moon. These are their jumps in metres.",
      question: "Which alien jumped the <strong>furthest</strong>?",
      names: ["Zib", "Quark", "Moxi", "Blorp"],
    },
    order: { title: "Sort the star codes" },
    percent: { title: "Robot battery", text: "The robot has used <strong>¾</strong> of its battery.", after: "of the battery." },
    match: { title: "Signal pairs" },
    slider: {
      title: "Rocket fuel",
      text: "The rocket has <strong>250</strong> litres of fuel. It uses <strong>30%</strong> to take off.",
      prompt: "How many litres does the rocket use to take off?",
    },
    area: {
      title: "The landing pad",
      text: "The aliens build a new landing pad.",
      label: "landing pad",
      fill: "#c9c2f0",
      stroke: "#4c1d95",
      thing: "landing pad",
    },
    length: { title: "The moon rover", text: "The moon rover drives <strong>2.5 km</strong> to the crater." },
    angles: { title: "Space station panels", text: "The space station has solar panels in different shapes." },
    boss: {
      title: "Trip to the mothership",
      text: "The aliens invite a school to visit the mothership.",
      who: "<strong>125 children</strong> and <strong>9 teachers</strong>",
      vehicle: "space shuttle",
      vehicles: "space shuttles",
    },
  },
};

const DIGITS_ONLY = `pattern-mask="^[0-9]*$" data-patternmask-message="Use digits only"`;

export function buildItems(theme: ThemeId): QuestItem[] {
  const s = STORIES[theme];
  return [
    // ── Zone 1: numbers & calculating ────────────────────────────────
    {
      id: "multiply",
      title: s.multiply.title,
      hint: "Try 48 × 100 first, then take a quarter of it. 25 is a quarter of 100!",
      xml: item(
        `quest-${theme}-multiply`,
        s.multiply.title,
        single("integer", "1200"),
        `    <p>${s.multiply.text}</p>
    <p>${s.multiply.question}
      <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="4" ${DIGITS_ONLY}/> ${s.multiply.unit}
    </p>`,
      ),
    },
    {
      id: "decimals",
      title: s.decimals.title,
      hint: "Write all the numbers with the same number of decimals: 0.650, 0.605, 0.700, 0.070.",
      xml: item(
        `quest-${theme}-decimals`,
        s.decimals.title,
        single("identifier", "C"),
        `    <p>${s.decimals.text}</p>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt>${s.decimals.question}</qti-prompt>
      <qti-simple-choice identifier="A">${s.decimals.names[0]}: 0.65 m</qti-simple-choice>
      <qti-simple-choice identifier="B">${s.decimals.names[1]}: 0.605 m</qti-simple-choice>
      <qti-simple-choice identifier="C">${s.decimals.names[2]}: 0.7 m</qti-simple-choice>
      <qti-simple-choice identifier="D">${s.decimals.names[3]}: 0.07 m</qti-simple-choice>
    </qti-choice-interaction>`,
      ),
    },
    {
      id: "order",
      title: s.order.title,
      hint: "Look at the thousands first, then the hundreds. Which number has the fewest thousands?",
      xml: item(
        `quest-${theme}-order`,
        s.order.title,
        many("ordered", "identifier", ["N4", "N2", "N1", "N3"]),
        `    <qti-order-interaction response-identifier="RESPONSE" shuffle="false">
      <qti-prompt>Put the numbers in order from <strong>smallest</strong> to <strong>largest</strong>.</qti-prompt>
      <qti-simple-choice identifier="N1">10 099</qti-simple-choice>
      <qti-simple-choice identifier="N2">9 990</qti-simple-choice>
      <qti-simple-choice identifier="N3">10 909</qti-simple-choice>
      <qti-simple-choice identifier="N4">9 909</qti-simple-choice>
    </qti-order-interaction>`,
      ),
    },

    // ── Zone 2: fractions & percentages ──────────────────────────────
    {
      id: "percent",
      title: s.percent.title,
      hint: "Percent means 'out of 100'. How many hundredths is three quarters?",
      xml: item(
        `quest-${theme}-percent`,
        s.percent.title,
        single("identifier", "P75"),
        `    <p>${s.percent.text}</p>
    <p>That is
      <qti-inline-choice-interaction response-identifier="RESPONSE" shuffle="false">
        <qti-inline-choice identifier="P34">34%</qti-inline-choice>
        <qti-inline-choice identifier="P43">43%</qti-inline-choice>
        <qti-inline-choice identifier="P70">70%</qti-inline-choice>
        <qti-inline-choice identifier="P75">75%</qti-inline-choice>
      </qti-inline-choice-interaction>
      ${s.percent.after}</p>`,
      ),
    },
    {
      id: "match",
      title: s.match.title,
      hint: "Divide the top number by the bottom number. ½ is 1 ÷ 2.",
      xml: item(
        `quest-${theme}-match`,
        s.match.title,
        many("multiple", "directedPair", ["F1 D3", "F2 D1", "F3 D2"]),
        `    <qti-match-interaction response-identifier="RESPONSE" max-associations="3" shuffle="false">
      <qti-prompt>Match each fraction with the decimal number that has the same value.</qti-prompt>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="F1" match-max="1">½</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="F2" match-max="1">¼</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="F3" match-max="1">⅕</qti-simple-associable-choice>
      </qti-simple-match-set>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="D1" match-max="1">0.25</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D2" match-max="1">0.2</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D3" match-max="1">0.5</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>`,
      ),
    },
    {
      id: "slider",
      title: s.slider.title,
      hint: "10% of 250 is 25. How many times 10% is 30%?",
      xml: item(
        `quest-${theme}-slider`,
        s.slider.title,
        single("integer", "75"),
        `    <p>${s.slider.text}</p>
    <qti-slider-interaction response-identifier="RESPONSE" lower-bound="0" upper-bound="250" step="5" step-label="false">
      <qti-prompt>${s.slider.prompt}</qti-prompt>
    </qti-slider-interaction>`,
      ),
    },

    // ── Zone 3: measuring & shapes ───────────────────────────────────
    {
      id: "area",
      title: s.area.title,
      hint: "Area is length × width. The distance around it (the perimeter) is something else!",
      xml: item(
        `quest-${theme}-area`,
        s.area.title,
        single("identifier", "B"),
        `    <p>${s.area.text}</p>
    <p><img src="${rectangle(s.area.label, s.area.fill, s.area.stroke)}" alt="A rectangle 12 metres long and 8 metres wide" width="310" height="200"/></p>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt>What is the <strong>area</strong> of the ${s.area.thing}?</qti-prompt>
      <qti-simple-choice identifier="A">40 m²</qti-simple-choice>
      <qti-simple-choice identifier="B">96 m²</qti-simple-choice>
      <qti-simple-choice identifier="C">20 m²</qti-simple-choice>
      <qti-simple-choice identifier="D">96 m</qti-simple-choice>
    </qti-choice-interaction>`,
      ),
    },
    {
      id: "length",
      title: s.length.title,
      hint: "1 kilometre is 1000 metres. So what is 2½ kilometres?",
      xml: item(
        `quest-${theme}-length`,
        s.length.title,
        single("integer", "2500"),
        `    <p>${s.length.text}</p>
    <p>How many metres is that?
      <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="4" ${DIGITS_ONLY}/> m
    </p>`,
      ),
    },
    {
      id: "angles",
      title: s.angles.title,
      hint: "A right angle looks like the corner of a sheet of paper. Check every corner of each shape.",
      xml: item(
        `quest-${theme}-angles`,
        s.angles.title,
        many("multiple", "identifier", ["SQ", "RE"]),
        `    <p>${s.angles.text}</p>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="4">
      <qti-prompt>Which shapes <strong>always</strong> have four right angles? Choose all the right answers.</qti-prompt>
      <qti-simple-choice identifier="SQ">square</qti-simple-choice>
      <qti-simple-choice identifier="RH">rhombus</qti-simple-choice>
      <qti-simple-choice identifier="RE">rectangle</qti-simple-choice>
      <qti-simple-choice identifier="TR">trapezium</qti-simple-choice>
    </qti-choice-interaction>`,
      ),
    },

    // ── The final challenge ──────────────────────────────────────────
    {
      id: "boss",
      title: s.boss.title,
      hint: "First count everyone who goes: children and teachers together. Nobody may stay behind, so the last one may be partly empty!",
      xml: item(
        `quest-${theme}-boss`,
        s.boss.title,
        single("integer", "4"),
        `    <p>${s.boss.text}</p>
    <p>${s.boss.who} are going. One ${s.boss.vehicle} can take <strong>40 people</strong>.</p>
    <p>How many ${s.boss.vehicles} are needed so that everyone can come?
      <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="2" ${DIGITS_ONLY}/> ${s.boss.vehicles}
    </p>`,
      ),
    },
  ];
}
