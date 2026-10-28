import { LayoutGrid, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutModeIcon } from "../components/layout-mode-select";
import { exampleCoverUrl, type ExamplePackage } from "./catalog";

/** A one-line entry for narrow columns: thumbnail, title and a play button. */
export function ExampleRow({
  example,
  loading,
  disabled,
  onOpen,
}: {
  example: ExamplePackage;
  loading: boolean;
  disabled: boolean;
  onOpen: (target: "play" | "browse") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen("play")}
      disabled={disabled}
      className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-2.5 pr-4 text-left shadow-sm transition-all hover:border-citolab-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600 disabled:opacity-60"
    >
      <img
        src={exampleCoverUrl(example.id)}
        alt=""
        className="aspect-video w-32 shrink-0 rounded-xl bg-citolab-50 object-cover sm:w-40"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
          {example.subject} · {example.audience}
        </span>
        <span className="mt-0.5 block font-display text-base font-semibold text-gray-900">
          {example.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-500">
          <LayoutModeIcon mode={example.layout} className="h-3.5 w-3.5 shrink-0" />
          {example.presentation}
        </span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-citolab-600 text-white transition-colors group-hover:bg-citolab-700">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
        <span className="sr-only">Play {example.title}</span>
      </span>
    </button>
  );
}

export function ExampleCard({
  example,
  loading,
  disabled,
  onOpen,
  compact = false,
}: {
  example: ExamplePackage;
  loading: boolean;
  disabled: boolean;
  onOpen: (target: "play" | "browse") => void;
  /** Landing-page size: fewer interaction chips, no browse button. */
  compact?: boolean;
}) {
  const chips = compact ? example.interactions.slice(0, 3) : example.interactions;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onOpen("play")}
        disabled={disabled}
        className="relative block aspect-video overflow-hidden bg-citolab-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-citolab-600"
        aria-label={`Play ${example.title}`}
      >
        <img
          src={exampleCoverUrl(example.id)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-citolab-900/0 transition-colors group-hover:bg-citolab-900/25">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-white text-citolab-700 shadow-lg transition-all",
              loading
                ? "opacity-100"
                : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100",
            )}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            )}
          </span>
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-citolab-800 shadow-sm">
          {example.subject}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {compact ? (
          // On the landing page the card sells the player, so what it does leads
          // and the test itself is only the example.
          <div>
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-gray-900">
              {example.pitch}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-citolab-700">
              <LayoutModeIcon mode={example.layout} className="h-4 w-4 shrink-0" />
              {example.presentation}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{example.title}</span>
              {" · "}
              {example.audience}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {example.audience}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-gray-900">
              {example.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              {example.description}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-citolab-700">
              <LayoutModeIcon mode={example.layout} className="h-4 w-4 shrink-0" />
              {example.presentation}
            </p>
          </div>
        )}
        <ul className="flex flex-wrap gap-1.5">
          {chips.map((interaction) => (
            <li
              key={interaction}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
            >
              {interaction}
            </li>
          ))}
          {compact && example.interactions.length > chips.length ? (
            <li className="rounded-md px-1 py-0.5 text-xs font-medium text-gray-400">
              +{example.interactions.length - chips.length} more
            </li>
          ) : null}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpen("play")}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-citolab-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-citolab-700 disabled:opacity-60"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Play test
          </button>
          {compact ? null : (
            <button
              type="button"
              onClick={() => onOpen("browse")}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-citolab-600 hover:text-citolab-700 disabled:opacity-60"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Browse items
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
