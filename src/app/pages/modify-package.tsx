import React, { useState } from "react";
import JSZip from "jszip";
import {
  removeMediaFromPackage,
  removeItemsFromPackage,
} from "@citolab/qti-convert/qti-helper";
import { convertPackage } from "@citolab/qti-convert/qti-convert";
import {
  convertPackageToQti21,
  type Qti21Warning,
} from "@citolab/qti-convert/qti-downgrader";
import {
  convertPackageToDocx,
  convertPackageToPdf,
  loadPackage,
  renderPaperZip,
  type PaperDocumentKind,
  type PaperFormat,
} from "@citolab/qti-convert-export";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle,
  FileDown,
  FileText,
  List,
  PackageCheck,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Terms } from "../components/terms";
import { PageCard, PageShell } from "../components/page-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = "upgrade" | "downgrade" | "media" | "items" | "export";
type ExportFormat = PaperFormat | "both";
type ExportLocale = "en" | "nl";
/** `set` is the booklet / answer sheet / answer key zip, `workbook` the single document. */
type ExportLayout = "set" | "workbook";
type SetDocument = Exclude<PaperDocumentKind, "workbook">;

const setDocumentOptions: { kind: SetDocument; label: string; hint: string }[] = [
  {
    kind: "questions",
    label: "Question booklet",
    hint: "Questions and options only, no answer space — reusable",
  },
  {
    kind: "sources",
    label: "Source texts",
    hint: "Shared texts, numbered; questions refer to them instead of repeating them",
  },
  {
    kind: "answerSheet",
    label: "Answer sheet",
    hint: "Name, class and date, then an answer area per question",
  },
  {
    kind: "answerKey",
    label: "Answer key",
    hint: "The answer sheet filled in, with points, alternatives and rubrics",
  },
];

const noSourcesError =
  "This package has no shared source texts, so there is nothing to export. Select another document.";

const docxMime =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const mimeFor = (format: PaperFormat) =>
  format === "pdf" ? "application/pdf" : docxMime;

// qti-convert-export declares a bare Uint8Array, which TS 5.7+ widens to
// Uint8Array<ArrayBufferLike>; docx/pdf-lib/jszip never hand back a
// SharedArrayBuffer, so narrowing it is safe.
const bytesToBlob = (bytes: Uint8Array, type: string) =>
  new Blob([bytes as Uint8Array<ArrayBuffer>], { type });

