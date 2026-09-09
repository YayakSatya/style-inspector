/**
 * Adjustment Panel Component
 * Implements all controls and automation IDs defined in PRD Section 8.
 */

import { generateMarkdownExport, generateSingleItemExport, copyToClipboard } from '../core/exporter.js';
import { escapeHtml } from '../core/selector.js';
import { rgbToHex } from '../core/styles.js';
import { siIcon } from './icons.js';

export class InspectorPanel {
  /**
   * @param {ShadowRoot} shadowRoot
   * @param {import('../core/state.js').InspectorState} state
   */
  constructor(shadowRoot, state) {
    this.shadowRoot = shadowRoot;
    this.state = state;
    this.isMinimized = false;
    this._panelPosition = null;

    this._createPanel();
    this._bindEvents();
  }

  _createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'si-panel';
    this.panel.setAttribute('data-testid', 'style_inspector_panel_modal');
    this.panel.style.display = 'none';

    this.shadowRoot.appendChild(this.panel);
    this.render();
  }

  _bindEvents() {
    this.state.on('stateUpdated', () => this.render());
    this.state.on('pinnedChanged', () => {
      if (this.state.pinnedItems.size > 0 && this.state.isPanelOpen) {
        this.panel.style.display = 'flex';
      } else if (this.state.pinnedItems.size === 0) {
        this.panel.style.display = 'none';
      }
    });
  }

  showToast(message = 'Copied to clipboard! Ready to paste into Antigravity.') {
    const existing = this.shadowRoot.querySelector('.si-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'si-toast';
    toast.innerHTML = `${siIcon('Check')}<span>${escapeHtml(message)}</span>`;
    this.shadowRoot.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  render() {
    const pinnedList = this.state.getPinnedList();
    const activeItem = this.state.getActiveItem();

    if (pinnedList.length === 0 || !this.state.isPanelOpen) {
      this.panel.style.display = 'none';
      return;
    }

    this.panel.style.display = 'flex';

    // Restore user dragged position if available
    if (this._panelPosition) {
      this.panel.style.right = 'auto';
      this.panel.style.left = `${this._panelPosition.left}px`;
      this.panel.style.top = `${this._panelPosition.top}px`;
    }

    if (this.isMinimized) {
      this.panel.innerHTML = `
        <div class="si-panel-header" title="Drag to move">
          <div class="si-panel-title">
            ${siIcon('Palette')}
            <span>Style Inspector (${pinnedList.length})</span>
          </div>
          <div class="si-panel-header-actions">
            <button class="si-btn-icon" id="si-expand-btn" title="Expand panel">${siIcon('Maximize2')}</button>
            <button class="si-btn-icon" id="si-close-btn" title="Close">${siIcon('X')}</button>
          </div>
        </div>
      `;
      this.panel.querySelector('#si-expand-btn').onclick = () => {
        this.isMinimized = false;
        this.render();
      };
      this.panel.querySelector('#si-close-btn').onclick = () => {
        this.state.isPanelOpen = false;
        this.render();
      };
      this._initDraggable();
      return;
    }

    // Build full panel
    this.panel.innerHTML = `
      <div class="si-panel-header" title="Drag to move">
        <div class="si-panel-title">
          ${siIcon('Palette')}
          <span>Style Inspector</span>
          <span class="si-toolbar-badge">${pinnedList.length}</span>
        </div>
        <div class="si-panel-header-actions">
          <button class="si-btn-icon" id="si-minimize-btn" title="Minimize panel">${siIcon('Minimize2')}</button>
          <button class="si-btn-icon" id="si-close-btn" title="Close panel">${siIcon('X')}</button>
        </div>
      </div>

      <div class="si-pinned-bar">
        ${pinnedList
          .map(
            item => `
          <div class="si-pinned-pill ${item.id === this.state.activePinnedId ? 'active' : ''}"
               data-testid="style_inspector_panel_pinned_item"
               data-id="${item.id}">
            <span>${escapeHtml(item.label)}</span>
            <span class="si-pinned-pill-close" data-remove="${item.id}">${siIcon('X', 12)}</span>
          </div>
        `
          )
          .join('')}
      </div>

      ${activeItem ? this._renderActiveItemBody(activeItem) : '<div class="si-panel-body">No element selected.</div>'}

      <div class="si-panel-footer">
        <div class="si-action-row">
          <button class="si-btn si-btn-secondary" id="si-reset-all-btn">
            Reset All (${pinnedList.length})
          </button>
          <button class="si-btn si-btn-white" data-testid="style_inspector_panel_export_button" id="si-export-all-btn">
            Copy to Clipboard
          </button>
        </div>
      </div>
    `;

    this._attachEventListeners(activeItem);
    this._initDraggable();
  }

  _renderActiveItemBody(item) {
    const cur = item.current;

    return `
      <div class="si-panel-body">
        <div class="si-target-info">
          <span class="si-target-selector" title="${escapeHtml(item.selector)}">${escapeHtml(item.selector)}</span>
          <button class="si-btn-icon" id="si-copy-selector-btn" title="Copy selector">${siIcon('Copy')}</button>
        </div>

        <!-- Padding Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Padding</span>
            <label class="si-switch-label">
              <span>Link all</span>
              <div class="si-switch ${item.linkPadding ? 'checked' : ''}"
                   data-testid="style_inspector_panel_link_sides_switch"
                   data-switch="padding">
                <div class="si-switch-thumb"></div>
              </div>
            </label>
          </div>

          ${
            item.linkPadding
              ? `
            <div class="si-spacing-box si-spacing-box-linked">
              <span class="si-spacing-label">Padding</span>
              <input type="number" class="si-spacing-edge si-spacing-all"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="all"
                     value="${cur.paddingTop}" id="pad-input-all">
            </div>
          `
              : `
            <div class="si-spacing-box">
              <span class="si-spacing-label">Padding</span>
              <input type="number" class="si-spacing-edge si-spacing-top"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="top" title="Top"
                     value="${cur.paddingTop}" id="pad-input-top">
              <input type="number" class="si-spacing-edge si-spacing-left"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="left" title="Left"
                     value="${cur.paddingLeft}" id="pad-input-left">
              <div class="si-spacing-center"></div>
              <input type="number" class="si-spacing-edge si-spacing-right"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="right" title="Right"
                     value="${cur.paddingRight}" id="pad-input-right">
              <input type="number" class="si-spacing-edge si-spacing-bottom"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="bottom" title="Bottom"
                     value="${cur.paddingBottom}" id="pad-input-bottom">
            </div>
          `
          }
        </div>

        <!-- Margin Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Margin</span>
            <label class="si-switch-label">
              <span>Link all</span>
              <div class="si-switch ${item.linkMargin ? 'checked' : ''}"
                   data-testid="style_inspector_panel_link_sides_switch"
                   data-switch="margin">
                <div class="si-switch-thumb"></div>
              </div>
            </label>
          </div>

          ${
            item.linkMargin
              ? `
            <div class="si-spacing-box si-spacing-box-linked">
              <span class="si-spacing-label">Margin</span>
              <input type="number" class="si-spacing-edge si-spacing-all"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="all"
                     value="${cur.marginTop}" id="mar-input-all">
            </div>
          `
              : `
            <div class="si-spacing-box">
              <span class="si-spacing-label">Margin</span>
              <input type="number" class="si-spacing-edge si-spacing-top"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="top" title="Top"
                     value="${cur.marginTop}" id="mar-input-top">
              <input type="number" class="si-spacing-edge si-spacing-left"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="left" title="Left"
                     value="${cur.marginLeft}" id="mar-input-left">
              <div class="si-spacing-center"></div>
              <input type="number" class="si-spacing-edge si-spacing-right"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="right" title="Right"
                     value="${cur.marginRight}" id="mar-input-right">
              <input type="number" class="si-spacing-edge si-spacing-bottom"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="bottom" title="Bottom"
                     value="${cur.marginBottom}" id="mar-input-bottom">
            </div>
          `
          }
        </div>

        <!-- Gap Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Gap (Flex / Grid)</span>
          </div>
          <div class="si-control-row">
            <span class="si-control-label">Gap</span>
            <input type="range" class="si-slider" min="0" max="100" value="${cur.gap}" id="gap-slider">
            <input type="number" class="si-input-number"
                   data-testid="style_inspector_panel_gap_input"
                   value="${cur.gap}" id="gap-input">
          </div>
        </div>

        <!-- Typography Section -->
        <div class="si-section si-typography-section">
          <div class="si-section-header"><span>Typography</span></div>
          <div class="si-typography-grid">
            <label class="si-type-control si-type-select">
              <select data-testid="style_inspector_panel_font_weight_select" id="font-weight-select" aria-label="Font weight">
                <option value="100" ${`${cur.fontWeight}` === '100' ? 'selected' : ''}>100 - Thin</option>
                <option value="200" ${`${cur.fontWeight}` === '200' ? 'selected' : ''}>200 - Extra Light</option>
                <option value="300" ${`${cur.fontWeight}` === '300' ? 'selected' : ''}>300 - Light</option>
                <option value="400" ${`${cur.fontWeight}` === '400' || !cur.fontWeight ? 'selected' : ''}>400 - Normal</option>
                <option value="500" ${`${cur.fontWeight}` === '500' ? 'selected' : ''}>500 - Medium</option>
                <option value="600" ${`${cur.fontWeight}` === '600' ? 'selected' : ''}>600 - Semi Bold</option>
                <option value="700" ${`${cur.fontWeight}` === '700' ? 'selected' : ''}>700 - Bold</option>
                <option value="800" ${`${cur.fontWeight}` === '800' ? 'selected' : ''}>800 - Extra Bold</option>
                <option value="900" ${`${cur.fontWeight}` === '900' ? 'selected' : ''}>900 - Black</option>
              </select>
              ${siIcon('ChevronDown', 13)}
            </label>
            <label class="si-type-control si-type-value si-type-fontsize">
              <span class="si-type-glyph">AA</span>
              <input type="number" data-testid="style_inspector_panel_font_size_input" value="${cur.fontSize}" id="font-size-input" aria-label="Font size">
              <select id="font-size-preset" aria-label="Font size preset" class="si-fontsize-preset">
                <option value="">—</option>
                ${[10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128].map((s) => `<option value="${s}" ${Number(cur.fontSize) === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </label>
            <label class="si-type-control si-type-value"><input type="color" class="si-color-swatch" value="${rgbToHex(cur.color, '#ffffff')}" id="color-picker" title="Pick text color"><input type="text" data-testid="style_inspector_panel_color_input" value="${escapeHtml(cur.color)}" id="color-input" aria-label="Text color"></label>
            <label class="si-type-control si-type-value"><span class="si-type-glyph si-type-underlined">A</span><input type="number" step="0.05" data-testid="style_inspector_panel_line_height_input" value="${cur.lineHeight}" id="line-height-input" aria-label="Line height"><span class="si-type-dash">—</span></label>
            <div class="si-type-control si-type-align" role="group" aria-label="Text alignment">
              ${['left', 'center', 'right', 'justify'].map(align => `<button type="button" class="si-type-icon-btn ${cur.textAlign === align || (!cur.textAlign && align === 'left') ? 'active' : ''}" data-align="${align}" title="Align ${align}">${siIcon(`Align${align[0].toUpperCase()}${align.slice(1)}`, 15)}</button>`).join('')}
            </div>
            <label class="si-type-control si-type-value"><span class="si-type-glyph">|A|</span><input type="number" step="0.1" value="${cur.letterSpacing}" id="letter-spacing-input" aria-label="Letter spacing"><span>em</span></label>
            <label class="si-type-control si-type-transform"><span class="si-type-glyph">Aa</span><select data-testid="style_inspector_panel_text_transform_select" id="text-transform-select" aria-label="Text transform"><option value="none" ${cur.textTransform === 'none' || !cur.textTransform ? 'selected' : ''}>Normal</option><option value="uppercase" ${cur.textTransform === 'uppercase' ? 'selected' : ''}>Uppercase</option><option value="lowercase" ${cur.textTransform === 'lowercase' ? 'selected' : ''}>Lowercase</option><option value="capitalize" ${cur.textTransform === 'capitalize' ? 'selected' : ''}>Capitalize</option></select></label>
          </div>
        </div>

        <!-- Colors Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Colors</span>
          </div>

          <div class="si-control-row">
            <span class="si-control-label">Background</span>
            <div class="si-color-picker-wrap">
              <input type="color" class="si-color-swatch" value="${rgbToHex(cur.backgroundColor, '#1e293b')}" id="bg-color-picker" title="Pick background color">
              <input type="text" class="si-input-text"
                     data-testid="style_inspector_panel_bg_color_input"
                     value="${escapeHtml(cur.backgroundColor)}" id="bg-color-input" placeholder="transparent or #ffffff">
            </div>
          </div>
        </div>

        <!-- Context & Notes Field -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Element Notes (Optional)</span>
          </div>
          <textarea class="si-textarea" id="si-notes-input"
                    placeholder="e.g. Instance of repeated card, desktop breakpoint only...">${escapeHtml(item.notes || '')}</textarea>
        </div>

        <!-- Element-Level Actions -->
        <div class="si-action-row">
          <button class="si-btn si-btn-danger" data-testid="style_inspector_panel_reset_button" id="si-reset-item-btn">
            Reset
          </button>
          <button class="si-btn si-btn-secondary" data-testid="style_inspector_panel_copy_item_button" id="si-copy-item-btn">
            Copy Item MD
          </button>
        </div>
      </div>
    `;
  }

  _attachEventListeners(activeItem) {
    // Header controls
    const minBtn = this.panel.querySelector('#si-minimize-btn');
    if (minBtn) {
      minBtn.onclick = () => {
        this.isMinimized = true;
        this.render();
      };
    }

    const closeBtn = this.panel.querySelector('#si-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.state.isPanelOpen = false;
        this.render();
      };
    }

    // Pinned pills click / remove
    this.panel.querySelectorAll('.si-pinned-pill').forEach(pill => {
      pill.onclick = (e) => {
        const removeId = e.target.getAttribute('data-remove');
        if (removeId) {
          e.stopPropagation();
          this.state.unpinElement(removeId);
        } else {
          const id = pill.getAttribute('data-id');
          this.state.setActivePinnedId(id);
        }
      };
    });

    // Reset All & Export All
    const resetAllBtn = this.panel.querySelector('#si-reset-all-btn');
    if (resetAllBtn) {
      resetAllBtn.onclick = () => {
        if (confirm('Reset all pinned elements back to their initial baseline?')) {
          this.state.resetAll();
          this.showToast('All elements reset to baseline.');
        }
      };
    }

    const exportAllBtn = this.panel.querySelector('#si-export-all-btn');
    if (exportAllBtn) {
      exportAllBtn.onclick = async () => {
        const markdown = generateMarkdownExport(this.state.getPinnedList());
        const ok = await copyToClipboard(markdown);
        if (ok) {
          this.showToast('Export copied to clipboard!');
        } else {
          alert('Failed to copy to clipboard. Please allow clipboard permissions.');
        }
      };
    }

    if (!activeItem) return;

    // Selector copy button
    const copySelBtn = this.panel.querySelector('#si-copy-selector-btn');
    if (copySelBtn) {
      copySelBtn.onclick = async () => {
        await copyToClipboard(activeItem.selector);
        this.showToast('Selector copied!');
      };
    }

    // Switch link sides
    this.panel.querySelectorAll('[data-switch]').forEach(el => {
      el.onclick = () => {
        const target = el.getAttribute('data-switch');
        if (target === 'padding') {
          this.state.setLinkPadding(activeItem.id, !activeItem.linkPadding);
        } else if (target === 'margin') {
          this.state.setLinkMargin(activeItem.id, !activeItem.linkMargin);
        }
      };
    });

    // Notes textarea
    const notesInput = this.panel.querySelector('#si-notes-input');
    if (notesInput) {
      notesInput.oninput = (e) => {
        this.state.setNotes(activeItem.id, e.target.value);
      };
    }

    // Single item copy & reset
    const copyItemBtn = this.panel.querySelector('#si-copy-item-btn');
    if (copyItemBtn) {
      copyItemBtn.onclick = async () => {
        const markdown = generateSingleItemExport(activeItem);
        const ok = await copyToClipboard(markdown);
        if (ok) {
          this.showToast('Item markdown copied to clipboard!');
        }
      };
    }

    const resetItemBtn = this.panel.querySelector('#si-reset-item-btn');
    if (resetItemBtn) {
      resetItemBtn.onclick = () => {
        this.state.resetElement(activeItem.id);
        this.showToast('Element styles reset to baseline.');
      };
    }

    // Slider / Input sync helpers
    const bindSync = (sliderId, inputId, prop) => {
      const slider = this.panel.querySelector(sliderId);
      const input = this.panel.querySelector(inputId);
      if (!input) return;

      if (slider) {
        slider.oninput = (e) => {
          input.value = e.target.value;
          this.state.updateStyle(activeItem.id, prop, parseFloat(e.target.value));
        };
      }

      input.oninput = (e) => {
        if (slider) slider.value = e.target.value;
        this.state.updateStyle(activeItem.id, prop, parseFloat(e.target.value));
      };
    };

    if (activeItem.linkPadding) {
      bindSync('#pad-slider-all', '#pad-input-all', 'paddingAll');
    } else {
      bindSync(null, '#pad-input-top', 'paddingTop');
      bindSync(null, '#pad-input-right', 'paddingRight');
      bindSync(null, '#pad-input-bottom', 'paddingBottom');
      bindSync(null, '#pad-input-left', 'paddingLeft');
    }

    if (activeItem.linkMargin) {
      bindSync('#mar-slider-all', '#mar-input-all', 'marginAll');
    } else {
      bindSync(null, '#mar-input-top', 'marginTop');
      bindSync(null, '#mar-input-right', 'marginRight');
      bindSync(null, '#mar-input-bottom', 'marginBottom');
      bindSync(null, '#mar-input-left', 'marginLeft');
    }

    bindSync('#gap-slider', '#gap-input', 'gap');
    bindSync(null, '#font-size-input', 'fontSize');

    const fontSizePreset = this.panel.querySelector('#font-size-preset');
    if (fontSizePreset) {
      fontSizePreset.onchange = (event) => {
        if (!event.target.value) return;
        const fontSizeInput = this.panel.querySelector('#font-size-input');
        if (fontSizeInput) fontSizeInput.value = event.target.value;
        this.state.updateStyle(activeItem.id, 'fontSize', parseFloat(event.target.value));
      };
    }

    bindSync(null, '#line-height-input', 'lineHeight');
    bindSync(null, '#letter-spacing-input', 'letterSpacing');

    this.panel.querySelectorAll('[data-align]').forEach(button => {
      button.onclick = () => {
        const align = button.getAttribute('data-align');
        this.panel.querySelectorAll('[data-align]').forEach(item => item.classList.toggle('active', item === button));
        this.state.updateStyle(activeItem.id, 'textAlign', align);
      };
    });

    const weightSelect = this.panel.querySelector('#font-weight-select');
    if (weightSelect) {
      weightSelect.onchange = (e) => {
        this.state.updateStyle(activeItem.id, 'fontWeight', e.target.value);
      };
    }

    const transformSelect = this.panel.querySelector('#text-transform-select');
    if (transformSelect) {
      transformSelect.onchange = (e) => {
        this.state.updateStyle(activeItem.id, 'textTransform', e.target.value);
      };
    }

    // Color controls
    const bindColor = (pickerId, inputId, prop) => {
      const picker = this.panel.querySelector(pickerId);
      const input = this.panel.querySelector(inputId);
      if (!input) return;

      if (picker) {
        picker.oninput = (e) => {
          input.value = e.target.value;
          this.state.updateStyle(activeItem.id, prop, e.target.value);
        };
      }

      input.oninput = (e) => {
        const val = e.target.value.trim();
        if (picker && val.startsWith('#') && (val.length === 7 || val.length === 4)) {
          picker.value = rgbToHex(val, picker.value);
        }
        this.state.updateStyle(activeItem.id, prop, val);
      };
    };

    bindColor('#color-picker', '#color-input', 'color');
    bindColor('#bg-color-picker', '#bg-color-input', 'backgroundColor');
  }

  _initDraggable() {
    const header = this.panel.querySelector('.si-panel-header');
    if (!header) return;

    header.style.cursor = 'grab';

    const onPointerDown = (e) => {
      // Don't start drag if clicking interactive buttons
      if (e.target.closest('button') || e.target.closest('.si-btn-icon')) return;

      e.preventDefault();
      header.style.cursor = 'grabbing';

      const rect = this.panel.getBoundingClientRect();
      const shiftX = e.clientX - rect.left;
      const shiftY = e.clientY - rect.top;

      const onPointerMove = (moveEvt) => {
        let newLeft = moveEvt.clientX - shiftX;
        let newTop = moveEvt.clientY - shiftY;

        // Viewport bounds checking
        const panelWidth = this.panel.offsetWidth || 380;
        const maxLeft = Math.max(10, window.innerWidth - panelWidth - 10);
        const maxTop = Math.max(10, window.innerHeight - 60);

        newLeft = Math.max(10, Math.min(maxLeft, newLeft));
        newTop = Math.max(10, Math.min(maxTop, newTop));

        this._panelPosition = { left: newLeft, top: newTop };
        this.panel.style.right = 'auto';
        this.panel.style.left = `${newLeft}px`;
        this.panel.style.top = `${newTop}px`;
      };

      const onPointerUp = () => {
        header.style.cursor = 'grab';
        window.removeEventListener('pointermove', onPointerMove, true);
        window.removeEventListener('pointerup', onPointerUp, true);
        window.removeEventListener('pointercancel', onPointerUp, true);
      };

      window.addEventListener('pointermove', onPointerMove, true);
      window.addEventListener('pointerup', onPointerUp, true);
      window.addEventListener('pointercancel', onPointerUp, true);
    };

    header.onpointerdown = onPointerDown;
  }
}
