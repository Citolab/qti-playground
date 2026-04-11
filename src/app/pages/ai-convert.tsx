import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DEFAULT_WEB_LLM_MODEL,
  type ConversionIssue,
  convertDocxToQtiPackage,
  convertGoogleFormToQtiPackage,
  convertPdfToQtiPackage,
  convertSpreadsheetToQtiPackage,
  type ConversionSummary,
  type ProgressEvent,
} from "@citolab/qti-convert-local-ai";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Globe,
  Play,
  Settings,
  Sparkles,
  Upload,
  WandSparkles,
  X,
  Cpu,
  FileArchive,
  ScanText,
} from "lucide-react";
import { Terms } from "../components/terms";
import { useStore } from "../store/store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SourceMode = "file" | "google-form";

type AiConvertNavigationState = {
  redirectedFile?: File;
  autoStart?: boolean;
  redirectReason?: "non-qti-source" | "zip-contained-source";
  originalFileName?: string;
};

const FILE_EXPLANATION_STEPS = [
  {
    icon: FileText,
    title: "We read the source locally",
    description:
      "Your file stays in the browser while we extract text, structure, and likely question boundaries.",
  },
  {
    icon: ScanText,
    title: "We normalize it into page-like chunks",
    description:
      "PDFs are parsed directly, while DOCX and spreadsheet content is reshaped into chunked sections the converter can inspect consistently.",
  },
  {
    icon: Cpu,
    title: "The local LLM maps content to QTI",
    description:
      "When deterministic rules are not enough, a browser-hosted model infers prompts, options, and item structure from each chunk.",
  },
  {
    icon: FileArchive,
    title: "We build a downloadable QTI package",
    description:
      "Generated items are assembled into a QTI3 ZIP so you can download it or open it immediately in the player.",
  },
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 40_000);
};

const sanitizeIdentifier = (value: string, fallback: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
};

const normalizeGoogleFormUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    if (!/docs\.google\.com$/i.test(url.hostname)) {
      return value.trim();
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const formsIndex = segments.indexOf("forms");
    if (formsIndex === -1) {
      return url.toString();
    }

    const lastSegment = segments[segments.length - 1];
    if (lastSegment === "edit") {
      segments[segments.length - 1] = "viewform";
      url.pathname = `/${segments.join("/")}`;
      url.search = "";
      url.hash = "";
    }

    return url.toString();
  } catch {
    return value.trim();
  }
};

const deriveGoogleFormIdentifier = (value: string) => {
  try {
    const url = new URL(normalizeGoogleFormUrl(value));
    const id = url.pathname.split("/").filter(Boolean).pop();
    return sanitizeIdentifier(id || "google-form", "google-form");
  } catch {
    return "google-form";
  }
};

const ensureGeneratedPackage = (
  result: {
    packageBlob?: Blob;
    reason?: string;
    processable?: boolean;
  },
  fallbackMessage: string,
) => {
  if (result.processable === false || !result.packageBlob) {
    throw new Error(result.reason || fallbackMessage);
  }

  return result.packageBlob;
};

