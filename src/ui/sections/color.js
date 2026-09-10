/**
 * Colors section — background colour. Text colour lives in the typography grid
 * next to the properties it interacts with.
 */

import { rgbToHex } from '../../core/styles.js';
import { section, controlRow, colorControl, bindColor } from './shared.js';

export const id = 'color';

export function render(item) {
  return section({
    title: 'Colors',
    body: controlRow(
      'Background',
      colorControl(
        {
          pickerId: 'bg-color-picker',
          inputId: 'bg-color-input',
          testId: 'style_inspector_panel_bg_color_input',
          value: item.current.backgroundColor,
          fallback: '#1e293b',
          placeholder: 'transparent or #ffffff'
        },
        rgbToHex
      )
    )
  });
}

export function bind(context) {
  bindColor(context, '#bg-color-picker', '#bg-color-input', 'backgroundColor');
}
