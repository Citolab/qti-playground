/* eslint-disable @typescript-eslint/no-explicit-any */
import { html, css } from "lit";
import { state } from "lit/decorators.js";
import { QtiBaseTool } from "./qti-tool-base";

declare global {
  interface CSS {
    highlights: HighlightRegistry;
  }

  interface HighlightRegistry {
    set(name: string, highlight: Highlight): void;
    get(name: string): Highlight | undefined;
    delete(name: string): boolean;
    clear(): void;
  }

  interface Highlight {
    add(range: AbstractRange): void;
    clear(): void;
    delete(range: AbstractRange): boolean;
    forEach(callback: (range: AbstractRange) => void): void;
    has(range: AbstractRange): boolean;
    readonly size: number;
  }
}

interface HighlightRange {
  path: string;
  startOffset: number;
  endOffset: number;
  text: string;
}

export const DEP_TEXT_MARKER_HIGHLIGHT_STYLE_NAME = "dep-text-marker-highlight";
const DEP_TEXT_MARKER_STYLE_ELEMENT_ID = "dep-text-marker-style";

export function getDepTextMarkerStorageScope(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const pathname = window.location.pathname || "";

  let sessionCode = "";
  try {
    const studentStoreKey = `student-assessment-storage-${window.location.hostname}`;
    const persisted = localStorage.getItem(studentStoreKey);
    if (persisted) {
      const parsed = JSON.parse(persisted);
      sessionCode = parsed?.state?.session?.code || "";
    }
  } catch {
    // Ignore - fallback to pathname only
  }

  return encodeURIComponent(`${pathname}|${sessionCode}`);
}

export function buildDepTextMarkerStorageKey(
  itemIdentifier: string,
  scope: string = getDepTextMarkerStorageScope(),
): string {
  return `dep-textmarker-${scope}-${itemIdentifier}`;
}

export function clearDepTextMarkerHighlights(options?: {
  itemIdentifiers?: string[];
  scope?: string;
  includeLegacyKeys?: boolean;
}): void {
  if (typeof window === "undefined") {
    return;
  }

  const scope = options?.scope ?? getDepTextMarkerStorageScope();
  const includeLegacyKeys = options?.includeLegacyKeys ?? true;

  try {
    const itemIdentifiers = options?.itemIdentifiers ?? [];
    for (const identifier of itemIdentifiers) {
      localStorage.removeItem(buildDepTextMarkerStorageKey(identifier, scope));
      if (includeLegacyKeys) {
        localStorage.removeItem(`dep-textmarker-${identifier}`);
      }
    }
  } catch {
    // Ignore storage errors
  }

  try {
    if (CSS.highlights) {
      CSS.highlights.delete(DEP_TEXT_MARKER_HIGHLIGHT_STYLE_NAME);
    }
  } catch {
    // Ignore Highlight API errors
  }

  try {
    document.getElementById(DEP_TEXT_MARKER_STYLE_ELEMENT_ID)?.remove();
  } catch {
    // Ignore DOM errors
  }
}

export class DepTextMarker extends QtiBaseTool {
  @state() private highlightedRanges: HighlightRange[] = [];
  @state() private hasSelection = false;
  @state() private willRemove = false;

  private lastSelectionRange: Range | null = null;

