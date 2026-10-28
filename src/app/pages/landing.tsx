import React, { useCallback, useMemo, useRef, useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Bookmark,
  Boxes,
  Code2,
  FileCode2,
  FlaskConical,
  Layers,
  LayoutPanelLeft,
  Lock,
  Mail,
  PenLine,
  Play,
  Puzzle,
  Repeat,
  Share2,
  Terminal,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";

import { itemCss } from "../itemCss";
import { QtiCitolabEditorPanel } from "../components/editor/qti-citolab-editor-panel";
import { useScopedQtiRegistry } from "../use-scoped-registry";
import { QtiAssessmentItem } from "@citolab/qti-components";
import { PAGE_CONTAINER, PAGE_GUTTER } from "../components/page-shell";
import { CitolabLogo } from "../components/citolab-logo";
import { CoachAvatar, type CoachMood } from "../components/practice-coach";
import { GithubMark } from "../components/github-mark";
import { ExampleGallery } from "../examples/example-gallery";
import { cn } from "@/lib/utils";

// The live item in the hero: a real item from the Solar System example, loaded
// by URL the way a host application would load one, so its images resolve
// against the item's own folder.
const HERO_ITEM_URL = "/examples/solar-system/item-01.xml";

// Held in the editor's own serialisation, not hand-written QTI: the exporter rebuilds the item
// from the ProseMirror document, so any other shape would be rewritten into this one the moment
// the editor settled -- and the XML pane below sits right next to it. Note the exporter's own
// opinions are baked in here as a result: it fills in SCORE/MAXSCORE and the match_correct
// template, and it does not carry `min-choices` or `shuffle` through.
const LANDING_CHOICE_ITEM_XML = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd" identifier="landing-choice-editor" title="Landing Choice Editor" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"></qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>1</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <qti-choice-interaction max-choices="1" response-identifier="RESPONSE">
      <qti-prompt>
        <p>Which planet is closest to the Sun?</p>
      </qti-prompt>
      <qti-simple-choice identifier="A">
        <p>Venus</p>
      </qti-simple-choice>
      <qti-simple-choice identifier="B">
        <p>Mercury</p>
      </qti-simple-choice>
      <qti-simple-choice identifier="C">
        <p>Mars</p>
      </qti-simple-choice>
      <qti-simple-choice identifier="D">
        <p>Earth</p>
      </qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"></qti-response-processing>
</qti-assessment-item>`;

const LANDING_PCI_ITEM_XML = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xsi:schema-location="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="landing-pci" title="Landing PCI" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE2" cardinality="single" base-type="string"></qti-response-declaration>
  <qti-item-body>
    <p>
      <qti-portable-custom-interaction custom-interaction-type-identifier="blocks" data-version="1.0.0" data-grid-divisions="9" data-cube-pixel-size="60" data-width="520" data-height="340" data-brick-color-mode="single" data-brick-colors="#00a748" data-components-cdn-url="${__QTI_COMPONENTS_CDN_URL__}" data-components-css-url="${__QTI_COMPONENTS_CSS_URL__}" module="blocks" response-identifier="RESPONSE2">
        <qti-interaction-modules>
          <qti-interaction-module id="blocks" primary-path="pci/blocks/interaction/runtime/js/index.js" />
        </qti-interaction-modules>
        <qti-interaction-markup>
          <div class="pciInteraction">
            <div class="prompt" />
            <ul class="pci" />
          </div>
        </qti-interaction-markup>
      </qti-portable-custom-interaction>
    </p>
  </qti-item-body>
</qti-assessment-item>`;

// The bricks that spell "QTI" on the blocks PCI's 9x9 baseplate: x runs left to right, y is the
// layer (0 on the plate) and z runs back to front. The letters stand on different rows, so their
// projections never line up into extra bricks when the PCI rebuilds the scene from them.
const PCI_BLOCKS_GRID = 9;
const PCI_BLOCKS_QTI = [
  // Q: a ring with a tail at the bottom right
  [0, 0, 6], [0, 1, 6], [0, 2, 6], [1, 0, 6], [1, 2, 6], [2, 0, 6], [2, 1, 6], [2, 2, 6], [3, 0, 6],
  // T
  [4, 2, 3], [5, 0, 3], [5, 1, 3], [5, 2, 3], [6, 2, 3],
  // I
  [8, 0, 2], [8, 1, 2], [8, 2, 2],
].map(([x, y, z]) => ({ x, y, z }));

type Axis = "x" | "y" | "z";

// The PCI's response: per axis, which cells of the side view a brick covers.
function projectBricks(plane: Axis) {
  const [a, b] = (["x", "y", "z"] as Axis[]).filter((axis) => axis !== plane);
  const cells: Record<string, number | boolean>[] = [];
  for (let i = 0; i < PCI_BLOCKS_GRID; i++) {
    for (let j = 0; j < PCI_BLOCKS_GRID; j++) {
      const found = PCI_BLOCKS_QTI.some((brick) => brick[a] === i && brick[b] === j);
      cells.push({ [a]: i, [b]: j, found });
    }
  }
  return cells;
}

const PCI_BLOCKS_RESPONSE = {
  xPlane: projectBricks("x"),
  yPlane: projectBricks("y"),
  zPlane: projectBricks("z"),
};

function prettyPrintXml(xml: string): string {
  const indentUnit = "  ";
  const escapeText = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeAttribute = (value: string) =>
    escapeText(value).replace(/"/g, "&quot;");

  const formatElement = (element: Element, level: number): string => {
    const indent = indentUnit.repeat(level);
    const attrs = Array.from(element.attributes)
      .map((attr) => `${attr.name}="${escapeAttribute(attr.value)}"`)
      .join(" ");
    const openTag = attrs
      ? `<${element.tagName} ${attrs}>`
      : `<${element.tagName}>`;
    const closeTag = `</${element.tagName}>`;

    const meaningfulChildren = Array.from(element.childNodes).filter((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return true;
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }
      return false;
    });

    if (meaningfulChildren.length === 0) {
      return `${indent}${openTag}${closeTag}`;
    }

    if (
      meaningfulChildren.length === 1 &&
      meaningfulChildren[0].nodeType === Node.TEXT_NODE
    ) {
      const textValue = escapeText(
        meaningfulChildren[0].textContent?.trim() ?? "",
      );
      return `${indent}${openTag}${textValue}${closeTag}`;
    }

    const childLines = meaningfulChildren.map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return formatElement(node as Element, level + 1);
      }
      const textValue = escapeText(node.textContent?.trim() ?? "");
      return `${indentUnit.repeat(level + 1)}${textValue}`;
    });

    return `${indent}${openTag}\n${childLines.join("\n")}\n${indent}${closeTag}`;
  };

  try {
    const documentNode = new DOMParser().parseFromString(
      xml,
      "application/xml",
    );
    if (documentNode.querySelector("parsererror")) {
      return xml;
    }
    return formatElement(documentNode.documentElement, 0);
  } catch {
    return xml;
  }
}

