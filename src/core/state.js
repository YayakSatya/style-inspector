/**
 * Session State Management for Style Inspector
 */

import {
  getElementSelector,
  getElementLabel,
  buildSharedSelector,
  resolveSharedElements
} from './selector.js';
import {
  readElementStyles,
  applyStyleProperty,
  resetElementStyles,
  readUnitContext
} from './styles.js';
import { readElementText, applyElementText, resetElementText } from './text.js';
import { SHORTHAND_GROUPS, isTextualProperty } from './schema.js';

export class InspectorState {
  constructor() {
    this.isInspecting = false;
    this.isPanelOpen = false;
    this.hoveredElement = null;
    this.pinnedItems = new Map(); // id -> item record
    this.activePinnedId = null;
    this._idCounter = 0;
    this._listeners = new Map();

    // Session-wide export settings, shared by every pinned element.
    this.exportFormat = 'markdown';
    this.exportUnit = 'px';
    this.customInstruction = '';
  }

  /**
   * @param {'markdown'|'css'|'json'} format
   */
  setExportFormat(format) {
    this.exportFormat = format;
    this.emit('stateUpdated', this);
  }

  /**
   * @param {'px'|'rem'|'em'} unit
   */
  setExportUnit(unit) {
    this.exportUnit = unit;
    this.emit('stateUpdated', this);
  }

  /**
   * Overrides the instruction line appended to an export. Empty means default.
   * @param {string} instruction
   */
  setCustomInstruction(instruction) {
    this.customInstruction = instruction;
    this.emit('stateUpdated', this);
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
    const shared = buildSharedSelector(element);
    const baseline = readElementStyles(element);
    const current = { ...baseline };
    const text = readElementText(element);
    const unitContext = readUnitContext(element);

    const item = {
      id,
      element,
      selector,
      label,
      // `selector` is whichever of these two the export should carry; the
      // scope decides. `element` is the unique path, `class` the shared rule.
      elementSelector: selector,
      sharedSelector: shared ? shared.selector : null,
      sharedCount: shared ? shared.count : 1,
      scope: 'element',
      baseline,
      current,
      baselineText: text.text,
      currentText: text.text,
      textEditable: text.editable,
      textMode: text.mode,
      textNode: text.node,
      textPrefix: text.prefix,
      textSuffix: text.suffix,
      textReason: text.reason,
      rootFontSize: unitContext.rootFontSize,
      parentFontSize: unitContext.parentFontSize,
      notes: '',
      linkPadding: true,
      linkMargin: true,
      linkRadius: true,
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
    // A four-sided group whose "link" switch is on writes all four sides at
    // once, whether the edit came from its combined control or from one side.
    const linkedGroup = SHORTHAND_GROUPS.find(
      group =>
        // The combined control always writes all four sides — it only exists
        // while the group is linked.
        prop === group.allProp ||
        (item[group.linkFlag] && group.keys.includes(prop))
    );

    const targets = this._styleTargets(item);

    if (linkedGroup) {
      for (const key of linkedGroup.keys) {
        item.current[key] = numVal;
        for (const target of targets) applyStyleProperty(target, key, numVal, 'px');
      }
    } else {
      const textual = isTextualProperty(prop);
      item.current[prop] = textual ? `${value}` : numVal;

      if (prop === 'lineHeight') {
        // The user has now declared an explicit ratio, so the record is no
        // longer describing an inherited `normal`.
        item.current.lineHeightSource = 'ratio';
      }

      for (const target of targets) applyStyleProperty(target, prop, item.current[prop], 'px');
    }

    this.emit('styleChanged', { item, prop, value });
    this.emit('stateUpdated', this);
  }

  /**
   * Replaces the visible text of a pinned element.
   * @param {string} id
   * @param {string} text
   */
  setText(id, text) {
    const item = this.pinnedItems.get(id);
    if (!item || !item.textEditable) return;

    item.currentText = text;
    applyElementText(item.element, item, text);

    this.emit('styleChanged', { item, textChanged: true });
    this.emit('stateUpdated', this);
  }

  /**
   * Restores a pinned element's text without touching its styles.
   * @param {string} id
   */
  resetText(id) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    resetElementText(item.element);
    item.currentText = item.baselineText;

    this.emit('styleChanged', { item, textChanged: true });
    this.emit('stateUpdated', this);
  }

