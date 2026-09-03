import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

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

const appPackageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, "package.json"), "utf-8"),
) as {
  dependencies?: Record<string, string>;
};

function normalizeDependencyVersion(spec: string | undefined): string {
  if (!spec) {
    return "latest";
  }

  const match = spec.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/);
  return match?.[0] ?? "latest";
}

function resolveInstalledPackageRoot(packageName: string): string | null {
  const packageRoot = path.join(dirname, "node_modules", ...packageName.split("/"));
  if (!fs.existsSync(packageRoot)) {
    return null;
  }

  return fs.realpathSync(packageRoot);
}

const qtiComponentsVersion = normalizeDependencyVersion(
  appPackageJson.dependencies?.["@citolab/qti-components"],
);
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

function localQtiComponentsAssets(): Plugin {
  const cdnPath = qtiComponentsRoot
    ? path.join(qtiComponentsRoot, "cdn/index.js")
    : null;
  const cssPath = qtiComponentsRoot
    ? path.join(qtiComponentsRoot, "dist/item.css")
    : null;

  return {
    name: "qti-playground-local-qti-components-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?", 1)[0] || "";
        if (
          cdnPath &&
          (url === "/local-qti-components-cdn/index.js" || url === "/cdn/index.js")
        ) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          fs.createReadStream(cdnPath).pipe(res);
          return;
        }
        if (cssPath && url === "/local-qti-components-dist/item.css") {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
          fs.createReadStream(cssPath).pipe(res);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const hasLocalQtiComponentsAssets =
    !!qtiComponentsRoot &&
    fs.existsSync(path.join(qtiComponentsRoot, "cdn/index.js")) &&
    fs.existsSync(path.join(qtiComponentsRoot, "dist/item.css"));
  const useRemoteQtiComponentsAssets = mode === "production" || !hasLocalQtiComponentsAssets;
  const qtiComponentsCdnUrl = useRemoteQtiComponentsAssets
    ? `https://unpkg.com/@citolab/qti-components@${qtiComponentsVersion}/cdn/index.js`
    : "/cdn/index.js";
  const qtiComponentsCssUrl = useRemoteQtiComponentsAssets
    ? `https://unpkg.com/@citolab/qti-components@${qtiComponentsVersion}/dist/item.css`
    : "/local-qti-components-dist/item.css";

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
      qtiTypeScriptTransform(),
      spaHtmlFallbackForPackageRoute(),
      localQtiComponentsAssets(),
      react(),
      tailwindcss(),
    ],
    define: {
      __QTI_COMPONENTS_CDN_URL__: JSON.stringify(qtiComponentsCdnUrl),
      __QTI_COMPONENTS_CSS_URL__: JSON.stringify(qtiComponentsCssUrl),
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
