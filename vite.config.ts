import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

// https://vite.dev/config/
const dirname = path.dirname(fileURLToPath(import.meta.url));

const qtiComponentsVersion = JSON.parse(
  fs.readFileSync(
    path.resolve(dirname, "node_modules/@citolab/qti-components/package.json"),
    "utf-8",
  ),
).version as string;

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
  const cdnPath = path.resolve(
    dirname,
    "node_modules/@citolab/qti-components/cdn/index.js",
  );
  const cssPath = path.resolve(
    dirname,
    "node_modules/@citolab/qti-components/dist/item.css",
  );

  return {
    name: "qti-playground-local-qti-components-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?", 1)[0] || "";
        if (url === "/local-qti-components-cdn/index.js" || url === "/cdn/index.js") {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          fs.createReadStream(cdnPath).pipe(res);
          return;
        }
        if (url === "/local-qti-components-dist/item.css") {
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
  const isProd = mode === "production";
  const qtiComponentsCdnUrl = isProd
    ? `https://unpkg.com/@citolab/qti-components@${qtiComponentsVersion}/cdn/index.js`
    : "/cdn/index.js";
  const qtiComponentsCssUrl = isProd
    ? `https://unpkg.com/@citolab/qti-components@${qtiComponentsVersion}/dist/item.css`
    : "/local-qti-components-dist/item.css";

  return {
    plugins: [
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
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: [
        "boolbase",
        "cheerio",
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
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  };
});
