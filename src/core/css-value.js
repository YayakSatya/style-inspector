/**
 * CSS Value Parsing Primitives
 *
 * Extracted from `styles.js` so the property schema can use them without the
 * two modules importing each other in a cycle.
 */

/**
 * Parse a px string (e.g. "16px", "1.5px", "0px") into a float number.
 * Returns fallback if not parseable.
 * @param {string} val
 * @param {number} fallback
 * @returns {number}
 */
export function parsePx(val, fallback = 0) {
  if (!val || typeof val !== 'string') return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : Math.round(num * 100) / 100;
}

/**
 * Convert rgb/rgba or hex string to 6-digit hex format (#rrggbb) for <input type="color">
 * @param {string} colorStr
 * @param {string} [fallback='#000000']
 * @returns {string}
 */
export function rgbToHex(colorStr, fallback = '#000000') {
  if (!colorStr || typeof colorStr !== 'string') return fallback;
  const str = colorStr.trim();
  if (str.startsWith('#')) {
    if (str.length === 4) {
      return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`.toLowerCase();
    }
    if (str.length >= 7) {
      return str.slice(0, 7).toLowerCase();
    }
  }
  if (str === 'transparent' || str === 'rgba(0, 0, 0, 0)') {
    return fallback;
  }
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    const r = Math.min(255, parseInt(match[1], 10)).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(match[2], 10)).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(match[3], 10)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toLowerCase();
  }
  return fallback;
}

/**
 * Parse a unitless number (opacity, line-height ratio, font-weight).
 * @param {string|number} val
 * @param {number} fallback
 * @returns {number}
 */
export function parseNumber(val, fallback = 0) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
  if (!val || typeof val !== 'string') return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : Math.round(num * 1000) / 1000;
}

/** Units a length can be exported as. */
export const EXPORT_UNITS = ['px', 'rem', 'em'];

/**
 * Renders a number with at most 4 decimal places and no trailing zeros.
 * @param {number} value
 * @returns {string}
 */
function trimNumber(value) {
  return `${Math.round(value * 10000) / 10000}`;
}

/**
 * Renders a px measurement in the requested export unit.
 *
 * Values are always *read and applied* in px — that is what the panel controls
 * manipulate. Conversion happens only when the change is written out, so an
 * export can match the unit convention of the codebase receiving it.
 *
 * `%` is deliberately not offered: its basis differs per property (the
 * containing block's width for padding, the parent font size for font-size,
 * the element's own font size for line-height), so a single session-wide
 * percentage option would emit confidently wrong numbers.
 *
 * @param {number|string} value - measurement in px
 * @param {string} unit - 'px', 'rem', or 'em'
 * @param {{ basis?: number }} [context] - the px size one unit represents
 * @returns {string}
 */
export function formatLength(value, unit, context = {}) {
  const px = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(px)) return `${value}`;

  if (unit !== 'rem' && unit !== 'em') {
    return `${trimNumber(px)}px`;
  }

  const basis = context.basis;
  // Without a usable basis, px is the honest answer rather than a made-up ratio.
  if (!Number.isFinite(basis) || basis <= 0) {
    return `${trimNumber(px)}px`;
  }

  // Zero is unitless in every CSS unit, and `0rem` reads as a mistake.
  if (px === 0) return '0';

  return `${trimNumber(px / basis)}${unit}`;
}

/**
 * Splits a CSS value on a separator, ignoring separators inside parentheses so
 * `rgba(0, 0, 0, 0.1)` survives a split on commas.
 * @param {string} value
 * @param {string} separator
 * @returns {string[]}
 */
export function splitTopLevel(value, separator) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;

    if (char === separator && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * True when a box-shadow token is the colour rather than an offset.
 * @param {string} token
 * @returns {boolean}
 */
function isColorToken(token) {
  return /^(#|rgba?\(|hsla?\(|color\(|currentcolor$|transparent$)/i.test(token);
}

/**
 * Rewrites one shadow into the canonical authoring order.
 * @param {string} input
 * @returns {string}
 */
function normalizeSingleShadow(input) {
  let inset = false;
  let color = null;
  const lengths = [];

  for (const token of splitTopLevel(input, ' ')) {
    if (token.toLowerCase() === 'inset') {
      inset = true;
    } else if (isColorToken(token) && !color) {
      // Colours never contain spaces once normalized, which also makes two
      // equivalent shadows compare equal as plain strings.
      color = token.replace(/\s+/g, '');
    } else {
      // A bare `0` and `0px` mean the same thing; pick one so they compare equal.
      lengths.push(token === '0' ? '0px' : token);
    }
  }

  // getComputedStyle always emits a spread, even when it is zero and carries
  // no information. Drop it so a read-back value matches what a person writes.
  if (lengths.length === 4 && parseFloat(lengths[3]) === 0) {
    lengths.pop();
  }

  const parts = [];
  if (inset) parts.push('inset');
  parts.push(...lengths);
  if (color) parts.push(color);
  return parts.join(' ');
}

/**
 * Normalizes a box-shadow into the form people actually write.
 *
 * `getComputedStyle` returns `rgba(0, 0, 0, 0.12) 0px 2px 8px 0px` — colour
 * first, always with a spread. Nobody authors it that way, and comparing that
 * string against a preset written as `0 2px 8px rgba(0,0,0,0.12)` never matches
 * even though they describe the same shadow. This produces one canonical form
 * for both, so the field is readable and preset detection works.
 * @param {string} value
 * @returns {string}
 */
export function normalizeBoxShadow(value) {
  if (!value || typeof value !== 'string') return 'none';

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') return 'none';

  return splitTopLevel(trimmed, ',').map(normalizeSingleShadow).join(', ');
}

/**
 * Units a length control offers next to its number field.
 * `%` is included because half the useful width and height values are relative.
 */
export const LENGTH_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh'];

/**
 * Splits a CSS length into the number and unit a paired number+unit control
 * needs, without ever losing a value it cannot model.
 *
 * Three shapes come back:
 *   - a length      → { number: '320', unit: 'px' }
 *   - a keyword     → { unit: 'auto', keyword: true }, number empty
 *   - anything else → { number: 'min(640px, 90vw)', custom: true }, unit empty
 *
 * The `custom` case is what keeps an expression like `min(640px, 90vw)` or
 * `calc(100% - 2rem)` typable: the panel keeps showing the raw string in the
 * value field and writes it back verbatim.
 *
 * @param {string|number} value
 * @returns {{ number: string, unit: string, keyword: boolean, custom: boolean }}
 */
export function splitLength(value) {
  const str = `${value === null || value === undefined ? '' : value}`.trim();
  if (!str) return { number: '', unit: '', keyword: false, custom: false };

  const match = str.match(/^(-?\d*\.?\d+)\s*([a-z%]*)$/i);
  if (match) {
    const unit = match[2].toLowerCase();
    if (!unit || LENGTH_UNITS.includes(unit)) {
      return { number: match[1], unit: unit || 'px', keyword: false, custom: false };
    }
  }

  // A bare keyword — `auto`, `none`, `fit-content`, `min-content`…
  if (/^[a-z][a-z-]*$/i.test(str)) {
    return { number: '', unit: str.toLowerCase(), keyword: true, custom: false };
  }

  return { number: str, unit: '', keyword: false, custom: true };
}

/**
 * Recombines a number and unit into a CSS length. A keyword unit stands alone;
 * an empty number yields an empty string rather than a bare unit; and anything
 * that is not a bare number is passed through untouched, so a `custom` value
 * from `splitLength` survives a round trip instead of collecting a stray `px`.
 * @param {string|number} number
 * @param {string} unit
 * @returns {string}
 */
export function joinLength(number, unit) {
  if (unit && !LENGTH_UNITS.includes(unit)) return unit;
  const trimmed = `${number === null || number === undefined ? '' : number}`.trim();
  if (!trimmed) return '';
  if (!/^-?\d*\.?\d+$/.test(trimmed)) return trimmed;
  return `${trimmed}${unit || 'px'}`;
}