export const AiConvertPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as AiConvertNavigationState;
  const processPackage = useStore((state) => state.processPackage);
  const [sourceMode, setSourceMode] = useState<SourceMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [summary, setSummary] = useState<ConversionSummary | null>(null);
  const [convertedPackageFile, setConvertedPackageFile] = useState<File | null>(
    null,
  );
  const [downloadBlobState, setDownloadBlobState] = useState<Blob | null>(null);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [summaryDetailsOpen, setSummaryDetailsOpen] = useState(false);
  const [modelName, setModelName] = useState(DEFAULT_WEB_LLM_MODEL);
  const [extraInstructions, setExtraInstructions] = useState("");
  const [usePublicProxy, setUsePublicProxy] = useState(true);
  const [proxyBaseUrl, setProxyBaseUrl] = useState(
    "https://spring-bread-090e.getinspiredbycitolab.workers.dev/?url=",
  );
  const [visibleExplanationCount, setVisibleExplanationCount] = useState(1);
  const redirectedFileHandledRef = useRef(false);
  const processFileRef = useRef<(fileOverride?: File) => Promise<void>>(
    async () => undefined,
  );

  const renderSummaryIssues = (
    issues: ConversionIssue[],
    emptyLabel: string,
    tone: "warning" | "error",
  ) => {
    if (issues.length === 0) {
      return <p className="text-sm text-gray-500">{emptyLabel}</p>;
    }

    return (
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div
            key={`${tone}-${issue.questionIndex}-${issue.identifier || "no-id"}-${index}`}
            className={`rounded-md border p-3 text-sm ${
              tone === "error"
                ? "border-red-200 bg-red-50 text-red-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="font-medium">
              Question {issue.questionIndex + 1}
              {issue.identifier ? ` · ${issue.identifier}` : ""}
            </p>
            <p className="mt-1">{issue.message}</p>
          </div>
        ))}
      </div>
    );
  };

  const resetResultState = () => {
    setError(null);
    setProcessComplete(false);
    setSummary(null);
    setConvertedPackageFile(null);
    setDownloadBlobState(null);
    setDownloadFileName("");
    setStatusMessage("");
    setUploadProgress(0);
  };

  useEffect(() => {
    if (!inProgress) {
      setVisibleExplanationCount(1);
      return;
    }

    setVisibleExplanationCount(1);
    const interval = window.setInterval(() => {
      setVisibleExplanationCount((count) =>
        count < FILE_EXPLANATION_STEPS.length ? count + 1 : count,
      );
    }, 1300);

    return () => window.clearInterval(interval);
  }, [inProgress]);

  const validateFile = (file: File | null) => {
    if (!file) {
      setError("Please select a file");
      return false;
    }

    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith(".csv") &&
      !lowerName.endsWith(".xlsx") &&
      !lowerName.endsWith(".xls") &&
      !lowerName.endsWith(".docx") &&
      !lowerName.endsWith(".pdf")
    ) {
      setError("Only .csv, .xlsx, .xls, .docx and .pdf files are allowed");
      return false;
    }

    setError(null);
    return true;
  };

  const updateProgressFromEvent = (event: ProgressEvent) => {
    setStatusMessage(event.message);
    if (event.stage === "parse_started") {
      setUploadProgress(5);
    } else if (event.stage === "parse_completed") {
      setUploadProgress(15);
    } else if (event.stage === "llm_loading_started") {
      setUploadProgress(20);
    } else if (event.stage === "llm_loading_completed") {
      setUploadProgress(30);
    } else if (event.stage === "chunk_started") {
      setUploadProgress((prev) => Math.max(prev, 35));
    } else if (event.stage === "chunk_completed") {
      const data = event.data as
        | { chunkIndex?: number; chunkCount?: number }
        | undefined;
      if (data?.chunkIndex && data?.chunkCount && data.chunkCount > 0) {
        setUploadProgress(30 + (data.chunkIndex / data.chunkCount) * 45);
      }
    } else if (event.stage === "mapping_started") {
      setUploadProgress((prev) => Math.max(prev, 35));
    } else if (event.stage === "mapping_completed") {
      setUploadProgress(75);
    } else if (event.stage === "generation_started") {
      setUploadProgress(85);
    } else if (event.stage === "item_generated") {
      setUploadProgress(85 + (event.current / event.total) * 10);
    } else if (event.stage === "package_completed") {
      setUploadProgress(100);
    }
  };

  const updateInitProgress = (progress: unknown) => {
    if (progress && typeof progress === "object" && "progress" in progress) {
      const numericProgress = Number(
        (progress as { progress?: unknown }).progress,
      );
      if (Number.isFinite(numericProgress)) {
        setUploadProgress(20 + numericProgress * 35);
      }
    }
    if (progress && typeof progress === "object" && "text" in progress) {
      const text = String((progress as { text?: unknown }).text || "");
      if (text) {
        setStatusMessage(text);
      }
    }
  };

  const llmSettings = {
    model: modelName.trim() || DEFAULT_WEB_LLM_MODEL,
    instructions: extraInstructions.trim() || undefined,
    initProgressCallback: updateInitProgress,
  };

  const processFile = async (fileOverride?: File) => {
    const fileToProcess = fileOverride ?? selectedFile;
    if (!fileToProcess || !validateFile(fileToProcess)) {
      return;
    }

    try {
      resetResultState();
      setInProgress(true);

      const lowerName = fileToProcess.name.toLowerCase();
      const newName =
        fileToProcess.name.substring(0, fileToProcess.name.lastIndexOf(".")) ||
        "import";
      const result = lowerName.endsWith(".docx")
        ? await convertDocxToQtiPackage(fileToProcess, {
            packageIdentifier: newName || "document-qti3",
            testTitle: newName || "Document Import",
            llmSettings,
            onProgress: updateProgressFromEvent,
          })
        : lowerName.endsWith(".pdf")
          ? await convertPdfToQtiPackage(fileToProcess, {
              packageIdentifier: newName || "document-qti3",
              testTitle: newName || "PDF Import",
              llmSettings,
              onProgress: updateProgressFromEvent,
            })
          : await convertSpreadsheetToQtiPackage(fileToProcess, {
              packageIdentifier: newName || "spreadsheet-qti3",
              testTitle: newName || "Spreadsheet Import",
              llmSettings,
              onProgress: updateProgressFromEvent,
            });

      const packageName = `${newName}-qti3.zip`;
      const packageBlob = ensureGeneratedPackage(
        result,
        "This uploaded file cannot be converted to a QTI package.",
      );
      setSummary(result.summary);
      setDownloadBlobState(packageBlob);
      setDownloadFileName(packageName);
      setConvertedPackageFile(
        new File([packageBlob], packageName, {
          type: "application/zip",
        }),
      );
      setProcessComplete(true);
      setUploadProgress(100);
    } catch (caughtError) {
      console.error(caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An error occurred during conversion",
      );
    } finally {
      setInProgress(false);
    }
  };

  processFileRef.current = processFile;

  useEffect(() => {
    const redirectedFile = navigationState.redirectedFile;
    if (!redirectedFile || redirectedFileHandledRef.current) {
      return;
    }

    redirectedFileHandledRef.current = true;
    setSourceMode("file");
    setSelectedFile(redirectedFile);
    resetResultState();
    setError(null);

    if (navigationState.autoStart) {
      window.setTimeout(() => {
        void processFileRef.current(redirectedFile);
      }, 0);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, navigationState]);

  const processGoogleForm = async () => {
    const trimmedUrl = normalizeGoogleFormUrl(googleFormUrl);
    if (!trimmedUrl) {
      setError("Please enter a Google Forms URL");
      return;
    }

    try {
      resetResultState();
      setInProgress(true);
      setStatusMessage("Fetching Google Form...");
      setUploadProgress(20);

      const identifier = deriveGoogleFormIdentifier(trimmedUrl);
      const result = await convertGoogleFormToQtiPackage(trimmedUrl, {
        packageIdentifier: `${identifier}-qti3`,
        testTitle: "Google Form Import",
        fetchFormHtml: async (url) => {
          const targetUrl = usePublicProxy
            ? `${proxyBaseUrl.trim()}${encodeURIComponent(url)}`
            : url;
          const response = await fetch(targetUrl, {
            method: "GET",
            credentials: "omit",
          });
          if (!response.ok) {
            throw new Error(
              `Failed to fetch Google Form (${response.status})${
                usePublicProxy ? " through the public proxy" : ""
              }.`,
            );
          }
          return await response.text();
        },
      });

      setStatusMessage("QTI package is ready to download.");
      setUploadProgress(90);
      const packageBlob = ensureGeneratedPackage(
        result,
        "The Google Form could not be converted to a QTI package.",
      );
      if (!result.packageName) {
        throw new Error(
          "The Google Form conversion did not return a package name.",
        );
      }
      setSummary(result.summary);
      setDownloadBlobState(packageBlob);
      setDownloadFileName(result.packageName);
      setConvertedPackageFile(
        new File([packageBlob], result.packageName, {
          type: "application/zip",
        }),
      );
      setProcessComplete(true);
      setUploadProgress(100);
    } catch (caughtError) {
      console.error(caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An error occurred while importing the Google Form",
      );
    } finally {
      setInProgress(false);
    }
  };

  const startConvertedAssessment = async () => {
    if (!convertedPackageFile) return;

    try {
      setError(null);
      setInProgress(true);
      setStatusMessage("Preparing converted QTI package for assessment...");
      setUploadProgress(20);
      const result = await processPackage(convertedPackageFile, {
        removeStylesheets: false,
        skipValidation: false,
      });
      setUploadProgress(100);
      const firstAssessmentId = result.assessments?.[0]?.id;
      navigate(
        firstAssessmentId ? `/assessment/${firstAssessmentId}` : "/package",
      );
    } catch (caughtError) {
      console.error(caughtError);
      setError("Failed to open the converted package as an assessment");
    } finally {
      setInProgress(false);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    resetResultState();
    if (file) {
      validateFile(file);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files[0] || null;
    setSelectedFile(file);
    resetResultState();
    if (file) {
      validateFile(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setGoogleFormUrl("");
    resetResultState();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-citolab-50/20 to-citolab-teal-50/20 px-4 py-6 lg:px-8 lg:py-10">
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]"
        style={{ minHeight: "80vh" }}
      >
        <div className="bg-linear-to-r from-citolab-700 via-citolab-700 to-citolab-teal-700 px-6 py-7 text-white lg:px-10 lg:py-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center rounded-full bg-white/12 px-3 py-1 text-xs font-medium tracking-wide text-citolab-50">
                Experimental Local Conversion
              </div>
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                <Sparkles className="h-6 w-6" />
                Convert
              </h1>
              <p className="mt-3 text-base leading-7 text-citolab-100 lg:text-xl">
                Best-effort experimental conversion from files or links into
                downloadable QTI3 packages, processed locally in your browser.
              </p>
              {navigationState.redirectReason ? (
                <p className="mt-4 inline-flex rounded-full bg-white/12 px-3 py-1 text-xs text-citolab-50">
                  {navigationState.redirectReason === "zip-contained-source"
                    ? `A source file was detected inside ${navigationState.originalFileName || "the uploaded ZIP"} and sent here for AI conversion.`
                    : "A non-QTI source file was detected and sent here for AI conversion."}
                </p>
              ) : null}
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="self-start border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model-name">
                      Local WebLLM model name
                    </Label>
                    <Input
                      id="ai-model-name"
                      value={modelName}
                      onChange={(event) => setModelName(event.target.value)}
                      placeholder={DEFAULT_WEB_LLM_MODEL}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-extra-instructions">
                      Extra import instructions
                    </Label>
                    <textarea
                      id="ai-extra-instructions"
                      value={extraInstructions}
                      onChange={(event) =>
                        setExtraInstructions(event.target.value)
                      }
                      className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      placeholder="Help the model detect questions by describing the format. For example:&#10;• 'This document contains N questions numbered 1 to N'&#10;• 'Questions start with a number followed by a period'&#10;• 'Each question is preceded by point values like 2p or 3p'"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    File imports use these settings when local WebLLM inference
                    is needed. Google Forms URL import does not use the local
                    LLM.
                  </p>
                  <p className="text-xs text-gray-500">
                    Imported source content stays in the browser during
                    conversion and is not sent to our server.
                  </p>
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">
                      Local AI model performance
                    </AlertTitle>
                    <AlertDescription className="text-amber-800 text-xs">
                      Running AI models locally in your browser is
                      resource-intensive and may significantly impact your
                      computer's performance. Processing files like PDFs or DOCX
                      documents can take several minutes and will utilize
                      substantial CPU and memory resources.
                    </AlertDescription>
                  </Alert>
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="use-public-proxy"
                        checked={usePublicProxy}
                        onCheckedChange={(checked) =>
                          setUsePublicProxy(checked === true)
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="use-public-proxy">
                          Experimental public proxy for Google Forms
                        </Label>
                        <p className="text-xs text-gray-500">
                          Uses a third-party CORS proxy for public Google Forms
                          fetches. This is for testing only and may be blocked
                          or unreliable.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-proxy-url">Proxy base URL</Label>
                      <Input
                        id="public-proxy-url"
                        value={proxyBaseUrl}
                        onChange={(event) =>
                          setProxyBaseUrl(event.target.value)
                        }
                        placeholder="https://corsproxy.io/?url="
                        disabled={!usePublicProxy}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-8 px-6 py-6 lg:px-10 lg:py-8">
          <Tabs
            value={sourceMode}
            onValueChange={(value) => {
              setSourceMode(value as SourceMode);
              resetResultState();
            }}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-2 rounded-2xl border border-gray-200 bg-gray-100/80 p-1.5">
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                File import
              </TabsTrigger>
              <TabsTrigger value="google-form" className="gap-2">
                <Globe className="h-4 w-4" />
                Paste URL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {inProgress ? (
            <div className="flex flex-col rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm lg:p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-citolab-50">
                <WandSparkles className="h-8 w-8 text-citolab-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-700">
                {sourceMode === "file"
                  ? "Converting source file"
                  : "Importing from link"}
              </h3>
              <p className="mb-6 max-w-3xl text-sm text-gray-500">
                {statusMessage ||
                  (sourceMode === "file"
                    ? "Please wait while the source file is analyzed and converted into QTI3."
                    : "Please wait while the Google Form is fetched and converted into QTI3.")}
              </p>
              <Progress value={uploadProgress} className="mb-2 w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.round(uploadProgress)}% complete
              </p>
              {sourceMode === "file" ? (
                <Alert className="mt-6 rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900 text-sm">
                    Performance notice
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 text-xs">
                    Local AI processing may take several minutes for PDF or
                    DOCX files and will use significant CPU and memory
                    resources on your computer.
                  </AlertDescription>
                </Alert>
              ) : null}
              {sourceMode === "file" ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {FILE_EXPLANATION_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const visible = index < visibleExplanationCount;
                    return (
                      <div
                        key={step.title}
                        className={`rounded-lg border p-4 transition-all duration-500 ${
                          visible
                            ? "translate-y-0 opacity-100 border-citolab-200 bg-citolab-50/60"
                            : "translate-y-2 opacity-0 border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-white p-2 shadow-xs">
                            <Icon className="h-4 w-4 text-citolab-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {step.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {sourceMode === "file" ? (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.95fr)] xl:items-start">
                  <div className="space-y-4">
                    {selectedFile ? (
                      <div className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5 shadow-sm lg:p-6">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="text-citolab-600" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">
                              Selected file
                            </h2>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearSelection}
                            className="text-gray-500"
                          >
                            <X size={20} />
                          </Button>
                        </div>

                        <div className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-citolab-50 p-3">
                              <FileText
                                className="text-citolab-600"
                                size={24}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-semibold text-gray-800 break-words">
                                {selectedFile.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                                MB
                              </p>
                              {processComplete && convertedPackageFile ? (
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                  <Button
                                    className="sm:min-w-52"
                                    onClick={() => {
                                      if (
                                        downloadBlobState &&
                                        downloadFileName
                                      ) {
                                        downloadBlob(
                                          downloadBlobState,
                                          downloadFileName,
                                        );
                                      }
                                    }}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Download QTI package
                                  </Button>
                                  <Button
                                    className="sm:min-w-52"
                                    onClick={() =>
                                      void startConvertedAssessment()
                                    }
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Assessment
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  className="mt-4 w-full sm:w-auto sm:min-w-44"
                                  onClick={() => void processFile()}
                                >
                                  Convert file
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-200 ${
                          isDragging
                            ? "border-citolab-500 bg-citolab-50"
                            : "border-dashed border-gray-300 bg-linear-to-br from-gray-50 to-white"
                        } hover:border-citolab-400 hover:bg-gray-100`}
                        onDrop={onDrop}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault();
                          setIsDragging(false);
                        }}
                      >
                        <input
                          id="ai-convert-file"
                          type="file"
                          className="hidden"
                          onChange={onFileChange}
                          accept=".csv,.xlsx,.xls,.docx,.pdf"
                        />
                        <label
                          htmlFor="ai-convert-file"
                          className="flex w-full cursor-pointer flex-col p-8 sm:p-10 lg:p-12"
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <div
                              className={`mb-5 rounded-full bg-citolab-50 p-5 text-citolab-500 ${
                                isDragging ? "animate-pulse" : ""
                              }`}
                            >
                              <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="mb-2 text-2xl font-semibold text-gray-700">
                              {isDragging
                                ? "Drop to convert"
                                : "Select CSV, Excel, DOCX, or PDF file"}
                            </h3>
                            <p className="mb-4 max-w-2xl text-sm text-gray-500">
                              <span className="font-medium">
                                Click to browse
                              </span>{" "}
                              or drag and drop your source file
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                                CSV
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                                XLSX
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                                XLS
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                                DOCX
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                                PDF
                              </span>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">
                              * By uploading you agree to our Terms and
                              Conditions.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {summary ? (
                      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-gray-800">
                            Conversion summary
                          </h3>
                          <Dialog
                            open={summaryDetailsOpen}
                            onOpenChange={setSummaryDetailsOpen}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Show details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Conversion summary details
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                      Total questions
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                      {summary.totalQuestions}
                                    </p>
                                  </div>
                                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                      Generated items
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                      {summary.generatedItems}
                                    </p>
                                  </div>
                                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                      Skipped items
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                      {summary.skippedItems}
                                    </p>
                                  </div>
                                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                                      Warnings
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-amber-950">
                                      {summary.warnings.length}
                                    </p>
                                  </div>
                                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                                      Errors
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-red-950">
                                      {summary.errors.length}
                                    </p>
                                  </div>
                                </div>

                                <section className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    Warnings
                                  </h4>
                                  {renderSummaryIssues(
                                    summary.warnings,
                                    "No warnings were reported.",
                                    "warning",
                                  )}
                                </section>

                                <section className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    Errors
                                  </h4>
                                  {renderSummaryIssues(
                                    summary.errors,
                                    "No errors were reported.",
                                    "error",
                                  )}
                                </section>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Total questions
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {summary.totalQuestions}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Generated items
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {summary.generatedItems}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Skipped items
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {summary.skippedItems}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                              Warnings
                            </p>
                            <p className="mt-1 text-lg font-semibold text-amber-950">
                              {summary.warnings.length}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                              Errors
                            </p>
                            <p className="mt-1 text-lg font-semibold text-red-950">
                              {summary.errors.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {!processComplete ? (
                      <Alert className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-900 text-sm">
                          Performance notice
                        </AlertTitle>
                        <AlertDescription className="text-amber-800 text-xs">
                          Local AI processing may take several minutes for PDF
                          or DOCX files and will use significant CPU and memory
                          resources on your computer.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-5 shadow-sm xl:sticky xl:top-6 lg:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        How local conversion works
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      The converter first tries deterministic parsing. If the
                      source structure is inconsistent, it uses a local WebLLM
                      in the browser to infer question boundaries and map the
                      content into QTI3. Nothing is uploaded to our server.
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      <strong>Tip:</strong> If not all questions are detected,
                      use the Settings button to add extra instructions
                      describing the question format.
                    </p>
                    <div className="mt-5 grid gap-3">
                      {FILE_EXPLANATION_STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                          <div
                            key={step.title}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-citolab-50 p-2">
                                <Icon className="h-4 w-4 text-citolab-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {step.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="text-citolab-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Link import
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Paste a link and the playground will try a best-effort
                    import. Public Google Forms are the main experimental target
                    right now, but there is no guarantee that any pasted link
                    will convert correctly. Any conversion work still happens in
                    the browser, although fetching the source obviously requires
                    requesting the pasted URL.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="google-form-url">Link</Label>
                    <Input
                      id="google-form-url"
                      value={googleFormUrl}
                      onChange={(event) => setGoogleFormUrl(event.target.value)}
                      placeholder="https://docs.google.com/forms/.../viewform"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Public Google Forms `viewform` URLs work best. If you paste
                    an `/edit` URL, the page will try to convert it to
                    `viewform` automatically. This remains experimental and may
                    fail because of CORS, proxy limits, or changes in the source
                    page.
                  </p>
                  {processComplete && convertedPackageFile ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        className="sm:min-w-52"
                        onClick={() => {
                          if (downloadBlobState && downloadFileName) {
                            downloadBlob(downloadBlobState, downloadFileName);
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Download QTI package
                      </Button>
                      <Button
                        className="sm:min-w-52"
                        onClick={() => void startConvertedAssessment()}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button onClick={() => void processGoogleForm()}>
                        Convert URL
                      </Button>
                      <Button variant="outline" onClick={clearSelection}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {processComplete && (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Successfully converted source</AlertTitle>
                  <AlertDescription className="text-sm space-y-1">
                    <p>A QTI3 package has been generated.</p>
                    <p className="font-medium">
                      Download it when you are ready.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-2">
          <Terms />
        </div>
      </div>
    </div>
  );
};
