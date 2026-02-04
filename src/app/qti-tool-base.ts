/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";

export abstract class QtiBaseTool extends LitElement {
  @property({ type: String }) movetoid = "toolbar";
  @property({ type: String }) hostTagName = "test-container";
  @property({ type: String }) description = "Tool";
  @property({ type: Number }) buttonsize = 40;
  @property({ type: String }) triggerbg = "#f59e0b";
  @property({ type: String }) triggerhoverbg = "#d97706";
  @property({ type: String }) triggeractivebg = "#b45309";
  @property({ type: String }) triggercolor = "white";
  @property({ type: String }) highlightbg = "#fef08a";
  @property({ type: String }) removebg = "#e98a8a";
  @property({ type: String }) removehoverbg = "#dc2626";

  @state() protected currentItemIdentifier: string | null = null;

  protected testContainer: HTMLElement | null = null;
  protected qtiTest: HTMLElement | null = null;
  protected qtiAssessmentItem: HTMLElement | null = null;

  private toolWrapper: HTMLElement | null = null;

  protected override createRenderRoot() {
    const toolbar = document.getElementById(this.movetoid);
    if (toolbar) {
      if (!this.toolWrapper || !this.toolWrapper.parentNode) {
        this.toolWrapper = document.createElement("div");
        this.toolWrapper.className = "qti-tool-wrapper";
        this.toolWrapper.style.display = "inline-block";
        toolbar.appendChild(this.toolWrapper);
      }
      return this.toolWrapper;
    }
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setupReferences();
    this.attachEventListeners();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.detachEventListeners();

    if (this.toolWrapper && this.toolWrapper.parentNode) {
      this.toolWrapper.parentNode.removeChild(this.toolWrapper);
      this.toolWrapper = null;
    }
  }

  protected setupReferences() {
    // First, try to find qti-assessment-item by traversing UP from this element
    // This works when the tool is rendered from within the QTI content (e.g., inside qti-companion-materials-info)
    this.qtiAssessmentItem = this.findAncestorAcrossShadowBoundaries(
      "qti-assessment-item",
    ) as HTMLElement | null;

    if (this.qtiAssessmentItem) {
      this.currentItemIdentifier =
        this.qtiAssessmentItem.getAttribute("identifier") || null;
      // Find test-container by going up further
      this.testContainer = this.findAncestorAcrossShadowBoundaries(
        this.hostTagName,
      ) as HTMLElement | null;
      return;
    }

    // Fallback: search DOWN from document (for hardcoded tools outside QTI content)
    this.testContainer = document.querySelector(
      this.hostTagName,
    ) as HTMLElement | null;

    if (this.testContainer) {
      this.qtiTest = this.testContainer.shadowRoot?.querySelector(
        "qti-test",
      ) as HTMLElement | null;

      this.qtiAssessmentItem = this.querySelectorDeep(
        "qti-assessment-item",
        this.testContainer,
      ) as HTMLElement | null;

      if (!this.qtiAssessmentItem) {
        // Also try without shadow root
        this.qtiAssessmentItem = this.querySelectorDeep(
          "qti-assessment-item",
          document,
        ) as HTMLElement | null;
      }

      this.currentItemIdentifier =
        this.qtiAssessmentItem?.getAttribute("identifier") || null;
    }
  }

  protected findAncestorAcrossShadowBoundaries(
    tagName: string,
  ): Element | null {
    const targetTag = tagName.toLowerCase();
    let current: Node | null = this as Node;

    while (current) {
      if (
        current.nodeType === Node.ELEMENT_NODE &&
        (current as Element).tagName.toLowerCase() === targetTag
      ) {
        return current as Element;
      }

      // If we're at a shadow root, jump to the host element
      if (current instanceof ShadowRoot) {
        current = current.host;
        continue;
      }

      // Try parent node first
      if (current.parentNode) {
        current = current.parentNode;
        continue;
      }

      // If no parent, check if we're in a shadow root
      const root = (current as Element).getRootNode?.();
      if (root && root instanceof ShadowRoot) {
        current = root.host;
        continue;
      }

      break;
    }

    return null;
  }

  private attachEventListeners() {
    window.addEventListener("qti-test-loaded", this.handleTestLoaded);
  }

