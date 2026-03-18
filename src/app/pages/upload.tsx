import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, AlertCircle, X, AlertTriangle, Play, RefreshCw, Lock } from "lucide-react";
import { forceMemoryCleanup } from "@citolab/qti-convert/qti-helper";
import { Terms } from "../components/terms";
import { ItemPreview } from "../components/item-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [inProgress, setInProgress] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [removeStylesheets, setRemoveStylesheets] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const assessments = useStore((state) => state.assessments);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);
  const processPackage = useStore((state) => state.processPackage);

  const items = useMemo(
    () =>
      itemsPerAssessment?.flatMap((a) =>
        a.items.map((i) => ({ ...i, assessmentId: a.assessmentId }))
      ) || [],
    [itemsPerAssessment]
  );

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files[0] || null;
    await handleFileSelected(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelected = async (
    file: File | null,
    skipValidation = false
  ) => {
    if (file) {
      if (!file.name.endsWith(".zip")) {
        setError("Only .zip files are allowed.");
      } else {
        setError("");
        setInProgress("Processing...");
        setUploadProgress(0);
        setValidationErrors([]);
        setShowValidationDetails(false);

        try {
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const newProgress = prev + Math.random() * 10;
              return newProgress > 90 ? 90 : newProgress;
            });
          }, 300);
          const result = await processPackage(file, {
            removeStylesheets,
            skipValidation,
          });
          clearInterval(progressInterval);
          setUploadProgress(100);

          if (result && result.importErrors && result.importErrors.length > 0) {
            setValidationErrors(result.importErrors);
            setInProgress("");
          } else {
            setInProgress("");
          }
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : "An error occurred during processing."
          );
          setInProgress("");
          setUploadProgress(0);
        }
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    await handleFileSelected(file);
  };

  const toggleValidationDetails = () => {
    setShowValidationDetails(!showValidationDetails);
  };

  if (inProgress) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="w-64 bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <Upload className="h-12 w-12 text-citolab-600" />
          </div>
          <div className="text-lg font-semibold text-citolab-700 text-center mb-4">
            {inProgress}
          </div>
          <Progress value={uploadProgress} className="mt-2" />
          <div className="text-sm text-muted-foreground text-center mt-2">
            {Math.round(uploadProgress)}% complete
          </div>
        </div>
      </div>
    );
  }

  if (assessments.length > 0) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 shadow-sm px-4 py-2.5 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              void (async () => {
                try {
                  const keys = await caches.keys();
                  await Promise.all(
                    keys
                      .filter((k) => k.startsWith("qti-pkg-"))
                      .map((k) => caches.delete(k))
                  );
                } catch {
                  // ignore
                }
              })();
              localStorage.clear();
              forceMemoryCleanup();
              window.location.reload();
            }}
            className="border-citolab-200 text-citolab-700 hover:bg-citolab-50 hover:border-citolab-400"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Select New Package</span>
          </Button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {assessments?.map((assessment) => (
              <Button
                key={assessment.id}
                onClick={() => navigate(`/assessment/${assessment.id}`)}
                title={`Start assessment: ${assessment.name}`}
                className="gap-2 bg-linear-to-r from-citolab-700 to-citolab-teal-700 hover:from-citolab-600 hover:to-citolab-teal-600 text-white border-0 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-[10px] opacity-80 font-normal">
                    Start assessment
                  </span>
                  <span className="text-sm font-semibold leading-none">
                    {assessment.name}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mx-6 mt-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                XML Validation Issues
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleValidationDetails}
                  className="text-amber-700 hover:text-amber-900 h-auto py-0"
                >
                  {showValidationDetails ? "Hide Details" : "Show Details"}
                </Button>
              </AlertTitle>
              <AlertDescription>
                <p>
                  {validationErrors.length === 1
                    ? "1 file contains validation issues"
                    : `${validationErrors.length} files contain validation issues`}
                  . Some content may not display correctly.
                </p>
                {showValidationDetails && (
                  <div className="mt-3 max-h-60 overflow-y-auto px-4 py-2 bg-amber-100 rounded text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-amber-800">
                      {validationErrors.map((err, errIdx) => (
                        <li key={errIdx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item, index) => (
              <ItemPreview
                key={`${item.assessmentId}-${item.identifier}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-linear-to-br from-slate-50 via-citolab-50/20 to-citolab-teal-50/20 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-linear-to-r from-citolab-700 to-citolab-teal-700 text-white p-6">
          <h1 className="text-2xl font-bold">QTI Package Viewer</h1>
          <p className="text-citolab-100 mt-1">
            Preview, convert and display the items in your package
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 text-white rounded-full px-2.5 py-1">
              <RefreshCw className="w-3 h-3" />
              QTI 2.x auto-converted to QTI 3
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 text-white rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" />
              100% local &mdash; files never leave your browser
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div
            className={`relative border-2 rounded-xl transition-all duration-200 ${
              isDragging
                ? "border-citolab-500 bg-citolab-50"
                : "border-gray-300 border-dashed bg-gray-50"
            } hover:border-citolab-400 hover:bg-gray-100`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              className="flex flex-col items-center justify-center w-full p-10 cursor-pointer"
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
                  {isDragging ? "Drop to upload" : "Select QTI Package"}
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  <span className="font-medium">Click to browse</span> or drag and
                  drop your QTI ZIP file
                </p>

                <p className="text-xs text-gray-400">
                  QTI 2x and 3 ZIP files are supported (MAX. 30MB)
                </p>
              </div>
            </label>

            <div className="px-10 pb-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-stylesheets"
                  checked={removeStylesheets}
                  onCheckedChange={(checked) =>
                    setRemoveStylesheets(checked === true)
                  }
                />
                <label
                  htmlFor="remove-stylesheets"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remove stylesheets from package
                </label>
              </div>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>XML Validation Issues</AlertTitle>
              <AlertDescription>
                <p>
                  {validationErrors.length === 1
                    ? "1 file contains validation issues"
                    : `${validationErrors.length} files contain validation issues`}
                  . Click on &apos;Show Details&apos; to see the errors.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-amber-700 hover:text-amber-900 h-auto py-1 px-2"
                  onClick={toggleValidationDetails}
                >
                  {showValidationDetails ? "Hide Details" : "Show Details"}
                </Button>
                {showValidationDetails && (
                  <div className="mt-2 max-h-60 overflow-y-auto px-4 py-2 bg-amber-100 rounded text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-amber-800">
                      {validationErrors.map((err, errIdx) => (
                        <li key={errIdx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => setError("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Terms />
        </div>
      </div>
    </div>
  );
};
