/**
 * The showcase packages under `public/examples/<id>/`.
 *
 * They are kept as loose files rather than ready-made ZIPs so they stay
 * readable and diffable; `buildExamplePackage` zips them in the browser and
 * hands the result to the same import path an uploaded package takes, so an
 * example exercises exactly what a user's own package would.
 */
import type { AssessmentLayoutMode } from "../qti/layout-mode";
import type { CoachCharacter, PlayerMode } from "../qti/session-options";

export type ExamplePackage = {
  id: string;
  title: string;
  subject: string;
  audience: string;
  description: string;
  /** Interaction types the package shows off, as labels for the card. */
  interactions: string[];
  /**
   * The player layout the example opens in. Each example shows off a different
   * one, so between them they cover every way the player presents a test.
   */
  layout: AssessmentLayoutMode;
  /** Practice mode brings the coach; left out, the example plays as a test. */
  mode?: PlayerMode;
  /** Who coaches in practice mode; Sprout when left out. */
  coach?: CoachCharacter;
  /** How the test is presented, in words, for the card. */
  presentation: string;
  /**
   * The landing-page headline: what the example shows the player doing, not
   * what the test is about.
   */
  pitch: string;
  /**
   * The colours under the example's `backdrop.svg`, a transparent tile. In
   * practice mode the page around the player takes on the example's setting.
   */
  backdropColors: [string, string];
};

export const EXAMPLE_PACKAGES: ExamplePackage[] = [
  {
    id: "solar-system",
    title: "Journey Through the Solar System",
    subject: "Science",
    audience: "Ages 10–14",
    description:
      "Spot the Red Planet, put the planets in order and click your way around the Sun. A tour of picture-rich interactions.",
    interactions: [
      "Image choice",
      "Order",
      "Match",
      "Hotspot",
      "Text entry",
      "Inline choice",
      "Extended text",
    ],
    layout: "classic",
    mode: "practice",
    coach: "martian",
    presentation: "One question per screen, with a practice coach",
    pitch: "A coach at your side, one question at a time.",
    backdropColors: ["#1d3466", "#0a142b"],
  },
  {
    id: "everyday-maths",
    title: "Everyday Maths",
    subject: "Mathematics",
    audience: "Ages 10–14",
    description:
      "Fractions, pizzas and coordinates: maths in MathML, a point to place on a grid and a slider to estimate with.",
    interactions: [
      "MathML choice",
      "Select point",
      "Text entry",
      "Gap match",
      "Slider",
      "Order",
    ],
    layout: "vertical",
    presentation: "The whole test on one scrolling page",
    pitch: "Scroll through it like paper.",
    backdropColors: ["#00b85a", "#00913f"],
  },
  {
    id: "reading-lab",
    title: "Reading Lab",
    subject: "English",
    audience: "Ages 9–12",
    description:
      "A story and an information text, each shared by three questions. Every text is shown once, on one page with all of its questions.",
    interactions: [
      "Shared stimulus",
      "Choice",
      "Inline choice",
      "Gap match",
      "Hottext",
      "Extended text",
    ],
    layout: "classic",
    presentation: "One page per text, with its questions",
    pitch: "Read once, answer many.",
    backdropColors: ["#0f4c5c", "#138a95"],
  },
  {
    id: "social-statistics",
    title: "Statistics for the Social Sciences",
    subject: "Statistics",
    audience: "University, year 1",
    description:
      "A midterm practice exam: boxplots, residuals, a spurious correlation to diagram and an ANOVA table to complete.",
    interactions: [
      "Inline choice",
      "Text entry",
      "Match",
      "Hotspot",
      "Order",
      "Graphic gap match",
      "Extended text",
      "Match table",
      "Multiple response",
    ],
    layout: "classic",
    presentation: "One question per screen, in three scored parts",
    pitch: "A real exam, scored part by part.",
    backdropColors: ["#3730a3", "#1e1b4b"],
  },
];

export const exampleBasePath = (id: string) => `/examples/${id}/`;

export const exampleCoverUrl = (id: string) => `${exampleBasePath(id)}cover.svg`;

/**
 * The CSS background behind the player for an example in practice mode, or
 * undefined for anything that is not one of the examples. The id comes from
 * the URL, so only a catalog entry is turned into a background.
 */
export function exampleBackdrop(id: string | null): string | undefined {
  const example = EXAMPLE_PACKAGES.find((e) => e.id === id);
  if (!example) return undefined;
  const [from, to] = example.backdropColors;
  return `url(${exampleBasePath(example.id)}backdrop.svg), linear-gradient(135deg, ${from}, ${to})`;
}

/**
 * Fetch every file the example's manifest lists and zip them into a package.
 *
 * The manifest is the file list: anything it does not name would not be in a
 * real package either. A missing file is an error rather than a gap, and the
 * content type is checked because the dev server's SPA fallback answers an
 * unknown path with index.html and a 200.
 */
export async function buildExamplePackage(id: string): Promise<File> {
  const base = exampleBasePath(id);
  const manifestResponse = await fetch(`${base}imsmanifest.xml`);
  if (!manifestResponse.ok) {
    throw new Error(`Example "${id}" has no manifest.`);
  }
  const manifest = await manifestResponse.text();
  const manifestDoc = new DOMParser().parseFromString(
    manifest,
    "application/xml",
  );
  const hrefs = new Set(
    Array.from(manifestDoc.getElementsByTagName("file"))
      .map((file) => file.getAttribute("href"))
      .filter((href): href is string => Boolean(href)),
  );

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file("imsmanifest.xml", manifest);
  await Promise.all(
    Array.from(hrefs).map(async (href) => {
      const response = await fetch(`${base}${href}`);
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || type.startsWith("text/html")) {
        throw new Error(`Example "${id}" is missing ${href}.`);
      }
      zip.file(href, await response.blob());
    }),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], `${id}.zip`, { type: "application/zip" });
}
