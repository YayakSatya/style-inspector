/**
 * Layout section — display, and the flex/grid alignment controls.
 *
 * The alignment controls only appear when the element actually lays out its
 * children, so a plain block does not get four inert dropdowns.
 *
 * Everything here is a segmented control rather than a dropdown: these are
 * small, comparable sets of choices you should be able to point at. `display`
 * keeps a dropdown alongside its segments, because its eight values do not fit
 * a track and the rarer ones (`inline-flex`, `inline-grid`) still have to be
 * reachable from any starting point.
 */

import {
  section,
  controlRow,
  selectControl,
  segmented,
  bindSelect,
  bindSegmented
} from './shared.js';

export const id = 'layout';

const DISPLAYS = ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'];

/** The four display values worth a one-click segment. */
const DISPLAY_SEGMENTS = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'none', label: 'None' }
];

const DIRECTIONS = [
  { value: 'row', icon: 'ArrowRight', title: 'Row' },
  { value: 'row-reverse', icon: 'ArrowLeft', title: 'Row reverse' },
  { value: 'column', icon: 'ArrowDown', title: 'Column' },
  { value: 'column-reverse', icon: 'ArrowUp', title: 'Column reverse' }
];

const WRAPS = [
  { value: 'nowrap', label: 'No' },
  { value: 'wrap', label: 'Yes' },
  { value: 'wrap-reverse', label: 'Rev', title: 'Wrap reverse' }
];

const JUSTIFY = [
  { value: 'flex-start', icon: 'AlignHorizontalJustifyStart', title: 'Start' },
  { value: 'center', icon: 'AlignHorizontalJustifyCenter', title: 'Center' },
  { value: 'flex-end', icon: 'AlignHorizontalJustifyEnd', title: 'End' },
  { value: 'space-between', icon: 'AlignHorizontalSpaceBetween', title: 'Space between' },
  { value: 'space-around', icon: 'AlignHorizontalSpaceAround', title: 'Space around' },
  { value: 'space-evenly', icon: 'AlignHorizontalDistributeCenter', title: 'Space evenly' }
];

const ALIGN = [
  { value: 'stretch', icon: 'StretchVertical', title: 'Stretch' },
  { value: 'flex-start', icon: 'AlignStartHorizontal', title: 'Start' },
  { value: 'center', icon: 'AlignCenterHorizontal', title: 'Center' },
  { value: 'flex-end', icon: 'AlignEndHorizontal', title: 'End' },
  { value: 'baseline', icon: 'Baseline', title: 'Baseline' }
];

/**
 * Chrome reports an unset `justify-content` or `align-items` as `normal`, and
 * accepts `start`/`end` as aliases of the flex keywords. Folding those onto the
 * value the track actually offers stops the control growing a stray segment for
 * a value the user never chose.
 */
const SYNONYMS = {
  justifyContent: { normal: 'flex-start', start: 'flex-start', end: 'flex-end', left: 'flex-start', right: 'flex-end' },
  alignItems: { normal: 'stretch', start: 'flex-start', end: 'flex-end' }
};

/**
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function canonical(key, value) {
  const map = SYNONYMS[key] || {};
  const current = `${value || ''}`.trim();
  return map[current] || current;
}

/**
 * Whether the element's own display makes the flex/grid controls meaningful.
 * @param {string} display
 * @returns {boolean}
 */
function laysOutChildren(display) {
  return typeof display === 'string' && /flex|grid/.test(display);
}

export function render(item) {
  const cur = item.current;

  const displayControl = `
    <div class="si-combo si-combo-wide">
      ${segmented({
        id: 'display-segments',
        label: 'Display',
        value: cur.display,
        options: DISPLAY_SEGMENTS
      })}
      ${selectControl({
        id: 'display-select',
        testId: 'style_inspector_panel_display_select',
        label: 'Display (all values)',
        value: cur.display,
        options: DISPLAYS
      })}
    </div>
  `;

  const rows = [controlRow('Display', displayControl)];

  if (laysOutChildren(cur.display)) {
    rows.push(
      controlRow(
        'Direction',
        segmented({
          id: 'flex-direction-segments',
          testId: 'style_inspector_panel_flex_direction_select',
          label: 'Flex direction',
          value: cur.flexDirection,
          options: DIRECTIONS
        })
      ),
      controlRow(
        'Wrap',
        segmented({
          id: 'flex-wrap-segments',
          label: 'Flex wrap',
          value: cur.flexWrap,
          options: WRAPS
        })
      ),
      controlRow(
        'Justify',
        segmented({
          id: 'justify-content-segments',
          testId: 'style_inspector_panel_justify_content_select',
          label: 'Justify content',
          value: canonical('justifyContent', cur.justifyContent),
          options: JUSTIFY
        }),
        { wide: true }
      ),
      controlRow(
        'Align',
        segmented({
          id: 'align-items-segments',
          testId: 'style_inspector_panel_align_items_select',
          label: 'Align items',
          value: canonical('alignItems', cur.alignItems),
          options: ALIGN
        }),
        { wide: true }
      )
    );
  }

  return section({ title: 'Layout', body: rows.join('') });
}

export function bind({ panel, state, item }) {
  const set = (prop, value) => state.updateStyle(item.id, prop, value);

  // Display has two controls driving one property; each mirrors the other so
  // the pair never disagrees between renders.
  const select = panel.querySelector('#display-select');
  const segments = panel.querySelector('#display-segments');

  bindSegmented(panel, '#display-segments', value => {
    if (select) select.value = value;
    set('display', value);
  });

  bindSelect(panel, '#display-select', value => {
    if (segments) {
      segments.querySelectorAll('[data-value]').forEach(button => {
        const isActive = button.getAttribute('data-value') === value;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
    set('display', value);
  });

  bindSegmented(panel, '#flex-direction-segments', value => set('flexDirection', value));
  bindSegmented(panel, '#flex-wrap-segments', value => set('flexWrap', value));
  bindSegmented(panel, '#justify-content-segments', value => set('justifyContent', value));
  bindSegmented(panel, '#align-items-segments', value => set('alignItems', value));
}
