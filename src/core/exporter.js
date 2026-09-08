/**
 * Markdown Exporter for Antigravity AI Coding Agent
 * Generates structured markdown conforming to PRD Section 7.3.
 */

import { computeStyleDiff } from './styles.js';

const DEFAULT_INSTRUCTION =
  "Apply the changes above to the relevant SCSS/style file(s). The selectors above reference the automation-id (data-testid) already present in the source code — find the element with that attribute. Values are in px as read from the browser; convert to the file's existing unit convention (rem/em/%) if applicable.";

/**
 * Format markdown for an individual pinned element.
 * @param {object} item - Pinned element record
 * @returns {string}
 */
export function formatElementSection(item) {
  const diffs = computeStyleDiff(item.baseline, item.current);
  if (!diffs || diffs.length === 0) {
    return `### Element: \`${item.selector}\`\n*(No style changes recorded)*`;
  }

  const lines = [`### Element: \`${item.selector}\``];

  for (const diff of diffs) {
    lines.push(`- ${diff.property}: ${diff.before} → ${diff.after}`);
  }

  if (item.notes && item.notes.trim()) {
    lines.push(`\nNote: ${item.notes.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Generates full markdown for an array of pinned items.
 * @param {Array<object>} items
 * @param {string} [customInstruction]
 * @returns {string}
 */
export function generateMarkdownExport(items, customInstruction = DEFAULT_INSTRUCTION) {
  if (!items || items.length === 0) {
    return '## Style Adjustment Request\n\n*(No elements were pinned or modified)*';
  }

  // Filter items that have changes, or include all pinned items if none have changes yet
  const itemsWithChanges = items.filter(item => {
    const diffs = computeStyleDiff(item.baseline, item.current);
    return diffs.length > 0;
  });

  const targetItems = itemsWithChanges.length > 0 ? itemsWithChanges : items;

  const sections = targetItems.map(formatElementSection);

  const content = [
    '## Style Adjustment Request',
    '',
    sections.join('\n\n'),
    '',
    `Instruction: ${customInstruction}`
  ];

  return content.join('\n');
}

/**
 * Generates markdown for a single pinned item.
 * @param {object} item
 * @param {string} [customInstruction]
 * @returns {string}
 */
export function generateSingleItemExport(item, customInstruction = DEFAULT_INSTRUCTION) {
  const section = formatElementSection(item);
  return [
    '## Style Adjustment Request',
    '',
    section,
    '',
    `Instruction: ${customInstruction}`
  ].join('\n');
}

/**
 * Copies text to system clipboard with fallback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[Style Inspector] Clipboard writeText failed, falling back:', err);
    }
  }

  // Fallback for document.execCommand
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      console.error('[Style Inspector] Copy fallback failed:', e);
      return false;
    }
  }

  return false;
}
