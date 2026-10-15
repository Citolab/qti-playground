/**
 * Adaptive items answered in steps (the pattern qti-construction writes, docs/spikes/adaptive-items.md there): step 1
 * is the item body, every next step a `qti-feedback-block outcome-identifier="STEP_<n>"` that shows once the step before
 * it is answered; the integer outcome STEP is the current step. Once a step is answered its interactions become
 * read-only, so the candidate sees what they answered but cannot change it (the item has scored that step already).
 *
 * qti-components gives every interaction its own `readonly` (the item only overrides it when the item sets one), and
 * a PCI `disable()` (it has no `readonly`). Items without step blocks are left alone. Returns how many were locked now.
 */
const STEP_OUTCOME = /^STEP_(\d+)$/;

interface LockableInteraction extends Element {
  readonly?: boolean;
  disable?: () => void;
}

interface ItemWithVariables extends Element {
  variables?: readonly { identifier: string; value: unknown }[];
}

const isInteraction = (e: Element) => e.hasAttribute("response-identifier") && e.localName.endsWith("-interaction");

export function lockFinishedSteps(item: Element): number {
  const variables = (item as ItemWithVariables).variables ?? [];
  const current = Number(variables.find((v) => v.identifier === "STEP")?.value);
  if (!Number.isFinite(current) || current < 2) return 0;
  let locked = 0;
  for (const el of Array.from(item.querySelectorAll("*")).filter(isInteraction)) {
    const block = el.closest("qti-feedback-block");
    const step = block ? Number(STEP_OUTCOME.exec(block.getAttribute("outcome-identifier") ?? "")?.[1] ?? NaN) : 1;
    if (!(step < current) || el.hasAttribute("data-step-locked")) continue;
    const interaction = el as LockableInteraction;
    if (el.localName === "qti-portable-custom-interaction") interaction.disable?.();
    else interaction.readonly = true;
    el.setAttribute("data-step-locked", "");
    locked += 1;
  }
  return locked;
}
