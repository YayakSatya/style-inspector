/**
 * Content section — edits the element's visible text.
 */

import { section, escapeHtml, siIcon } from './shared.js';

export const id = 'content';

export function render(item) {
  const action = item.textEditable
    ? `<button class="si-btn-icon" id="si-reset-text-btn" title="Revert text to original">${siIcon('RotateCcw', 12)}</button>`
    : '';

  if (!item.textEditable) {
    return section({
      title: 'Content',
      action,
      body: `<div class="si-text-disabled">${escapeHtml(
        item.textReason || 'This element has no directly editable text.'
      )}</div>`
    });
  }

  const text = item.currentText || '';

  return section({
    title: 'Content',
    action,
    body: `
      <textarea class="si-textarea si-text-content"
                data-testid="style_inspector_panel_text_content_input"
                id="si-text-input"
                rows="2"
                placeholder="Element text…">${escapeHtml(text)}</textarea>
      <div class="si-text-meta">
        <span>${text.length} chars</span>
        ${item.currentText !== item.baselineText ? '<span class="si-text-dirty">edited</span>' : ''}
      </div>
    `
  });
}

export function bind({ panel, state, item, showToast }) {
  const input = panel.querySelector('#si-text-input');
  if (input) {
    input.oninput = event => state.setText(item.id, event.target.value);
  }

  const resetBtn = panel.querySelector('#si-reset-text-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      state.resetText(item.id);
      showToast('Text reverted to original.');
    };
  }
}
