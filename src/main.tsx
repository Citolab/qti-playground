import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import * as ReactDOM from "react-dom/client";
import "@citolab/qti-components";
import "./app/dep-tools-register";

import App from "./app/app";

// qti-components renders PCI iframe content via a `data:text/html,...` URL.
// `data:` iframes have an opaque origin and are not controlled by the Service Worker, so
// `/__qti_pkg__/...` resource requests won't be served from CacheStorage and will 404.
// Patch the element to use `srcdoc` instead, so the iframe inherits our origin and is SW-controlled.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctor: any = window.customElements?.get(
    "qti-portable-custom-interaction",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto: any = ctor?.prototype;
  if (proto && !proto.__qtiPlaygroundPatchedSrcdocIframe) {
    const originalCreateIframe = proto.createIframe;
    const originalConnectedCallback = proto.connectedCallback;

    proto.createIframe = function patchedCreateIframe() {
      try {
        if (typeof originalCreateIframe === "function") {
          originalCreateIframe.call(this);
        }

        if (!this.iframe) return;

        // Keep the iframe same-origin (so SW can serve `/__qti_pkg__/...`) but prevent it from
        // navigating the top window (some PCIs may use links/redirects).
        if (!this.iframe.getAttribute("sandbox")) {
          this.iframe.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin allow-forms",
          );
        }

        const iframeContent =
          typeof this.generateIframeContent === "function"
            ? this.generateIframeContent()
            : "";
        if (iframeContent) {
          this.iframe.srcdoc = iframeContent;
          this.iframe.removeAttribute("src");
        }
      } catch (error) {
        if (typeof originalCreateIframe === "function") {
          return originalCreateIframe.call(this);
        }
        throw error;
      }
    };

    // When multiple PCIs exist on the page (e.g. item grid previews), each host element
    // receives all `window.postMessage` events from all PCI iframes. Filter by message source
    // so each PCI instance only processes messages from its own iframe.
    proto.connectedCallback = function patchedConnectedCallback() {
      try {
        if (this.useIframe && !this.__qtiPlaygroundMessageFilterPatched) {
          const originalHandler = this.handleIframeMessage;

          this.handleIframeMessage = (event: MessageEvent) => {
            try {
              const fromOwnIframe =
                !this.iframe?.contentWindow ||
                event.source === this.iframe.contentWindow;
              if (!fromOwnIframe) return;
            } catch {
              // ignore
            }
            if (typeof originalHandler === "function")
              return originalHandler(event);
          };
          this.__qtiPlaygroundMessageFilterPatched = true;
        }
      } catch {
        // ignore
      }
      if (typeof originalConnectedCallback === "function") {
        return originalConnectedCallback.call(this);
      }
    };
    proto.__qtiPlaygroundPatchedSrcdocIframe = true;
  }
} catch {
  // ignore
}

// Optional debug patch for legacy `qti-custom-interaction` (CES) issues.
// Enable via: `localStorage.__qti_debug_custom_interaction__ = "1"` (then reload).
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctor: any = window.customElements?.get("qti-custom-interaction");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto: any = ctor?.prototype;
  if (proto && !proto.__qtiPlaygroundPatchedCustomInteractionDebug) {
    const originalConnectedCallback = proto.connectedCallback;
    const originalSetupCES = proto.setupCES;

    const isEnabled = () => {
      try {
        return (
          typeof window !== "undefined" &&
          window.localStorage?.getItem("__qti_debug_custom_interaction__") ===
            "1"
        );
      } catch {
        return false;
      }
    };

    const normalizeDoubleSlashes = (value: string) =>
      value
        .replace(/([^:]\/)\/+/g, "$1")
        .replace(/\/\//g, "/")
        .replace("http:/", "http://")
        .replace("https:/", "https://");

    proto.connectedCallback =
      function patchedCustomInteractionConnectedCallback() {
        if (isEnabled()) {
          try {
            const data = (
              this.data ||
              this.getAttribute?.("data") ||
              ""
            ).toString();
            const baseItemUrl = (
              this.baseItemUrl ||
              this.getAttribute?.("data-base-item") ||
              ""
            ).toString();
            const baseRefUrl = (
              this.baseRefUrl ||
              this.getAttribute?.("data-base-ref") ||
              ""
            ).toString();

            const manifestUrl =
              data.startsWith("http") || data.startsWith("blob")
                ? data
                : normalizeDoubleSlashes(`${baseItemUrl}/${data}`);

            console.debug("[custom-interaction]", {
              responseIdentifier: this.getAttribute?.("response-identifier"),
              data,
              baseItemUrl,
              baseRefUrl,
              manifestUrl,
            });
          } catch {
            // ignore
          }
        }
        if (typeof originalConnectedCallback === "function") {
          return originalConnectedCallback.call(this);
        }
      };

    proto.setupCES = function patchedCustomInteractionSetupCES() {
      if (isEnabled()) {
        try {
          const manifest = this.manifest;
          const baseRefUrl = (
            this.baseRefUrl ||
            this.getAttribute?.("data-base-ref") ||
            ""
          ).toString();
          const style0 = manifest?.style?.[0] || "";
          const script0 = manifest?.script?.[0] || "";
          const styleUrl =
            style0.startsWith("http") || style0.startsWith("blob")
              ? style0
              : normalizeDoubleSlashes(`${baseRefUrl}/${style0}`);
          const scriptUrl =
            script0.startsWith("http") || script0.startsWith("blob")
              ? script0
              : normalizeDoubleSlashes(`${baseRefUrl}/${script0}`);

          console.debug("[custom-interaction] manifest", {
            responseIdentifier: this.getAttribute?.("response-identifier"),
            baseRefUrl,
            style0,
            script0,
            styleUrl,
            scriptUrl,
            media: Array.isArray(manifest?.media) ? manifest.media : null,
          });
        } catch {
          // ignore
        }
      }
      if (typeof originalSetupCES === "function") {
        return originalSetupCES.call(this);
      }
    };

    proto.__qtiPlaygroundPatchedCustomInteractionDebug = true;
  }
} catch {
  // ignore
}