  setNotes(id, notes) {
    const item = this.pinnedItems.get(id);
    if (!item) return;
    item.notes = notes;
    this.emit('stateUpdated', this);
  }

  /**
   * Every element a pinned item's style edits should land on: the element
   * itself, plus every other match of the shared selector when the scope is
   * `class`. Text edits never fan out — copy belongs to one element.
   * @param {object} item
   * @returns {Element[]}
   */
  _styleTargets(item) {
    if (item.scope !== 'class' || !item.sharedSelector) return [item.element];
    return resolveSharedElements(item.element, item.sharedSelector);
  }

  /**
   * Switches a pinned item between "this element only" and "every element
   * sharing its classes". The live preview follows: widening re-applies the
   * edits made so far to every match, narrowing reverts the other matches.
   * @param {string} id
   * @param {'element'|'class'} scope
   */
  setScope(id, scope) {
    const item = this.pinnedItems.get(id);
    if (!item) return;
    if (scope === 'class' && !item.sharedSelector) return;
    if (item.scope === scope) return;

    const previousTargets = this._styleTargets(item);
    item.scope = scope;
    item.selector = scope === 'class' ? item.sharedSelector : item.elementSelector;
    const nextTargets = this._styleTargets(item);

    for (const target of previousTargets) {
      if (target !== item.element && !nextTargets.includes(target)) resetElementStyles(target);
    }

    const changed = Object.keys(item.current).filter(
      prop => item.current[prop] !== item.baseline[prop] && !prop.endsWith('Source')
    );
    for (const target of nextTargets) {
      if (target === item.element) continue;
      for (const prop of changed) applyStyleProperty(target, prop, item.current[prop], 'px');
    }

    this.emit('styleChanged', { item, scope });
    this.emit('stateUpdated', this);
  }

  /**
   * Toggles the "link all sides" switch for a four-sided group.
   * @param {string} id
   * @param {string} groupName - 'padding', 'margin', or 'border-radius'
   * @param {boolean} linked
   */
  setLinked(id, groupName, linked) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    const group = SHORTHAND_GROUPS.find(candidate => candidate.name === groupName);
    if (!group) return;

    item[group.linkFlag] = Boolean(linked);
    this.emit('stateUpdated', this);
  }

  setLinkPadding(id, linked) {
    this.setLinked(id, 'padding', linked);
  }

  setLinkMargin(id, linked) {
    this.setLinked(id, 'margin', linked);
  }

  resetElement(id) {
    const item = this.pinnedItems.get(id);
    if (!item) return;

    for (const target of this._styleTargets(item)) resetElementStyles(target);
    resetElementText(item.element);
    item.current = { ...item.baseline };
    item.currentText = item.baselineText;
    this.emit('styleChanged', { item, reset: true });
    this.emit('stateUpdated', this);
  }

  /**
   * Restores every pinned element to its baseline while keeping the pins,
   * so the session survives the reset.
   */
  resetAllStyles() {
    for (const item of this.pinnedItems.values()) {
      for (const target of this._styleTargets(item)) resetElementStyles(target);
      resetElementText(item.element);
      item.current = { ...item.baseline };
      item.currentText = item.baselineText;
      this.emit('styleChanged', { item, reset: true });
    }
    this.emit('stateUpdated', this);
  }

  /**
   * Restores every pinned element and then discards the whole session.
   */
  clearAll() {
    for (const item of this.pinnedItems.values()) {
      for (const target of this._styleTargets(item)) resetElementStyles(target);
      resetElementText(item.element);
    }
    this.pinnedItems.clear();
    this.activePinnedId = null;
    this.emit('stateUpdated', this);
  }

  getPinnedList() {
    return Array.from(this.pinnedItems.values());
  }

  getActiveItem() {
    return this.activePinnedId ? this.pinnedItems.get(this.activePinnedId) : null;
  }
}
