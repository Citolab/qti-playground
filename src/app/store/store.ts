import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { CheerioAPI } from "cheerio";
import {
  getXmlParseError,
  qtiConversionFixes,
  stripXmlLeadingNoise,
} from "../utils";
import { Assessment, ExtendedTestContext, ItemInfo } from "@citolab/qti-api";
import { convertQti2toQti3 } from "@citolab/qti-convert/qti-convert";
import { itemBlobManager } from "./item-blob-manager";
import { getUpgraderStylesheetBlobUrl } from "./qti-upgrader";
import {
  deletePackageCache,
  prepareQtiPackage,
  putTextFileInPackageCache,
} from "@citolab/qti-browser-import";
import { packagePathFromUrl } from "./package-export";
import { blankItemXml } from "./blank-item";
import { createItemAssetResolver, mapItemAssetUrls } from "../qti/asset-urls";

// omit items
export interface AssessmentInfoWithContent extends Omit<Assessment, "items"> {
  content: string;
  items: ItemInfoWithBlobRef[];
  packageId: string;
  testUrl: string;
}
const urlsChecked = new Map<string, boolean>();
/** Monotonic token so overlapping prepareForPreview calls don't thrash the preview. */
let previewPrepareGeneration = 0;

export interface ItemInfoWithBlobRef extends Omit<ItemInfo, "href"> {
  href: string; // Package URL (/__qti_pkg__/...)
  itemRefIdentifier?: string;
  originalHref?: string; // Keep track of original href for reference
}

export interface StateModel {
  init: boolean;
  downloadUrl: string;
  downloadUrlQti3: string;
  loadingItems: boolean;
  qtiInput: string;
  qti3: string;
  qti3ForPreview: string;
  previewItemHref?: string;
  isConverting: boolean;
  isPreparingForPreview: boolean;
  errorMessage: string;
  fillSource: boolean;
  /**
   * Bumped whenever a document is loaded into `qti3` from outside an editor
   * (example, package item, shared link, new item). Editors that take their
   * source at mount time key off this to remount on the new document.
   */
  sourceVersion: number;
  assessments: AssessmentInfoWithContent[];
  importErrors: string[];
  selectedAssessment?: string;
  testContexts: ({ assessmentId: string } & ExtendedTestContext)[];
  itemsPerAssessment: { assessmentId: string; items: ItemInfoWithBlobRef[] }[];
  activePackageId?: string;
  /** Name of the uploaded .zip, used to name the package download. */
  packageFileName?: string;
  /** Identifiers of items the in-place editor has written back to the package cache. */
  editedItemIdentifiers: string[];
}

export const initialState: StateModel = {
  init: false,
  qtiInput: "",
  qti3: "",
  downloadUrl: "",
  downloadUrlQti3: "",
  qti3ForPreview: "",
  previewItemHref: undefined,
  isConverting: false,
  isPreparingForPreview: false,
  fillSource: false,
  sourceVersion: 0,
  loadingItems: false,
  errorMessage: "",
  testContexts: [],
  assessments: [],
  itemsPerAssessment: [],
  importErrors: [],
  activePackageId: undefined,
  packageFileName: undefined,
  editedItemIdentifiers: [],
};

// Helper functions (moved from class actions)
async function checkFileExists(url: string): Promise<boolean> {
  try {
    // Cross-origin assets can't be probed without CORS, so take them on trust.
    const resolved = new URL(url, window.location.href);
    if (resolved.origin !== window.location.origin) return true;
    const response = await axios.head(resolved.href);
    if (response.status !== 200) return false;
    // Vite's dev server (and any SPA host with a catch-all rewrite) answers an
    // unknown path with index.html instead of a 404, so status alone would call
    // every missing asset present. An asset that comes back as a document isn't.
    const contentType = String(response.headers?.["content-type"] ?? "");
    return !contentType.toLowerCase().startsWith("text/html");
  } catch {
    return false;
  }
}

