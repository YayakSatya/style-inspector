/**
 * Style Reader, Mutator, and Diff Calculator
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

  const paddingTop = parsePx(computed.paddingTop, 0);
  const paddingRight = parsePx(computed.paddingRight, 0);
  const paddingBottom = parsePx(computed.paddingBottom, 0);
  const paddingLeft = parsePx(computed.paddingLeft, 0);

  const marginTop = parsePx(computed.marginTop, 0);
  const marginRight = parsePx(computed.marginRight, 0);
  const marginBottom = parsePx(computed.marginBottom, 0);
  const marginLeft = parsePx(computed.marginLeft, 0);

  // Gap (row-gap / column-gap or unified gap)
  const rowGap = parsePx(computed.rowGap, 0);
  const colGap = parsePx(computed.columnGap, 0);
  const gap = rowGap || colGap || parsePx(computed.gap, 0);

  // Typography
  const fontSize = parsePx(computed.fontSize, 16);

  // Line-height can be "normal", px string, or unitless in source
  let lineHeight = 1.4;
  let lineHeightUnit = 'unitless';
  const rawLineHeight = computed.lineHeight;

  if (rawLineHeight && rawLineHeight !== 'normal') {
    if (rawLineHeight.endsWith('px')) {
      const lhPx = parsePx(rawLineHeight, 0);
      if (fontSize > 0) {
        // Calculate ratio e.g. 24px / 16px = 1.5
        lineHeight = Math.round((lhPx / fontSize) * 100) / 100;
      } else {
        lineHeight = lhPx;
        lineHeightUnit = 'px';
      }
    } else {
      lineHeight = parseFloat(rawLineHeight) || 1.4;
    }
  } else {
    // Standard browser default for 'normal' is roughly 1.2 - 1.4
    lineHeight = 1.4;
  }

  // Letter-spacing: can be "normal" or px
  let letterSpacing = 0;
  if (computed.letterSpacing && computed.letterSpacing !== 'normal') {
    letterSpacing = parsePx(computed.letterSpacing, 0);
  }

  return {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gap,
    fontSize,
    lineHeight,
    lineHeightUnit,
    letterSpacing
  };
}

/**
 * Creates default style baseline.
 */
export function createDefaultStyles() {
  return {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    gap: 0,
    fontSize: 16,
    lineHeight: 1.4,
    lineHeightUnit: 'unitless',
    letterSpacing: 0
  };
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

  const props = [
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap', 'row-gap', 'column-gap',
    'font-size', 'line-height', 'letter-spacing'
  ];

  const saved = {};
  for (const prop of props) {
    saved[prop] = element.style.getPropertyValue(prop);
  }
  originalInlineStyles.set(element, saved);
}

/**
 * Applies a specific property change live to the DOM element.
 * @param {HTMLElement} element
 * @param {string} prop - e.g. 'paddingTop', 'fontSize'
 * @param {number|string} val
 * @param {string} [unit='px']
 */
