/**
 * Property Schema
 *
 * The single source of truth for every CSS property the inspector understands.
 *
 * Before this file existed, adding one property meant editing six hardcoded
 * lists that had to stay in sync: the reader, the defaults, the inline-style
 * snapshot, the CSS property map, the string-vs-number test in the state
 * machine, and a bespoke `if` block in the differ. That duplication is why the
 * property set never grew. Now each of those is a loop over `SCHEMA`, and a new
 * property is one entry here plus one control in the panel.
 *
 * Descriptor fields:
 *   key      — the field name on a style record
 *   css      — the CSS property it writes
 *   type     — how the value is read, written, and diffed (see TYPES below)
 *   group    — which panel section renders it
 *   default  — value used when an element cannot be read
 *   read     — pulls the value out of a CustomStyleDeclaration
 *   extraCss — additional CSS properties to snapshot for restoration
 *
 * Types:
 *   'length'  — a number written with a px suffix
 *   'number'  — a unitless number (opacity, line-height ratio)
 *   'keyword' — a CSS keyword written verbatim
 *   'color'   — a color string written verbatim
 *   'raw'     — free-form text, so values like `auto`, `50%`, or a full
 *               box-shadow can be typed directly
 */

import { parsePx, parseNumber, normalizeBoxShadow, formatLength } from './css-value.js';

/**
 * Shorthand groups collapse four sides into one line when every side agrees, so
 * an export reads `padding: 12px → 20px` rather than four separate lines.
 * @type {Array<{ name: string, css: string, keys: string[], linkFlag: string, group: string }>}
 */
export const SHORTHAND_GROUPS = [
  {
    name: 'padding',
    css: 'padding',
    keys: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    // The longhand CSS property for each key. Note this is not always
    // `<shorthand>-<side>`: border-radius corners are `border-top-left-radius`.
    sideCss: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    sides: ['top', 'right', 'bottom', 'left'],
    allProp: 'paddingAll',
    linkFlag: 'linkPadding',
    group: 'spacing'
  },
  {
    name: 'margin',
    css: 'margin',
    keys: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    sideCss: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    sides: ['top', 'right', 'bottom', 'left'],
    allProp: 'marginAll',
    linkFlag: 'linkMargin',
    group: 'spacing'
  },
  {
    name: 'border-radius',
    css: 'border-radius',
    keys: [
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomRightRadius',
      'borderBottomLeftRadius'
    ],
    sideCss: [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius'
    ],
    sides: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
    allProp: 'borderRadiusAll',
    linkFlag: 'linkRadius',
    group: 'border'
  }
];

/**
 * Every property, in the order its diff lines are emitted.
 *
 * Order is part of the export contract: the four-sided groups lead, then the
 * long-standing spacing and typography properties in their original sequence,
 * then everything added later. Changing the order of the first eleven entries
 * changes existing exports, so append rather than reorder.
 */
