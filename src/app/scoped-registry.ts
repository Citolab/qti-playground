/**
 * Spike: render the QTI player inside a scoped custom element registry.
 *
 * Scoped registries (Safari 26, Chrome/Edge 146, no Firefox yet) let a shadow
 * root resolve custom element names against its own registry instead of the
 * global one. `@citolab/qti-components` >= 8 already supports this: both
 * `<item-container>` and `<test-container>` expose a `customElementRegistry`
 * property that they forward to `attachShadow()` and to
 * `qtiTransformItem().htmlDoc(registry)`.
 *
 * Goal: let the player own the `qti-*` names inside its own subtree, so an
 * editor registered separately can keep the global names for itself.
 *
 * Known gap this spike does NOT close: importing `@citolab/qti-components`
 * still defines every `qti-*` tag on the global registry as an unguarded
 * import side effect (its `register-all.js` runs at module top level), so
 * import order still decides who owns the global names. Closing that needs a
 * side-effect-free entry point upstream in qti-components.
 */

let supportCache: boolean | null = null;

/**
 * Runtime probe rather than a UA check: define a tag in a fresh registry only,
 * then see whether `createElement` honours the registry option. On a browser
 * that ignores the option the element stays un-upgraded, because the tag was
 * never defined globally.
 */
export function supportsScopedRegistries(): boolean {
  if (supportCache !== null) return supportCache;
  try {
    const probeRegistry = new CustomElementRegistry();
    class ScopedRegistryProbe extends HTMLElement {}
    probeRegistry.define("scoped-registry-probe", ScopedRegistryProbe);
    const element = document.createElement("scoped-registry-probe", {
      customElementRegistry: probeRegistry,
    });
    supportCache = element instanceof ScopedRegistryProbe;
  } catch {
    supportCache = false;
  }
  return supportCache;
}

/** Verifies the other half of the API: `attachShadow({ customElementRegistry })`. */
export function supportsScopedShadowRoots(): boolean {
  if (!supportsScopedRegistries()) return false;
  try {
    const probeRegistry = new CustomElementRegistry();
    class ScopedShadowProbe extends HTMLElement {}
    probeRegistry.define("scoped-shadow-probe", ScopedShadowProbe);
    const host = document.createElement("div");
    const shadow = host.attachShadow({
      mode: "open",
      customElementRegistry: probeRegistry,
    });
    shadow.innerHTML = "<scoped-shadow-probe></scoped-shadow-probe>";
    return shadow.firstElementChild instanceof ScopedShadowProbe;
  } catch {
    return false;
  }
}

export function createScopedQtiRegistry(): CustomElementRegistry | null {
  if (!supportsScopedRegistries()) return null;
  return new CustomElementRegistry();
}

export type ScopedRegistrySyncResult = {
  /** Tags copied from the global registry into the scoped one by this call. */
  defined: string[];
  /** Tags present in the document that no registry knows yet. */
  pending: string[];
};

/**
 * There is no way to enumerate the global registry, so the scoped registry is
 * built from the tags that actually appear in the item: for each one, look up
 * the constructor globally and re-define it here. The same constructor may be
 * registered in more than one registry, so this does not disturb the global
 * definitions. Tags nothing has defined yet (lazily registered app tools such
 * as `dep-textmarker`) are mirrored in as soon as they land globally.
 */
export function syncScopedRegistry(
  registry: CustomElementRegistry,
  source: Document | DocumentFragment | Element,
): ScopedRegistrySyncResult {
  const defined: string[] = [];
  const pending: string[] = [];
  let watched = watchedTags.get(registry);
  if (!watched) {
    watched = new Set<string>();
    watchedTags.set(registry, watched);
  }

  for (const tag of collectCustomTagNames(source)) {
    if (registry.get(tag)) continue;
    const ctor = customElements.get(tag);
    if (ctor) {
      registry.define(tag, ctor);
      defined.push(tag);
      continue;
    }
    pending.push(tag);
    if (watched.has(tag)) continue;
    watched.add(tag);
    void customElements.whenDefined(tag).then(() => {
      const lateCtor = customElements.get(tag);
      if (lateCtor && !registry.get(tag)) registry.define(tag, lateCtor);
    });
  }

  return { defined, pending };
}

const watchedTags = new WeakMap<CustomElementRegistry, Set<string>>();

