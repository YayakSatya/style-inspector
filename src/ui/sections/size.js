/**
 * Size section — width, height, max-width.
 *
 * Each field is a number paired with a unit dropdown, because that is how these
 * values are actually reached for: a width is `100%` or `320px` far more often
 * than it is an expression. The value field stays free text underneath, so the
 * cases a dropdown cannot model — `calc(100% - 2rem)`, `min(640px, 90vw)` —
 * remain typable and round-trip unchanged.
 */

import { section, controlRow, comboControl, bindCombo, LENGTH_UNITS } from './shared.js';

export const id = 'size';

/** Keyword "units" offered per field, appended after the real length units. */
const FIELDS = [
  {
    key: 'width',
    label: 'Width',
    valueId: 'width-input',
    unitId: 'width-unit',
    keywords: ['auto', 'fit-content', 'min-content', 'max-content']
  },
  {
    key: 'height',
    label: 'Height',
    valueId: 'height-input',
    unitId: 'height-unit',
    keywords: ['auto', 'fit-content', 'min-content', 'max-content']
  },
  {
    key: 'maxWidth',
    label: 'Max width',
    valueId: 'max-width-input',
    unitId: 'max-width-unit',
    keywords: ['none', 'fit-content']
  }
];

/** `maxWidth` → `max_width`, to keep the existing automation ids stable. */
function testId(key) {
  return `style_inspector_panel_${key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)}_input`;
}

export function render(item) {
  const rows = FIELDS.map(field =>
    controlRow(
      field.label,
      comboControl({
        valueId: field.valueId,
        unitId: field.unitId,
        testId: testId(field.key),
        value: item.current[field.key] || '',
        units: [...LENGTH_UNITS, ...field.keywords],
        placeholder: 'auto'
      })
    )
  ).join('');

  return section({ title: 'Size', body: rows });
}

export function bind({ panel, state, item }) {
  for (const field of FIELDS) {
    bindCombo(panel, { valueId: field.valueId, unitId: field.unitId }, value =>
      state.updateStyle(item.id, field.key, value)
    );
  }
}
