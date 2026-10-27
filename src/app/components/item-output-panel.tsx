import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

/** One variable as the runner's computed context reports it. */
type OutputVariable = {
  identifier: string;
  type: "outcome" | "response" | "context" | "template";
  value: unknown;
  cardinality?: string;
  baseType?: string;
  correctResponse?: unknown;
  mapping?: { mapEntries?: { mapKey: string; mappedValue: number }[] };
  areaMapping?: {
    areaMapEntries?: { shape: string; coords: string; mappedValue: number }[];
  };
};

/** The active item from the computed context: what `<test-print-item-variables>` used to show. */
export type OutputItem = {
  identifier: string;
  title?: string;
  score?: number;
  maxScore?: number;
  completionStatus?: string;
  correct?: boolean;
  incorrect?: boolean;
  variables?: ReadonlyArray<OutputVariable>;
};

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

/** Same flattening as the library's table, but one string per chip rather than one joined line. */
const toParts = (value: unknown): string[] => {
  if (isEmpty(value)) return [];
  if (Array.isArray(value)) return value.flatMap(toParts);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([field, fieldValue]) => `${field}: ${toParts(fieldValue).join(", ")}`,
    );
  }
  return [String(value)];
};

const Chips = ({
  value,
  tone = "default",
  className = "",
}: {
  value: unknown;
  tone?: "default" | "correct";
  className?: string;
}) => {
  const parts = toParts(value);
  if (parts.length === 0) {
    return <span className="text-xs italic text-gray-400">empty</span>;
  }
  const toneClass =
    tone === "correct"
      ? "border-citolab-600/30 bg-citolab-50 text-citolab-800"
      : "border-gray-200 bg-white text-gray-800";
  return (
    <span className={`flex flex-wrap gap-1 ${className}`}>
      {parts.map((part, index) => (
        <code
          key={index}
          className={`rounded border px-1.5 py-0.5 font-mono text-xs ${toneClass}`}
        >
          {part}
        </code>
      ))}
    </span>
  );
};

/** Declared by the runtime on every item, so they sort after the item's own. */
const BUILT_IN = new Set(["numAttempts", "duration", "completionStatus"]);
const byAuthoredFirst = (a: OutputVariable, b: OutputVariable) =>
  Number(BUILT_IN.has(a.identifier)) - Number(BUILT_IN.has(b.identifier));

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2 text-xs">
    <span className="w-16 shrink-0 pt-0.5 text-gray-500">{label}</span>
    {children}
  </div>
);

const typeLabel = (variable: OutputVariable) =>
  [variable.cardinality, variable.baseType].filter(Boolean).join(" · ");

const ResponseRow = ({ variable }: { variable: OutputVariable }) => {
  const mapEntries = variable.mapping?.mapEntries ?? [];
  const areaMapEntries = variable.areaMapping?.areaMapEntries ?? [];
  return (
    <li className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-xs font-semibold text-gray-900">
          {variable.identifier}
        </span>
        <span className="shrink-0 text-[11px] text-gray-500">
          {typeLabel(variable)}
        </span>
      </div>
      <Field label="Value">
        <Chips value={variable.value} />
      </Field>
      {!isEmpty(variable.correctResponse) && (
        <Field label="Correct">
          <Chips value={variable.correctResponse} tone="correct" />
        </Field>
      )}
      {mapEntries.length > 0 && (
        <Field label="Mapping">
          <Chips value={mapEntries.map((m) => `${m.mapKey} → ${m.mappedValue}`)} />
        </Field>
      )}
      {areaMapEntries.length > 0 && (
        <Field label="Areas">
          <Chips
            value={areaMapEntries.map(
              (m) => `${m.shape}(${m.coords}) → ${m.mappedValue}`,
            )}
          />
        </Field>
      )}
    </li>
  );
};

const SectionHeading = ({ label, count }: { label: string; count: number }) => (
  <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
    {label}
    <span className="rounded-full bg-gray-200 px-1.5 py-px text-[10px] font-medium text-gray-600">
      {count}
    </span>
  </h4>
);

const StatusPill = ({ item }: { item: OutputItem }) => {
  if (item.correct)
    return (
      <span className="rounded-full bg-citolab-50 px-2 py-0.5 text-xs font-medium text-citolab-700">
        Correct
      </span>
    );
  if (item.incorrect)
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Incorrect
      </span>
    );
  const status = item.completionStatus?.replace(/_/g, " ") || "not attempted";
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
      {status}
    </span>
  );
};

/**
 * The "Show Output" panel: the active item's response and outcome variables.
 * Replaces `<test-print-item-variables>`, whose fixed five-column table in a
 * shadow root could not be styled and did not fit a popup.
 */
export function ItemOutputPanel({
  item,
  itemIdentifier,
}: {
  item: OutputItem | null;
  /** The item's own identifier, as opposed to the item ref's. */
  itemIdentifier?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Open an item to see its output.
      </p>
    );
  }

  const variables = item.variables ?? [];
  const responses = variables
    .filter((v) => v.type === "response")
    .sort(byAuthoredFirst);
  const outcomes = variables
    .filter((v) => v.type === "outcome")
    .sort(byAuthoredFirst);
  const identifier = itemIdentifier || item.identifier;
  const hasScore = typeof item.score === "number";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(variables, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied: nothing to fall back to.
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-gray-500">
            {identifier}
          </p>
          {item.title && item.title !== identifier && (
            <p className="truncate text-sm font-medium text-gray-900">
              {item.title}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <StatusPill item={item} />
            {hasScore && (
              <span className="text-xs text-gray-600">
                Score{" "}
                <span className="font-semibold text-gray-900">
                  {item.score}
                  {typeof item.maxScore === "number" && ` / ${item.maxScore}`}
                </span>
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={copy}
          title="Copy the variables as JSON"
        >
          {copied ? (
            <Check className="mr-1 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "JSON"}
        </Button>
      </div>

      <section>
        <SectionHeading label="Responses" count={responses.length} />
        {responses.length === 0 ? (
          <p className="text-xs text-gray-500">No response variables.</p>
        ) : (
          <ul className="space-y-2">
            {responses.map((variable) => (
              <ResponseRow key={variable.identifier} variable={variable} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading label="Outcomes" count={outcomes.length} />
        {outcomes.length === 0 ? (
          <p className="text-xs text-gray-500">No outcome variables.</p>
        ) : (
          <dl className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {outcomes.map((variable) => (
              <div
                key={variable.identifier}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <dt className="min-w-0">
                  <span className="block truncate font-mono text-xs font-semibold text-gray-900">
                    {variable.identifier}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {typeLabel(variable)}
                  </span>
                </dt>
                <dd className="max-w-[60%]">
                  <Chips value={variable.value} className="justify-end" />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