// The editor reads `sourceXml` once per session key and then owns the document. Landing's XML
// only ever flows outwards -- into the read-only Monaco below it -- so the key never has to change.
const LANDING_EDITOR_SESSION_KEY = 0;

const EMBED_SNIPPET = `npm install @citolab/qti-components

<script type="module">
  import "@citolab/qti-components";
</script>

<qti-item>
  <item-container item-url="items/red-planet.xml">
  </item-container>
</qti-item>`;

type Library = {
  name: string;
  tag: string;
  icon: LucideIcon;
  description: string;
  links: { label: string; href: string }[];
};

const LIBRARIES: Library[] = [
  {
    name: "QTI Components",
    tag: "Player",
    icon: Boxes,
    description:
      "Web components that render and score QTI 3 items and tests in any framework, or none. The engine behind this playground's player.",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-components" },
      { label: "npm", href: "https://www.npmjs.com/package/@citolab/qti-components" },
      {
        label: "Storybook",
        href: "https://qti-components.citolab.nl/?path=/docs/%F0%9F%91%8B-hi-qti--docs",
      },
    ],
  },
  {
    name: "QTI Editor",
    tag: "Authoring",
    icon: PenLine,
    description:
      "ProseMirror extensions for writing QTI 3 items visually. Bring your own editor UI; the XML round-trips.",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-editor" },
      { label: "npm", href: "https://www.npmjs.com/package/@citolab/prose-qti" },
    ],
  },
  {
    name: "QTI Convert",
    tag: "Conversion",
    icon: Repeat,
    description:
      "Upgrade QTI 2.x to QTI 3, import packages in the browser, convert TAO PCIs and export to Word or PDF for paper tests.",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-convert" },
      { label: "npm", href: "https://www.npmjs.com/package/@citolab/qti-convert" },
    ],
  },
  {
    name: "tspci",
    tag: "PCI toolkit",
    icon: Terminal,
    description:
      "Spin up a Portable Custom Interaction project in seconds: develop, debug and bundle custom interactions with their assets.",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/tspci" },
      { label: "npm", href: "https://www.npmjs.com/package/@citolab/tspci" },
      { label: "Examples", href: "https://github.com/Citolab/tspci-examples" },
    ],
  },
  {
    name: "QTI Player",
    tag: "Starter",
    icon: Play,
    description:
      "A single-file reference player: the shortest path from a QTI package to a working test in your own app.",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-player" },
      { label: "Demo", href: "https://citolab.github.io/qti-player/" },
      {
        label: "StackBlitz",
        href: "https://stackblitz.com/~/github.com/Citolab/qti-player?file=index.html",
      },
    ],
  },
  {
    name: "QTI Playground",
    tag: "This site",
    icon: FlaskConical,
    description:
      "Everything you see here, from the package importer to the editor, is open source too. Fork it as a starting point.",
    links: [{ label: "GitHub", href: "https://github.com/Citolab/qti-playground" }],
  },
];

