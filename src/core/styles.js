/**
 * Style Reader, Mutator, and Diff Calculator
 *
 * Every function here iterates `SCHEMA` from `./schema.js` rather than carrying
 * its own list of properties, so adding a property is a single schema entry.
 */

import { parsePx, rgbToHex, parseNumber } from './css-value.js';
import {
  SCHEMA,
  SHORTHAND_GROUPS,
  getDescriptor,
  inlineCssProperties,
  formatValue
} from './schema.js';

// Re-exported so existing importers (and tests) keep working after these
// primitives moved out into ./css-value.js.
export { parsePx, rgbToHex, parseNumber };

/**
 * Slider starting position used when a page declares `line-height: normal`.
 * This is a UI convenience only — `lineHeightSource` records that the real
 * declared value was `normal`, and the diff reports it as such.
 */
export const DEFAULT_LINE_HEIGHT = 1.4;

/**
 * Reads line-height, keeping track of what the page actually declared.
 * @param {CSSStyleDeclaration} computed
 * @param {number} fontSize
 * @returns {{ lineHeight: number, lineHeightSource: 'normal'|'ratio'|'px' }}
 */
function readLineHeight(computed, fontSize) {
  const raw = computed.lineHeight;

  if (!raw || raw === 'normal') {
    return { lineHeight: DEFAULT_LINE_HEIGHT, lineHeightSource: 'normal' };
  }

  if (raw.endsWith('px')) {
    const lhPx = parsePx(raw, 0);
    if (fontSize > 0) {
      // Express as a ratio, e.g. 24px / 16px = 1.5
      return {
        lineHeight: Math.round((lhPx / fontSize) * 100) / 100,
        lineHeightSource: 'ratio'
      };
    }
    return { lineHeight: lhPx, lineHeightSource: 'px' };
  }

  const parsed = parseFloat(raw);
  return Number.isFinite(parsed)
    ? { lineHeight: parsed, lineHeightSource: 'ratio' }
    : { lineHeight: DEFAULT_LINE_HEIGHT, lineHeightSource: 'normal' };
}

/**
 * Reads initial style baseline for the target element.
 * @param {Element} element
 * @param {Window} [win]
 * @returns {object}
 */
export function readElementStyles(element, win = (typeof window !== 'undefined' ? window : null)) {
  if (!element || !win) {
    return createDefaultStyles();
  }

  const computed = win.getComputedStyle(element);
  const record = {};

  for (const descriptor of SCHEMA) {
    if (descriptor.read) {
      record[descriptor.key] = descriptor.read(computed);
    }
  }

  // line-height is read last because it needs the resolved font size, and
  // because its `normal` case carries extra state the schema cannot express.
  const { lineHeight, lineHeightSource } = readLineHeight(computed, record.fontSize);
  record.lineHeight = lineHeight;
  record.lineHeightSource = lineHeightSource;

  return record;
}

/**
 * Font sizes an export needs in order to convert px into rem or em.
 *
 * Captured at pin time rather than at export time so the numbers describe the
 * element as it was when the user adjusted it.
 * @param {Element} element
 * @param {Window} [win]
 * @returns {{ rootFontSize: number, parentFontSize: number }}
 */
export function readUnitContext(element, win = (typeof window !== 'undefined' ? window : null)) {
  const fallback = { rootFontSize: 16, parentFontSize: 16 };
  if (!element || !win || typeof win.getComputedStyle !== 'function') return fallback;

  const doc = element.ownerDocument || win.document;
  const root = doc && doc.documentElement;
  const parent = element.parentElement;

  return {
    rootFontSize: root ? parsePx(win.getComputedStyle(root).fontSize, 16) : 16,
    parentFontSize: parent ? parsePx(win.getComputedStyle(parent).fontSize, 16) : 16
  };
}

/**
 * Creates default style baseline.
 * @returns {object}
 */
export function createDefaultStyles() {
  const record = {};
  for (const descriptor of SCHEMA) {
    record[descriptor.key] = descriptor.default;
  }
  record.lineHeightSource = 'normal';
  return record;
}

/**
 * Stores the original inline styles of an element before the inspector modifies it.
 * @type {WeakMap<Element, object>}
 */
const originalInlineStyles = new WeakMap();

/**
 * Captures the current inline styles for restoration.
 * @param {HTMLElement} element
 */
export function captureOriginalInline(element) {
  if (!element || originalInlineStyles.has(element)) return;

  const saved = {};
  for (const prop of inlineCssProperties()) {
    saved[prop] = element.style.getPropertyValue(prop);
  }
  originalInlineStyles.set(element, saved);
}

/**
 * Applies a specific property change live to the DOM element.
 * @param {HTMLElement} element
 * @param {string} prop - style-record key, e.g. 'paddingTop', 'fontSize'
 * @param {number|string} val
 * @param {string} [unit='px'] - only used for numeric length properties
 */
