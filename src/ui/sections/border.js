/**
 * Border section — corner radius (four corners, linkable) plus border width,
 * style, and colour.
 */

import { SHORTHAND_GROUPS } from '../../core/schema.js';
import { rgbToHex } from '../../core/styles.js';
import {
  section,
  linkSwitch,
  fourSidedControl,
  bindFourSided,
  bindNumber,
  bindSelect,
  bindColor,
  controlRow,
  selectControl,
  colorControl
} from './shared.js';

export const id = 'border';

const RADIUS = SHORTHAND_GROUPS.find(group => group.name === 'border-radius');
const PREFIX = 'radius-input';

const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];

export function render(item) {
  const cur = item.current;

  const width = `
    <input type="number" class="si-input-number" min="0"
           data-testid="style_inspector_panel_border_width_input"
           value="${cur.borderWidth}" id="border-width-input">
  `;

  return [
    section({
      title: 'Corner Radius',
      action: linkSwitch(RADIUS, item.linkRadius),
      body: fourSidedControl(RADIUS, item, {
        idPrefix: PREFIX,
        testId: 'style_inspector_panel_border_radius_input'
      })
    }),
    section({
      title: 'Border',
      body: [
        controlRow('Width', width),
        controlRow(
          'Style',
          selectControl({
            id: 'border-style-select',
            testId: 'style_inspector_panel_border_style_select',
            label: 'Border style',
            value: cur.borderStyle,
            options: BORDER_STYLES
          })
        ),
        controlRow(
          'Color',
          colorControl(
            {
              pickerId: 'border-color-picker',
              inputId: 'border-color-input',
              testId: 'style_inspector_panel_border_color_input',
              value: cur.borderColor,
              fallback: '#262626',
              placeholder: 'currentColor or #262626'
            },
            rgbToHex
          )
        )
      ].join('')
    })
  ].join('');
}

export function bind(context) {
  const { panel, state, item } = context;
  const set = (prop, value) => state.updateStyle(item.id, prop, value);

  bindFourSided(RADIUS, context, PREFIX);
  bindNumber(panel, '#border-width-input', value => set('borderWidth', value));
  bindSelect(panel, '#border-style-select', value => set('borderStyle', value));
  bindColor(context, '#border-color-picker', '#border-color-input', 'borderColor');
}