const downloadBlob = (blob: Blob, filename: string) => {
  const safe =
    (filename || "download").replace(/[/\\?%*:|"<>]/g, "-").trim() || "download";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", safe);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the blob URL alive briefly so Chromium/Electron can finish the save
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const packageBaseName = (fileName: string) => {
  let base = fileName.replace(/^.*[/\\]/, "");
  for (let i = 0; i < 3; i++) {
    const next = base
      .replace(/\.zip$/i, "")
      .replace(/\.qti\d*$/i, "")
      .replace(/\.(package|pkg)$/i, "");
    if (next === base) break;
    base = next;
  }
  return base.trim() || "assessment";
};

/** Groups identical downgrade warnings across files: message -> files it occurred in. */
const groupWarnings = (warnings: Qti21Warning[]) => {
  const groups = new Map<string, { message: string; files: string[] }>();
  for (const warning of warnings) {
    const group = groups.get(warning.message) ?? { message: warning.message, files: [] };
    if (warning.file && !group.files.includes(warning.file)) group.files.push(warning.file);
    groups.set(warning.message, group);
  }
  return [...groups.values()];
};

async function zipExportBundle(
  paperName: string,
  paperBytes: Uint8Array,
  correctionName: string,
  correctionBytes: Uint8Array,
): Promise<Blob> {
  const zip = new JSZip();
  zip.file(paperName, paperBytes);
  zip.file(correctionName, correctionBytes);
  return zip.generateAsync({ type: "blob" });
}

export const ModifyPackagePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processComplete, setProcessComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("upgrade");
  const [filters, setFilters] = useState({
    video: true,
    audio: true,
    image: false,
    css: false,
    fs500k: false,
  });
  const [itemCount, setItemCount] = useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [removedWebcontent, setRemovedWebcontent] = useState<number>(0);
  const [exportLayout, setExportLayout] = useState<ExportLayout>("set");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("docx");
  const [exportDocuments, setExportDocuments] = useState<SetDocument[]>(
    setDocumentOptions.map((option) => option.kind),
  );
  const [keepSourceOrder, setKeepSourceOrder] = useState(false);
  const [sourcesSkipped, setSourcesSkipped] = useState(false);
  const [exportLocale, setExportLocale] = useState<ExportLocale>("en");
  const [correctionInDocument, setCorrectionInDocument] = useState(false);
  const [correctionSeparate, setCorrectionSeparate] = useState(true);
  const [exportItemCount, setExportItemCount] = useState<number | null>(null);
  const [downgradeWarnings, setDowngradeWarnings] = useState<Qti21Warning[]>([]);

  const validateFile = (file: File | null) => {
    if (!file) return false;

    setError(null);
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Only .zip files are allowed");
      return false;
    }

    return true;
  };

  const analyzeItemsInPackage = async (file: File) => {
    try {
      setInProgress(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);

      let assessmentItemCount = 0;
      for (const relativePath of Object.keys(zip.files)) {
        const zipEntry = zip.files[relativePath];
        const fileType = relativePath.split(".").pop();
        if (fileType !== "xml") continue;

        const content = await zipEntry.async("string");
        if (
          content.includes("qti-assessment-item-ref") ||
          content.includes("assessmentItemRef")
        ) {
          const itemRefMatches = content.match(
            /<(qti-assessment-item-ref|assessmentItemRef)/g,
          );
          if (itemRefMatches) {
            assessmentItemCount = itemRefMatches.length;
            break;
          }
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setItemCount(assessmentItemCount);
      setStartIndex(0);
      setEndIndex(assessmentItemCount > 0 ? assessmentItemCount - 1 : 0);
      setItemsLoaded(true);

      setTimeout(() => {
        setInProgress(false);
      }, 300);
    } catch (caughtError) {
      console.error(caughtError);
      setError("An error occurred analyzing the package");
      setInProgress(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    setProcessComplete(false);
    setItemCount(0);
    setStartIndex(0);
    setEndIndex(0);
    setItemsLoaded(false);
    setRemovedItems([]);
    setRemovedWebcontent(0);
    setExportItemCount(null);
    setDowngradeWarnings([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (validateFile(file) && activeTab === "items" && file) {
      analyzeItemsInPackage(file);
    }
  };

  const processFile = async () => {
    if (!selectedFile || !validateFile(selectedFile)) return;

    try {
      setInProgress(true);
      setUploadProgress(0);
      setProcessComplete(false);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 200);

      let blob: Blob;
      const fileName = selectedFile.name;
      const newName = fileName.substring(0, fileName.lastIndexOf(".")) || "";
      let newZipName = "";

      if (activeTab === "export" && exportLayout === "set") {
        const paper = await loadPackage(selectedFile, { keepSourceOrder });
        const hasSources = paper.stimuli.size > 0;
        // Keep the booklet → sources → sheet → key order regardless of click
        // order. Without shared texts there is no sources document; the
        // library then prints any texts in the booklet itself.
        const documents = setDocumentOptions
          .map((option) => option.kind)
          .filter((kind) => exportDocuments.includes(kind))
          .filter((kind) => kind !== "sources" || hasSources);
        setSourcesSkipped(!hasSources && exportDocuments.includes("sources"));

        if (documents.length === 0) {
          clearInterval(progressInterval);
          setError(noSourcesError);
          setInProgress(false);
          return;
        }

        const result = await renderPaperZip(paper, {
          locale: exportLocale,
          keepSourceOrder,
          fileNameBase: packageBaseName(fileName),
          formats: exportFormat === "both" ? ["docx", "pdf"] : [exportFormat],
          documents,
        });

        setExportItemCount(paper.items.length);

        if (result.files.length === 1) {
          // A zip around a single document is just an extra click
          const [file] = result.files;
          blob = bytesToBlob(file.bytes, mimeFor(file.format));
          newZipName = file.name;
        } else {
          blob = bytesToBlob(result.zip, "application/zip");
          newZipName = result.fileName;
        }
      } else if (activeTab === "export") {
        const format: PaperFormat = exportFormat === "pdf" ? "pdf" : "docx";
        const base = packageBaseName(fileName);
        const paperName = `${base}.${format}`;
        const correctionName = `${base}-correction.${format}`;
        const options = {
          locale: exportLocale,
          keepSourceOrder,
          correctionInDocument,
          correctionSeparate,
          fileNameBase: base,
        };

        const result =
          format === "pdf"
            ? await convertPackageToPdf(selectedFile, options)
            : await convertPackageToDocx(selectedFile, options);

        setExportItemCount(result.paper.items.length);

        if (result.answerKey && correctionSeparate) {
          // One save dialog: question + correction in a single zip
          blob = await zipExportBundle(
            paperName,
            result.assessment,
            correctionName,
            result.answerKey,
          );
          newZipName = `${base}.zip`;
        } else {
          blob = bytesToBlob(result.assessment, mimeFor(format));
          newZipName = paperName;
        }
      } else if (activeTab === "downgrade") {
        const result = await convertPackageToQti21(selectedFile, "blob");
        blob = result.zip;
        setDowngradeWarnings(result.warnings);
        newZipName = `${newName}-qti21.zip`;
      } else if (activeTab === "media") {
        const selectedFilters = Object.keys(filters).filter(
          (key) => filters[key as keyof typeof filters],
        );
        blob = await removeMediaFromPackage(selectedFile, selectedFilters);
        newZipName = `${newName}-stripped.zip`;
      } else if (activeTab === "items") {
        const result = await removeItemsFromPackage(
          selectedFile,
          startIndex,
          endIndex,
        );
        blob = result.package;
        setRemovedItems(result.removedItems);
        setRemovedWebcontent(result.removedResources || 0);
        newZipName = `${newName}-items-${startIndex}-${endIndex}.zip`;
      } else {
        blob = await convertPackage(selectedFile);
        newZipName = `${newName}-qti3.zip`;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      downloadBlob(blob, newZipName);
      setProcessComplete(true);

      setTimeout(() => {
        setInProgress(false);
      }, 500);
    } catch (caughtError) {
      console.error(caughtError);
      setError("An error occurred during processing");
      setInProgress(false);
    }
  };

  return (
    <PageShell
      icon={PackageCheck}
      title="Convert / modify package"
      description="Upgrade to QTI 3, downgrade to QTI 2.1, strip media, pick items, or export to Word / PDF for paper use."
    >
      <PageCard>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const tab = value as TabType;
            setActiveTab(tab);
            setError(null);
            setProcessComplete(false);
            if (tab === "items" && selectedFile && !itemsLoaded) {
              void analyzeItemsInPackage(selectedFile);
            }
          }}
          className="flex flex-col flex-1"
        >
          <div className="border-b border-gray-200 px-2 pt-2">
            <TabsList className="bg-transparent h-auto gap-1 rounded-none p-0 flex-wrap justify-start">
              <TabsTrigger
                value="upgrade"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <ArrowUp size={16} />
                Upgrade QTI2 &gt; QTI3
              </TabsTrigger>
              <TabsTrigger
                value="downgrade"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <ArrowDown size={16} />
                Downgrade QTI3 &gt; QTI2.1
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <Trash2 size={16} />
                Remove Media
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <List size={16} />
                Manage Items
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <FileDown size={16} />
                Export Word / PDF
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {inProgress ? (
              <div className="flex flex-col py-10">
                <div className="w-16 h-16 mb-4 rounded-full bg-citolab-50 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-citolab-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === "media"
                    ? "Processing Media"
                    : activeTab === "items"
                      ? "Processing Items"
                      : activeTab === "export"
                        ? "Exporting document"
                        : activeTab === "downgrade"
                          ? "Converting QTI3 to QTI 2.1"
                          : "Converting QTI2 to QTI3"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {activeTab === "media"
                    ? "Please wait while we remove the selected media files..."
                    : activeTab === "items"
                      ? itemsLoaded
                        ? "Please wait while we process the selected items..."
                        : "Analyzing package to count available items..."
                      : activeTab === "export"
                        ? exportLayout === "set"
                          ? "Building the paper documents from your QTI package..."
                          : `Building a paper-friendly ${exportFormat === "pdf" ? "PDF" : "Word"} document from your QTI package...`
                        : activeTab === "downgrade"
                          ? "Please wait while we convert your QTI3 package to QTI 2.1 format..."
                          : "Please wait while we convert your QTI2 package to QTI3 format..."}
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
                {activeTab === "media" ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Media Filter Options
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Select which media types should be removed from the
                      package:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(
                        [
                          { name: "video", label: "Video Files" },
                          { name: "audio", label: "Audio Files" },
                          { name: "image", label: "Image Files" },
                          { name: "css", label: "CSS Files" },
                          { name: "fs500k", label: "Files > 500KB" },
                        ] as { name: keyof typeof filters; label: string }[]
                      ).map(({ name, label }) => (
                        <label
                          key={name}
                          className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          <Checkbox
                            id={`filter-${name}`}
                            checked={filters[name]}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                [name]: checked === true,
                              }))
                            }
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : activeTab === "items" ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Item Selection Options
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select a range of items to keep in the package (items
                      outside this range will be removed):
                    </p>

                    {itemsLoaded ? (
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-sm text-gray-700 mb-2">
                            This package contains{" "}
                            <span className="font-semibold">{itemCount}</span>{" "}
                            items (indexed from 0 to {itemCount - 1})
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="start-index">Start Index</Label>
                              <Input
                                id="start-index"
                                type="number"
                                value={startIndex}
                                onChange={(event) => {
                                  const value = Number.parseInt(
                                    event.target.value,
                                    10,
                                  );
                                  if (
                                    !Number.isNaN(value) &&
                                    value >= 0 &&
                                    value <= endIndex
                                  ) {
                                    setStartIndex(value);
                                  }
                                }}
                                min={0}
                                max={endIndex}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="end-index">End Index</Label>
                              <Input
                                id="end-index"
                                type="number"
                                value={endIndex}
                                onChange={(event) => {
                                  const value = Number.parseInt(
                                    event.target.value,
                                    10,
                                  );
                                  if (
                                    !Number.isNaN(value) &&
                                    value >= startIndex &&
                                    value < itemCount
                                  ) {
                                    setEndIndex(value);
                                  }
                                }}
                                min={startIndex}
                                max={itemCount - 1}
                              />
                            </div>
                          </div>
                        </div>

                        {processComplete &&
                          (removedItems.length > 0 ||
                            removedWebcontent > 0) && (
                            <Alert variant="success">
                              <CheckCircle className="h-4 w-4" />
                              <AlertTitle>
                                Successfully processed package
                              </AlertTitle>
                              <AlertDescription className="space-y-1 text-sm">
                                <p>
                                  Removed {removedItems.length} assessment items
                                </p>
                                {removedWebcontent > 0 ? (
                                  <p>
                                    Removed {removedWebcontent} unused
                                    media/webcontent resources
                                  </p>
                                ) : null}
                                <p className="font-medium">
                                  New package has been downloaded
                                </p>
                              </AlertDescription>
                            </Alert>
                          )}
                      </div>
                    ) : selectedFile ? (
                      <div className="text-center p-4 bg-citolab-50 rounded">
                        <p className="text-sm text-gray-600">
                          Click "Analyze Package" to count items in the selected
                          file
                        </p>
                        <Button
                          className="mt-3"
                          onClick={() => void analyzeItemsInPackage(selectedFile)}
                        >
                          Analyze Package
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-citolab-50 rounded">
                        <p className="text-sm text-gray-600">
                          Please select a QTI package to begin
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeTab === "export" ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <FileDown className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Export to Word / PDF
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Create paper-friendly documents from a QTI 3 or 2.1
                      package. Every interaction gets a printable layout —
                      graphic items get letters on the image; PCIs are marked
                      digital only.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Documents
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={exportLayout === "set" ? "default" : "outline"}
                            onClick={() => setExportLayout("set")}
                          >
                            Booklet, answer sheet &amp; key
                          </Button>
                          <Button
                            type="button"
                            variant={exportLayout === "workbook" ? "default" : "outline"}
                            onClick={() => {
                              setExportLayout("workbook");
                              if (exportFormat === "both") setExportFormat("docx");
                            }}
                          >
                            Single workbook
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {exportLayout === "set"
                            ? "Separate documents, so the question booklet can be reused."
                            : "One document with the answer space under each question."}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Format
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={exportFormat === "docx" ? "default" : "outline"}
                            onClick={() => setExportFormat("docx")}
                          >
                            Word (.docx)
                          </Button>
                          <Button
                            type="button"
                            variant={exportFormat === "pdf" ? "default" : "outline"}
                            onClick={() => setExportFormat("pdf")}
                          >
                            PDF
                          </Button>
                          {exportLayout === "set" ? (
                            <Button
                              type="button"
                              variant={exportFormat === "both" ? "default" : "outline"}
                              onClick={() => setExportFormat("both")}
                            >
                              Both
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-1 max-w-xs">
                        <Label htmlFor="export-locale">Language</Label>
                        <select
                          id="export-locale"
                          value={exportLocale}
                          onChange={(event) =>
                            setExportLocale(event.target.value as ExportLocale)
                          }
                          className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citolab-600"
                        >
                          <option value="en">English</option>
                          <option value="nl">Nederlands</option>
                        </select>
                        <p className="text-xs text-gray-500">
                          Labels and instructions in the exported document
                          (question content stays as in the package).
                        </p>
                      </div>

                      {exportLayout === "set" ? (
                        <div className="space-y-2">
                          {setDocumentOptions.map((option) => (
                            <label
                              key={option.kind}
                              className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-200 cursor-pointer"
                            >
                              <Checkbox
                                className="mt-0.5"
                                checked={exportDocuments.includes(option.kind)}
                                onCheckedChange={(checked) => {
                                  setExportDocuments((current) =>
                                    checked === true
                                      ? [...current, option.kind]
                                      : current.filter((kind) => kind !== option.kind),
                                  );
                                  // Only this error is about the selection; file errors stay
                                  setError((current) =>
                                    current === noSourcesError ? null : current,
                                  );
                                }}
                              />
                              <span className="text-sm">
                                <span className="text-gray-700">{option.label}</span>
                                <span className="block text-xs text-gray-500">
                                  {option.hint}
                                </span>
                              </span>
                            </label>
                          ))}
                          <p className="text-xs text-gray-500 pl-1">
                            {exportDocuments.length === 0
                              ? "Select at least one document."
                              : exportDocuments.length === 1 && exportFormat !== "both"
                                ? "Downloads a single document."
                                : "Downloads a zip with the selected documents."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 cursor-pointer">
                            <Checkbox
                              checked={correctionInDocument}
                              onCheckedChange={(checked) =>
                                setCorrectionInDocument(checked === true)
                              }
                            />
                            <span className="text-gray-700 text-sm">
                              Correction in question document
                            </span>
                          </label>

                          <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 cursor-pointer">
                            <Checkbox
                              checked={correctionSeparate}
                              onCheckedChange={(checked) =>
                                setCorrectionSeparate(checked === true)
                              }
                            />
                            <span className="text-gray-700 text-sm">
                              Correction in separate document
                            </span>
                          </label>
                          {correctionSeparate ? (
                            <p className="text-xs text-gray-500 pl-1">
                              Downloads a zip with the question sheet and{" "}
                              <code className="text-[11px]">…-correction.docx</code>.
                              {correctionInDocument
                                ? " The question sheet will also include the correction at the end."
                                : ""}
                            </p>
                          ) : correctionInDocument ? (
                            <p className="text-xs text-gray-500 pl-1">
                              Correction is appended at the end of the question
                              document (single file).
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 pl-1">
                              Questions only — no correction sheet.
                            </p>
                          )}
                        </>
                      )}

                      <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 cursor-pointer">
                        <Checkbox
                          checked={keepSourceOrder}
                          onCheckedChange={(checked) =>
                            setKeepSourceOrder(checked === true)
                          }
                        />
                        <span className="text-gray-700 text-sm">
                          Keep source order of shuffled options
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 pl-1">
                        {keepSourceOrder
                          ? "Options print in package order, which often gives the answer away."
                          : "Shuffled interactions get a fixed order on paper; order items never print in their correct order."}
                      </p>

                      {processComplete ? (
                        <Alert variant="success">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Export ready</AlertTitle>
                          <AlertDescription className="text-sm space-y-1">
                            {exportItemCount != null ? (
                              <p>
                                Exported {exportItemCount} items to{" "}
                                {exportFormat === "both"
                                  ? "Word and PDF"
                                  : exportFormat === "pdf"
                                    ? "PDF"
                                    : "Word"}
                                {exportLayout === "set"
                                  ? exportDocuments.length > 1 || exportFormat === "both"
                                    ? " (zip)"
                                    : ""
                                  : correctionSeparate
                                    ? " (zip)"
                                    : correctionInDocument
                                      ? " (with correction)"
                                      : ""}
                              </p>
                            ) : null}
                            {exportLayout === "set" && sourcesSkipped ? (
                              <p>
                                No shared source texts in this package, so no
                                sources document.
                              </p>
                            ) : null}
                            <p className="font-medium">
                              Download has started
                            </p>
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </div>
                  </div>
                ) : activeTab === "downgrade" ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowDown className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        QTI3 to QTI 2.1 Downgrade
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select a QTI3 package to convert it to QTI 2.1, for
                      systems that don't support QTI3 yet. Shared stimuli are
                      copied into the items that use them, and a stylesheet for
                      the QTI 3 shared vocabulary classes (qti-*) is added for
                      the items that use them. Anything QTI 2.1 can't express is
                      converted or removed and listed below.
                    </p>
                    {processComplete ? (
                      <div className="space-y-3">
                        <Alert variant="success">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Successfully converted package</AlertTitle>
                          <AlertDescription className="text-sm space-y-1">
                            <p>
                              Your QTI3 package has been converted to QTI 2.1
                              format
                            </p>
                            <p className="font-medium">
                              New QTI 2.1 package has been downloaded
                            </p>
                          </AlertDescription>
                        </Alert>
                        {downgradeWarnings.length > 0 ? (
                          <Alert variant="warning">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Changes made for QTI 2.1</AlertTitle>
                            <AlertDescription className="text-sm">
                              <ul className="list-disc pl-4 space-y-1 max-h-64 overflow-y-auto">
                                {groupWarnings(downgradeWarnings).map((group) => (
                                  <li key={group.message} title={group.files.join("\n")}>
                                    {group.message}
                                    {group.files.length > 0 ? (
                                      <span className="text-amber-700/80">
                                        {" "}
                                        ({group.files.length === 1
                                          ? group.files[0]
                                          : `${group.files.length} files`})
                                      </span>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowUp className="text-citolab-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        QTI2 to QTI3 Upgrade
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select a QTI2x package to convert it to the QTI3 format.
                    </p>
                    {processComplete ? (
                      <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Successfully converted package</AlertTitle>
                        <AlertDescription className="text-sm space-y-1">
                          <p>
                            Your QTI2 package has been converted to QTI3 format
                          </p>
                          <p className="font-medium">
                            New QTI3 package has been downloaded
                          </p>
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                )}

                {selectedFile ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-citolab-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">
                          Selected File
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

                      {processComplete ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle size={16} className="mr-1" />
                          Complete
                        </span>
                      ) : (
                        <Button
                          onClick={() => void processFile()}
                          disabled={
                            !!error ||
                            (activeTab === "items" && !itemsLoaded) ||
                            (activeTab === "export" &&
                              exportLayout === "set" &&
                              exportDocuments.length === 0)
                          }
                        >
                          {activeTab === "upgrade" || activeTab === "downgrade"
                            ? "Convert Package"
                            : activeTab === "export"
                              ? exportLayout === "set"
                                ? "Export paper documents"
                                : correctionSeparate
                                  ? "Export question + correction"
                                  : exportFormat === "pdf"
                                    ? "Export PDF"
                                    : "Export Word"
                              : "Process File"}
                        </Button>
                      )}
                    </div>

                    {error ? (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className={`relative rounded-xl transition-all duration-200 ${
                      isDragging
                        ? "border-2 border-citolab-500 bg-citolab-50"
                        : "border-2 border-dashed border-gray-300 bg-gray-50"
                    } hover:border-citolab-400 hover:bg-gray-100`}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      const file = event.dataTransfer?.files[0] || null;
                      setSelectedFile(file);
                      if (validateFile(file) && activeTab === "items" && file) {
                        void analyzeItemsInPackage(file);
                      }
                    }}
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
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".zip"
                    />

                    <label
                      htmlFor="dropzone-file"
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
                            ? "Drop to preview"
                            : `Select QTI ${activeTab === "upgrade" ? "2" : activeTab === "downgrade" ? "3" : ""} Package`}
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                          <span className="font-medium">Click to browse</span>{" "}
                          or drag and drop your QTI ZIP file
                        </p>
                        <p className="text-xs text-gray-400">
                          {activeTab === "upgrade"
                            ? "QTI 2.x ZIP files are supported"
                            : activeTab === "downgrade"
                              ? "QTI 3 ZIP files are supported"
                              : activeTab === "export"
                              ? "QTI 3 ZIP packages work best for paper export"
                              : "QTI 2.x and 3 ZIP files are supported"}
                        </p>
                        <p className="text-xs text-gray-400">
                          * By uploading you agree to our Terms and Conditions.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-6 pb-2">
            <Terms />
          </div>
        </Tabs>
      </PageCard>
    </PageShell>
  );
};
