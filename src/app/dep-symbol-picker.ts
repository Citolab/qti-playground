import { html, css } from "lit";
import { property, state } from "lit/decorators.js";
import { QtiBaseTool } from "./qti-tool-base";

export class DepSymbolPicker extends QtiBaseTool {
  @property({ type: String }) symbols = "+€èéëêïöàá§±";
  @property({ type: String }) override description = "";
  @property({ type: Number }) override buttonsize = 40;
  @property({ type: String }) buttoncolor = "#f0f0f0";
  @property({ type: String }) hovercolor = "#e0e0e0";
  @property({ type: String }) textcolor = "#333";

  @state() private isOpen = false;
  @state() private pickerPosition = { top: 0, left: 0 };
  @state() private loadedSymbols = "";
  @state() private loadedDescription = "";
  @state() private activeElement: HTMLInputElement | HTMLTextAreaElement | null =
    null;
  @state() private isDragging = false;
  @state() private hasBeenDragged = false;

  private dragOffset = { x: 0, y: 0 };

  constructor() {
    super();
    this.description = "Symbolen invoegen";
    this.triggerbg = "#6366f1";
    this.triggerhoverbg = "#4f46e5";
    this.triggeractivebg = "#4338ca";
    this.triggercolor = "white";
  }

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger-button {
      background: var(--trigger-bg, #6366f1);
      color: var(--trigger-color, white);
      border: none;
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
    }

    .trigger-button:hover {
      background: var(--trigger-hover-bg, #4f46e5) !important;
    }

    .trigger-button:active {
      transform: scale(0.95);
    }

    .trigger-button.active {
      background: var(--trigger-active-bg, #4338ca) !important;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .icon {
      font-size: 20px;
      font-weight: bold;
      line-height: 1;
    }
  `;

  private getDeepActiveElement(): Element | null {
    let active = document.activeElement;
    while (active && (active as any).shadowRoot && (active as any).shadowRoot.activeElement) {
      active = (active as any).shadowRoot.activeElement;
    }
    return active;
  }

  private togglePicker() {
    if (this.isOpen) {
      this.closePicker();
    } else {
      this.openPicker();
    }
  }

  private openPicker() {
    const active = this.getDeepActiveElement() as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
      this.activeElement = active;
    }

    this.isOpen = true;
    this.renderPickerToBody();

    if (this.activeElement) {
      setTimeout(() => {
        this.activeElement?.focus();
      }, 0);
    }

    this.dispatchEvent(
      new CustomEvent("picker-opened", {
        bubbles: true,
        composed: true,
        detail: { isOpen: true },
      }),
    );
  }

  private closePicker() {
    this.isOpen = false;
    this.removePickerFromBody();
    this.isDragging = false;
    this.hasBeenDragged = false;

    this.dispatchEvent(
      new CustomEvent("picker-closed", {
        bubbles: true,
        composed: true,
        detail: { isOpen: false },
      }),
    );
  }

  private insertSymbol(symbol: string) {
    if (!this.activeElement) {
      return;
    }

    const startPos = this.activeElement.selectionStart || 0;
    const endPos = this.activeElement.selectionEnd || 0;
    const value = this.activeElement.value;

    const newValue = value.slice(0, startPos) + symbol + value.slice(endPos);
    this.activeElement.value = newValue;

    const newPos = startPos + symbol.length;
    this.activeElement.setSelectionRange(newPos, newPos);

    this.activeElement.dispatchEvent(
      new Event("input", { bubbles: true, composed: true }),
    );

    this.activeElement.focus();
  }

  private startDrag(e: MouseEvent) {
    e.preventDefault();
    this.isDragging = true;
    this.hasBeenDragged = true;

    const pickerElement = document.getElementById("dep-symbol-picker-overlay");
    if (!pickerElement) return;

    const rect = pickerElement.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const onMouseMove = (event: MouseEvent) => this.doDrag(event);
    const onMouseUp = () => this.endDrag(onMouseMove, onMouseUp);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  private doDrag(e: MouseEvent) {
    if (!this.isDragging) return;

    const pickerElement = document.getElementById("dep-symbol-picker-overlay");
    if (!pickerElement) return;

    const newLeft = e.clientX - this.dragOffset.x;
    const newTop = e.clientY - this.dragOffset.y;

    pickerElement.style.left = `${newLeft}px`;
    pickerElement.style.top = `${newTop}px`;
    pickerElement.style.transform = "none";

    this.pickerPosition = { top: newTop, left: newLeft };
  }

  private endDrag(
    onMouseMove: (event: MouseEvent) => void,
    onMouseUp: () => void,
  ) {
    this.isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  private renderPickerToBody() {
    const existingPicker = document.getElementById("dep-symbol-picker-overlay");
    if (existingPicker) {
      existingPicker.remove();
    }

    const pickerElement = document.createElement("div");
    pickerElement.id = "dep-symbol-picker-overlay";
    pickerElement.style.position = "fixed";
    pickerElement.style.top = this.hasBeenDragged
      ? `${this.pickerPosition.top}px`
      : "50%";
    pickerElement.style.left = this.hasBeenDragged
      ? `${this.pickerPosition.left}px`
      : "50%";
    pickerElement.style.transform = this.hasBeenDragged
      ? "none"
      : "translate(-50%, -50%)";
    pickerElement.style.zIndex = "9999";

    const symbolsToUse = this.loadedSymbols || this.symbols;
    const descriptionToUse = this.loadedDescription || this.description;

    pickerElement.innerHTML = `
      <div class="picker-backdrop" style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.2);
      "></div>
      <div class="picker-panel" style="
        width: 320px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        border: 1px solid #e5e7eb;
        overflow: hidden;
      ">
        <div class="picker-header" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          cursor: move;
          user-select: none;
        ">
          <div style="font-weight: 600; color:#111827; font-size: 14px;">
            ${descriptionToUse}
          </div>
          <button class="close-button" style="
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1px solid #e5e7eb;
            background: white;
            cursor: pointer;
          " title="Sluiten">×</button>
        </div>
        <div class="symbols-grid" style="
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 8px;
          padding: 12px;
        ">
          ${symbolsToUse
            .split("")
            .map(
              (symbol) => `
              <button class="symbol-button" data-symbol="${symbol}" style="
                height: 34px;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                background: white;
                cursor: pointer;
                font-size: 16px;
              " title="Voeg '${symbol}' toe">${symbol}</button>
            `,
            )
            .join("")}
        </div>
      </div>
    `;

    document.body.appendChild(pickerElement);

    const backdrop = pickerElement.querySelector(".picker-backdrop");
    backdrop?.addEventListener("click", () => this.closePicker());

    const closeButton = pickerElement.querySelector(".close-button");
    closeButton?.addEventListener("click", () => this.closePicker());

    const header = pickerElement.querySelector(".picker-header");
    header?.addEventListener("mousedown", (e) => this.startDrag(e as MouseEvent));

    const symbolButtons = pickerElement.querySelectorAll(".symbol-button");
    symbolButtons.forEach((button) => {
      const symbol = button.getAttribute("data-symbol");
      if (symbol) {
        button.addEventListener("click", () => this.insertSymbol(symbol));
        button.addEventListener("mousedown", (e) => e.preventDefault());
      }
    });

    const panel = pickerElement.querySelector(".picker-panel");
    panel?.addEventListener("click", (e) => e.stopPropagation());
  }

  private removePickerFromBody() {
    const pickerElement = document.getElementById("dep-symbol-picker-overlay");
    if (pickerElement) {
      pickerElement.remove();
    }
  }

  override render() {
    const styleVars = `
      --trigger-bg: ${this.triggerbg};
      --trigger-hover-bg: ${this.triggerhoverbg};
      --trigger-active-bg: ${this.triggeractivebg};
      --trigger-color: ${this.triggercolor};
      --button-size: ${this.buttonsize}px;
    `;

    const buttonClass = `trigger-button ${this.isOpen ? "active" : ""}`;

    return html`
      <style>
        ${DepSymbolPicker.styles}
        :host { ${styleVars} }
      </style>
      <button
        class=${buttonClass}
        id="dep-symbolpicker-button"
        @click=${() => this.togglePicker()}
        title=${this.description}
        aria-label=${this.description}
      >
        <span class="icon">Ω</span>
      </button>
    `;
  }
}

customElements.define("dep-symbolpicker", DepSymbolPicker);

