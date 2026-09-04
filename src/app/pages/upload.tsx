import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, AlertTriangle } from "lucide-react";
import { forceMemoryCleanup } from "@citolab/qti-convert/qti-helper";
import { ItemPreview } from "../components/item-preview";
import { PackageUploadZone } from "../components/package-upload-zone";
import { DownloadPackageButton } from "../components/download-package-button";
import { LayoutModeIcon } from "../components/layout-mode-select";
import {
  AssessmentLayoutMode,
  DEFAULT_LAYOUT_MODE,
  LAYOUT_MODES,
} from "../qti/layout-mode";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

/**
 * Start the test straight into one layout, skipping the intro screen that
 * would otherwise ask the same question again.
 *
 * Icon-only until hovered: two buttons per assessment have to fit a toolbar
 * that already carries the package actions, and the layout icon (a screen
 * against a booklet) is the part worth keeping visible. The label slides open
 * on hover and on keyboard focus, so it is not mouse-only.
 */
function StartLayoutButton({
  mode,
  assessmentName,
  onStart,
}: {
  mode: AssessmentLayoutMode;
  assessmentName: string;
  onStart: (mode: AssessmentLayoutMode) => void;
}) {
  const meta = LAYOUT_MODES.find((layout) => layout.value === mode);
  const label = meta?.label ?? mode;
  const action = `Play ${label.toLowerCase()} mode`;

  return (
    <button
      type="button"
      onClick={() => onStart(mode)}
      title={`${action} – ${meta?.description ?? ""}`}
      aria-label={`${action}: ${assessmentName}`}
      className="group/mode flex h-9 items-center gap-1.5 px-3 text-white transition-colors hover:bg-white/20 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
    >
      <LayoutModeIcon mode={mode} className="w-4 h-4 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-200 group-hover/mode:max-w-32 group-hover/mode:opacity-100 group-focus-visible/mode:max-w-32 group-focus-visible/mode:opacity-100">
        {action}
      </span>
    </button>
  );
}

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

  /**
   * The layout is chosen here, so the player's intro screen has nothing left
   * to ask: `start=1` tells it to open the test straight away.
   */
  const startAssessment = useCallback(
    (assessmentId: string) => (mode: AssessmentLayoutMode) => {
      const params = new URLSearchParams({ start: "1" });
      if (mode !== DEFAULT_LAYOUT_MODE) params.set("layout", mode);
      navigate(`/assessment/${assessmentId}?${params.toString()}`);
    },
    [navigate]
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
            <DownloadPackageButton className="border-citolab-200 text-citolab-700 hover:bg-citolab-50 hover:border-citolab-400" />

            {assessments?.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center divide-x divide-white/25 overflow-hidden rounded-md bg-linear-to-r from-citolab-700 to-citolab-teal-700 shadow-sm"
              >
                {assessments.length > 1 && (
                  <span className="hidden max-w-40 truncate px-3 text-xs font-semibold text-white sm:inline">
                    {assessment.name}
                  </span>
                )}
                {LAYOUT_MODES.map((mode) => (
                  <StartLayoutButton
                    key={mode.value}
                    mode={mode.value}
                    assessmentName={assessment.name}
                    onStart={startAssessment(assessment.id)}
                  />
                ))}
              </div>
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
