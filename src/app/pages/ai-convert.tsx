import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    "https://corsproxy.io/?url=",
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

  const processFile = async () => {
    if (!selectedFile || !validateFile(selectedFile)) {
      return;
    }

    try {
      resetResultState();
      setInProgress(true);

      const lowerName = selectedFile.name.toLowerCase();
      const newName =
        selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) ||
        "import";
      const result = lowerName.endsWith(".docx")
        ? await convertDocxToQtiPackage(selectedFile, {
            packageIdentifier: newName || "document-qti3",
            testTitle: newName || "Document Import",
            llmSettings,
            onProgress: updateProgressFromEvent,
          })
        : lowerName.endsWith(".pdf")
          ? await convertPdfToQtiPackage(selectedFile, {
              packageIdentifier: newName || "document-qti3",
              testTitle: newName || "PDF Import",
              llmSettings,
              onProgress: updateProgressFromEvent,
            })
          : await convertSpreadsheetToQtiPackage(selectedFile, {
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
    <div className="flex flex-col items-center min-h-screen bg-linear-to-br from-slate-50 via-citolab-50/20 to-citolab-teal-50/20 p-4">
      <div
        className="max-w-3xl w-full bg-white rounded-xl shadow-md overflow-hidden"
        style={{ minHeight: "80vh" }}
      >
        <div className="bg-linear-to-r from-citolab-700 to-citolab-teal-700 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Convert
              </h1>
              <p className="text-citolab-100 mt-1">
                Best-effort experimental conversion from files or links into
                downloadable QTI3 packages, processed locally in your browser.
              </p>
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
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

        <div className="p-6 space-y-6">
          <Tabs
            value={sourceMode}
            onValueChange={(value) => {
              setSourceMode(value as SourceMode);
              resetResultState();
            }}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md">
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
            <div className="flex flex-col py-10">
              <div className="w-16 h-16 mb-4 rounded-full bg-citolab-50 flex items-center justify-center">
                <WandSparkles className="h-8 w-8 text-citolab-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {sourceMode === "file"
                  ? "Converting source file"
                  : "Importing from link"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {statusMessage ||
                  (sourceMode === "file"
                    ? "Please wait while the source file is analyzed and converted into QTI3."
                    : "Please wait while the Google Form is fetched and converted into QTI3.")}
              </p>
              <Progress
                value={uploadProgress}
                className="w-full max-w-md mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {Math.round(uploadProgress)}% complete
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sourceMode === "file" ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-citolab-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">
                      File import
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload a CSV, Excel, DOCX, or PDF file. The converter knows
                    some common source structures and handles those
                    deterministically. If the uploaded format is unfamiliar or
                    inconsistent, it uses a local WebLLM in the browser to try
                    to understand the structure and make a best-effort
                    conversion to QTI3. Conversion happens locally in your
                    browser and the uploaded content is not sent to a server.
                    This remains experimental and there is no guarantee that the
                    source will be converted correctly.
                  </p>
                  <Alert className="mt-4 border-amber-200 bg-amber-50">
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
                  <p className="mt-3 text-xs text-gray-500">
                    <strong>Tip:</strong> If not all questions are detected, use
                    the Settings button to add extra instructions describing the
                    question format (e.g., how questions are numbered or
                    structured).
                  </p>
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
                  <div className="flex gap-3">
                    <Button onClick={() => void processGoogleForm()}>
                      Convert URL
                    </Button>
                    <Button variant="outline" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {sourceMode === "file" &&
                (selectedFile ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-citolab-50 rounded-full">
                          <FileText className="text-citolab-600" size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <Button onClick={() => void processFile()}>
                        Convert file
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`relative rounded-xl transition-all duration-200 ${
                      isDragging
                        ? "border-2 border-citolab-500 bg-citolab-50"
                        : "border-2 border-dashed border-gray-300 bg-gray-50"
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
                      className="flex flex-col w-full p-10 cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div
                          className={`p-6 mb-4 rounded-full bg-citolab-50 text-citolab-500 ${
                            isDragging ? "animate-pulse" : ""
                          }`}
                        >
                          <Upload className="w-12 h-12" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-700">
                          {isDragging
                            ? "Drop to convert"
                            : "Select CSV, Excel, DOCX, or PDF file"}
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                          <span className="font-medium">Click to browse</span>{" "}
                          or drag and drop your source file
                        </p>
                        <p className="text-xs text-gray-400">
                          CSV, XLSX, XLS, DOCX and PDF files are supported
                        </p>
                        <p className="text-xs text-gray-400">
                          * By uploading you agree to our Terms and Conditions.
                        </p>
                      </div>
                    </label>
                  </div>
                ))}

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

              {processComplete && convertedPackageFile ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      if (downloadBlobState && downloadFileName) {
                        downloadBlob(downloadBlobState, downloadFileName);
                      }
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Download QTI package
                  </Button>
                  <Button onClick={() => void startConvertedAssessment()}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              ) : null}

              {summary && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
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
                          <DialogTitle>Conversion summary details</DialogTitle>
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
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Total questions: {summary.totalQuestions}</p>
                    <p>Generated items: {summary.generatedItems}</p>
                    <p>Skipped items: {summary.skippedItems}</p>
                    <p>Warnings: {summary.warnings.length}</p>
                    <p>Errors: {summary.errors.length}</p>
                  </div>
                </div>
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
