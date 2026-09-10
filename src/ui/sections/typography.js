/**
 * Typography section — the compact control grid, plus font-family.
 */

import { rgbToHex } from '../../core/styles.js';
import { section, escapeHtml, siIcon, bindNumber, bindText, bindSelect, bindColor } from './shared.js';

export const id = 'typography';

const WEIGHTS = [
  ['100', 'Thin'],
  ['200', 'Extra Light'],
  ['300', 'Light'],
  ['400', 'Normal'],
  ['500', 'Medium'],
  ['600', 'Semi Bold'],
  ['700', 'Bold'],
  ['800', 'Extra Bold'],
  ['900', 'Black']
];

const FONT_SIZE_PRESETS = [10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128];

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

const TRANSFORMS = [
  ['none', 'Normal'],
  ['uppercase', 'Uppercase'],
  ['lowercase', 'Lowercase'],
  ['capitalize', 'Capitalize']
];

export function render(item) {
  const cur = item.current;

  const weightOptions = WEIGHTS.map(
    ([value, label]) =>
      `<option value="${value}" ${
        `${cur.fontWeight}` === value || (value === '400' && !cur.fontWeight) ? 'selected' : ''
      }>${value} - ${label}</option>`
  ).join('');

  const sizePresets = FONT_SIZE_PRESETS.map(
    size => `<option value="${size}" ${Number(cur.fontSize) === size ? 'selected' : ''}>${size}</option>`
  ).join('');

  const alignButtons = ALIGNMENTS.map(align => {
    const active = cur.textAlign === align || (!cur.textAlign && align === 'left');
    const icon = `Align${align[0].toUpperCase()}${align.slice(1)}`;
    return `<button type="button" class="si-type-icon-btn ${active ? 'active' : ''}" data-align="${align}" title="Align ${align}">${siIcon(icon, 15)}</button>`;
  }).join('');

  const transformOptions = TRANSFORMS.map(
    ([value, label]) =>
      `<option value="${value}" ${
        cur.textTransform === value || (value === 'none' && !cur.textTransform) ? 'selected' : ''
      }>${label}</option>`
  ).join('');

  const body = `
      <div class="si-typography-grid">
        <label class="si-type-control si-type-select">
          <select data-testid="style_inspector_panel_font_weight_select" id="font-weight-select" aria-label="Font weight">${weightOptions}</select>
          ${siIcon('ChevronDown', 13)}
        </label>
        <label class="si-type-control si-type-value si-type-fontsize">
          <span class="si-type-glyph">AA</span>
          <input type="number" data-testid="style_inspector_panel_font_size_input" value="${cur.fontSize}" id="font-size-input" aria-label="Font size">
          <select id="font-size-preset" aria-label="Font size preset" class="si-fontsize-preset">
            <option value="">—</option>
            ${sizePresets}
          </select>
          ${siIcon('ChevronDown', 10)}
        </label>
        <label class="si-type-control si-type-value">
          <input type="color" class="si-color-swatch" value="${rgbToHex(cur.color, '#ffffff')}" id="color-picker" title="Pick text color">
          <input type="text" data-testid="style_inspector_panel_color_input" value="${escapeHtml(cur.color || '')}" id="color-input" aria-label="Text color">
        </label>
        <label class="si-type-control si-type-value">
          <span class="si-type-glyph si-type-underlined">A</span>
          <input type="number" step="0.05" data-testid="style_inspector_panel_line_height_input" value="${cur.lineHeight}" id="line-height-input" aria-label="Line height">
          <span class="si-type-dash">—</span>
        </label>
        <div class="si-type-control si-type-align" role="group" aria-label="Text alignment"
             data-testid="style_inspector_panel_text_align_group">${alignButtons}</div>
        <label class="si-type-control si-type-value">
          <span class="si-type-glyph">|A|</span>
          <input type="number" step="0.1" value="${cur.letterSpacing}" id="letter-spacing-input" aria-label="Letter spacing">
          <span>px</span>
        </label>
        <label class="si-type-control si-type-transform">
          <span class="si-type-glyph">Aa</span>
          <select data-testid="style_inspector_panel_text_transform_select" id="text-transform-select" aria-label="Text transform">${transformOptions}</select>
          ${siIcon('ChevronDown', 13)}
        </label>
      </div>
      <div class="si-control-row">
        <span class="si-control-label">Font family</span>
        <div class="si-control-field">
          <input type="text" class="si-input-text"
                 data-testid="style_inspector_panel_font_family_input"
                 value="${escapeHtml(cur.fontFamily || '')}" id="font-family-input"
                 placeholder="Inter, system-ui, sans-serif">
        </div>
      </div>
  `;

  return section({ title: 'Typography', body });
}

export function bind(context) {
  const { panel, state, item } = context;
  const set = (prop, value) => state.updateStyle(item.id, prop, value);

  bindNumber(panel, '#font-size-input', value => set('fontSize', value));
  bindNumber(panel, '#line-height-input', value => set('lineHeight', value));
  bindNumber(panel, '#letter-spacing-input', value => set('letterSpacing', value));
  bindText(panel, '#font-family-input', value => set('fontFamily', value));
  bindSelect(panel, '#font-weight-select', value => set('fontWeight', value));
  bindSelect(panel, '#text-transform-select', value => set('textTransform', value));
  bindColor(context, '#color-picker', '#color-input', 'color');

  // The preset dropdown writes through the number field so both stay in step.
  const preset = panel.querySelector('#font-size-preset');
  if (preset) {
    preset.onchange = event => {
      if (!event.target.value) return;
      const sizeInput = panel.querySelector('#font-size-input');
      if (sizeInput) sizeInput.value = event.target.value;
      set('fontSize', parseFloat(event.target.value));
    };
  }

  panel.querySelectorAll('[data-align]').forEach(button => {
    button.onclick = () => {
      const align = button.getAttribute('data-align');
      panel
        .querySelectorAll('[data-align]')
        .forEach(other => other.classList.toggle('active', other === button));
      set('textAlign', align);
    };
  });
}