const PLAYER_FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: LayoutPanelLeft,
    title: "Two layouts",
    text: "A scrolling booklet or one question at a time, from the same test.",
  },
  {
    icon: ZoomIn,
    title: "Zoom & read-aloud",
    text: "Read-aloud only uses voices that run on your own device.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & review",
    text: "Flag questions and jump back from the overview.",
  },
  {
    icon: Puzzle,
    title: "Custom interactions",
    text: "QTI 3 PCIs run sandboxed, like the brick builder shown here.",
  },
];

const EDITOR_FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PenLine,
    title: "Write, don't type tags",
    text: "Prompts, choices, gaps and layouts, edited like a document.",
  },
  {
    icon: FileCode2,
    title: "Clean QTI 3 out",
    text: "Valid XML is generated as you go. Switch to XML mode any time.",
  },
  {
    icon: Share2,
    title: "Share or download",
    text: "Send a link to the item, or download it as a QTI package.",
  },
];

const TEAM = [
  {
    name: "Romy Noordhof",
    role: "Head of team prototyping",
    email: "romy.noordhof@cito.nl",
    initials: "RN",
  },
  {
    name: "Patrick de Klein",
    role: "Frontend developer / UX specialist",
    email: "Patrick.deKlein@cito.nl",
    initials: "PK",
  },
  {
    name: "Marcel Hoekstra",
    role: "Full-stack developer",
    email: "marcel.hoekstra@cito.nl",
    initials: "MH",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-citolab-600">
      {children}
    </p>
  );
}

function FeatureList({
  features,
}: {
  features: { icon: LucideIcon; title: string; text: string }[];
}) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2">
      {features.map((feature) => (
        <div key={feature.title} className="flex gap-3">
          <dt className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-citolab-50 text-citolab-700">
            <feature.icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </dt>
          <dd>
            <span className="block text-sm font-semibold text-gray-900">
              {feature.title}
            </span>
            <span className="block text-sm leading-relaxed text-gray-600">
              {feature.text}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A browser-ish frame, so a live demo reads as "this is running" rather than as a picture. */
function DemoFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,65,25,0.25)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        </span>
        <span className="truncate font-mono text-xs text-gray-500">{label}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-citolab-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-citolab-500" />
          Live
        </span>
      </div>
      {children}
    </div>
  );
}

