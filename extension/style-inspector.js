/* Style Inspector v1.0.0 | Internal Visual Adjustment Tool */
var StyleInspectorBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    StyleInspector: () => StyleInspector
  });

  // src/core/selector.js
  function getElementSelector(element) {
    if (!element || element.nodeType !== 1) {
      return "";
    }
    const testId = element.getAttribute("data-testid");
    if (testId && testId.trim()) {
      return `[data-testid="${testId.trim()}"]`;
    }
    const altTestId = element.getAttribute("data-test-id") || element.getAttribute("data-qa");
    if (altTestId && altTestId.trim()) {
      const attr = element.hasAttribute("data-test-id") ? "data-test-id" : "data-qa";
      return `[${attr}="${altTestId.trim()}"]`;
    }
    const uniquePath = buildCssPath(element);
    if (uniquePath) {
      return uniquePath;
    }
    return buildTagClassFallback(element);
  }
  function buildCssPath(element) {
    if (!element || element.nodeType !== 1) return "";
    const path = [];
    let curr = element;
    while (curr && curr.nodeType === 1) {
      const testId = curr.getAttribute("data-testid");
      if (testId && testId.trim()) {
        path.unshift(`[data-testid="${testId.trim()}"]`);
        break;
      }
      if (curr.id && isValidId(curr.id)) {
        const doc = curr.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (doc && doc.querySelectorAll(`#${CSS.escape ? CSS.escape(curr.id) : curr.id}`).length === 1) {
          path.unshift(`#${curr.id}`);
          break;
        }
      }
      const tag = curr.tagName.toLowerCase();
      if (tag === "body" || tag === "html") {
        path.unshift(tag);
        break;
      }
      let segment = tag;
      const meaningfulClasses = getMeaningfulClasses(curr);
      if (meaningfulClasses.length > 0) {
        segment += "." + meaningfulClasses.slice(0, 2).join(".");
      }
      const parent = curr.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((child) => child.tagName === curr.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(curr) + 1;
          segment += `:nth-of-type(${index})`;
        }
      }
      path.unshift(segment);
      curr = curr.parentElement;
    }
    return path.join(" > ");
  }
  function buildTagClassFallback(element) {
    const tag = element.tagName.toLowerCase();
    const classes = getMeaningfulClasses(element);
    if (classes.length > 0) {
      return `${tag}.${classes.join(".")}`;
    }
    return tag;
  }
  function getMeaningfulClasses(element) {
    if (!element.className || typeof element.className !== "string") return [];
    return element.className.trim().split(/\s+/).filter((cls) => {
      if (!cls) return false;
      if (cls.startsWith("style-inspector")) return false;
      if (/^[a-zA-Z0-9_-]{18,}$/.test(cls)) return false;
      return true;
    });
  }
  function isValidId(id) {
    return Boolean(id && typeof id === "string" && !/\s/.test(id) && !/^[0-9]/.test(id));
  }
  function getElementLabel(element) {
    if (!element || element.nodeType !== 1) return "";
    const tag = element.tagName.toLowerCase();
    const testId = element.getAttribute("data-testid");
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

  // src/core/styles.js
  function parsePx(val, fallback = 0) {
    if (!val || typeof val !== "string") return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : Math.round(num * 100) / 100;
  }
  function readElementStyles(element, win = typeof window !== "undefined" ? window : null) {
    if (!element || !win) {
      return createDefaultStyles();
    }
    const computed = win.getComputedStyle(element);
    const paddingTop = parsePx(computed.paddingTop, 0);
    const paddingRight = parsePx(computed.paddingRight, 0);
    const paddingBottom = parsePx(computed.paddingBottom, 0);
    const paddingLeft = parsePx(computed.paddingLeft, 0);
    const marginTop = parsePx(computed.marginTop, 0);
    const marginRight = parsePx(computed.marginRight, 0);
    const marginBottom = parsePx(computed.marginBottom, 0);
    const marginLeft = parsePx(computed.marginLeft, 0);
    const rowGap = parsePx(computed.rowGap, 0);
    const colGap = parsePx(computed.columnGap, 0);
    const gap = rowGap || colGap || parsePx(computed.gap, 0);
    const fontSize = parsePx(computed.fontSize, 16);
    let lineHeight = 1.4;
    let lineHeightUnit = "unitless";
    const rawLineHeight = computed.lineHeight;
    if (rawLineHeight && rawLineHeight !== "normal") {
      if (rawLineHeight.endsWith("px")) {
        const lhPx = parsePx(rawLineHeight, 0);
        if (fontSize > 0) {
          lineHeight = Math.round(lhPx / fontSize * 100) / 100;
        } else {
          lineHeight = lhPx;
          lineHeightUnit = "px";
        }
      } else {
        lineHeight = parseFloat(rawLineHeight) || 1.4;
      }
    } else {
      lineHeight = 1.4;
    }
    let letterSpacing = 0;
    if (computed.letterSpacing && computed.letterSpacing !== "normal") {
      letterSpacing = parsePx(computed.letterSpacing, 0);
    }
    return {
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      gap,
      fontSize,
      lineHeight,
      lineHeightUnit,
      letterSpacing
    };
  }
  function createDefaultStyles() {
    return {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      gap: 0,
      fontSize: 16,
      lineHeight: 1.4,
      lineHeightUnit: "unitless",
      letterSpacing: 0
    };
  }
  var originalInlineStyles = /* @__PURE__ */ new WeakMap();
  function captureOriginalInline(element) {
    if (!element || originalInlineStyles.has(element)) return;
    const props = [
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "gap",
      "row-gap",
      "column-gap",
      "font-size",
      "line-height",
      "letter-spacing"
    ];
    const saved = {};
    for (const prop of props) {
      saved[prop] = element.style.getPropertyValue(prop);
    }
    originalInlineStyles.set(element, saved);
  }
  function applyStyleProperty(element, prop, val, unit = "px") {
    if (!element || !element.style) return;
    captureOriginalInline(element);
    const cssPropMap = {
      paddingTop: "padding-top",
      paddingRight: "padding-right",
      paddingBottom: "padding-bottom",
      paddingLeft: "padding-left",
      marginTop: "margin-top",
      marginRight: "margin-right",
      marginBottom: "margin-bottom",
      marginLeft: "margin-left",
      gap: "gap",
      fontSize: "font-size",
      lineHeight: "line-height",
      letterSpacing: "letter-spacing"
    };
    const cssProp = cssPropMap[prop];
    if (!cssProp) return;
    let formattedVal = val;
    if (prop === "lineHeight") {
      formattedVal = typeof val === "number" ? `${val}` : val;
    } else {
      formattedVal = `${val}${unit}`;
    }
    element.style.setProperty(cssProp, formattedVal);
  }
  function resetElementStyles(element) {
    if (!element || !originalInlineStyles.has(element)) return;
    const saved = originalInlineStyles.get(element);
    for (const [prop, val] of Object.entries(saved)) {
      if (val) {
        element.style.setProperty(prop, val);
      } else {
        element.style.removeProperty(prop);
      }
    }
    originalInlineStyles.delete(element);
  }
  function computeStyleDiff(baseline, current) {
    const diffs = [];
    const padChanged = baseline.paddingTop !== current.paddingTop || baseline.paddingRight !== current.paddingRight || baseline.paddingBottom !== current.paddingBottom || baseline.paddingLeft !== current.paddingLeft;
    if (padChanged) {
      const baseAllSame = baseline.paddingTop === baseline.paddingRight && baseline.paddingRight === baseline.paddingBottom && baseline.paddingBottom === baseline.paddingLeft;
      const currAllSame = current.paddingTop === current.paddingRight && current.paddingRight === current.paddingBottom && current.paddingBottom === current.paddingLeft;
      if (baseAllSame && currAllSame) {
        diffs.push({
          property: "padding",
          before: `${baseline.paddingTop}px`,
          after: `${current.paddingTop}px`
        });
      } else {
        if (baseline.paddingTop !== current.paddingTop) {
          diffs.push({ property: "padding-top", before: `${baseline.paddingTop}px`, after: `${current.paddingTop}px` });
        }
        if (baseline.paddingRight !== current.paddingRight) {
          diffs.push({ property: "padding-right", before: `${baseline.paddingRight}px`, after: `${current.paddingRight}px` });
        }
        if (baseline.paddingBottom !== current.paddingBottom) {
          diffs.push({ property: "padding-bottom", before: `${baseline.paddingBottom}px`, after: `${current.paddingBottom}px` });
        }
        if (baseline.paddingLeft !== current.paddingLeft) {
          diffs.push({ property: "padding-left", before: `${baseline.paddingLeft}px`, after: `${current.paddingLeft}px` });
        }
      }
    }
    const marChanged = baseline.marginTop !== current.marginTop || baseline.marginRight !== current.marginRight || baseline.marginBottom !== current.marginBottom || baseline.marginLeft !== current.marginLeft;
    if (marChanged) {
      const baseAllSame = baseline.marginTop === baseline.marginRight && baseline.marginRight === baseline.marginBottom && baseline.marginBottom === baseline.marginLeft;
      const currAllSame = current.marginTop === current.marginRight && current.marginRight === current.marginBottom && current.marginBottom === current.marginLeft;
      if (baseAllSame && currAllSame) {
        diffs.push({
          property: "margin",
          before: `${baseline.marginTop}px`,
          after: `${current.marginTop}px`
        });
      } else {
        if (baseline.marginTop !== current.marginTop) {
          diffs.push({ property: "margin-top", before: `${baseline.marginTop}px`, after: `${current.marginTop}px` });
        }
        if (baseline.marginRight !== current.marginRight) {
          diffs.push({ property: "margin-right", before: `${baseline.marginRight}px`, after: `${current.marginRight}px` });
        }
        if (baseline.marginBottom !== current.marginBottom) {
          diffs.push({ property: "margin-bottom", before: `${baseline.marginBottom}px`, after: `${current.marginBottom}px` });
        }
        if (baseline.marginLeft !== current.marginLeft) {
          diffs.push({ property: "margin-left", before: `${baseline.marginLeft}px`, after: `${current.marginLeft}px` });
        }
      }
    }
    if (baseline.gap !== current.gap) {
      diffs.push({
        property: "gap",
        before: `${baseline.gap}px`,
        after: `${current.gap}px`
      });
    }
    if (baseline.fontSize !== current.fontSize) {
      diffs.push({
        property: "font-size",
        before: `${baseline.fontSize}px`,
        after: `${current.fontSize}px`
      });
    }
    if (baseline.lineHeight !== current.lineHeight) {
      const beforeStr = typeof baseline.lineHeight === "number" ? `${baseline.lineHeight}` : baseline.lineHeight;
      const afterStr = typeof current.lineHeight === "number" ? `${current.lineHeight}` : current.lineHeight;
      diffs.push({
        property: "line-height",
        before: beforeStr,
        after: afterStr
      });
    }
    if (baseline.letterSpacing !== current.letterSpacing) {
      diffs.push({
        property: "letter-spacing",
        before: `${baseline.letterSpacing}px`,
        after: `${current.letterSpacing}px`
      });
    }
    return diffs;
  }

  // src/core/state.js
  var InspectorState = class {
    constructor() {
      this.isInspecting = false;
      this.isPanelOpen = false;
      this.hoveredElement = null;
      this.pinnedItems = /* @__PURE__ */ new Map();
      this.activePinnedId = null;
      this._idCounter = 0;
      this._listeners = /* @__PURE__ */ new Map();
    }
    on(event, fn) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, /* @__PURE__ */ new Set());
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
      this.emit("modeChanged", { isInspecting: true });
    }
    stopInspecting() {
      if (!this.isInspecting) return;
      this.isInspecting = false;
      this.hoveredElement = null;
      this.emit("modeChanged", { isInspecting: false });
      this.emit("hoverChanged", { element: null });
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
      this.emit("hoverChanged", { element });
    }
    /**
     * Pins an element into the active session.
     * @param {HTMLElement} element
     * @returns {string} ID of the pinned item
     */
    pinElement(element) {
      if (!element || element.nodeType !== 1) return null;
      for (const [id2, item2] of this.pinnedItems.entries()) {
        if (item2.element === element) {
          this.activePinnedId = id2;
          this.isPanelOpen = true;
          this.emit("stateUpdated", this);
          return id2;
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
        notes: "",
        linkPadding: true,
        linkMargin: true,
        timestamp: Date.now()
      };
      this.pinnedItems.set(id, item);
      this.activePinnedId = id;
      this.isPanelOpen = true;
      this.emit("pinnedChanged", { item, action: "added" });
      this.emit("stateUpdated", this);
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
      this.emit("pinnedChanged", { item, action: "removed" });
      this.emit("stateUpdated", this);
    }
    setActivePinnedId(id) {
      if (this.pinnedItems.has(id)) {
        this.activePinnedId = id;
        this.emit("stateUpdated", this);
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
      const numVal = typeof value === "number" ? value : parseFloat(value) || 0;
      if (item.linkPadding && (prop === "paddingAll" || prop.startsWith("padding"))) {
        const sides = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
        for (const side of sides) {
          item.current[side] = numVal;
          applyStyleProperty(item.element, side, numVal, "px");
        }
      } else if (item.linkMargin && (prop === "marginAll" || prop.startsWith("margin"))) {
        const sides = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
        for (const side of sides) {
          item.current[side] = numVal;
          applyStyleProperty(item.element, side, numVal, "px");
        }
      } else {
        item.current[prop] = prop === "lineHeight" ? value : numVal;
        applyStyleProperty(item.element, prop, value, prop === "lineHeight" ? "" : "px");
      }
      this.emit("styleChanged", { item, prop, value });
      this.emit("stateUpdated", this);
    }
    setNotes(id, notes) {
      const item = this.pinnedItems.get(id);
      if (!item) return;
      item.notes = notes;
      this.emit("stateUpdated", this);
    }
    setLinkPadding(id, linked) {
      const item = this.pinnedItems.get(id);
      if (!item) return;
      item.linkPadding = Boolean(linked);
      this.emit("stateUpdated", this);
    }
    setLinkMargin(id, linked) {
      const item = this.pinnedItems.get(id);
      if (!item) return;
      item.linkMargin = Boolean(linked);
      this.emit("stateUpdated", this);
    }
    resetElement(id) {
      const item = this.pinnedItems.get(id);
      if (!item) return;
      resetElementStyles(item.element);
      item.current = { ...item.baseline };
      this.emit("styleChanged", { item, reset: true });
      this.emit("stateUpdated", this);
    }
    resetAll() {
      for (const item of this.pinnedItems.values()) {
        resetElementStyles(item.element);
        item.current = { ...item.baseline };
      }
      this.emit("stateUpdated", this);
    }
    getPinnedList() {
      return Array.from(this.pinnedItems.values());
    }
    getActiveItem() {
      return this.activePinnedId ? this.pinnedItems.get(this.activePinnedId) : null;
    }
  };

  // src/ui/styles.css.js
  var inspectorStyles = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: #e2e8f0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Floating Toolbar Toggle Button */
.si-toolbar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 9999px;
  padding: 6px 12px 6px 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.si-toolbar:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -4px rgba(99, 102, 241, 0.3);
}

