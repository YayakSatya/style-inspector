import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA,
  SHORTHAND_GROUPS,
  getDescriptor,
  isTextualProperty,
  inlineCssProperties,
  formatValue
} from '../src/core/schema.js';
import {
  readElementStyles,
  createDefaultStyles,
  applyStyleProperty,
  resetElementStyles,
  computeStyleDiff
} from '../src/core/styles.js';
import { normalizeBoxShadow, splitTopLevel } from '../src/core/css-value.js';

/**
 * A fake element that records the inline styles written to it, mirroring the
 * subset of CSSStyleDeclaration the mutator touches.
 */
function fakeElement() {
  const inline = new Map();
  return {
    nodeType: 1,
    _inline: inline,
    style: {
      setProperty: (prop, value) => inline.set(prop, value),
      getPropertyValue: prop => inline.get(prop) || '',
      removeProperty: prop => inline.delete(prop)
    }
  };
}

describe('Property Schema', () => {
  test('every descriptor is well formed', () => {
    const types = new Set(['length', 'number', 'keyword', 'color', 'raw']);
    for (const descriptor of SCHEMA) {
      assert.ok(descriptor.key, 'descriptor needs a key');
      assert.ok(descriptor.css, `${descriptor.key} needs a css property`);
      assert.ok(types.has(descriptor.type), `${descriptor.key} has unknown type ${descriptor.type}`);
      assert.notEqual(descriptor.default, undefined, `${descriptor.key} needs a default`);
    }
  });

  test('keys are unique', () => {
    const keys = SCHEMA.map(descriptor => descriptor.key);
    assert.equal(new Set(keys).size, keys.length);
  });

  test('four-sided groups map to real longhand CSS properties', () => {
    // `border-radius-top-left` is not a CSS property; `border-top-left-radius` is.
    const radius = SHORTHAND_GROUPS.find(group => group.name === 'border-radius');
    assert.deepEqual(radius.sideCss, [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius'
    ]);

    for (const group of SHORTHAND_GROUPS) {
      assert.equal(group.keys.length, 4);
      assert.equal(group.sideCss.length, 4);
      group.keys.forEach((key, index) => {
        assert.equal(getDescriptor(key).css, group.sideCss[index]);
      });
    }
  });

  test('only length properties are treated as numeric', () => {
    assert.equal(isTextualProperty('paddingTop'), false);
    assert.equal(isTextualProperty('fontSize'), false);
    assert.equal(isTextualProperty('opacity'), false, 'opacity is a bare number');
    assert.equal(isTextualProperty('lineHeight'), false);
    assert.equal(isTextualProperty('color'), true);
    assert.equal(isTextualProperty('boxShadow'), true);
    assert.equal(isTextualProperty('width'), true, 'width must accept auto and %');
    assert.equal(isTextualProperty('nonsense'), false);
  });

  test('inline snapshot covers every property plus the extras they imply', () => {
    const props = inlineCssProperties();
    // Writing `gap` sets both axes, so both must be restorable.
    assert.ok(props.includes('row-gap'));
    assert.ok(props.includes('column-gap'));
    assert.ok(props.includes('border-top-left-radius'));
    assert.ok(props.includes('border-top-width'));
    assert.ok(props.includes('box-shadow'));
    assert.ok(props.includes('opacity'));
    assert.ok(props.includes('max-width'));
    assert.equal(new Set(props).size, props.length, 'no duplicates');
  });

  test('formatValue only appends px to lengths', () => {
    assert.equal(formatValue(getDescriptor('paddingTop'), 12), '12px');
    assert.equal(formatValue(getDescriptor('opacity'), 0.5), '0.5');
    assert.equal(formatValue(getDescriptor('boxShadow'), 'none'), 'none');
  });
});

describe('Box-shadow normalization', () => {
  test('splitTopLevel keeps parenthesised commas intact', () => {
    assert.deepEqual(splitTopLevel('0 1px rgba(0, 0, 0, 0.2), inset 0 2px #fff', ','), [
      '0 1px rgba(0, 0, 0, 0.2)',
      'inset 0 2px #fff'
    ]);
  });

  test('rewrites the computed colour-first form into the authoring form', () => {
    // This is exactly what getComputedStyle returns in Chrome.
    assert.equal(
      normalizeBoxShadow('rgba(0, 0, 0, 0.12) 0px 2px 8px 0px'),
      '0px 2px 8px rgba(0,0,0,0.12)'
    );
  });

  test('a computed value and the preset that produced it compare equal', () => {
    // The bug this guards: the preset dropdown never showed as selected,
    // because these two strings describe the same shadow but differ textually.
    assert.equal(
      normalizeBoxShadow('rgba(0, 0, 0, 0.12) 0px 2px 8px 0px'),
      normalizeBoxShadow('0 2px 8px rgba(0,0,0,0.12)')
    );
  });

  test('preserves inset and drops only a zero spread', () => {
    assert.equal(
      normalizeBoxShadow('rgba(0, 0, 0, 0.15) 0px 1px 2px 0px inset'),
      'inset 0px 1px 2px rgba(0,0,0,0.15)'
    );
    // A real spread carries meaning and must survive.
    assert.equal(
      normalizeBoxShadow('rgb(255, 0, 0) 0px 0px 0px 4px'),
      '0px 0px 0px 4px rgb(255,0,0)'
    );
  });

  test('handles multiple shadows', () => {
    assert.equal(
      normalizeBoxShadow('rgb(0, 0, 0) 0px 1px 1px 0px, rgba(0, 0, 0, 0.2) 0px 4px 8px 0px'),
      '0px 1px 1px rgb(0,0,0), 0px 4px 8px rgba(0,0,0,0.2)'
    );
  });

  test('none and empty values collapse to none', () => {
    assert.equal(normalizeBoxShadow('none'), 'none');
    assert.equal(normalizeBoxShadow('  '), 'none');
    assert.equal(normalizeBoxShadow(null), 'none');
  });

  test('an already-canonical value is unchanged', () => {
    const canonical = '0px 2px 8px rgba(0,0,0,0.12)';
    assert.equal(normalizeBoxShadow(canonical), canonical);
  });
});

