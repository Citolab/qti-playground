import type { Meta, StoryObj } from '@storybook/react';
import { QTIItemComponent } from './QTIItemComponent';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { loadQTIPackage, type QTIItem } from './qti-utils';

const meta: Meta<typeof QTIItemComponent> = {
  title: 'QTI/QTI3 PCI Items (Problematic)',
  component: QTIItemComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Problematic QTI items from the qti3-pci-QtiPci_1.0.0 package. These items are not working properly and need debugging.',
      },
    },
  },
  tags: ['autodocs', 'manual'],
  argTypes: {
    debug: {
      control: 'boolean',
      description: 'Show debug information to help identify issues',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
const WAIT_FOR_RENDER_OPTIONS = { timeout: 10000, interval: 100 };

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

const pciRenderPlay: Story['play'] = async ({ canvasElement, step }) => {
  await step('PCI host exists', async () => {
    await waitFor(() => {
      const host = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction');
      expect(host).toBeTruthy();
    }, WAIT_FOR_RENDER_OPTIONS);
  });

  await step('PCI iframe renders with non-zero size', async () => {
    await waitFor(() => {
      const iframe = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction iframe') as
        | HTMLIFrameElement
        | null;
      expect(iframe).toBeTruthy();
      const rect = iframe!.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(10);
      expect(rect.height).toBeGreaterThan(10);
    }, WAIT_FOR_RENDER_OPTIONS);
  });

  await step('No visible PCI error message', async () => {
    await waitFor(() => {
      const text = (canvasElement.textContent || '').toLowerCase();
      expect(text).not.toContain('qti processing error');
      expect(text).not.toContain('failed to fetch package zip');
      expect(text).not.toContain('error loading qti package');
      const inlineErrors = queryInOpenShadows(canvasElement, '.qti-error, [role="alert"]');
      expect(inlineErrors).toBeFalsy();
    }, WAIT_FOR_RENDER_OPTIONS);
  });

  await step('PCI message bridge responds to getContent', async () => {
    let host: HTMLElement | null = null;
    let iframe: HTMLIFrameElement | null = null;
    await waitFor(() => {
      host = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction') as HTMLElement | null;
      iframe = queryInOpenShadows(canvasElement, 'qti-portable-custom-interaction iframe') as
        | HTMLIFrameElement
        | null;
      expect(host).toBeTruthy();
      expect(iframe).toBeTruthy();
    }, WAIT_FOR_RENDER_OPTIONS);

    const responseIdentifier = (host as HTMLElement | null)?.getAttribute('response-identifier') || '';
    const messageId = `storybook-get-content-${Date.now()}`;
    const content = await new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        window.removeEventListener('message', onMessage);
        reject(new Error('Timed out waiting for getContentResponse'));
      }, 5000);

      const onMessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data || data.source !== 'qti-pci-iframe') return;
        if (data.method !== 'getContentResponse') return;
        if (data.messageId !== messageId) return;
        if (data.responseIdentifier && data.responseIdentifier !== responseIdentifier) return;
        window.clearTimeout(timeout);
        window.removeEventListener('message', onMessage);
        resolve(typeof data.content === 'string' ? data.content : '');
      };

      window.addEventListener('message', onMessage);
      iframe!.contentWindow?.postMessage(
        {
          source: 'qti-portable-custom-interaction',
          responseIdentifier,
          method: 'getContent',
          params: { messageId },
        },
        '*',
      );
    });

    expect(content.length).toBeGreaterThan(0);
  });
};

// Wrapper component to load QTI data
const QTI3ItemLoader = ({ debug }: { debug?: boolean }) => {
  const [qtiItem, setQtiItem] = useState<QTIItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [packageInfo, setPackageInfo] = useState<any>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const package_ = await loadQTIPackage('qti3-pci-QtiPci_1.0.0');
        setPackageInfo(package_);
        
        if (package_.items.length > 0) {
          setQtiItem(package_.items[0]);
        } else {
          setError('No items found in package');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading QTI3 PCI item...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        {packageInfo && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
            <h4>Package Information:</h4>
            <pre>{JSON.stringify(packageInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!qtiItem) {
    return <div style={{ padding: '20px' }}>No item found</div>;
  }

  return (
    <div>
      <QTIItemComponent
        xml={qtiItem.xml}
        itemPath={qtiItem.path}
        identifier={qtiItem.identifier}
        title={qtiItem.title}
        debug={debug}
      />
      {debug && packageInfo && (
        <details style={{ marginTop: '20px' }}>
          <summary>Package Debug Information</summary>
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            <pre>{JSON.stringify(packageInfo, null, 2)}</pre>
          </div>
        </details>
      )}
    </div>
  );
};

export const PercentagesPCI: Story = {
  render: (args) => <QTI3ItemLoader debug={args.debug} />,
  args: {
    debug: true, // Enable debug by default for problematic items
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'QTI3 PCI Percentages Item - This item is not working properly. Use debug mode to investigate the issues.',
      },
    },
  },
};
