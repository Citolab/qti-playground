import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import {
  Upload,
  AlertCircle,
  X,
  AlertTriangle,
  Play,
} from "lucide-react";
import { forceMemoryCleanup } from "@citolab/qti-convert/qti-helper";
import { Terms } from "../components/terms";
import { ItemPreview } from "../components/item-preview";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [inProgress, setInProgress] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [removeStylesheets, setRemoveStylesheets] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Zustand store - use selectors for optimal re-renders
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
          // Simulate progress for better UX
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

          // Check for validation errors
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

  // Rendering states
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
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-citolab-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 text-center mt-2">
            {Math.round(uploadProgress)}% complete
          </div>
        </div>
      </div>
    );
  }

  if (assessments.length > 0) {
    return (
      <div className="h-full w-full overflow-y-auto">
        {/* Top Action Bar */}
        <div className="sticky top-0 bg-white z-10 shadow-sm px-6 py-3 flex items-center justify-between">
          <button
            className="flex items-center px-4 py-2 bg-citolab-600 text-white rounded-lg hover:bg-citolab-700 transition-colors"
            onClick={() => {
              localStorage.clear();
              forceMemoryCleanup();
              window.location.reload();
            }}
          >
            <Upload className="w-5 h-5 mr-2" />
            <span>Select New Package</span>
          </button>

          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-semibold text-gray-600">
              Start an assessment
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {assessments?.map((assessment) => (
                <button
                  key={assessment.id}
                  className="px-4 py-2 rounded-lg bg-citolab-600 text-white hover:bg-citolab-700 transition-colors flex items-center gap-3 shadow-sm"
                  onClick={() => navigate(`/assessment/${assessment.id}`)}
                  title={`Start assessment: ${assessment.name}`}
                  type="button"
                >
                  <Play className="w-4 h-4" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] opacity-90">
                      Start assessment
                    </span>
                    <span className="text-sm font-semibold">
                      {assessment.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Alert for Import Errors */}
        {validationErrors.length > 0 && (
          <div className="mx-6 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                  <h3 className="text-lg font-medium text-amber-800">
                    XML Validation Issues
                  </h3>
                </div>
                <button
                  onClick={toggleValidationDetails}
                  className="text-amber-700 hover:text-amber-900 font-medium"
                >
                  {showValidationDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              <p className="text-amber-700 mt-1">
                {validationErrors.length === 1
                  ? "1 file contains validation issues"
                  : `${validationErrors.length} files contain validation issues`}
                . Some content may not display correctly.
              </p>

              {showValidationDetails && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 bg-amber-100 rounded text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-amber-800">
                      {validationErrors.map((err, errIdx) => (
                        <li key={errIdx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Item Grid */}
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

  // Initial upload state
  return (
    <div className="flex flex-col items-center justify-center w-full py-10 md:px-20">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Preview, convert and display the items in your package
        </h1>
        <p className="text-sm italic text-center mb-4">
          QTI2.x packages will automatically be converted to QTI3.
          <br />
          All processing happens locally in your browser - files are not sent to
          any server.
        </p>
        <div
          className={`
                        relative border-2 rounded-xl transition-all duration-200
                        ${
                          isDragging
                            ? "border-citolab-500 bg-citolab-50"
                            : "border-gray-300 border-dashed bg-gray-50"
                        }
                        hover:border-citolab-400 hover:bg-gray-100
                    `}
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
                className={`
                                p-6 mb-4 rounded-full bg-citolab-50 text-citolab-500
                                ${isDragging ? "animate-pulse" : ""}
                            `}
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
              <p className="text-xs text-gray-400">
                * When uploading you agree to our Terms and Conditions at the
                end of the page.
              </p>
            </div>
          </label>

          {/* Processing options */}
          <div className="px-10 pb-6 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-citolab-600 rounded border-gray-300 focus:ring-citolab-500"
                checked={removeStylesheets}
                onChange={(e) => setRemoveStylesheets(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                Remove stylesheets from package
              </span>
            </label>
          </div>

          {/* Display validation errors for initial state */}
          {validationErrors.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                <h3 className="text-lg font-medium text-amber-800">
                  XML Validation Issues
                </h3>
              </div>

              <p className="text-amber-700 mb-3">
                {validationErrors.length === 1
                  ? "1 file contains validation issues"
                  : `${validationErrors.length} files contain validation issues`}
                . Click on 'Show Details' to see the errors.
              </p>

              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg flex items-center font-medium transition-colors"
                  onClick={toggleValidationDetails}
                >
                  {showValidationDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showValidationDetails && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 bg-amber-100 rounded text-sm">
                    <ul className="list-disc pl-5 space-y-1 text-amber-800">
                      {validationErrors.map((err, errIdx) => (
                        <li key={errIdx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
              <button
                className="ml-auto text-red-700 hover:text-red-900"
                onClick={() => setError("")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <Terms></Terms>
      </div>
    </div>
  );
};
