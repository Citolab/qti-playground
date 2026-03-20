import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, Play, AlertTriangle } from "lucide-react";
import { forceMemoryCleanup } from "@citolab/qti-convert/qti-helper";
import { ItemPreview } from "../components/item-preview";
import { PackageUploadZone } from "../components/package-upload-zone";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [validationErrors] = useState<string[]>([]);

  const assessments = useStore((state) => state.assessments);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);

  const items = useMemo(
    () =>
      itemsPerAssessment?.flatMap((a) =>
        a.items.map((i) => ({ ...i, assessmentId: a.assessmentId }))
      ) || [],
    [itemsPerAssessment]
  );

  if (assessments.length > 0) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 shadow-sm px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
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

        <div className="flex-1 overflow-y-auto">
          {validationErrors.length > 0 && (
            <div className="mx-6 mt-4">
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  XML Validation Issues
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValidationDetails((v) => !v)}
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
        </div>
        <div className="p-6">
          <PackageUploadZone />
        </div>
      </div>
    </div>
  );
};