const replaceMediaWithMissingImagePlaceholder = async (
  xmlString: string,
  attributes = ["src", "href", "data"],
): Promise<string> => {
  const newXMlDocument = new DOMParser().parseFromString(xmlString, "text/xml");
  for (const attribute of attributes) {
    const srcAttributes = newXMlDocument.querySelectorAll(
      "[" + attribute + "]",
    );
    for (const node of Array.from(srcAttributes)) {
      const srcValue = node.getAttribute(attribute)!;
      // `href` is media only on a few elements. Pointing a hyperlink at
      // missing.png would be a worse outcome than leaving it dangling.
      if (attribute === "href" && node.tagName.toLowerCase() === "a") continue;
      if (srcValue.startsWith("data:") || srcValue.startsWith("blob:"))
        continue;

      let imageExists = urlsChecked.get(srcValue);
      if (imageExists === undefined) {
        imageExists = await checkFileExists(srcValue);
        urlsChecked.set(srcValue, imageExists);
      }

      if (!imageExists) {
        node.setAttribute(attribute, "/missing.png");
      }
    }
  }
  xmlString = new XMLSerializer().serializeToString(newXMlDocument);
  return xmlString;
};

const sanitizeXmlForPreview = (xmlString: string): string => {
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const blockedTags = [
    "script",
    "style",
    "iframe",
    "embed",
    "link",
    "meta",
    "base",
  ];

  blockedTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // `object` is how QTI carries the image behind every graphic interaction
  // (`<object type="image/png" data="...">`), so blocking the tag outright
  // stripped the picture out of graphic order / graphic gap match / the
  // extended-text postcard. Keep the media types QTI uses and drop the rest,
  // which is where an object element could actually smuggle in markup.
  doc.querySelectorAll("object").forEach((el) => {
    const type = (el.getAttribute("type") || "").toLowerCase();
    const isMedia = /^(image|audio|video)\//.test(type);
    if (!isMedia) el.remove();
  });

  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.toLowerCase().startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return new XMLSerializer().serializeToString(doc);
};

const resolvePreviewAssetUrls = (
  xmlString: string,
  previewItemHref?: string,
): string => {
  const resolve = createItemAssetResolver(previewItemHref);
  if (!resolve) return xmlString;
  return mapItemAssetUrls(xmlString, resolve);
};

// Zustand store actions interface
interface StoreActions {
  // State setters
  cleanupBlobs: () => void;
  clearFillSource: () => void;

  // Async actions
  loadQti: (href: string) => Promise<void>;
  loadQti3: (href: string) => Promise<void>;
  setSelectedItem: (identifier: string, assessmentId: string) => Promise<void>;
  editItem: (identifier: string) => Promise<void>;
  saveEditedItem: (identifier: string, xml: string) => Promise<boolean>;
  updateTestContext: (
    context: { assessmentId: string } & ExtendedTestContext,
  ) => void;
  selectAssessment: (assessmentId: string) => void;
  processPackage: (
    file: File,
    options: { removeStylesheets: boolean; skipValidation: boolean },
  ) => Promise<StateModel>;
  startAssessment: (assessmentId: string) => void;
  setQti3: (qti: string) => Promise<void>;
  loadSharedQti: (qti: string) => Promise<void>;
  newItem: () => Promise<void>;
  prepareForPreview: () => Promise<void>;
  convertQti: (qti: string) => Promise<void>;
}

