import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { CheerioAPI } from "cheerio";
import { isValidXml, qtiConversionFixes } from "../utils";
import { Assessment, ExtendedTestContext, ItemInfo } from "@citolab/qti-api";
import { convertQti2toQti3 } from "@citolab/qti-convert/qti-convert";
import { itemBlobManager } from "./item-blob-manager";
import { getUpgraderStylesheetBlobUrl } from "./qti-upgrader";
import {
  deletePackageCache,
  importQtiPackage,
  QTI_PKG_URL_PREFIX,
} from "@citolab/qti-browser-import";

// omit items
export interface AssessmentInfoWithContent extends Omit<Assessment, "items"> {
  content: string;
  items: ItemInfoWithBlobRef[];
  packageId: string;
  testUrl: string;
}
const urlsChecked = new Map<string, boolean>();

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
  assessments: AssessmentInfoWithContent[];
  importErrors: string[];
  selectedAssessment?: string;
  testContexts: ({ assessmentId: string } & ExtendedTestContext)[];
  itemsPerAssessment: { assessmentId: string; items: ItemInfoWithBlobRef[] }[];
  activePackageId?: string;
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
  loadingItems: false,
  errorMessage: "",
  testContexts: [],
  assessments: [],
  itemsPerAssessment: [],
  importErrors: [],
  activePackageId: undefined,
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
  attributes = ["src", "href", "data"],
): Promise<string> => {
  const newXMlDocument = new DOMParser().parseFromString(xmlString, "text/xml");
  for (const attribute of attributes) {
    const srcAttributes = newXMlDocument.querySelectorAll(
      "[" + attribute + "]",
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

const resolvePreviewAssetUrls = (
  xmlString: string,
  previewItemHref?: string,
): string => {
  if (!previewItemHref) return xmlString;

  let itemDirPath = "";
  let packageRootUrl: string | null = null;
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const baseUrl = new URL(previewItemHref, origin || "http://localhost");
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
    return xmlString;
  }

  if (!itemDirPath) return xmlString;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = origin
    ? `${origin}${itemDirPath}`
    : `http://localhost${itemDirPath}`;

  const resolveUrl = (raw: string) => {
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

  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const nodes = doc.querySelectorAll("[src],[href],[data]");
  nodes.forEach((node) => {
    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    const inLegacyCustomInteraction =
      tagName === "qti-custom-interaction" ||
      (tagName === "object" && el.closest("qti-custom-interaction"));
    (["src", "href", "data"] as const).forEach((attr) => {
      const current = el.getAttribute(attr);
      if (!current) return;
      if (attr === "data" && inLegacyCustomInteraction) return;
      const next = resolveUrl(current);
      if (next !== current) el.setAttribute(attr, next);
    });
  });

  return new XMLSerializer().serializeToString(doc);
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
        const imported = await importQtiPackage(file, {
          removeStylesheets: options.removeStylesheets,
          skipValidation: options.skipValidation,
          previousPackageId: prevPackageId,
        });

        const newState = {
          activePackageId: imported.packageId,
          assessments: imported.assessments as AssessmentInfoWithContent[],
          importErrors: imported.importErrors,
          itemsPerAssessment: imported.itemsPerAssessment as {
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
          errorMessage: "",
          previewItemHref: undefined,
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
              $("qti-inline-choice span").contents().unwrap(),
            )
            .fnCh(($: CheerioAPI) => $("*").remove("qti-stylesheet"))
            .xml();
          const resolvedXml = resolvePreviewAssetUrls(
            transformedXml,
            currentState.previewItemHref,
          );
          set({
            qti3ForPreview: resolvedXml,
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
            previewItemHref: undefined,
          });
          if (!qti || !isValidXml(qti)) {
            set({
              errorMessage: "Invalid QTI XML",
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
        assessments: state.assessments,
        itemsPerAssessment: state.itemsPerAssessment,
        selectedAssessment: state.selectedAssessment,
        testContexts: state.testContexts,
      }),
    },
  ),
);
