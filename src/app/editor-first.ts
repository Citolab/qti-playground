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
 */
import { markEditorBoundary } from "./registry-recorder";
import "@citolab/prose-qti/components/register";

markEditorBoundary();
