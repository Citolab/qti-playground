/**
 * Records what gets defined on the global custom element registry, and where
 * the editor's definitions end.
 *
 * With the editor registering first (see `editor-first.ts`), the global
 * registry becomes the editor's: `@citolab/prose-qti` defines
 * `qti-simple-choice`, `qti-choice-interaction` and friends with its own
 * `*Edit` classes, unguarded, and qti-components' guarded registration then
 * backs off for those names. That is what stops the editor from rendering
 * player components inside ProseMirror's contenteditable.
 *
 * The player then cannot trust the global registry for those names. It needs
 * to know which tags the editor claimed, and the platform offers no way to
 * enumerate a registry -- hence this recorder. It must be the first module
 * evaluated in the app, before anything defines an element.
 */

const recorded = new Map<string, CustomElementConstructor>();
let editorOwned: ReadonlySet<string> = new Set<string>();

const originalDefine = customElements.define.bind(customElements);
customElements.define = function patchedDefine(
  name: string,
  constructor: CustomElementConstructor,
  options?: ElementDefinitionOptions,
) {
  if (!recorded.has(name)) recorded.set(name, constructor);
  return originalDefine(name, constructor, options);
};

/** Everything defined up to this point belongs to the editor. */
export function markEditorBoundary(): void {
  editorOwned = new Set(recorded.keys());
}

export function isEditorOwned(tag: string): boolean {
  return editorOwned.has(tag);
}

export function editorOwnedTags(): string[] {
  return [...editorOwned];
}
