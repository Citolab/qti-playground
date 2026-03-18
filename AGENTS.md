# qti-playground — Agent Instructions

## Purpose

This repo is the integration playground for the QTI packages. It is where browser-hosted behavior, uploaded package flows, preview rendering, and Storybook-driven PCI checks come together.

## Core principle: use this repo to prove integration, not to hide library bugs

If a failure reproduces here, first determine which layer owns it:

- browser ZIP import/prep issue → `@citolab/qti-browser-import`
- generic XML transform issue → `@citolab/qti-convert`
- TAO legacy PCI conversion issue → `@citolab/qti-convert-tao-pci`
- renderer/spec runtime issue → `@citolab/qti-components`
- app-only wiring/state issue → `qti-playground`

Do not patch around library bugs in this app unless the workaround is explicitly app-specific.

## Important local conventions

### yalc-based local package development

This app commonly consumes local packages through `file:.yalc/...`.

When testing local package changes:

1. rebuild/publish the changed package
2. verify the installed bundle in `node_modules/@citolab/...`
3. restart Vite with `--force` if needed

Do not assume Vite restart alone means the updated library bundle is actually installed.

### Storybook tests

- Storybook interaction tests here are useful for real PCI render checks.
- Only mark stories with `tags: ['test']` when they are stable enough for CI.
- Keep known-problematic or environment-sensitive stories tagged `manual`.
- If Vitest Storybook runs start re-optimizing dependencies mid-test, update `vite.config.ts` `optimizeDeps.include` to stabilize the harness before debugging story logic.

### Uploaded-package stories

Stories that depend on service worker / CacheStorage behavior are more fragile than direct package-preparation stories. Treat them as manual unless they are explicitly hardened for CI.

## Files to check first

- `src/app/store/store.ts`
- `src/app/pages/preview.tsx`
- `src/app/components/item-preview.tsx`
- `src/stories/PCIConformance.stories.tsx`
- `src/stories/QTI3PCI.stories.tsx`
- `src/stories/UploadedPackageBlob.stories.tsx`
- `.storybook/preview.ts`
- `vite.config.ts`
