import { qtiTransform } from "@citolab/qti-convert/qti-transformer";
import { convert as convertTaoPci } from "@citolab/qti-convert-tao-pci";
import { removeDoubleSlashes } from "../lib/utils";

/**
 * Leading whitespace and a BOM before the XML declaration.
 *
 * XML forbids anything before `<?xml`, so a blank line in front of it makes the
 * whole document unparseable. It is also one of the most common artefacts of an
 * item that has been through an editor or a copy and paste, and every parser
 * already tolerates the analogous BOM. Stripped rather than rejected, matching
 * what the player does.
 */
const XML_LEADING_NOISE = /^[\s\uFEFF]+/;

export const stripXmlLeadingNoise = (xmlString: string): string =>
  xmlString.replace(XML_LEADING_NOISE, "");

/**
 * The parse error in `xmlString`, or null when it parses.
 *
 * `DOMParser.parseFromString(..., "text/xml")` **never throws**: on a malformed
 * document it returns a *document describing the failure*, whose root is an HTML
 * page reading "This page contains the following errors...". So the try/catch
 * this used to rely on could never fire, every string was "valid", and the
 * broken document travelled the whole preview pipeline -- each stage of which
 * round-trips through DOMParser and happily re-serialises the error page --
 * until the player rendered it as the item.
 */
export const getXmlParseError = (xmlString: string): string | null => {
  const doc = new DOMParser().parseFromString(
    stripXmlLeadingNoise(xmlString),
    "text/xml",
  );
  // Matched by the error document's own namespace rather than by tag name, so an
  // item that legitimately contains a `parsererror` element is not a false
  // positive. Blink and WebKit use the XHTML namespace; Gecko has its own.
  const error =
    doc.getElementsByTagNameNS(
      "http://www.w3.org/1999/xhtml",
      "parsererror",
    )[0] ??
    doc.getElementsByTagNameNS(
      "http://www.mozilla.org/newlayout/xml/parsererror.xml",
      "parsererror",
    )[0];
  if (!error) return null;
  // The error document wraps the one useful sentence -- "error on line N at
  // column M: ..." -- in page boilerplate. Keep the sentence.
  const text = (error.textContent || "").replace(/\s+/g, " ").trim();
  return (
    text
      .replace(/^This page contains the following errors:\s*/i, "")
      .replace(
        /\s*Below is a rendering of the page up to the first error\.?\s*$/i,
        "",
      )
      .trim() || "malformed XML"
  );
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
    .qbCleanup()
    .objectToAudio()
    .objectToVideo()
    .objectToImg()
    .depConvertExtended()
    .minChoicesToOne()
    .mathml()
    .ssmlSubToSpan()
    .hideInputsForChoiceInteractionWithImages()
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
  const taoConverted = await convertTaoPci(
    new Map([
      [
        itemXmlPath || "item.xml",
        { content: transformResult.xml(), type: "item" },
      ],
    ]),
  );
  return String(
    taoConverted.get(itemXmlPath || "item.xml")?.content ||
      transformResult.xml(),
  );
};
