import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { UseStoreContext } from "../store/store-context";
import { initialState, LoadQtiAction, Qti3ChangedAction } from "../store/store";
import { editor } from "monaco-editor";
import { Clipboard, Info } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Dropdown } from "../components/dropdown";
import { Panel } from "../components/panel";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { QtiAssessmentItem, QtiItem } from "@citolab/qti-components";
import { CustomElements } from "@citolab/qti-components/react";

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
  const [openTooltip, setOpenTooltip] = useState(false);
  const [state, setState] = useState(initialState);
  const { store } = UseStoreContext();

  useEffect(() => {
    const subs = store.subscribe(setState);
    return () => subs?.unsubscribe();
  }, [store]);

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
    (qti: string) => store.dispatch(new Qti3ChangedAction({ qti })),
    1000
  );

  useEffect(() => {
    if (state.fillSource) {
      sourceEditor.current?.setValue(state.qti3 || "");
      debouncedPreview(state.qti3 || "");
    }
  }, [debouncedPreview, state.fillSource, state.qti3]);

  return (
    <div className="grid md:grid-cols-2 gap-4 bg-gray-200">
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
              store.dispatch(new LoadQtiAction({ href: `/3${i?.href || ""}` }));
            }}
          />,
          <>
            <button
              id="copy-button"
              type="button"
              disabled={state.qti3 === ""}
              onClick={() => {
                // copy state.qti3 to clipboard
                navigator.clipboard.writeText(state.qti3 || "");
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
          </>,
        ]}
      >
        {state.isConverting ? (
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
          }}
          onChange={(value) => {
            debouncedPreview(value || "");
          }}
          width="100%"
          height="75vh"
          value={state.qti3 || ""}
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
                disabled={!state.qti3}
                onClick={() => {
                  const container =
                    qtiItemRef.current?.querySelector("item-container");
                  const assessmentItem = container?.shadowRoot?.querySelector(
                    "qti-assessment-item"
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
                disabled={!state.qti3}
                onClick={() => {
                  // navigate in new tab to: https://github.com/citolab/qti-components
                  window.open(
                    "https://github.com/citolab/qti-components",
                    "_blank"
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
          {state.qti3ForPreview ? (
            <qti-item ref={qtiItemRef}>
              <item-container
                itemDoc={qtiTransformItem()
                  .parse(state.qti3ForPreview)
                  .extendElementsWithClass("type")
                  .convertCDATAtoComment()
                  .htmlDoc()}
              ></item-container>
            </qti-item>
          ) : (
            <div className="ml-6">Valid QTI will be previewed here.</div>
          )}
          {state.errorMessage ? (
            <div className="w-full h-full bg-red-200 bg-opacity-50 flex justify-center items-center">
              <div className="text-red-900">
                Oops, an error occurred: {state.errorMessage}
              </div>
            </div>
          ) : null}
        </>
      </Panel>
    </div>
  );
};
