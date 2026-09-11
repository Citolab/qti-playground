import { useCallback, useRef, useState } from "react";

import { createScopedQtiRegistry, observeScopedSubtree } from "./scoped-registry";

/**
 * Gives a qti-components container its own custom element registry.
 *
 * The registry is created during the first render, not in an effect:
 * ItemContainer/TestContainer read `customElementRegistry` in
 * `createRenderRoot()`, so it has to be on the element before React connects
 * it. `attachRef` wires the mirror for markup the library injects at runtime.
 *
 * Spread the result onto the container:
 *   const { registry, attachRef } = useScopedQtiRegistry();
 *   <item-container ref={attachRef} customElementRegistry={registry} />
 */
export function useScopedQtiRegistry(enabled = true) {
  const [registry] = useState<CustomElementRegistry | null>(() =>
    enabled ? createScopedQtiRegistry() : null,
  );
  const disconnectRef = useRef<(() => void) | null>(null);

  const attachRef = useCallback(
    (container: HTMLElement | null) => {
      disconnectRef.current?.();
      disconnectRef.current = null;
      if (!container?.shadowRoot || !registry) return;
      disconnectRef.current = observeScopedSubtree(container.shadowRoot, registry);
    },
    [registry],
  );

  return { registry, attachRef };
}
