/**
 * Highlight and Pin Overlays
 */

import { getElementLabel, escapeHtml } from '../core/selector.js';
import { parsePx } from '../core/css-value.js';
import { siIcon } from './icons.js';

export class InspectorOverlay {
  /**
   * @param {ShadowRoot} shadowRoot
   * @param {import('../core/state.js').InspectorState} state
   */
  constructor(shadowRoot, state) {
    this.shadowRoot = shadowRoot;
    this.state = state;

    this.container = document.createElement('div');
    this.container.className = 'si-overlay-container';

    // Box-model bands. Both are drawn as a box whose *border* is the band, the
    // way DevTools shades margin and padding, and both are appended before the
    // hover outline so the outline stays on top.
    this.marginBand = document.createElement('div');
    this.marginBand.className = 'si-hover-margin';
    this.marginBand.style.display = 'none';

    this.paddingBand = document.createElement('div');
    this.paddingBand.className = 'si-hover-padding';
    this.paddingBand.style.display = 'none';

    this.container.appendChild(this.marginBand);
    this.container.appendChild(this.paddingBand);

    // Hover box
    this.hoverBox = document.createElement('div');
    this.hoverBox.className = 'si-hover-box';
    this.hoverBox.style.display = 'none';

    this.hoverTag = document.createElement('div');
    this.hoverTag.className = 'si-hover-tag';
    this.hoverBox.appendChild(this.hoverTag);

    this.container.appendChild(this.hoverBox);
    this.shadowRoot.appendChild(this.container);

    // Map of pinned elements to their overlay boxes
    this.pinnedBoxes = new Map(); // id -> HTMLElement

    this._bindEvents();
  }

  _bindEvents() {
    this.state.on('hoverChanged', ({ element }) => this.updateHover(element));
    this.state.on('stateUpdated', () => this.updatePinned());
    this.state.on('modeChanged', ({ isInspecting }) => {
      if (!isInspecting) {
        this._hideHover();
      }
    });

    // Re-position on scroll or resize
    this._onViewportChange = () => this.refresh();
    window.addEventListener('scroll', this._onViewportChange, { passive: true });
    window.addEventListener('resize', this._onViewportChange, { passive: true });
  }

  /**
   * Hides the hover outline and both box-model bands.
   */
  _hideHover() {
    this.hoverBox.style.display = 'none';
    this.marginBand.style.display = 'none';
    this.paddingBand.style.display = 'none';
  }

  /**
   * Draws the margin and padding bands around an element's border box.
   *
   * Each band is a box whose four border widths are the four spacing values, so
   * the shaded area is exactly the space the property occupies — the same
   * representation DevTools uses.
   * @param {Element} element
   * @param {DOMRect} rect
   */
  _updateBands(element, rect) {
    const view = element.ownerDocument && element.ownerDocument.defaultView;
    if (!view) {
      this.marginBand.style.display = 'none';
      this.paddingBand.style.display = 'none';
      return;
    }

    const computed = view.getComputedStyle(element);

    const margin = {
      top: parsePx(computed.marginTop, 0),
      right: parsePx(computed.marginRight, 0),
      bottom: parsePx(computed.marginBottom, 0),
      left: parsePx(computed.marginLeft, 0)
    };

    const padding = {
      top: parsePx(computed.paddingTop, 0),
      right: parsePx(computed.paddingRight, 0),
      bottom: parsePx(computed.paddingBottom, 0),
      left: parsePx(computed.paddingLeft, 0)
    };

    // A negative margin would draw the band inside the element, which reads as
    // padding and misleads. Clamp to zero and simply show nothing there.
    const marginTop = Math.max(0, margin.top);
    const marginRight = Math.max(0, margin.right);
    const marginBottom = Math.max(0, margin.bottom);
    const marginLeft = Math.max(0, margin.left);

    const hasMargin = marginTop || marginRight || marginBottom || marginLeft;
    if (hasMargin) {
      this.marginBand.style.display = 'block';
      this.marginBand.style.top = `${rect.top - marginTop}px`;
      this.marginBand.style.left = `${rect.left - marginLeft}px`;
      this.marginBand.style.width = `${rect.width + marginLeft + marginRight}px`;
      this.marginBand.style.height = `${rect.height + marginTop + marginBottom}px`;
      this.marginBand.style.borderWidth = `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`;
    } else {
      this.marginBand.style.display = 'none';
    }

    const hasPadding = padding.top || padding.right || padding.bottom || padding.left;
    if (hasPadding) {
      this.paddingBand.style.display = 'block';
      this.paddingBand.style.top = `${rect.top}px`;
      this.paddingBand.style.left = `${rect.left}px`;
      this.paddingBand.style.width = `${rect.width}px`;
      this.paddingBand.style.height = `${rect.height}px`;
      this.paddingBand.style.borderWidth = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    } else {
      this.paddingBand.style.display = 'none';
    }
  }

  updateHover(element) {
    if (!element || !this.state.isInspecting) {
      this._hideHover();
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this._hideHover();
      return;
    }

    this._updateBands(element, rect);

    this.hoverBox.style.display = 'block';
    this.hoverBox.style.top = `${rect.top}px`;
    this.hoverBox.style.left = `${rect.left}px`;
    this.hoverBox.style.width = `${rect.width}px`;
    this.hoverBox.style.height = `${rect.height}px`;

    const label = getElementLabel(element);
    this.hoverTag.textContent = label;

    // Reposition tag if near the top edge of viewport
    if (rect.top < 26) {
      this.hoverTag.style.top = '0px';
      this.hoverTag.style.borderRadius = '0 0 3px 3px';
    } else {
      this.hoverTag.style.top = '-24px';
      this.hoverTag.style.borderRadius = '3px 3px 0 0';
    }
  }

  updatePinned() {
    const activeIds = new Set();

    for (const [id, item] of this.state.pinnedItems.entries()) {
      activeIds.add(id);

      let box = this.pinnedBoxes.get(id);
      if (!box) {
        box = document.createElement('div');
        box.className = 'si-pinned-box';

        const tag = document.createElement('div');
        tag.className = 'si-pinned-tag';
        tag.innerHTML = `${siIcon('Pin')}<span>${escapeHtml(item.label)}</span>`;
        box.appendChild(tag);

        this.container.appendChild(box);
        this.pinnedBoxes.set(id, box);
      }

      const rect = item.element.getBoundingClientRect();
      box.style.display = 'block';
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    }

    // Remove any boxes that were unpinned
    for (const [id, box] of this.pinnedBoxes.entries()) {
      if (!activeIds.has(id)) {
        box.remove();
        this.pinnedBoxes.delete(id);
      }
    }
  }

  refresh() {
    if (this.state.hoveredElement) {
      this.updateHover(this.state.hoveredElement);
    }
    this.updatePinned();
  }

  /**
   * Unbinds the window listeners registered in the constructor and removes
   * the overlay container from the shadow root.
   */
  destroy() {
    if (this._onViewportChange) {
      window.removeEventListener('scroll', this._onViewportChange, { passive: true });
      window.removeEventListener('resize', this._onViewportChange, { passive: true });
      this._onViewportChange = null;
    }

    for (const box of this.pinnedBoxes.values()) {
      box.remove();
    }
    this.pinnedBoxes.clear();

    if (this.container) {
      this.container.remove();
    }
  }
}
