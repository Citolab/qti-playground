import JSZip from "jszip";
import {
  QTI_PKG_URL_PREFIX,
  getPackageCacheName,
} from "@citolab/qti-browser-import";

/**
 * Rebuilds a downloadable QTI 3 package from what the Service Worker serves.
 *
 * The package cache is the single source of truth for an imported package: the import
 * writes every zip entry into it, replaces the QTI 2.x items with their converted QTI 3
 * versions, and the in-place editor writes edited items straight back into it. Zipping the
 * cache therefore hands back exactly what the player is running -- edits included.
 *
 * The one thing that must not survive the round trip is this app's own runtime plumbing.
 * Items are patched on import so that PCI modules, stylesheets and `data-base-url` point at
 * absolute `http://<origin>/__qti_pkg__/<packageId>/...` URLs, which are meaningless outside
 * this browser session. Those get turned back into package-relative paths on the way out.
 */

const TEXT_EXTENSIONS = new Set([
  "xml",
  "json",
  "js",
  "mjs",
  "css",
  "html",
  "htm",
  "txt",
  "svg",
  "xsl",
  "xslt",
  "xsd",
  "md",
]);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const dirOf = (path: string) => {
  const index = path.lastIndexOf("/");
  return index >= 0 ? path.slice(0, index + 1) : "";
};

const extensionOf = (path: string) => {
  const file = path.split("/").pop() || "";
  const dot = file.lastIndexOf(".");
  return dot > 0 ? file.slice(dot + 1).toLowerCase() : "";
};

/** `items/x.xml` + `modules/pci.js` -> `../modules/pci.js`. */
const relativeFromDir = (fromDir: string, target: string) => {
  const from = fromDir.split("/").filter(Boolean);
  const to = target.split("/").filter(Boolean);
  let shared = 0;
  while (shared < from.length && shared < to.length && from[shared] === to[shared]) {
    shared += 1;
  }
  const segments = [
    ...Array.from({ length: from.length - shared }, () => ".."),
    ...to.slice(shared),
  ];
  return segments.length > 0 ? segments.join("/") : ".";
};

const decodePath = (path: string) =>
  path
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");

/** Strips `/__qti_pkg__/<packageId>/` off a served URL, leaving the path inside the zip. */
export const packagePathFromUrl = (
  packageId: string,
  url: string,
): string | null => {
  let pathname: string;
  try {
    pathname = new URL(url, window.location.origin).pathname;
  } catch {
    return null;
  }
  for (const id of new Set([packageId, encodeURIComponent(packageId)])) {
    const prefix = `${QTI_PKG_URL_PREFIX}/${id}/`;
    if (pathname.startsWith(prefix)) {
      return decodePath(pathname.slice(prefix.length));
    }
  }
  return null;
};

const runtimeUrlPattern = (packageId: string) => {
  const ids = Array.from(new Set([packageId, encodeURIComponent(packageId)]))
    .map(escapeRegExp)
    .join("|");
  return new RegExp(
    // optional `http://origin` / `//origin`, then the virtual prefix, then the path in the zip
    `(?:(?:https?:)?//[^\\s"'<>()]*?)?${escapeRegExp(QTI_PKG_URL_PREFIX)}/(?:${ids})/([^\\s"'<>()]*)`,
    "gi",
  );
};

/** Attributes the import adds purely so the playground's PCI iframes work. */
const RUNTIME_ONLY_ATTRIBUTES =
  /\s+data-(?:forward-console|components-cdn-url|components-css-url)="[^"]*"/g;

const deRuntimeText = (
  text: string,
  packageId: string,
  zipPath: string,
): string => {
  const fromDir = dirOf(zipPath);
  return text
    .replace(runtimeUrlPattern(packageId), (_match, rest: string) =>
      relativeFromDir(fromDir, decodePath(rest)),
    )
    .replace(RUNTIME_ONLY_ATTRIBUTES, "");
};

/**
 * Zips everything the Service Worker currently serves for `packageId`.
 * Returns `null` when the package cache is gone (a reload without a re-import).
 */
export const exportPackageAsZip = async (
  packageId: string,
): Promise<Blob | null> => {
  if (typeof caches === "undefined") return null;

  const cacheName = getPackageCacheName(packageId);
  if (!(await caches.has(cacheName))) return null;

  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  if (requests.length === 0) return null;

  const zip = new JSZip();
  let fileCount = 0;

  for (const request of requests) {
    const zipPath = packagePathFromUrl(packageId, request.url);
    if (!zipPath) continue;

    const response = await cache.match(request);
    if (!response) continue;

    if (TEXT_EXTENSIONS.has(extensionOf(zipPath))) {
      zip.file(zipPath, deRuntimeText(await response.text(), packageId, zipPath));
    } else {
      zip.file(zipPath, await response.blob());
    }
    fileCount += 1;
  }

  if (fileCount === 0) return null;

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const safe =
    (filename || "download").replace(/[/\\?%*:|"<>]/g, "-").trim() || "download";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", safe);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the blob URL alive briefly so Chromium/Electron can finish the save.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const packageDownloadName = (packageFileName?: string) => {
  const base = (packageFileName || "qti-package")
    .replace(/^.*[/\\]/, "")
    .replace(/\.zip$/i, "")
    .trim();
  return `${base || "qti-package"}-qti3.zip`;
};
