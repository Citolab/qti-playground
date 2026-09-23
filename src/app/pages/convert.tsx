import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  convertQti3toQti21,
  type Qti21Warning,
} from "@citolab/qti-convert/qti-downgrader";
import { useStore } from "../store/store";
import { AlertTriangle, ArrowLeftRight, Clipboard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dropdown } from "../components/dropdown";
import { iconActionClassName, Panel } from "../components/panel";
import { Button } from "@/components/ui/button";

type Direction = "upgrade" | "downgrade";

const example = (name: string, href: string) => ({ name, href, current: false });

const QTI2_ITEMS = [
  {
    name: "choice",
    items: [
      { name: "choice", href: "/choice.xml", current: true },
      example("choice multiple", "/choice_multiple.xml"),
      example("gap match", "/gap_match.xml"),
      example("graphic gap match", "/graphic_gap_match.xml"),
      example("graphic associate", "/graphic_associate.xml"),
      example("position object", "/position_object.xml"),
      example("select point", "/select_point.xml"),
      example("hotspot", "/hotspot.xml"),
      example("inline choice", "/inline_choice.xml"),
      example("match", "/match.xml"),
      example("order", "/order.xml"),
      example("slider", "/slider.xml"),
    ],
  },
];

const QTI3_ITEMS = [
  {
    name: "choice",
    items: [
      { name: "choice", href: "/choice.xml", current: true },
      example("associate", "/associate.xml"),
      example("extended text", "/extended_text.xml"),
      example("gap match", "/gap-match.xml"),
      example("graphic gap match", "/graphic_gap_match.xml"),
      example("graphic order", "/graphic_order.xml"),
      example("hotspot", "/hotspot.xml"),
      example("hottext", "/hottext.xml"),
      example("inline choice", "/inline_choice.xml"),
      example("inline choice with math", "/inline_choice_math.xml"),
      example("match", "/match.xml"),
      example("order", "/order.xml"),
      example("select point", "/select_point.xml"),
      example("text entry", "/text_entry.xml"),
      example("adaptive", "/adaptive.xml"),
    ],
  },
];

const PANEL_TITLES: Record<Direction, [string, string]> = {
  upgrade: ["QTI 2.x", "QTI 3"],
  downgrade: ["QTI 3", "QTI 2.1"],
};

/** Label of the swap button: the direction it switches to. */
const SWITCH_LABELS: Record<Direction, string> = {
  upgrade: "Switch to QTI 3 → QTI 2.1",
  downgrade: "Switch to QTI 2.x → QTI 3",
};

export const ConvertPage = () => {
  const sourceEditor = useRef<{ setValue: (value: string) => void } | null>(null);
  const resultEditor = useRef<object | null>(null);

  const [openTooltip, setOpenTooltip] = useState(false);
  const [direction, setDirection] = useState<Direction>("upgrade");
  const directionRef = useRef<Direction>("upgrade");
  const [qti21, setQti21] = useState("");
  const [warnings, setWarnings] = useState<Qti21Warning[]>([]);

  // Zustand store - use selectors for optimal re-renders
  const qtiInput = useStore((state) => state.qtiInput);
  const qti3 = useStore((state) => state.qti3);
  const fillSource = useStore((state) => state.fillSource);
  const loadQti = useStore((state) => state.loadQti);
  const convertQti = useStore((state) => state.convertQti);

  const result = direction === "upgrade" ? qti3 || "" : qti21;
  const examples = direction === "upgrade" ? QTI2_ITEMS : QTI3_ITEMS;
  const [sourceTitle, resultTitle] = PANEL_TITLES[direction];

  useEffect(() => {
    if (fillSource && directionRef.current === "upgrade") {
      sourceEditor.current?.setValue(qtiInput || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillSource]);

  const downgrade = (qti: string) => {
    if (!qti.trim()) {
      setQti21("");
      setWarnings([]);
      return;
    }
    const converted = convertQti3toQti21(qti);
    setQti21(converted.xml);
    setWarnings(converted.warnings);
  };

  const convert = (qti: string) =>
    directionRef.current === "upgrade" ? convertQti(qti) : downgrade(qti);

  const debouncedConvert = useDebouncedCallback((qti: string) => convert(qti), 1000);

  /** Switches the direction; the current result becomes the new source. */
  const swapDirection = () => {
    const next: Direction = direction === "upgrade" ? "downgrade" : "upgrade";
    const nextSource = result;
    directionRef.current = next;
    setDirection(next);
    sourceEditor.current?.setValue(nextSource);
    // setValue triggers onChange (debounced); convert right away instead
    debouncedConvert.cancel();
    void convert(nextSource);
  };

  const loadExample = async (name: string) => {
    const item = examples.flatMap((group) => group.items).find((i) => i.name === name);
    if (!item) return;
    if (direction === "upgrade") {
      await loadQti(`/2${item.href}`);
      sourceEditor.current?.setValue(useStore.getState().qtiInput);
      return;
    }
    const response = await axios.get(`/3${item.href}`, { responseType: "text" });
    sourceEditor.current?.setValue(response.data);
    debouncedConvert.cancel();
    downgrade(response.data);
  };

  const config = {
    minimap: { enabled: false },
    readOnly: false,
    autoIndent: "full" as const,
    formatOnPaste: true,
    formatOnType: true,
  };
  const showWarnings = direction === "downgrade" && warnings.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-4 bg-gray-200">
      <Panel
        title={sourceTitle}
        pinnedActions={[
          <TooltipProvider key="swap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={iconActionClassName}
                  aria-label={SWITCH_LABELS[direction]}
                  onClick={swapDirection}
                >
                  <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{SWITCH_LABELS[direction]}</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ]}
        actionComponents={[
          <Dropdown
            key={`examples-${direction}`}
            name="Examples"
            items={examples}
            onMenuClick={(name) => void loadExample(name)}
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
        title={resultTitle}
        actionComponents={[
          <TooltipProvider key="copy">
            <Tooltip open={openTooltip}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  disabled={!result}
                  onClick={() => {
                    navigator.clipboard.writeText(result);
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
        <div className="p-3 pt-0 space-y-3">
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
              height={showWarnings ? "58vh" : "75vh"}
              value={result}
              defaultLanguage="xml"
              defaultValue=""
              theme="vs-dark"
            />
          </div>
          {showWarnings ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                Changes made for QTI 2.1
              </p>
              <ul className="mt-1 list-disc pl-6 space-y-0.5 max-h-[12vh] overflow-y-auto">
                {warnings.map((warning) => (
                  <li key={`${warning.code}-${warning.message}`}>{warning.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
};
