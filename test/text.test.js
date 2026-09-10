import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  readElementText,
  applyElementText,
  resetElementText,
  computeTextDiff
} from '../src/core/text.js';

/**
 * Minimal DOM stand-ins. The suite runs on bare node:test with no jsdom, so
 * these mirror only the surface `text.js` actually touches: nodeType,
 * childNodes, nodeValue, and a textContent that behaves like the real one
 * (reading concatenates descendants, writing replaces every child).
 */
function textNode(value) {
  return { nodeType: 3, nodeValue: value };
}

function element(children = []) {
  return {
    nodeType: 1,
    childNodes: children,
    get textContent() {
      return this.childNodes
        .map(node => (node.nodeType === 3 ? node.nodeValue : node.textContent))
        .join('');
    },
    set textContent(value) {
      this.childNodes = [textNode(value)];
    }
  };
}

describe('Text Content Reader', () => {
  test('classifies a leaf element as directly editable', () => {
    const el = element([textNode('Total Revenue')]);
    const info = readElementText(el);

    assert.equal(info.mode, 'textContent');
    assert.equal(info.editable, true);
    assert.equal(info.text, 'Total Revenue');
  });

  test('classifies mixed children with one text run as a text-node edit', () => {
    // <p>Hello <b>world</b></p>
    const bold = element([textNode('world')]);
    const el = element([textNode('Hello '), bold]);
    const info = readElementText(el);

    assert.equal(info.mode, 'textNode');
    assert.equal(info.editable, true);
    assert.equal(info.text, 'Hello');
    assert.equal(info.suffix, ' ');
  });

  test('refuses an element with several separate text runs', () => {
    // <p>a<b>x</b>b</p>
    const bold = element([textNode('x')]);
    const el = element([textNode('a'), bold, textNode('b')]);
    const info = readElementText(el);

    assert.equal(info.mode, 'none');
    assert.equal(info.editable, false);
    assert.match(info.reason, /2 separate text runs/);
  });

  test('refuses a pure container with no text of its own', () => {
    const el = element([element([textNode('inner')])]);
    const info = readElementText(el);

    assert.equal(info.editable, false);
    assert.match(info.reason, /only contains other elements/);
  });

  test('strips surrounding markup whitespace from the visible text', () => {
    const el = element([textNode('\n      Total Revenue\n    ')]);
    const info = readElementText(el);

    assert.equal(info.text, 'Total Revenue');
    assert.equal(info.prefix, '\n      ');
    assert.equal(info.suffix, '\n    ');
  });
});

describe('Text Content Mutator', () => {
  test('writes through textContent and restores the original on reset', () => {
    const el = element([textNode('\n  Total Revenue\n')]);
    const info = readElementText(el);
    const record = {
      textMode: info.mode,
      textNode: info.node,
      textPrefix: info.prefix,
      textSuffix: info.suffix
    };

    applyElementText(el, record, 'Gross Revenue');
    // Surrounding whitespace is preserved so the page's formatting is intact.
    assert.equal(el.textContent, '\n  Gross Revenue\n');

    resetElementText(el);
    assert.equal(el.textContent, '\n  Total Revenue\n');
  });

  test('editing a single text run leaves sibling elements intact', () => {
    const bold = element([textNode('world')]);
    const el = element([textNode('Hello '), bold]);
    const info = readElementText(el);
    const record = {
      textMode: info.mode,
      textNode: info.node,
      textPrefix: info.prefix,
      textSuffix: info.suffix
    };

    applyElementText(el, record, 'Goodbye');

    assert.equal(el.childNodes.length, 2);
    assert.equal(el.childNodes[1], bold, 'the <b> child must survive the edit');
    assert.equal(el.textContent, 'Goodbye world');
  });

  test('refuses to write to an unclassifiable element', () => {
    const el = element([textNode('a'), element([textNode('x')]), textNode('b')]);
    const info = readElementText(el);
    const written = applyElementText(el, { textMode: info.mode }, 'nope');

    assert.equal(written, false);
    assert.equal(el.textContent, 'axb');
  });

  test('reset is a no-op for an element that was never edited', () => {
    const el = element([textNode('untouched')]);
    resetElementText(el);
    assert.equal(el.textContent, 'untouched');
  });
});

describe('Text Diff', () => {
  test('returns null when the copy is unchanged', () => {
    assert.equal(computeTextDiff({ baselineText: 'Save', currentText: 'Save' }), null);
  });

  test('reports before and after when the copy changed', () => {
    const diff = computeTextDiff({ baselineText: 'Save', currentText: 'Save changes' });
    assert.deepEqual(diff, { before: 'Save', after: 'Save changes' });
  });

  test('treats a missing text record as unchanged', () => {
    assert.equal(computeTextDiff({}), null);
    assert.equal(computeTextDiff(null), null);
  });
});
