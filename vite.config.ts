import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import {
  QTI3_SHARED_VOCABULARY_CSS,
  QTI3_SHARED_VOCABULARY_CSS_PATH,
} from "@citolab/qti-convert/qti-downgrader";

// https://vite.dev/config/
const dirname = path.dirname(fileURLToPath(import.meta.url));

const qtiPackagePattern =
  /node_modules\/@citolab\/(?:prose-qti|prose-extensions)\//;

/** Citolab packages ship raw TS with Lit @decorators; Vite's Oxc skips them. */
function qtiTypeScriptTransform(): Plugin {
  return {
    name: "qti-typescript-transform",
    enforce: "pre",
    async transform(code, id) {
      const filePath = id.split("?")[0]!;
      if (!qtiPackagePattern.test(filePath)) return null;
      if (filePath.includes("/core-css/")) return null;
      if (filePath.includes(".vite/deps")) return null;
      if (!/\.(?:tsx?|jsx?)$/.test(filePath)) return null;

      const loader = filePath.endsWith(".tsx")
        ? "tsx"
        : filePath.endsWith(".ts")
          ? "ts"
          : filePath.endsWith(".jsx")
            ? "jsx"
            : "js";

      const result = await esbuild.transform(code, {
        loader,
        format: "esm",
        target: "es2022",
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
            useDefineForClassFields: false,
          },
        },
      });

      return { code: result.code, map: result.map };
    },
  };
}

const prosemirrorDeps = [
  "prosemirror-model",
  "prosemirror-state",
  "prosemirror-transform",
  "prosemirror-view",
  "prosemirror-commands",
  "prosemirror-history",
  "prosemirror-keymap",
  "prosemirror-schema-list",
  "prosemirror-schema-basic",
  "prosemirror-inputrules",
  "prosemirror-gapcursor",
  "prosemirror-dropcursor",
  "prosemirror-tables",
] as const;

const qtiEditorOptimizeDepsInclude = [
  "prosekit/core",
  "prosekit/pm/commands",
  "prosekit/pm/history",
  "prosekit/pm/state",
  "prosekit/pm/model",
  "prosekit/pm/transform",
  "prosekit/pm/view",
  "prosekit/pm/keymap",
  "prosekit/pm/inputrules",
  "prosekit/extensions/doc",
  "prosekit/extensions/gap-cursor",
  "prosekit/extensions/hard-break",
  "prosekit/extensions/heading",
  "prosekit/extensions/image",
  "prosekit/extensions/mod-click-prevention",
  "prosekit/extensions/paragraph",
  "prosekit/extensions/table",
  "prosekit/extensions/text",
  "prosekit/extensions/virtual-selection",
  "@citolab/prose-extensions/prosekit",
  ...prosemirrorDeps,
] as const;

function resolveInstalledPackageRoot(packageName: string): string | null {
  const packageRoot = path.join(dirname, "node_modules", ...packageName.split("/"));
  if (!fs.existsSync(packageRoot)) {
    return null;
  }

  return fs.realpathSync(packageRoot);
}

const qtiComponentsRoot = resolveInstalledPackageRoot("@citolab/qti-components");
const pdfWorkerSourcePath = path.join(
  dirname,
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs",
);
const pdfWorkerTargetPath = path.join(dirname, "public", "pdf.worker.mjs");

