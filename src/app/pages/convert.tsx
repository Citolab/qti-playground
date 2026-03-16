import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/store";
import { Clipboard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dropdown } from "../components/dropdown";
import { Panel } from "../components/panel";
import { Button } from "@/components/ui/button";

export const ConvertPage = () => {
  const sourceEditor = useRef<{ setValue: (value: string) => void } | null>(null);
  const resultEditor = useRef<object | null>(null);

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
  const config = {
    minimap: { enabled: false },
    readOnly: false,
    autoIndent: "full" as const,
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
        <div className="p-3 pt-0">
          <div className="rounded-lg overflow-hidden">
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
              theme="vs-dark"
            />
          </div>
        </div>
      </Panel>
      <Panel
        title="QTI 3"
        actionComponents={[
          <TooltipProvider>
            <Tooltip open={openTooltip}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  disabled={!qti3}
                  onClick={() => {
                    navigator.clipboard.writeText(qti3 || "");
                    setOpenTooltip(true);
                    setTimeout(() => setOpenTooltip(false), 2000);
                  }}
                >
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>QTI copied to clipboard!</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ]}
      >
        <div className="p-3 pt-0">
          <div className="rounded-lg overflow-hidden">
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
              theme="vs-dark"
            />
          </div>
        </div>
      </Panel>
    </div>
  );
};