.si-toolbar.active {
  background: #1e1b4b;
  border-color: #818cf8;
  box-shadow: 0 0 15px rgba(129, 140, 248, 0.4);
}

.si-toolbar-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #64748b;
  transition: background 0.2s ease;
}

.si-toolbar.active .si-toolbar-indicator {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.si-toolbar-label {
  font-weight: 600;
  font-size: 12px;
  color: #f8fafc;
  letter-spacing: 0.02em;
}

.si-toolbar-badge {
  background: #312e81;
  color: #c7d2fe;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
}

/* Active Mode Banner */
.si-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483645;
  background: linear-gradient(90deg, #312e81, #1e1b4b);
  border-bottom: 2px solid #6366f1;
  color: #e0e7ff;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: siSlideDown 0.2s ease-out;
}

@keyframes siSlideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

.si-banner-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-banner-icon {
  font-size: 14px;
}

.si-banner-keys {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  color: #a5b4fc;
}

.si-key {
  background: #1e1b4b;
  border: 1px solid #4338ca;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: monospace;
}

.si-banner-close {
  background: transparent;
  border: none;
  color: #c7d2fe;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.si-banner-close:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

/* Hover & Pinned Overlays */
.si-overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none !important;
  z-index: 2147483640;
}

.si-hover-box {
  position: fixed !important;
  box-sizing: border-box !important;
  border: 2px solid #06b6d4;
  background: rgba(6, 182, 212, 0.16);
  border-radius: 3px;
  transition: all 0.05s ease-out;
  pointer-events: none !important;
  z-index: 2147483641;
}

.si-hover-tag {
  position: absolute;
  top: -24px;
  left: 0;
  background: #0891b2;
  color: #ffffff;
  font-family: monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
  pointer-events: none !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.si-pinned-box {
  position: fixed !important;
  box-sizing: border-box !important;
  border: 2px dashed #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 3px;
  pointer-events: none !important;
  z-index: 2147483640;
}

.si-pinned-tag {
  position: absolute;
  top: -22px;
  left: 0;
  background: #d97706;
  color: #ffffff;
  font-family: monospace;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

/* Adjustment Panel */
.si-panel {
  position: fixed;
  top: 40px;
  right: 20px;
  width: 380px;
  max-height: calc(100vh - 80px);
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: siPanelFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes siPanelFadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.si-panel-header {
  padding: 12px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
}

.si-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #f8fafc;
}

.si-panel-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.si-btn-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.si-btn-icon:hover {
  background: #334155;
  color: #f8fafc;
}

/* Pinned Items Carousel / Bar */
.si-pinned-bar {
  padding: 8px 12px;
  background: #131d33;
  border-bottom: 1px solid #1e293b;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.si-pinned-bar::-webkit-scrollbar {
  height: 4px;
}
.si-pinned-bar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 2px;
}

.si-pinned-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  color: #cbd5e1;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.si-pinned-pill:hover {
  border-color: #6366f1;
  color: #ffffff;
}

.si-pinned-pill.active {
  background: #312e81;
  border-color: #818cf8;
  color: #e0e7ff;
  font-weight: 600;
}

.si-pinned-pill-close {
  opacity: 0.6;
  font-size: 12px;
  cursor: pointer;
  padding: 0 2px;
}

.si-pinned-pill-close:hover {
  opacity: 1;
  color: #ef4444;
}

/* Panel Body */
.si-panel-body {
  padding: 14px 16px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 240px);
}

