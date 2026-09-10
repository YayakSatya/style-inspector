import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { splitLength, joinLength, LENGTH_UNITS } from '../src/core/css-value.js';

/**
 * The Size section edits a length as a number plus a unit dropdown. These two
 * functions are the whole contract behind that: whatever the element already
 * has must survive being split apart and put back together, including the
 * values a dropdown cannot represent.
 */
describe('Length splitting', () => {
  test('splits a plain length into number and unit', () => {
    assert.deepEqual(splitLength('320px'), { number: '320', unit: 'px', keyword: false, custom: false });
    assert.deepEqual(splitLength('100%'), { number: '100', unit: '%', keyword: false, custom: false });
    assert.deepEqual(splitLength('1.5rem'), { number: '1.5', unit: 'rem', keyword: false, custom: false });
  });

  test('treats a bare number as px', () => {
    assert.equal(splitLength('48').unit, 'px');
    assert.equal(splitLength('48').number, '48');
  });

  test('reports a keyword as the unit with no number', () => {
    assert.deepEqual(splitLength('auto'), { number: '', unit: 'auto', keyword: true, custom: false });
    assert.equal(splitLength('fit-content').keyword, true);
  });

  test('keeps an expression intact as a custom value', () => {
    const parsed = splitLength('min(640px, 90vw)');
    assert.equal(parsed.custom, true);
    assert.equal(parsed.number, 'min(640px, 90vw)');
    assert.equal(parsed.unit, '');
  });

  test('an empty value stays empty rather than becoming zero', () => {
    assert.deepEqual(splitLength(''), { number: '', unit: '', keyword: false, custom: false });
    assert.equal(splitLength(null).number, '');
  });
});

describe('Length joining', () => {
  test('recombines number and unit', () => {
    assert.equal(joinLength('320', 'px'), '320px');
    assert.equal(joinLength('100', '%'), '100%');
  });

  test('a keyword unit stands alone', () => {
    assert.equal(joinLength('320', 'auto'), 'auto');
    assert.equal(joinLength('', 'fit-content'), 'fit-content');
  });

  test('an empty number yields an empty string, never a bare unit', () => {
    assert.equal(joinLength('', 'px'), '');
    assert.equal(joinLength('   ', '%'), '');
  });

  test('a non-numeric value passes through without collecting a unit', () => {
    assert.equal(joinLength('calc(100% - 2rem)', 'px'), 'calc(100% - 2rem)');
  });

  test('every offered unit round-trips', () => {
    for (const unit of LENGTH_UNITS) {
      const value = `12${unit}`;
      const parsed = splitLength(value);
      assert.equal(joinLength(parsed.number, parsed.unit), value);
    }
  });
});