export const SCHEMA = [
  // --- Four-sided groups (padding, margin, border-radius) ---
  ...SHORTHAND_GROUPS.flatMap(group =>
    group.keys.map((key, index) => ({
      key,
      css: group.sideCss[index],
      type: 'length',
      group: group.group,
      default: 0,
      shorthand: group.name,
      read: computed => parsePx(computed[toCamel(group.sideCss[index])], 0)
    }))
  ),

  // --- Spacing ---
  {
    key: 'gap',
    css: 'gap',
    type: 'length',
    group: 'spacing',
    default: 0,
    // Writing `gap` sets both axes, so both must be snapshotted to restore.
    extraCss: ['row-gap', 'column-gap'],
    read: computed => {
      const rowGap = parsePx(computed.rowGap, 0);
      const colGap = parsePx(computed.columnGap, 0);
      return rowGap || colGap || parsePx(computed.gap, 0);
    }
  },

  // --- Typography ---
  {
    key: 'fontSize',
    css: 'font-size',
    type: 'length',
    group: 'typography',
    default: 16,
    read: computed => parsePx(computed.fontSize, 16)
  },
  {
    // line-height is read by `readElementStyles` itself, because a value of
    // `normal` has to be recorded separately in `lineHeightSource`.
    key: 'lineHeight',
    css: 'line-height',
    type: 'number',
    group: 'typography',
    default: 1.4,
    read: null
  },
  {
    key: 'letterSpacing',
    css: 'letter-spacing',
    type: 'length',
    group: 'typography',
    default: 0,
    read: computed =>
      computed.letterSpacing && computed.letterSpacing !== 'normal'
        ? parsePx(computed.letterSpacing, 0)
        : 0
  },
  {
    key: 'fontWeight',
    css: 'font-weight',
    type: 'keyword',
    group: 'typography',
    default: '400',
    read: computed => {
      let weight = computed.fontWeight ? `${computed.fontWeight}` : '400';
      if (weight === 'normal') weight = '400';
      if (weight === 'bold') weight = '700';
      return weight;
    }
  },
  {
    key: 'textTransform',
    css: 'text-transform',
    type: 'keyword',
    group: 'typography',
    default: 'none',
    read: computed => computed.textTransform || 'none'
  },
  {
    key: 'color',
    css: 'color',
    type: 'color',
    group: 'color',
    default: 'rgb(0, 0, 0)',
    read: computed => computed.color || 'rgb(0, 0, 0)'
  },
  {
    key: 'backgroundColor',
    css: 'background-color',
    type: 'color',
    group: 'color',
    default: 'transparent',
    read: computed => computed.backgroundColor || 'transparent'
  },
  {
    key: 'textAlign',
    css: 'text-align',
    type: 'keyword',
    group: 'typography',
    default: 'left',
    read: computed => computed.textAlign || 'left'
  },
  {
    key: 'fontFamily',
    css: 'font-family',
    type: 'raw',
    group: 'typography',
    default: '',
    read: computed => computed.fontFamily || ''
  },

  // --- Border ---
  {
    key: 'borderWidth',
    css: 'border-width',
    type: 'length',
    group: 'border',
    default: 0,
    extraCss: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    read: computed => parsePx(computed.borderTopWidth, 0)
  },
  {
    key: 'borderStyle',
    css: 'border-style',
    type: 'keyword',
    group: 'border',
    default: 'none',
    extraCss: ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
    read: computed => computed.borderTopStyle || 'none'
  },
  {
    key: 'borderColor',
    css: 'border-color',
    type: 'color',
    group: 'border',
    default: 'rgb(0, 0, 0)',
    extraCss: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
    read: computed => computed.borderTopColor || 'rgb(0, 0, 0)'
  },

  // --- Effects ---
  {
    key: 'boxShadow',
    css: 'box-shadow',
    type: 'raw',
    group: 'effects',
    default: 'none',
    // Normalized on read so the field shows the authoring form rather than the
    // computed `rgba(...) 0px 2px 8px 0px`.
    read: computed => normalizeBoxShadow(computed.boxShadow)
  },
  {
    key: 'opacity',
    css: 'opacity',
    type: 'number',
    group: 'effects',
    default: 1,
    read: computed => parseNumber(computed.opacity, 1)
  },

  // --- Size ---
  // Raw, not length: these routinely hold `auto`, a percentage, or a clamp().
  {
    key: 'width',
    css: 'width',
    type: 'raw',
    group: 'size',
    default: 'auto',
    read: computed => computed.width || 'auto'
  },
  {
    key: 'height',
    css: 'height',
    type: 'raw',
    group: 'size',
    default: 'auto',
    read: computed => computed.height || 'auto'
  },
  {
    key: 'maxWidth',
    css: 'max-width',
    type: 'raw',
    group: 'size',
    default: 'none',
    read: computed => computed.maxWidth || 'none'
  },

  // --- Layout ---
  {
    key: 'display',
    css: 'display',
    type: 'keyword',
    group: 'layout',
    default: 'block',
    read: computed => computed.display || 'block'
  },
  {
    key: 'flexDirection',
    css: 'flex-direction',
    type: 'keyword',
    group: 'layout',
    default: 'row',
    read: computed => computed.flexDirection || 'row'
  },
  {
    key: 'flexWrap',
    css: 'flex-wrap',
    type: 'keyword',
    group: 'layout',
    default: 'nowrap',
    read: computed => computed.flexWrap || 'nowrap'
  },
  {
    key: 'justifyContent',
    css: 'justify-content',
    type: 'keyword',
    group: 'layout',
    default: 'flex-start',
    read: computed => computed.justifyContent || 'flex-start'
  },
  {
    key: 'alignItems',
    css: 'align-items',
    type: 'keyword',
    group: 'layout',
    default: 'stretch',
    read: computed => computed.alignItems || 'stretch'
  },

  // --- Self alignment (the align rail) ---
  // These place the element inside *its parent's* layout, so they only take
  // effect when that parent is a flex or grid container. The rail says as much
  // rather than offering controls that quietly do nothing.
  {
    key: 'justifySelf',
    css: 'justify-self',
    type: 'keyword',
    group: 'layout',
    default: 'auto',
    read: computed => computed.justifySelf || 'auto'
  },
  {
    key: 'alignSelf',
    css: 'align-self',
    type: 'keyword',
    group: 'layout',
    default: 'auto',
    read: computed => computed.alignSelf || 'auto'
  }
];

