/**
 * Session State Management for Style Inspector
 */

import { getElementSelector, getElementLabel } from './selector.js';
import { readElementStyles, applyStyleProperty, resetElementStyles } from './styles.js';

export class InspectorState {
  constructor() {
    this.isInspecting = false;
    this.isPanelOpen = false;
    this.hoveredElement = null;
    this.pinnedItems = new Map(); // id -> item record
    this.activePinnedId = null;
    this._idCounter = 0;
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(fn);
    }
  }

  emit(event, data) {
    if (this._listeners.has(event)) {
      for (const fn of this._listeners.get(event)) {
        try {
          fn(data);
        } catch (err) {
          console.error(`[Style Inspector] Error in event listener for ${event}:`, err);
        }
      }
    }
  }

  startInspecting() {
    if (this.isInspecting) return;
    this.isInspecting = true;
    this.emit('modeChanged', { isInspecting: true });
  }

  stopInspecting() {
    if (!this.isInspecting) return;
    this.isInspecting = false;
    this.hoveredElement = null;
    this.emit('modeChanged', { isInspecting: false });
    this.emit('hoverChanged', { element: null });
  }

  toggleInspecting() {
    if (this.isInspecting) {
      this.stopInspecting();
    } else {
      this.startInspecting();
    }
  }

  setHoveredElement(element) {
    if (this.hoveredElement === element) return;
    this.hoveredElement = element;
    this.emit('hoverChanged', { element });
  }

  /**
   * Pins an element into the active session.
   * @param {HTMLElement} element
   * @returns {string} ID of the pinned item
   */
  pinElement(element) {
    if (!element || element.nodeType !== 1) return null;

    // Check if element is already pinned
    for (const [id, item] of this.pinnedItems.entries()) {
      if (item.element === element) {
        this.activePinnedId = id;
        this.isPanelOpen = true;
        this.emit('stateUpdated', this);
        return id;
      }
    }

    this._idCounter += 1;
    const id = `pinned_${this._idCounter}`;
    const selector = getElementSelector(element);
    const label = getElementLabel(element);
    const baseline = readElementStyles(element);
    const current = { ...baseline };

    const item = {
      id,
      element,
      selector,
      label,
      baseline,
      current,
      notes: '',
      linkPadding: true,
      linkMargin: true,
      timestamp: Date.now()
    };

    this.pinnedItems.set(id, item);
    this.activePinnedId = id;
    this.isPanelOpen = true;
    this.emit('pinnedChanged', { item, action: 'added' });
    this.emit('stateUpdated', this);
    return id;
  }

  /**
   * Unpins an element from the session.
   * @param {string} id
   */
  unpinElement(id) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    this.pinnedItems.delete(id);

    if (this.activePinnedId === id) {
      const keys = Array.from(this.pinnedItems.keys());
      this.activePinnedId = keys.length > 0 ? keys[keys.length - 1] : null;
    }

    this.emit('pinnedChanged', { item, action: 'removed' });
    this.emit('stateUpdated', this);
  }

  setActivePinnedId(id) {
    if (this.pinnedItems.has(id)) {
      this.activePinnedId = id;
      this.emit('stateUpdated', this);
    }
  }

  /**
   * Updates a style property for a pinned element.
   * @param {string} id
   * @param {string} prop
   * @param {number|string} value
   */
  updateStyle(id, prop, value) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;

    // Handle linked padding
    if (item.linkPadding && (prop === 'paddingAll' || prop.startsWith('padding'))) {
      const sides = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
      for (const side of sides) {
        item.current[side] = numVal;
        applyStyleProperty(item.element, side, numVal, 'px');
      }
    }
    // Handle linked margin
    else if (item.linkMargin && (prop === 'marginAll' || prop.startsWith('margin'))) {
      const sides = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
      for (const side of sides) {
        item.current[side] = numVal;
        applyStyleProperty(item.element, side, numVal, 'px');
      }
    }
    // Individual property
    else {
      const isStringProp = prop === 'lineHeight' || prop === 'fontWeight' || prop === 'textTransform';
      item.current[prop] = isStringProp ? `${value}` : numVal;
      applyStyleProperty(item.element, prop, value, isStringProp ? '' : 'px');
    }

    this.emit('styleChanged', { item, prop, value });
    this.emit('stateUpdated', this);
  }

  setNotes(id, notes) {
    const item = this.pinnedItems.get(id);
    if (!item) return;
    item.notes = notes;
    this.emit('stateUpdated', this);
  }

  setLinkPadding(id, linked) {
    const item = this.pinnedItems.get(id);
    if (!item) return;
    item.linkPadding = Boolean(linked);
    this.emit('stateUpdated', this);
  }

  setLinkMargin(id, linked) {
    const item = this.pinnedItems.get(id);
    if (!item) return;
    item.linkMargin = Boolean(linked);
    this.emit('stateUpdated', this);
  }

  resetElement(id) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    resetElementStyles(item.element);
    item.current = { ...item.baseline };
    this.emit('styleChanged', { item, reset: true });
    this.emit('stateUpdated', this);
  }

  resetAll() {
    for (const item of this.pinnedItems.values()) {
      resetElementStyles(item.element);
      item.current = { ...item.baseline };
    }
    this.emit('stateUpdated', this);
  }

  getPinnedList() {
    return Array.from(this.pinnedItems.values());
  }

  getActiveItem() {
    return this.activePinnedId ? this.pinnedItems.get(this.activePinnedId) : null;
  }
}
