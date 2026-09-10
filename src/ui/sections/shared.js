/**
 * Shared building blocks for panel sections.
 *
 * Each section module exports `render(item)` returning markup and
 * `bind(context)` wiring handlers, where context is
 * `{ panel, state, item, showToast }`. Keeping the two halves adjacent inside
 * one small module is what stops the panel drifting back into a single
 * 200-line template and a matching 200-line wiring block.
 */

import { escapeHtml } from '../../core/selector.js';
import { splitLength, joinLength, LENGTH_UNITS } from '../../core/css-value.js';
import { siIcon } from '../icons.js';

export { escapeHtml, siIcon, splitLength, joinLength, LENGTH_UNITS };

/**
 * Stable key for a section, used as its collapse identity. Derived from the
 * title so a section does not have to declare one, but a section can pass an
 * explicit `id` when its title is likely to be reworded.
 * @param {string} title
 * @returns {string}
 */
export function sectionKey(title) {
  return `${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Wraps a section's controls in the standard section shell.
 *
 * The collapse toggle renders both glyphs and lets CSS pick which one shows.
 * That is deliberate: the panel applies the collapsed class *after* this markup
 * is built (it owns the collapse state, the section does not), so a toggle that
 * baked its icon in at render time would show the wrong one.
 *
 * @param {{ title: string, body: string, action?: string, id?: string, collapsible?: boolean }} options
 * @returns {string}
 */
export function section({ title, body, action = '', id, collapsible = true }) {
  const key = id || sectionKey(title);
  const toggle = collapsible
    ? `<button type="button" class="si-section-toggle" data-toggle="${key}"
               aria-label="Collapse or expand ${escapeHtml(title)}">
         <span class="si-toggle-open">${siIcon('Minus', 13)}</span>
         <span class="si-toggle-closed">${siIcon('Plus', 13)}</span>
       </button>`
    : '';

  return `
    <div class="si-section" data-section="${key}">
      <div class="si-section-header">
        <span>${escapeHtml(title)}</span>
        <div class="si-section-tools">${action}${toggle}</div>
      </div>
      <div class="si-section-body">${body}</div>
    </div>
  `;
}

/**
 * The "Link all" switch used by every four-sided group.
 * @param {object} group - a SHORTHAND_GROUPS entry
 * @param {boolean} linked
 * @returns {string}
 */
export function linkSwitch(group, linked) {
  return `
    <label class="si-switch-label">
      <span>Link all</span>
      <div class="si-switch ${linked ? 'checked' : ''}"
           data-testid="style_inspector_panel_link_sides_switch"
           data-switch="${group.name}">
        <div class="si-switch-thumb"></div>
      </div>
    </label>
  `;
}

/** Icons used for each side of a four-sided control, by group name. */
const SIDE_ICONS = {
  padding: ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
  margin: ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
  'border-radius': ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']
};

/**
 * Renders a four-sided numeric control — one combined input when the group is
 * linked, four per-side inputs otherwise.
 * @param {object} group - a SHORTHAND_GROUPS entry
 * @param {object} item - pinned element record
 * @param {{ idPrefix: string, testId?: string }} options
 * @returns {string}
 */
export function fourSidedControl(group, item, { idPrefix, testId }) {
  const current = item.current;
  const linked = Boolean(item[group.linkFlag]);
  const testAttr = testId ? `data-testid="${testId}"` : '';

  if (linked) {
    return `
      <div class="si-spacing-row">
        <label class="si-spacing-pill" title="All sides">
          ${siIcon('Maximize2', 12)}
          <input type="number" class="si-spacing-edge" ${testAttr}
                 data-side="all"
                 value="${current[group.keys[0]]}" id="${idPrefix}-all">
        </label>
      </div>
    `;
  }

  const icons = SIDE_ICONS[group.name] || SIDE_ICONS.padding;

  const pills = group.keys.map((key, index) => {
    const side = group.sides[index];
    const label = side.replace('-', ' ');
    return `
      <label class="si-spacing-pill" title="${label}">
        ${siIcon(icons[index], 12)}
        <input type="number" class="si-spacing-edge" ${testAttr}
               data-side="${side}"
               value="${current[key]}" id="${idPrefix}-${side}">
      </label>
    `;
  });

  return `<div class="si-spacing-row">${pills.join('')}</div>`;
}

/**
 * Wires a four-sided control's inputs to the state machine.
 * @param {object} group
 * @param {{ panel: Element, state: object, item: object }} context
 * @param {string} idPrefix
 */
export function bindFourSided(group, { panel, state, item }, idPrefix) {
  if (item[group.linkFlag]) {
    bindNumber(panel, `#${idPrefix}-all`, value => state.updateStyle(item.id, group.allProp, value));
    return;
  }

  group.keys.forEach((key, index) => {
    const side = group.sides[index];
    bindNumber(panel, `#${idPrefix}-${side}`, value => state.updateStyle(item.id, key, value));
  });
}