  constructor() {
    super();
    this.description = "Markeren";
    this.triggerbg = "#ffffff";
    this.triggerhoverbg = "#f9fafb";
    this.triggeractivebg = "#f3f4f6";
    this.triggercolor = "#4b5563";
    this.highlightbg = "#fef08a";
  }

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger-button {
      background: var(--trigger-bg, white);
      color: var(--trigger-color, #4b5563);
      border: 1px solid #e5e7eb;
      border-radius: 9999px;
      padding: 8px;
      width: var(--button-size, 40px);
      height: var(--button-size, 40px);
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    .trigger-button:hover {
      background: var(--trigger-hover-bg, #f9fafb) !important;
      border-color: #d1d5db !important;
    }

    .trigger-button:active {
      transform: scale(0.95);
    }

    .trigger-button.remove-mode {
      background: var(--remove-bg, #ffffff) !important;
      color: #111827 !important;
    }

    .trigger-button.remove-mode:hover {
      background: var(--remove-hover-bg, #f9fafb) !important;
      color: #111827 !important;
    }

    .icon {
      font-size: 16px;
      font-weight: bold;
      line-height: 1;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.setupSelectionListeners();
    this.ensureHighlightStyle();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeSelectionListeners();
  }

  protected override onItemFullyLoaded(): void {
    this.restoreHighlights();
    this.applyHighlights();
  }

  private setupSelectionListeners() {
    document.addEventListener("selectionchange", this.handleSelectionChange);
    document.addEventListener("mousedown", this.handleMouseDown);
  }

  private removeSelectionListeners() {
    document.removeEventListener("selectionchange", this.handleSelectionChange);
    document.removeEventListener("mousedown", this.handleMouseDown);
  }

  private handleMouseDown = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (!target) return;

    // If clicking on tool button, ignore
    if (
      target.closest("dep-textmarker") ||
      target.closest("#dep-marker-button")
    ) {
      return;
    }

    // Reset remove mode when clicking anywhere else
    if (this.willRemove) {
      this.willRemove = false;
    }
  };

  private handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.hasSelection = false;
      this.lastSelectionRange = null;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) {
      this.hasSelection = false;
      this.lastSelectionRange = null;
      return;
    }

    // Only allow selections within the current item
    if (!this.qtiAssessmentItem) {
      this.hasSelection = false;
      this.lastSelectionRange = null;
      return;
    }

    const commonAncestor = range.commonAncestorContainer;
    const withinItem = this.isNodeWithinItem(commonAncestor);
    if (!withinItem) {
      this.hasSelection = false;
      this.lastSelectionRange = null;
      return;
    }

    this.hasSelection = true;
    this.lastSelectionRange = range.cloneRange();
  };

  private isNodeWithinItem(node: Node): boolean {
    const root = this.getContentRoot();
    if (!root) return false;

    let current: Node | null = node;
    while (current) {
      if (current === root) return true;

      // Try regular parent traversal first
      const parent: Node | null = current.parentNode;
      if (parent) {
        // If parent is a ShadowRoot, jump to its host
        if (parent instanceof ShadowRoot) {
          current = parent.host;
        } else {
          current = parent;
        }
        continue;
      }

      // No parent - check if we're at a shadow root boundary
      const nodeRoot = current.getRootNode?.();
      if (nodeRoot && nodeRoot instanceof ShadowRoot) {
        current = nodeRoot.host;
        continue;
      }

      break;
    }
    return false;
  }

  private ensureHighlightStyle() {
    if (document.getElementById(DEP_TEXT_MARKER_STYLE_ELEMENT_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = DEP_TEXT_MARKER_STYLE_ELEMENT_ID;
    style.textContent = `
      ::highlight(${DEP_TEXT_MARKER_HIGHLIGHT_STYLE_NAME}) {
        background-color: var(--dep-highlight-bg, ${this.highlightbg});
      }
    `;
    document.head.appendChild(style);
  }

  private getStorageKey(): string | null {
    const itemIdentifier = this.currentItemIdentifier;
    if (!itemIdentifier) return null;
    return buildDepTextMarkerStorageKey(itemIdentifier);
  }

  private saveHighlights() {
    const key = this.getStorageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(this.highlightedRanges));
      // Legacy
      localStorage.setItem(
        `dep-textmarker-${this.currentItemIdentifier}`,
        JSON.stringify(this.highlightedRanges),
      );
    } catch {
      // ignore
    }
  }

  private restoreHighlights() {
    const key = this.getStorageKey();
    if (!key) {
      this.highlightedRanges = [];
      return;
    }

    const tryParse = (value: string | null) => {
      if (!value) return null;
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as HighlightRange[]) : null;
      } catch {
        return null;
      }
    };

    const stored =
      tryParse(localStorage.getItem(key)) ||
      tryParse(localStorage.getItem(`dep-textmarker-${this.currentItemIdentifier}`));

    this.highlightedRanges = stored || [];
  }