.si-panel-body::-webkit-scrollbar {
  width: 6px;
}
.si-panel-body::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

.si-target-info {
  background: #1e293b;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #334155;
}

.si-target-selector {
  font-family: monospace;
  font-size: 11px;
  color: #38bdf8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}

.si-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.si-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 4px;
}

/* Switch */
.si-switch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 11px;
  text-transform: none;
  font-weight: 500;
  color: #cbd5e1;
}

.si-switch {
  position: relative;
  width: 28px;
  height: 16px;
  background: #334155;
  border-radius: 9999px;
  transition: background 0.2s;
}

.si-switch.checked {
  background: #6366f1;
}

.si-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.si-switch.checked .si-switch-thumb {
  transform: translateX(12px);
}

/* Controls (Sliders and Inputs) */
.si-control-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-control-label {
  font-size: 12px;
  color: #94a3b8;
  width: 72px;
  flex-shrink: 0;
}

.si-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #334155;
  outline: none;
  cursor: pointer;
}

.si-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 2px solid #0f172a;
  transition: transform 0.1s;
}

.si-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #818cf8;
}

.si-input-number {
  width: 58px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #f8fafc;
  font-size: 12px;
  font-family: monospace;
  padding: 4px 6px;
  text-align: right;
  outline: none;
}

