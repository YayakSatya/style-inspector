import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getElementSelector, getElementLabel, buildTagClassFallback } from '../src/core/selector.js';

describe('Selector Generator', () => {
  function createMockElement({
    tagName = 'div',
    testId = null,
    id = null,
    className = '',
    parent = null,
    children = []
  } = {}) {
    const el = {
      nodeType: 1,
      tagName: tagName.toUpperCase(),
      id: id || '',
      className: className || '',
      parentElement: parent,
      children: children,
      ownerDocument: null,
      getAttribute(attr) {
        if (attr === 'data-testid') return testId;
        return null;
      },
      hasAttribute(attr) {
        return Boolean(this.getAttribute(attr));
      }
    };
    return el;
  }

  test('prioritizes data-testid attribute if present', () => {
    const el = createMockElement({
      tagName: 'div',
      testId: 'dashboard_page_stat_card',
      id: 'stat-box',
      className: 'card bg-white p-4'
    });

    const selector = getElementSelector(el);
    assert.equal(selector, '[data-testid="dashboard_page_stat_card"]');
  });

  test('generates tag + class fallback when no data-testid or parent tree available', () => {
    const el = createMockElement({
      tagName: 'button',
      className: 'btn btn-primary'
    });

    const fallback = buildTagClassFallback(el);
    assert.equal(fallback, 'button.btn.btn-primary');
  });

  test('generates short human-readable label with data-testid', () => {
    const el = createMockElement({
      tagName: 'h2',
      testId: 'dashboard_page_stat_card_title'
    });

    const label = getElementLabel(el);
    assert.equal(label, '<h2 [dashboard_page_stat_card_title]>');
  });

  test('generates short human-readable label with id when testid absent', () => {
    const el = createMockElement({
      tagName: 'section',
      id: 'main-content'
    });

    const label = getElementLabel(el);
    assert.equal(label, '<section #main-content>');
  });

  test('generates short human-readable label with class when id and testid absent', () => {
    const el = createMockElement({
      tagName: 'span',
      className: 'badge badge-success'
    });

    const label = getElementLabel(el);
    assert.equal(label, '<span.badge>');
  });
});
