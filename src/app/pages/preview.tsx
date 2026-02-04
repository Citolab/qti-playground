import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/store";
import { editor } from "monaco-editor";
import { Clipboard, Info, Share2 } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Dropdown } from "../components/dropdown";
import { Panel } from "../components/panel";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { QtiAssessmentItem, QtiItem } from "@citolab/qti-components";
import { CustomElements } from "@citolab/qti-components/react";
import { useSearchParams } from "react-router-dom";
import { itemCss } from "../itemCss";

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
  console.log("PreviewPage component rendered");
  const sourceEditor = useRef<editor.IStandaloneCodeEditor>(null);
  const qtiItemRef = useRef<QtiItem>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const hasLoadedSharedItem = useRef(false);
  const hasLoadedItemFromQuery = useRef(false);

  // Zustand store - use selectors for optimal re-renders
  const qti3 = useStore((state) => state.qti3);
  const qti3ForPreview = useStore((state) => state.qti3ForPreview);
  const fillSource = useStore((state) => state.fillSource);
  const clearFillSource = useStore((state) => state.clearFillSource);
  const isConverting = useStore((state) => state.isConverting);
  const errorMessage = useStore((state) => state.errorMessage);
  const loadQti = useStore((state) => state.loadQti);
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

  useEffect(() => {
    if (!fillSource || !isEditorReady) return;
    const nextValue = qti3 || "";
    const editorInstance = sourceEditor.current;
    if (!editorInstance) return;
    if (editorInstance.getValue() !== nextValue) {
      editorInstance.setValue(nextValue);
      debouncedPreview(nextValue);
    }
    clearFillSource();
  }, [clearFillSource, debouncedPreview, fillSource, isEditorReady, qti3]);

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
              loadQti(`/3${i?.href || ""}`);
            }}
          />,
          <div className="flex gap-2">
            <>
              <button
                id="copy-button"
                type="button"
                disabled={qti3 === ""}
                onClick={() => {
                  navigator.clipboard.writeText(qti3 || "");
                  setOpenTooltip(true);
                  setTimeout(() => {
                    setOpenTooltip(false);
                  }, 200);
                }}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-citolab-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
              >
                <Clipboard className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              </button>
              <Tooltip
                isOpen={openTooltip}
                data-tooltip-id={"copy-button"}
                content={"QTI copied to clipboard!"}
              />
            </>
            <>
              <button
                id="share-button"
                type="button"
                disabled={!qti3}
                onClick={copyShareUrl}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-citolab-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
              >
                <Share2 className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              </button>
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
      </Panel>
      <Panel
        title="QTI Preview"
        actionComponents={[
          <div className="flex gap-2">
            <div>
              <button
                id="correct-button"
                type="button"
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
                className="inline-flex items-center gap-x-1.5 rounded-md bg-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-citolab-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
              >
                Set correct response
              </button>
            </div>
            <div>
              <button
                id="info-button"
                type="button"
                disabled={!qti3}
                onClick={() => {
                  // navigate in new tab to: https://github.com/citolab/qti-components
                  window.open(
                    "https://github.com/citolab/qti-components",
                    "_blank",
                  );
                }}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-citolab-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
              >
                <Info className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              </button>
              <Tooltip
                isOpen={true}
                data-tooltip-id={"info-button"}
                content={
                  "Preview generated by @citolab\\qti-componets: https://github.com/citolab/qti-components"
                }
              />
            </div>
          </div>,
        ]}
      >
        <>
          {qti3ForPreview ? (
            <qti-item ref={qtiItemRef}>
              <item-container
                itemDoc={qtiTransformItem()
                  .parse(qti3ForPreview)
                  .extendElementsWithClass("type")
                  .convertCDATAtoComment()
                  .htmlDoc()}
              >
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
        </>
      </Panel>
    </div>
  );
};
