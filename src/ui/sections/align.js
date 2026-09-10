/**
 * The align rail — the row of icons that sits above every section and places
 * the element inside its parent.
 *
 * It is not a section: no title, no collapse, no divider. It is the first thing
 * in the panel body because "put this thing where it belongs" is the most
 * common adjustment there is.
 *
 * `justify-self` and `align-self` only mean something inside a flex or grid
 * parent. Rather than offer eight buttons that silently do nothing, the rail
 * disables itself and says why when the parent lays its children out some other
 * way — the same honesty the Layout section applies to its flex controls.
 */

import { siIcon, escapeHtml } from './shared.js';

export const id = 'align';

/** Horizontal placement — `justify-self`. */
const HORIZONTAL = [
  { value: 'start', icon: 'AlignStartVertical', title: 'Align left' },
  { value: 'center', icon: 'AlignCenterVertical', title: 'Align horizontal centre' },
  { value: 'end', icon: 'AlignEndVertical', title: 'Align right' },
  { value: 'stretch', icon: 'StretchHorizontal', title: 'Stretch horizontally' }
];

/** Vertical placement — `align-self`. */
const VERTICAL = [
  { value: 'start', icon: 'AlignStartHorizontal', title: 'Align top' },
  { value: 'center', icon: 'AlignCenterHorizontal', title: 'Align vertical centre' },
  { value: 'end', icon: 'AlignEndHorizontal', title: 'Align bottom' },
  { value: 'stretch', icon: 'StretchVertical', title: 'Stretch vertically' }
];

/** CSS values that mean the same placement under a different name. */
const SYNONYMS = {
  'flex-start': 'start',
  'flex-end': 'end',
  normal: 'stretch',
  auto: ''
};

/**
 * Normalises a computed self-alignment value onto the rail's four buttons.
 * @param {string} value
 * @returns {string}
 */
function normalize(value) {
  const key = `${value || ''}`.trim();
  return key in SYNONYMS ? SYNONYMS[key] : key;
}

/**
 * Whether the element's parent lays its children out, which is the only case
 * where these properties do anything.
 * @param {object} item
 * @returns {boolean}
 */
function parentLaysOut(item) {
  const parent = item.element && item.element.parentElement;
  if (!parent || typeof getComputedStyle !== 'function') return false;
  return /flex|grid/.test(getComputedStyle(parent).display || '');
}

/**
 * @param {Array<object>} options
 * @param {string} axis - 'justify' or 'align'
 * @param {string} value
 * @param {boolean} enabled
 * @returns {string}
 */
function railGroup(options, axis, value, enabled) {
  const current = normalize(value);

  return options
    .map(
      option => `
        <button type="button"
                class="si-rail-btn ${option.value === current ? 'active' : ''}"
                id="rail-${axis}-${option.value}"
                data-rail-axis="${axis}"
                data-value="${option.value}"
                title="${escapeHtml(option.title)}"
                aria-label="${escapeHtml(option.title)}"
                aria-pressed="${option.value === current ? 'true' : 'false'}"
                ${enabled ? '' : 'disabled'}>${siIcon(option.icon, 16)}</button>
      `
    )
    .join('');
}

export function render(item) {
  const enabled = parentLaysOut(item);
  const hint = enabled
    ? 'Place this element inside its parent'
    : 'The parent is not a flex or grid container, so these have no effect';

  return `
    <div class="si-align-rail ${enabled ? '' : 'disabled'}"
         data-testid="style_inspector_panel_align_rail"
         role="group" aria-label="Self alignment" title="${escapeHtml(hint)}">
      ${railGroup(HORIZONTAL, 'justify', item.current.justifySelf, enabled)}
      <span class="si-rail-divider" aria-hidden="true"></span>
      ${railGroup(VERTICAL, 'align', item.current.alignSelf, enabled)}
    </div>
  `;
}

export function bind({ panel, state, item }) {
  panel.querySelectorAll('[data-rail-axis]').forEach(button => {
    button.onclick = () => {
      const axis = button.getAttribute('data-rail-axis');
      const value = button.getAttribute('data-value');
      const property = axis === 'justify' ? 'justifySelf' : 'alignSelf';

      // Clicking the lit button clears the placement rather than re-applying
      // it, so the rail can be undone without reaching for Reset.
      const isActive = button.classList.contains('active');

      panel.querySelectorAll(`[data-rail-axis="${axis}"]`).forEach(other => {
        const nowActive = !isActive && other === button;
        other.classList.toggle('active', nowActive);
        other.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
      });

      state.updateStyle(item.id, property, isActive ? 'auto' : value);
    };
  });
}
