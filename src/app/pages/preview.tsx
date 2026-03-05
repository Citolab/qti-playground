import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/store";
import { Button } from "@/components/ui/button";
import { editor } from "monaco-editor";
import { Clipboard, Code, Info, Share2 } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Dropdown } from "../components/dropdown";
import { Panel } from "../components/panel";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { QtiAssessmentItem, QtiItem } from "@citolab/qti-components";
import { CustomElements } from "@citolab/qti-components/react";
import { useSearchParams } from "react-router-dom";
import { itemCss } from "../itemCss";
import { QtiProsemirrorEditor } from "../components/editor/qti-prosemirror-editor";
import DraggablePopup from "../components/draggable-popup";

type PreviewVariable = {
  identifier: string;
  value?: unknown;
  cardinality?: string;
  baseType?: string;
  correctResponse?: unknown;
  mapping?: unknown;
};

const encodeXmlToShareParam = (xml: string) => {
  const bytes = new TextEncoder().encode(xml);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return encodeURIComponent(window.btoa(binary));
};

const decodeSharedParamToXml = (encoded: string) => {
  const binary = window.atob(decodeURIComponent(encoded));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/* React */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends CustomElements {}
  }
}
export const PreviewPage = () => {
  const sourceEditor = useRef<editor.IStandaloneCodeEditor>(null);
  const qtiItemRef = useRef<QtiItem>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [sourceEditorMode] = useState<
    "monaco" | "prosemirror"
  >("monaco");
  const [openTooltip, setOpenTooltip] = useState(false);
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<PreviewVariable[]>(
    [],
  );
  const [searchParams] = useSearchParams();
  const hasLoadedSharedItem = useRef(false);
  const hasLoadedItemFromQuery = useRef(false);
  const lastVariablesSignatureRef = useRef("");

  // Zustand store - use selectors for optimal re-renders
  const qti3 = useStore((state) => state.qti3);
  const qti3ForPreview = useStore((state) => state.qti3ForPreview);
  const fillSource = useStore((state) => state.fillSource);
  const clearFillSource = useStore((state) => state.clearFillSource);
  const isConverting = useStore((state) => state.isConverting);
  const errorMessage = useStore((state) => state.errorMessage);
  const loadQti3 = useStore((state) => state.loadQti3);
  const setQti3 = useStore((state) => state.setQti3);
  const loadSharedQti = useStore((state) => state.loadSharedQti);
  const editItem = useStore((state) => state.editItem);

  const items = useRef([
    {
      name: "choice",
      items: [
        // { name: 'adaptive', href: '/adaptive.xml', current: false },
        { name: "associate", href: "/associate.xml", current: false },
        { name: "choice", href: "/choice.xml", current: true },
        { name: "extended text", href: "/extended_text.xml", current: false },
        { name: "gap match", href: "/gap-match.xml", current: false },
        {
          name: "graphic gap match",
          href: "/graphic_gap_match.xml",
          current: false,
        },
        { name: "graphic order", href: "/graphic_order.xml", current: false },
        // { name: 'hotspot', href: '/hotspot.xml', current: false },
        {
          name: "inline choice math",
          href: "/inline_choice_math.xml",
          current: false,
        },
        { name: "inline_choice", href: "/inline_choice.xml", current: false },
        { name: "match", href: "/match.xml", current: false },
        { name: "mc_stat2", href: "/mc_stat2.xml", current: false },
        { name: "order", href: "/order.xml", current: false },
      ],
    },
  ]);
  const allItems = items.current.flatMap((i) => i.items);

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    readOnly: false,
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
  };

  const debouncedPreview = useDebouncedCallback(
    (qti: string) => setQti3(qti),
    1000,
  );

  const previewItemDoc = useMemo(() => {
    if (!qti3ForPreview) return null;
    return qtiTransformItem()
      .parse(qti3ForPreview)
      .extendElementsWithClass("type")
      .convertCDATAtoComment()
      .htmlDoc();
  }, [qti3ForPreview]);

  useEffect(() => {
    if (sourceEditorMode !== "monaco") {
      if (fillSource) {
        clearFillSource();
      }
      return;
    }
    if (!fillSource || !isEditorReady) return;
    const nextValue = qti3 || "";
    const editorInstance = sourceEditor.current;
    if (!editorInstance) return;
    if (editorInstance.getValue() !== nextValue) {
      editorInstance.setValue(nextValue);
    }
    clearFillSource();
  }, [
    clearFillSource,
    debouncedPreview,
    fillSource,
    isEditorReady,
    qti3,
    sourceEditorMode,
  ]);

  useEffect(() => {
    if (hasLoadedSharedItem.current) {
      return;
    }
    const sharedQti = searchParams.get("sharedQti");
    if (!sharedQti) {
      return;
    }
    try {
      const decoded = decodeSharedParamToXml(sharedQti);
      hasLoadedSharedItem.current = true;
      loadSharedQti(decoded);
    } catch (error) {
      console.error("Failed to load shared QTI content", error);
    }
  }, [searchParams, loadSharedQti]);

  useEffect(() => {
    if (hasLoadedItemFromQuery.current) return;
    const sharedQti = searchParams.get("sharedQti");
    if (sharedQti) return;
    const itemId = searchParams.get("itemId");
    if (!itemId) return;
    hasLoadedItemFromQuery.current = true;
    void editItem(itemId);
  }, [searchParams, editItem]);

  const buildShareUrl = () => {
    const encoded = encodeXmlToShareParam(qti3 || "");
    const shareUrl = new URL(window.location.href);
    shareUrl.pathname = "/preview";
    shareUrl.search = `sharedQti=${encoded}`;
    return shareUrl.toString();
  };

  const copyShareUrl = async () => {
    if (!qti3) return;
    try {
      const shareUrl = buildShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setShareTooltipOpen(true);
      setSharePopupOpen(true);
      setTimeout(() => setShareTooltipOpen(false), 2000);
      setTimeout(() => setSharePopupOpen(false), 2000);
    } catch (error) {
      console.error("Failed to copy share url", error);
    }
  };

  const getAssessmentItemElement = () => {
    const container = qtiItemRef.current?.querySelector("item-container");
    return container?.shadowRoot?.querySelector(
      "qti-assessment-item",
    ) as QtiAssessmentItem | null;
  };

  const snapshotPreviewVariables = (
    variables: PreviewVariable[] | undefined,
  ): PreviewVariable[] => {
    if (!Array.isArray(variables)) return [];
    return variables.map((variable) => ({
      identifier: variable.identifier,
      cardinality: variable.cardinality,
      baseType: variable.baseType,
      value:
        variable.value === undefined
          ? undefined
          : JSON.parse(JSON.stringify(variable.value)),
      correctResponse:
        variable.correctResponse === undefined
          ? undefined
          : JSON.parse(JSON.stringify(variable.correctResponse)),
      mapping:
        variable.mapping === undefined
          ? undefined
          : JSON.parse(JSON.stringify(variable.mapping)),
    }));
  };

  const refreshPreviewVariables = () => {
    const assessmentItem = getAssessmentItemElement();
    const variables = (assessmentItem?.variables || []) as PreviewVariable[];
    const nextVariables = snapshotPreviewVariables(variables);
    const nextSignature = JSON.stringify(nextVariables);
    if (nextSignature === lastVariablesSignatureRef.current) return;
    lastVariablesSignatureRef.current = nextSignature;
    setPreviewVariables(nextVariables);
  };

  useEffect(() => {
    const attach = () => {
      const assessmentItem = getAssessmentItemElement();
      if (!assessmentItem) return false;
      const handleContextUpdate = () => refreshPreviewVariables();
      const handleInteractionUpdate = () => refreshPreviewVariables();
      assessmentItem.addEventListener(
        "qti-item-context-updated",
        handleContextUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-interaction-changed",
        handleInteractionUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-outcome-changed",
        handleInteractionUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-interaction-response",
        handleInteractionUpdate as EventListener,
      );
      refreshPreviewVariables();
      return () => {
        assessmentItem.removeEventListener(
          "qti-item-context-updated",
          handleContextUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-interaction-changed",
          handleInteractionUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-outcome-changed",
          handleInteractionUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-interaction-response",
          handleInteractionUpdate as EventListener,
        );
      };
    };

    let cleanup: false | (() => void) = false;
    let attempts = 0;
    const maxAttempts = 20;
    const tryAttach = () => {
      const maybeCleanup = attach();
      if (maybeCleanup) {
        cleanup = maybeCleanup;
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(tryAttach, 100);
      }
    };

    tryAttach();

    return () => {
      if (cleanup) cleanup();
    };
  }, [qti3ForPreview]);

  return (
    <div className="relative grid md:grid-cols-2 gap-4 bg-gray-200">
      {sharePopupOpen ? (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-citolab-700 px-4 py-2 text-white shadow-lg">
          Shareable URL copied to clipboard
        </div>
      ) : null}
      <Panel
        title="QTI 3"
        actionComponents={[
          // <button
          //   type="button"
          //   onClick={() =>
          //     setSourceEditorMode((current) =>
          //       current === "monaco" ? "prosemirror" : "monaco",
          //     )
          //   }
          //   className="inline-flex items-center gap-x-1.5 rounded-md border border-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-citolab-700 hover:bg-citolab-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
          // >
          //   <FlaskConical className="-ml-0.5 h-4 w-4" aria-hidden="true" />
          //   {sourceEditorMode === "monaco"
          //     ? "Try our editor now!"
          //     : "Hide beta editor"}
          //   <span className="rounded bg-citolab-600 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white">
          //     Beta
          //   </span>
          // </button>,
          <Dropdown
            name="Examples"
            items={[
              {
                name: "choice",
                items: allItems,
              },
            ]}
            onMenuClick={(name) => {
              const i = allItems.find((i) => i.name === name);
              loadQti3(`/3${i?.href || ""}`);
            }}
          />,
          <div className="flex gap-2">
            <>
              <Button
                id="copy-button"
                size="sm"
                disabled={qti3 === ""}
                onClick={() => {
                  navigator.clipboard.writeText(qti3 || "");
                  setOpenTooltip(true);
                  setTimeout(() => setOpenTooltip(false), 200);
                }}
              >
                <Clipboard className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Tooltip
                isOpen={openTooltip}
                data-tooltip-id={"copy-button"}
                content={"QTI copied to clipboard!"}
              />
            </>
            <>
              <Button
                id="share-button"
                size="sm"
                disabled={!qti3}
                onClick={copyShareUrl}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Tooltip
                isOpen={shareTooltipOpen}
                data-tooltip-id={"share-button"}
                content={"Shareable link copied!"}
              />
            </>
          </div>,
        ]}
      >
        {isConverting ? (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200 bg-opacity-50 flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div></div>
        )}

        {sourceEditorMode === "monaco" ? (
          <Editor
            options={editorOptions}
            onMount={(editor) => {
              sourceEditor.current = editor;
              setIsEditorReady(true);
            }}
            onChange={(value) => {
              debouncedPreview(value || "");
            }}
            width="100%"
            height="75vh"
            value={qti3 || ""}
            defaultLanguage="xml"
            language="xml"
            defaultValue=""
          />
        ) : (
          <QtiProsemirrorEditor
            sourceXml={qti3 || ""}
            onSourceChange={(nextXml) => debouncedPreview(nextXml)}
          />
        )}
      </Panel>
      <Panel
        title="QTI Preview"
        actionComponents={[
          <div className="flex gap-2">
            <Button
              id="correct-button"
              size="sm"
              disabled={!qti3}
              onClick={() => {
                const container =
                  qtiItemRef.current?.querySelector("item-container");
                const assessmentItem = container?.shadowRoot?.querySelector(
                  "qti-assessment-item",
                ) as QtiAssessmentItem;
                if (assessmentItem) {
                  assessmentItem.showCorrectResponse(true);
                }
              }}
            >
              Set correct response
            </Button>
            <Button
              size="sm"
              disabled={!qti3}
              onClick={() => {
                const assessmentItem = getAssessmentItemElement();
                assessmentItem?.processResponse(true, true);
                refreshPreviewVariables();
              }}
            >
              Simulate end attempt
            </Button>
            <Button
              size="sm"
              disabled={!qti3}
              variant={showVariables ? "secondary" : "default"}
              onClick={() => setShowVariables((current) => !current)}
              className={showVariables ? "bg-green-700 text-white hover:bg-green-800" : "bg-green-600 hover:bg-green-700"}
            >
              <Code className="h-4 w-4" aria-hidden="true" />
              <span>{showVariables ? "Hide Output" : "Show Output"}</span>
            </Button>
            <>
              <Button
                id="info-button"
                size="sm"
                disabled={!qti3}
                onClick={() => {
                  window.open(
                    "https://github.com/citolab/qti-components",
                    "_blank",
                  );
                }}
              >
                <Info className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Tooltip
                isOpen={true}
                data-tooltip-id={"info-button"}
                content={
                  "Preview generated by @citolab\\qti-componets: https://github.com/citolab/qti-components"
                }
              />
            </>
          </div>,
        ]}
      >
        <>
          {qti3ForPreview ? (
            <qti-item ref={qtiItemRef}>
              <item-container itemDoc={previewItemDoc}>
                <template
                  dangerouslySetInnerHTML={{
                    __html: `<style>${itemCss}</style>`,
                  }}
                ></template>
              </item-container>
            </qti-item>
          ) : (
            <div className="ml-6">Valid QTI will be previewed here.</div>
          )}
          {errorMessage ? (
            <div className="w-full h-full bg-red-200 bg-opacity-50 flex justify-center items-center">
              <div className="text-red-900">
                Oops, an error occurred: {errorMessage}
              </div>
            </div>
          ) : null}
          <DraggablePopup
            isOpen={showVariables}
            onClose={() => setShowVariables(false)}
            setIsOpen={setShowVariables}
            title="Item Variable"
            storageKey="previewOutputPopupState"
          >
            <div className="bg-gray-50 p-3 rounded">
              {previewVariables.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Identifier
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Value
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Cardinality
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Base Type
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Correct / Mapping
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewVariables.map((variable) => (
                        <tr key={variable.identifier}>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            {variable.identifier}
                          </td>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(variable.value ?? null, null, 2)}
                            </pre>
                          </td>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            {variable.cardinality || "-"}
                          </td>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            {variable.baseType || "-"}
                          </td>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(
                                variable.correctResponse ?? variable.mapping ?? null,
                                null,
                                2,
                              )}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  No item variables available yet.
                </div>
              )}
            </div>
          </DraggablePopup>
        </>
      </Panel>
    </div>
  );
};
