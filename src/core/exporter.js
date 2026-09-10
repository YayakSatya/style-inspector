/**
 * Exporters
 *
 * Three formats over the same diff:
 *   markdown — prose for an AI coding agent (the default)
 *   css      — a declaration block per selector, ready to paste into a stylesheet
 *   json     — structured, for anything that wants to consume changes as data
 *
 * SCSS is deliberately not a separate format. The selectors this tool emits are
 * flat (an attribute selector, or a `>` path), so a SCSS file would be
 * byte-identical to the CSS one — an option that changes nothing is worse than
 * no option.
 */

import { computeStyleDiff } from './styles.js';
import { computeTextDiff } from './text.js';

/**
 * The instruction is assembled from what the export actually contains rather
 * than pasted in whole. A style-only export used to carry a paragraph about
 * `text:` lines and i18n catalogues that had nothing to do with it, and it
 * claimed every selector was a `data-testid` even when the element had none —
 * both of which an agent has to read past before it can start work.
 */
const INSTRUCTION = {
  apply:
    'Apply the changes above to the source that renders each element — the component, template, or stylesheet it comes from.',
  selectorTestId:
    'Each heading is a `data-testid` attribute that already exists in the source. Search for it to find the element.',
  selectorMixed:
    'Each heading is a CSS selector for the element as it appears in the rendered DOM. Some are attribute selectors present verbatim in the source; others are structural paths you will need to trace.',
  mechanism:
    "Use whichever styling mechanism the project already uses for that element — stylesheet, CSS module, utility classes, CSS-in-JS. Do not introduce inline styles unless the file already works that way.",
  computed:
    'The `From` column is the computed value at the time of inspection, not necessarily what the source declares. When a value comes from a shared class or a design token, change it where it is defined, or add a narrower override if that shared rule has other users.',
  text:
    'A **Text** line is a copy change. It belongs to the template, component, or i18n catalogue that produces the string, never to a stylesheet.',
  notes: 'A **Note** line is context from whoever requested the change, and may constrain where the edit belongs.'
};

/**
 * Whether a selector is an automation-id attribute selector, which is the case
 * where "search the source for this string" is literally true.
 * @param {string} selector
 * @returns {boolean}
 */
