import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateMarkdownExport, generateSingleItemExport } from '../src/core/exporter.js';

describe('Markdown Exporter', () => {
  test('generates markdown matching PRD section 7.3 specification', () => {
    const cardItem = {
      id: 'pinned_1',
      selector: '[data-testid="dashboard_page_stat_card"]',
      baseline: {
        paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 8, fontSize: 16, lineHeight: 1.4, letterSpacing: 0
      },
      current: {
        paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 16, fontSize: 16, lineHeight: 1.4, letterSpacing: 0
      },
      notes: ''
    };

    const titleItem = {
      id: 'pinned_2',
      selector: '[data-testid="dashboard_page_stat_card_title"]',
      baseline: {
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 0, fontSize: 14, lineHeight: 1.2, letterSpacing: 0
      },
      current: {
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 0, fontSize: 16, lineHeight: 1.4, letterSpacing: 0
      },
      notes: ''
    };

    const markdown = generateMarkdownExport([cardItem, titleItem]);

    assert.ok(markdown.includes('## Style Adjustment Request'));
    assert.ok(markdown.includes('### Element: `[data-testid="dashboard_page_stat_card"]`'));
    assert.ok(markdown.includes('- padding: 12px → 20px'));
    assert.ok(markdown.includes('- gap: 8px → 16px'));
    assert.ok(markdown.includes('### Element: `[data-testid="dashboard_page_stat_card_title"]`'));
    assert.ok(markdown.includes('- font-size: 14px → 16px'));
    assert.ok(markdown.includes('- line-height: 1.2 → 1.4'));
    assert.ok(markdown.includes('Instruction: Apply the changes above to the relevant SCSS/style file(s).'));
  });

  test('includes user notes when provided', () => {
    const item = {
      id: 'pinned_1',
      selector: '[data-testid="stat_card"]',
      baseline: {
        paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 0, fontSize: 16, lineHeight: 1.4, letterSpacing: 0
      },
      current: {
        paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        gap: 0, fontSize: 16, lineHeight: 1.4, letterSpacing: 0
      },
      notes: 'This is one instance of a repeated card component'
    };

    const singleMd = generateSingleItemExport(item);
    assert.ok(singleMd.includes('Note: This is one instance of a repeated card component'));
    assert.ok(singleMd.includes('- padding: 10px → 24px'));
  });
});