.si-input-number:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 1px #6366f1;
}

/* Directional Grid for unlinked padding / margin */
.si-dir-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #172033;
  padding: 8px;
  border-radius: 6px;
}

.si-dir-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.si-dir-label {
  font-size: 11px;
  color: #94a3b8;
}

/* Notes Textarea */
.si-textarea {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 12px;
  padding: 8px;
  min-height: 52px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.si-textarea:focus {
  border-color: #6366f1;
}

.si-textarea::placeholder {
  color: #64748b;
}

/* Panel Footer & Actions */
.si-panel-footer {
  padding: 12px 16px;
  background: #1e293b;
  border-top: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.si-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.si-btn-secondary {
  background: #334155;
  color: #f8fafc;
}
.si-btn-secondary:hover {
  background: #475569;
}

.si-btn-primary {
  background: #4f46e5;
  color: #ffffff;
}
.si-btn-primary:hover {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.si-btn-danger {
  background: transparent;
  color: #f87171;
  border-color: #ef4444;
}
.si-btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Toast */
.si-toast {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: siToastFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes siToastFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

  // src/ui/overlay.js
  var InspectorOverlay = class {
    /**
     * @param {ShadowRoot} shadowRoot
     * @param {import('../core/state.js').InspectorState} state
     */
    constructor(shadowRoot, state) {
      this.shadowRoot = shadowRoot;
      this.state = state;
      this.container = document.createElement("div");
      this.container.className = "si-overlay-container";
      this.hoverBox = document.createElement("div");
      this.hoverBox.className = "si-hover-box";
      this.hoverBox.style.display = "none";
      this.hoverTag = document.createElement("div");
      this.hoverTag.className = "si-hover-tag";
      this.hoverBox.appendChild(this.hoverTag);
      this.container.appendChild(this.hoverBox);
      this.shadowRoot.appendChild(this.container);
      this.pinnedBoxes = /* @__PURE__ */ new Map();
      this._bindEvents();
    }
    _bindEvents() {
      this.state.on("hoverChanged", ({ element }) => this.updateHover(element));
      this.state.on("stateUpdated", () => this.updatePinned());
      this.state.on("modeChanged", ({ isInspecting }) => {
        if (!isInspecting) {
          this.hoverBox.style.display = "none";
        }
      });
      window.addEventListener("scroll", () => this.refresh(), { passive: true });
      window.addEventListener("resize", () => this.refresh(), { passive: true });
    }
    updateHover(element) {
      if (!element || !this.state.isInspecting) {
        this.hoverBox.style.display = "none";
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        this.hoverBox.style.display = "none";
        return;
      }
      this.hoverBox.style.display = "block";
      this.hoverBox.style.top = `${rect.top}px`;
      this.hoverBox.style.left = `${rect.left}px`;
      this.hoverBox.style.width = `${rect.width}px`;
      this.hoverBox.style.height = `${rect.height}px`;
      const label = getElementLabel(element);
      this.hoverTag.textContent = label;
      if (rect.top < 26) {
        this.hoverTag.style.top = "0px";
        this.hoverTag.style.borderRadius = "0 0 3px 3px";
      } else {
        this.hoverTag.style.top = "-24px";
        this.hoverTag.style.borderRadius = "3px 3px 0 0";
      }
    }
    updatePinned() {
      const activeIds = /* @__PURE__ */ new Set();
      for (const [id, item] of this.state.pinnedItems.entries()) {
        activeIds.add(id);
        let box = this.pinnedBoxes.get(id);
        if (!box) {
          box = document.createElement("div");
          box.className = "si-pinned-box";
          const tag = document.createElement("div");
          tag.className = "si-pinned-tag";
          tag.innerHTML = `<span>\u{1F4CC}</span><span>${item.label}</span>`;
          box.appendChild(tag);
          this.container.appendChild(box);
          this.pinnedBoxes.set(id, box);
        }
        const rect = item.element.getBoundingClientRect();
        box.style.display = "block";
        box.style.top = `${rect.top}px`;
        box.style.left = `${rect.left}px`;
        box.style.width = `${rect.width}px`;
        box.style.height = `${rect.height}px`;
      }
      for (const [id, box] of this.pinnedBoxes.entries()) {
        if (!activeIds.has(id)) {
          box.remove();
          this.pinnedBoxes.delete(id);
        }
      }
    }
    refresh() {
      if (this.state.hoveredElement) {
        this.updateHover(this.state.hoveredElement);
      }
      this.updatePinned();
    }
  };

  // src/ui/toolbar.js
  var InspectorToolbar = class {
    /**
     * @param {ShadowRoot} shadowRoot
     * @param {import('../core/state.js').InspectorState} state
     */
    constructor(shadowRoot, state) {
      this.shadowRoot = shadowRoot;
      this.state = state;
      this._createBanner();
      this._createToggle();
      this._bindEvents();
    }
    _createToggle() {
      this.toggleBtn = document.createElement("div");
      this.toggleBtn.className = "si-toolbar";
      this.toggleBtn.setAttribute("data-testid", "style_inspector_toolbar_toggle_button");
      this.toggleBtn.title = "Toggle Style Inspector (Alt+Shift+S)";
      this.toggleBtn.innerHTML = `
      <span class="si-toolbar-indicator"></span>
      <span class="si-toolbar-label">Style Inspector</span>
      <span class="si-toolbar-badge" style="display: none;">0</span>
    `;
      this.badge = this.toggleBtn.querySelector(".si-toolbar-badge");
      this.toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.state.toggleInspecting();
      });
      this.shadowRoot.appendChild(this.toggleBtn);
    }
    _createBanner() {
      this.banner = document.createElement("div");
      this.banner.className = "si-banner";
      this.banner.style.display = "none";
      this.banner.innerHTML = `
      <div class="si-banner-left">
        <span class="si-banner-icon">\u26A1</span>
        <span><strong>Inspect Mode Active:</strong> Hover over an element, click to pin & adjust styles</span>
      </div>
      <div class="si-banner-keys">
        <span><span class="si-key">Esc</span> Exit Mode</span>
        <button class="si-banner-close">\u2715</button>
      </div>
    `;
      this.banner.querySelector(".si-banner-close").addEventListener("click", () => {
        this.state.stopInspecting();
      });
      this.shadowRoot.appendChild(this.banner);
    }
    _bindEvents() {
      this.state.on("modeChanged", ({ isInspecting }) => {
        if (isInspecting) {
          this.toggleBtn.classList.add("active");
          this.banner.style.display = "flex";
        } else {
          this.toggleBtn.classList.remove("active");
          this.banner.style.display = "none";
        }
      });
      this.state.on("stateUpdated", () => {
        const count = this.state.pinnedItems.size;
        if (count > 0) {
          this.badge.style.display = "inline-block";
          this.badge.textContent = `${count}`;
        } else {
          this.badge.style.display = "none";
        }
      });
    }
  };

  // src/core/exporter.js
  var DEFAULT_INSTRUCTION = "Apply the changes above to the relevant SCSS/style file(s). The selectors above reference the automation-id (data-testid) already present in the source code \u2014 find the element with that attribute. Values are in px as read from the browser; convert to the file's existing unit convention (rem/em/%) if applicable.";
  function formatElementSection(item) {
    const diffs = computeStyleDiff(item.baseline, item.current);
    if (!diffs || diffs.length === 0) {
      return `### Element: \`${item.selector}\`
*(No style changes recorded)*`;
    }
    const lines = [`### Element: \`${item.selector}\``];
    for (const diff of diffs) {
      lines.push(`- ${diff.property}: ${diff.before} \u2192 ${diff.after}`);
    }
    if (item.notes && item.notes.trim()) {
      lines.push(`
Note: ${item.notes.trim()}`);
    }
    return lines.join("\n");
  }
  function generateMarkdownExport(items, customInstruction = DEFAULT_INSTRUCTION) {
    if (!items || items.length === 0) {
      return "## Style Adjustment Request\n\n*(No elements were pinned or modified)*";
    }
    const itemsWithChanges = items.filter((item) => {
      const diffs = computeStyleDiff(item.baseline, item.current);
      return diffs.length > 0;
    });
    const targetItems = itemsWithChanges.length > 0 ? itemsWithChanges : items;
    const sections = targetItems.map(formatElementSection);
    const content = [
      "## Style Adjustment Request",
      "",
      sections.join("\n\n"),
      "",
      `Instruction: ${customInstruction}`
    ];
    return content.join("\n");
  }
  function generateSingleItemExport(item, customInstruction = DEFAULT_INSTRUCTION) {
    const section = formatElementSection(item);
    return [
      "## Style Adjustment Request",
      "",
      section,
      "",
      `Instruction: ${customInstruction}`
    ].join("\n");
  }
  async function copyToClipboard(text) {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("[Style Inspector] Clipboard writeText failed, falling back:", err);
      }
    }
    if (typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        return successful;
      } catch (e) {
        console.error("[Style Inspector] Copy fallback failed:", e);
        return false;
      }
    }
    return false;
  }

  // src/ui/panel.js
  var InspectorPanel = class {
    /**
     * @param {ShadowRoot} shadowRoot
     * @param {import('../core/state.js').InspectorState} state
     */
    constructor(shadowRoot, state) {
      this.shadowRoot = shadowRoot;
      this.state = state;
      this.isMinimized = false;
      this._createPanel();
      this._bindEvents();
    }
    _createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "si-panel";
      this.panel.setAttribute("data-testid", "style_inspector_panel_modal");
      this.panel.style.display = "none";
      this.shadowRoot.appendChild(this.panel);
      this.render();
    }
    _bindEvents() {
      this.state.on("stateUpdated", () => this.render());
      this.state.on("pinnedChanged", () => {
        if (this.state.pinnedItems.size > 0 && this.state.isPanelOpen) {
          this.panel.style.display = "flex";
        } else if (this.state.pinnedItems.size === 0) {
          this.panel.style.display = "none";
        }
      });
    }
    showToast(message = "\u2713 Copied to clipboard! Ready to paste into Antigravity.") {
      const existing = this.shadowRoot.querySelector(".si-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.className = "si-toast";
      toast.innerHTML = `<span>\u{1F4CB}</span><span>${message}</span>`;
      this.shadowRoot.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = "opacity 0.3s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }
    render() {
      const pinnedList = this.state.getPinnedList();
      const activeItem = this.state.getActiveItem();
      if (pinnedList.length === 0 || !this.state.isPanelOpen) {
        this.panel.style.display = "none";
        return;
      }
      this.panel.style.display = "flex";
      if (this.isMinimized) {
        this.panel.innerHTML = `
        <div class="si-panel-header">
          <div class="si-panel-title">
            <span>\u{1F3A8}</span>
            <span>Style Inspector (${pinnedList.length})</span>
          </div>
          <div class="si-panel-header-actions">
            <button class="si-btn-icon" id="si-expand-btn" title="Expand panel">\u{1F5D6}</button>
            <button class="si-btn-icon" id="si-close-btn" title="Close">\u2715</button>
          </div>
        </div>
      `;
        this.panel.querySelector("#si-expand-btn").onclick = () => {
          this.isMinimized = false;
          this.render();
        };
        this.panel.querySelector("#si-close-btn").onclick = () => {
          this.state.isPanelOpen = false;
          this.render();
        };
        return;
      }
      this.panel.innerHTML = `
      <div class="si-panel-header">
        <div class="si-panel-title">
          <span>\u{1F3A8}</span>
          <span>Style Inspector</span>
          <span class="si-toolbar-badge">${pinnedList.length}</span>
        </div>
        <div class="si-panel-header-actions">
          <button class="si-btn-icon" id="si-minimize-btn" title="Minimize panel">\u{1F5D5}</button>
          <button class="si-btn-icon" id="si-close-btn" title="Close panel">\u2715</button>
        </div>
      </div>

      <div class="si-pinned-bar">
        ${pinnedList.map(
        (item) => `
          <div class="si-pinned-pill ${item.id === this.state.activePinnedId ? "active" : ""}"
               data-testid="style_inspector_panel_pinned_item"
               data-id="${item.id}">
            <span>${item.label}</span>
            <span class="si-pinned-pill-close" data-remove="${item.id}">\xD7</span>
          </div>
        `
      ).join("")}
      </div>

      ${activeItem ? this._renderActiveItemBody(activeItem) : '<div class="si-panel-body">No element selected.</div>'}

      <div class="si-panel-footer">
        <div class="si-action-row">
          <button class="si-btn si-btn-secondary" id="si-reset-all-btn">
            \u21BA Reset All (${pinnedList.length})
          </button>
          <button class="si-btn si-btn-primary" data-testid="style_inspector_panel_export_button" id="si-export-all-btn">
            \u{1F4CB} Export All to Clipboard
          </button>
        </div>
      </div>
    `;
      this._attachEventListeners(activeItem);
    }
    _renderActiveItemBody(item) {
      const cur = item.current;
      return `
      <div class="si-panel-body">
        <div class="si-target-info">
          <span class="si-target-selector" title="${item.selector}">${item.selector}</span>
          <button class="si-btn-icon" id="si-copy-selector-btn" title="Copy selector">\u29C9</button>
        </div>

        <!-- Padding Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Padding</span>
            <label class="si-switch-label">
              <span>Link all</span>
              <div class="si-switch ${item.linkPadding ? "checked" : ""}"
                   data-testid="style_inspector_panel_link_sides_switch"
                   data-switch="padding">
                <div class="si-switch-thumb"></div>
              </div>
            </label>
          </div>

          ${item.linkPadding ? `
            <div class="si-control-row">
              <span class="si-control-label">All Sides</span>
              <input type="range" class="si-slider" min="0" max="120" value="${cur.paddingTop}" id="pad-slider-all">
              <input type="number" class="si-input-number"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="all"
                     value="${cur.paddingTop}" id="pad-input-all">
            </div>
          ` : `
            <div class="si-dir-grid">
              <div class="si-dir-item">
                <span class="si-dir-label">Top</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_padding_input"
                       data-side="top"
                       value="${cur.paddingTop}" id="pad-input-top">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Right</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_padding_input"
                       data-side="right"
                       value="${cur.paddingRight}" id="pad-input-right">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Bottom</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_padding_input"
                       data-side="bottom"
                       value="${cur.paddingBottom}" id="pad-input-bottom">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Left</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_padding_input"
                       data-side="left"
                       value="${cur.paddingLeft}" id="pad-input-left">
              </div>
            </div>
          `}
        </div>

        <!-- Margin Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Margin</span>
            <label class="si-switch-label">
              <span>Link all</span>
              <div class="si-switch ${item.linkMargin ? "checked" : ""}"
                   data-testid="style_inspector_panel_link_sides_switch"
                   data-switch="margin">
                <div class="si-switch-thumb"></div>
              </div>
            </label>
          </div>

          ${item.linkMargin ? `
            <div class="si-control-row">
              <span class="si-control-label">All Sides</span>
              <input type="range" class="si-slider" min="0" max="120" value="${cur.marginTop}" id="mar-slider-all">
              <input type="number" class="si-input-number"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="all"
                     value="${cur.marginTop}" id="mar-input-all">
            </div>
          ` : `
            <div class="si-dir-grid">
              <div class="si-dir-item">
                <span class="si-dir-label">Top</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_margin_input"
                       data-side="top"
                       value="${cur.marginTop}" id="mar-input-top">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Right</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_margin_input"
                       data-side="right"
                       value="${cur.marginRight}" id="mar-input-right">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Bottom</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_margin_input"
                       data-side="bottom"
                       value="${cur.marginBottom}" id="mar-input-bottom">
              </div>
              <div class="si-dir-item">
                <span class="si-dir-label">Left</span>
                <input type="number" class="si-input-number"
                       data-testid="style_inspector_panel_margin_input"
                       data-side="left"
                       value="${cur.marginLeft}" id="mar-input-left">
              </div>
            </div>
          `}
        </div>

        <!-- Gap Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Gap (Flex / Grid)</span>
          </div>
          <div class="si-control-row">
            <span class="si-control-label">Gap</span>
            <input type="range" class="si-slider" min="0" max="100" value="${cur.gap}" id="gap-slider">
            <input type="number" class="si-input-number"
                   data-testid="style_inspector_panel_gap_input"
                   value="${cur.gap}" id="gap-input">
          </div>
        </div>

        <!-- Typography Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Typography</span>
          </div>
          <div class="si-control-row">
            <span class="si-control-label">Font Size</span>
            <input type="range" class="si-slider" min="8" max="72" value="${cur.fontSize}" id="font-size-slider">
            <input type="number" class="si-input-number"
                   data-testid="style_inspector_panel_font_size_input"
                   value="${cur.fontSize}" id="font-size-input">
          </div>

          <div class="si-control-row">
            <span class="si-control-label">Line Height</span>
            <input type="range" class="si-slider" min="0.8" max="3.0" step="0.05" value="${cur.lineHeight}" id="line-height-slider">
            <input type="number" class="si-input-number" step="0.05"
                   data-testid="style_inspector_panel_line_height_input"
                   value="${cur.lineHeight}" id="line-height-input">
          </div>

          <div class="si-control-row">
            <span class="si-control-label">Letter Spacing</span>
            <input type="range" class="si-slider" min="-2" max="10" step="0.1" value="${cur.letterSpacing}" id="letter-spacing-slider">
            <input type="number" class="si-input-number" step="0.1"
                   value="${cur.letterSpacing}" id="letter-spacing-input">
          </div>
        </div>

        <!-- Context & Notes Field -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Element Notes (Optional)</span>
          </div>
          <textarea class="si-textarea" id="si-notes-input"
                    placeholder="e.g. Instance of repeated card, desktop breakpoint only...">${item.notes || ""}</textarea>
        </div>

        <!-- Element-Level Actions -->
        <div class="si-action-row">
          <button class="si-btn si-btn-danger" data-testid="style_inspector_panel_reset_button" id="si-reset-item-btn">
            \u21BA Reset
          </button>
          <button class="si-btn si-btn-secondary" data-testid="style_inspector_panel_copy_item_button" id="si-copy-item-btn">
            \u{1F4CB} Copy Item MD
          </button>
        </div>
      </div>
    `;
    }
    _attachEventListeners(activeItem) {
      const minBtn = this.panel.querySelector("#si-minimize-btn");
      if (minBtn) {
        minBtn.onclick = () => {
          this.isMinimized = true;
          this.render();
        };
      }
      const closeBtn = this.panel.querySelector("#si-close-btn");
      if (closeBtn) {
        closeBtn.onclick = () => {
          this.state.isPanelOpen = false;
          this.render();
        };
      }
      this.panel.querySelectorAll(".si-pinned-pill").forEach((pill) => {
        pill.onclick = (e) => {
          const removeId = e.target.getAttribute("data-remove");
          if (removeId) {
            e.stopPropagation();
            this.state.unpinElement(removeId);
          } else {
            const id = pill.getAttribute("data-id");
            this.state.setActivePinnedId(id);
          }
        };
      });
      const resetAllBtn = this.panel.querySelector("#si-reset-all-btn");
      if (resetAllBtn) {
        resetAllBtn.onclick = () => {
          if (confirm("Reset all pinned elements back to their initial baseline?")) {
            this.state.resetAll();
            this.showToast("All elements reset to baseline.");
          }
        };
      }
      const exportAllBtn = this.panel.querySelector("#si-export-all-btn");
      if (exportAllBtn) {
        exportAllBtn.onclick = async () => {
          const markdown = generateMarkdownExport(this.state.getPinnedList());
          const ok = await copyToClipboard(markdown);
          if (ok) {
            this.showToast("\u2713 Export copied to clipboard!");
          } else {
            alert("Failed to copy to clipboard. Please allow clipboard permissions.");
          }
        };
      }
      if (!activeItem) return;
      const copySelBtn = this.panel.querySelector("#si-copy-selector-btn");
      if (copySelBtn) {
        copySelBtn.onclick = async () => {
          await copyToClipboard(activeItem.selector);
          this.showToast("Selector copied!");
        };
      }
      this.panel.querySelectorAll("[data-switch]").forEach((el) => {
        el.onclick = () => {
          const target = el.getAttribute("data-switch");
          if (target === "padding") {
            this.state.setLinkPadding(activeItem.id, !activeItem.linkPadding);
          } else if (target === "margin") {
            this.state.setLinkMargin(activeItem.id, !activeItem.linkMargin);
          }
        };
      });
      const notesInput = this.panel.querySelector("#si-notes-input");
      if (notesInput) {
        notesInput.oninput = (e) => {
          this.state.setNotes(activeItem.id, e.target.value);
        };
      }
      const copyItemBtn = this.panel.querySelector("#si-copy-item-btn");
      if (copyItemBtn) {
        copyItemBtn.onclick = async () => {
          const markdown = generateSingleItemExport(activeItem);
          const ok = await copyToClipboard(markdown);
          if (ok) {
            this.showToast("\u2713 Item markdown copied to clipboard!");
          }
        };
      }
      const resetItemBtn = this.panel.querySelector("#si-reset-item-btn");
      if (resetItemBtn) {
        resetItemBtn.onclick = () => {
          this.state.resetElement(activeItem.id);
          this.showToast("Element styles reset to baseline.");
        };
      }
      const bindSync = (sliderId, inputId, prop) => {
        const slider = this.panel.querySelector(sliderId);
        const input = this.panel.querySelector(inputId);
        if (!input) return;
        if (slider) {
          slider.oninput = (e) => {
            input.value = e.target.value;
            this.state.updateStyle(activeItem.id, prop, parseFloat(e.target.value));
          };
        }
        input.oninput = (e) => {
          if (slider) slider.value = e.target.value;
          this.state.updateStyle(activeItem.id, prop, parseFloat(e.target.value));
        };
      };
      if (activeItem.linkPadding) {
        bindSync("#pad-slider-all", "#pad-input-all", "paddingAll");
      } else {
        bindSync(null, "#pad-input-top", "paddingTop");
        bindSync(null, "#pad-input-right", "paddingRight");
        bindSync(null, "#pad-input-bottom", "paddingBottom");
        bindSync(null, "#pad-input-left", "paddingLeft");
      }
      if (activeItem.linkMargin) {
        bindSync("#mar-slider-all", "#mar-input-all", "marginAll");
      } else {
        bindSync(null, "#mar-input-top", "marginTop");
        bindSync(null, "#mar-input-right", "marginRight");
        bindSync(null, "#mar-input-bottom", "marginBottom");
        bindSync(null, "#mar-input-left", "marginLeft");
      }
      bindSync("#gap-slider", "#gap-input", "gap");
      bindSync("#font-size-slider", "#font-size-input", "fontSize");
      bindSync("#line-height-slider", "#line-height-input", "lineHeight");
      bindSync("#letter-spacing-slider", "#letter-spacing-input", "letterSpacing");
    }
  };

  // src/index.js
  var StyleInspector = class {
    constructor() {
      if (window.__STYLE_INSPECTOR_INSTANCE__) {
        return window.__STYLE_INSPECTOR_INSTANCE__;
      }
      this.state = new InspectorState();
      this.host = null;
      this.shadowRoot = null;
      this.overlay = null;
      this.toolbar = null;
      this.panel = null;
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onClickCapture = this._onClickCapture.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);
      this.init();
      window.__STYLE_INSPECTOR_INSTANCE__ = this;
    }
    init() {
      let existingHost = document.getElementById("style-inspector-host");
      if (existingHost) {
        existingHost.remove();
      }
      this.host = document.createElement("div");
      this.host.id = "style-inspector-host";
      this.host.style.position = "fixed";
      this.host.style.zIndex = "2147483647";
      this.host.style.top = "0";
      this.host.style.left = "0";
      this.host.style.pointerEvents = "none";
      this.shadowRoot = this.host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = inspectorStyles;
      this.shadowRoot.appendChild(styleEl);
      const styleFix = document.createElement("style");
      styleFix.textContent = `
      .si-toolbar, .si-panel, .si-banner, .si-toast {
        pointer-events: auto !important;
      }
      .si-overlay-container, .si-hover-box, .si-hover-tag, .si-pinned-box, .si-pinned-tag {
        pointer-events: none !important;
      }
    `;
      this.shadowRoot.appendChild(styleFix);
      if (document.body) {
        document.body.appendChild(this.host);
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          if (this.host && document.body && !document.body.contains(this.host)) {
            document.body.appendChild(this.host);
          }
        });
        document.documentElement.appendChild(this.host);
      }
      this.overlay = new InspectorOverlay(this.shadowRoot, this.state);
      this.toolbar = new InspectorToolbar(this.shadowRoot, this.state);
      this.panel = new InspectorPanel(this.shadowRoot, this.state);
      window.addEventListener("pointermove", this._onPointerMove, true);
      window.addEventListener("mousemove", this._onPointerMove, true);
      window.addEventListener("click", this._onClickCapture, true);
      window.addEventListener("keydown", this._onKeyDown, true);
      console.log(
        "%c[Style Inspector]%c Activated! Press %cAlt+Shift+S%c or click the floating badge to inspect.",
        "color: #818cf8; font-weight: bold;",
        "color: inherit;",
        "background: #1e1b4b; color: #a5b4fc; padding: 2px 4px; border-radius: 3px;",
        "color: inherit;"
      );
    }
    _isInsideInspector(element) {
      if (!element || !(element instanceof Node)) return false;
      if (element === this.host) return true;
      if (this.shadowRoot && this.shadowRoot.contains(element)) return true;
      if (this.host && this.host.contains(element)) return true;
      const root = element.getRootNode ? element.getRootNode() : null;
      return root === this.shadowRoot;
    }
    _onPointerMove(e) {
      if (!this.state.isInspecting) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.some((el) => this._isInsideInspector(el))) {
        this.state.setHoveredElement(null);
        return;
      }
      const target = e.target;
      if (!target || this._isInsideInspector(target) || target === document.body || target === document.documentElement) {
        this.state.setHoveredElement(null);
        return;
      }
      this.state.setHoveredElement(target);
    }
    _onClickCapture(e) {
      if (!this.state.isInspecting) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.some((el) => this._isInsideInspector(el))) {
        return;
      }
      const target = e.target;
      if (!target || this._isInsideInspector(target) || target === document.body || target === document.documentElement) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.state.pinElement(target);
    }
    _onKeyDown(e) {
      if (e.key === "Escape" && this.state.isInspecting) {
        this.state.stopInspecting();
        return;
      }
      const isSKey = e.code === "KeyS" || e.key === "S" || e.key === "s";
      if (e.altKey && isSKey) {
        e.preventDefault();
        this.state.toggleInspecting();
      }
    }
    toggle() {
      this.state.toggleInspecting();
    }
    enable() {
      this.state.startInspecting();
    }
    disable() {
      this.state.stopInspecting();
    }
    async exportAll() {
      const md = generateMarkdownExport(this.state.getPinnedList());
      await copyToClipboard(md);
      this.panel.showToast();
      return md;
    }
    resetAll() {
      this.state.resetAll();
    }
    destroy() {
      window.removeEventListener("pointermove", this._onPointerMove, true);
      window.removeEventListener("click", this._onClickCapture, true);
      window.removeEventListener("keydown", this._onKeyDown, true);
      if (this.host) {
        this.host.remove();
      }
      window.__STYLE_INSPECTOR_INSTANCE__ = null;
      delete window.__STYLE_INSPECTOR__;
    }
  };
  if (typeof window !== "undefined") {
    if (!window.__STYLE_INSPECTOR__) {
      const inspector = new StyleInspector();
      window.__STYLE_INSPECTOR__ = inspector;
    }
  }
  return __toCommonJS(index_exports);
})();
