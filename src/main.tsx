// The custom element registration order in this app is load-bearing, and it
// cannot be expressed with static imports alone.
//
// A bundler flattens the static import graph into chunks, and a chunk the entry
// imports is evaluated *in full* before the entry's own body runs. So as soon as
// code splitting put `@citolab/qti-components` into such a chunk, it registered
// its `qti-*` tags before this module executed -- inverting the order below. The
// recorder's boundary then captured the player's own tags as editor-owned (see
// app/registry-recorder.ts), and the preview's scoped registry deliberately
// leaves editor-owned tags unresolved, so items rendered as inert unknown
// elements. `vite dev` never shows this: it serves real ES modules, which do
// evaluate in source order.
//
// A dynamic import is the one edge a bundler may not hoist across, so it is what
// holds the two halves apart:
//   1. app/editor-first.ts installs the recorder, lets @citolab/prose-qti claim
//      the shared `qti-*` names, and marks the boundary.
//   2. app/bootstrap.tsx registers @citolab/qti-components and starts React.
//
// Keep this file free of every other static import. Adding one re-opens the hole,
// and only a production build will show it.
import "./app/editor-first";

import("./app/bootstrap").catch((error: unknown) => {
  console.error("Failed to start the QTI Playground:", error);
});
