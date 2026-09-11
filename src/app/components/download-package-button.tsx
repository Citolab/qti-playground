import React, { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useStore } from "../store/store";
import {
  downloadBlob,
  exportPackageAsZip,
  packageDownloadName,
} from "../store/package-export";
import { buildSingleItemPackage } from "../store/single-item-package";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DownloadResult = {
  blob: Blob;
  filename: string;
  /** Shown in place of the title when the download succeeded but is incomplete. */
  warning?: string;
};

type SharedProps = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  label?: string;
  /** Hide the label below the `sm` breakpoint, like the other toolbar buttons. */
  responsiveLabel?: boolean;
  /** Drop the label entirely; the title carries it, for icon-only toolbars. */
  iconOnly?: boolean;
};

/**
 * The button shell both downloads share: build off the main thread of the
 * click, show progress while zipping, and surface a failure on the button
 * itself rather than in a separate alert the user has to dismiss.
 *
 * `build` returns `null` when there is nothing to download for a reason worth
 * telling the user about, and reports it by throwing with that message.
 */
const DownloadButton: React.FC<
  SharedProps & {
    build: () => Promise<DownloadResult>;
    title: string;
    busyLabel?: string;
    disabled?: boolean;
    badgeCount?: number;
  }
> = ({
  build,
  title,
  className,
  variant = "outline",
  size,
  label = "Download QTI 3",
  busyLabel = "Packaging…",
  responsiveLabel = true,
  iconOnly = false,
  disabled = false,
  badgeCount = 0,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleDownload = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setMessage(null);
    try {
      const result = await build();
      downloadBlob(result.blob, result.filename);
      if (result.warning) {
        setMessage({ text: result.warning, isError: false });
      }
    } catch (caught) {
      console.error("Failed to export package:", caught);
      setMessage({
        text:
          caught instanceof Error
            ? caught.message
            : "Could not build the package.",
        isError: true,
      });
    } finally {
      setIsExporting(false);
    }
  }, [build, isExporting]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={disabled || isExporting}
      title={message?.text ?? title}
      aria-label={iconOnly ? title : undefined}
      className={cn(
        message?.isError && "border-destructive text-destructive",
        message && !message.isError && "border-amber-400 text-amber-700",
        className,
      )}
    >
      {isExporting ? (
        <Loader2 className={cn("w-4 h-4 animate-spin", !iconOnly && "sm:mr-2")} />
      ) : (
        <Download className={cn("w-4 h-4", !iconOnly && "sm:mr-2")} />
      )}
      {iconOnly ? (
        <span className="sr-only">{isExporting ? busyLabel : label}</span>
      ) : (
        <span className={responsiveLabel ? "hidden sm:inline" : undefined}>
          {isExporting ? busyLabel : label}
        </span>
      )}
      {badgeCount > 0 && !isExporting ? (
        <span className="ml-1 rounded-full bg-citolab-600 px-1.5 py-px text-[10px] font-semibold leading-none text-white">
          {badgeCount}
        </span>
      ) : null}
    </Button>
  );
};

/**
 * Downloads the package as it currently stands in the Service Worker cache -- QTI 3,
 * including anything the in-place editor has written back to it.
 */
export const DownloadPackageButton: React.FC<SharedProps> = (props) => {
  const packageId = useStore((state) => state.activePackageId);
  const packageFileName = useStore((state) => state.packageFileName);
  const editedItemIdentifiers = useStore(
    (state) => state.editedItemIdentifiers,
  );

  const build = useCallback(async () => {
    if (!packageId) throw new Error("No package is loaded.");
    const blob = await exportPackageAsZip(packageId);
    if (!blob) {
      throw new Error(
        "This package is no longer cached. Re-import it to download.",
      );
    }
    return { blob, filename: packageDownloadName(packageFileName) };
  }, [packageFileName, packageId]);

  if (!packageId) return null;

  const editCount = editedItemIdentifiers.length;

  return (
    <DownloadButton
      {...props}
      build={build}
      badgeCount={editCount}
      title={
        editCount > 0
          ? `Download the QTI 3 package, including ${editCount} edited item${editCount === 1 ? "" : "s"}`
          : "Download this package as QTI 3"
      }
    />
  );
};

/**
 * Downloads the single item the preview page is editing, wrapped in a QTI 3
 * package of its own. Unlike the package download there is no Service Worker
 * cache to zip: the item is whatever is in the source editor right now, and its
 * assets get fetched from wherever the item currently points at them.
 */
export const DownloadItemPackageButton: React.FC<SharedProps> = (props) => {
  const qti3 = useStore((state) => state.qti3);
  const previewItemHref = useStore((state) => state.previewItemHref);

  const build = useCallback(async () => {
    const result = await buildSingleItemPackage(qti3, previewItemHref);
    return {
      blob: result.blob,
      filename: result.filename,
      warning:
        result.skippedAssets.length > 0
          ? `Packaged without ${result.skippedAssets.length} reference(s) that could not be fetched: ${result.skippedAssets.join(", ")}`
          : undefined,
    };
  }, [previewItemHref, qti3]);

  return (
    <DownloadButton
      label="Download package"
      {...props}
      build={build}
      disabled={!qti3}
      title="Download this item as a QTI 3 package"
    />
  );
};
