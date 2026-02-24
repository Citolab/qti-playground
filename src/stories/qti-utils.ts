/**
 * Utility functions for loading QTI data in Storybook stories
 */
import JSZip from 'jszip';
import { putBlobFileInPackageCache, QTI_PKG_URL_PREFIX } from '../app/store/qti-package-cache';

export interface QTIManifest {
  identifier: string;
  resources: Array<{
    identifier: string;
    type: string;
    href: string;
    files?: string[];
  }>;
}

export interface QTIItem {
  identifier: string;
  title?: string;
  xml: string;
  path: string;
  resources?: string[];
}

export interface QTIPackage {
  name: string;
  path: string;
  manifest?: QTIManifest;
  items: QTIItem[];
}

const packageCachePromises = new Map<string, Promise<string>>();

function getStorybookPackageId(packageName: string): string {
  return `storybook-${packageName}`;
}

async function ensurePackageCached(packageName: string): Promise<string> {
  if (packageCachePromises.has(packageName)) {
    return await packageCachePromises.get(packageName)!;
  }

  const promise = (async () => {
    try {
      await navigator.serviceWorker?.ready;
    } catch {
      // Continue; fetch below will surface if SW/package URLs are unavailable.
    }

    const zipUrlCandidates = [
      `/storybook-assets-zips/${packageName}.zip`,
      `/storybook-assets/${packageName}.zip`,
      `/${packageName}.zip`,
    ];

    let zipResponse: Response | null = null;
    let chosenZipUrl = '';
    for (const candidate of zipUrlCandidates) {
      const response = await fetch(candidate);
      if (response.ok) {
        zipResponse = response;
        chosenZipUrl = candidate;
        break;
      }
    }
    if (!zipResponse) {
      throw new Error(
        `Failed to fetch package zip. Tried: ${zipUrlCandidates.join(', ')}`,
      );
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);
    const packageId = getStorybookPackageId(packageName);

    for (const entry of Object.values(zip.files)) {
      if (entry.dir) continue;
      const normalizedPath = entry.name.replace(/^\/+/, '');
      const blob = await entry.async('blob');
      await putBlobFileInPackageCache(packageId, normalizedPath, blob);
    }

    console.info(`Loaded Storybook QTI package zip from ${chosenZipUrl}`);
    return `${QTI_PKG_URL_PREFIX}/${encodeURIComponent(packageId)}`;
  })();

  packageCachePromises.set(packageName, promise);
  return await promise;
}

/**
 * Load QTI package data from the storybook-assets directory
 */
export async function loadQTIPackage(packageName: string): Promise<QTIPackage> {
  const basePath = await ensurePackageCached(packageName);
  
  try {
    // Load manifest
    const manifestResponse = await fetch(`${basePath}/imsmanifest.xml`);
    let manifest: QTIManifest | undefined;
    
    if (manifestResponse.ok) {
      const manifestXml = await manifestResponse.text();
      manifest = parseManifest(manifestXml);
    }
    
    // Load items based on package structure
    const items = await loadItemsFromPackage(basePath, packageName, manifest);
    
    return {
      name: packageName,
      path: basePath,
      manifest,
      items,
    };
  } catch (error) {
    console.error(`Failed to load QTI package ${packageName}:`, error);
    return {
      name: packageName,
      path: basePath,
      items: [],
    };
  }
}

/**
 * Parse QTI manifest XML into a structured object
 */
function parseManifest(manifestXml: string): QTIManifest {
  const parser = new DOMParser();
  const doc = parser.parseFromString(manifestXml, 'text/xml');
  
  const manifest = doc.querySelector('manifest');
  const identifier = manifest?.getAttribute('identifier') || 'unknown';
  
  const resources = Array.from(doc.querySelectorAll('resource')).map(resource => ({
    identifier: resource.getAttribute('identifier') || '',
    type: resource.getAttribute('type') || '',
    href: resource.getAttribute('href') || '',
    files: Array.from(resource.querySelectorAll('file')).map(file => 
      file.getAttribute('href') || ''
    ),
  }));
  
  return { identifier, resources };
}

/**
 * Load items from a QTI package based on its structure
 */
async function loadItemsFromPackage(
  basePath: string, 
  packageName: string, 
  manifest?: QTIManifest
): Promise<QTIItem[]> {
  const items: QTIItem[] = [];
  
  if (packageName === 'PCI-Conformance') {
    // Load items from PCI-Conformance structure (item-1 through item-6)
    for (let i = 1; i <= 6; i++) {
      try {
        const itemPath = `${basePath}/items/item-${i}/qti.xml`;
        const response = await fetch(itemPath);
        if (response.ok) {
          const xml = await response.text();
          const identifier = extractIdentifierFromXml(xml) || `item-${i}`;
          const title = extractTitleFromXml(xml) || `PCI Item ${i}`;
          
          items.push({
            identifier,
            title,
            xml,
            path: itemPath,
            resources: manifest?.resources
              .find(r => r.identifier.includes(`item-${i}`))?.files || [],
          });
        }
      } catch (error) {
        console.warn(`Failed to load item-${i} from PCI-Conformance:`, error);
      }
    }
  } else if (packageName === 'qti3-pci-QtiPci_1.0.0') {
    // Load items from qti3-pci-QtiPci_1.0.0 structure
    try {
      const itemPath = `${basePath}/items/ITM-PCI.xml`;
      const response = await fetch(itemPath);
      if (response.ok) {
        const xml = await response.text();
        const identifier = extractIdentifierFromXml(xml) || 'ITM-PCI';
        const title = extractTitleFromXml(xml) || 'QTI PCI Item';
        
        items.push({
          identifier,
          title,
          xml,
          path: itemPath,
          resources: manifest?.resources
            .find(r => r.identifier === 'RES-ITEM')?.files || [],
        });
      }
    } catch (error) {
      console.warn('Failed to load ITM-PCI from qti3-pci-QtiPci_1.0.0:', error);
    }
  }
  
  return items;
}

/**
 * Extract identifier from QTI XML
 */
function extractIdentifierFromXml(xml: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const assessmentItem = doc.querySelector('qti-assessment-item');
  return assessmentItem?.getAttribute('identifier') || null;
}

/**
 * Extract title from QTI XML
 */
function extractTitleFromXml(xml: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const assessmentItem = doc.querySelector('qti-assessment-item');
  return assessmentItem?.getAttribute('title') || null;
}

/**
 * Available QTI packages in storybook-assets
 */
export const AVAILABLE_PACKAGES = [
  'PCI-Conformance',
  'qti3-pci-QtiPci_1.0.0',
] as const;

export type PackageName = typeof AVAILABLE_PACKAGES[number];
