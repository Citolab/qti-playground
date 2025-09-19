import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { removeDoubleSlashes } from "../lib/utils";

// function to check if the xml is valid
export const isValidXml = (xmlString: string): boolean => {
  try {
    new DOMParser().parseFromString(xmlString, "text/xml");
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculates the relative path from the source file path to the target file path.
 * @param source - The source file path
 * @param target - The target file path
 * @returns The relative path from source to target
 */
export function getRelativePath(source: string, target: string): string {
  // Normalize paths by removing trailing slashes and splitting into segments
  const sourceParts = source.replace(/\/$/, "").split("/");
  const targetParts = target.replace(/\/$/, "").split("/");

  // Remove the filename from source path
  sourceParts.pop();

  // Find common path segments
  let commonParts = 0;
  for (let i = 0; i < Math.min(sourceParts.length, targetParts.length); i++) {
    if (sourceParts[i] === targetParts[i]) {
      commonParts++;
    } else {
      break;
    }
  }

  // Build the relative path
  const upDirs = sourceParts.length - commonParts;
  const remainingTarget = targetParts.slice(commonParts);

  // Create the relative path
  let relativePath = "";

  // Add "../" for each directory we need to go up
  for (let i = 0; i < upDirs; i++) {
    relativePath += "../";
  }

  // Add the remaining target path
  relativePath += remainingTarget.join("/");

  return relativePath;
}

export const qtiConversionFixes = async (qti3: string, itemXmlPath: string) => {
  const transform = qtiTransform(qti3);

  const processPath = (path: string) => {
    const parts = path.split("/");
    const lastPart = parts[parts.length - 1];

    if (lastPart.includes(".")) {
      parts.pop(); // Remove the last part if it contains a dot
    }

    return parts.join("/");
  };

  const makeAbsolutePath = (
    mediaLocation: string,
    relativePath: string,
  ): string => {
    // Browser-compatible path joining
    const joinPaths = (base: string, relative: string): string => {
      // Ensure trailing slash on base
      const normalizedBase = base.endsWith("/") ? base : base + "/";
      // Remove leading slash from relative path if it exists
      const normalizedRelative = relative.startsWith("/")
        ? relative.slice(1)
        : relative;
      return normalizedBase + normalizedRelative;
    };

    // Browser-compatible path normalization
    const normalizePath = (path: string): string => {
      // Split the path into segments
      const segments = path.split("/");
      const resultSegments = [];

      for (const segment of segments) {
        if (segment === "." || segment === "") {
          // Skip '.' and empty segments
          continue;
        } else if (segment === "..") {
          // Go up one level
          if (resultSegments.length > 0) {
            resultSegments.pop();
          }
        } else {
          // Add the segment to the result
          resultSegments.push(segment);
        }
      }

      // Join the segments back together
      return resultSegments.join("/");
    };

    // Combine and normalize the paths
    const combinedPath = joinPaths(mediaLocation, relativePath);
    return normalizePath(combinedPath);
  };
  const transformResult = await transform
    // .stripStylesheets()
    .objectToImg()
    .objectToVideo()
    .objectToAudio()
    .stripMaterialInfo()
    .minChoicesToOne()
    .externalScored()
    .qbCleanup()
    .depConvert()
    .upgradePci()
    .changeAssetLocationAsync(async (srcValue) => {
      if (
        srcValue?.startsWith("http") ||
        srcValue?.startsWith("data") ||
        srcValue.startsWith("//") ||
        !srcValue
      ) {
        return srcValue;
      }
      const assetUrl = "/";
      const pathWithoutFilename = processPath(itemXmlPath);
      if (itemXmlPath) {
        // path is the relative path , the newSrc is relative to this path
        const relative = `${pathWithoutFilename}/${srcValue}`;
        // remove unnecessary ../ like: /items/../img/1.png must be /img/1.png
        srcValue = removeDoubleSlashes(makeAbsolutePath(assetUrl, relative));
      } else {
        srcValue = removeDoubleSlashes(makeAbsolutePath(assetUrl, srcValue));
      }
      return srcValue;
    });
  return transformResult.xml();
};
