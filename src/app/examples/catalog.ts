/**
 * The showcase packages under `public/examples/<id>/`.
 *
 * They are kept as loose files rather than ready-made ZIPs so they stay
 * readable and diffable; `buildExamplePackage` zips them in the browser and
 * hands the result to the same import path an uploaded package takes, so an
 * example exercises exactly what a user's own package would.
 */
import type { AssessmentLayoutMode } from "../qti/layout-mode";
import type { PlayerMode } from "../qti/session-options";

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
  /** How the test is presented, in words, for the card. */
  presentation: string;
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
    presentation: "One question per screen, with a practice coach",
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
  },
];

export const exampleBasePath = (id: string) => `/examples/${id}/`;

export const exampleCoverUrl = (id: string) => `${exampleBasePath(id)}cover.svg`;

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
