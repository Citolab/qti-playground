import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { CheerioAPI } from "cheerio";
import { getRelativePath, isValidXml, qtiConversionFixes } from "../utils";
import { Assessment, ExtendedTestContext, ItemInfo } from "@citolab/qti-api";
import { convertQti2toQti3 } from "@citolab/qti-convert/qti-convert";
import { processPackage } from "@citolab/qti-convert/qti-helper";
import { itemBlobManager } from "./item-blob-manager";
import { getUpgraderStylesheetBlobUrl } from "./qti-upgrader";

// omit items
export interface AssessmentInfoWithContent extends Omit<Assessment, "items"> {
  content: string;
  items: ItemInfoWithBlobRef[];
}
const urlsChecked = new Map<string, boolean>();

export interface ItemInfoWithBlobRef extends Omit<ItemInfo, "href"> {
  href: string; // This will now be a blob URL
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
  isConverting: boolean;
  isPreparingForPreview: boolean;
  errorMessage: string;
  fillSource: boolean;
  assessments: AssessmentInfoWithContent[];
  importErrors: string[];
  selectedAssessment?: string;
  testContexts: ({ assessmentId: string } & ExtendedTestContext)[];
  itemsPerAssessment: { assessmentId: string; items: ItemInfoWithBlobRef[] }[];
}

export const initialState: StateModel = {
  init: false,
  qtiInput: "",
  qti3: "",
  downloadUrl: "",
  downloadUrlQti3: "",
  qti3ForPreview: "",
  isConverting: false,
  isPreparingForPreview: false,
  fillSource: false,
  loadingItems: false,
  errorMessage: "",
  testContexts: [],
  assessments: [],
  itemsPerAssessment: [],
  importErrors: [],
};

// Helper functions (moved from class actions)
async function checkFileExists(url: string): Promise<boolean> {
  try {
    if (url.startsWith("http") || url.startsWith("//")) {
      return true;
    }
    const response = await axios.head(url);
    return response.status === 200;
  } catch {
    return false;
  }
}

