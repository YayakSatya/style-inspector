/**
 * Floating Toolbar and Active Mode Banner
 */

import { siIcon } from './icons.js';

export class InspectorToolbar {
  /**
   * @param {ShadowRoot} shadowRoot
   * @param {import('../core/state.js').InspectorState} state
   */
  constructor(shadowRoot, state) {
    this.shadowRoot = shadowRoot;
    this.state = state;

    this._createBanner();
    this._createToggle();
    this._bindEvents();
  }

  _createToggle() {
    this.toggleBtn = document.createElement('div');
    this.toggleBtn.className = 'si-toolbar';
    this.toggleBtn.setAttribute('data-testid', 'style_inspector_toolbar_toggle_button');
    this.toggleBtn.title = 'Toggle Style Inspector (Alt+Shift+S | Drag to move)';

    this.toggleBtn.innerHTML = `
      <span class="si-toolbar-indicator"></span>
      <span class="si-toolbar-label">Style Inspector</span>
      <span class="si-toolbar-badge" style="display: none;">0</span>
    `;

    this.badge = this.toggleBtn.querySelector('.si-toolbar-badge');

    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    this.toggleBtn.addEventListener('pointerdown', (e) => {
      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = this.toggleBtn.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      const onPointerMove = (moveEvt) => {
        if (!isDragging) return;
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasDragged = true;
        }

        const maxLeft = Math.max(10, window.innerWidth - this.toggleBtn.offsetWidth - 10);
        const maxTop = Math.max(10, window.innerHeight - this.toggleBtn.offsetHeight - 10);

        const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));

        this.toggleBtn.style.right = 'auto';
        this.toggleBtn.style.bottom = 'auto';
        this.toggleBtn.style.left = `${newLeft}px`;
        this.toggleBtn.style.top = `${newTop}px`;
      };

      const onPointerUp = () => {
        isDragging = false;
        window.removeEventListener('pointermove', onPointerMove, true);
        window.removeEventListener('pointerup', onPointerUp, true);
      };

      window.addEventListener('pointermove', onPointerMove, true);
      window.addEventListener('pointerup', onPointerUp, true);
    });

    this.toggleBtn.addEventListener('click', (e) => {
      if (hasDragged) {
        hasDragged = false;
        return;
      }
      e.stopPropagation();
      this.state.toggleInspecting();
    });

    this.shadowRoot.appendChild(this.toggleBtn);
  }

  _createBanner() {
    this.banner = document.createElement('div');
    this.banner.className = 'si-banner';
    this.banner.style.display = 'none';

    this.banner.innerHTML = `
      <div class="si-banner-left">
        <span class="si-banner-icon">${siIcon('Zap')}</span>
        <span><strong>Inspect Mode Active:</strong> Hover over an element, click to pin & adjust styles</span>
      </div>
      <div class="si-banner-keys">
        <span><span class="si-key">Esc</span> Exit Mode</span>
        <button class="si-banner-close">${siIcon('X')}</button>
      </div>
    `;

    this.banner.querySelector('.si-banner-close').addEventListener('click', () => {
      this.state.stopInspecting();
    });

    this.shadowRoot.appendChild(this.banner);
  }

  _bindEvents() {
    this.state.on('modeChanged', ({ isInspecting }) => {
      if (isInspecting) {
        this.toggleBtn.classList.add('active');
        this.banner.style.display = 'flex';
      } else {
        this.toggleBtn.classList.remove('active');
        this.banner.style.display = 'none';
      }
    });

    this.state.on('stateUpdated', () => {
      const count = this.state.pinnedItems.size;
      if (count > 0) {
        this.badge.style.display = 'inline-block';
        this.badge.textContent = `${count}`;
      } else {
        this.badge.style.display = 'none';
      }
    });
  }
}
