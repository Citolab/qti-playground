import React, { useEffect, useState } from "react";
import {
  removeMediaFromPackage,
  removeItemsFromPackage,
} from "@citolab/qti-convert/qti-helper";
import { convertPackage } from "@citolab/qti-convert/qti-convert";
import {
  AlertCircle,
  ArrowUp,
  BookOpen,
  CheckCircle,
  FileText,
  List,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Terms } from "../components/terms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = "upgrade" | "media" | "items";

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

      if (activeTab === "media") {
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
        blob = await convertPackage(
          selectedFile,
          "https://raw.githubusercontent.com/citolab/qti30Upgrader/refs/heads/main/qti2xTo30.sef.json",
        );
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

  useEffect(() => {
    if (itemCount > 0) {
      setEndIndex(itemCount - 1);
    }
  }, [itemCount]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-linear-to-br from-slate-50 via-citolab-50/20 to-citolab-teal-50/20 p-4">
      <div
        className="max-w-3xl w-full bg-white rounded-xl shadow-md overflow-hidden"
        style={{ minHeight: "80vh" }}
      >
        <div className="bg-linear-to-r from-citolab-700 to-citolab-teal-700 text-white p-6">
          <h1 className="text-2xl font-bold">QTI Package Modifier</h1>
          <p className="text-citolab-100 mt-1">
            Upgrade or modify your QTI packages. QTI2x to QTI3, reduce file
            size, or select specific items to keep.
          </p>
        </div>

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
            <TabsList className="bg-transparent h-auto gap-1 rounded-none p-0">
              <TabsTrigger
                value="upgrade"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-citolab-600 data-[state=active]:text-citolab-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-5 py-3 gap-2"
              >
                <ArrowUp size={16} />
                Upgrade QTI2 &gt; QTI3
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
                      : "Converting QTI2 to QTI3"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {activeTab === "media"
                    ? "Please wait while we remove the selected media files..."
                    : activeTab === "items"
                      ? itemsLoaded
                        ? "Please wait while we process the selected items..."
                        : "Analyzing package to count available items..."
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
                          disabled={!!error || (activeTab === "items" && !itemsLoaded)}
                        >
                          {activeTab === "upgrade"
                            ? "Convert Package"
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
                            : `Select QTI ${activeTab === "upgrade" ? "2" : ""} Package`}
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                          <span className="font-medium">Click to browse</span>{" "}
                          or drag and drop your QTI ZIP file
                        </p>
                        <p className="text-xs text-gray-400">
                          {activeTab === "upgrade"
                            ? "QTI 2.x ZIP files are supported"
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
      </div>
    </div>
  );
};
