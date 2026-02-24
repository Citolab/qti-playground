import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { expect, waitFor } from 'storybook/test';
import {
  deletePackageCache,
  makePackageUrl,
  putBlobFileInPackageCache,
  putTextFileInPackageCache,
} from '../app/store/qti-package-cache';
import { QTIItemComponent } from './QTIItemComponent';

const meta: Meta = {
  title: 'QTI/Uploaded Package Cache',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Simulates an uploaded package by storing PCI item files as blobs in CacheStorage and loading through /__qti_pkg__/... URLs.',
      },
    },
  },
  tags: ['autodocs', 'manual'],
};

export default meta;
type Story = StoryObj<typeof meta>;
const WAIT_FOR_RENDER_OPTIONS = { timeout: 10000, interval: 100 };

const PACKAGE_ID = 'storybook-uploaded-pci-conformance';
const ITEM_PATH = 'items/item-1/qti.xml';
const PACKAGE_ZIP_URL_CANDIDATES = [
  '/storybook-assets-zips/PCI-Conformance.zip',
  '/storybook-assets/PCI-Conformance.zip',
  '/PCI-Conformance.zip',
];

function queryInOpenShadows(root: ParentNode, selector: string): Element | null {
  const direct = root.querySelector(selector);
  if (direct) return direct;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let current = walker.nextNode() as Element | null;
  while (current) {
    if ((current as HTMLElement).shadowRoot) {
      const inShadow = queryInOpenShadows((current as HTMLElement).shadowRoot!, selector);
      if (inShadow) return inShadow;
    }
    current = walker.nextNode() as Element | null;
  }
  return null;
}

const UploadedPackageBlobRenderer = () => {
  const [xml, setXml] = useState<string | null>(null);
  const [itemUrl, setItemUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Reset a deterministic package id so each run starts clean.
        await deletePackageCache(PACKAGE_ID);

        try {
          await navigator.serviceWorker?.ready;
        } catch {
          // continue; story still surfaces the failure if /__qti_pkg__ is unreachable
        }

        const getZipBuffer = async (urls: string[]): Promise<ArrayBuffer> => {
          for (const url of urls) {
            const response = await fetch(url);
            if (response.ok) {
              return await response.arrayBuffer();
            }
          }
          throw new Error(`Failed to fetch package zip. Tried: ${urls.join(', ')}`);
        };

        const zipBuffer = await getZipBuffer(PACKAGE_ZIP_URL_CANDIDATES);
        const zip = await JSZip.loadAsync(zipBuffer);

        const fileEntries = Object.values(zip.files).filter((entry) => !entry.dir);
        for (const entry of fileEntries) {
          const path = entry.name.replace(/^\/+/, '');
          const extension = path.split('.').pop()?.toLowerCase() || '';
          if (extension === 'xml' || extension === 'json') {
            const text = await entry.async('text');
            const contentType = extension === 'json' ? 'application/json' : 'application/xml';
            await putTextFileInPackageCache(PACKAGE_ID, path, text, contentType);
            continue;
          }
          const blob = await entry.async('blob');
          await putBlobFileInPackageCache(PACKAGE_ID, path, blob);
        }

        const url = makePackageUrl(PACKAGE_ID, ITEM_PATH);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Cached package URL is not reachable (${response.status}). Check SW registration in Storybook.`,
          );
        }
        const cachedXml = await response.text();

        if (!cancelled) {
          setXml(cachedXml);
          setItemUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to seed uploaded package cache');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Preparing uploaded package cache...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <strong>Upload cache simulation failed:</strong> {error}
      </div>
    );
  }

  if (!xml || !itemUrl) {
    return <div style={{ padding: 20 }}>No cached item available.</div>;
  }

  return (
    <QTIItemComponent
      xml={xml}
      itemPath={itemUrl}
      identifier="pci-graphing-interaction-1"
      title="Uploaded Package PCI Conformance 1"
      debug
    />
  );
};

export const PCIConformanceFromUploadedCache: Story = {
  render: () => <UploadedPackageBlobRenderer />,
  play: async ({ canvasElement, step }) => {
    await step('PCI host exists', async () => {
      await waitFor(() => {
        const pciHost = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction');
        expect(pciHost).toBeTruthy();
      }, WAIT_FOR_RENDER_OPTIONS);
    });

    await step('PCI iframe renders with non-zero size', async () => {
      await waitFor(() => {
        const pciHost = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction');
        expect(pciHost).toBeTruthy();
        const iframe = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction iframe') as
          | HTMLIFrameElement
          | null;
        expect(iframe).toBeTruthy();
        const rect = iframe!.getBoundingClientRect();
        expect(rect.width).toBeGreaterThan(10);
        expect(rect.height).toBeGreaterThan(10);
      }, WAIT_FOR_RENDER_OPTIONS);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          'Stores item XML/CSS/modules in browser CacheStorage as an uploaded package and renders via /__qti_pkg__/... URLs.',
      },
    },
  },
};
