import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Upload, AlertTriangle, Play } from "lucide-react";
import { forceMemoryCleanup } from "@citolab/qti-convert/qti-helper";
import { ItemPreview } from "../components/item-preview";
import { PackageUploadZone } from "../components/package-upload-zone";
import { DownloadPackageButton } from "../components/download-package-button";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { PageCard, PageShell } from "../components/page-shell";
import { ExampleGallery } from "../examples/example-gallery";
import { assessmentTitleOf } from "../qti/assessment-title";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [validationErrors] = useState<string[]>([]);

  const assessments = useStore((state) => state.assessments);
  const itemsPerAssessment = useStore((state) => state.itemsPerAssessment);
  const packageSource = useStore((state) => state.packageSource);

  const items = useMemo(
    () =>
      itemsPerAssessment?.flatMap((a) =>
        a.items.map((i) => ({ ...i, assessmentId: a.assessmentId }))
      ) || [],
    [itemsPerAssessment]
  );

  const packageSummary = `${items.length} ${items.length === 1 ? "item" : "items"} in ${
    assessments.length === 1
      ? assessmentTitleOf(assessments[0])
      : `${assessments.length} tests`
  }`;

  const resetAssessmentProgress = useStore(
    (state) => state.resetAssessmentProgress
  );

  /**
   * Into the player's intro screen, where the layout, mode, theme and device
   * are chosen. Starting is a fresh attempt, so answers and bookmarks from an
   * earlier run are dropped.
   */
  const startAssessment = useCallback(
    (assessmentId: string) => {
      resetAssessmentProgress(assessmentId);
      navigate(`/assessment/${assessmentId}`);
    },
    [navigate, resetAssessmentProgress]
  );

  // An example played or browsed earlier is still in the store, but this page
  // is for the user's own package: with none, it offers the upload.
  if (assessments.length > 0 && packageSource === "upload") {
    return (
      <PageShell
        icon={Play}
        title="Assessment player"
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Items
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {assessments?.map((assessment) => (
                  <Button
                    key={assessment.id}
                    onClick={() => startAssessment(assessment.id)}
                    aria-label={`Start ${assessmentTitleOf(assessment)}`}
                    className="gap-2 font-semibold"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {assessments.length > 1 ? `Start ${assessmentTitleOf(assessment)}` : "Start"}
                  </Button>
                ))}
              </div>
            </div>
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
      icon={Play}
      title="Assessment player"
      description="Play a QTI assessment the way a candidate sees it: as a booklet or one question at a time, with zoom, read-aloud and bookmarks."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Your own package
          </h2>
          <PageCard className="p-6">
            <PackageUploadZone />
          </PageCard>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Or play an example
          </h2>
          <ExampleGallery variant="rows" />
        </section>
      </div>
    </PageShell>
  );
};