/**
 * Binds a numeric input, ignoring entries that are not yet a number so a
 * half-typed value like "-" does not reset the property to 0.
 * @param {Element} panel
 * @param {string} selector
 * @param {(value: number) => void} onChange
 */
export function bindNumber(panel, selector, onChange) {
  const input = panel.querySelector(selector);
  if (!input) return;
  input.oninput = event => {
    const value = parseFloat(event.target.value);
    if (Number.isNaN(value)) return;
    onChange(value);
  };
}

/**
 * A number field with a drag handle, replacing a slider + number pair.
 *
 * A slider costs a whole row and can only address the range it was given; a
 * scrub handle is the same gesture in a fraction of the width, and the field
 * next to it still takes a typed value. `suffix` labels the unit when one helps.
 *
 * @param {{ id: string, testId?: string, value: number|string, icon?: string, step?: number, min?: number, max?: number, suffix?: string }} config
 * @returns {string}
 */
export function scrubControl({ id, testId, value, icon = 'MoveHorizontal', step = 1, min, max, suffix = '' }) {
  const testAttr = testId ? `data-testid="${testId}"` : '';
  const bounds = `${min === undefined ? '' : `min="${min}"`} ${max === undefined ? '' : `max="${max}"`}`;

  return `
    <label class="si-spacing-pill si-scrub">
      <span class="si-scrub-handle" id="${id}-handle" title="Drag to change">${siIcon(icon, 12)}</span>
      <input type="number" class="si-spacing-edge" ${testAttr}
             id="${id}" value="${value}" step="${step}" ${bounds}>
      ${suffix ? `<span class="si-scrub-suffix">${escapeHtml(suffix)}</span>` : ''}
    </label>
  `;
}

/**
 * Wires a `scrubControl`: horizontal drag on the handle, typing in the field.
 *
 * The handle focuses the input before the drag starts. That is not cosmetic —
 * the panel skips its rebuild while a field inside it holds focus, and without
 * that the first applied value would re-render the panel out from under the
 * pointer mid-drag.
 *
 * @param {Element} panel
 * @param {string} id - the control id passed to `scrubControl`
 * @param {{ step?: number, min?: number, max?: number }} bounds
 * @param {(value: number) => void} onChange
 */
export function bindScrub(panel, id, { step = 1, min, max } = {}, onChange) {
  const input = panel.querySelector(`#${id}`);
  const handle = panel.querySelector(`#${id}-handle`);
  if (!input) return;

  // How many decimals the step implies, so a 0.01 scrub does not accumulate
  // floating-point dust into the value the user sees.
  const decimals = `${step}`.includes('.') ? `${step}`.split('.')[1].length : 0;

  const clamp = value => {
    let next = value;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return Number(next.toFixed(decimals));
  };

  bindNumber(panel, `#${id}`, value => onChange(clamp(value)));

  if (!handle) return;

  handle.onpointerdown = event => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('scrubbing');
    input.focus();

    const startX = event.clientX;
    const startValue = parseFloat(input.value) || 0;

    const onMove = moveEvent => {
      const next = clamp(startValue + (moveEvent.clientX - startX) * step);
      input.value = `${next}`;
      onChange(next);
    };

    const onUp = () => {
      handle.classList.remove('scrubbing');
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };
}

/**
 * Binds a free-text input, applying on every keystroke.
 * @param {Element} panel
 * @param {string} selector
 * @param {(value: string) => void} onChange
 */
export function bindText(panel, selector, onChange) {
  const input = panel.querySelector(selector);
  if (!input) return;
  input.oninput = event => onChange(event.target.value);
}

/**
 * Binds a <select>.
 * @param {Element} panel
 * @param {string} selector
 * @param {(value: string) => void} onChange
 */
