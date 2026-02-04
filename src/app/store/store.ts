import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { CheerioAPI } from "cheerio";
import { getRelativePath, isValidXml, qtiConversionFixes } from "../utils";
import { Assessment, ExtendedTestContext, ItemInfo } from "@citolab/qti-api";
import { convertQti2toQti3 } from "@citolab/qti-convert/qti-convert";
import { itemBlobManager } from "./item-blob-manager";
import { getUpgraderStylesheetBlobUrl } from "./qti-upgrader";
import {
  deletePackageCache,
  makePackageUrl,
  normalizeZipPath,
  putBlobFileInPackageCache,
  putTextFileInPackageCache,
  QTI_PKG_URL_PREFIX,
} from "./qti-package-cache";

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
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
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

const forcePciIframeMode = (xmlString: string): string => {
  try {
    const doc = new DOMParser().parseFromString(xmlString, "text/xml");
    const pcis = doc.querySelectorAll("qti-portable-custom-interaction");
    if (pcis.length === 0) return xmlString;

    pcis.forEach((el) => {
      const existing = el.getAttribute("data-use-iframe");
      if (existing === null || existing.toLowerCase() === "false") {
        // Use an explicit value so it survives XML->HTML transformations reliably.
        el.setAttribute("data-use-iframe", "true");
      }
    });

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return xmlString;
  }
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
        // Clear old storage
        sessionStorage.clear();
        itemBlobManager.cleanup();

        // Ensure the service worker is active before we start relying on /__qti_pkg__/ URLs.
        if ("serviceWorker" in navigator) {
          try {
            await navigator.serviceWorker.ready;
          } catch {
            // ignore
          }
        }

        // Cleanup previous package cache (best-effort). Also clear orphaned package caches.
        try {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((k) => k.startsWith("qti-pkg-"))
              .map((k) => caches.delete(k)),
          );
        } catch {
          const prevPackageId = get().activePackageId;
          if (prevPackageId) {
            try {
              await deletePackageCache(prevPackageId);
            } catch {
              // ignore
            }
          }
        }

        const packageId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `pkg-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const skipValidation = options.skipValidation === false ? false : true;
        const removeStylesheets = options.removeStylesheets || false;

        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file);

        // First, cache every file from the zip (so referenced assets/scripts are always fetchable).
        // XML files are cached as text and later overwritten for converted items/tests.
        const zipFilePaths = Object.keys(zip.files).filter(
          (p) =>
            !p.includes("__MACOSX") &&
            !p.includes(".DS_Store") &&
            !zip.files[p].dir,
        );
        const normalizedToZipKey = new Map<string, string>();
        for (const zipKey of zipFilePaths) {
          normalizedToZipKey.set(normalizeZipPath(zipKey), zipKey);
        }

        const xmlContentsByPath = new Map<string, string>();
        for (const relativePath of zipFilePaths) {
          const normalizedPath = normalizeZipPath(relativePath);
          const entry = zip.files[relativePath];
          const ext = normalizedPath.split(".").pop()?.toLowerCase() || "";
          if (ext === "xml") {
            const text = await entry.async("string");
            xmlContentsByPath.set(normalizedPath, text);
            await putTextFileInPackageCache(packageId, normalizedPath, text);
          } else {
            const blob = await entry.async("blob");
            await putBlobFileInPackageCache(packageId, normalizedPath, blob);
          }
        }

        // Some packages place `modules/module_resolution.*` under a subfolder (e.g. per-PCI).
        // qti-components will always request `${baseUrl}/modules/module_resolution.*`, so create aliases
        // at the package root if missing.
        const ensureAliasedModuleResolution = async (
          filename: "module_resolution" | "fallback_module_resolution",
        ) => {
          const rootJs = `modules/${filename}.js`;
          const rootJson = `modules/${filename}.json`;
          const hasRoot =
            normalizedToZipKey.has(rootJs) || normalizedToZipKey.has(rootJson);
          if (hasRoot) return;

          const candidates = Array.from(normalizedToZipKey.keys()).filter(
            (p) =>
              p.endsWith(`/modules/${filename}.js`) ||
              p.endsWith(`/modules/${filename}.json`),
          );
          if (candidates.length === 0) return;
          // If multiple configs exist, don't alias a random one. Per-item/per-PCI configs are common
          // and must be resolved at runtime based on the current item's baseUrl.
          if (candidates.length !== 1) return;

          const pick = candidates[0];
          const zipKey = normalizedToZipKey.get(pick);
          if (!zipKey) return;
          try {
            const entry = zip.files[zipKey];
            if (!entry) return;
            const ext = pick.endsWith(".json") ? "json" : "js";
            if (ext === "json") {
              const text = await entry.async("string");
              await putTextFileInPackageCache(
                packageId,
                rootJson,
                text,
                "application/json",
              );
            } else {
              const blob = await entry.async("blob");
              await putBlobFileInPackageCache(packageId, rootJs, blob);
            }
          } catch {
            // ignore
          }
        };

        await ensureAliasedModuleResolution("module_resolution");
        await ensureAliasedModuleResolution("fallback_module_resolution");

        const assessments: AssessmentInfoWithContent[] = [];
        const importErrors: string[] = [];

        // Identify item and test XML files.
        const cheerio3 = await import("cheerio");
        const itemPaths = new Map<string, string>(); // identifier -> relativePath
        let testFilePath: string | null = null;
        let testIdentifier: string | null = null;

        const xmlPaths = Array.from(xmlContentsByPath.keys());
        for (const relativePath of xmlPaths) {
          const content = xmlContentsByPath.get(relativePath) || "";

          if (!skipValidation) {
            try {
              const doc = new DOMParser().parseFromString(content, "text/xml");
              const hasParseError =
                doc.getElementsByTagName("parsererror").length > 0;
              if (hasParseError) {
                importErrors.push(`Invalid XML structure in ${relativePath}`);
              }
            } catch {
              importErrors.push(`Invalid XML structure in ${relativePath}`);
            }
          }

          const $ = cheerio3.load(content, { xmlMode: true, xml: true });

          if (
            $("qti-assessment-test").length > 0 ||
            $("assessmentTest").length > 0
          ) {
            if (!testFilePath) {
              testFilePath = relativePath;
              testIdentifier =
                $("qti-assessment-test").attr("identifier") ||
                $("assessmentTest").attr("identifier") ||
                null;
            }
          }

          if (
            $("qti-assessment-item").length > 0 ||
            $("assessmentItem").length > 0
          ) {
            const identifier =
              $("qti-assessment-item").attr("identifier") ||
              $("assessmentItem").attr("identifier") ||
              "";
            if (identifier) {
              itemPaths.set(identifier, relativePath);
            }
          }
        }

        const xsltJsonUrl = await getUpgraderStylesheetBlobUrl();

        // Convert items to QTI 3 and overwrite them in cache.
        const convertedItems: {
          identifier: string;
          relativePath: string;
          content: string;
          type: string;
          title: string;
          categories: string[];
        }[] = [];

        for (const [identifier, relativePath] of itemPaths.entries()) {
          const originalContent = xmlContentsByPath.get(relativePath);
          if (!originalContent) continue;

          let qti3Xml = await convertQti2toQti3(originalContent, xsltJsonUrl);
          const folderPath =
            relativePath.substring(0, relativePath.lastIndexOf("/") + 1) || "";
          // Build base URL for custom interaction assets using the package URL prefix
          // const baseRef = `${QTI_PKG_URL_PREFIX}/${encodeURIComponent(packageId)}/`;

          let transformResult = qtiTransform(qti3Xml)
            .objectToImg()
            .objectToVideo()
            .objectToAudio()
            .ssmlSubToSpan()
            // .stripMaterialInfo()
            .minChoicesToOne()
            .externalScored()
            // .customInteraction(baseRef, folderPath)
            .customInteraction("", folderPath)
            .qbCleanup()
            .depConvert()
            .upgradePci();

          if (removeStylesheets) {
            transformResult = transformResult.stripStylesheets();
          }

          qti3Xml = forcePciIframeMode(transformResult.xml());
          await putTextFileInPackageCache(packageId, relativePath, qti3Xml);

          convertedItems.push({
            identifier,
            relativePath,
            content: qti3Xml,
            title: identifier,
            type: qti3Xml.includes("interaction>") ? "regular" : "info",
            categories: [],
          });
        }

        // Convert test to QTI 3 (or synthesize one if none exists).
        const resolveHref = (
          baseFilePath: string,
          href: string | undefined,
        ) => {
          if (!href) return null;
          try {
            const resolved = new URL(
              href,
              `https://example.com/${baseFilePath}`,
            ).pathname.replace(/^\/+/, "");
            return resolved;
          } catch {
            return null;
          }
        };

        let effectiveTestPath = testFilePath;
        let effectiveTestIdentifier = testIdentifier;
        let convertedTestXml = "";
        let itemRefs: { itemRefIdentifier?: string; identifier: string }[] = [];

        if (testFilePath && testIdentifier) {
          const originalContent = xmlContentsByPath.get(testFilePath) || "";
          const qti3Xml = await convertQti2toQti3(originalContent, xsltJsonUrl);
          const testBaseRef = `${QTI_PKG_URL_PREFIX}/${encodeURIComponent(packageId)}/`;
          let transformResult = qtiTransform(qti3Xml)
            .objectToImg()
            .objectToVideo()
            .objectToAudio()
            .ssmlSubToSpan()
            // .stripMaterialInfo()
            .minChoicesToOne()
            .externalScored()
            .customInteraction(testBaseRef, "")
            .qbCleanup()
            .depConvert()
            .upgradePci();
          if (removeStylesheets) {
            transformResult = transformResult.stripStylesheets();
          }
          convertedTestXml = forcePciIframeMode(transformResult.xml());
          await putTextFileInPackageCache(
            packageId,
            testFilePath,
            convertedTestXml,
          );

          // Build itemRefs from the (original) test file so href resolution matches the package structure.
          const $ = cheerio3.load(originalContent, {
            xmlMode: true,
            xml: true,
          });
          const refs: { itemRefIdentifier?: string; identifier: string }[] = [];
          $("qti-assessment-item-ref, assessmentItemRef").each((_, el) => {
            const itemRefIdentifierAttr = $(el).attr("identifier");
            const href = $(el).attr("href");
            const resolvedHref = resolveHref(testFilePath!, href);
            if (!resolvedHref) return;
            itemPaths.forEach((itemPath, itemIdentifier) => {
              if (itemPath === resolvedHref) {
                refs.push({
                  itemRefIdentifier: itemRefIdentifierAttr,
                  identifier: itemIdentifier,
                });
              }
            });
          });
          itemRefs = refs;
        } else if (convertedItems.length > 0) {
          effectiveTestPath = "all-items.xml";
          effectiveTestIdentifier = "All";
          itemRefs = convertedItems.map((it) => ({
            itemRefIdentifier: it.identifier,
            identifier: it.identifier,
          }));

          convertedTestXml = `<?xml version="1.0" encoding="utf-8"?>
<qti-assessment-test xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0p1_v1p0.xsd"
  identifier="All" title="ALL items"
  tool-name="CitoLab" tool-version="qti-playground"
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-test-part identifier="RES-ALL" title="Testpart-1" navigation-mode="nonlinear" submission-mode="simultaneous">
    <qti-assessment-section identifier="section_1" title="section 1" visible="true" keep-together="false">
      ${convertedItems
        .map(
          (item) =>
            `<qti-assessment-item-ref identifier="${item.identifier}" href="${item.relativePath}"><qti-weight identifier="WEIGHT" value="1" /></qti-assessment-item-ref>`,
        )
        .join("")}
    </qti-assessment-section>
  </qti-test-part>
  <qti-outcome-processing>
    <qti-set-outcome-value identifier="SCORE">
      <qti-sum>
        <qti-test-variables variable-identifier="SCORE" weight-identifier="WEIGHT" />
      </qti-sum>
    </qti-set-outcome-value>
  </qti-outcome-processing>
</qti-assessment-test>`;

          await putTextFileInPackageCache(
            packageId,
            effectiveTestPath,
            convertedTestXml,
          );
        }

        if (effectiveTestPath && effectiveTestIdentifier) {
          const itemsWithRefs = itemRefs
            .map((ref) => {
              const itemPath = itemPaths.get(ref.identifier);
              if (!itemPath) return null;
              const originalHref = getRelativePath(
                effectiveTestPath!,
                itemPath,
              );
              const hrefResolved =
                resolveHref(effectiveTestPath!, originalHref) || itemPath;
              const itemUrl = makePackageUrl(packageId, hrefResolved);
              return {
                identifier: ref.identifier,
                itemRefIdentifier: ref.itemRefIdentifier || ref.identifier,
                title: ref.identifier,
                type:
                  convertedItems.find((i) => i.identifier === ref.identifier)
                    ?.type || "regular",
                categories: [],
                href: itemUrl,
                originalHref,
              } as ItemInfoWithBlobRef;
            })
            .filter(Boolean) as ItemInfoWithBlobRef[];

          assessments.push({
            id: effectiveTestIdentifier,
            content: convertedTestXml,
            packageId,
            assessmentHref: effectiveTestPath,
            name: effectiveTestIdentifier,
            items: itemsWithRefs,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            createdBy: "user",
            testUrl: makePackageUrl(packageId, effectiveTestPath),
          });
        }

        const newState = {
          activePackageId: packageId,
          assessments,
          importErrors,
          itemsPerAssessment: assessments.map((a) => ({
            assessmentId: a.id,
            items: a.items || [],
          })),
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