function ensurePdfWorkerAsset(): void {
  if (!fs.existsSync(pdfWorkerSourcePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(pdfWorkerTargetPath), { recursive: true });

  const source = fs.readFileSync(pdfWorkerSourcePath);
  const target = fs.existsSync(pdfWorkerTargetPath)
    ? fs.readFileSync(pdfWorkerTargetPath)
    : null;

  if (!target || !source.equals(target)) {
    fs.writeFileSync(pdfWorkerTargetPath, source);
  }
}

/**
 * Serves the QTI 3 shared vocabulary stylesheet at /qti3-shared-vocabulary.css. Items converted to QTI 2.1 on the
 * item convert page refer to it by URL. Written from @citolab/qti-convert, so it is always the stylesheet the
 * package conversion injects.
 */
function ensureSharedVocabularyStylesheetAsset(): void {
  const target = path.join(dirname, "public", QTI3_SHARED_VOCABULARY_CSS_PATH);
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  if (current !== QTI3_SHARED_VOCABULARY_CSS) {
    fs.writeFileSync(target, QTI3_SHARED_VOCABULARY_CSS);
  }
}

const taoPciSpecifier = "@citolab/qti-convert-tao-pci";
const taoPciLazyShim = path.resolve(dirname, "src/lib/tao-pci-lazy.ts");

/**
 * Keeps the ~3.2 MB TAO PCI converter out of the entry chunk.
 *
 * `@citolab/qti-browser-import` imports it at module scope, and that module is
 * reachable from the landing page through the store, so the converter was part
 * of the payload every visitor downloaded. Redirecting the specifier to
 * `src/lib/tao-pci-lazy.ts` leaves a single `import()` edge to the real package,
 * which rolldown can then emit as an on-demand chunk. The shim's own import is
 * let through, otherwise it would resolve to itself.
 */
function lazyTaoPciConversion(): Plugin {
  return {
    name: "qti-playground-lazy-tao-pci",
    enforce: "pre",
    resolveId(source, importer) {
      if (source !== taoPciSpecifier) return null;
      if (importer && path.resolve(importer.split("?")[0]!) === taoPciLazyShim) {
        return null;
      }
      return taoPciLazyShim;
    },
  };
}

function spaHtmlFallbackForPackageRoute(): Plugin {
  // In dev, `GET /package` can sometimes be served as `package.json` (Vite JSON-as-ESM),
  // which breaks React Router hard reloads/back navigations.
  // Force SPA fallback for HTML navigations to `/package`.
  return {
    name: "qti-playground-spa-package-route-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = req as any;
        const url = request.url || "";
        const pathname = url.split("?", 1)[0];
        const accept = request.headers.accept || "";
        const isHtmlNav = accept.includes("text/html");
        if (
          isHtmlNav &&
          (pathname === "/package" || pathname === "/package/")
        ) {
          request.url = "/index.html";
        }
        next();
      });
    },
  };
}

/**
 * Serves the installed qti-components bundle and item stylesheet from the app itself, at
 * QTI_COMPONENTS_ASSETS, in dev and in the build. The PCI iframe imports that bundle and waits
 * for it before it starts the PCI, so a slow or hanging CDN kept PCIs from loading at all; the
 * copy here is also always the version the app was built against. `/cdn/index.js` is where
 * qti-components looks on localhost when an item does not say.
 */
const QTI_COMPONENTS_ASSETS = {
  bundle: "qti-components/index.js",
  css: "qti-components/item.css",
};

function qtiComponentsAssets(): Plugin {
  const sources = qtiComponentsRoot
    ? {
        bundle: path.join(qtiComponentsRoot, "cdn/index.js"),
        css: path.join(qtiComponentsRoot, "dist/item.css"),
      }
    : null;
  const routes = sources
    ? new Map([
        [`/${QTI_COMPONENTS_ASSETS.bundle}`, sources.bundle],
        ["/cdn/index.js", sources.bundle],
        [`/${QTI_COMPONENTS_ASSETS.css}`, sources.css],
      ])
    : new Map<string, string>();

  return {
    name: "qti-playground-qti-components-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = routes.get(req.url?.split("?", 1)[0] || "");
        if (!file) return next();
        res.setHeader(
          "Content-Type",
          file.endsWith(".css") ? "text/css; charset=utf-8" : "application/javascript; charset=utf-8",
        );
        fs.createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      if (!sources) {
        this.error("@citolab/qti-components is not installed, so its bundle cannot be copied into the build");
      }
      for (const key of ["bundle", "css"] as const) {
        this.emitFile({
          type: "asset",
          fileName: QTI_COMPONENTS_ASSETS[key],
          source: fs.readFileSync(sources[key]),
        });
      }
    },
  };
}

/**
 * Serves Monaco (the XML editors) from the installed monaco-editor package, at MONACO_VS, in dev and in the build.
 * @monaco-editor/react loads it from cdn.jsdelivr.net by default; src/app/monaco-loader.ts points it here instead,
 * so the editors need no public CDN and run the version in the lockfile. Monaco still loads lazily, file by file.
 */
const MONACO_VS = "monaco/vs";
const monacoRoot = resolveInstalledPackageRoot("monaco-editor");