function isTestIdSelector(selector) {
  return /^\[data-testid=/.test(`${selector || ''}`);
}

/**
 * Builds the instruction for one export, as a list of lines.
 *
 * A custom instruction replaces the whole thing — if someone has written their
 * own, adding paragraphs underneath it defeats the point.
 *
 * @param {Array<object>} items - the items the export covers
 * @param {object} [options] - `{ instruction }`
 * @returns {string[]}
 */
function instructionLines(items, options = {}) {
  const custom = (options.instruction || '').trim();
  if (custom) return [custom];

  const list = items || [];
  const lines = [
    INSTRUCTION.apply,
    list.length > 0 && list.every(item => isTestIdSelector(item.selector))
      ? INSTRUCTION.selectorTestId
      : INSTRUCTION.selectorMixed,
    INSTRUCTION.mechanism,
    INSTRUCTION.computed
  ];

  if (list.some(item => computeTextDiff(item))) lines.push(INSTRUCTION.text);
  if (list.some(item => item.notes && item.notes.trim())) lines.push(INSTRUCTION.notes);

  return lines;
}

/**
 * The one-line summary under the title: how much is here, and in what unit.
 * @param {Array<object>} items
 * @param {object} [options] - `{ unit }`
 * @returns {string}
 */
function summaryLine(items, options = {}) {
  const styleCount = items.reduce((total, item) => total + diffsFor(item, options).length, 0);
  const textCount = items.filter(item => computeTextDiff(item)).length;

  const parts = [`${items.length} element${items.length === 1 ? '' : 's'}`];
  parts.push(`${styleCount} style change${styleCount === 1 ? '' : 's'}`);
  if (textCount > 0) parts.push(`${textCount} copy change${textCount === 1 ? '' : 's'}`);
  parts.push(`lengths in \`${options.unit || 'px'}\``);

  return parts.join(' · ');
}

/** Formats this module can produce, and the file extension each downloads as. */
export const EXPORT_FORMATS = [
  { id: 'markdown', label: 'Markdown', extension: 'md', mime: 'text/markdown' },
  { id: 'css', label: 'CSS', extension: 'css', mime: 'text/css' },
  { id: 'json', label: 'JSON', extension: 'json', mime: 'application/json' }
];

/**
 * Builds the unit-conversion context for one pinned element.
 * @param {object} item
 * @param {object} [options]
 * @returns {object}
 */
function unitContext(item, options = {}) {
  return {
    unit: options.unit || 'px',
    rootFontSize: item.rootFontSize,
    parentFontSize: item.parentFontSize
  };
}

/**
 * The style changes for a pinned element, in the requested unit.
 * @param {object} item
 * @param {object} [options]
 * @returns {Array<{ property: string, before: string, after: string }>}
 */
function diffsFor(item, options) {
  return computeStyleDiff(item.baseline, item.current, unitContext(item, options));
}

/**
 * Renders a text change as one markdown line, or as a pair of fenced blocks
 * when either side spans multiple lines.
 * @param {{ before: string, after: string }} diff
 * @returns {string}
 */
function formatTextChange(diff) {
  const isMultiline = diff.before.includes('\n') || diff.after.includes('\n');

  if (!isMultiline) {
    return `**Text:** ${JSON.stringify(diff.before)} → ${JSON.stringify(diff.after)}`;
  }

  return [
    '**Text:**',
    '',
    'Before:',
    '',
    '```',
    diff.before,
    '```',
    '',
    'After:',
    '',
    '```',
    diff.after,
    '```'
  ].join('\n');
}

/**
 * Renders the style changes as a table.
 *
 * A table rather than a bullet list because a change is three pieces of
 * information — property, old, new — and reading them down aligned columns
 * beats re-parsing `a: b → c` on every line, both for a person skimming the
 * paste and for a model consuming it.
 *
 * @param {Array<{ property: string, before: string, after: string }>} diffs
 * @returns {string}
 */
function formatDiffTable(diffs) {
  return [
    '| Property | From | To |',
    '| --- | --- | --- |',
    ...diffs.map(diff => `| \`${diff.property}\` | \`${diff.before}\` | \`${diff.after}\` |`)
  ].join('\n');
}

/**
 * True when a pinned element carries anything worth exporting.
 * @param {object} item - Pinned element record
 * @returns {boolean}
 */
export function hasChanges(item) {
  if (!item) return false;
  if (computeTextDiff(item)) return true;
  if (item.notes && item.notes.trim()) return true;
  return computeStyleDiff(item.baseline, item.current).length > 0;
}

/**
 * The items an export should cover: those with changes, falling back to every
 * pinned item when nothing has been changed yet.
 * @param {Array<object>} items
 * @returns {Array<object>}
 */
function targetItems(items) {
  const changed = items.filter(hasChanges);
  return changed.length > 0 ? changed : items;
}

/**
 * Format markdown for an individual pinned element.
 * @param {object} item - Pinned element record
 * @param {object} [options] - `{ unit }`
 * @returns {string}
 */
export function formatElementSection(item, options, index) {
  const diffs = diffsFor(item, options);
  const textDiff = computeTextDiff(item);
  const notes = item.notes && item.notes.trim();
  const heading = `### ${index ? `${index}. ` : ''}\`${item.selector}\``;

  const lines = [heading];

  // The label carries what the selector cannot: the tag and the shape of the
  // element. Only worth a line when it says something the selector does not.
  // The label is markup-shaped (`<div #card>`); a markdown renderer would treat
  // it as a tag and swallow it, so it has to be a code span.
  if (item.label && !heading.includes(item.label)) {
    lines.push('', `\`${item.label}\``);
  }

  if (diffs.length === 0 && !textDiff) {
    lines.push('', notes ? '_No style or copy changes recorded._' : '*(No style changes recorded)*');
  }

  // Copy changes lead — they describe what the element says, which frames the
  // style changes that follow.
  if (textDiff) {
    lines.push('', formatTextChange(textDiff));
  }

  if (diffs.length > 0) {
    lines.push('', formatDiffTable(diffs));
  }

  if (notes) {
    lines.push('', `> **Note:** ${notes}`);
  }

  return lines.join('\n');
}

/**
 * Generates full markdown for an array of pinned items.
 * @param {Array<object>} items
 * @param {object} [options] - `{ unit, instruction }`
 * @returns {string}
 */
export function generateMarkdownExport(items, options = {}) {
  if (!items || items.length === 0) {
    return '## Style Adjustment Request\n\n*(No elements were pinned or modified)*';
  }

  const list = targetItems(items);
  const sections = list.map((item, index) =>
    formatElementSection(item, options, list.length > 1 ? index + 1 : 0)
  );

  return [
    '## Style Adjustment Request',
    '',
    summaryLine(list, options),
    '',
    sections.join('\n\n'),
    '',
    '---',
    '',
    '### How to apply',
    '',
    ...instructionLines(list, options).map(line => `- ${line}`)
  ].join('\n');
}

/**
 * Generates markdown for a single pinned item.
 * @param {object} item
 * @param {object} [options] - `{ unit, instruction }`
 * @returns {string}
 */
export function generateSingleItemExport(item, options = {}) {
  return [
    '## Style Adjustment Request',
    '',
    summaryLine([item], options),
    '',
    formatElementSection(item, options),
    '',
    '---',
    '',
    '### How to apply',
    '',
    ...instructionLines([item], options).map(line => `- ${line}`)
  ].join('\n');
}

/**
 * Generates a CSS declaration block per element, holding the target values.
 *
 * Only the "after" side is emitted, because that is what belongs in a
 * stylesheet; the previous value is kept as a trailing comment so a reviewer
 * can see what changed. Text changes cannot be expressed in CSS at all, so they
 * appear as a comment above the block.
 * @param {Array<object>} items
 * @param {object} [options] - `{ unit, instruction }`
 * @returns {string}
 */
export function generateCssExport(items, options = {}) {
  if (!items || items.length === 0) {
    return '/* Style Adjustment Request — no elements were pinned or modified */';
  }

  const blocks = targetItems(items).map(item => {
    const diffs = diffsFor(item, options);
    const textDiff = computeTextDiff(item);
    const lines = [];

    if (textDiff) {
      lines.push(`/* text: ${JSON.stringify(textDiff.before)} → ${JSON.stringify(textDiff.after)} */`);
    }
    if (item.notes && item.notes.trim()) {
      lines.push(`/* ${item.notes.trim().replace(/\*\//g, '*\\/')} */`);
    }

    if (diffs.length === 0) {
      lines.push(`/* ${item.selector} — no style changes */`);
      return lines.join('\n');
    }

    lines.push(`${item.selector} {`);
    for (const diff of diffs) {
      lines.push(`  ${diff.property}: ${diff.after}; /* was ${diff.before} */`);
    }
    lines.push('}');

    return lines.join('\n');
  });

  const instruction = instructionLines(targetItems(items), options);

  return [
    '/* Style Adjustment Request */',
    '',
    blocks.join('\n\n'),
    '',
    '/*',
    ...instruction.map(line => ` * ${line.replace(/\*\//g, '*\\/')}`),
    ' */'
  ].join('\n');
}

/**
 * Generates the same information as structured data.
 * @param {Array<object>} items
 * @param {object} [options] - `{ unit, instruction }`
 * @returns {string}
 */
export function generateJsonExport(items, options = {}) {
  const list = items && items.length ? targetItems(items) : [];

  const payload = {
    unit: options.unit || 'px',
    instruction: instructionLines(list, options).join('\n'),
    elements: list.map(item => {
      const textDiff = computeTextDiff(item);
      return {
        selector: item.selector,
        label: item.label,
        text: textDiff ? { before: textDiff.before, after: textDiff.after } : null,
        changes: diffsFor(item, options),
        notes: item.notes || ''
      };
    })
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Produces an export in the requested format.
 * @param {Array<object>} items
 * @param {object} [options] - `{ format, unit, instruction }`
 * @returns {string}
 */
export function generateExport(items, options = {}) {
  switch (options.format) {
    case 'css':
      return generateCssExport(items, options);
    case 'json':
      return generateJsonExport(items, options);
    default:
      return generateMarkdownExport(items, options);
  }
}

/**
 * Metadata for a format id, falling back to markdown.
 * @param {string} format
 * @returns {object}
 */
export function exportFormatInfo(format) {
  return EXPORT_FORMATS.find(entry => entry.id === format) || EXPORT_FORMATS[0];
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

/**
 * Offers the export to the user as a file download.
 * @param {string} text
 * @param {string} format
 * @returns {boolean} whether the download was started
 */
export function downloadExport(text, format) {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return false;

  const info = exportFormatInfo(format);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([text], { type: `${info.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `style-adjustments-${stamp}.${info.extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return true;
}
