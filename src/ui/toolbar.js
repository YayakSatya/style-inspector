/**
 * Floating Toolbar and Active Mode Banner
 */

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
    this.toggleBtn.title = 'Toggle Style Inspector (Alt+Shift+S)';

    this.toggleBtn.innerHTML = `
      <span class="si-toolbar-indicator"></span>
      <span class="si-toolbar-label">Style Inspector</span>
      <span class="si-toolbar-badge" style="display: none;">0</span>
    `;

    this.badge = this.toggleBtn.querySelector('.si-toolbar-badge');

    this.toggleBtn.addEventListener('click', (e) => {
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
        <span class="si-banner-icon">⚡</span>
        <span><strong>Inspect Mode Active:</strong> Hover over an element, click to pin & adjust styles</span>
      </div>
      <div class="si-banner-keys">
        <span><span class="si-key">Esc</span> Exit Mode</span>
        <button class="si-banner-close">✕</button>
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
