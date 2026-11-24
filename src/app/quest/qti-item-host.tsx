import { useEffect, useMemo, useRef } from "react";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { cn } from "@/lib/utils";
import { itemCss } from "../itemCss";
import { syncScopedRegistry } from "../scoped-registry";
import { useScopedQtiRegistry } from "../use-scoped-registry";
import {
  ARENA_TAGS,
  SUFFIX_3D,
  isArenaInteraction,
  registerArenaInteractions,
  type Arena3dInteraction,
} from "./interactions-3d";

registerArenaInteractions();

type ItemElement = HTMLElement & {
  processResponse?: (countNumAttempts?: boolean, reportValidityAfterScoring?: boolean) => boolean;
  getOutcome?: (identifier: string) => { value: unknown } | undefined;
};

export interface QtiHandle {
  /** The item's interactions in document order: one part of the question each. */
  interactions: Arena3dInteraction[];
  /** Runs the item's response processing and reports its SCORE against its MAXSCORE. */
  score(): Promise<{ score: number; max: number }>;
}

interface Props {
  xml: string;
  /** The full score to compare with when the item declares no MAXSCORE. */
  maxScore?: number;
  /** Show the live item as a small card instead of keeping it off screen. */
  visible: boolean;
  /** Called once the item rendered and its 3D interaction is ready, or with null if it never did. */
  onReady: (handle: QtiHandle | null) => void;
}

/**
 * The real QTI item behind a question in the game. It is rendered by
 * qti-components like any other item, except that its interaction is swapped
 * for the 3D variant (see interactions-3d.ts). It stays off screen while you
 * play; `visible` shows it, so you can watch the response follow your jumps.
 */
export function QtiItemHost({ xml, maxScore, visible, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { registry, attachRef } = useScopedQtiRegistry();

  const itemDoc = useMemo(() => {
    let transformer = qtiTransformItem().parse(xml);
    for (const tag of ARENA_TAGS) transformer = transformer.extendElementName(tag, SUFFIX_3D);
    transformer = transformer.convertCDATAtoComment();
    if (!registry) return transformer.htmlDoc();
    syncScopedRegistry(registry, transformer.xmlDoc());
    return transformer.htmlDoc(registry);
  }, [xml, registry]);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const poll = () => {
      if (cancelled) return;
      const root = hostRef.current?.querySelector("item-container")?.shadowRoot;
      const item = (root?.querySelector("qti-assessment-item") ?? null) as ItemElement | null;
      // Every interaction was renamed to its 3D variant; wait until all of them are upgraded.
      const expected = item
        ? Array.from(item.querySelectorAll("*")).filter((el) => el.localName.endsWith(`-interaction-${SUFFIX_3D}`))
        : [];
      const interactions = expected.filter(isArenaInteraction);
      const ready =
        interactions.length > 0 &&
        interactions.length === expected.length &&
        // Normally the declarations are there at once; an item without one still gets its turn.
        (interactions.every((interaction) => interaction.arenaReady()) || tries > 40);
      if (item && ready && typeof item.processResponse === "function") {
        onReadyRef.current({
          interactions,
          score: async () => {
            item.processResponse?.(false, false);
            // Response processing reports back through an event, so give it a moment to land.
            await new Promise((resolve) => setTimeout(resolve, 80));
            const score = Number(item.getOutcome?.("SCORE")?.value ?? 0);
            const max = Number(item.getOutcome?.("MAXSCORE")?.value) || maxScore || 1;
            return { score, max };
          },
        });
        return;
      }
      tries += 1;
      if (tries < 100) window.setTimeout(poll, 50);
      else onReadyRef.current(null);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [xml, maxScore]);

  return (
    <div
      ref={hostRef}
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none absolute z-30 w-[22rem] max-w-[calc(100%-1.5rem)]",
        visible
          ? "bottom-3 right-28 max-h-[46%] overflow-auto rounded-2xl border-2 border-slate-300 bg-white p-3 shadow-xl"
          : "left-[-200rem] top-0",
      )}
    >
      {visible && (
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          The live QTI item (read-only mirror)
        </div>
      )}
      <qti-item>
        <item-container ref={attachRef} customElementRegistry={registry} itemDoc={itemDoc}>
          <template dangerouslySetInnerHTML={{ __html: `<style>${itemCss}</style>` }}></template>
        </item-container>
      </qti-item>
    </div>
  );
}
