/**
 * Highlight and Pin Overlays
 */

import { getElementLabel } from '../core/selector.js';

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
        this.hoverBox.style.display = 'none';
      }
    });

    // Re-position on scroll or resize
    window.addEventListener('scroll', () => this.refresh(), { passive: true });
    window.addEventListener('resize', () => this.refresh(), { passive: true });
  }

  updateHover(element) {
    if (!element || !this.state.isInspecting) {
      this.hoverBox.style.display = 'none';
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.hoverBox.style.display = 'none';
      return;
    }

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
        tag.innerHTML = `<span>📌</span><span>${item.label}</span>`;
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
}
