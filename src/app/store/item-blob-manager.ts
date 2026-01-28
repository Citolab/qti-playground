/**
 * Manages blob storage for XML items to avoid localStorage size limitations
 */
export class ItemBlobManager {
  private static instance: ItemBlobManager;
  private blobUrls: Map<string, string> = new Map();
  private hrefToBlobMap: Map<string, string> = new Map(); // Maps original href to blob URL

  private constructor() {
    // Clean up blobs when the page is unloaded
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.cleanup();
      });
    }
  }

  static getInstance(): ItemBlobManager {
    if (!ItemBlobManager.instance) {
      ItemBlobManager.instance = new ItemBlobManager();
    }
    return ItemBlobManager.instance;
  }

  private isLikelyUriWithScheme(value: string): boolean {
    // Match e.g. "blob:", "http:", "https:", "data:", etc.
    // Treat Windows drive letters like "C:\\" as not-a-scheme.
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) && !/^[a-zA-Z]:[\\/]/.test(value);
  }

  private normalizeRelativeHref(href: string): string {
    const trimmed = href.trim().replace(/\\/g, "/");
    if (!trimmed || this.isLikelyUriWithScheme(trimmed)) return trimmed;

    const withoutLeadingDotSlash = trimmed.startsWith("./")
      ? trimmed.slice(2)
      : trimmed;

    const parts = withoutLeadingDotSlash.split("/").filter((p) => p !== "");
    const stack: string[] = [];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") {
        if (stack.length > 0 && stack[stack.length - 1] !== "..") {
          stack.pop();
        } else {
          stack.push("..");
        }
        continue;
      }
      stack.push(part);
    }

    return stack.join("/");
  }

  private safeDecodeUriComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private getHrefLookupCandidates(href: string): string[] {
    const raw = href;
    const normalized = this.normalizeRelativeHref(raw);
    const decodedRaw = this.safeDecodeUriComponent(raw);
    const decodedNormalized = this.safeDecodeUriComponent(normalized);

    const candidates = new Set<string>([
      raw,
      normalized,
      decodedRaw,
      decodedNormalized,
    ]);

    // Support "./" prefix variants (common in packages)
    if (!this.isLikelyUriWithScheme(normalized) && normalized) {
      candidates.add(`./${normalized}`);
    }

    // Support removing a leading "./" if present
    if (raw.startsWith("./")) {
      candidates.add(raw.slice(2));
      candidates.add(this.normalizeRelativeHref(raw.slice(2)));
    }

    // Support URL-encoded variants (e.g. spaces as %20)
    for (const v of [raw, normalized, decodedRaw, decodedNormalized]) {
      try {
        candidates.add(encodeURI(v));
      } catch {
        // ignore
      }
    }

    return Array.from(candidates).filter(Boolean);
  }

  /**
   * Store XML content as a blob and return the blob URL
   */
  storeItemAsBlob(xmlContent: string, originalHref: string): string {
    // Create blob from XML content
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const blobUrl = URL.createObjectURL(blob);

    // Store mappings for later cleanup and resolution
    this.blobUrls.set(originalHref, blobUrl);
    for (const candidate of this.getHrefLookupCandidates(originalHref)) {
      this.hrefToBlobMap.set(candidate, blobUrl);
    }

    return blobUrl;
  }

  /**
   * Retrieve XML content from blob URL
   */
  async getItemFromBlob(blobUrl: string): Promise<string> {
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Failed to retrieve item from blob:", error);
      throw error;
    }
  }

  /**
   * Get blob URL from original href (for legacy compatibility)
   */
  getBlobUrlFromHref(originalHref: string): string | undefined {
    return this.hrefToBlobMap.get(originalHref);
  }

  /**
   * Retrieve XML content by original href (for sessionStorage compatibility)
   */
  async getItemByHref(originalHref: string): Promise<string | null> {
    for (const candidate of this.getHrefLookupCandidates(originalHref)) {
      const blobUrl = this.hrefToBlobMap.get(candidate);
      if (!blobUrl) continue;
      try {
        return await this.getItemFromBlob(blobUrl);
      } catch (error) {
        console.error("Failed to retrieve item by href:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Update assessment test content to use blob URLs for item hrefs
   */
  updateAssessmentTestWithBlobUrefs(
    assessmentContent: string,
    itemBlobMap: Map<string, string>,
  ): string {
    let updatedContent = assessmentContent;

    // Replace item hrefs with blob URLs
    itemBlobMap.forEach((blobUrl, originalHref) => {
      const escapeRegExp = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Update href attributes, allowing common variants like "./..."
      for (const candidate of this.getHrefLookupCandidates(originalHref)) {
        if (this.isLikelyUriWithScheme(candidate)) continue;
        const hrefPattern = new RegExp(
          `href=["']${escapeRegExp(candidate)}["']`,
          "g",
        );
        updatedContent = updatedContent.replace(
          hrefPattern,
          `href="${blobUrl}"`,
        );
      }
    });

    return updatedContent;
  }

  /**
   * Cleanup all blob URLs to free memory
   */
  cleanup(): void {
    this.blobUrls.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });
    this.blobUrls.clear();
    this.hrefToBlobMap.clear();
  }

  /**
   * Get all current blob URLs (for debugging)
   */
  getAllBlobUrls(): Map<string, string> {
    return new Map(this.blobUrls);
  }
}

// Export singleton instance
export const itemBlobManager = ItemBlobManager.getInstance();
