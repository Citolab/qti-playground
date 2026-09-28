import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";

export class DepPopup extends LitElement {
  @property({ type: String }) caption = "";
  @property({ type: Number }) width = 400;
  @property({ type: Number }) height = 300;
  @property({ type: String }) resizemode: "fixed" | "auto" = "fixed";
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return false;
        if (value === "" || value === "true") return true;
        if (value === "false") return false;
        return Boolean(value);
      },
    },
  })
  modal = false;
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return true;
        if (value === "" || value === "true") return true;
        if (value === "false") return false;
        return Boolean(value);
      },
    },
  })
  closeonclick = true;
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return true;
        if (value === "" || value === "true") return true;
        if (value === "false") return false;
        return Boolean(value);
      },
    },
  })
  showclosebutton = true;

  @state() private open = false;
  @state() private popupPosition = { top: 0, left: 0 };
  @state() private isDragging = false;
  @state() private dragOffset = { x: 0, y: 0 };

  // Static counter for z-index stacking and offset for multiple popups
  private static zIndexCounter = 10000;
  private static popupOffset = 0;
  private zIndex = 0;

  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .popup-backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
    }

    .popup-positioned {
      position: absolute;
      z-index: 10000;
      transform: translateZ(0);
      will-change: transform;
    }

    .popup-positioner {
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      z-index: 10000;
      pointer-events: none;
    }

    .popup-content {
      background: white;
      padding: 8px;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      position: relative;
      pointer-events: auto;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    }

    .popup-content.draggable {
      cursor: move;
      user-select: none;
    }

    .popup-content.dragging {
      cursor: grabbing;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    /* Make interactive elements inside have normal cursor */
    .popup-content.draggable button,
    .popup-content.draggable a,
    .popup-content.draggable input,
    .popup-content.draggable textarea,
    .popup-content.draggable select {
      cursor: auto;
    }

    .popup-content.auto {
      width: auto;
      height: auto;
      min-width: 200px;
      min-height: 100px;
    }

    .popup-content.fixed {
      /* Width and height will be set via inline styles */
    }

    .close-button {
      position: absolute;
      top: 4px;
      right: 4px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      color: #666;
      z-index: 1;
    }

    .close-button:hover {
      background: #f0f0f0;
      color: #333;
    }

    .caption {
      text-align: center;
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .popup-backdrop.center {
      align-items: center;
      justify-content: center;
    }
  `;

  private togglePopup(e?: Event) {
    if (this.open) {
      this.closePopup();
    } else {
      this.openPopup(e);
    }
  }

  private openPopup(e?: Event) {
    this.zIndex = ++DepPopup.zIndexCounter;

    if (!this.modal && e) {
      this.calculatePopupPosition(e as MouseEvent);
    }

    this.open = true;
    this.preventLayoutShift();

    this.dispatchEvent(
      new CustomEvent("popup-opened", {
        bubbles: true,
        detail: { popup: this },
      })
    );
  }

  private calculatePopupPosition(e: MouseEvent) {
    const triggerRect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const popupWidth = this.resizemode === "fixed" ? this.width : 400;
    const popupHeight = this.resizemode === "fixed" ? this.height : 300;

    let top = triggerRect.bottom + scrollY + 10;
    let left = triggerRect.left + scrollX + 10;

    const offset = DepPopup.popupOffset * 30;
    DepPopup.popupOffset = (DepPopup.popupOffset + 1) % 10;

    top += offset;
    left += offset;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minLeft = scrollX + 10;
    const maxLeft = scrollX + viewportWidth - popupWidth - 10;
    const minTop = scrollY + 10;
    const maxTop = scrollY + viewportHeight - popupHeight - 10;

    if (left > maxLeft) {
      left = triggerRect.left + scrollX - popupWidth - 10;
      if (left < minLeft) left = minLeft;
    }

    if (top > maxTop) {
      top = triggerRect.top + scrollY - popupHeight - 10;
      if (top < minTop) top = minTop;
    }

    this.popupPosition = { top, left };
  }

  private closePopup() {
    this.open = false;
    this.restoreLayoutShift();

    this.dispatchEvent(
      new CustomEvent("popup-closed", {
        bubbles: true,
        detail: { popup: this },
      })
    );
  }

  private handleBackdropClick() {
    if (this.modal && this.closeonclick) {
      this.closePopup();
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && this.open) {
      this.closePopup();
    }
  }

  private startDrag(e: MouseEvent | TouchEvent) {
    if (this.modal) return;

    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.closest("button, a, input, textarea, select")
    ) {
      return;
    }

    e.preventDefault();
    this.isDragging = true;
    this.zIndex = ++DepPopup.zIndexCounter;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    this.dragOffset = {
      x: clientX - this.popupPosition.left,
      y: clientY - this.popupPosition.top,
    };

    const handleMove = (e: MouseEvent | TouchEvent) => this.handleDragMove(e);
    const handleEnd = () => this.endDrag(handleMove, handleEnd);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
  }

  private handleDragMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    e.preventDefault();

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    const newLeft = clientX - this.dragOffset.x;
    const newTop = clientY - this.dragOffset.y;

    const popupWidth = this.resizemode === "fixed" ? this.width : 400;
    const popupHeight = this.resizemode === "fixed" ? this.height : 300;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const minLeft = scrollX + 10;
    const maxLeft = scrollX + window.innerWidth - popupWidth - 10;
    const minTop = scrollY + 10;
    const maxTop = scrollY + window.innerHeight - popupHeight - 10;

    this.popupPosition = {
      left: Math.max(minLeft, Math.min(maxLeft, newLeft)),
      top: Math.max(minTop, Math.min(maxTop, newTop)),
    };
  }

  private endDrag(
    moveHandler: (e: MouseEvent | TouchEvent) => void,
    endHandler: () => void
  ) {
    this.isDragging = false;

    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", endHandler);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", endHandler);
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private preventLayoutShift() {
    if (this.modal) {
      document.body.style.overflow = "hidden";
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
  }

  private restoreLayoutShift() {
    if (this.modal) {
      const otherModalPopups = document.querySelectorAll("dep-popup[modal]");
      const hasOtherOpenModals = Array.from(otherModalPopups).some(
        (popup) => popup !== this && (popup as DepPopup).open
      );

      if (!hasOtherOpenModals) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    }
  }

  override render() {
    return html`
      <div @click=${this.togglePopup}>
        <slot></slot>
      </div>

      ${this.open
        ? this.modal
          ? html`
              <div
                class="popup-backdrop center"
                style="z-index: ${this.zIndex}"
                @click=${this.handleBackdropClick}
              >
                <div
                  class="popup-content ${this.resizemode}"
                  style="${this.resizemode === "fixed"
                    ? `width: ${this.width}px; height: ${this.height}px;`
                    : ""}"
                  @click=${(e: Event) => e.stopPropagation()}
                >
                  ${this.showclosebutton
                    ? html`
                        <button
                          class="close-button"
                          @click=${this.closePopup}
                          aria-label="Close popup"
                        >
                          ×
                        </button>
                      `
                    : ""}
                  ${this.caption
                    ? html`<div class="caption">${this.caption}</div>`
                    : ""}

                  <slot name="popup"></slot>
                </div>
              </div>
            `
          : html`
              <div class="popup-positioner">
                <div
                  class="popup-content popup-positioned ${this
                    .resizemode} ${this.isDragging ? "dragging" : "draggable"}"
                  style="top: ${this.popupPosition.top}px; left: ${this
                    .popupPosition.left}px; z-index: ${this.zIndex}; ${this
                    .resizemode === "fixed"
                    ? `width: ${this.width}px; height: ${this.height}px;`
                    : ""}"
                  @mousedown=${this.startDrag}
                  @touchstart=${this.startDrag}
                >
                  ${this.showclosebutton
                    ? html`
                        <button
                          class="close-button"
                          @click=${this.closePopup}
                          aria-label="Close popup"
                        >
                          ×
                        </button>
                      `
                    : ""}
                  ${this.caption
                    ? html`<div class="caption">${this.caption}</div>`
                    : ""}

                  <slot name="popup"></slot>
                </div>
              </div>
            `
        : null}
    `;
  }
}

customElements.define("dep-popup", DepPopup);