function monacoAssets(): Plugin {
  const source = monacoRoot ? path.join(monacoRoot, "min/vs") : null;
  const types: Record<string, string> = {
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".ts": "application/javascript; charset=utf-8",
  };
  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? files(full) : [full];
    });

  return {
    name: "qti-playground-monaco-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?", 1)[0] || "";
        if (!source || !url.startsWith(`/${MONACO_VS}/`)) return next();
        const file = path.join(source, decodeURIComponent(url.slice(MONACO_VS.length + 2)));
        if (!file.startsWith(source + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
        res.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
        fs.createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      if (!source) {
        this.error("monaco-editor is not installed, so the editors cannot be served from the app");
      }
      for (const file of files(source)) {
        this.emitFile({
          type: "asset",
          fileName: path.posix.join(MONACO_VS, path.relative(source, file).split(path.sep).join("/")),
          source: fs.readFileSync(file),
        });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: "qti-playground-pdf-worker-asset",
        buildStart() {
          ensurePdfWorkerAsset();
        },
        configureServer() {
          ensurePdfWorkerAsset();
        },
      },
      {
        name: "qti-playground-shared-vocabulary-stylesheet",
        buildStart() {
          ensureSharedVocabularyStylesheetAsset();
        },
        configureServer() {
          ensureSharedVocabularyStylesheetAsset();
        },
      },
      qtiTypeScriptTransform(),
      lazyTaoPciConversion(),
      spaHtmlFallbackForPackageRoute(),
      qtiComponentsAssets(),
      monacoAssets(),
      react(),
      tailwindcss(),
    ],
    define: {
      __QTI_COMPONENTS_CDN_URL__: JSON.stringify(`/${QTI_COMPONENTS_ASSETS.bundle}`),
      __MONACO_VS_URL__: JSON.stringify(`/${MONACO_VS}`),
      __QTI_COMPONENTS_CSS_URL__: JSON.stringify(`/${QTI_COMPONENTS_ASSETS.css}`),
    },
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },

    build: {
      outDir: "dist",
      // Vite 8 minifies CSS with lightningcss by default, which cannot parse
      // `::part(drag):state(candidate-correct)` in @citolab/qti-components/dist/item.css
      // ("Invalid state"). Unlike the `&::part(drop-list)[dragging]` selector this
      // originally worked around — fixed in qti-components 8.0.0 — that selector is valid
      // CSS and is qti-components' documented channel for painting a dropped drag, so this
      // override stays until lightningcss supports `:state()` after `::part()`.
      cssMinify: "esbuild",
      reportCompressedSize: true,
      // The default 500 kB budget is meant to catch an oversized initial
      // payload, and after the route-level splitting in app/app.tsx the only
      // chunks the landing page pulls are `index` (~650 kB, mostly react-dom)
      // and `scoped-registry` (~780 kB of @citolab/qti-components, registered
      // eagerly in main.tsx because registration order matters). Everything
      // above the budget is fetched on demand and is a single prebundled vendor
      // file that cannot be split further:
      //   @mlc-ai/web-llm            ~6.0 MB  local AI engine, one module
      //   @citolab/qti-convert-tao-pci ~3.2 MB  TAO PCI conversion, one module
      //   ai-convert page            ~1.9 MB  + exceljs, pdfjs, local-ai
      //   modify-package page        ~840 kB  + docx, pdf-lib
      // The limit is therefore calibrated to the largest of those. Lower it
      // again if @mlc-ai/web-llm ever leaves the dependency list.
      chunkSizeWarningLimit: 6500,
      commonjsOptions: {
        transformMixedEsModules: true,
        exclude: [/@citolab\/prose-qti/, /@citolab\/prose-extensions/, /@qti-components\//],
      },
    },
    optimizeDeps: {
      include: [
        "boolbase",
        "cheerio",
        "docx",
        "pdf-lib",
        "@citolab/qti-convert-export",
        "xml-formatter",
        "@storybook/react-vite",
        "storybook/test",
        "react-router-dom",
        "react-dom/client",
        "lit",
        "lit/decorators.js",
        "@monaco-editor/react",
        "use-debounce",
        "clsx",
        "tailwind-merge",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-tabs",
        "@radix-ui/react-label",
        "zustand",
        "zustand/middleware",
        "axios",
        "prosekit/core",
        "prosekit/basic",
        "prosekit/pm/model",
        "prosekit/pm/commands",
        "prosekit/pm/history",
        "prosekit/pm/state",
        "@radix-ui/react-switch",
        "@radix-ui/react-dropdown-menu",
        ...qtiEditorOptimizeDepsInclude,
      ],
      exclude: [
        "@citolab/qti-browser-import",
        "@citolab/qti-convert-tao-pci",
        "@citolab/qti-components",
        "@citolab/qti-extended",
        "@citolab/qti-convert",
        "lucide-react",
      ],
    },
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
              tags: {
                include: ["test"],
                exclude: ["manual"],
                skip: [],
              },
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [{ browser: "chromium" }],
            },
          },
        },
      ],
    },
  };
});