/**
 * Converts a dashed CSS property name to the camelCase key used by
 * CSSStyleDeclaration (`border-top-left-radius` → `borderTopLeftRadius`).
 * @param {string} dashed
 * @returns {string}
 */
function toCamel(dashed) {
  return dashed.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/** @type {Map<string, object>} */
const byKey = new Map(SCHEMA.map(descriptor => [descriptor.key, descriptor]));

/**
 * Descriptor for a style-record key, or undefined when the key is unknown.
 * @param {string} key
 * @returns {object|undefined}
 */
export function getDescriptor(key) {
  return byKey.get(key);
}

/**
 * True when a property's value is stored and written as text rather than as a
 * number — used by the state machine to decide how to coerce user input.
 *
 * Both `length` and `number` are numeric: the only difference is that a length
 * gains a px suffix when written. Storing a `number` as a string would make it
 * unequal to its numeric baseline and produce a phantom diff like
 * `opacity: 0.5 → 0.5`.
 * @param {string} key
 * @returns {boolean}
 */
export function isTextualProperty(key) {
  const descriptor = byKey.get(key);
  if (!descriptor) return false;
  return descriptor.type !== 'length' && descriptor.type !== 'number';
}

/**
 * Every CSS property name that must be snapshotted before the inspector writes
 * inline styles, so a reset can restore the element exactly.
 * @returns {string[]}
 */
export function inlineCssProperties() {
  const props = new Set();
  for (const descriptor of SCHEMA) {
    props.add(descriptor.css);
    for (const extra of descriptor.extraCss || []) {
      props.add(extra);
    }
  }
  return Array.from(props);
}

/**
 * The px size that one `em` represents for a given property.
 *
 * For most properties that is the element's own font size, but `font-size`
 * itself resolves against its parent — using the element's own size there would
 * report every font-size as `1em`.
 * @param {object} descriptor
 * @param {{ elementFontSize?: number, parentFontSize?: number }} context
 * @returns {number|undefined}
 */
function emBasis(descriptor, context) {
  return descriptor.key === 'fontSize' ? context.parentFontSize : context.elementFontSize;
}

/**
 * Renders a value for a diff line in the requested export unit.
 * @param {object} descriptor
 * @param {number|string} value
 * @param {{ unit?: string, rootFontSize?: number, elementFontSize?: number, parentFontSize?: number }} [context]
 * @returns {string}
 */
export function formatValue(descriptor, value, context = {}) {
  if (!descriptor) return `${value}`;
  if (descriptor.type !== 'length') return `${value}`;

  const unit = context.unit || 'px';
  const basis = unit === 'rem' ? context.rootFontSize : emBasis(descriptor, context);

  return formatLength(value, unit, { basis });
}

/**
 * The panel sections, in render order, with the properties each one owns.
 * @type {string[]}
 */
export const GROUPS = ['spacing', 'typography', 'color', 'border', 'effects', 'size', 'layout'];