  private detachEventListeners() {
    window.removeEventListener("qti-test-loaded", this.handleTestLoaded);
  }

  private handleTestLoaded = (_event: Event) => {
    this.setupReferences();
    this.onItemFullyLoaded();
  };

  protected onItemFullyLoaded(): void {
    // Subclasses override
  }

  protected getContentRoot(): Element | null {
    return this.qtiAssessmentItem;
  }

  protected getPathFromItemRoot(target: Node): string | null {
    const root = this.getContentRoot();
    if (!root) return null;

    const isContained = (node: Node | null): boolean => {
      while (node) {
        if (node === root) return true;
        const shadowHost = (node as any).host;
        if (shadowHost) node = shadowHost as Node;
        else node = node.parentNode;
      }
      return false;
    };

    if (!isContained(target)) return null;

    const segs: string[] = [];
    let cur: Node | null = target;

    while (cur && cur !== root) {
      const shadowHost: Node | null = (cur as any).host;
      if (shadowHost) {
        cur = shadowHost;
        continue;
      }

      if (cur.nodeType === Node.TEXT_NODE) {
        const parent = cur.parentNode as Element | null;
        if (!parent) break;

        const virtualTexts: Node[] = [];
        parent.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            virtualTexts.push(child);
          } else if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === "mark"
          ) {
            child.childNodes.forEach((markChild) => {
              if (markChild.nodeType === Node.TEXT_NODE) {
                virtualTexts.push(markChild);
              }
            });
          }
        });

        const idx = virtualTexts.indexOf(cur);
        if (idx < 0) return null;

        segs.push(`#text[${idx + 1}]`);
        cur = parent;
      } else if (cur.nodeType === Node.ELEMENT_NODE) {
        const el = cur as Element;
        const parent = el.parentNode as Element | null;
        if (!parent) break;

        const siblings: Element[] = Array.from(parent.children).filter(
          (c) => c.tagName.toLowerCase() !== "mark",
        );

        const sameTag = siblings.filter((c) => c.tagName === el.tagName);
        const idx = sameTag.indexOf(el);
        segs.push(`${el.tagName.toLowerCase()}[${idx + 1}]`);
        cur = parent;
      } else {
        cur = cur.parentNode;
      }
    }

    return "/" + segs.reverse().join("/");
  }

  protected resolvePathFromItemRoot(path: string): Node | null {
    const root = this.getContentRoot();
    if (!root) return null;
    if (!path || !path.startsWith("/")) return null;

    const parts = path.split("/").filter(Boolean);
    let current: Node = root;
    for (const part of parts) {
      if (part.startsWith("#text[")) {
        const match = part.match(/^#text\[(\d+)\]$/);
        if (!match) return null;
        const index = Number(match[1]) - 1;

        const parentEl = current as Element;
        const virtualTexts: Node[] = [];
        parentEl.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            virtualTexts.push(child);
          } else if (
            child.nodeType === Node.ELEMENT_NODE &&
            (child as Element).tagName.toLowerCase() === "mark"
          ) {
            child.childNodes.forEach((markChild) => {
              if (markChild.nodeType === Node.TEXT_NODE) {
                virtualTexts.push(markChild);
              }
            });
          }
        });

        const node = virtualTexts[index];
        if (!node) return null;
        current = node;
        continue;
      }

      const match = part.match(/^([a-zA-Z0-9_-]+)\[(\d+)\]$/);
      if (!match) return null;
      const tag = match[1].toLowerCase();
      const index = Number(match[2]) - 1;

      const parentEl = current as Element;
      const candidates = Array.from(parentEl.children).filter(
        (c) => c.tagName.toLowerCase() === tag,
      );
      const child = candidates[index];
      if (!child) return null;
      current = child;
    }

    return current;
  }

  protected querySelectorDeep(selector: string, root: Element | Document) {
    const traverse = (node: Element | Document): Element | null => {
      const found = node.querySelector(selector);
      if (found) return found as Element;

      const elements = Array.from(node.querySelectorAll("*"));
      for (const el of elements) {
        const shadowRoot = (el as any).shadowRoot as ShadowRoot | undefined;
        if (shadowRoot) {
          const inShadow = traverse(shadowRoot as any);
          if (inShadow) return inShadow;
        }
      }
      return null;
    };

    return traverse(root);
  }
}

