import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Code2,
  FileCode2,
  FlaskConical,
  PackageOpen,
  Repeat,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageShell } from "../components/page-shell";

type PlaygroundTool = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  experimental?: boolean;
};

/** Tools that run right here, in the browser. */
const PLAYGROUND_TOOLS: PlaygroundTool[] = [
  {
    name: "Convert & modify package",
    description:
      "Upgrade a QTI 2.x package to QTI 3 or back, strip media, pick items, and export to Word or PDF.",
    href: "/modify",
    icon: PackageOpen,
  },
  {
    name: "Convert item",
    description: "Paste a single item and convert it between QTI 2.x and QTI 3.",
    href: "/convert",
    icon: Repeat,
  },
  {
    name: "XML preview",
    description: "Hand-edit QTI 3 XML next to a live player that updates as you type.",
    href: "/preview",
    icon: Code2,
  },
  // Marked apart on purpose: the local-model import is a best-effort experiment,
  // and should read as one.
  {
    name: "Local AI import",
    description:
      "Turn a PDF, Word or Excel file into QTI with a model that runs in your browser.",
    href: "/ai-convert",
    icon: FlaskConical,
    experimental: true,
  },
];

type ExternalTool = {
  name: string;
  /** Language and package registry, e.g. "C# · NuGet". */
  stack: string;
  icon: LucideIcon;
  description: string;
  install: string;
  links: { label: string; href: string }[];
};

/** Tools you take home: libraries and CLIs for your own build or backend. */
const EXTERNAL_TOOLS: ExternalTool[] = [
  {
    name: "tspci",
    stack: "TypeScript · npm",
    icon: Terminal,
    description:
      "Spin up a Portable Custom Interaction project in seconds: develop, debug and bundle custom interactions with their assets.",
    install: "npx @citolab/tspci@latest init",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/tspci" },
      { label: "npm", href: "https://www.npmjs.com/package/@citolab/tspci" },
      { label: "Examples", href: "https://github.com/Citolab/tspci-examples" },
    ],
  },
  {
    name: "QTI Scoring Engine",
    stack: "C# · NuGet",
    icon: Calculator,
    description:
      "Score QTI assessment results on the server: runs item response processing and test outcome processing for QTI 2.x and 3.",
    install: "dotnet add package Citolab.QTI.ScoringEngine",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-scoring-engine" },
      {
        label: "NuGet",
        href: "https://www.nuget.org/packages/Citolab.QTI.ScoringEngine",
      },
    ],
  },
  {
    name: "QTI Convert for .NET",
    stack: "C# · NuGet",
    icon: PackageOpen,
    description:
      "Validate and extract uploaded QTI packages, convert QTI 2.x to QTI 3, and stream the files to your own storage.",
    install: "dotnet add package Citolab.QTI.Converter",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-convert-dotnet" },
      { label: "NuGet", href: "https://www.nuget.org/packages/Citolab.QTI.Converter" },
    ],
  },
  {
    name: "QTI Convert for Python",
    stack: "Python · PyPI",
    icon: FileCode2,
    description:
      "Upgrade QTI 2.x to 3, downgrade QTI 3 to 2.1 and repair broken file references, from code or the command line.",
    install: "pip install citolab-qti-convert",
    links: [
      { label: "GitHub", href: "https://github.com/Citolab/qti-convert-python" },
      { label: "PyPI", href: "https://pypi.org/project/citolab-qti-convert/" },
    ],
  },
];

function SectionHeading({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-gray-500">{text}</p>
    </div>
  );
}

function PlaygroundToolCard({ tool }: { tool: PlaygroundTool }) {
  return (
    <Link
      to={tool.href}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-citolab-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            tool.experimental
              ? "bg-gray-100 text-gray-500"
              : "bg-citolab-50 text-citolab-700",
          )}
        >
          <tool.icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {tool.experimental ? (
          <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Experimental
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{tool.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-600">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-citolab-700">
        Open
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function ExternalToolCard({ tool }: { tool: ExternalTool }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-citolab-50 text-citolab-700">
          <tool.icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
          {tool.stack}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{tool.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-600">
        {tool.description}
      </p>
      <code className="mt-4 block break-words rounded-md bg-gray-900 px-3 py-2 font-mono text-xs text-gray-100">
        {tool.install}
      </code>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {tool.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-citolab-700 hover:text-citolab-800 hover:underline"
          >
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function ToolsPage() {
  return (
    <PageShell
      title="Tools"
      icon={Wrench}
      description="Try our QTI tools right here in the browser, or take the libraries and CLIs into your own project."
    >
      <section>
        <SectionHeading
          title="Try it here"
          text="These run in your browser. Nothing you load leaves your machine."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAYGROUND_TOOLS.map((tool) => (
            <PlaygroundToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Use in your own project"
          text="Open-source libraries and CLIs for authoring PCIs, scoring results and converting packages."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {EXTERNAL_TOOLS.map((tool) => (
            <ExternalToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
