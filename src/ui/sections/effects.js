/**
 * Effects section — box-shadow and opacity.
 */

import { normalizeBoxShadow } from '../../core/css-value.js';
import { section, controlRow, escapeHtml, bindText, scrubControl, bindScrub } from './shared.js';

export const id = 'effects';

/**
 * Ready-made shadows, so the common case does not require typing CSS by hand.
 * Written in the same canonical form `normalizeBoxShadow` produces, so a
 * preset the element already has is detected and shown as selected.
 * The text field stays authoritative — a preset just fills it in.
 */
const SHADOW_PRESETS = [
  ['none', 'None'],
  ['0px 1px 2px rgba(0,0,0,0.08)', 'Subtle'],
  ['0px 2px 8px rgba(0,0,0,0.12)', 'Soft'],
  ['0px 8px 24px rgba(0,0,0,0.18)', 'Elevated'],
  ['0px 20px 48px rgba(0,0,0,0.24)', 'Dramatic'],
  ['inset 0px 1px 2px rgba(0,0,0,0.15)', 'Inset']
];

export function render(item) {
  const cur = item.current;
  const shadow = normalizeBoxShadow(cur.boxShadow);

  const presetOptions = SHADOW_PRESETS.map(
    ([value, label]) =>
      `<option value="${escapeHtml(value)}" ${
        normalizeBoxShadow(value) === shadow ? 'selected' : ''
      }>${label}</option>`
  ).join('');

  // No preset matches a hand-written shadow, so the placeholder option has to
  // remain selectable-looking rather than claiming one of the presets.
  const custom = SHADOW_PRESETS.every(([value]) => normalizeBoxShadow(value) !== shadow);

  const opacity = scrubControl({
    id: 'opacity-input',
    testId: 'style_inspector_panel_opacity_input',
    value: cur.opacity,
    step: 0.01,
    min: 0,
    max: 1
  });

  return section({
    title: 'Effects',
    body: [
      controlRow(
        'Shadow',
        `<label class="si-select-wrap">
           <select id="box-shadow-preset" aria-label="Shadow preset">
             <option value="" ${custom ? 'selected' : ''}>${custom ? 'Custom…' : 'Preset…'}</option>
             ${presetOptions}
           </select>
         </label>`
      ),
      `<div class="si-field-block">
         <input type="text" class="si-input-text si-input-css"
                data-testid="style_inspector_panel_box_shadow_input"
                id="box-shadow-input"
                value="${escapeHtml(shadow)}"
                placeholder="0px 2px 8px rgba(0,0,0,0.12)"
                spellcheck="false" autocapitalize="off" autocomplete="off"
                aria-label="Box shadow">
       </div>`,
      controlRow('Opacity', opacity)
    ].join('')
  });
}

export function bind(context) {
  const { panel, state, item } = context;
  const set = (prop, value) => state.updateStyle(item.id, prop, value);

  bindText(panel, '#box-shadow-input', value => set('boxShadow', value));

  const preset = panel.querySelector('#box-shadow-preset');
  if (preset) {
    preset.onchange = event => {
      if (!event.target.value) return;
      const input = panel.querySelector('#box-shadow-input');
      if (input) input.value = event.target.value;
      set('boxShadow', event.target.value);
    };
  }

  bindScrub(panel, 'opacity-input', { step: 0.01, min: 0, max: 1 }, value => set('opacity', value));
}