// What Blob says about each planet in the hero item. Keyed on the
// choice identifiers of HERO_ITEM_URL, so they move with it.
const HERO_WRONG_PICKS: Record<string, string> = {
  VENUS: "That's Venus, hiding under yellow clouds. Mars is the rusty red one!",
  NEPTUNE: "That's Neptune, the deep blue ice giant. Look for something rusty red.",
  JUPITER: "That's Jupiter! Its big spot is red, but Mars is red all over.",
};

type HeroFeedback = { mood: CoachMood; message: string; count: number };

const HERO_GREETING: HeroFeedback = {
  mood: "idle",
  message: "Go on, pick a planet! This is the real player, not a screenshot.",
  count: 0,
};

// `getResponse` is protected in the typings but the only place the correct
// response survives: `variables` leaves it out, and the declaration's own
// <qti-value> is consumed when the item renders.
type HeroItem = HTMLElement & {
  getResponse?: (
    identifier: string,
  ) => { correctResponse?: string | string[] | null } | undefined;
};

const asList = (value: unknown) =>
  (Array.isArray(value) ? value : value ? [value] : []).map(String).sort();

/**
 * Blob the martian under the hero item, reacting to every pick. It listens on a
 * wrapper rather than the item: item-container swaps its item on load. Not on
 * `qti-interaction-response` either -- the item stops that one and re-announces
 * it as the composed `qti-interaction-changed`, after updating its variables.
 */
function useHeroFeedback() {
  const [feedback, setFeedback] = useState(HERO_GREETING);
  const cleanupRef = useRef<(() => void) | null>(null);
  const attach = useCallback((element: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!element) return;
    const onResponse = (event: Event) => {
      const { responseIdentifier, response } = (
        event as CustomEvent<{ responseIdentifier: string; response: unknown }>
      ).detail;
      const item = event
        .composedPath()
        .find(
          (node): node is HeroItem =>
            node instanceof HTMLElement && node.localName === "qti-assessment-item",
        );
      const picked = asList(response);
      const correct = asList(
        item?.getResponse?.(responseIdentifier)?.correctResponse,
      );
      setFeedback((current) => {
        const count = current.count + 1;
        if (picked.length === 0) return { ...HERO_GREETING, count };
        if (picked.join() === correct.join()) {
          return {
            mood: "correct",
            message: "Yes, that's Mars! All that rusty dust is what makes it red.",
            count,
          };
        }
        return {
          mood: "incorrect",
          message:
            HERO_WRONG_PICKS[picked[0]] ?? "Not quite. Look for the rusty red planet!",
          count,
        };
      });
    };
    element.addEventListener("qti-interaction-changed", onResponse);
    cleanupRef.current = () =>
      element.removeEventListener("qti-interaction-changed", onResponse);
  }, []);
  return { feedback, attach };
}

