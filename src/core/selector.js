/**
 * Element Selector Generator
 * Prioritizes:
 * 1. data-testid attribute: [data-testid="value"]
 * 2. Unique CSS selector path (walking up parent tree with nth-of-type / nth-child / id)
 * 3. Tag + class fallback
 */

/**
 * Returns the primary identifier selector for an element.
 * @param {Element} element
 * @returns {string}
 */
export function getElementSelector(element) {
  if (!element || element.nodeType !== 1) {
    return '';
  }

  // 1. Check data-testid attribute
  const testId = element.getAttribute('data-testid');
  if (testId && testId.trim()) {
    return `[data-testid="${testId.trim()}"]`;
  }

  // Also check standard automation data attributes if present as bonus
  const altTestId = element.getAttribute('data-test-id') || element.getAttribute('data-qa');
  if (altTestId && altTestId.trim()) {
    const attr = element.hasAttribute('data-test-id') ? 'data-test-id' : 'data-qa';
    return `[${attr}="${altTestId.trim()}"]`;
  }

  // 2. Build unique CSS selector path
  const uniquePath = buildCssPath(element);
  if (uniquePath) {
    return uniquePath;
  }

  // 3. Fallback: tag + class
  return buildTagClassFallback(element);
}

/**
 * Builds a unique CSS selector path for an element.
 * @param {Element} element
 * @returns {string}
 */
export function buildCssPath(element) {
  if (!element || element.nodeType !== 1) return '';

  const path = [];
  let curr = element;

  while (curr && curr.nodeType === 1) {
    // If element has data-testid, use it as a solid anchor in the path
    const testId = curr.getAttribute('data-testid');
    if (testId && testId.trim()) {
      path.unshift(`[data-testid="${testId.trim()}"]`);
      break;
    }

    // If element has an ID and it's unique in the document
    if (curr.id && isValidId(curr.id)) {
      const doc = curr.ownerDocument || (typeof document !== 'undefined' ? document : null);
      if (doc && doc.querySelectorAll(`#${CSS.escape ? CSS.escape(curr.id) : curr.id}`).length === 1) {
        path.unshift(`#${curr.id}`);
        break;
      }
    }

    // Stop at body / html
    const tag = curr.tagName.toLowerCase();
    if (tag === 'body' || tag === 'html') {
      path.unshift(tag);
      break;
    }

    // Build segment for current element
    let segment = tag;
    const meaningfulClasses = getMeaningfulClasses(curr);
    if (meaningfulClasses.length > 0) {
      segment += '.' + meaningfulClasses.slice(0, 2).join('.');
    }

    // Check sibling index if needed for uniqueness among siblings
    const parent = curr.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === curr.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(curr) + 1;
        segment += `:nth-of-type(${index})`;
      }
    }

    path.unshift(segment);
    curr = curr.parentElement;
  }

  return path.join(' > ');
}

/**
 * Builds a simple tag + class fallback.
 * @param {Element} element
 * @returns {string}
 */
export function buildTagClassFallback(element) {
  const tag = element.tagName.toLowerCase();
  const classes = getMeaningfulClasses(element);
  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`;
  }
  return tag;
}

/**
 * Builds the selector that a shared stylesheet rule for this element would
 * carry: tag plus its meaningful classes, with no path and no `:nth-of-type`.
 *
 * The unique path from `buildCssPath` is right when the user means "this one
 * element", and wrong when they mean "every element styled like this one" —
 * the navbar case, where changing one link is meant to change all of them.
 * This is the selector for the second reading, along with how many elements
 * it currently matches so the UI can tell the two cases apart.
 *
 * @param {Element} element
 * @returns {{ selector: string, count: number } | null} null when the element
 *   has no class to share
 */
export function buildSharedSelector(element) {
  if (!element || element.nodeType !== 1) return null;

  const classes = getMeaningfulClasses(element);
  if (classes.length === 0) return null;

  const escape = cls => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(cls) : cls);
  const selector = `${element.tagName.toLowerCase()}.${classes.map(escape).join('.')}`;

  const doc = element.ownerDocument || (typeof document !== 'undefined' ? document : null);
  let count = 1;
  if (doc && typeof doc.querySelectorAll === 'function') {
    try {
      count = doc.querySelectorAll(selector).length;
    } catch (err) {
      count = 1;
    }
  }

  return { selector, count };
}

/**
 * Every element the shared selector currently matches, the pinned one first.
 * Resolved on demand rather than stored, so a page that re-renders its list
 * between two edits still gets every current match.
 * @param {Element} element
 * @param {string} selector
 * @returns {Element[]}
 */
export function resolveSharedElements(element, selector) {
  if (!element || !selector) return element ? [element] : [];

  const doc = element.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!doc || typeof doc.querySelectorAll !== 'function') return [element];

  let matches = [];
  try {
    matches = Array.from(doc.querySelectorAll(selector));
  } catch (err) {
    return [element];
  }

  return [element, ...matches.filter(match => match !== element)];
}

/**
 * Filter out dynamic or inspector-related classes.
 * @param {Element} element
 * @returns {string[]}
 */
function getMeaningfulClasses(element) {
  if (!element.className || typeof element.className !== 'string') return [];
  return element.className
    .trim()
    .split(/\s+/)
    .filter(cls => {
      if (!cls) return false;
      if (cls.startsWith('style-inspector')) return false;
      // Filter out common framework hash classes if very long or hex-like
      if (/^[a-zA-Z0-9_-]{18,}$/.test(cls)) return false;
      return true;
    });
}

/**
 * Basic ID validation
 * @param {string} id
 * @returns {boolean}
 */
function isValidId(id) {
  return Boolean(id && typeof id === 'string' && !/\s/.test(id) && !/^[0-9]/.test(id));
}

/**
 * Returns a short human-readable label for badges and tooltips.
 * @param {Element} element
 * @returns {string}
 */
export function getElementLabel(element) {
  if (!element || element.nodeType !== 1) return '';
  const tag = element.tagName.toLowerCase();
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `<${tag} [${testId}]>`;
  }
  if (element.id && isValidId(element.id)) {
    return `<${tag} #${element.id}>`;
  }
  const classes = getMeaningfulClasses(element);
  if (classes.length > 0) {
    return `<${tag}.${classes[0]}>`;
  }
  return `<${tag}>`;
}

/**
 * Escapes HTML special characters to prevent DOM parsing glitches when interpolating into innerHTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
