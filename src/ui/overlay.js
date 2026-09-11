/**
 * Highlight and Pin Overlays
 */

import { getElementLabel, escapeHtml } from '../core/selector.js';
import { parsePx } from '../core/css-value.js';
import { siIcon } from './icons.js';

/**
 * Width of the hover / pinned outline, mirroring --si-outline-w in the
 * stylesheet. Boxes are inflated by this much so the border sits entirely
 * outside the element and never covers its edge.
 */
const OUTLINE_WIDTH = 2;

/**
 * How long the active pin's outline stays hidden after a value change made by
 * a control that does not hold focus (a segmented button, the align rail).
 */
const QUIET_AFTER_CHANGE_MS = 900;

/**
 * Positions a fixed overlay box so its border wraps the given rect from the
 * outside.
 * @param {HTMLElement} box
 * @param {DOMRect} rect
 */
function placeOutlineBox(box, rect) {
  box.style.top = `${rect.top - OUTLINE_WIDTH}px`;
  box.style.left = `${rect.left - OUTLINE_WIDTH}px`;
  box.style.width = `${rect.width + OUTLINE_WIDTH * 2}px`;
  box.style.height = `${rect.height + OUTLINE_WIDTH * 2}px`;
}

export class InspectorOverlay {
  /**
   * @param {ShadowRoot} shadowRoot
   * @param {import('../core/state.js').InspectorState} state
   */
  constructor(shadowRoot, state) {
    this.shadowRoot = shadowRoot;
    this.state = state;

    this.container = document.createElement('div');
    this.container.className = 'si-overlay-container';

    // Box-model bands. Both are drawn as a box whose *border* is the band, the
    // way DevTools shades margin and padding, and both are appended before the
    // hover outline so the outline stays on top.
    this.marginBand = document.createElement('div');
    this.marginBand.className = 'si-hover-margin';
    this.marginBand.style.display = 'none';

    this.paddingBand = document.createElement('div');
    this.paddingBand.className = 'si-hover-padding';
    this.paddingBand.style.display = 'none';

    this.container.appendChild(this.marginBand);
    this.container.appendChild(this.paddingBand);

    // Hover box
    this.hoverBox = document.createElement('div');
    this.hoverBox.className = 'si-hover-box';
    this.hoverBox.style.display = 'none';

    this.hoverTag = document.createElement('div');
    this.hoverTag.className = 'si-hover-tag';
    this.hoverBox.appendChild(this.hoverTag);

    this.container.appendChild(this.hoverBox);
    this.shadowRoot.appendChild(this.container);

    // Map of pinned elements to their overlay boxes
    this.pinnedBoxes = new Map(); // id -> HTMLElement

    // Why the active pin's outline is currently hidden, if it is. Focus in a
    // panel field and a recent value change are tracked separately so that
    // blurring a field does not cut short the post-change grace period.
    this._quietByFocus = false;
    this._quietTimer = null;
    this._peeking = false;

    this._bindEvents();
  }

  _bindEvents() {
    this.state.on('hoverChanged', ({ element }) => this.updateHover(element));
    this.state.on('stateUpdated', () => this.updatePinned());
    this.state.on('modeChanged', ({ isInspecting }) => {
      if (!isInspecting) {
        this._hideHover();
      }
    });

    // Re-position on scroll or resize
    this._onViewportChange = () => this.refresh();
    window.addEventListener('scroll', this._onViewportChange, { passive: true });
    window.addEventListener('resize', this._onViewportChange, { passive: true });

    // Fade the active pin's outline while a panel field is being edited.
    // focusin/focusout bubble, so one pair of listeners on the shadow root
    // covers every control the panel builds, including future ones.
    this._onFocusIn = (e) => this._setQuietByFocus(this._isPanelField(e.target));
    this._onFocusOut = () => this._setQuietByFocus(false);
    this.shadowRoot.addEventListener('focusin', this._onFocusIn);
    this.shadowRoot.addEventListener('focusout', this._onFocusOut);

    // Controls that apply a style without keeping focus still deserve a clear
    // look at the result, so any change buys a short quiet period.
    this.state.on('styleChanged', () => this._quietAfterChange());

    // Hold H to hide every overlay and see the bare page. Released on keyup,
    // and defensively on window blur so a missed keyup cannot leave the
    // overlays hidden.
    this._onKeyDown = (e) => {
      if (e.repeat || !this._isPeekKey(e) || this._isTypingAnywhere()) return;
      this.setPeek(true);
    };
    this._onKeyUp = (e) => {
      if (this._isPeekKey(e)) this.setPeek(false);
    };
    this._onWindowBlur = () => this.setPeek(false);
    window.addEventListener('keydown', this._onKeyDown, true);
    window.addEventListener('keyup', this._onKeyUp, true);
    window.addEventListener('blur', this._onWindowBlur);
  }

