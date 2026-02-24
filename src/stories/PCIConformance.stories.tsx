import type { Meta, StoryObj } from '@storybook/react';
import { QTIItemComponent } from './QTIItemComponent';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { loadQTIPackage, type QTIItem } from './qti-utils';

const meta: Meta<typeof QTIItemComponent> = {
  title: 'QTI/PCI Conformance Items',
  component: QTIItemComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Working QTI items from the PCI-Conformance package. These items demonstrate proper QTI 3.0 structure and functioning portable custom interactions.',
      },
    },
  },
  tags: ['autodocs', 'manual'],
  argTypes: {
    debug: {
      control: 'boolean',
      description: 'Show debug information',
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
const QTIItemLoader = ({ itemIndex, debug }: { itemIndex: number; debug?: boolean }) => {
  const [qtiItem, setQtiItem] = useState<QTIItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const package_ = await loadQTIPackage('PCI-Conformance');
        const item = package_.items[itemIndex - 1]; // Convert to 0-based index
        if (item) {
          setQtiItem(item);
        } else {
          setError(`Item ${itemIndex} not found`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemIndex]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading QTI item {itemIndex}...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!qtiItem) {
    return <div style={{ padding: '20px' }}>No item found</div>;
  }

  return (
    <QTIItemComponent
      xml={qtiItem.xml}
      itemPath={qtiItem.path}
      identifier={qtiItem.identifier}
      title={qtiItem.title}
      debug={debug}
    />
  );
};

export const GraphingInteraction1: Story = {
  render: (args) => <QTIItemLoader itemIndex={1} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 1. This item demonstrates a working portable custom interaction for graphing.',
      },
    },
  },
};

export const GraphingInteraction2: Story = {
  render: (args) => <QTIItemLoader itemIndex={2} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 2. Another variation of the graphing interaction.',
      },
    },
  },
};

export const GraphingInteraction3: Story = {
  render: (args) => <QTIItemLoader itemIndex={3} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 3. Third variation of the graphing interaction.',
      },
    },
  },
};

export const GraphingInteraction4: Story = {
  render: (args) => <QTIItemLoader itemIndex={4} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 4. Fourth variation of the graphing interaction.',
      },
    },
  },
};

export const GraphingInteraction5: Story = {
  render: (args) => <QTIItemLoader itemIndex={5} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 5. Fifth variation of the graphing interaction.',
      },
    },
  },
};

export const GraphingInteraction6: Story = {
  render: (args) => <QTIItemLoader itemIndex={6} debug={args.debug} />,
  args: {
    debug: false,
  },
  play: pciRenderPlay,
  parameters: {
    docs: {
      description: {
        story: 'PCI Graphing Interaction - Item 6. Sixth variation of the graphing interaction.',
      },
    },
  },
};

const AllPCIConformanceItemsView = ({ debug }: { debug?: boolean }) => {
  const [items, setItems] = useState<QTIItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllItems = async () => {
      try {
        const package_ = await loadQTIPackage('PCI-Conformance');
        setItems(package_.items);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllItems();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading all PCI-Conformance items...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {items.map((item, index) => (
        <div key={item.identifier} style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '10px' }}>
          <h3>Item {index + 1}</h3>
          <QTIItemComponent
            xml={item.xml}
            itemPath={item.path}
            identifier={item.identifier}
            title={item.title}
            debug={debug}
          />
        </div>
      ))}
    </div>
  );
};

// Story that shows all items in a comparison view
export const AllPCIConformanceItems: Story = {
  render: args => <AllPCIConformanceItemsView debug={args.debug} />,
  args: {
    debug: false,
  },
  play: async ({ canvasElement, step }) => {
    await step('All PCI items render without visible loading errors', async () => {
      await waitFor(() => {
        const text = (canvasElement.textContent || '').toLowerCase();
        expect(text).not.toContain('failed to load items');
        expect(text).not.toContain('error:');
      });
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'All PCI-Conformance items displayed in a grid for comparison. These are working examples of QTI 3.0 items with portable custom interactions.',
      },
    },
  },
};