export type Store = StateModel & StoreActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      cleanupBlobs: () => {
        itemBlobManager.cleanup();
        const pkgId = get().activePackageId;
        if (pkgId) {
          void deletePackageCache(pkgId);
        }
      },

      clearFillSource: () => {
        set({ fillSource: false });
      },

      loadQti: async (href: string) => {
        try {
          set({ isConverting: true, errorMessage: "" });
          set({ previewItemHref: href });
          const qtiResultData = await axios.get(href, {
            responseType: "text",
          });
          set({
            qtiInput: qtiResultData.data,
            fillSource: true,
            sourceVersion: get().sourceVersion + 1,
          });
          await get().convertQti(qtiResultData.data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          set({
            errorMessage: e.message,
            isConverting: false,
          });
        }
      },

      loadQti3: async (href: string) => {
        try {
          set({ isConverting: true, errorMessage: "", previewItemHref: href });
          const qtiResultData = await axios.get(href, {
            responseType: "text",
          });
          set({
            qtiInput: qtiResultData.data,
            qti3: qtiResultData.data,
            fillSource: true,
            sourceVersion: get().sourceVersion + 1,
            isConverting: false,
          });
          await get().prepareForPreview();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          set({
            errorMessage: e.message,
            isConverting: false,
          });
        }
      },

      setSelectedItem: async (identifier: string, assessmentId: string) => {
        const currentState = get();
        const testContext: { assessmentId: string } & ExtendedTestContext =
          currentState.testContexts.find(
            (t) => t.assessmentId === currentState.selectedAssessment,
          ) || {
            items: [],
            navItemId: identifier,
            assessmentId: assessmentId,
            testOutcomeVariables: [],
          };

        get().updateTestContext({
          ...testContext,
          navItemId: identifier,
        });
      },

      editItem: async (identifier: string) => {
        const currentState = get();
        const allItems = currentState.itemsPerAssessment.flatMap(
          (i) => i.items,
        );
        const item = allItems.find((i) => i.identifier === identifier);
        if (item) {
          try {
            const response = await axios.get(item.href, {
              responseType: "text",
            });
            const content = response.data;
            set({
              fillSource: true,
              sourceVersion: get().sourceVersion + 1,
              qti3: content,
              previewItemHref: item.href,
            });
            await get().prepareForPreview();
          } catch (error) {
            console.error("Failed to load item content:", error);
            set({
              errorMessage: "Failed to load item content",
            });
          }
        }
      },

      /**
       * Writes an edited item back into the package cache, so the Service Worker starts
       * serving it to every surface that loads items by URL -- the test player included.
       * Without this, closing the editor drops the edit on the floor: the player re-fetches
       * `item.href` on navigation and gets the version that was imported.
       *
       * Returns whether anything was written.
       */
      saveEditedItem: async (identifier: string, xml: string) => {
        const currentState = get();
        const packageId = currentState.activePackageId;
        if (!packageId || !xml.trim()) return false;

        const item = currentState.itemsPerAssessment
          .flatMap((entry) => entry.items)
          .find((candidate) => candidate.identifier === identifier);
        if (!item) return false;

        const zipPath = packagePathFromUrl(packageId, item.href);
        if (!zipPath) return false;

        try {
          await putTextFileInPackageCache(
            packageId,
            zipPath,
            xml,
            "application/xml",
          );
        } catch (error) {
          console.error("Failed to store edited item in package cache:", error);
          return false;
        }

        if (!currentState.editedItemIdentifiers.includes(identifier)) {
          set({
            editedItemIdentifiers: [
              ...currentState.editedItemIdentifiers,
              identifier,
            ],
          });
        }
        return true;
      },

      updateTestContext: (
        context: { assessmentId: string } & ExtendedTestContext,
      ) => {
        const currentState = get();
        set({
          testContexts: currentState.testContexts
            .filter((t) => t.assessmentId !== context.assessmentId)
            .concat([context]),
        });
      },

      selectAssessment: (assessmentId: string) => {
        set({ selectedAssessment: assessmentId });
      },

      processPackage: async (
        file: File,
        options: { removeStylesheets: boolean; skipValidation: boolean },
      ): Promise<StateModel> => {
        sessionStorage.clear();
        itemBlobManager.cleanup();

        const prevPackageId = get().activePackageId;
        const prepared = await prepareQtiPackage(file, {
          removeStylesheets: options.removeStylesheets,
          skipValidation: options.skipValidation,
          previousPackageId: prevPackageId,
          componentsCdnUrl: __QTI_COMPONENTS_CDN_URL__,
          componentsCssUrl: __QTI_COMPONENTS_CSS_URL__,
        });

        const newState = {
          activePackageId: prepared.packageId,
          packageFileName: file.name,
          editedItemIdentifiers: [],
          assessments: prepared.assessments as AssessmentInfoWithContent[],
          importErrors: prepared.importErrors,
          itemsPerAssessment: prepared.itemsPerAssessment as {
            assessmentId: string;
            items: ItemInfoWithBlobRef[];
          }[],
        } satisfies Partial<StateModel>;

        set(newState);
        return { ...get() };
      },

      startAssessment: (assessmentId: string) => {
        set({ selectedAssessment: assessmentId });
      },

      setQti3: async (qti: string) => {
        set({ qti3: qti });
        await get().prepareForPreview();
      },

      loadSharedQti: async (qti: string) => {
        set({
          qti3: qti,
          fillSource: true,
          sourceVersion: get().sourceVersion + 1,
          errorMessage: "",
          previewItemHref: undefined,
        });
        await get().prepareForPreview();
      },

      newItem: async () => {
        // No previewItemHref: a brand new item has no directory yet, so any
        // asset the author adds stays relative to the page rather than being
        // resolved against a package that does not exist.
        set({
          qti3: blankItemXml(),
          fillSource: true,
          sourceVersion: get().sourceVersion + 1,
          errorMessage: "",
          previewItemHref: undefined,
        });
        await get().prepareForPreview();
      },

      prepareForPreview: async () => {
        const nextGen = ++previewPrepareGeneration;
        const currentState = get();
        set({
          isPreparingForPreview: true,
          errorMessage: "",
        });
        if (!currentState.qti3) {
          set({
            errorMessage: "",
            isPreparingForPreview: false,
          });
          return;
        }
        // The parser's own message names the line and column. "Invalid QTI XML"
        // on its own is what made a stray blank line before `<?xml` so hard to
        // place -- and until this guard detected the failure at all, the broken
        // document went down the pipeline and the player rendered the browser's
        // parse error as the item.
        const parseError = getXmlParseError(currentState.qti3);
        if (parseError) {
          set({
            errorMessage: `Invalid QTI XML: ${parseError}`,
            isPreparingForPreview: false,
          });
          return;
        }
        try {
          // Normalised, not just validated: every stage below re-parses, so the
          // leading whitespace the guard tolerates has to be gone by the first one.
          const sanitizedXml = sanitizeXmlForPreview(
            stripXmlLeadingNoise(currentState.qti3),
          );
          const transformResult = await qtiTransform(sanitizedXml)
            .fnCh(($: CheerioAPI) =>
              $("qti-inline-choice span").contents().unwrap(),
            )
            .fnCh(($: CheerioAPI) => $("*").remove("qti-stylesheet"))
            .inlineResponseProcessingTemplate({
              baseUrl: new URL(
                currentState.previewItemHref || "/",
                window.location.origin,
              ).toString(),
            });
          const transformedXml = transformResult.xml();
          // Resolve first, probe second. Asset paths in an item are relative to
          // the item, not to the page the player happens to be rendered on, so
          // probing the raw value asked the wrong server path -- which is why a
          // genuinely missing image rendered broken instead of as missing.png.
          const resolvedXml = resolvePreviewAssetUrls(
            transformedXml,
            currentState.previewItemHref,
          );
          const withPlaceholders =
            await replaceMediaWithMissingImagePlaceholder(resolvedXml);
          if (nextGen !== previewPrepareGeneration) return;
          // Skip identical preview XML to avoid remounting item-container
          if (get().qti3ForPreview === withPlaceholders) {
            set({ isPreparingForPreview: false });
            return;
          }
          set({
            qti3ForPreview: withPlaceholders,
            isPreparingForPreview: false,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (nextGen !== previewPrepareGeneration) return;
          set({
            errorMessage: e.message,
            isPreparingForPreview: false,
          });
        }
      },

      convertQti: async (qti: string) => {
        try {
          set({
            isConverting: true,
            errorMessage: "",
            previewItemHref: undefined,
          });
          const conversionParseError = qti ? getXmlParseError(qti) : "no XML";
          if (conversionParseError) {
            set({
              errorMessage: `Invalid QTI XML: ${conversionParseError}`,
              isConverting: false,
            });
            return;
          }
          const xsltJsonUrl = await getUpgraderStylesheetBlobUrl();
          let qti3 = await convertQti2toQti3(qti, xsltJsonUrl);
          qti3 = await qtiConversionFixes(qti3, "");
          set({
            qti3,
            isConverting: false,
            qtiInput: qti,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          set({
            errorMessage: e.message,
            isConverting: false,
          });
        }
      },
    }),
    {
      name: "state_default_user",
      partialize: (state) => ({
        // Only persist specific state fields (not transient ones)
        activePackageId: state.activePackageId,
        packageFileName: state.packageFileName,
        editedItemIdentifiers: state.editedItemIdentifiers,
        assessments: state.assessments,
        itemsPerAssessment: state.itemsPerAssessment,
        selectedAssessment: state.selectedAssessment,
        testContexts: state.testContexts,
      }),
    },
  ),
);