export function bindSelect(panel, selector, onChange) {
  const select = panel.querySelector(selector);
  if (!select) return;
  select.onchange = event => onChange(event.target.value);
}

/**
 * Renders a labelled row containing arbitrary control markup.
 *
 * The control is wrapped rather than dropped straight into the row: the row is
 * a two-column grid now, and several callers pass more than one element (a
 * slider *and* a number field, a swatch *and* a text input), which would
 * otherwise spill into a third, non-existent column.
 *
 * A row can also go `wide`, which drops the label onto its own line and gives
 * the control the full panel width — what a six- or seven-option segmented
 * track needs before its icons start colliding.
 *
 * @param {string} label
 * @param {string} control
 * @param {{ wide?: boolean }} [options]
 * @returns {string}
 */
export function controlRow(label, control, { wide = false } = {}) {
  return `
    <div class="si-control-row ${wide ? 'si-control-row-wide' : ''}">
      <span class="si-control-label">${escapeHtml(label)}</span>
      <div class="si-control-field">${control}</div>
    </div>
  `;
}

/**
 * A length field paired with a unit dropdown, the way Framer edits width and
 * height. The value field stays a text input on purpose: a keyword unit blanks
 * it, but an expression the dropdown cannot model (`calc(100% - 2rem)`) still
 * has somewhere to live.
 *
 * @param {{ valueId: string, unitId: string, testId?: string, value: string, units: string[], placeholder?: string }} config
 * @returns {string}
 */
export function comboControl({ valueId, unitId, testId, value, units, placeholder = '' }) {
  const testAttr = testId ? `data-testid="${testId}"` : '';
  const parts = splitLength(value);

  // A unit already on the value but missing from the offered list still has to
  // be selectable, or rendering would silently switch the element's unit.
  const offered = parts.unit && !units.includes(parts.unit) ? [...units, parts.unit] : units;

  const options = offered
    .map(
      unit =>
        `<option value="${escapeHtml(unit)}" ${unit === parts.unit ? 'selected' : ''}>${escapeHtml(unit)}</option>`
    )
    .join('');

  return `
    <div class="si-combo">
      <input type="text" class="si-input-text si-combo-value" ${testAttr}
             id="${valueId}" value="${escapeHtml(parts.number)}"
             placeholder="${escapeHtml(placeholder)}"
             ${parts.keyword ? 'disabled' : ''}
             spellcheck="false" autocomplete="off">
      <label class="si-select-wrap si-combo-unit">
        <select id="${unitId}" aria-label="Unit">
          <option value="" ${parts.unit ? '' : 'selected'}>—</option>
          ${options}
        </select>
        ${siIcon('ChevronDown', 12)}
      </label>
    </div>
  `;
}

/**
 * Wires a `comboControl` and reports the recombined CSS value.
 *
 * Switching to a keyword unit (`auto`, `fit-content`) writes the keyword and
 * blanks the number; switching back to a real unit with nothing typed yet
 * writes nothing at all and just hands the user the focused field, rather than
 * silently collapsing the element to `0px`.
 *
 * @param {Element} panel
 * @param {{ valueId: string, unitId: string }} ids
 * @param {(value: string) => void} onChange
 */
export function bindCombo(panel, { valueId, unitId }, onChange) {
  const value = panel.querySelector(`#${valueId}`);
  const unit = panel.querySelector(`#${unitId}`);
  if (!value || !unit) return;

  value.oninput = () => onChange(joinLength(value.value, unit.value));

  unit.onchange = () => {
    const isKeyword = unit.value && !LENGTH_UNITS.includes(unit.value);

    if (isKeyword) {
      value.value = '';
      value.disabled = true;
      onChange(unit.value);
      return;
    }

    value.disabled = false;
    if (!value.value.trim()) {
      value.focus();
      return;
    }
    onChange(joinLength(value.value, unit.value));
  };
}

/**
 * Renders a <select> with the current value preselected.
 * @param {{ id: string, testId?: string, label: string, value: string, options: Array<string|{value: string, label: string}> }} config
 * @returns {string}
 */
