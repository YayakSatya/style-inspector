import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatLength, EXPORT_UNITS } from '../src/core/css-value.js';
import { computeStyleDiff, createDefaultStyles } from '../src/core/styles.js';
import {
  generateExport,
  generateMarkdownExport,
  generateCssExport,
  generateJsonExport,
  exportFormatInfo,
  EXPORT_FORMATS
} from '../src/core/exporter.js';

/**
 * A pinned item whose element sits inside a 20px-font parent, on a 16px root.
 */
function item(overrides = {}) {
  const baseline = {
    ...createDefaultStyles(),
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    fontSize: 20
  };

  return {
    id: 'pinned_1',
    selector: '[data-testid="card"]',
    label: '<div [testid]>',
    baseline,
    current: { ...baseline },
    baselineText: 'Card',
    currentText: 'Card',
    notes: '',
    rootFontSize: 16,
    parentFontSize: 20,
    ...overrides
  };
}

describe('Length formatting', () => {
  test('px is unchanged and is the default', () => {
    assert.equal(formatLength(12, 'px', { basis: 16 }), '12px');
    assert.equal(formatLength(12, undefined, {}), '12px');
  });

  test('converts against the given basis', () => {
    assert.equal(formatLength(24, 'rem', { basis: 16 }), '1.5rem');
    assert.equal(formatLength(13, 'rem', { basis: 16 }), '0.8125rem');
    assert.equal(formatLength(24, 'em', { basis: 32 }), '0.75em');
  });

  test('zero is unitless', () => {
    assert.equal(formatLength(0, 'rem', { basis: 16 }), '0');
    // px keeps its unit, so existing exports are untouched.
    assert.equal(formatLength(0, 'px', {}), '0px');
  });

  test('falls back to px when the basis is unusable', () => {
    assert.equal(formatLength(12, 'rem', { basis: 0 }), '12px');
    assert.equal(formatLength(12, 'em', {}), '12px');
  });

  test('only px, rem, and em are offered', () => {
    // `%` is excluded on purpose: its basis differs per property.
    assert.deepEqual(EXPORT_UNITS, ['px', 'rem', 'em']);
  });
});

describe('Unit conversion in diffs', () => {
  const changed = () => {
    const record = item();
    record.current = {
      ...record.baseline,
      paddingTop: 24,
      paddingRight: 24,
      paddingBottom: 24,
      paddingLeft: 24,
      fontSize: 32
    };
    return record;
  };

  test('rem converts against the root font size', () => {
    const record = changed();
    const diffs = computeStyleDiff(record.baseline, record.current, {
      unit: 'rem',
      rootFontSize: 16,
      parentFontSize: 20
    });
    const byProperty = Object.fromEntries(diffs.map(d => [d.property, d]));

    assert.deepEqual(byProperty.padding, { property: 'padding', before: '0.75rem', after: '1.5rem' });
    assert.deepEqual(byProperty['font-size'], { property: 'font-size', before: '1.25rem', after: '2rem' });
  });

  test('em uses the font size each side actually had', () => {
    // The subtlety: the element's font-size changed from 20 to 32, so the same
    // padding is 0.6em before and 0.75em after. Using one basis for both would
    // emit CSS that does not reproduce the measurement it claims.
    const record = changed();
    const diffs = computeStyleDiff(record.baseline, record.current, {
      unit: 'em',
      rootFontSize: 16,
      parentFontSize: 20
    });
    const byProperty = Object.fromEntries(diffs.map(d => [d.property, d]));

    assert.deepEqual(byProperty.padding, { property: 'padding', before: '0.6em', after: '0.75em' });
  });

  test('font-size in em resolves against the parent, not itself', () => {
    const record = changed();
    const diffs = computeStyleDiff(record.baseline, record.current, {
      unit: 'em',
      rootFontSize: 16,
      parentFontSize: 20
    });
    const fontSize = diffs.find(d => d.property === 'font-size');

    // Against its own size every font-size would trivially be 1em.
    assert.deepEqual(fontSize, { property: 'font-size', before: '1em', after: '1.6em' });
  });

  test('omitting the context reproduces the original px output', () => {
    const record = changed();
    assert.deepEqual(
      computeStyleDiff(record.baseline, record.current),
      computeStyleDiff(record.baseline, record.current, { unit: 'px' })
    );
  });

  test('non-length properties are never converted', () => {
    const record = item();
    record.current = { ...record.baseline, opacity: 0.5, boxShadow: '0px 2px 8px #000' };
    const diffs = computeStyleDiff(record.baseline, record.current, {
      unit: 'rem',
      rootFontSize: 16
    });
    const byProperty = Object.fromEntries(diffs.map(d => [d.property, d]));

    assert.equal(byProperty.opacity.after, '0.5');
    assert.equal(byProperty['box-shadow'].after, '0px 2px 8px #000');
  });
});

