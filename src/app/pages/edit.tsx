import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { Clipboard, Eye, FilePlus2, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "../store/store";
import { Dropdown } from "../components/dropdown";
import { iconActionClassName, Panel } from "../components/panel";
import { QtiCitolabEditorPanel } from "../components/editor/qti-citolab-editor-panel";
import { DownloadItemPackageButton } from "../components/download-package-button";
import {
  EDITOR_EXAMPLE_ITEMS,
  buildShareUrl,
  decodeSharedParamToXml,
} from "./item-source";

export const EditPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const hasLoadedSharedItem = useRef(false);
  const hasLoadedItemFromQuery = useRef(false);
  const hasSeededBlankItem = useRef(false);

  const qti3 = useStore((state) => state.qti3);
  // The editor takes its source as a mount-time prop, so anything that loads a
  // different document into the store has to remount it: the store bumps this
  // on every such load.
  const sessionKey = useStore((state) => state.sourceVersion);
  // Where the open item lives, so an item opened from a package or an example
  // still finds its images -- the editor resolves relative paths against this.
  const itemHref = useStore((state) => state.previewItemHref);
  const isConverting = useStore((state) => state.isConverting);
  const errorMessage = useStore((state) => state.errorMessage);
  const loadQti3 = useStore((state) => state.loadQti3);
  const setQti3 = useStore((state) => state.setQti3);
  const loadSharedQti = useStore((state) => state.loadSharedQti);
  const editItem = useStore((state) => state.editItem);
  const newItem = useStore((state) => state.newItem);

  const debouncedSource = useDebouncedCallback(
    (qti: string) => setQti3(qti),
    1000,
  );

  useEffect(() => {
    if (hasLoadedSharedItem.current) return;
    const sharedQti = searchParams.get("sharedQti");
    if (!sharedQti) return;
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
    if (searchParams.get("sharedQti")) return;
    const itemId = searchParams.get("itemId");
    if (!itemId) return;
    hasLoadedItemFromQuery.current = true;
    void editItem(itemId);
  }, [searchParams, editItem]);

  // Nothing loaded yet: start the author off on a blank item rather than an
  // empty editor. `newItem` flips `fillSource`, which remounts the editor
  // below once the blank source is in the store.
  useEffect(() => {
    if (hasSeededBlankItem.current) return;
    if (qti3) return;
    if (searchParams.get("sharedQti") || searchParams.get("itemId")) return;
    hasSeededBlankItem.current = true;
    void newItem();
  }, [newItem, qti3, searchParams]);

  const startNewItem = async () => {
    if (
      qti3 &&
      !window.confirm(
        "Start a new item? The item currently open will be replaced.",
      )
    ) {
      return;
    }
    await newItem();
  };

  const copyShareUrl = async () => {
    if (!qti3) return;
    try {
      await navigator.clipboard.writeText(buildShareUrl(qti3, "/edit"));
      setShareTooltipOpen(true);
      setSharePopupOpen(true);
      setTimeout(() => setShareTooltipOpen(false), 2000);
      setTimeout(() => setSharePopupOpen(false), 2000);
    } catch (error) {
      console.error("Failed to copy share url", error);
    }
  };

  return (
    <div className="relative flex flex-col gap-4 bg-gray-200 md:flex-row">
      {sharePopupOpen ? (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-citolab-700 px-4 py-2 text-white shadow-lg">
          Shareable URL copied to clipboard
        </div>
      ) : null}

      <div className="min-h-0 min-w-0 flex-1 md:max-w-[calc(50%-0.5rem)]">
        <Panel
          title="QTI Editor"
          pinnedActions={[
            // The nav only marks this page as new; "beta" is stated here, on
            // the page itself, where it is a caveat about the editor.
            <span
              key="beta-badge"
              className="rounded-full bg-citolab-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white"
            >
              Beta
            </span>,
          ]}
          // Icon-only, apart from Examples: the labels repeat what the glyphs
          // already say and cost the panel the width it needs for the title.
          actionComponents={[
            <Button
              key="new-item"
              variant="outline"
              size="sm"
              className={iconActionClassName}
              onClick={() => void startNewItem()}
              title="Start a new, blank item"
              aria-label="Start a new, blank item"
            >
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            </Button>,
            <Dropdown
              key="examples"
              name="Examples"
              items={[{ name: "choice", items: EDITOR_EXAMPLE_ITEMS }]}
              onMenuClick={(name) => {
                const example = EDITOR_EXAMPLE_ITEMS.find(
                  (i) => i.name === name,
                );
                loadQti3(`/3${example?.href || ""}`);
              }}
            />,
            <div key="actions" className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className={iconActionClassName}
                disabled={!qti3}
                onClick={() => navigate("/preview")}
                title="Open this item in the preview player"
                aria-label="Open this item in the preview player"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </Button>
              <TooltipProvider>
                <Tooltip open={shareTooltipOpen}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className={iconActionClassName}
                      disabled={!qti3}
                      onClick={copyShareUrl}
                      title="Copy a shareable link to this item"
                      aria-label="Copy a shareable link to this item"
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Shareable link copied!</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DownloadItemPackageButton
                size="sm"
                iconOnly
                className={iconActionClassName}
              />
            </div>,
          ]}
        >
          {isConverting ? (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 bg-opacity-50 flex justify-center items-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : null}

          <QtiCitolabEditorPanel
            key={sessionKey}
            editorSessionKey={sessionKey}
            active
            sourceXml={qti3 || ""}
            assetBaseHref={itemHref}
            onSourceChange={(nextXml) => debouncedSource(nextXml)}
            normalizeOnLoad
          />
        </Panel>
      </div>

      <div className="min-h-0 min-w-0 w-full flex-1 md:max-w-[calc(50%-0.5rem)]">
        <Panel
          title="QTI 3 XML"
          actionComponents={[
            <span key="readonly-hint" className="text-xs text-gray-500">
              Read-only — generated from the editor
            </span>,
            <TooltipProvider key="copy">
              <Tooltip open={copyTooltipOpen}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={iconActionClassName}
                    disabled={!qti3}
                    onClick={() => {
                      navigator.clipboard.writeText(qti3 || "");
                      setCopyTooltipOpen(true);
                      setTimeout(() => setCopyTooltipOpen(false), 2000);
                    }}
                    title="Copy the QTI 3 source"
                    aria-label="Copy the QTI 3 source"
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
                  minimap: { enabled: false },
                  readOnly: true,
                  domReadOnly: true,
                  autoIndent: "full" as const,
                  formatOnPaste: false,
                  formatOnType: false,
                }}
                width="100%"
                height="75vh"
                value={qti3 || ""}
                defaultLanguage="xml"
                language="xml"
                theme="vs-dark"
              />
            </div>
          </div>
          {errorMessage ? (
            <div className="w-full bg-red-200 bg-opacity-50 flex justify-center items-center p-2">
              <div className="text-red-900">
                Oops, an error occurred: {errorMessage}
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
};

export default EditPage;