  /**
   * True for a control inside the adjustment panel whose focus means the user
   * is editing a value.
   * @param {EventTarget|null} target
   */
  _isPanelField(target) {
    if (!(target instanceof Element)) return false;
    if (!target.closest('.si-panel')) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
  }

  /**
   * True when a keystroke would land in a text field, on the host page or
   * inside the inspector, so a bare letter must not act as a shortcut.
   */
  _isTypingAnywhere() {
    const check = (el) => {
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };
    return check(document.activeElement) || check(this.shadowRoot.activeElement);
  }

  _isPeekKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return false;
    return e.code === 'KeyH' || e.key === 'h' || e.key === 'H';
  }

  /**
   * Hides or shows every overlay at once.
   * @param {boolean} on
   */
  setPeek(on) {
    if (this._peeking === on) return;
    this._peeking = on;
    this.container.classList.toggle('si-peek', on);
  }

  _setQuietByFocus(on) {
    if (this._quietByFocus === on) return;
    this._quietByFocus = on;
    this._applyQuiet();
  }

  _quietAfterChange() {
    if (this._quietTimer) clearTimeout(this._quietTimer);
    this._quietTimer = setTimeout(() => {
      this._quietTimer = null;
      this._applyQuiet();
    }, QUIET_AFTER_CHANGE_MS);
    this._applyQuiet();
  }

  /**
   * Applies the quiet class to the active pin's box only; every other pinned
   * outline keeps showing.
   */
  _applyQuiet() {
    const quiet = this._quietByFocus || this._quietTimer !== null;
    const activeId = this.state.activePinnedId;
    for (const [id, box] of this.pinnedBoxes.entries()) {
      box.classList.toggle('si-quiet', quiet && id === activeId);
    }
  }

  /**
   * Hides the hover outline and both box-model bands.
   */
  _hideHover() {
    this.hoverBox.style.display = 'none';
    this.marginBand.style.display = 'none';
    this.paddingBand.style.display = 'none';
  }

  /**
   * Draws the margin and padding bands around an element's border box.
   *
   * Each band is a box whose four border widths are the four spacing values, so
   * the shaded area is exactly the space the property occupies — the same
   * representation DevTools uses.
   * @param {Element} element
   * @param {DOMRect} rect
   */
  _updateBands(element, rect) {
    const view = element.ownerDocument && element.ownerDocument.defaultView;
    if (!view) {
      this.marginBand.style.display = 'none';
      this.paddingBand.style.display = 'none';
      return;
    }

    const computed = view.getComputedStyle(element);

    const margin = {
      top: parsePx(computed.marginTop, 0),
      right: parsePx(computed.marginRight, 0),
      bottom: parsePx(computed.marginBottom, 0),
      left: parsePx(computed.marginLeft, 0)
    };

    const padding = {
      top: parsePx(computed.paddingTop, 0),
      right: parsePx(computed.paddingRight, 0),
      bottom: parsePx(computed.paddingBottom, 0),
      left: parsePx(computed.paddingLeft, 0)
    };

    // A negative margin would draw the band inside the element, which reads as
    // padding and misleads. Clamp to zero and simply show nothing there.
    const marginTop = Math.max(0, margin.top);
    const marginRight = Math.max(0, margin.right);
    const marginBottom = Math.max(0, margin.bottom);
    const marginLeft = Math.max(0, margin.left);

    const hasMargin = marginTop || marginRight || marginBottom || marginLeft;
    if (hasMargin) {
      this.marginBand.style.display = 'block';
      this.marginBand.style.top = `${rect.top - marginTop}px`;
      this.marginBand.style.left = `${rect.left - marginLeft}px`;
      this.marginBand.style.width = `${rect.width + marginLeft + marginRight}px`;
      this.marginBand.style.height = `${rect.height + marginTop + marginBottom}px`;
      this.marginBand.style.borderWidth = `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`;
    } else {
      this.marginBand.style.display = 'none';
    }

    const hasPadding = padding.top || padding.right || padding.bottom || padding.left;
    if (hasPadding) {
      this.paddingBand.style.display = 'block';
      this.paddingBand.style.top = `${rect.top}px`;
      this.paddingBand.style.left = `${rect.left}px`;
      this.paddingBand.style.width = `${rect.width}px`;
      this.paddingBand.style.height = `${rect.height}px`;
      this.paddingBand.style.borderWidth = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    } else {
      this.paddingBand.style.display = 'none';
    }
  }

  updateHover(element) {
    if (!element || !this.state.isInspecting) {
      this._hideHover();
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this._hideHover();
      return;
    }

    this._updateBands(element, rect);

    this.hoverBox.style.display = 'block';
    placeOutlineBox(this.hoverBox, rect);

    const label = getElementLabel(element);
    this.hoverTag.textContent = label;

    // Reposition tag if near the top edge of viewport
    if (rect.top < 26) {
      this.hoverTag.style.top = '0px';
      this.hoverTag.style.borderRadius = '0 0 3px 3px';
    } else {
      this.hoverTag.style.top = '-24px';
      this.hoverTag.style.borderRadius = '3px 3px 0 0';
    }
  }

  updatePinned() {
    const activeIds = new Set();

    for (const [id, item] of this.state.pinnedItems.entries()) {
      activeIds.add(id);

      let box = this.pinnedBoxes.get(id);
      if (!box) {
        box = document.createElement('div');
        box.className = 'si-pinned-box';

        const tag = document.createElement('div');
        tag.className = 'si-pinned-tag';
        tag.innerHTML = `${siIcon('Pin')}<span>${escapeHtml(item.label)}</span>`;
        box.appendChild(tag);

        this.container.appendChild(box);
        this.pinnedBoxes.set(id, box);
      }

      const rect = item.element.getBoundingClientRect();
      box.style.display = 'block';
      placeOutlineBox(box, rect);
    }

    // Remove any boxes that were unpinned
    for (const [id, box] of this.pinnedBoxes.entries()) {
      if (!activeIds.has(id)) {
        box.remove();
        this.pinnedBoxes.delete(id);
      }
    }

    // The active pin may have changed, so the quiet state must follow it.
    this._applyQuiet();
  }

  refresh() {
    if (this.state.hoveredElement) {
      this.updateHover(this.state.hoveredElement);
    }
    this.updatePinned();
  }

  /**
   * Unbinds the window listeners registered in the constructor and removes
   * the overlay container from the shadow root.
   */
  destroy() {
    if (this._onViewportChange) {
      window.removeEventListener('scroll', this._onViewportChange, { passive: true });
      window.removeEventListener('resize', this._onViewportChange, { passive: true });
      this._onViewportChange = null;
    }

    this.shadowRoot.removeEventListener('focusin', this._onFocusIn);
    this.shadowRoot.removeEventListener('focusout', this._onFocusOut);
    window.removeEventListener('keydown', this._onKeyDown, true);
    window.removeEventListener('keyup', this._onKeyUp, true);
    window.removeEventListener('blur', this._onWindowBlur);

    if (this._quietTimer) {
      clearTimeout(this._quietTimer);
      this._quietTimer = null;
    }

    for (const box of this.pinnedBoxes.values()) {
      box.remove();
    }
    this.pinnedBoxes.clear();

    if (this.container) {
      this.container.remove();
    }
  }
}
