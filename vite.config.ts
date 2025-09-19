import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

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
