import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

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

// https://vite.dev/config/
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [spaHtmlFallbackForPackageRoute(), react(), tailwindcss()],

  build: {
    outDir: "dist",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ["boolbase", "xml-formatter", "@storybook/react-vite", "storybook/test"],
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
});
