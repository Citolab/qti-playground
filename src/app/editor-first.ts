/**
 * Gives the editor the global custom element registry.
 *
 * Import order is load-bearing and this module exists to make it explicit:
 * the recorder patches `customElements.define`, `@citolab/prose-qti` then
 * claims the shared `qti-*` names with its editing components, and the
 * boundary is marked before anything else registers. `main.tsx` must import
 * this before `@citolab/qti-components`.
 *
 * Without this, qti-components wins the names, prose-qti's unguarded defines
 * are rejected, and the editor ends up rendering *player* components into
 * ProseMirror's contenteditable -- which live-locks: the components mutate DOM
 * ProseMirror owns, ProseMirror reverts it, and the elements churn through
 * connect/disconnect indefinitely.
 *
 * Expected console noise, and it comes from here: because this claims ~13 `qti-*`
 * interaction names first, `@citolab/qti-components/corrections` finds them taken
 * and warns that "the correction variants for them are inactive [...] Import
 * EITHER '@citolab/qti-components' OR '@citolab/qti-components/corrections', not
 * both." The either/or diagnosis is wrong for this app -- only the corrections
 * entry is imported for registration -- but the first half is accurate, and it is
 * the intended trade: the editor keeps the global names. The player does not read
 * the global registry for those tags anyway; app/scoped-registry.ts re-applies the
 * correction substitution inside the player's own scoped registry.
 */
import { markEditorBoundary } from "./registry-recorder";
import "@citolab/prose-qti/components/register";

markEditorBoundary();
