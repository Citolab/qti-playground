const QTI_UPGRADER_SEF_URL =
  "https://raw.githubusercontent.com/citolab/qti30Upgrader/refs/heads/main/qti2xTo30.sef.json";

const LOCAL_STORAGE_KEY = "qti30Upgrader:qti2xTo30.sef.json:v1";

let cachedBlobUrl: string | null = null;
let inflight: Promise<string> | null = null;

function makeBlobUrlFromJsonText(jsonText: string): string {
  const blob = new Blob([jsonText], { type: "application/json" });
  return URL.createObjectURL(blob);
}

function tryReadCachedJsonText(): string | null {
  try {
    const value = localStorage.getItem(LOCAL_STORAGE_KEY);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

function tryWriteCachedJsonText(jsonText: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonText);
  } catch {
    // ignore storage quota / privacy mode errors
  }
}

/**
 * Returns a stable (in-session) blob: URL for the QTI 2.x -> 3.0 upgrader stylesheet JSON.
 *
 * Why blob URL?
 * `@citolab/qti-convert` always `fetch()`es the `xsltJson` argument. Passing a blob URL
 * prevents repeated network requests to GitHub while keeping the library unchanged.
 */
export async function getUpgraderStylesheetBlobUrl(): Promise<string> {
  if (cachedBlobUrl) return cachedBlobUrl;
  if (inflight) return inflight;

  inflight = (async () => {
    const cachedText = tryReadCachedJsonText();
    if (cachedText) {
      cachedBlobUrl = makeBlobUrlFromJsonText(cachedText);
      return cachedBlobUrl;
    }

    const response = await fetch(QTI_UPGRADER_SEF_URL, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error(
        `Failed to load upgrader stylesheet (${response.status} ${response.statusText})`,
      );
    }

    const jsonText = await response.text();
    // Validate it's JSON so we don't cache an HTML error page.
    JSON.parse(jsonText);
    tryWriteCachedJsonText(jsonText);

    cachedBlobUrl = makeBlobUrlFromJsonText(jsonText);
    return cachedBlobUrl;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function revokeUpgraderStylesheetBlobUrl(): void {
  if (cachedBlobUrl) {
    try {
      URL.revokeObjectURL(cachedBlobUrl);
    } catch {
      // ignore
    }
    cachedBlobUrl = null;
  }
}