export function applyStyleProperty(element, prop, val, unit = 'px') {
  if (!element || !element.style) return;

  const descriptor = getDescriptor(prop);
  if (!descriptor) return;

  captureOriginalInline(element);

  const formatted = descriptor.type === 'length' ? `${val}${unit}` : `${val}`;
  element.style.setProperty(descriptor.css, formatted);
}

/**
 * Reverts element inline styles back to their original state prior to inspection.
 * @param {HTMLElement} element
 */
export function resetElementStyles(element) {
  if (!element || !originalInlineStyles.has(element)) return;
  const saved = originalInlineStyles.get(element);

  for (const [prop, val] of Object.entries(saved)) {
    if (val) {
      element.style.setProperty(prop, val);
    } else {
      element.style.removeProperty(prop);
    }
  }
  originalInlineStyles.delete(element);
}

/**
 * Emits diff lines for a four-sided group, collapsing to the shorthand when
 * every side agrees on both the baseline and the current value.
 * @param {Array} diffs
 * @param {object} group
 * @param {object} baseline
 * @param {object} current
 */
function pushShorthandDiff(diffs, group, baseline, current, beforeContext, afterContext) {
  const { keys, sideCss, css } = group;

  const changed = keys.some(key => baseline[key] !== current[key]);
  if (!changed) return;

  const allSame = record => keys.every(key => record[key] === record[keys[0]]);
  const descriptor = getDescriptor(keys[0]);

  if (allSame(baseline) && allSame(current)) {
    diffs.push({
      property: css,
      before: formatValue(descriptor, baseline[keys[0]], beforeContext),
      after: formatValue(descriptor, current[keys[0]], afterContext)
    });
    return;
  }

  keys.forEach((key, index) => {
    if (baseline[key] === current[key]) return;
    diffs.push({
      property: sideCss[index],
      before: formatValue(descriptor, baseline[key], beforeContext),
      after: formatValue(descriptor, current[key], afterContext)
    });
  });
}

/**
 * True when a property's value actually changed in a way worth reporting.
 *
 * Numeric properties compare directly, so a legitimate change to 0 is kept.
 * Textual properties require both sides to be present, so a partially
 * populated record does not produce `undefined → red` noise.
 * @param {object} descriptor
 * @param {object} baseline
 * @param {object} current
 * @returns {boolean}
 */
function hasChanged(descriptor, baseline, current) {
  const before = baseline[descriptor.key];
  const after = current[descriptor.key];

  if (descriptor.type === 'length' || descriptor.type === 'number') {
    return before !== after;
  }

  return Boolean(before) && Boolean(after) && `${before}` !== `${after}`;
}

/**
 * Computes difference between baseline styles and current styles.
 * Groups symmetric paddings/margins/corner radii when all 4 sides match.
 * @param {object} baseline
 * @param {object} current
 * @param {{ unit?: string, rootFontSize?: number, elementFontSize?: number, parentFontSize?: number }} [context]
 *   Export unit and the font sizes lengths are converted against. Omitted or
 *   `px` reproduces the original output exactly.
 * @returns {Array<{ property: string, before: string, after: string }>}
 */
export function computeStyleDiff(baseline, current, context = {}) {
  const diffs = [];

  // `em` resolves against the element's own font size, which the user may have
  // just changed. The before value must use the size it had, and the after
  // value the size it now has, or the emitted CSS would not reproduce the
  // measurement it claims to describe.
  const before = { ...context, elementFontSize: baseline.fontSize };
  const after = { ...context, elementFontSize: current.fontSize };

  for (const group of SHORTHAND_GROUPS) {
    pushShorthandDiff(diffs, group, baseline, current, before, after);
  }

  for (const descriptor of SCHEMA) {
    // Four-sided properties were already handled by their group above.
    if (descriptor.shorthand) continue;

    if (descriptor.key === 'lineHeight') {
      if (baseline.lineHeight !== current.lineHeight) {
        // A baseline of `normal` has no numeric value the page ever declared,
        // so report the keyword rather than the control's placeholder position.
        const before =
          baseline.lineHeightSource === 'normal'
            ? 'normal'
            : `${baseline.lineHeight}${baseline.lineHeightSource === 'px' ? 'px' : ''}`;
        diffs.push({ property: 'line-height', before, after: `${current.lineHeight}` });
      }
      continue;
    }

    if (!hasChanged(descriptor, baseline, current)) continue;

    diffs.push({
      property: descriptor.css,
      before: formatValue(descriptor, baseline[descriptor.key], before),
      after: formatValue(descriptor, current[descriptor.key], after)
    });
  }

  return diffs;
}
