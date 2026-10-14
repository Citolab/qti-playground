import { loader } from "@monaco-editor/react";

// The XML editors load Monaco from the app itself (vite.config.ts, monacoAssets) instead of cdn.jsdelivr.net,
// @monaco-editor/react's default. Has to run before the first <Editor> mounts.
loader.config({ paths: { vs: new URL(__MONACO_VS_URL__, window.location.href).href } });
