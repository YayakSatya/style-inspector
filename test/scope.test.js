import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { InspectorState } from '../src/core/state.js';
import { buildSharedSelector, resolveSharedElements } from '../src/core/selector.js';
import {
  generateSingleItemExport,
  generateMarkdownExport,
  generateCssExport,
  generateJsonExport
} from '../src/core/exporter.js';

/**
 * A minimal document with a navbar of four links sharing one class. The
 * selector helpers only need `querySelectorAll`, so it answers the shared
 * selector with the link list and anything else with nothing.
 */
function createNavbar() {
  const doc = {
    querySelectorAll(selector) {
      return selector === 'a.nav-link' ? links : [];
    }
  };

  const makeLink = (text, index) => {
    const inlineStyles = new Map();
    const parent = { children: [] };
    const link = {
      nodeType: 1,
      tagName: 'A',
      className: 'nav-link',
      id: '',
      ownerDocument: doc,
      parentElement: parent,
      children: [],
      getAttribute() {
        return null;
      },
      hasAttribute() {
        return false;
      },
      style: {
        setProperty(prop, val) {
          inlineStyles.set(prop, val);
        },
        getPropertyValue(prop) {
          return inlineStyles.get(prop) || '';
        },
        removeProperty(prop) {
          inlineStyles.delete(prop);
        }
      },
      _text: text,
      _index: index,
      _inlineStyles: inlineStyles
    };
    return link;
  };

  const links = ['Home', 'About', 'Blog', 'Contact'].map(makeLink);
  const ul = { children: links, tagName: 'UL', nodeType: 1, className: '', id: '', getAttribute: () => null, parentElement: null };
  for (const link of links) link.parentElement = ul;

  return { doc, links };
}

const computed = () => ({
  paddingTop: '8px',
  paddingRight: '12px',
  paddingBottom: '8px',
  paddingLeft: '12px',
  marginTop: '0px',
  marginRight: '0px',
  marginBottom: '0px',
  marginLeft: '0px',
  rowGap: '0px',
  columnGap: '0px',
  gap: '0px',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: 'normal'
});

describe('Shared selector', () => {
  test('is tag + classes with no path and no nth-of-type, and counts matches', () => {
    const { links } = createNavbar();
    const shared = buildSharedSelector(links[0]);
    assert.deepEqual(shared, { selector: 'a.nav-link', count: 4 });
  });

  test('is null for an element with no class to share', () => {
    const { links } = createNavbar();
    links[0].className = '';
    assert.equal(buildSharedSelector(links[0]), null);
  });

  test('resolves every match with the pinned element first', () => {
    const { links } = createNavbar();
    const resolved = resolveSharedElements(links[2], 'a.nav-link');
    assert.equal(resolved.length, 4);
    assert.equal(resolved[0], links[2]);
    assert.ok(!resolved.slice(1).includes(links[2]));
  });
});

describe('Scope: this element vs. every element sharing its classes', () => {
  function pinHome() {
    globalThis.window = { getComputedStyle: computed };
    const { links } = createNavbar();
    const state = new InspectorState();
    const id = state.pinElement(links[0]);
    return { state, id, links, item: state.getActiveItem() };
  }

  test('pins default to the unique element selector and remember the shared one', () => {
    const { item } = pinHome();
    assert.equal(item.scope, 'element');
    assert.equal(item.selector, 'ul > a.nav-link:nth-of-type(1)');
    assert.equal(item.elementSelector, item.selector);
    assert.equal(item.sharedSelector, 'a.nav-link');
    assert.equal(item.sharedCount, 4);
  });

  test('element scope edits only the pinned element', () => {
    const { state, id, links } = pinHome();
    state.updateStyle(id, 'fontSize', 18);
    assert.equal(links[0]._inlineStyles.get('font-size'), '18px');
    assert.equal(links[1]._inlineStyles.get('font-size'), undefined);
  });

  test('switching to class scope swaps the selector and fans existing edits out', () => {
    const { state, id, links, item } = pinHome();
    state.updateStyle(id, 'fontSize', 18);
    state.setScope(id, 'class');

    assert.equal(item.scope, 'class');
    assert.equal(item.selector, 'a.nav-link');
    for (const link of links) {
      assert.equal(link._inlineStyles.get('font-size'), '18px', `${link._text} should follow`);
    }
  });

  test('class scope edits land on every match', () => {
    const { state, id, links } = pinHome();
    state.setScope(id, 'class');
    state.updateStyle(id, 'paddingAll', 16);
    for (const link of links) {
      assert.equal(link._inlineStyles.get('padding-left'), '16px');
    }
  });

  test('switching back to element scope reverts the other matches only', () => {
    const { state, id, links, item } = pinHome();
    state.setScope(id, 'class');
    state.updateStyle(id, 'fontSize', 18);
    state.setScope(id, 'element');

    assert.equal(item.selector, 'ul > a.nav-link:nth-of-type(1)');
    assert.equal(links[0]._inlineStyles.get('font-size'), '18px');
    assert.equal(links[1]._inlineStyles.get('font-size'), undefined);
  });

  test('reset in class scope restores every match', () => {
    const { state, id, links } = pinHome();
    state.setScope(id, 'class');
    state.updateStyle(id, 'fontSize', 18);
    state.resetElement(id);
    for (const link of links) {
      assert.equal(link._inlineStyles.get('font-size'), undefined);
    }
  });

  test('class scope is refused when there is nothing to share', () => {
    globalThis.window = { getComputedStyle: computed };
    const { links } = createNavbar();
    links[0].className = '';
    const state = new InspectorState();
    const id = state.pinElement(links[0]);
    state.setScope(id, 'class');
    assert.equal(state.getActiveItem().scope, 'element');
  });
});

describe('Exporting a shared-scope item', () => {
  const sharedItem = () => ({
    id: 'pinned_1',
    selector: 'a.nav-link',
    elementSelector: 'ul > a.nav-link:nth-of-type(1)',
    sharedSelector: 'a.nav-link',
    sharedCount: 4,
    scope: 'class',
    label: '<a.nav-link>',
    baseline: { fontSize: 14, lineHeight: 1.4, letterSpacing: 0 },
    current: { fontSize: 18, lineHeight: 1.4, letterSpacing: 0 },
    notes: ''
  });

  test('markdown uses the shared selector, marks the rule, and instructs against a narrow override', () => {
    const md = generateSingleItemExport(sharedItem());
    assert.ok(md.includes('### `a.nav-link`'));
    assert.ok(!md.includes('nth-of-type'));
    assert.ok(md.includes('**Shared rule** — matches 4 elements.'));
    assert.ok(md.includes('do not scope the change down to one instance'));
  });

  test('the shared instruction is absent when nothing is shared', () => {
    const md = generateMarkdownExport([{ ...sharedItem(), scope: 'element', selector: 'ul > a.nav-link:nth-of-type(1)' }]);
    assert.ok(!md.includes('Shared rule'));
  });

  test('css carries the marker as a comment above the block', () => {
    const css = generateCssExport([sharedItem()]);
    assert.ok(css.includes('/* shared rule — matches 4 elements: change the rule for this class, not one instance */'));
    assert.ok(css.includes('a.nav-link {'));
  });

  test('json exposes scope and match count', () => {
    const json = JSON.parse(generateJsonExport([sharedItem()]));
    assert.equal(json.elements[0].scope, 'class');
    assert.equal(json.elements[0].matches, 4);
    assert.equal(json.elements[0].selector, 'a.nav-link');
  });
});