if (import.meta.env.DEV) {
  // Optional debugging aid for PCI/RequireJS script loading issues.
  // Enable via: `localStorage.__qti_debug_requirejs__ = "1"` (then reload).
  try {
    const enabled =
      typeof window !== "undefined" &&
      window.localStorage?.getItem("__qti_debug_requirejs__") === "1";
    if (enabled) {
      window.addEventListener(
        "error",
        (event) => {
          const target = (event as ErrorEvent & { target?: unknown }).target;
          if (target instanceof HTMLScriptElement && target.src) {
            if (
              target.src.includes("/__qti_pkg__/") ||
              target.src.includes("/modules/") ||
              target.src.toLowerCase().includes("graph")
            )
              console.error("[RequireJS/PCI] Script load failed:", target.src);
          }
        },
        true,
      );

      const patchRequireJs = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = (window as any).requirejs;
        if (!r || typeof r !== "function") return;

        // Re-wrap if qti-components replaces onError.
        const current = r.onError;
        if (current && current.__qtiWrapped) return;

        const wrapped = (err: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = err as any;
          const src = e?.originalError?.target?.src;
          console.error("[RequireJS/PCI] requirejs.onError", {
            requireType: e?.requireType,
            requireModules: e?.requireModules,
            message: e?.message,
            src,
          });
          if (typeof current === "function") return current(err);
          throw err;
        };
        wrapped.__qtiWrapped = true;
        r.onError = wrapped;
      };

      // Keep patching until RequireJS is present and stays wrapped.
      patchRequireJs();
      window.setInterval(patchRequireJs, 250);
    }
  } catch {
    // ignore
  }

  // Optional debugging aid for PCI layout issues (iframe exists but isn't visible).
  // Enable via: `localStorage.__qti_debug_pci_layout__ = "1"` (then reload).
  try {
    const enabled =
      typeof window !== "undefined" &&
      window.localStorage?.getItem("__qti_debug_pci_layout__") === "1";
    if (enabled) {
      window.setInterval(() => {
        const hosts = Array.from(
          document.querySelectorAll("qti-portable-custom-interaction"),
        );
        for (const host of hosts) {
          (host as HTMLElement).style.outline = "2px dashed #d946ef";
          const iframe = host.querySelector("iframe");
          if (iframe) {
            iframe.style.outline = "2px solid #22c55e";
            const rect = iframe.getBoundingClientRect();
            if (rect.width < 20 || rect.height < 20) {
              console.warn("[PCI layout] iframe has tiny rect", {
                width: rect.width,
                height: rect.height,
                host: host.getAttribute("response-identifier"),
              });
            }
          } else {
            console.warn("[PCI layout] no iframe found for host", {
              host: host.getAttribute("response-identifier"),
              useIframe: host.getAttribute("data-use-iframe"),
            });
          }
        }
      }, 1000);
    }
  } catch {
    // ignore
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // On first install, the page is not controlled until the next navigation.
        // We rely on the SW for `/__qti_pkg__/...` requests, so reload once.
        if (!navigator.serviceWorker.controller) {
          const key = "qti_sw_reloaded_once";
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            window.location.reload();
          }
        }
      })
      .catch((error) =>
        console.error("Service worker registration failed:", error),
      );
  });
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
