/**
 * Text Content Reader and Mutator
 *
 * Style edits go through `styles.js`; copy edits go through here. The two are
 * kept apart because a text change is not a CSS property — it has no computed
 * value, no unit, and it lands in a template or message catalogue rather than a
 * stylesheet.
 *
 * The hard constraint is that writing `element.textContent` destroys every
 * child element. `readElementText` therefore classifies an element before the
 * panel offers any control for it.
 */

/**
 * Original text values, keyed by element, so an edit can be reverted.
 * @type {WeakMap<Element, { mode: string, node: Text|null, value: string }>}
 */
const originalText = new WeakMap();

/**
 * Splits a raw text value into its surrounding whitespace and its visible
 * content. Markup is usually indented, so the raw value of a heading is often
 * "\n      Total Revenue\n    ". The panel shows and diffs the trimmed middle;
 * the surrounding whitespace is preserved on write so the page's source
 * formatting is left untouched.
 * @param {string} raw
 * @returns {{ prefix: string, text: string, suffix: string }}
 */
function splitWhitespace(raw) {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw || '');
  if (!match) return { prefix: '', text: raw || '', suffix: '' };
  return { prefix: match[1], text: match[2], suffix: match[3] };
}

/**
 * Direct child text nodes that carry visible content.
 * @param {Element} element
 * @returns {Text[]}
 */
function meaningfulTextNodes(element) {
  return childNodesOf(element).filter(
    node => node.nodeType === 3 && node.nodeValue && node.nodeValue.trim() !== ''
  );
}

/**
 * Direct children as a plain array. Real elements always expose childNodes, but
 * this module is also driven by lightweight stand-ins in tests.
 * @param {Element} element
 * @returns {Node[]}
 */
function childNodesOf(element) {
  return element && element.childNodes ? Array.from(element.childNodes) : [];
}

/**
 * Determines whether an element's text can be edited without collateral damage,
 * and how.
 *
 * Modes:
 *   'textContent' — no element children, so the whole textContent is ours
 *   'textNode'    — mixed children with exactly one visible text run; that one
 *                   node is edited in place and sibling elements are untouched
 *   'none'        — several separate text runs, or nothing to edit
 *
 * @param {Element} element
 * @returns {{ text: string, editable: boolean, mode: string, node: Text|null,
 *             prefix: string, suffix: string, reason: string }}
 */
export function readElementText(element) {
  const empty = {
    text: '',
    editable: false,
    mode: 'none',
    node: null,
    prefix: '',
    suffix: '',
    reason: ''
  };

  if (!element || element.nodeType !== 1) {
    return { ...empty, reason: 'Not an element.' };
  }

  const hasElementChildren = childNodesOf(element).some(node => node.nodeType === 1);

  if (!hasElementChildren) {
    const { prefix, text, suffix } = splitWhitespace(element.textContent || '');
    return { text, editable: true, mode: 'textContent', node: null, prefix, suffix, reason: '' };
  }

  const textNodes = meaningfulTextNodes(element);

  if (textNodes.length === 1) {
    const node = textNodes[0];
    const { prefix, text, suffix } = splitWhitespace(node.nodeValue || '');
    return { text, editable: true, mode: 'textNode', node, prefix, suffix, reason: '' };
  }

  if (textNodes.length === 0) {
    return {
      ...empty,
      reason: 'This element only contains other elements — pin the one holding the text.'
    };
  }

  return {
    ...empty,
    reason: `This element has ${textNodes.length} separate text runs — pin one of its children instead.`
  };
}

/**
 * Captures the pre-edit text so `resetElementText` can restore it.
 * @param {Element} element
 * @param {{ textMode: string, textNode: Text|null }} record
 */
function captureOriginalText(element, record) {
  if (!element || originalText.has(element)) return;

  if (record.textMode === 'textNode' && record.textNode) {
    originalText.set(element, {
      mode: 'textNode',
      node: record.textNode,
      value: record.textNode.nodeValue || ''
    });
  } else {
    originalText.set(element, {
      mode: 'textContent',
      node: null,
      value: element.textContent || ''
    });
  }
}

/**
 * Writes new visible text to an element, preserving the surrounding whitespace
 * captured at pin time.
 * @param {Element} element
 * @param {{ textMode: string, textNode: Text|null, textPrefix: string, textSuffix: string }} record
 * @param {string} value
 * @returns {boolean} whether anything was written
 */
export function applyElementText(element, record, value) {
  if (!element || !record) return false;
  if (record.textMode !== 'textContent' && record.textMode !== 'textNode') return false;

  captureOriginalText(element, record);

  const next = `${record.textPrefix || ''}${value}${record.textSuffix || ''}`;

  if (record.textMode === 'textNode') {
    if (!record.textNode) return false;
    record.textNode.nodeValue = next;
    return true;
  }

  element.textContent = next;
  return true;
}

/**
 * Reverts an element's text back to what it was before the inspector touched it.
 * @param {Element} element
 */
export function resetElementText(element) {
  if (!element || !originalText.has(element)) return;
  const saved = originalText.get(element);

  if (saved.mode === 'textNode' && saved.node) {
    saved.node.nodeValue = saved.value;
  } else {
    element.textContent = saved.value;
  }

  originalText.delete(element);
}

/**
 * Text change for a pinned item, or null when the copy is untouched.
 * @param {object} item - Pinned element record
 * @returns {{ before: string, after: string } | null}
 */
export function computeTextDiff(item) {
  if (!item) return null;
  const before = item.baselineText || '';
  const after = item.currentText || '';
  return before === after ? null : { before, after };
}
