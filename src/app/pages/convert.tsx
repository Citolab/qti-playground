import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/store";
import { editor } from "monaco-editor";
import { Clipboard } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Dropdown } from "../components/dropdown";
import { Panel } from "../components/panel";

export const ConvertPage = () => {
  const sourceEditor = useRef<editor.IStandaloneCodeEditor>(null);
  const resultEditor = useRef<editor.IStandaloneCodeEditor>(null);

  const [openTooltip, setOpenTooltip] = useState(false);

  const items = useRef([
    {
      name: "choice",
      items: [
        { name: "choice", href: "/choice.xml", current: true },
        {
          name: "choice multiple",
          href: "/choice_multiple.xml",
          current: false,
        },
        { name: "gap match", href: "/gap_match.xml", current: false },
        {
          name: "graphic gap match",
          href: "/graphic_gap_match.xml",
          current: false,
        },
        {
          name: "graphic associate",
          href: "/graphic_associate.xml",
          current: false,
        },
        {
          name: "position object",
          href: "/position_object.xml",
          current: false,
        },
        { name: "select point", href: "/select_point.xml", current: false },
        { name: "hotspot", href: "/hotspot.xml", current: false },
        { name: "inline choice", href: "/inline_choice.xml", current: false },
        { name: "match", href: "/match.xml", current: false },
        { name: "order", href: "/order.xml", current: false },
        { name: "slider", href: "/slider.xml", current: false },
      ],
    },
  ]);
  const allItems = items.current.flatMap((i) => i.items);

  // Zustand store - use selectors for optimal re-renders
  const qtiInput = useStore((state) => state.qtiInput);
  const qti3 = useStore((state) => state.qti3);
  const fillSource = useStore((state) => state.fillSource);
  const loadQti = useStore((state) => state.loadQti);
  const convertQti = useStore((state) => state.convertQti);

  useEffect(() => {
    if (fillSource) {
      sourceEditor.current?.setValue(qtiInput || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillSource]);

  const debouncedConvert = useDebouncedCallback(
    (qti: string) => convertQti(qti),
    1000
  );
  const config: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    readOnly: false,
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
  };
  return (
    <div className="grid md:grid-cols-2 gap-4 bg-gray-200">
      <Panel
        title="QTI 2.x"
        actionComponents={[
          <Dropdown
            name="Examples"
            items={items.current}
            onMenuClick={async (name) => {
              const i = allItems.find((i) => i.name === name);
              await loadQti(`/2${i?.href || ""}`);
              sourceEditor.current?.setValue(useStore.getState().qtiInput);
            }}
          />,
        ]}
      >
        <Editor
          width="100%"
          height="75vh"
          options={config}
          onMount={(editor) => {
            sourceEditor.current = editor;
            if (fillSource) {
              sourceEditor.current?.setValue(qtiInput || "");
            }
          }}
          onChange={(value) => {
            debouncedConvert(value || "");
          }}
          defaultLanguage="xml"
        />
      </Panel>
      <Panel
        title="QTI 3"
        actionComponents={[
          <>
            <button
              id="copy-button"
              type="button"
              disabled={!qti3}
              onClick={() => {
                // copy qti3 to clipboard
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
          </>,
        ]}
      >
        <Editor
          options={{
            readOnly: true,
            minimap: { enabled: false },
            autoIndent: "full",
            formatOnPaste: true,
            formatOnType: true,
          }}
          onMount={(editor) => {
            resultEditor.current = editor;
          }}
          width="100%"
          height="75vh"
          value={qti3 || ""}
          defaultLanguage="xml"
          defaultValue=""
        />
      </Panel>
    </div>
  );
};