describe('Schema-driven Reader and Mutator', () => {
  test('defaults cover every schema key', () => {
    const defaults = createDefaultStyles();
    for (const descriptor of SCHEMA) {
      assert.notEqual(defaults[descriptor.key], undefined, `${descriptor.key} missing from defaults`);
    }
    assert.equal(defaults.lineHeightSource, 'normal');
  });

  test('reads the new properties off computed style', () => {
    const win = {
      getComputedStyle: () => ({
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        borderBottomRightRadius: '6px',
        borderBottomLeftRadius: '6px',
        borderTopWidth: '2px',
        borderTopStyle: 'dashed',
        borderTopColor: 'rgb(1, 2, 3)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        opacity: '0.5',
        width: '320px',
        height: 'auto',
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        lineHeight: 'normal',
        letterSpacing: 'normal'
      })
    };

    const record = readElementStyles({ nodeType: 1 }, win);

    assert.equal(record.borderTopLeftRadius, 6);
    assert.equal(record.borderWidth, 2);
    assert.equal(record.borderStyle, 'dashed');
    assert.equal(record.borderColor, 'rgb(1, 2, 3)');
    // Normalized on read, so `0` becomes `0px` and the colour loses its spaces.
    assert.equal(record.boxShadow, '0px 1px 2px rgba(0,0,0,0.1)');
    assert.equal(record.opacity, 0.5);
    assert.equal(record.width, '320px');
    assert.equal(record.display, 'flex');
    assert.equal(record.flexDirection, 'column');
    assert.equal(record.fontFamily, 'Inter, sans-serif');
  });

  test('writes each type with the right unit handling', () => {
    const el = fakeElement();

    applyStyleProperty(el, 'borderTopLeftRadius', 16, 'px');
    applyStyleProperty(el, 'opacity', 0.5, 'px');
    applyStyleProperty(el, 'boxShadow', '0 2px 8px rgba(0,0,0,0.12)', 'px');
    applyStyleProperty(el, 'width', '50%', 'px');

    assert.equal(el._inline.get('border-top-left-radius'), '16px');
    // A bare number must not gain a px suffix, or the declaration is invalid.
    assert.equal(el._inline.get('opacity'), '0.5');
    assert.equal(el._inline.get('box-shadow'), '0 2px 8px rgba(0,0,0,0.12)');
    assert.equal(el._inline.get('width'), '50%');
  });

  test('an unknown property is ignored rather than written', () => {
    const el = fakeElement();
    applyStyleProperty(el, 'notAProperty', 5, 'px');
    assert.equal(el._inline.size, 0);
  });

  test('reset restores the new properties too', () => {
    const el = fakeElement();
    el.style.setProperty('opacity', '0.9');

    applyStyleProperty(el, 'opacity', 0.2, 'px');
    applyStyleProperty(el, 'boxShadow', 'none', 'px');
    assert.equal(el._inline.get('opacity'), '0.2');

    resetElementStyles(el);
    assert.equal(el._inline.get('opacity'), '0.9', 'pre-existing inline value is restored');
    assert.equal(el._inline.has('box-shadow'), false, 'a property we introduced is removed');
  });
});

describe('Diff for the new properties', () => {
  const base = () => ({
    ...createDefaultStyles(),
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4
  });

  test('collapses corner radii to the shorthand when all four agree', () => {
    const baseline = base();
    const current = {
      ...baseline,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16
    };

    const diffs = computeStyleDiff(baseline, current);
    assert.deepEqual(diffs, [{ property: 'border-radius', before: '4px', after: '16px' }]);
  });

  test('reports individual corners when they differ', () => {
    const baseline = base();
    const current = { ...baseline, borderTopLeftRadius: 16 };

    const diffs = computeStyleDiff(baseline, current);
    assert.deepEqual(diffs, [
      { property: 'border-top-left-radius', before: '4px', after: '16px' }
    ]);
  });

  test('emits the new scalar properties with correct units', () => {
    const baseline = { ...createDefaultStyles(), opacity: 1, boxShadow: 'none', width: 'auto' };
    const current = { ...baseline, opacity: 0.5, boxShadow: '0 2px 8px #000', width: '50%' };

    const diffs = computeStyleDiff(baseline, current);
    const byProperty = Object.fromEntries(diffs.map(diff => [diff.property, diff]));

    assert.deepEqual(byProperty['opacity'], { property: 'opacity', before: '1', after: '0.5' });
    assert.deepEqual(byProperty['box-shadow'], {
      property: 'box-shadow',
      before: 'none',
      after: '0 2px 8px #000'
    });
    assert.deepEqual(byProperty['width'], { property: 'width', before: 'auto', after: '50%' });
  });

  test('a partially populated record produces no phantom diffs', () => {
    // Records built by hand in older tests carry only a few keys; missing keys
    // must not surface as `undefined → undefined`.
    const baseline = { paddingTop: 1, paddingRight: 1, paddingBottom: 1, paddingLeft: 1 };
    const current = { ...baseline, paddingTop: 2 };

    const diffs = computeStyleDiff(baseline, current);
    assert.equal(diffs.length, 1);
    assert.equal(diffs[0].property, 'padding-top');
  });
});