describe('Export formats', () => {
  const changed = (overrides = {}) => {
    const record = item({ currentText: 'Card v2', notes: 'Repeated card instance', ...overrides });
    record.current = {
      ...record.baseline,
      paddingTop: 24,
      paddingRight: 24,
      paddingBottom: 24,
      paddingLeft: 24
    };
    return record;
  };

  test('CSS emits a declaration block with the target values', () => {
    const css = generateCssExport([changed()], { unit: 'rem' });

    assert.ok(css.includes('[data-testid="card"] {'));
    assert.ok(css.includes('padding: 1.5rem; /* was 0.75rem */'));
    assert.ok(css.trimEnd().endsWith('*/'));
  });

  test('CSS carries text changes and notes as comments, since it cannot express them', () => {
    const css = generateCssExport([changed()]);
    assert.ok(css.includes('/* text: "Card" → "Card v2" */'));
    assert.ok(css.includes('/* Repeated card instance */'));
  });

  test('a note cannot break out of its CSS comment', () => {
    const record = changed();
    record.notes = 'oops */ body { display: none } /*';
    const css = generateCssExport([record]);

    assert.ok(!css.includes('oops */ body'), 'the closing sequence must be escaped');
    assert.ok(css.includes('*\\/'));
  });

  test('JSON is parseable and carries the unit it was rendered in', () => {
    const parsed = JSON.parse(generateJsonExport([changed()], { unit: 'rem' }));

    assert.equal(parsed.unit, 'rem');
    assert.equal(parsed.elements.length, 1);
    assert.equal(parsed.elements[0].selector, '[data-testid="card"]');
    assert.deepEqual(parsed.elements[0].text, { before: 'Card', after: 'Card v2' });
    assert.deepEqual(parsed.elements[0].changes, [
      { property: 'padding', before: '0.75rem', after: '1.5rem' }
    ]);
    assert.equal(parsed.elements[0].notes, 'Repeated card instance');
  });

  test('JSON text is null when the copy is untouched', () => {
    const parsed = JSON.parse(generateJsonExport([item({ current: { ...item().baseline, gap: 4 } })]));
    assert.equal(parsed.elements[0].text, null);
  });

  test('generateExport dispatches on format and defaults to markdown', () => {
    const items = [changed()];

    assert.equal(generateExport(items, { format: 'css' }), generateCssExport(items, { format: 'css' }));
    assert.equal(generateExport(items, { format: 'json' }), generateJsonExport(items, { format: 'json' }));
    assert.equal(generateExport(items, {}), generateMarkdownExport(items, {}));
    assert.equal(generateExport(items, { format: 'nonsense' }), generateMarkdownExport(items, { format: 'nonsense' }));
  });

  test('the instruction only mentions what the export actually contains', () => {
    const styleOnly = generateMarkdownExport([changed({ currentText: 'Card', notes: '' })], {});
    assert.ok(!styleOnly.includes('**Text** line'), 'a style-only export must not explain copy changes');
    assert.ok(!styleOnly.includes('**Note** line'), 'a style-only export must not explain notes');
    assert.ok(styleOnly.includes('`data-testid` attribute that already exists'));

    const withText = generateMarkdownExport([changed()], {});
    assert.ok(withText.includes('**Text** line'));
    assert.ok(withText.includes('**Note** line'));
  });

  test('a structural selector gets the generic instruction, not the data-testid one', () => {
    const markdown = generateMarkdownExport([changed({ selector: '.card > p:nth-child(2)' })], {});
    assert.ok(markdown.includes('structural paths you will need to trace'));
    assert.ok(!markdown.includes('`data-testid` attribute that already exists'));
  });

  test('a custom instruction replaces the default in every format', () => {
    const items = [changed()];
    const instruction = 'Only touch the design tokens file.';

    const md = generateMarkdownExport(items, { instruction });
    assert.ok(md.includes(`- ${instruction}`));
    // A custom instruction replaces the composed one outright
    assert.ok(!md.includes('Use whichever styling mechanism'));
    assert.ok(generateCssExport(items, { instruction }).includes(` * ${instruction}`));
    assert.equal(JSON.parse(generateJsonExport(items, { instruction })).instruction, instruction);
  });

  test('empty input is handled by every format', () => {
    assert.ok(generateMarkdownExport([]).includes('No elements were pinned'));
    assert.ok(generateCssExport([]).includes('no elements were pinned'));
    assert.deepEqual(JSON.parse(generateJsonExport([])).elements, []);
  });

  test('each format declares a file extension and mime type', () => {
    for (const format of EXPORT_FORMATS) {
      assert.ok(format.id && format.label && format.extension && format.mime);
    }
    assert.equal(exportFormatInfo('json').extension, 'json');
    // An unknown id falls back to markdown rather than producing a broken file.
    assert.equal(exportFormatInfo('nope').id, 'markdown');
  });
});