  private applyHighlights() {
    try {
      if (!CSS.highlights) {
        return;
      }

      const highlight = new (window as any).Highlight();

      for (const rangeInfo of this.highlightedRanges) {
        const textNode = this.resolvePathFromItemRoot(rangeInfo.path);
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) continue;

        const range = document.createRange();
        range.setStart(textNode, Math.min(rangeInfo.startOffset, textNode.textContent?.length || 0));
        range.setEnd(textNode, Math.min(rangeInfo.endOffset, textNode.textContent?.length || 0));
        highlight.add(range);
      }

      CSS.highlights.set(DEP_TEXT_MARKER_HIGHLIGHT_STYLE_NAME, highlight);
    } catch (e) {
      console.warn("DEP text marker: failed to apply highlights", e);
    }
  }

  private findHighlightAtSelection(range: Range): number | null {
    if (!range || range.collapsed) return null;
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    if (startNode !== endNode || startNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    const path = this.getPathFromItemRoot(startNode);
    if (!path) return null;

    const start = range.startOffset;
    const end = range.endOffset;

    for (let i = 0; i < this.highlightedRanges.length; i++) {
      const r = this.highlightedRanges[i];
      if (r.path === path && start >= r.startOffset && end <= r.endOffset) {
        return i;
      }
    }
    return null;
  }

  private handleClick = () => {
    if (!this.lastSelectionRange || !this.hasSelection) {
      return;
    }

    if (this.willRemove) {
      const idx = this.findHighlightAtSelection(this.lastSelectionRange);
      if (idx !== null) {
        this.highlightedRanges = this.highlightedRanges.filter((_, i) => i !== idx);
        this.saveHighlights();
        this.applyHighlights();
      }
      this.willRemove = false;
      return;
    }

    // Add highlight
    const range = this.lastSelectionRange;
    const startNode = range.startContainer;
    const endNode = range.endContainer;

    // For now, only support single text node selections (keeps path stable)
    if (startNode !== endNode || startNode.nodeType !== Node.TEXT_NODE) {
      this.hasSelection = false;
      return;
    }

    const path = this.getPathFromItemRoot(startNode);
    if (!path) {
      this.hasSelection = false;
      return;
    }

    const text = startNode.textContent || "";
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    this.highlightedRanges = [
      ...this.highlightedRanges,
      { path, startOffset, endOffset, text: text.slice(startOffset, endOffset) },
    ];
    this.saveHighlights();
    this.applyHighlights();

    // Enter remove mode (next click removes)
    this.willRemove = true;
  };

  override render() {
    const styleVars = `
      --trigger-bg: ${this.triggerbg};
      --trigger-hover-bg: ${this.triggerhoverbg};
      --trigger-active-bg: ${this.triggeractivebg};
      --trigger-color: ${this.triggercolor};
      --button-size: ${this.buttonsize}px;
      --dep-highlight-bg: ${this.highlightbg};
      --remove-bg: ${this.removebg};
      --remove-hover-bg: ${this.removehoverbg};
    `;

    const pencilIcon = "✎";
    const removeIcon = "⌫";

    const buttonClass = `trigger-button ${this.willRemove ? "remove-mode" : ""}`;
    const tooltipText = this.willRemove
      ? "Klik op gemarkeerde tekst om markering te verwijderen"
      : "Selecteer tekst en klik om te markeren";

    return html`
      <style>
        ${DepTextMarker.styles}
        :host { ${styleVars} }
      </style>
      <button
        class=${buttonClass}
        id="dep-marker-button"
        @click=${this.handleClick}
        title=${tooltipText}
        aria-label=${tooltipText}
        ?disabled=${!this.hasSelection}
      >
        <span class="icon">${this.willRemove ? removeIcon : pencilIcon}</span>
      </button>
    `;
  }
}

customElements.define("dep-textmarker", DepTextMarker);