export function applyStyleProperty(element, prop, val, unit = 'px') {
  if (!element || !element.style) return;
  captureOriginalInline(element);

  const cssPropMap = {
    paddingTop: 'padding-top',
    paddingRight: 'padding-right',
    paddingBottom: 'padding-bottom',
    paddingLeft: 'padding-left',
    marginTop: 'margin-top',
    marginRight: 'margin-right',
    marginBottom: 'margin-bottom',
    marginLeft: 'margin-left',
    gap: 'gap',
    fontSize: 'font-size',
    lineHeight: 'line-height',
    letterSpacing: 'letter-spacing'
  };

  const cssProp = cssPropMap[prop];
  if (!cssProp) return;

  let formattedVal = val;
  if (prop === 'lineHeight') {
    formattedVal = typeof val === 'number' ? `${val}` : val;
  } else {
    formattedVal = `${val}${unit}`;
  }

  element.style.setProperty(cssProp, formattedVal);
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
 * Computes difference between baseline styles and current styles.
 * Groups symmetric paddings/margins if all 4 sides match.
 * @param {object} baseline
 * @param {object} current
 * @returns {Array<{ property: string, before: string, after: string }>}
 */
export function computeStyleDiff(baseline, current) {
  const diffs = [];

  // 1. Padding
  const padChanged =
    baseline.paddingTop !== current.paddingTop ||
    baseline.paddingRight !== current.paddingRight ||
    baseline.paddingBottom !== current.paddingBottom ||
    baseline.paddingLeft !== current.paddingLeft;

  if (padChanged) {
    // Check if all 4 sides are identical in current AND baseline
    const baseAllSame =
      baseline.paddingTop === baseline.paddingRight &&
      baseline.paddingRight === baseline.paddingBottom &&
      baseline.paddingBottom === baseline.paddingLeft;

    const currAllSame =
      current.paddingTop === current.paddingRight &&
      current.paddingRight === current.paddingBottom &&
      current.paddingBottom === current.paddingLeft;

    if (baseAllSame && currAllSame) {
      diffs.push({
        property: 'padding',
        before: `${baseline.paddingTop}px`,
        after: `${current.paddingTop}px`
      });
    } else {
      // Individual sides that changed
      if (baseline.paddingTop !== current.paddingTop) {
        diffs.push({ property: 'padding-top', before: `${baseline.paddingTop}px`, after: `${current.paddingTop}px` });
      }
      if (baseline.paddingRight !== current.paddingRight) {
        diffs.push({ property: 'padding-right', before: `${baseline.paddingRight}px`, after: `${current.paddingRight}px` });
      }
      if (baseline.paddingBottom !== current.paddingBottom) {
        diffs.push({ property: 'padding-bottom', before: `${baseline.paddingBottom}px`, after: `${current.paddingBottom}px` });
      }
      if (baseline.paddingLeft !== current.paddingLeft) {
        diffs.push({ property: 'padding-left', before: `${baseline.paddingLeft}px`, after: `${current.paddingLeft}px` });
      }
    }
  }

  // 2. Margin
  const marChanged =
    baseline.marginTop !== current.marginTop ||
    baseline.marginRight !== current.marginRight ||
    baseline.marginBottom !== current.marginBottom ||
    baseline.marginLeft !== current.marginLeft;

  if (marChanged) {
    const baseAllSame =
      baseline.marginTop === baseline.marginRight &&
      baseline.marginRight === baseline.marginBottom &&
      baseline.marginBottom === baseline.marginLeft;

    const currAllSame =
      current.marginTop === current.marginRight &&
      current.marginRight === current.marginBottom &&
      current.marginBottom === current.marginLeft;

    if (baseAllSame && currAllSame) {
      diffs.push({
        property: 'margin',
        before: `${baseline.marginTop}px`,
        after: `${current.marginTop}px`
      });
    } else {
      if (baseline.marginTop !== current.marginTop) {
        diffs.push({ property: 'margin-top', before: `${baseline.marginTop}px`, after: `${current.marginTop}px` });
      }
      if (baseline.marginRight !== current.marginRight) {
        diffs.push({ property: 'margin-right', before: `${baseline.marginRight}px`, after: `${current.marginRight}px` });
      }
      if (baseline.marginBottom !== current.marginBottom) {
        diffs.push({ property: 'margin-bottom', before: `${baseline.marginBottom}px`, after: `${current.marginBottom}px` });
      }
      if (baseline.marginLeft !== current.marginLeft) {
        diffs.push({ property: 'margin-left', before: `${baseline.marginLeft}px`, after: `${current.marginLeft}px` });
      }
    }
  }

  // 3. Gap
  if (baseline.gap !== current.gap) {
    diffs.push({
      property: 'gap',
      before: `${baseline.gap}px`,
      after: `${current.gap}px`
    });
  }

  // 4. Font Size
  if (baseline.fontSize !== current.fontSize) {
    diffs.push({
      property: 'font-size',
      before: `${baseline.fontSize}px`,
      after: `${current.fontSize}px`
    });
  }

  // 5. Line Height
  if (baseline.lineHeight !== current.lineHeight) {
    const beforeStr = typeof baseline.lineHeight === 'number' ? `${baseline.lineHeight}` : baseline.lineHeight;
    const afterStr = typeof current.lineHeight === 'number' ? `${current.lineHeight}` : current.lineHeight;
    diffs.push({
      property: 'line-height',
      before: beforeStr,
      after: afterStr
    });
  }

  // 6. Letter Spacing
  if (baseline.letterSpacing !== current.letterSpacing) {
    diffs.push({
      property: 'letter-spacing',
      before: `${baseline.letterSpacing}px`,
      after: `${current.letterSpacing}px`
    });
  }

  return diffs;
}
