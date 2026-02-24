import type { Preview } from '@storybook/react';
import '../src/styles.css';
import '@citolab/qti-components';

const isVitestStorybookRun =
  Boolean((import.meta as { env?: { VITEST?: string | boolean } }).env?.VITEST) ||
  Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__);

// Keep Storybook behavior aligned with the app runtime:
// - force PCI iframe to use srcdoc (same-origin)
// - register SW so /__qti_pkg__/... requests are served from CacheStorage
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctor: any = window.customElements?.get('qti-portable-custom-interaction');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto: any = ctor?.prototype;
  if (proto && !proto.__qtiStorybookPatchedSrcdocIframe) {
    const originalCreateIframe = proto.createIframe;
    const originalConnectedCallback = proto.connectedCallback;

    proto.createIframe = function patchedCreateIframe() {
      try {
        if (typeof originalCreateIframe === 'function') {
          originalCreateIframe.call(this);
        }
        if (!this.iframe) return;

        if (!this.iframe.getAttribute('sandbox')) {
          this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        }

        const iframeContent =
          typeof this.generateIframeContent === 'function'
            ? this.generateIframeContent()
            : '';
        if (iframeContent) {
          this.iframe.srcdoc = iframeContent;
          this.iframe.removeAttribute('src');
        }
      } catch {
        if (typeof originalCreateIframe === 'function') {
          return originalCreateIframe.call(this);
        }
      }
    };

    // Ensure each PCI instance only reacts to messages from its own iframe.
    proto.connectedCallback = function patchedConnectedCallback() {
      try {
        if (this.useIframe && !this.__qtiStorybookMessageFilterPatched) {
          const originalHandler = this.handleIframeMessage;
          this.handleIframeMessage = (event: MessageEvent) => {
            try {
              const fromOwnIframe =
                !this.iframe?.contentWindow || event.source === this.iframe.contentWindow;
              if (!fromOwnIframe) return;
            } catch {
              // ignore
            }
            if (typeof originalHandler === 'function') return originalHandler(event);
          };
          this.__qtiStorybookMessageFilterPatched = true;
        }
      } catch {
        // ignore
      }
      if (typeof originalConnectedCallback === 'function') {
        return originalConnectedCallback.call(this);
      }
    };

    proto.__qtiStorybookPatchedSrcdocIframe = true;
  }
} catch {
  // ignore
}

if (!isVitestStorybookRun && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      if (!navigator.serviceWorker.controller) {
        const key = 'qti_storybook_sw_reloaded_once';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      }
    })
    .catch(() => {
      // ignore in Storybook if SW registration is unavailable
    });
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