export function selectControl({ id, testId, label, value, options }) {
  const testAttr = testId ? `data-testid="${testId}"` : '';
  const markup = options
    .map(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label;
      const selected = `${value}` === `${optionValue}` ? 'selected' : '';
      return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
    })
    .join('');

  return `
    <label class="si-select-wrap">
      <select id="${id}" ${testAttr} aria-label="${escapeHtml(label)}">${markup}</select>
      ${siIcon('ChevronDown', 13)}
    </label>
  `;
}

/**
 * A segmented control: one filled track holding a button per option, with the
 * current one lit. This is what replaces a `<select>` wherever the choices are
 * few and comparable — picking a flex direction from a dropdown means reading a
 * list to change something you can point at.
 *
 * An option is `{ value, label }` for text or `{ value, icon, title }` for a
 * glyph. A current value the option list does not contain is appended as its
 * own segment, so rendering can never silently misreport the element.
 *
 * @param {{ id: string, testId?: string, label: string, value: string, options: Array<object> }} config
 * @returns {string}
 */
export function segmented({ id, testId, label, value, options }) {
  const testAttr = testId ? `data-testid="${testId}"` : '';
  const known = options.some(option => `${option.value}` === `${value}`);
  const all = known || value === undefined || value === '' ? options : [...options, { value, label: value }];

  const buttons = all
    .map(option => {
      const active = `${option.value}` === `${value}` ? 'active' : '';
      const title = option.title || option.label || option.value;
      const content = option.icon ? siIcon(option.icon, 15) : escapeHtml(option.label || option.value);
      // The id is what lets the panel hand focus back to this exact segment
      // after the rebuild a click triggers.
      return `<button type="button" class="si-segment ${active}"
                      id="${id}-${escapeHtml(option.value)}"
                      data-value="${escapeHtml(option.value)}"
                      title="${escapeHtml(title)}"
                      aria-label="${escapeHtml(title)}"
                      aria-pressed="${active ? 'true' : 'false'}">${content}</button>`;
    })
    .join('');

  return `
    <div class="si-segmented" id="${id}" ${testAttr} role="group" aria-label="${escapeHtml(label)}">
      ${buttons}
    </div>
  `;
}

/**
 * Wires a segmented control. The active class is moved locally rather than by
 * re-rendering, so a rapid series of clicks does not fight the panel rebuild.
 * @param {Element} panel
 * @param {string} selector
 * @param {(value: string) => void} onChange
 */
export function bindSegmented(panel, selector, onChange) {
  const group = panel.querySelector(selector);
  if (!group) return;

  group.querySelectorAll('[data-value]').forEach(button => {
    button.onclick = () => {
      group.querySelectorAll('[data-value]').forEach(other => {
        const isActive = other === button;
        other.classList.toggle('active', isActive);
        other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      onChange(button.getAttribute('data-value'));
    };
  });
}

/**
 * Renders a colour swatch paired with a free-text field, so a value the native
 * picker cannot express (`transparent`, `currentColor`, an rgba()) stays typable.
 * @param {{ pickerId: string, inputId: string, testId?: string, value: string, fallback: string, placeholder?: string }} config
 * @param {(color: string, fallback: string) => string} toHex
 * @returns {string}
 */
export function colorControl(
  { pickerId, inputId, testId, value, fallback, placeholder = '' },
  toHex
) {
  const testAttr = testId ? `data-testid="${testId}"` : '';
  return `
    <div class="si-color-picker-wrap">
      <input type="color" class="si-color-swatch" value="${toHex(value, fallback)}" id="${pickerId}">
      <input type="text" class="si-input-text" ${testAttr}
             value="${escapeHtml(value || '')}" id="${inputId}"
             placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
}

/**
 * Keeps a colour swatch and its text field in step, and pushes changes to state.
 * @param {{ panel: Element, state: object, item: object }} context
 * @param {string} pickerId
 * @param {string} inputId
 * @param {string} prop
 */
export function bindColor({ panel, state, item }, pickerId, inputId, prop) {
  const picker = panel.querySelector(pickerId);
  const input = panel.querySelector(inputId);

  if (picker) {
    picker.oninput = event => {
      if (input) input.value = event.target.value;
      state.updateStyle(item.id, prop, event.target.value);
    };
  }

  if (input) {
    input.oninput = event => {
      const value = event.target.value.trim();
      // Only mirror into the native picker when the text is a hex colour it
      // can actually represent.
      if (picker && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
        picker.value = value;
      }
      state.updateStyle(item.id, prop, value);
    };
  }
}
