/**
 * Schematic glyphs for the Insert menu — each one draws the shape of the
 * interaction it inserts (radio rows for choice, connected columns for match,
 * chips and blanks for gap match, …) so the tile reads before the label does.
 *
 * All icons share a 24x24 box and paint with `currentColor`, so they inherit
 * the menu item's colour in both themes. Keyed by ProseMirror node type name;
 * an interaction registered upstream that we have no drawing for falls back to
 * the generic block glyph rather than rendering nothing.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const HIGHLIGHT = {
  fill: "currentColor",
  opacity: 0.18,
};

function ChoiceIcon() {
  return (
    <>
      <circle cx="5.5" cy="6" r="2.5" fill="currentColor" />
      <circle cx="5.5" cy="12" r="2.5" {...STROKE} />
      <circle cx="5.5" cy="18" r="2.5" {...STROKE} />
      <path d="M11 6h10M11 12h10M11 18h7" {...STROKE} />
    </>
  );
}

function ExtendedTextIcon() {
  return (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" {...STROKE} />
      <path d="M6.5 9h11M6.5 12.5h11M6.5 16h6.5" {...STROKE} />
    </>
  );
}

function TextEntryIcon() {
  // A sentence with a box to type into — the caret is what separates this from
  // the inline-choice select below.
  return (
    <>
      <path d="M3 12h4.5" {...STROKE} />
      <rect x="8.5" y="8" width="7" height="8" rx="1.5" {...STROKE} />
      <path d="M12 10v4" {...STROKE} />
      <path d="M16.5 12H21" {...STROKE} />
    </>
  );
}

function InlineChoiceIcon() {
  // The same sentence, but the blank is a dropdown: chevron instead of caret.
  return (
    <>
      <path d="M2.5 12h2.5" {...STROKE} />
      <rect x="6" y="7.5" width="12.5" height="9" rx="1.5" {...STROKE} />
      <path d="M8.5 12h4" {...STROKE} />
      <path d="M14.5 7.5v9" {...STROKE} />
      <path d="M15.3 10.8l1.35 1.7 1.35-1.7" {...STROKE} strokeWidth={1.7} />
      <path d="M19.5 12H21" {...STROKE} />
    </>
  );
}

function OrderIcon() {
  return (
    <>
      <path d="M6 5.5v13M4 8l2-2.5L8 8M4 16l2 2.5 2-2.5" {...STROKE} />
      <path d="M11.5 7h9M11.5 12h9M11.5 17h9" {...STROKE} />
    </>
  );
}

function MatchIcon() {
  return (
    <>
      <circle cx="5" cy="6.5" r="2" fill="currentColor" />
      <circle cx="5" cy="17.5" r="2" fill="currentColor" />
      <circle cx="19" cy="6.5" r="2" {...STROKE} />
      <circle cx="19" cy="17.5" r="2" {...STROKE} />
      <path d="M7 7.5l10 9M7 16.5l10-9" {...STROKE} />
    </>
  );
}

function MatchTabularIcon() {
  return (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" {...STROKE} />
      <path d="M9 4.5v15M15 4.5v15M3 9.5h18M3 14.5h18" {...STROKE} />
      <path d="M10.2 12l1.6 1.7 2.9-3.4" {...STROKE} strokeWidth={1.8} />
    </>
  );
}

function GapMatchIcon() {
  return (
    <>
      <path d="M3 7h5M18.5 7H21" {...STROKE} />
      <rect
        x="9.5"
        y="4.5"
        width="7.5"
        height="5"
        rx="1.5"
        {...STROKE}
        strokeDasharray="2.2 2"
      />
      <rect x="3" y="14" width="8" height="5.5" rx="1.5" {...HIGHLIGHT} />
      <rect x="3" y="14" width="8" height="5.5" rx="1.5" {...STROKE} />
      <rect x="13" y="14" width="8" height="5.5" rx="1.5" {...HIGHLIGHT} />
      <rect x="13" y="14" width="8" height="5.5" rx="1.5" {...STROKE} />
    </>
  );
}

function HottextIcon() {
  return (
    <>
      <rect x="2.5" y="5.5" width="9.5" height="5.5" rx="1.5" fill="currentColor" opacity={0.3} />
      <path d="M4.5 8.25h5.5" {...STROKE} />
      <path d="M14 8.25h7" {...STROKE} />
      <path d="M3 15.75h5" {...STROKE} />
      <rect x="9.5" y="13" width="12" height="5.5" rx="1.5" fill="currentColor" opacity={0.3} />
      <path d="M11.5 15.75h8" {...STROKE} />
    </>
  );
}

function SelectPointIcon() {
  return (
    <>
      <path d="M4.5 3.5v17h16" {...STROKE} />
      <path d="M4.5 10.5h8M13.5 20.5v-7" {...STROKE} strokeDasharray="2 2" />
      <circle cx="13.5" cy="10.5" r="2.6" fill="currentColor" />
    </>
  );
}

function RubricBlockIcon() {
  return (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" {...STROKE} />
      <path d="M7 4.5v15" {...STROKE} />
      <path d="M10 9h8M10 12.5h8M10 16h5" {...STROKE} />
    </>
  );
}

function GenericBlockIcon() {
  return (
    <>
      <rect
        x="3"
        y="4.5"
        width="18"
        height="15"
        rx="2"
        {...STROKE}
        strokeDasharray="2.5 2"
      />
      <path d="M12 8.5v7M8.5 12h7" {...STROKE} />
    </>
  );
}

const ICONS: Record<string, () => React.JSX.Element> = {
  qtiChoiceInteraction: ChoiceIcon,
  qtiExtendedTextInteraction: ExtendedTextIcon,
  qtiTextEntryInteraction: TextEntryIcon,
  qtiInlineChoiceInteraction: InlineChoiceIcon,
  qtiOrderInteraction: OrderIcon,
  qtiMatchInteraction: MatchIcon,
  qtiMatchInteractionTabular: MatchTabularIcon,
  qtiGapMatchInteraction: GapMatchIcon,
  qtiHottextInteraction: HottextIcon,
  qtiSelectPointInteraction: SelectPointIcon,
  qtiRubricBlock: RubricBlockIcon,
};

export function InteractionIcon({
  nodeTypeName,
  className,
}: {
  nodeTypeName: string;
  className?: string;
}) {
  const Glyph = ICONS[nodeTypeName] ?? GenericBlockIcon;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <Glyph />
    </svg>
  );
}
