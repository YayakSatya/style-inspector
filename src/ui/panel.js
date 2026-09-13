/**
 * Adjustment Panel Component
 * Implements all controls and automation IDs defined in PRD Section 8.
 */

import {
  generateExport,
  generateSingleItemExport,
  copyToClipboard,
  downloadExport,
  EXPORT_FORMATS
} from '../core/exporter.js';
import { escapeHtml } from '../core/selector.js';
import { SHORTHAND_GROUPS } from '../core/schema.js';
import { EXPORT_UNITS } from '../core/css-value.js';
import { siIcon } from './icons.js';
import { SECTIONS } from './sections/index.js';
import { section, segmented, bindSegmented } from './sections/shared.js';
import * as alignRail from './sections/align.js';

/**
 * Sections that start collapsed. These are the ones an inspection rarely opens
 * with — the panel is long enough that showing all of them at once buries the
 * controls people actually came for. Layout used to be here; it moved up the
 * order in Phase 8 and now earns its space, and it already hides its own
 * flex/grid rows when the element does not lay out children.
 */
const DEFAULT_COLLAPSED = ['corner-radius', 'border', 'effects'];

export class InspectorPanel {
  /**
   * @param {ShadowRoot} shadowRoot
   * @param {import('../core/state.js').InspectorState} state
   */
  constructor(shadowRoot, state) {
    this.shadowRoot = shadowRoot;
    this.state = state;
    this.isMinimized = false;
    this.showInstruction = false;
    this._panelPosition = null;
    // Which sections are folded away. Deliberately panel state rather than
    // InspectorState: it is pure presentation and must not reach the export.
    this.collapsed = new Set(DEFAULT_COLLAPSED);

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

    // Skip destructive full rebuild while user is actively typing/selecting in a
    // panel field — innerHTML replace would kill focus and jump scroll to top.
    // bindSync/bindColor already mirror the value live without a re-render.
    const focusedEl = this.shadowRoot.activeElement;
    if (
      focusedEl &&
      this.panel.contains(focusedEl) &&
      (focusedEl.tagName === 'INPUT' || focusedEl.tagName === 'SELECT' || focusedEl.tagName === 'TEXTAREA')
    ) {
      return;
    }

    // A rebuild replaces .si-panel-body, and the new node starts at scrollTop 0.
    // Anything that applies a style without holding focus — a segmented button,
    // the align rail, a link-all switch — would otherwise throw the user back to
    // the top of the panel on every click. Remember where they were, and which
    // control they were on, so a keyboard user keeps their place too.
    const previousBody = this.panel.querySelector('.si-panel-body');
    const scrollTop = previousBody ? previousBody.scrollTop : 0;
    const focusedId = focusedEl && focusedEl.id ? focusedEl.id : null;

    if (this.isMinimized) {
      this.panel.innerHTML = `
        <div class="si-panel-header" title="Drag to move">
          <div class="si-panel-title">
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

      ${this._renderFooter(pinnedList)}
    `;

    this._attachEventListeners(activeItem);
    this._initDraggable();
    this._restoreScroll(scrollTop, focusedId);
  }

  /**
   * Puts the body back where it was after a rebuild, and returns focus to the
   * control that had it.
   * @param {number} scrollTop
   * @param {string|null} focusedId
   */
  _restoreScroll(scrollTop, focusedId) {
    const body = this.panel.querySelector('.si-panel-body');
    if (body && scrollTop) body.scrollTop = scrollTop;

    if (!focusedId) return;
    const refocus = this.panel.querySelector(`#${CSS.escape(focusedId)}`);
    if (refocus && typeof refocus.focus === 'function') refocus.focus({ preventScroll: true });
  }

  /**
   * Footer: export settings, then the session-wide actions.
   * @param {Array<object>} pinnedList
   * @returns {string}
   */
  _renderFooter(pinnedList) {
    const formatOptions = EXPORT_FORMATS.map(
      format =>
        `<option value="${format.id}" ${
          this.state.exportFormat === format.id ? 'selected' : ''
        }>${format.label}</option>`
    ).join('');

    const unitOptions = EXPORT_UNITS.map(
      unit => `<option value="${unit}" ${this.state.exportUnit === unit ? 'selected' : ''}>${unit}</option>`
    ).join('');

    const instruction = this.state.customInstruction || '';

    return `
      <div class="si-panel-footer">
        <div class="si-export-settings">
          <label class="si-select-wrap si-export-select">
            <select id="si-export-format" data-testid="style_inspector_panel_export_format_select"
                    aria-label="Export format">${formatOptions}</select>
            ${siIcon('ChevronDown', 12)}
          </label>
          <label class="si-select-wrap si-export-select">
            <select id="si-export-unit" data-testid="style_inspector_panel_export_unit_select"
                    aria-label="Export unit">${unitOptions}</select>
            ${siIcon('ChevronDown', 12)}
          </label>
          <button class="si-btn-icon ${this.showInstruction ? 'active' : ''}"
                  id="si-instruction-toggle"
                  title="${this.showInstruction ? 'Hide' : 'Edit'} the instruction appended to the export">
            ${siIcon('Zap', 13)}
          </button>
        </div>

        ${
          this.showInstruction
            ? `<div class="si-field-block">
                 <textarea class="si-textarea si-instruction-input"
                           id="si-instruction-input"
                           data-testid="style_inspector_panel_instruction_input"
                           rows="3"
                           placeholder="Leave empty to use the default instruction…">${escapeHtml(instruction)}</textarea>
               </div>`
            : ''
        }

        <div class="si-action-row">
          <button class="si-btn si-btn-primary" data-testid="style_inspector_panel_export_button" id="si-export-all-btn">
            Copy to Clipboard
          </button>
          <button class="si-btn si-btn-secondary si-btn-square" id="si-download-btn"
                  data-testid="style_inspector_panel_download_button"
                  title="Download the export as a file"
                  aria-label="Download the export as a file">
            ${siIcon('Download', 15)}
          </button>
          <button class="si-btn si-btn-danger si-btn-square" id="si-clear-all-btn"
                  title="Revert every element and discard the session (${pinnedList.length} pinned)"
                  aria-label="Revert every element and discard the session">
            ${siIcon('Trash2', 15)}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Options every export call needs: which format, which unit, and the
   * instruction override if the user set one.
   * @returns {{ format: string, unit: string, instruction: string }}
   */
  _exportOptions() {
    return {
      format: this.state.exportFormat,
      unit: this.state.exportUnit,
      instruction: (this.state.customInstruction || '').trim()
    };
  }

  /**
   * The "apply to" switch: this one element, or every element sharing its
   * classes. Only rendered when the choice exists — a selector that matches
   * one element has nothing to widen to.
   * @param {object} item
   * @returns {string}
   */
  _renderScopeControl(item) {
    if (!item.sharedSelector || item.sharedCount < 2) return '';

    const shared = item.sharedSelector.replace(/^[a-z0-9-]+/i, '');
    return `
      <div class="si-scope-row">
        <span class="si-scope-label">Apply to</span>
        ${segmented({
          id: 'si-scope',
          testId: 'style_inspector_panel_scope_control',
          label: 'Apply changes to',
          value: item.scope || 'element',
          options: [
            { value: 'element', label: 'This element', title: `Only this element (${item.elementSelector})` },
            {
              value: 'class',
              label: `All ${shared} (${item.sharedCount})`,
              title: `Every element matching ${item.sharedSelector} — ${item.sharedCount} on this page`
            }
          ]
        })}
      </div>
    `;
  }

  _renderActiveItemBody(item) {
    return `
      <div class="si-panel-body">
        <div class="si-target-info">
          <span class="si-target-selector" title="${escapeHtml(item.selector)}">${escapeHtml(item.selector)}</span>
          <div class="si-target-actions">
            <button class="si-btn-icon" id="si-copy-selector-btn"
                    title="Copy selector" aria-label="Copy selector">${siIcon('Copy')}</button>
            <button class="si-btn-icon" id="si-copy-item-btn"
                    data-testid="style_inspector_panel_copy_item_button"
                    title="Copy this element's changes as markdown"
                    aria-label="Copy this element's changes as markdown">${siIcon('Clipboard')}</button>
          </div>
        </div>

        ${this._renderScopeControl(item)}

        ${alignRail.render(item)}

        ${SECTIONS.map((section) => section.render(item)).join('')}

        <!-- Context & Notes Field -->
        ${section({
          title: 'Notes',
          body: `<textarea class="si-textarea" id="si-notes-input"
                    placeholder="e.g. Instance of repeated card, desktop breakpoint only...">${escapeHtml(
                      item.notes || ''
                    )}</textarea>`
        })}

        <!-- Element-Level Actions -->
        <div class="si-action-row">
          <button class="si-btn si-btn-secondary" data-testid="style_inspector_panel_reset_button" id="si-reset-item-btn"
                  title="Revert this element to the styles it had when it was pinned">
            Reset this element
          </button>
        </div>
      </div>
    `;
  }

  _attachEventListeners(activeItem) {
    this._applyCollapsedState();

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
        const removeTarget = e.target.closest('[data-remove]');
        const removeId = removeTarget ? removeTarget.getAttribute('data-remove') : null;
        if (removeId) {
          e.stopPropagation();
          this.state.unpinElement(removeId);
        } else {
          const id = pill.getAttribute('data-id');
          this.state.setActivePinnedId(id);
        }
      };
    });

    // Clear Pins reverts every element and discards the session. There is no
    // "Reset All" button any more: it was a strict subset of this — the same
    // revert without the unpin — and the per-element Reset covers undoing one
    // element. `inspector.resetAll()` still exists for scripted use.
    const clearAllBtn = this.panel.querySelector('#si-clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.onclick = () => {
        if (confirm('Reset all elements and discard the whole session?')) {
          this.state.clearAll();
        }
      };
    }

    // Export settings
    const formatSelect = this.panel.querySelector('#si-export-format');
    if (formatSelect) {
      formatSelect.onchange = (e) => this.state.setExportFormat(e.target.value);
    }

    const unitSelect = this.panel.querySelector('#si-export-unit');
    if (unitSelect) {
      unitSelect.onchange = (e) => this.state.setExportUnit(e.target.value);
    }

    const instructionToggle = this.panel.querySelector('#si-instruction-toggle');
    if (instructionToggle) {
      instructionToggle.onclick = () => {
        this.showInstruction = !this.showInstruction;
        this.render();
      };
    }

    const instructionInput = this.panel.querySelector('#si-instruction-input');
    if (instructionInput) {
      instructionInput.oninput = (e) => {
        // Assign directly rather than through the setter: emitting stateUpdated
        // on every keystroke would re-render the panel under the cursor.
        this.state.customInstruction = e.target.value;
      };
    }

    const exportAllBtn = this.panel.querySelector('#si-export-all-btn');
    if (exportAllBtn) {
      exportAllBtn.onclick = async () => {
        const options = this._exportOptions();
        const text = generateExport(this.state.getPinnedList(), options);
        const ok = await copyToClipboard(text);
        if (ok) {
          this.showToast(`${options.format.toUpperCase()} export copied to clipboard!`);
        } else {
          alert('Failed to copy to clipboard. Please allow clipboard permissions.');
        }
      };
    }

    const downloadBtn = this.panel.querySelector('#si-download-btn');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const options = this._exportOptions();
        const text = generateExport(this.state.getPinnedList(), options);
        if (downloadExport(text, options.format)) {
          this.showToast('Export downloaded.');
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

    // Scope: this element only, or every element sharing its classes.
    bindSegmented(this.panel, '#si-scope', value => {
      this.state.setScope(activeItem.id, value);
    });

    // "Link all sides" switches, for every four-sided group.
    this.panel.querySelectorAll('[data-switch]').forEach(el => {
      el.onclick = () => {
        const group = el.getAttribute('data-switch');
        const flag = SHORTHAND_GROUPS.find(candidate => candidate.name === group);
        if (!flag) return;
        this.state.setLinked(activeItem.id, group, !activeItem[flag.linkFlag]);
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
        const markdown = generateSingleItemExport(activeItem, this._exportOptions());
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

    // Each section wires its own controls.
    const context = {
      panel: this.panel,
      state: this.state,
      item: activeItem,
      showToast: (message) => this.showToast(message)
    };
    alignRail.bind(context);

    for (const section of SECTIONS) {
      section.bind(context);
    }
  }

  /**
   * Reflects the collapse set onto the freshly rendered sections and wires the
   * toggles. The handlers mutate classes directly instead of re-rendering: a
   * rebuild would reset the body's scroll position, which is exactly what a
   * user folding a section away is trying to avoid.
   */
  _applyCollapsedState() {
    this.panel.querySelectorAll('.si-section[data-section]').forEach(el => {
      el.classList.toggle('collapsed', this.collapsed.has(el.getAttribute('data-section')));
    });

    this.panel.querySelectorAll('[data-toggle]').forEach(button => {
      button.onclick = event => {
        event.stopPropagation();
        const key = button.getAttribute('data-toggle');
        const isCollapsed = !this.collapsed.has(key);

        if (isCollapsed) {
          this.collapsed.add(key);
        } else {
          this.collapsed.delete(key);
        }

        const target = this.panel.querySelector(`.si-section[data-section="${key}"]`);
        if (target) target.classList.toggle('collapsed', isCollapsed);
      };
    });
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
