import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { InspectorState } from '../src/core/state.js';
import { generateMarkdownExport, generateSingleItemExport } from '../src/core/exporter.js';

describe('Style Inspector End-to-End State Machine Integration', () => {
  function createFakeDOMElement(tag, testId, initialComputed) {
    const inlineStyles = new Map();
    return {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      getAttribute(attr) {
        if (attr === 'data-testid') return testId;
        return null;
      },
      hasAttribute(attr) {
        return Boolean(this.getAttribute(attr));
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
      _computed: initialComputed,
      _inlineStyles: inlineStyles
    };
  }

  test('full inspection lifecycle: pin -> adjust -> export -> reset', () => {
    const state = new InspectorState();

    // 1. Toggle inspect mode
    state.startInspecting();
    assert.equal(state.isInspecting, true);

    // 2. Target element with data-testid from PRD
    const cardEl = createFakeDOMElement('div', 'dashboard_page_stat_card');
    const fakeWin = {
      getComputedStyle: () => ({
        paddingTop: '12px',
        paddingRight: '12px',
        paddingBottom: '12px',
        paddingLeft: '12px',
        marginTop: '0px',
        marginRight: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
        rowGap: '8px',
        columnGap: '8px',
        gap: '8px',
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: 'normal'
      })
    };

    // Pin element (using global window mock)
    globalThis.window = fakeWin;
    const pinnedId = state.pinElement(cardEl);
    assert.ok(pinnedId);
    assert.equal(state.pinnedItems.size, 1);
    assert.equal(state.activePinnedId, pinnedId);

    const pinnedItem = state.getActiveItem();
    assert.equal(pinnedItem.selector, '[data-testid="dashboard_page_stat_card"]');
    assert.equal(pinnedItem.baseline.paddingTop, 12);
    assert.equal(pinnedItem.baseline.gap, 8);

    // 3. Live adjustments: padding 12px -> 20px, gap 8px -> 16px
    state.updateStyle(pinnedId, 'paddingAll', 20);
    assert.equal(cardEl._inlineStyles.get('padding-top'), '20px');
    assert.equal(cardEl._inlineStyles.get('padding-right'), '20px');
    assert.equal(cardEl._inlineStyles.get('padding-bottom'), '20px');
    assert.equal(cardEl._inlineStyles.get('padding-left'), '20px');

    state.updateStyle(pinnedId, 'gap', 16);
    assert.equal(cardEl._inlineStyles.get('gap'), '16px');

    // 4. Pin second element: title
    const titleEl = createFakeDOMElement('span', 'dashboard_page_stat_card_title');
    fakeWin.getComputedStyle = () => ({
      paddingTop: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      marginTop: '0px',
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      rowGap: '0px',
      columnGap: '0px',
      gap: '0px',
      fontSize: '14px',
      lineHeight: '1.2',
      letterSpacing: 'normal'
    });

    const titleId = state.pinElement(titleEl);
    assert.equal(state.pinnedItems.size, 2);

    // Adjust title font-size: 14px -> 16px, line-height 1.2 -> 1.4
    state.updateStyle(titleId, 'fontSize', 16);
    state.updateStyle(titleId, 'lineHeight', 1.4);

    // Add note to card
    state.setNotes(pinnedId, 'Stat card container instance');

    // 5. Generate Markdown Export
    const markdown = generateMarkdownExport(state.getPinnedList());

    // Verify all PRD section 7.3 requirements
    assert.ok(markdown.includes('## Style Adjustment Request'));
    assert.ok(markdown.includes('`[data-testid="dashboard_page_stat_card"]`'));
    assert.ok(markdown.includes('| `padding` | `12px` | `20px` |'));
    assert.ok(markdown.includes('| `gap` | `8px` | `16px` |'));
    assert.ok(markdown.includes('> **Note:** Stat card container instance'));
    assert.ok(markdown.includes('`[data-testid="dashboard_page_stat_card_title"]`'));
    assert.ok(markdown.includes('| `font-size` | `14px` | `16px` |'));
    assert.ok(markdown.includes('| `line-height` | `1.2` | `1.4` |'));
    assert.ok(markdown.includes('### How to apply'));
    assert.ok(markdown.includes('Apply the changes above to the source that renders each element'));

    // 6. Test Single Item Export
    const singleMd = generateSingleItemExport(state.pinnedItems.get(pinnedId));
    assert.ok(singleMd.includes('`[data-testid="dashboard_page_stat_card"]`'));
    assert.ok(!singleMd.includes('`[data-testid="dashboard_page_stat_card_title"]`'));

    // 7. Reset Element
    state.resetElement(pinnedId);
    assert.equal(cardEl._inlineStyles.size, 0); // Reverted back cleanly
    assert.equal(state.pinnedItems.get(pinnedId).current.paddingTop, 12);
  });

  test('resetAllStyles reverts every element but keeps the session', () => {
    const state = new InspectorState();
    globalThis.window = {
      getComputedStyle: () => ({
        paddingTop: '12px', paddingRight: '12px', paddingBottom: '12px', paddingLeft: '12px',
        marginTop: '0px', marginRight: '0px', marginBottom: '0px', marginLeft: '0px',
        rowGap: '0px', columnGap: '0px', gap: '0px',
        fontSize: '16px', lineHeight: '24px', letterSpacing: 'normal'
      })
    };

    const a = createFakeDOMElement('div', 'card_a');
    const b = createFakeDOMElement('div', 'card_b');
    const idA = state.pinElement(a);
    const idB = state.pinElement(b);

    state.updateStyle(idA, 'paddingAll', 32);
    state.updateStyle(idB, 'paddingAll', 40);
    assert.equal(state.pinnedItems.get(idA).current.paddingTop, 32);

    state.resetAllStyles();

    assert.equal(a._inlineStyles.size, 0);
    assert.equal(b._inlineStyles.size, 0);
    assert.equal(state.pinnedItems.get(idA).current.paddingTop, 12);
    assert.equal(state.pinnedItems.get(idB).current.paddingTop, 12);
    // The distinction from clearAll: the pins survive.
    assert.equal(state.pinnedItems.size, 2);
    assert.equal(state.activePinnedId, idB);
  });

  test('editing a unitless number does not leave a phantom diff behind', () => {
    // Regression: storing opacity as a string made it unequal to its numeric
    // baseline, so re-setting the same value reported `opacity: 1 → 1`.
    const state = new InspectorState();
    globalThis.window = {
      getComputedStyle: () => ({
        paddingTop: '0px', paddingRight: '0px', paddingBottom: '0px', paddingLeft: '0px',
        marginTop: '0px', marginRight: '0px', marginBottom: '0px', marginLeft: '0px',
        rowGap: '0px', columnGap: '0px', gap: '0px',
        fontSize: '16px', lineHeight: '24px', letterSpacing: 'normal',
        opacity: '1'
      })
    };

    const el = createFakeDOMElement('div', 'card');
    const id = state.pinElement(el);

    state.updateStyle(id, 'opacity', 1);
    const item = state.pinnedItems.get(id);
    assert.equal(typeof item.current.opacity, 'number');
    assert.equal(generateSingleItemExport(item).includes('`opacity`'), false);

    state.updateStyle(id, 'opacity', 0.4);
    assert.ok(generateSingleItemExport(state.pinnedItems.get(id)).includes('| `opacity` | `1` | `0.4` |'));
  });

  test('clearAll reverts every element and discards the session', () => {
    const state = new InspectorState();
    globalThis.window = {
      getComputedStyle: () => ({
        paddingTop: '12px', paddingRight: '12px', paddingBottom: '12px', paddingLeft: '12px',
        marginTop: '0px', marginRight: '0px', marginBottom: '0px', marginLeft: '0px',
        rowGap: '0px', columnGap: '0px', gap: '0px',
        fontSize: '16px', lineHeight: '24px', letterSpacing: 'normal'
      })
    };

    const el = createFakeDOMElement('div', 'card_a');
    const id = state.pinElement(el);
    state.updateStyle(id, 'paddingAll', 32);

    state.clearAll();

    assert.equal(el._inlineStyles.size, 0);
    assert.equal(state.pinnedItems.size, 0);
    assert.equal(state.activePinnedId, null);
  });
});
