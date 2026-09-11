import { Editor } from "@monaco-editor/react";
import { useDebouncedCallback } from "use-debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCheck,
  Clipboard,
  Code,
  FilePlus2,
  Info,
  Pencil,
  Play,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dropdown } from "../components/dropdown";
import { iconActionClassName, Panel } from "../components/panel";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import { QtiAssessmentItem, QtiItem } from "@citolab/qti-components";
import type { QtiAssessmentItemCorrection } from "@citolab/qti-components/corrections";
import { CustomElements } from "@citolab/qti-components/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { itemCss } from "../itemCss";
import {
  createScopedQtiRegistry,
  inspectScopedContainer,
  observeScopedSubtree,
  syncScopedRegistry,
} from "../scoped-registry";
import DraggablePopup from "../components/draggable-popup";
import { DownloadItemPackageButton } from "../components/download-package-button";
import {
  ALL_EXAMPLE_ITEMS,
  buildShareUrl,
  decodeSharedParamToXml,
} from "./item-source";

type PreviewVariable = {
  identifier: string;
  value?: unknown;
  cardinality?: string;
  baseType?: string;
  correctResponse?: unknown;
  mapping?: unknown;
};

/* React */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends CustomElements { }
  }
}
export const PreviewPage = () => {
  const sourceEditor = useRef<{ setValue: (value: string) => void; getValue: () => string } | null>(null);
  const qtiItemRef = useRef<QtiItem>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<PreviewVariable[]>(
    [],
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasLoadedSharedItem = useRef(false);
  const hasLoadedItemFromQuery = useRef(false);
  const lastVariablesSignatureRef = useRef("");
  const showVariablesRef = useRef(showVariables);
  showVariablesRef.current = showVariables;

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
  const newItem = useStore((state) => state.newItem);

  const editorOptions = {
    minimap: { enabled: false },
    readOnly: false,
    autoIndent: "full" as const,
    formatOnPaste: true,
    formatOnType: true,
  };

  const debouncedPreview = useDebouncedCallback(
    (qti: string) => setQti3(qti),
    1000,
  );

  // Spike: scope the player's custom element names to the preview's own
  // registry, so the surrounding app keeps the global `qti-*` names.
  // Opt out with `?scopedRegistry=0` to compare against the global behaviour.
  // Created during the first render rather than in an effect: `ItemContainer`
  // reads `customElementRegistry` in `createRenderRoot()`, so it has to sit on
  // the element before React connects it.
  const [scopedRegistry] = useState<CustomElementRegistry | null>(() =>
    searchParams.get("scopedRegistry") === "0" ? null : createScopedQtiRegistry(),
  );

  const preview = useMemo(() => {
    if (!qti3ForPreview) return null;
    const transformer = qtiTransformItem()
      .parse(qti3ForPreview)
      .extendElementsWithClass("type")
      .convertCDATAtoComment();
    if (!scopedRegistry) {
      return { doc: transformer.htmlDoc(), scopedTags: [] as string[] };
    }
    // The registry instance is stable across edits so the container never has
    // to remount; only newly seen tags are added, before the elements that
    // need them are created.
    const { defined, pending } = syncScopedRegistry(
      scopedRegistry,
      transformer.xmlDoc(),
    );
    if (pending.length) {
      console.info("[scoped-registry] tags not defined anywhere yet:", pending);
    }
    return { doc: transformer.htmlDoc(scopedRegistry), scopedTags: defined };
  }, [qti3ForPreview, scopedRegistry]);
  const previewItemDoc = preview?.doc ?? null;

  // Attach the mirror as early as possible: the ref callback runs right after
  // React inserts the container, which is when Lit has just created the shadow
  // root and before qti-components expands any response-processing template.
  const scopedObserverRef = useRef<(() => void) | null>(null);
  const attachScopedObserver = useCallback(
    (container: HTMLElement | null) => {
      scopedObserverRef.current?.();
      scopedObserverRef.current = null;
      if (!container || !scopedRegistry) return;
      const shadowRoot = container.shadowRoot;
      if (!shadowRoot) return;
      scopedObserverRef.current = observeScopedSubtree(
        shadowRoot,
        scopedRegistry,
      );
    },
    [scopedRegistry],
  );

  useEffect(() => {
    if (!fillSource || !isEditorReady) return;
    const nextValue = qti3 || "";
    const editorInstance = sourceEditor.current;
    if (!editorInstance) return;
    if (editorInstance.getValue() !== nextValue) {
      editorInstance.setValue(nextValue);
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

  // The QTI editor lives on its own page now; keep old `?editor=citolab`
  // links working by sending them there with the rest of the query intact.
  useEffect(() => {
    if (searchParams.get("editor") !== "citolab") return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("editor");
    const query = nextParams.toString();
    navigate(`/edit${query ? `?${query}` : ""}`, { replace: true });
  }, [navigate, searchParams]);

  useEffect(() => {
    if (hasLoadedItemFromQuery.current) return;
    const sharedQti = searchParams.get("sharedQti");
    if (sharedQti) return;
    const itemId = searchParams.get("itemId");
    if (!itemId) return;
    hasLoadedItemFromQuery.current = true;
    void editItem(itemId);
  }, [searchParams, editItem]);

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
      await navigator.clipboard.writeText(buildShareUrl(qti3, "/preview"));
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

  // Spike diagnostics: did the scoped registry actually reach the shadow root?
  // The property has to be set before connection, and React sets custom element
  // properties during the complete phase (before insertion), so this is what
  // confirms the timing rather than assuming it.
  const scopedReportedRef = useRef(false);

  const resetPreviewItem = () => {
    const assessmentItem =
      getAssessmentItemElement() as QtiAssessmentItemCorrection | null;
    if (!assessmentItem) return;

    // Variable state back to the snapshot taken after template processing:
    // responses, SCORE, completionStatus and numAttempts all revert.
    assessmentItem.resetResponses();

    // resetResponses() only rewrites the item context — the interactions still hold
    // the candidate's input. Assigning `variables` runs the setter, which pushes each
    // restored value back into its interaction and clears the UI.
    assessmentItem.variables = [...assessmentItem.variables];

    // If "Set correct response" was used, take the answer key back off.
    assessmentItem.showCorrectResponse?.(false);
    refreshPreviewVariables();
  };

  useEffect(() => {
    if (!previewItemDoc || scopedReportedRef.current) return;
    let cancelled = false;
    let attempts = 0;
    const report = () => {
      if (cancelled) return;
      const container = qtiItemRef.current?.querySelector("item-container");
      if (!container?.shadowRoot) {
        attempts += 1;
        if (attempts < 20) window.setTimeout(report, 100);
        return;
      }
      scopedReportedRef.current = true;
      console.info(
        "[scoped-registry] preview report",
        inspectScopedContainer(
          container,
          scopedRegistry,
          preview?.scopedTags ?? [],
        ),
      );
    };
    report();
    return () => {
      cancelled = true;
    };
  }, [preview, previewItemDoc, scopedRegistry]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let timeoutId = 0;
    let attempts = 0;
    const maxAttempts = 20;

    const attach = () => {
      if (cancelled) return;
      const assessmentItem = getAssessmentItemElement();
      if (!assessmentItem) {
        attempts += 1;
        if (attempts < maxAttempts) {
          timeoutId = window.setTimeout(attach, 100);
        }
        return;
      }
      const handleUpdate = () => {
        // Avoid re-rendering the whole preview pane unless the output popup is open
        if (!showVariablesRef.current) return;
        refreshPreviewVariables();
      };
      assessmentItem.addEventListener(
        "qti-item-context-updated",
        handleUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-interaction-changed",
        handleUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-outcome-changed",
        handleUpdate as EventListener,
      );
      assessmentItem.addEventListener(
        "qti-interaction-response",
        handleUpdate as EventListener,
      );
      if (showVariablesRef.current) refreshPreviewVariables();
      cleanup = () => {
        assessmentItem.removeEventListener(
          "qti-item-context-updated",
          handleUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-interaction-changed",
          handleUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-outcome-changed",
          handleUpdate as EventListener,
        );
        assessmentItem.removeEventListener(
          "qti-interaction-response",
          handleUpdate as EventListener,
        );
      };
    };

    attach();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qti3ForPreview]);

  return (
    <div className="relative flex flex-col gap-4 bg-gray-200 md:flex-row">
      {sharePopupOpen ? (
        <div className="fixed top-4 right-4 z-50 rounded-md bg-citolab-700 px-4 py-2 text-white shadow-lg">
          Shareable URL copied to clipboard
        </div>
      ) : null}
      <div className="min-h-0 min-w-0 flex-1 md:max-w-[calc(50%-0.5rem)]">
      <Panel
        title="QTI 3"
        pinnedActions={[
          // Mirrors the Preview button on /edit: each page points at the other
          // with one icon. Pinned rather than in the actions below so it never
          // collapses into the overflow menu.
          <Button
            key="qti-editor-link"
            variant="outline"
            size="sm"
            className={cn(
              iconActionClassName,
              "border-citolab-600/70 text-citolab-700 hover:bg-citolab-50",
            )}
            onClick={() => navigate("/edit")}
            title="Open this item in the QTI editor (beta)"
            aria-label="Open this item in the QTI editor (beta)"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>,
        ]}
        // Icon-only, apart from Examples -- same toolbar as /edit.
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
            items={[
              {
                name: "choice",
                items: ALL_EXAMPLE_ITEMS,
              },
            ]}
            onMenuClick={(name) => {
              const i = ALL_EXAMPLE_ITEMS.find((i) => i.name === name);
              loadQti3(`/3${i?.href || ""}`);
            }}
          />,
          <div key="actions" className="flex gap-2">
            <TooltipProvider>
              <Tooltip open={openTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={iconActionClassName}
                    disabled={qti3 === ""}
                    onClick={() => {
                      navigator.clipboard.writeText(qti3 || "");
                      setOpenTooltip(true);
                      setTimeout(() => setOpenTooltip(false), 2000);
                    }}
                    title="Copy the QTI 3 source"
                    aria-label="Copy the QTI 3 source"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>QTI copied to clipboard!</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        ) : (
          <div></div>
        )}

        <div className="p-3 pt-0">
            <div className="rounded-lg overflow-hidden">
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
                theme="vs-dark"
              />
            </div>
        </div>
      </Panel>
      </div>
      <div className="min-h-0 min-w-0 w-full flex-1 md:max-w-[calc(50%-0.5rem)]">
      <Panel
        title="QTI Preview"
        actionComponents={[
          <div key="actions" className="flex gap-2">
            <Button
              id="correct-button"
              size="sm"
              className={iconActionClassName}
              disabled={!qti3}
              onClick={() => {
                const container =
                  qtiItemRef.current?.querySelector("item-container");
                const assessmentItem = container?.shadowRoot?.querySelector(
                  "qti-assessment-item",
                ) as QtiAssessmentItemCorrection | null;
                // Unconditional now. The `?.()` this used to carry was not
                // defensiveness, it was papering over the method being absent:
                // `showCorrectResponse` lives on QtiAssessmentItemCorrection,
                // and until the qti-components 9 upgrade this app registered
                // the correction-free QtiAssessmentItem, so the button silently
                // did nothing. See src/main.tsx.
                assessmentItem?.showCorrectResponse(true);
              }}
              title="Set correct response"
              aria-label="Set correct response"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              className={iconActionClassName}
              disabled={!qti3}
              onClick={() => {
                const assessmentItem = getAssessmentItemElement();
                assessmentItem?.processResponse(true, true);
                refreshPreviewVariables();
              }}
              title="Simulate end attempt"
              aria-label="Simulate end attempt"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              disabled={!qti3}
              variant={showVariables ? "secondary" : "default"}
              aria-pressed={showVariables}
              onClick={() => {
                setShowVariables((current) => {
                  const next = !current;
                  if (next) {
                    // Snapshot once when opening — avoid continuous re-renders while closed
                    queueMicrotask(() => refreshPreviewVariables());
                  }
                  return next;
                });
              }}
              title={showVariables ? "Hide item variables" : "Show item variables"}
              aria-label={
                showVariables ? "Hide item variables" : "Show item variables"
              }
              className={cn(
                iconActionClassName,
                showVariables
                  ? "bg-green-700 text-white hover:bg-green-800"
                  : "bg-green-600 hover:bg-green-700",
              )}
            >
              <Code className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              id="refresh-button"
              size="sm"
              disabled={!qti3}
              onClick={() => {
                resetPreviewItem();
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={iconActionClassName}
                    disabled={!qti3}
                    onClick={() => {
                      window.open(
                        "https://github.com/citolab/qti-components",
                        "_blank",
                      );
                    }}
                    aria-label="About the preview player"
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </Button>

                </TooltipTrigger>
                <TooltipContent>Preview generated by @citolab/qti-components</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>,
        ]}
      >
        <>
          {qti3ForPreview ? (
            <qti-item ref={qtiItemRef}>
              <item-container
                ref={attachScopedObserver}
                itemDoc={previewItemDoc ?? undefined}
                customElementRegistry={scopedRegistry}
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
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identifier</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Cardinality</TableHead>
                        <TableHead>Base Type</TableHead>
                        <TableHead>Correct / Mapping</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewVariables.map((variable) => (
                        <TableRow key={variable.identifier}>
                          <TableCell className="align-top font-mono">
                            {variable.identifier}
                          </TableCell>
                          <TableCell className="align-top">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(variable.value ?? null, null, 2)}
                            </pre>
                          </TableCell>
                          <TableCell className="align-top">
                            {variable.cardinality || "-"}
                          </TableCell>
                          <TableCell className="align-top">
                            {variable.baseType || "-"}
                          </TableCell>
                          <TableCell className="align-top">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(
                                variable.correctResponse ?? variable.mapping ?? null,
                                null,
                                2,
                              )}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  );
};
