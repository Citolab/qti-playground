import type { ProcessedMap } from "@citolab/qti-convert-tao-pci";

/**
 * Stands in for `@citolab/qti-convert-tao-pci` everywhere in the bundle.
 *
 * That package ships as one prebundled ~3.2 MB file (it carries the TAO PCI
 * runtime with it), and `@citolab/qti-browser-import` — a single 45 kB module
 * the store, the asset resolver and the package exporter all import — pulls it
 * in at module scope. A bundler cannot split one module across chunks, so the
 * whole 3.2 MB landed in the entry chunk and every visitor downloaded it before
 * the landing page could paint, even though a TAO package is a rare input.
 *
 * `vite.config.ts` redirects the package specifier here (see
 * `lazyTaoPciConversion`), so the dynamic import below is the only edge to the
 * real module and it ends up in a chunk of its own, fetched the first time an
 * item is actually converted. `convert` is the package's whole "." entry point
 * and is already async at both call sites, so the extra hop is invisible.
 */
export const convert: typeof import("@citolab/qti-convert-tao-pci").convert =
  async (processedFiles: ProcessedMap) => {
    const { convert: convertTaoPci } = await import(
      "@citolab/qti-convert-tao-pci"
    );
    return convertTaoPci(processedFiles);
  };
