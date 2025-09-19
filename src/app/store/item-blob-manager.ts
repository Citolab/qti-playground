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

  /**
   * Store XML content as a blob and return the blob URL
   */
  storeItemAsBlob(xmlContent: string, originalHref: string): string {
    // Create blob from XML content
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const blobUrl = URL.createObjectURL(blob);

    // Store mappings for later cleanup and resolution
    this.blobUrls.set(originalHref, blobUrl);
    this.hrefToBlobMap.set(originalHref, blobUrl);

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
    const blobUrl = this.hrefToBlobMap.get(originalHref);
    if (blobUrl) {
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
    itemBlobMap: Map<string, string>
  ): string {
    let updatedContent = assessmentContent;

    // Replace item hrefs with blob URLs
    itemBlobMap.forEach((blobUrl, originalHref) => {
      // Update both href attributes and element content references
      const hrefPattern = new RegExp(
        `href=["']${originalHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
        "g"
      );
      updatedContent = updatedContent.replace(hrefPattern, `href="${blobUrl}"`);
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