const replaceMediaWithMissingImagePlaceholder = async (
  xmlString: string,
  attributes = ["src", "href", "data"]
): Promise<string> => {
  const newXMlDocument = new DOMParser().parseFromString(xmlString, "text/xml");
  for (const attribute of attributes) {
    const srcAttributes = newXMlDocument.querySelectorAll(
      "[" + attribute + "]"
    );
    for (const node of Array.from(srcAttributes)) {
      const srcValue = node.getAttribute(attribute)!;

      const imageExists = urlsChecked.has(srcValue)
        ? urlsChecked.get(srcValue)
        : await checkFileExists(srcValue);

      if (
        !imageExists &&
        !(srcValue.startsWith("data:") || srcValue.startsWith("blob:"))
      ) {
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
    "object",
    "embed",
    "link",
    "meta",
    "base",
  ];

  blockedTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
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

// Zustand store actions interface
interface StoreActions {
  // State setters
  cleanupBlobs: () => void;

  // Async actions
  loadQti: (href: string) => Promise<void>;
  setSelectedItem: (identifier: string, assessmentId: string) => Promise<void>;
  editItem: (identifier: string) => Promise<void>;
  updateTestContext: (
    context: { assessmentId: string } & ExtendedTestContext
  ) => void;
  selectAssessment: (assessmentId: string) => void;
  processPackage: (
    file: File,
    options: { removeStylesheets: boolean; skipValidation: boolean }
  ) => Promise<StateModel>;
  startAssessment: (assessmentId: string) => void;
  setQti3: (qti: string) => Promise<void>;
  loadSharedQti: (qti: string) => Promise<void>;
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
      },

      loadQti: async (href: string) => {
        try {
          set({ isConverting: true, errorMessage: "" });
          const qtiResultData = await axios.get(href, {
            responseType: "text",
          });
          set({
            qtiInput: qtiResultData.data,
            fillSource: true,
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

      setSelectedItem: async (identifier: string, assessmentId: string) => {
        const currentState = get();
        const testContext: { assessmentId: string } & ExtendedTestContext =
          currentState.testContexts.find(
            (t) => t.assessmentId === currentState.selectedAssessment
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
          (i) => i.items
        );
        const item = allItems.find((i) => i.identifier === identifier);
        if (item) {
          try {
            const content = await itemBlobManager.getItemFromBlob(item.href);
            set({
              fillSource: true,
              qti3: content,
              qti3ForPreview: content,
            });
          } catch (error) {
            console.error("Failed to load item content:", error);
            set({
              errorMessage: "Failed to load item content",
            });
          }
        }
      },

      updateTestContext: (
        context: { assessmentId: string } & ExtendedTestContext
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
        options: { removeStylesheets: boolean; skipValidation: boolean }
      ): Promise<StateModel> => {
        // Clear old storage
        sessionStorage.clear();
        itemBlobManager.cleanup();

        const assessments: AssessmentInfoWithContent[] = [];
        const itemsWithContent: {
          identifier: string;
          content: string;
          title: string;
          type: string;
          categories: string[];
          href: string;
        }[] = [];

        const skipValidation =
          options.skipValidation === false ? false : true;
        const removeStylesheets = options.removeStylesheets || false;

        const xsltJsonUrl = await getUpgraderStylesheetBlobUrl();
        const result = await processPackage(
          file,
          xsltJsonUrl,
          true,
          {
            removeStylesheets,
            skipValidation,
          },
          (itemData) => {
            itemsWithContent.push({
              identifier: itemData.identifier,
              content: itemData.content,
              title: itemData.identifier,
              type: itemData.content.includes("interaction>")
                ? "regular"
                : "info",
              categories: [],
              href: itemData.relativePath,
            });
          },
          (assessmentData) => {
            const itemBlobMap = new Map<string, string>();

            const itemsWithBlobRefs = assessmentData.itemRefs
              .map((i) => {
                const matchedItem = itemsWithContent.find(
                  (it) => it.identifier === i.identifier
                );
                if (matchedItem) {
                  const originalHref = getRelativePath(
                    assessmentData.relativePath,
                    matchedItem.href || ""
                  );
                  const blobUrl = itemBlobManager.storeItemAsBlob(
                    matchedItem.content,
                    originalHref
                  );
                  itemBlobMap.set(originalHref, blobUrl);

                  return {
                    identifier: matchedItem.identifier,
                    itemRefIdentifier: i.itemRefIdentifier,
                    title: matchedItem.title,
                    type: matchedItem.type,
                    categories: matchedItem.categories,
                    href: blobUrl,
                    originalHref: originalHref,
                  } as ItemInfoWithBlobRef;
                }
                return undefined;
              })
              .filter((i) => i !== undefined);

            const updatedAssessmentContent =
              itemBlobManager.updateAssessmentTestWithBlobUrefs(
                assessmentData.content,
                itemBlobMap
              );

            assessments.push({
              id: assessmentData.identifier,
              content: updatedAssessmentContent,
              packageId: assessmentData.identifier,
              assessmentHref: assessmentData.relativePath,
              name: assessmentData.identifier,
              items: itemsWithBlobRefs,
              createdAt: new Date().getTime(),
              updatedAt: new Date().getTime(),
              createdBy: "user",
            });
          }
        );

        const newState = {
          assessments,
          importErrors: result.errors,
          itemsPerAssessment: assessments.map((a) => ({
            assessmentId: a.id,
            items: a.items || [],
          })),
        };
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
          errorMessage: "",
        });
        await get().prepareForPreview();
      },

      prepareForPreview: async () => {
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
        if (!isValidXml(currentState.qti3)) {
          set({
            errorMessage: "Invalid QTI XML",
            isPreparingForPreview: false,
          });
          return;
        }
        try {
          const qtiWithReplacementMedia =
            await replaceMediaWithMissingImagePlaceholder(currentState.qti3);
          const sanitizedXml = sanitizeXmlForPreview(qtiWithReplacementMedia);
          const transformedXml = qtiTransform(sanitizedXml)
            .fnCh(($: CheerioAPI) =>
              $("qti-inline-choice span").contents().unwrap()
            )
            .fnCh(($: CheerioAPI) => $("*").remove("qti-stylesheet"))
            .xml();
          set({
            qti3ForPreview: transformedXml,
            isPreparingForPreview: false,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
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
          });
          if (!qti || !isValidXml(qti)) {
            set({
              errorMessage: "Invalid QTI XML",
              isConverting: false,
            });
            return;
          }
          const xsltJsonUrl = await getUpgraderStylesheetBlobUrl();
          let qti3 = await convertQti2toQti3(
            qti,
            xsltJsonUrl
          );
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
        assessments: state.assessments,
        itemsPerAssessment: state.itemsPerAssessment,
        selectedAssessment: state.selectedAssessment,
        testContexts: state.testContexts,
      }),
    }
  )
);
