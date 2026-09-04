import { QTI_PKG_URL_PREFIX } from "@citolab/qti-browser-import";

/**
 * Resolving an item's asset paths against the item's own location.
 *
 * An item's `src`/`data` paths are relative to the item file, not to the page
 * the item is rendered on: an item at `items/q1.xml` referring to
 * `../img/pic.jpg` means `img/pic.jpg` inside the package. Every surface that
 * renders item markup in the app's own document therefore has to resolve those
 * paths first, or the browser resolves them against the app's URL and every
 * image 404s.
 *
 * Lifted out of the store's preview pipeline so the editor resolves assets
 * exactly the way the player next to it does -- two resolvers would be two
 * answers to the same question, and the editor's images were the case that
 * proved it.
 */

/** The attributes an item can carry a media reference in. */
const ASSET_ATTRIBUTES = ["src", "href", "data"] as const;

export type AssetUrlResolver = (rawValue: string) => string;

/**
 * A resolver for assets belonging to the item at `itemHref`, or null when there
 * is nothing to resolve against -- a new or shared item has no location of its
 * own, so its paths stay exactly as authored.
 */
export const createItemAssetResolver = (
  itemHref?: string,
): AssetUrlResolver | null => {
  if (!itemHref) return null;

  let itemDirPath: string;
  let packageRootUrl: string | null = null;
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const baseUrl = new URL(itemHref, origin || "http://localhost");
    const pathname = baseUrl.pathname;
    const isPackageHost = baseUrl.hostname === "__qti_pkg__";
    const pathnameWithPrefix = isPackageHost
      ? `${QTI_PKG_URL_PREFIX}${pathname}`
      : pathname;
    const idx = pathnameWithPrefix.lastIndexOf("/");
    itemDirPath =
      idx >= 0 ? pathnameWithPrefix.slice(0, idx + 1) : pathnameWithPrefix;

    if (isPackageHost) {
      const parts = pathname.split("/").filter(Boolean);
      const packageId = parts[0] || "";
      if (packageId) {
        packageRootUrl = `${QTI_PKG_URL_PREFIX}/${packageId}`;
      }
    } else {
      const parts = pathname.split("/").filter(Boolean);
      const prefix = QTI_PKG_URL_PREFIX.replace(/^\//, "");
      const pkgIdx = parts.indexOf(prefix);
      if (pkgIdx >= 0) {
        const packageId = parts[pkgIdx + 1] || "";
        if (packageId) {
          packageRootUrl = `${QTI_PKG_URL_PREFIX}/${packageId}`;
        }
      }
    }
  } catch {
    return null;
  }

  if (!itemDirPath) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = origin
    ? `${origin}${itemDirPath}`
    : `http://localhost${itemDirPath}`;

  return (raw: string) => {
    const value = raw.trim();
    if (!value) return raw;
    if (value.startsWith("#")) return raw;
    const originPrefix =
      typeof window !== "undefined" ? window.location.origin : "";
    if (/^https?:\/\/__qti_pkg__\//.test(value)) {
      const pathOnly = value.replace(/^https?:\/\/__qti_pkg__/, "");
      return originPrefix ? `${originPrefix}${pathOnly}` : pathOnly;
    }
    if (value.startsWith("//__qti_pkg__/")) {
      const pathOnly = value.slice(1);
      return originPrefix ? `${originPrefix}${pathOnly}` : pathOnly;
    }
    if (value.startsWith("__qti_pkg__/")) {
      const pathOnly = `/${value}`;
      return originPrefix ? `${originPrefix}${pathOnly}` : pathOnly;
    }
    if (value.startsWith("/__qti_pkg__/")) {
      return originPrefix ? `${originPrefix}${value}` : value;
    }
    if (/^(data:|blob:|https?:)/.test(value)) return raw;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return raw;
    if (value.startsWith("/assets/")) return raw;

    try {
      const normalizedValue =
        value.startsWith("/") &&
        packageRootUrl &&
        !value.startsWith(QTI_PKG_URL_PREFIX)
          ? `${packageRootUrl}${value}`
          : value;
      const u = new URL(normalizedValue, base);
      const path =
        u.hostname === "__qti_pkg__"
          ? `${QTI_PKG_URL_PREFIX}${u.pathname}${u.search}${u.hash}`
          : `${u.pathname}${u.search}${u.hash}`;
      return originPrefix && path.startsWith("/")
        ? `${originPrefix}${path}`
        : path;
    } catch {
      return raw;
    }
  };
};

/**
 * Rewrites every asset attribute in `xmlString` through `resolve`. `onRewrite`
 * sees each change, which is how the editor remembers what the author wrote so
 * it can hand the same paths back on export.
 */
export const mapItemAssetUrls = (
  xmlString: string,
  resolve: AssetUrlResolver,
  onRewrite?: (from: string, to: string) => void,
): string => {
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const nodes = doc.querySelectorAll("[src],[href],[data]");
  nodes.forEach((node) => {
    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    // A legacy custom interaction's `data` is the PCI module, resolved by the
    // interaction itself against its own base -- not an asset to rewrite here.
    const inLegacyCustomInteraction =
      tagName === "qti-custom-interaction" ||
      (tagName === "object" && el.closest("qti-custom-interaction"));
    ASSET_ATTRIBUTES.forEach((attr) => {
      const current = el.getAttribute(attr);
      if (!current) return;
      if (attr === "data" && inLegacyCustomInteraction) return;
      const next = resolve(current);
      if (next === current) return;
      el.setAttribute(attr, next);
      onRewrite?.(current, next);
    });
  });

  return new XMLSerializer().serializeToString(doc);
};
