import JSZip from "jszip";
import { QTI_PKG_URL_PREFIX } from "@citolab/qti-browser-import";

/**
 * Wraps one item -- the thing the preview page is editing -- into a QTI 3
 * content package that other tools can open.
 *
 * The item is written at the package root rather than under `items/` on purpose:
 * asset references in an item are relative to the item, so keeping the item at
 * the root lets every relative reference (`images/sign.png`) stay exactly as the
 * author wrote it, and the asset go to the matching path in the zip. Only
 * references that can't live at a package-relative path -- absolute paths,
 * absolute URLs, `blob:` handles from an uploaded package, anything reaching
 * above the root with `..` -- get copied into `assets/` and rewritten.
 */

/** Attributes that can carry a media reference, and where they don't. */
const REFERENCE_ATTRIBUTES = ["src", "href", "data"] as const;

const MEDIA_EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export type SingleItemPackage = {
  blob: Blob;
  filename: string;
  identifier: string;
  /** References that could not be fetched; left pointing where they were. */
  skippedAssets: string[];
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const safeFileStem = (value: string, fallback: string) => {
  const stem = value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return stem || fallback;
};

/**
 * Turns an authored reference into something fetchable, the same way the
 * preview does: relative to the item's own location when it has one, and
 * relative to the current page for an item that was typed rather than loaded.
 */
const fetchBaseFor = (itemHref?: string): string => {
  if (!itemHref) return window.location.href;
  try {
    const url = new URL(itemHref, window.location.href);
    // Uploaded-package items are addressed through a virtual host; the Service
    // Worker serves them from a same-origin path instead.
    if (url.hostname === "__qti_pkg__") {
      return `${window.location.origin}${QTI_PKG_URL_PREFIX}${url.pathname}`;
    }
    return url.href;
  } catch {
    return window.location.href;
  }
};

/** A reference the package can keep verbatim, or `null` if it must be rehomed. */
const packageRelativePath = (reference: string): string | null => {
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(reference)) return null; // any scheme
  if (reference.startsWith("//") || reference.startsWith("/")) return null;
  const normalized = reference.split(/[?#]/)[0];
  if (!normalized) return null;
  const segments: string[] = [];
  for (const segment of normalized.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (segments.length === 0) return null; // escapes the package root
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.length > 0 ? segments.join("/") : null;
};

const extensionFor = (path: string, contentType: string) => {
  const file = path.split("/").pop() || "";
  const dot = file.lastIndexOf(".");
  if (dot > 0) return file.slice(dot + 1);
  return MEDIA_EXTENSION_BY_MIME[contentType.split(";")[0].trim()] ?? "bin";
};

const isReferenceAttribute = (element: Element, attribute: string) => {
  const tagName = element.tagName.toLowerCase();
  // A hyperlink's target is not an asset to bundle.
  if (attribute === "href" && tagName === "a") return false;
  return true;
};

export const buildSingleItemPackage = async (
  itemXml: string,
  itemHref?: string,
): Promise<SingleItemPackage> => {
  const doc = new DOMParser().parseFromString(itemXml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("The item is not valid XML, so it cannot be packaged.");
  }
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "qti-assessment-item") {
    throw new Error("Only a qti-assessment-item can be packaged as an item.");
  }

  const identifier = root.getAttribute("identifier")?.trim() || "item";
  const itemPath = `${safeFileStem(identifier, "item")}.xml`;

  const base = fetchBaseFor(itemHref);
  const zip = new JSZip();
  const skippedAssets: string[] = [];
  /** zip path -> already added, so two references to one image fetch once. */
  const addedAssets = new Map<string, string>();
  const usedAssetPaths = new Set<string>([itemPath, "imsmanifest.xml"]);

  for (const element of Array.from(doc.querySelectorAll("*"))) {
    for (const attribute of REFERENCE_ATTRIBUTES) {
      const reference = element.getAttribute(attribute);
      if (!reference || !reference.trim()) continue;
      if (reference.startsWith("#") || reference.startsWith("data:")) continue;
      if (!isReferenceAttribute(element, attribute)) continue;

      const cached = addedAssets.get(reference);
      if (cached !== undefined) {
        if (cached !== reference) element.setAttribute(attribute, cached);
        continue;
      }

      let fetchUrl: string;
      try {
        fetchUrl = reference.startsWith("blob:")
          ? reference
          : new URL(reference, base).href;
      } catch {
        skippedAssets.push(reference);
        continue;
      }

      let blob: Blob;
      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(String(response.status));
        const contentType = response.headers.get("content-type") ?? "";
        // A catch-all SPA rewrite answers a missing asset with the app shell.
        if (contentType.toLowerCase().startsWith("text/html")) {
          throw new Error("not an asset");
        }
        blob = await response.blob();
      } catch {
        skippedAssets.push(reference);
        continue;
      }

      let zipPath = packageRelativePath(reference);
      if (zipPath === null || usedAssetPaths.has(zipPath)) {
        const stem = safeFileStem(
          (reference.split(/[?#]/)[0].split("/").pop() || "asset").replace(
            /\.[^.]*$/,
            "",
          ),
          "asset",
        );
        const extension = extensionFor(
          reference.split(/[?#]/)[0],
          blob.type,
        );
        let candidate = `assets/${stem}.${extension}`;
        let counter = 2;
        while (usedAssetPaths.has(candidate)) {
          candidate = `assets/${stem}-${counter}.${extension}`;
          counter += 1;
        }
        zipPath = candidate;
      }

      usedAssetPaths.add(zipPath);
      zip.file(zipPath, blob);
      addedAssets.set(reference, zipPath);
      if (zipPath !== reference) element.setAttribute(attribute, zipPath);
    }
  }

  const serializedItem = new XMLSerializer().serializeToString(doc);
  zip.file(
    itemPath,
    serializedItem.startsWith("<?xml")
      ? serializedItem
      : `<?xml version="1.0" encoding="UTF-8"?>\n${serializedItem}`,
  );

  const files = [itemPath, ...Array.from(addedAssets.values())];
  zip.file(
    "imsmanifest.xml",
    buildManifest({ identifier, itemPath, files }),
  );

  return {
    blob: await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    }),
    filename: `${safeFileStem(identifier, "item")}-qti3.zip`,
    identifier,
    skippedAssets,
  };
};

const buildManifest = ({
  identifier,
  itemPath,
  files,
}: {
  identifier: string;
  itemPath: string;
  files: string[];
}) => {
  const resourceIdentifier = `RES-${safeFileStem(identifier, "item")}`;
  const fileEntries = files
    .map((file) => `      <file href="${escapeXml(file)}"/>`)
    .join("\n");

  // The QTI 3.0 content-packaging profile namespace, not plain IMS CP: that is
  // what the QTI 3 schema binds. `organizations` is required by the CP content
  // model even with nothing in it -- leaving it out makes `resources` itself
  // report as invalid (cvc-complex-type.2.4.a), which is confusing to read.
  // Resource-level metadata is deliberately absent; the item's own title and
  // identifier already carry that, and the profile is strict about what may
  // appear here.
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd"
  identifier="MANIFEST-${escapeXml(safeFileStem(identifier, "item"))}">
  <metadata>
    <schema>QTI Package</schema>
    <schemaversion>3.0.0</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${escapeXml(resourceIdentifier)}" type="imsqti_item_xmlv3p0" href="${escapeXml(itemPath)}">
${fileEntries}
    </resource>
  </resources>
</manifest>
`;
};
