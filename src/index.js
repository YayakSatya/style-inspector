/**
 * Style Inspector — Internal Visual Adjustment Tool
 * Main Entry Point
 */

import { InspectorState } from './core/state.js';
import { inspectorStyles } from './ui/styles.css.js';
import { InspectorOverlay } from './ui/overlay.js';
import { InspectorToolbar } from './ui/toolbar.js';
import { InspectorPanel } from './ui/panel.js';
import { generateMarkdownExport, copyToClipboard } from './core/exporter.js';

export class StyleInspector {
  constructor() {
    if (window.__STYLE_INSPECTOR_INSTANCE__) {
      return window.__STYLE_INSPECTOR_INSTANCE__;
    }

    this.state = new InspectorState();
    this.host = null;
    this.shadowRoot = null;
    this.overlay = null;
    this.toolbar = null;
    this.panel = null;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onClickCapture = this._onClickCapture.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this.init();
    window.__STYLE_INSPECTOR_INSTANCE__ = this;
  }

  init() {
    // 1. Create Host Element and Shadow DOM
    let existingHost = document.getElementById('style-inspector-host');
    if (existingHost) {
      existingHost.remove();
    }

    this.host = document.createElement('div');
    this.host.id = 'style-inspector-host';
    this.host.style.position = 'fixed';
    this.host.style.zIndex = '2147483647';
    this.host.style.top = '0';
    this.host.style.left = '0';
    this.host.style.pointerEvents = 'none';

    this.shadowRoot = this.host.attachShadow({ mode: 'open' });

    // Inject Styles into Shadow Root
    const styleEl = document.createElement('style');
    styleEl.textContent = inspectorStyles;
    this.shadowRoot.appendChild(styleEl);

    // Make interactive children respond to pointer events
    const styleFix = document.createElement('style');
    styleFix.textContent = `
      .si-toolbar, .si-panel, .si-banner, .si-toast {
        pointer-events: auto !important;
      }
    `;
    this.shadowRoot.appendChild(styleFix);

    document.documentElement.appendChild(this.host);

    // 2. Initialize Components
    this.overlay = new InspectorOverlay(this.shadowRoot, this.state);
    this.toolbar = new InspectorToolbar(this.shadowRoot, this.state);
    this.panel = new InspectorPanel(this.shadowRoot, this.state);

    // 3. Attach Global Event Listeners
    window.addEventListener('pointermove', this._onPointerMove, true);
    window.addEventListener('click', this._onClickCapture, true);
    window.addEventListener('keydown', this._onKeyDown, true);

    console.log(
      '%c[Style Inspector]%c Activated! Press %cAlt+Shift+S%c or click the floating badge to inspect.',
      'color: #818cf8; font-weight: bold;',
      'color: inherit;',
      'background: #1e1b4b; color: #a5b4fc; padding: 2px 4px; border-radius: 3px;',
      'color: inherit;'
    );
  }

  _isInsideInspector(element) {
    if (!element) return false;
    if (element === this.host) return true;
    if (this.host.contains(element)) return true;
    if (element.shadowRoot === this.shadowRoot) return true;

    // Check composed path
    const root = element.getRootNode ? element.getRootNode() : null;
    return root === this.shadowRoot;
  }

  _onPointerMove(e) {
    if (!this.state.isInspecting) return;

    const path = e.composedPath ? e.composedPath() : [];
    if (path.some(el => this._isInsideInspector(el))) {
      this.state.setHoveredElement(null);
      return;
    }

    const target = e.target;
    if (!target || target === document.body || target === document.documentElement) {
      this.state.setHoveredElement(null);
      return;
    }

    this.state.setHoveredElement(target);
  }

  _onClickCapture(e) {
    if (!this.state.isInspecting) return;

    const path = e.composedPath ? e.composedPath() : [];
    if (path.some(el => this._isInsideInspector(el))) {
      // Clicked inside inspector UI controls — let it proceed naturally
      return;
    }

    const target = e.target;
    if (!target || target === document.body || target === document.documentElement) {
      return;
    }

    // Intercept click on the target web page element
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.state.pinElement(target);
  }

  _onKeyDown(e) {
    // Esc exits inspection mode
    if (e.key === 'Escape' && this.state.isInspecting) {
      this.state.stopInspecting();
      return;
    }

    // Alt + Shift + S toggles inspection mode
    if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      this.state.toggleInspecting();
    }
  }

  toggle() {
    this.state.toggleInspecting();
  }

  enable() {
    this.state.startInspecting();
  }

  disable() {
    this.state.stopInspecting();
  }

  async exportAll() {
    const md = generateMarkdownExport(this.state.getPinnedList());
    await copyToClipboard(md);
    this.panel.showToast();
    return md;
  }

  resetAll() {
    this.state.resetAll();
  }

  destroy() {
    window.removeEventListener('pointermove', this._onPointerMove, true);
    window.removeEventListener('click', this._onClickCapture, true);
    window.removeEventListener('keydown', this._onKeyDown, true);

    if (this.host) {
      this.host.remove();
    }

    window.__STYLE_INSPECTOR_INSTANCE__ = null;
    delete window.__STYLE_INSPECTOR__;
  }
}

// Auto-initialize if running in browser window
if (typeof window !== 'undefined') {
  if (!window.__STYLE_INSPECTOR__) {
    const inspector = new StyleInspector();
    window.__STYLE_INSPECTOR__ = inspector;
  }
}
