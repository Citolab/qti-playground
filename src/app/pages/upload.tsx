import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, AlertTriangle, Package } from "lucide-react";
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
import { PageCard, PageShell } from "../components/page-shell";

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

  const packageSummary = `${items.length} ${items.length === 1 ? "item" : "items"} in ${
    assessments.length === 1
      ? assessments[0].name
      : `${assessments.length} tests`
  }`;

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
      <PageShell
        icon={Package}
        title="Preview package"
        description={packageSummary}
        actions={
          <>
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
            <span className="hidden sm:inline">Select new package</span>
          </Button>
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
          </>
        }
      >
          {validationErrors.length > 0 && (
            <div className="mb-6">
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

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Items
            </h2>
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
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={Package}
      title="Preview package"
      description="Open a QTI package to preview its items, play its tests and download it as QTI 3."
    >
      <PageCard className="p-6">
        <PackageUploadZone />
      </PageCard>
    </PageShell>
  );
};
