import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function spaHtmlFallbackForPackageRoute(): Plugin {
  // In dev, `GET /package` can sometimes be served as `package.json` (Vite JSON-as-ESM),
  // which breaks React Router hard reloads/back navigations.
  // Force SPA fallback for HTML navigations to `/package`.
  return {
    name: "qti-playground-spa-package-route-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || "";
        const pathname = url.split("?", 1)[0];
        const accept = req.headers.accept || "";
        const isHtmlNav = accept.includes("text/html");
        if (isHtmlNav && (pathname === "/package" || pathname === "/package/")) {
          req.url = "/index.html";
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
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
    include: ["boolbase", "xml-formatter"],
    exclude: [
      "@citolab/qti-components",
      "@citolab/qti-extended",
      "@citolab/qti-convert",
      "lucide-react",
    ],
  },
});