export const LandingPage: React.FC = () => {
  const { feedback: heroFeedback, attach: attachHeroFeedback } =
    useHeroFeedback();
  const [landingChoiceXml, setLandingChoiceXml] = useState(
    LANDING_CHOICE_ITEM_XML,
  );
  const prettyLandingChoiceXml = useMemo(
    () => prettyPrintXml(landingChoiceXml),
    [landingChoiceXml],
  );

  // The editor owns the contested qti-* names globally, so every player surface needs its own
  // scope -- this page renders two next to the editor. See app/editor-first.ts.
  const { registry: heroRegistry, attachRef: attachHeroRegistry } =
    useScopedQtiRegistry();
  const { registry: pciRegistry, attachRef: attachPciRegistry } =
    useScopedQtiRegistry();

  const restoreResponses = useCallback(
    (
      assessmentItem: QtiAssessmentItem | null,
      responses: Record<string, unknown>,
    ) => {
      if (!assessmentItem) return;
      for (const [identifier, value] of Object.entries(responses)) {
        assessmentItem.updateResponseVariable(
          identifier,
          JSON.stringify(value),
        );
      }
    },
    [],
  );

  const onPciItemRendered = useCallback(
    (e: Event) => {
      const assessmentItem = (e as CustomEvent<QtiAssessmentItem>).detail;
      restoreResponses(assessmentItem, {
        RESPONSE2: PCI_BLOCKS_RESPONSE,
      });
    },
    [restoreResponses],
  );

  // `cito-item-rendered` has no JSX event prop, so bind it on the element.
  const pciItemCleanupRef = useRef<(() => void) | null>(null);
  const attachPciItem = useCallback(
    (element: HTMLElement | null) => {
      pciItemCleanupRef.current?.();
      pciItemCleanupRef.current = null;
      if (!element) return;
      element.addEventListener("cito-item-rendered", onPciItemRendered);
      pciItemCleanupRef.current = () =>
        element.removeEventListener("cito-item-rendered", onPciItemRendered);
    },
    [onPciItemRendered],
  );

  return (
    <div className="min-h-full bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,167,72,0.14),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(0,177,169,0.08),transparent_40%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(0,65,25,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div
          className={cn(
            PAGE_CONTAINER,
            PAGE_GUTTER,
            "relative grid items-center gap-12 pb-10 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-12 lg:pt-24",
          )}
        >
          <div className="min-w-0">
            <a
              href="https://site.imsglobal.org/certifications/cito/cito-qti-player"
              target="_blank"
              rel="noopener noreferrer"
              className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-citolab-600/25 bg-white/80 py-1 pl-1 pr-3 text-sm font-medium text-citolab-800 shadow-sm backdrop-blur hover:border-citolab-600/50"
            >
              <span className="rounded-full bg-citolab-600 px-2 py-0.5 text-xs font-semibold text-white">
                Open source
              </span>
              1EdTech certified QTI 3 assessment player
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <h1
              className="animate-fade-in-up mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-950 sm:text-5xl xl:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Play, write and convert{" "}
              <span className="relative whitespace-nowrap text-citolab-600">
                QTI&nbsp;3
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-citolab-yellow-500"
                >
                  <path
                    d="M2 9 C 50 2, 150 2, 198 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              , right in your browser.
            </h1>
            <p
              className="animate-fade-in-up mt-6 max-w-xl text-lg leading-relaxed text-gray-600"
              style={{ animationDelay: "160ms" }}
            >
              The QTI Playground puts CitoLab&apos;s open-source assessment
              tooling to work: a certified assessment player built on web components, a
              visual item editor, and converters for your QTI 2.x packages.
            </p>
            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <a
                href="/landing#examples"
                className="inline-flex items-center gap-2 rounded-full bg-citolab-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-citolab-600/25 transition-colors hover:bg-citolab-700"
              >
                <Play className="h-4 w-4 fill-current" />
                Play an example test
              </a>
              <Link
                to="/edit"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-citolab-600 hover:text-citolab-700"
              >
                <PenLine className="h-4 w-4" />
                Open the editor
              </Link>
              <Link
                to="/assessment-player"
                className="inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-gray-600 hover:text-citolab-700"
              >
                or play your own package
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul
              className="animate-fade-in-up mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500"
              style={{ animationDelay: "320ms" }}
            >
              <li className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-citolab-600" />
                Your content never leaves the browser
              </li>
              <li className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4 text-citolab-600" />
                QTI 2.x and QTI 3
              </li>
              <li className="inline-flex items-center gap-2">
                <Code2 className="h-4 w-4 text-citolab-600" />
                GPL-3.0 on GitHub
              </li>
            </ul>
          </div>

          <div
            className="animate-fade-in-up relative min-w-0"
            style={{ animationDelay: "200ms" }}
          >
            <DemoFrame label="<qti-item> · Journey Through the Solar System">
              <div
                ref={attachHeroFeedback}
                className="px-1 py-2 sm:px-6"
              >
                <qti-item>
                  <item-container
                    ref={attachHeroRegistry}
                    customElementRegistry={heroRegistry}
                    itemURL={HERO_ITEM_URL}
                  >
                    <template
                      dangerouslySetInnerHTML={{
                        __html: `<style>${itemCss}</style>`,
                      }}
                    ></template>
                  </item-container>
                </qti-item>
              </div>
            </DemoFrame>
            <div className="mt-3 flex items-end justify-end gap-2 pr-1">
              <p
                key={`bubble-${heroFeedback.count}`}
                role="status"
                aria-live="polite"
                className="coach-bubble relative mb-6 max-w-72 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm leading-snug text-gray-700 shadow-md"
              >
                {heroFeedback.message}
                <span className="absolute -right-2 bottom-4 h-4 w-4 rotate-45 border-t border-r border-gray-200 bg-white" />
              </p>
              <div
                key={`coach-${heroFeedback.count}`}
                className="h-36 w-27 shrink-0"
              >
                <CoachAvatar character="martian" mood={heroFeedback.mood} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="scroll-mt-16 border-b border-gray-100 py-12 lg:py-16">
        <div className={cn(PAGE_CONTAINER, PAGE_GUTTER)}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SectionEyebrow>Examples</SectionEyebrow>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Take a test. It only takes a few minutes.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Four short tests, from primary school to university, each
                presented a different way: one question per screen, the whole
                test as one scrolling booklet, texts shown once with all of
                their questions beside them, and an exam in scored parts.
              </p>
            </div>
          </div>
          <ExampleGallery variant="compact" className="mt-10" />
        </div>
      </section>

      {/* Player */}
      <section id="player" className="pb-20 pt-12 lg:pb-28 lg:pt-16">
        <div
          className={cn(
            PAGE_CONTAINER,
            PAGE_GUTTER,
            "grid items-center gap-12 lg:grid-cols-2 lg:gap-16",
          )}
        >
          <div className="order-2 min-w-0 lg:order-1">
            <DemoFrame label="<qti-portable-custom-interaction>">
              <div className="flex justify-center overflow-x-auto bg-gray-50 p-4">
                <qti-item ref={attachPciItem}>
                  <item-container
                    ref={attachPciRegistry}
                    customElementRegistry={pciRegistry}
                    itemXML={LANDING_PCI_ITEM_XML}
                  >
                    <template
                      dangerouslySetInnerHTML={{
                        __html: `<style>${itemCss}</style>`,
                      }}
                    ></template>
                  </item-container>
                </qti-item>
              </div>
            </DemoFrame>
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <SectionEyebrow>The assessment player</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Every interaction QTI 3 has, and the ones you build yourself.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Drop in a package and take the test the way a candidate would.
              QTI 2.x is upgraded on the fly, and Portable Custom Interactions
              like this brick builder run in their own sandbox.
            </p>
            <div className="mt-8">
              <FeatureList features={PLAYER_FEATURES} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                to="/assessment-player"
                className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-citolab-800"
              >
                Open the assessment player
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://site.imsglobal.org/certifications/cito/cito-qti-player"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-800"
              >
                <img
                  src="/1edtech_trusted-apps-certified.svg"
                  alt="1EdTech Trusted Apps Certified"
                  className="h-12 w-auto"
                />
                Certified for QTI 3
                <br className="hidden sm:block" /> delivery by 1EdTech
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Editor */}
      <section id="editor" className="border-y border-gray-100 bg-gray-50 py-20 lg:py-28">
        <div
          className={cn(
            PAGE_CONTAINER,
            PAGE_GUTTER,
            "grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16",
          )}
        >
          <div className="min-w-0">
            <SectionEyebrow>The editor</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Write items like a document. Get QTI&nbsp;3 for free.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Change the question on the right and watch the XML rewrite
              itself. The editor is built from our open-source ProseMirror
              extensions, so you can put it in your own authoring tool.
            </p>
            <div className="mt-8">
              <FeatureList features={EDITOR_FEATURES} />
            </div>
            <Link
              to="/edit"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-citolab-800"
            >
              Open the editor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="min-w-0 space-y-4">
            {/* Fixed box, no `overflow-auto`: the editor scrolls its own body, so a second
                scroller here would put the toolbar out of reach on a long item. */}
            <div className="relative h-[22rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,65,25,0.25)]">
              {/* Hangs off the editor's own toolbar, in its empty right end; same chip as
                  tool-bar.tsx and preview.tsx. */}
              <span className="pointer-events-none absolute top-5 right-3 z-10 hidden rounded bg-citolab-600/90 sm:block px-1 py-px text-[7px] leading-none font-semibold tracking-wide text-white uppercase">
                Beta
              </span>
              <QtiCitolabEditorPanel
                active
                editorSessionKey={LANDING_EDITOR_SESSION_KEY}
                sourceXml={landingChoiceXml}
                onSourceChange={setLandingChoiceXml}
                heightClassName="h-full"
                className="h-full"
                normalizeOnLoad
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-900 bg-[#1e1e1e] shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-mono text-xs text-gray-400">
                <FileCode2 className="h-3.5 w-3.5" />
                item.xml — generated
              </div>
              <MonacoEditor
                height="15rem"
                language="xml"
                theme="vs-dark"
                value={prettyLandingChoiceXml}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  folding: true,
                  glyphMargin: false,
                  scrollBeyondLastLine: false,
                  wordWrap: "off",
                  renderLineHighlight: "none",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Open source */}
      <section id="open-source" className="bg-citolab-800 py-20 text-white lg:py-28">
        <div className={cn(PAGE_CONTAINER, PAGE_GUTTER)}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-citolab-300">
                Open source
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                The building blocks are yours to use.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">
                Everything in this playground is built from libraries CitoLab
                publishes on GitHub and npm. Use the player in your own app with
                a script tag and a custom element.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-mono text-xs text-white/50">
                  <Terminal className="h-3.5 w-3.5" />
                  index.html
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-citolab-100">
                  <code>{EMBED_SNIPPET}</code>
                </pre>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {LIBRARIES.map((library) => (
                <div
                  key={library.name}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-citolab-yellow-500 text-citolab-900">
                      <library.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">
                        {library.name}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {library.tag}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
                    {library.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    {library.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-citolab-300 hover:text-white"
                      >
                        {link.label === "GitHub" ? (
                          <GithubMark className="h-3.5 w-3.5" />
                        ) : null}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 lg:py-24">
        <div
          className={cn(
            PAGE_CONTAINER,
            PAGE_GUTTER,
            "grid items-center gap-10 lg:grid-cols-2",
          )}
        >
          <div className="min-w-0">
            <SectionEyebrow>Talk to us</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-950">
              Building with QTI? We&apos;d love to hear about it.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Questions about the libraries, a package that doesn&apos;t play
              right, or an idea for a custom interaction: the developers behind
              these tools read their own mail.
            </p>
          </div>
          <ul className="grid min-w-0 gap-3">
            {TEAM.map(({ name, role, email, initials }) => (
              <li key={email}>
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition-colors hover:border-citolab-600"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-citolab-50 font-display text-sm font-bold text-citolab-700">
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-900">{name}</span>
                    <span className="block text-sm text-gray-500">{role}</span>
                  </span>
                  <Mail className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-citolab-600" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

function LandingFooter() {
  const columns: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
    {
      title: "Playground",
      links: [
        { label: "Assessment player", to: "/assessment-player" },
        { label: "Editor", to: "/edit" },
      ],
    },
    {
      title: "Tools",
      links: [
        { label: "Convert & modify package", to: "/modify" },
        { label: "Convert item", to: "/convert" },
        { label: "XML preview", to: "/preview" },
        { label: "Local AI import (experimental)", to: "/ai-convert" },
      ],
    },
    {
      title: "Open source",
      links: [
        { label: "CitoLab on GitHub", to: "https://github.com/Citolab", external: true },
        { label: "npm packages", to: "https://www.npmjs.com/org/citolab", external: true },
        {
          label: "Component docs",
          to: "https://qti-components.citolab.nl/",
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div
        className={cn(
          PAGE_CONTAINER,
          PAGE_GUTTER,
          "grid gap-10 py-14 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]",
        )}
      >
        <div>
          <CitolabLogo className="h-8 w-20 text-citolab-600" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
            CitoLab, part of Cito, builds open-source tooling for digital
            assessment.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-gray-900">{column.title}</h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-citolab-700"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-citolab-700">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={cn(PAGE_CONTAINER, PAGE_GUTTER, "border-t border-gray-200 py-6")}>
        <p className="flex items-center gap-2 text-sm text-gray-400">
          <BookOpenCheck className="h-4 w-4" />
          &copy; {new Date().getFullYear()} CitoLab
        </p>
      </div>
    </footer>
  );
}

export default LandingPage;