/**
 * Mirrors tags into the scoped registry as they appear in the rendered tree.
 *
 * Seeding from the source XML is not enough: qti-components injects markup at
 * runtime that the source never mentions. The clearest case is
 * `<qti-response-processing template="...rptemplates/map_response.xml">`, which
 * is empty in the item and expands in `firstUpdated()` into eight processing
 * elements. Scoped correctly (qti-components >= 8.1.0), those elements resolve
 * against this registry -- so if the registry has not heard of them they never
 * upgrade, and response processing fails with `rule.process is not a function`.
 *
 * The right long-term fix is upstream: qti-components exporting a complete
 * tag -> constructor manifest (it exports only `qtiInteractionElements` today),
 * so the registry can be populated up front from the library's own classes
 * rather than mirrored out of the global registry. That also matters when an
 * editor owns the global names -- mirroring would then copy the wrong classes.
 */
export function observeScopedSubtree(
  root: ShadowRoot,
  registry: CustomElementRegistry,
): () => void {
  const mirror = (element: Element) => {
    const tag = element.localName;
    if (!tag.includes("-") || registry.get(tag)) return;
    const ctor = customElements.get(tag);
    // Defining the tag upgrades the elements already waiting on it.
    if (ctor) registry.define(tag, ctor);
  };
  const scan = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    mirror(element);
    element.querySelectorAll("*").forEach(mirror);
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(scan);
  });
  observer.observe(root, { childList: true, subtree: true });
  // Catch whatever was already rendered before the observer attached.
  root.querySelectorAll("*").forEach(mirror);

  return () => observer.disconnect();
}


function collectCustomTagNames(
  source: Document | DocumentFragment | Element,
): Set<string> {
  const tags = new Set<string>();
  source.querySelectorAll("*").forEach((element) => {
    const tag = element.localName;
    // A hyphen is what makes a name a valid custom element name.
    if (tag.includes("-")) tags.add(tag);
  });
  return tags;
}

export type ScopedRegistryReport = {
  supported: boolean;
  shadowRootsSupported: boolean;
  /** Whether the container's shadow root actually resolves against `registry`. */
  shadowRootScoped: boolean | "unknown";
  /** Tag count in the scoped registry, as far as this module defined them. */
  scopedTags: string[];
  /** Sanity check that scoping did not cost us the global definitions. */
  globalStillDefined: boolean;
  /**
   * Custom elements inside the player that are NOT bound to the scoped
   * registry. A registry is fixed per element at creation time, so anything
   * the library builds at runtime through a document-level API escapes the
   * scope. Known offender: `QtiResponseProcessing.firstUpdated()` expands a
   * `template="...rptemplates/map_response.xml"` attribute with
   * `document.createRange().createContextualFragment(...)`, which parses
   * against the document's registry.
   */
  leakedTags: string[];
};

/**
 * Reports whether scoping actually took effect on a live container. The
 * `customElementRegistry` property must be set before the element connects
 * (`ItemContainer.createRenderRoot` reads it), so this is the check that tells
 * us whether React set it early enough.
 */
export function inspectScopedContainer(
  container: Element | null,
  registry: CustomElementRegistry | null,
  scopedTags: string[],
): ScopedRegistryReport {
  const shadowRoot = (container as { shadowRoot?: ShadowRoot | null } | null)
    ?.shadowRoot;
  let shadowRootScoped: boolean | "unknown" = "unknown";
  if (registry && shadowRoot && "customElementRegistry" in shadowRoot) {
    shadowRootScoped =
      (shadowRoot as ShadowRoot & { customElementRegistry?: unknown })
        .customElementRegistry === registry;
  }

  return {
    supported: supportsScopedRegistries(),
    shadowRootsSupported: supportsScopedShadowRoots(),
    shadowRootScoped,
    scopedTags,
    globalStillDefined: !!customElements.get("qti-assessment-item"),
    leakedTags: registry && shadowRoot ? findLeakedTags(shadowRoot, registry) : [],
  };
}

/** Elements in the subtree whose registry is not the scoped one. */
function findLeakedTags(
  root: ShadowRoot,
  registry: CustomElementRegistry,
): string[] {
  const leaked = new Set<string>();
  root.querySelectorAll("*").forEach((element) => {
    if (!element.localName.includes("-")) return;
    // Chrome exposes the association as `Element.customElementRegistry`;
    // without it there is no way to tell, so report nothing rather than guess.
    if (!("customElementRegistry" in element)) return;
    const bound = (element as Element & { customElementRegistry?: unknown })
      .customElementRegistry;
    if (bound !== registry) leaked.add(element.localName);
  });
  return [...leaked];
}
