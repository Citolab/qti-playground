import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, AlertCircle, X, AlertTriangle, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Terms } from "./terms";

export const PackageUploadZone: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [inProgress, setInProgress] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const processPackage = useStore((state) => state.processPackage);

  const isAiConvertibleFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    return (
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".xlsx") ||
      lowerName.endsWith(".xls") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".pdf")
    );
  };

  const extractAiConvertibleFileFromZip = async (
    file: File,
  ): Promise<File | null> => {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file);
    const candidates = Object.values(zip.files).filter((entry) => {
      if (entry.dir) {
        return false;
      }
      const lowerName = entry.name.toLowerCase();
      return (
        lowerName.endsWith(".csv") ||
        lowerName.endsWith(".xlsx") ||
        lowerName.endsWith(".xls") ||
        lowerName.endsWith(".docx") ||
        lowerName.endsWith(".pdf")
      );
    });

    if (candidates.length !== 1) {
      return null;
    }

    const entry = candidates[0];
    const blob = await entry.async("blob");
    const fileName = entry.name.split("/").pop() || entry.name;
    return new File([blob], fileName, { type: blob.type || undefined });
  };

  const handleFileSelected = async (
    file: File | null,
    skipValidation = false,
  ) => {
    if (!file) return;

    setError("");
    setValidationErrors([]);
    setShowValidationDetails(false);

    try {
      const packageFile = file;

      if (!file.name.toLowerCase().endsWith(".zip")) {
        if (!isAiConvertibleFile(file)) {
          setError(
            "This file is not a QTI ZIP package. Supported fallback formats are CSV, XLSX, XLS, DOCX and PDF.",
          );
          return;
        }

        navigate("/ai-convert", {
          state: {
            redirectedFile: file,
            autoStart: true,
            redirectReason: "non-qti-source",
          },
        });
        return;
      } else {
        setInProgress("Processing...");
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const next = prev + Math.random() * 10;
            return next > 90 ? 90 : next;
          });
        }, 300);

        try {
          const result = await processPackage(packageFile, {
            removeStylesheets: false,
            skipValidation,
          });
          clearInterval(progressInterval);
          setUploadProgress(100);
          setInProgress("");

          if (result?.importErrors?.length > 0) {
            setValidationErrors(result.importErrors);
          }
          navigate("/package");
          return;
        } catch (caughtError) {
          clearInterval(progressInterval);
          setInProgress(
            "Package did not look like QTI. Inspecting ZIP for AI-importable source...",
          );
          setUploadProgress(92);

          const extractedSource = await extractAiConvertibleFileFromZip(file);
          if (!extractedSource) {
            throw caughtError;
          }

          navigate("/ai-convert", {
            state: {
              redirectedFile: extractedSource,
              autoStart: true,
              redirectReason: "zip-contained-source",
              originalFileName: file.name,
            },
          });
          return;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred during processing.");
      setInProgress("");
      setUploadProgress(0);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFileSelected(event.dataTransfer?.files[0] ?? null);
  };

  if (inProgress) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
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

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 rounded-xl transition-all duration-200 ${
          isDragging
            ? "border-citolab-500 bg-citolab-50"
            : "border-gray-300 border-dashed bg-gray-50"
        } hover:border-citolab-400 hover:bg-gray-100`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          accept=".zip,.csv,.xlsx,.xls,.docx,.pdf"
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
              {isDragging ? "Drop to upload" : "Select file"}
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              <span className="font-medium">Click to browse</span> or drag and drop your QTI ZIP, CSV, Excel, DOCX or PDF file
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> QTI 2.x auto-converted to QTI 3
              </span>
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Non-QTI source files try AI conversion first
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> 100% local — files never leave your browser
              </span>
            </div>
          </div>
        </label>

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
              onClick={() => setShowValidationDetails((v) => !v)}
            >
              {showValidationDetails ? "Hide Details" : "Show Details"}
            </Button>
            {showValidationDetails && (
              <div className="mt-2 max-h-60 overflow-y-auto px-4 py-2 bg-amber-100 rounded text-sm">
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
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
  );
};
