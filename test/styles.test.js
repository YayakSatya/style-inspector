import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parsePx, computeStyleDiff } from '../src/core/styles.js';

describe('Styles & Diff Calculator', () => {
  test('parsePx correctly converts css px strings to numbers', () => {
    assert.equal(parsePx('16px'), 16);
    assert.equal(parsePx('0px'), 0);
    assert.equal(parsePx('12.5px'), 12.5);
    assert.equal(parsePx('invalid', 10), 10);
    assert.equal(parsePx(null, 5), 5);
  });

  test('computeStyleDiff detects symmetric padding changes', () => {
    const baseline = {
      paddingTop: 12,
      paddingRight: 12,
      paddingBottom: 12,
      paddingLeft: 12,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      gap: 0,
      fontSize: 16,
      lineHeight: 1.4,
      letterSpacing: 0
    };

    const current = {
      ...baseline,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 20
    };

    const diffs = computeStyleDiff(baseline, current);
    assert.equal(diffs.length, 1);
    assert.deepEqual(diffs[0], {
      property: 'padding',
      before: '12px',
      after: '20px'
    });
  });

  test('computeStyleDiff detects asymmetric side changes', () => {
    const baseline = {
      paddingTop: 12,
      paddingRight: 12,
      paddingBottom: 12,
      paddingLeft: 12,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      gap: 0,
      fontSize: 16,
      lineHeight: 1.4,
      letterSpacing: 0
    };

    const current = {
      ...baseline,
      paddingTop: 24,
      paddingBottom: 16
    };

    const diffs = computeStyleDiff(baseline, current);
    assert.equal(diffs.length, 2);
    assert.deepEqual(diffs[0], { property: 'padding-top', before: '12px', after: '24px' });
    assert.deepEqual(diffs[1], { property: 'padding-bottom', before: '12px', after: '16px' });
  });

  test('computeStyleDiff detects gap, typography, and letter-spacing', () => {
    const baseline = {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      gap: 8,
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0
    };

    const current = {
      ...baseline,
      gap: 16,
      fontSize: 16,
      lineHeight: 1.4,
      letterSpacing: 0.5
    };

    const diffs = computeStyleDiff(baseline, current);
    assert.equal(diffs.length, 4);
    assert.deepEqual(diffs[0], { property: 'gap', before: '8px', after: '16px' });
    assert.deepEqual(diffs[1], { property: 'font-size', before: '14px', after: '16px' });
    assert.deepEqual(diffs[2], { property: 'line-height', before: '1.2', after: '1.4' });
    assert.deepEqual(diffs[3], { property: 'letter-spacing', before: '0px', after: '0.5px' });
  });

  test('computeStyleDiff detects font-weight and text-transform changes', () => {
    const baseline = {
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
      marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
      gap: 0, fontSize: 16, lineHeight: 1.4, letterSpacing: 0,
      fontWeight: '400',
      textTransform: 'none'
    };

    const current = {
      ...baseline,
      fontWeight: '700',
      textTransform: 'uppercase'
    };

    const diffs = computeStyleDiff(baseline, current);
    assert.equal(diffs.length, 2);
    assert.deepEqual(diffs[0], { property: 'font-weight', before: '400', after: '700' });
    assert.deepEqual(diffs[1], { property: 'text-transform', before: 'none', after: 'uppercase' });
  });
});
