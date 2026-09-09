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
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // src/core/styles.js
  function parsePx(val, fallback = 0) {
    if (!val || typeof val !== "string") return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : Math.round(num * 100) / 100;
  }
  function rgbToHex(colorStr, fallback = "#000000") {
    if (!colorStr || typeof colorStr !== "string") return fallback;
    const str = colorStr.trim();
    if (str.startsWith("#")) {
      if (str.length === 4) {
        return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`.toLowerCase();
      }
      if (str.length >= 7) {
        return str.slice(0, 7).toLowerCase();
      }
    }
    if (str === "transparent" || str === "rgba(0, 0, 0, 0)") {
      return fallback;
    }
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const r = Math.min(255, parseInt(match[1], 10)).toString(16).padStart(2, "0");
      const g = Math.min(255, parseInt(match[2], 10)).toString(16).padStart(2, "0");
      const b = Math.min(255, parseInt(match[3], 10)).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`.toLowerCase();
    }
    return fallback;
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
    let fontWeight = computed.fontWeight ? `${computed.fontWeight}` : "400";
    if (fontWeight === "normal") fontWeight = "400";
    if (fontWeight === "bold") fontWeight = "700";
    const textTransform = computed.textTransform || "none";
    const textAlign = computed.textAlign || "left";
    const color = computed.color || "rgb(0, 0, 0)";
    const backgroundColor = computed.backgroundColor || "transparent";
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
      letterSpacing,
      fontWeight,
      textTransform,
      textAlign,
      color,
      backgroundColor
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
      letterSpacing: 0,
      fontWeight: "400",
      textTransform: "none",
      textAlign: "left",
      color: "rgb(0, 0, 0)",
      backgroundColor: "transparent"
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
      "letter-spacing",
      "font-weight",
      "text-transform",
      "text-align",
      "color",
      "background-color"
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
      letterSpacing: "letter-spacing",
      fontWeight: "font-weight",
      textTransform: "text-transform",
      textAlign: "text-align",
      color: "color",
      backgroundColor: "background-color"
    };
    const cssProp = cssPropMap[prop];
    if (!cssProp) return;
    let formattedVal = val;
    if (prop === "lineHeight" || prop === "fontWeight" || prop === "textTransform" || prop === "textAlign" || prop === "color" || prop === "backgroundColor") {
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
    if (baseline.fontWeight && current.fontWeight && `${baseline.fontWeight}` !== `${current.fontWeight}`) {
      diffs.push({
        property: "font-weight",
        before: `${baseline.fontWeight}`,
        after: `${current.fontWeight}`
      });
    }
    if (baseline.textTransform && current.textTransform && baseline.textTransform !== current.textTransform) {
      diffs.push({
        property: "text-transform",
        before: `${baseline.textTransform}`,
        after: `${current.textTransform}`
      });
    }
    if (baseline.color && current.color && baseline.color !== current.color) {
      diffs.push({
        property: "color",
        before: `${baseline.color}`,
        after: `${current.color}`
      });
    }
    if (baseline.backgroundColor && current.backgroundColor && baseline.backgroundColor !== current.backgroundColor) {
      diffs.push({
        property: "background-color",
        before: `${baseline.backgroundColor}`,
        after: `${current.backgroundColor}`
      });
    }
    if (baseline.textAlign && current.textAlign && baseline.textAlign !== current.textAlign) {
      diffs.push({
        property: "text-align",
        before: `${baseline.textAlign}`,
        after: `${current.textAlign}`
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
        const isStringProp = prop === "lineHeight" || prop === "fontWeight" || prop === "textTransform" || prop === "textAlign" || prop === "color" || prop === "backgroundColor";
        item.current[prop] = isStringProp ? `${value}` : numVal;
        applyStyleProperty(item.element, prop, value, isStringProp ? "" : "px");
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
@import url('https://fonts.googleapis.com/css2?family=Azeret+Mono:ital,wght@0,100..900;1,100..900&display=swap');

:host {
  all: initial;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #e5e5e5;
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
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 0;
  padding: 6px 12px 6px 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.si-toolbar:hover {
  border-color: #00e5a0;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -4px rgba(0, 229, 160, 0.3);
}

.si-toolbar.active {
  background: #0a0a0a;
  border-color: #33e8b0;
  box-shadow: 0 0 15px rgba(0, 229, 160, 0.25);
}

.si-toolbar-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #8a8a8a;
  transition: background 0.2s ease;
}

.si-toolbar.active .si-toolbar-indicator {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.si-toolbar-label {
  font-weight: 600;
  font-size: 12px;
  color: #f5f5f5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.si-toolbar-badge {
  background: #111111;
  color: #d4d4d4;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 0;
}

/* Active Mode Banner */
.si-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483645;
  background: #0a0a0a;
  border-bottom: 1px solid #00e5a0;
  color: #d4d4d4;
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
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.si-banner-icon {
  font-size: 14px;
}

.si-banner-keys {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  color: #a3a3a3;
}

.si-key {
  background: #0a0a0a;
  border: 1px solid #00b982;
  border-radius: 0;
  padding: 1px 5px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}

.si-banner-close {
  background: transparent;
  border: none;
  color: #d4d4d4;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 0;
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
  border-radius: 0;
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
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
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
  border-radius: 0;
  pointer-events: none !important;
  z-index: 2147483640;
}

.si-pinned-tag {
  position: absolute;
  top: -22px;
  left: 0;
  background: #d97706;
  color: #ffffff;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0;
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
  width: min(380px, calc(100vw - 40px));
  max-height: calc(100vh - 80px);
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 0;
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
  background: #111111;
  border-bottom: 1px solid #262626;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.si-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #f5f5f5;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.si-panel-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.si-btn-icon {
  background: transparent;
  border: none;
  color: #a3a3a3;
  cursor: pointer;
  padding: 4px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.si-btn-icon:hover {
  background: #262626;
  color: #f5f5f5;
}

/* Pinned Items Carousel / Bar */
.si-pinned-bar {
  padding: 8px 12px;
  background: #111111;
  border-bottom: 1px solid #111111;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  flex-shrink: 0;
}

.si-pinned-bar::-webkit-scrollbar {
  height: 4px;
}
.si-pinned-bar::-webkit-scrollbar-thumb {
  background: #262626;
  border-radius: 2px;
}

.si-pinned-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #111111;
  border: 1px solid #262626;
  border-radius: 0;
  padding: 4px 8px;
  font-size: 11px;
  color: #d4d4d4;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.si-pinned-pill:hover {
  border-color: #00e5a0;
  color: #ffffff;
}

.si-pinned-pill.active {
  background: #111111;
  border-color: #33e8b0;
  color: #f5f5f5;
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
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 240px);
}

.si-panel-body::-webkit-scrollbar {
  width: 6px;
}
.si-panel-body::-webkit-scrollbar-thumb {
  background: #262626;
  border-radius: 0;
}

.si-target-info {
  background: #111111;
  border-radius: 0;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #262626;
}

.si-target-selector {
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
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
  color: #a3a3a3;
  border-bottom: 1px solid #111111;
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
  color: #d4d4d4;
}

.si-switch {
  position: relative;
  width: 28px;
  height: 16px;
  background: #262626;
  border-radius: 9999px;
  transition: background 0.2s;
}

.si-switch.checked {
  background: #00e5a0;
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
  color: #a3a3a3;
  width: 72px;
  flex-shrink: 0;
}

.si-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #262626;
  outline: none;
  cursor: pointer;
}

.si-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00e5a0;
  cursor: pointer;
  border: 2px solid #0a0a0a;
  transition: transform 0.1s;
}

.si-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #33e8b0;
}

.si-input-number {
  width: 58px;
  background: #111111;
  border: 1px solid #262626;
  border-radius: 0;
  color: #f5f5f5;
  font-size: 12px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  padding: 4px 6px;
  text-align: right;
  outline: none;
}

.si-input-number:focus {
  border-color: #00e5a0;
  box-shadow: 0 0 0 1px #00e5a0;
}

.si-select {
  flex: 1;
  background: #111111;
  border: 1px solid #262626;
  border-radius: 0;
  color: #f5f5f5;
  font-size: 12px;
  font-family: inherit;
  padding: 4px 8px;
  outline: none;
  cursor: pointer;
  height: 28px;
}

.si-select:focus {
  border-color: #00e5a0;
  box-shadow: 0 0 0 1px #00e5a0;
}

.si-select option {
  background: #0a0a0a;
  color: #f5f5f5;
}

/* Color Picker & Text Inputs */
.si-color-picker-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-color-swatch {
  -webkit-appearance: none;
  appearance: none;
  border: 1px solid #262626;
  width: 28px;
  height: 28px;
  border-radius: 0;
  cursor: pointer;
  background: transparent;
  padding: 0;
  flex-shrink: 0;
}

.si-color-swatch::-webkit-color-swatch-wrapper {
  padding: 0;
}

.si-color-swatch::-webkit-color-swatch {
  border: none;
  border-radius: 5px;
}

.si-input-text {
  flex: 1;
  background: #111111;
  border: 1px solid #262626;
  border-radius: 0;
  color: #f5f5f5;
  font-size: 12px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  padding: 4px 8px;
  outline: none;
  height: 28px;
  min-width: 0;
}

.si-input-text:focus {
  border-color: #00e5a0;
  box-shadow: 0 0 0 1px #00e5a0;
}

/* Typography compact grid */
.si-typography-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #161616;
  padding: 8px;
  border-radius: 0;
}

.si-type-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #111111;
  border: 1px solid #262626;
  padding: 4px 8px;
  height: 28px;
  font-size: 12px;
  color: #f5f5f5;
  min-width: 0;
}

.si-type-control:focus-within {
  border-color: #00e5a0;
}

.si-type-glyph {
  font-size: 11px;
  color: #a3a3a3;
  flex-shrink: 0;
  user-select: none;
}

.si-type-underlined {
  text-decoration: underline;
}

.si-type-dash {
  color: #a3a3a3;
  font-size: 11px;
}

.si-type-control input,
.si-type-control select {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: #f5f5f5;
  font-size: 12px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  padding: 0;
}

.si-type-control input[type="number"] {
  text-align: right;
  -moz-appearance: textfield;
  appearance: textfield;
}

.si-type-control input[type="number"]::-webkit-inner-spin-button,
.si-type-control input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.si-type-value span {
  font-size: 11px;
  color: #a3a3a3;
  flex-shrink: 0;
}

.si-type-select {
  position: relative;
}

.si-type-select select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.si-type-select .si-icon {
  flex-shrink: 0;
  color: #a3a3a3;
  pointer-events: none;
}

.si-type-value .si-color-swatch {
  width: 16px;
  height: 16px;
  border: 1px solid #262626;
  border-radius: 0;
}

.si-type-align {
  padding: 0;
  gap: 0;
}

.si-type-icon-btn {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #a3a3a3;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}

.si-type-icon-btn:hover {
  color: #f5f5f5;
}

.si-type-icon-btn.active {
  background: #262626;
  color: #f5f5f5;
}

/* Narrow screens: typography grid collapses to single column */
@media (max-width: 480px) {
  .si-panel {
    width: calc(100vw - 24px);
    right: 12px;
  }

  .si-typography-grid {
    grid-template-columns: 1fr;
  }

  .si-spacing-box {
    grid-template-columns: 36px 1fr 36px;
  }
}

.si-type-transform select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

/* Box-model spacing editor (Padding / Margin) */
.si-spacing-box {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  grid-template-rows: 32px 1fr 32px;
  gap: 6px;
  background: #161616;
  border: 1px solid #262626;
  border-radius: 10px;
  padding: 22px 10px 10px;
  min-height: 130px;
}

.si-spacing-label {
  position: absolute;
  top: 6px;
  left: 10px;
  font-size: 10px;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a3a3a3;
  pointer-events: none;
}

.si-spacing-edge {
  background: #111111;
  border: 1px solid #262626;
  border-radius: 6px;
  color: #f5f5f5;
  font-size: 12px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  text-align: center;
  outline: none;
  width: 100%;
  -moz-appearance: textfield;
  appearance: textfield;
}

.si-spacing-edge::-webkit-inner-spin-button,
.si-spacing-edge::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.si-spacing-edge:focus {
  border-color: #00e5a0;
  box-shadow: 0 0 0 1px #00e5a0;
}

.si-spacing-top {
  grid-column: 1 / 4;
  grid-row: 1;
}

.si-spacing-left {
  grid-column: 1;
  grid-row: 2;
}

.si-spacing-right {
  grid-column: 3;
  grid-row: 2;
}

.si-spacing-bottom {
  grid-column: 1 / 4;
  grid-row: 3;
}

.si-spacing-center {
  grid-column: 2;
  grid-row: 2;
  background: #0a0a0a;
  border: 1px dashed #262626;
  border-radius: 6px;
}

.si-spacing-box-linked {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.si-spacing-box-linked .si-spacing-all {
  width: 90px;
}

/* Font size preset select, paired with existing numeric input */
.si-type-fontsize {
  gap: 4px;
}

.si-fontsize-preset {
  flex-shrink: 0;
  width: 34px;
  background: transparent;
  border: none;
  border-left: 1px solid #262626;
  color: #a3a3a3;
  font-size: 11px;
  font-family: 'Azeret Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  padding-left: 4px;
}

.si-fontsize-preset option {
  background: #0a0a0a;
  color: #f5f5f5;
}

/* Notes Textarea */
.si-textarea {
  width: 100%;
  background: #111111;
  border: 1px solid #262626;
  border-radius: 0;
  color: #f5f5f5;
  font-size: 12px;
  padding: 8px;
  min-height: 52px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.si-textarea:focus {
  border-color: #00e5a0;
}

.si-textarea::placeholder {
  color: #8a8a8a;
}

/* Panel Footer & Actions */
.si-panel-footer {
  padding: 12px 16px;
  background: #111111;
  border-top: 1px solid #262626;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.si-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  stroke: currentColor;
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
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 0;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.si-btn-secondary {
  background: #262626;
  color: #f5f5f5;
}
.si-btn-secondary:hover {
  background: #333333;
}

.si-btn-primary {
  background: #00e5a0;
  color: #0a0a0a;
}
.si-btn-primary:hover {
  background: #33e8b0;
  box-shadow: none;
  transform: translateY(-1px);
}

.si-btn-white {
  background: #ffffff;
  color: #0a0a0a;
}
.si-btn-white:hover {
  background: #d4d4d4;
  transform: translateY(-1px);
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
  background: #00e5a0;
  color: #0a0a0a;
  padding: 10px 16px;
  border-radius: 0;
  border: 1px solid #262626;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
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


@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/defaultAttributes.mjs
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/createElement.mjs
  var createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  var createElement = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/bold.mjs
  var Bold = [
    ["path", { d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/check.mjs
  var Check = [["path", { d: "M20 6 9 17l-5-5" }]];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/chevron-down.mjs
  var ChevronDown = [["path", { d: "m6 9 6 6 6-6" }]];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/clipboard.mjs
  var Clipboard = [
    ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1" }],
    ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/copy.mjs
  var Copy = [
    ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
    ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/maximize-2.mjs
  var Maximize2 = [
    ["path", { d: "M15 3h6v6" }],
    ["path", { d: "m21 3-7 7" }],
    ["path", { d: "m3 21 7-7" }],
    ["path", { d: "M9 21H3v-6" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/minimize-2.mjs
  var Minimize2 = [
    ["path", { d: "m14 10 7-7" }],
    ["path", { d: "M20 10h-6V4" }],
    ["path", { d: "m3 21 7-7" }],
    ["path", { d: "M4 14h6v6" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/palette.mjs
  var Palette = [
    [
      "path",
      {
        d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"
      }
    ],
    ["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor" }],
    ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor" }],
    ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor" }],
    ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/pin.mjs
  var Pin = [
    ["path", { d: "M12 17v5" }],
    [
      "path",
      {
        d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
      }
    ]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/rotate-ccw.mjs
  var RotateCcw = [
    ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
    ["path", { d: "M3 3v5h5" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/strikethrough.mjs
  var Strikethrough = [
    ["path", { d: "M16 4H9a3 3 0 0 0-2.83 4" }],
    ["path", { d: "M14 12a4 4 0 0 1 0 8H6" }],
    ["line", { x1: "4", x2: "20", y1: "12", y2: "12" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/text-align-center.mjs
  var TextAlignCenter = [
    ["path", { d: "M21 5H3" }],
    ["path", { d: "M17 12H7" }],
    ["path", { d: "M19 19H5" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/text-align-end.mjs
  var TextAlignEnd = [
    ["path", { d: "M21 5H3" }],
    ["path", { d: "M21 12H9" }],
    ["path", { d: "M21 19H7" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/text-align-justify.mjs
  var TextAlignJustify = [
    ["path", { d: "M3 5h18" }],
    ["path", { d: "M3 12h18" }],
    ["path", { d: "M3 19h18" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/text-align-start.mjs
  var TextAlignStart = [
    ["path", { d: "M21 5H3" }],
    ["path", { d: "M15 12H3" }],
    ["path", { d: "M17 19H3" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/underline.mjs
  var Underline = [
    ["path", { d: "M6 4v6a6 6 0 0 0 12 0V4" }],
    ["line", { x1: "4", x2: "20", y1: "20", y2: "20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/x.mjs
  var X = [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/zap.mjs
  var Zap = [
    [
      "path",
      {
        d: "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
      }
    ]
  ];

  // src/ui/icons.js
  var iconNodes = {
    AlignCenter: TextAlignCenter,
    AlignJustify: TextAlignJustify,
    AlignLeft: TextAlignStart,
    AlignRight: TextAlignEnd,
    Bold,
    Check,
    ChevronDown,
    Clipboard,
    Copy,
    Maximize2,
    Minimize2,
    Palette,
    Pin,
    RotateCcw,
    Strikethrough,
    Underline,
    X,
    Zap
  };
  function siIcon(name, size = 14) {
    const svg = createElement(iconNodes[name], {
      class: "si-icon",
      width: size,
      height: size,
      "stroke-width": 2,
      "aria-hidden": "true",
      focusable: "false"
    });
    return svg.outerHTML;
  }

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
          tag.innerHTML = `${siIcon("Pin")}<span>${escapeHtml(item.label)}</span>`;
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
      this.toggleBtn.title = "Toggle Style Inspector (Alt+Shift+S | Drag to move)";
      this.toggleBtn.innerHTML = `
      <span class="si-toolbar-indicator"></span>
      <span class="si-toolbar-label">Style Inspector</span>
      <span class="si-toolbar-badge" style="display: none;">0</span>
    `;
      this.badge = this.toggleBtn.querySelector(".si-toolbar-badge");
      let isDragging = false;
      let hasDragged = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      this.toggleBtn.addEventListener("pointerdown", (e) => {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = this.toggleBtn.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        const onPointerMove = (moveEvt) => {
          if (!isDragging) return;
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            hasDragged = true;
          }
          const maxLeft = Math.max(10, window.innerWidth - this.toggleBtn.offsetWidth - 10);
          const maxTop = Math.max(10, window.innerHeight - this.toggleBtn.offsetHeight - 10);
          const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
          const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));
          this.toggleBtn.style.right = "auto";
          this.toggleBtn.style.bottom = "auto";
          this.toggleBtn.style.left = `${newLeft}px`;
          this.toggleBtn.style.top = `${newTop}px`;
        };
        const onPointerUp = () => {
          isDragging = false;
          window.removeEventListener("pointermove", onPointerMove, true);
          window.removeEventListener("pointerup", onPointerUp, true);
        };
        window.addEventListener("pointermove", onPointerMove, true);
        window.addEventListener("pointerup", onPointerUp, true);
      });
      this.toggleBtn.addEventListener("click", (e) => {
        if (hasDragged) {
          hasDragged = false;
          return;
        }
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
        <span class="si-banner-icon">${siIcon("Zap")}</span>
        <span><strong>Inspect Mode Active:</strong> Hover over an element, click to pin & adjust styles</span>
      </div>
      <div class="si-banner-keys">
        <span><span class="si-key">Esc</span> Exit Mode</span>
        <button class="si-banner-close">${siIcon("X")}</button>
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
      this._panelPosition = null;
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
    showToast(message = "Copied to clipboard! Ready to paste into Antigravity.") {
      const existing = this.shadowRoot.querySelector(".si-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.className = "si-toast";
      toast.innerHTML = `${siIcon("Check")}<span>${escapeHtml(message)}</span>`;
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
      if (this._panelPosition) {
        this.panel.style.right = "auto";
        this.panel.style.left = `${this._panelPosition.left}px`;
        this.panel.style.top = `${this._panelPosition.top}px`;
      }
      if (this.isMinimized) {
        this.panel.innerHTML = `
        <div class="si-panel-header" title="Drag to move">
          <div class="si-panel-title">
            ${siIcon("Palette")}
            <span>Style Inspector (${pinnedList.length})</span>
          </div>
          <div class="si-panel-header-actions">
            <button class="si-btn-icon" id="si-expand-btn" title="Expand panel">${siIcon("Maximize2")}</button>
            <button class="si-btn-icon" id="si-close-btn" title="Close">${siIcon("X")}</button>
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
        this._initDraggable();
        return;
      }
      this.panel.innerHTML = `
      <div class="si-panel-header" title="Drag to move">
        <div class="si-panel-title">
          ${siIcon("Palette")}
          <span>Style Inspector</span>
          <span class="si-toolbar-badge">${pinnedList.length}</span>
        </div>
        <div class="si-panel-header-actions">
          <button class="si-btn-icon" id="si-minimize-btn" title="Minimize panel">${siIcon("Minimize2")}</button>
          <button class="si-btn-icon" id="si-close-btn" title="Close panel">${siIcon("X")}</button>
        </div>
      </div>

      <div class="si-pinned-bar">
        ${pinnedList.map(
        (item) => `
          <div class="si-pinned-pill ${item.id === this.state.activePinnedId ? "active" : ""}"
               data-testid="style_inspector_panel_pinned_item"
               data-id="${item.id}">
            <span>${escapeHtml(item.label)}</span>
            <span class="si-pinned-pill-close" data-remove="${item.id}">${siIcon("X", 12)}</span>
          </div>
        `
      ).join("")}
      </div>

      ${activeItem ? this._renderActiveItemBody(activeItem) : '<div class="si-panel-body">No element selected.</div>'}

      <div class="si-panel-footer">
        <div class="si-action-row">
          <button class="si-btn si-btn-secondary" id="si-reset-all-btn">
            Reset All (${pinnedList.length})
          </button>
          <button class="si-btn si-btn-white" data-testid="style_inspector_panel_export_button" id="si-export-all-btn">
            Copy to Clipboard
          </button>
        </div>
      </div>
    `;
      this._attachEventListeners(activeItem);
      this._initDraggable();
    }
    _renderActiveItemBody(item) {
      const cur = item.current;
      return `
      <div class="si-panel-body">
        <div class="si-target-info">
          <span class="si-target-selector" title="${escapeHtml(item.selector)}">${escapeHtml(item.selector)}</span>
          <button class="si-btn-icon" id="si-copy-selector-btn" title="Copy selector">${siIcon("Copy")}</button>
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
            <div class="si-spacing-box si-spacing-box-linked">
              <span class="si-spacing-label">Padding</span>
              <input type="number" class="si-spacing-edge si-spacing-all"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="all"
                     value="${cur.paddingTop}" id="pad-input-all">
            </div>
          ` : `
            <div class="si-spacing-box">
              <span class="si-spacing-label">Padding</span>
              <input type="number" class="si-spacing-edge si-spacing-top"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="top" title="Top"
                     value="${cur.paddingTop}" id="pad-input-top">
              <input type="number" class="si-spacing-edge si-spacing-left"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="left" title="Left"
                     value="${cur.paddingLeft}" id="pad-input-left">
              <div class="si-spacing-center"></div>
              <input type="number" class="si-spacing-edge si-spacing-right"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="right" title="Right"
                     value="${cur.paddingRight}" id="pad-input-right">
              <input type="number" class="si-spacing-edge si-spacing-bottom"
                     data-testid="style_inspector_panel_padding_input"
                     data-side="bottom" title="Bottom"
                     value="${cur.paddingBottom}" id="pad-input-bottom">
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
            <div class="si-spacing-box si-spacing-box-linked">
              <span class="si-spacing-label">Margin</span>
              <input type="number" class="si-spacing-edge si-spacing-all"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="all"
                     value="${cur.marginTop}" id="mar-input-all">
            </div>
          ` : `
            <div class="si-spacing-box">
              <span class="si-spacing-label">Margin</span>
              <input type="number" class="si-spacing-edge si-spacing-top"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="top" title="Top"
                     value="${cur.marginTop}" id="mar-input-top">
              <input type="number" class="si-spacing-edge si-spacing-left"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="left" title="Left"
                     value="${cur.marginLeft}" id="mar-input-left">
              <div class="si-spacing-center"></div>
              <input type="number" class="si-spacing-edge si-spacing-right"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="right" title="Right"
                     value="${cur.marginRight}" id="mar-input-right">
              <input type="number" class="si-spacing-edge si-spacing-bottom"
                     data-testid="style_inspector_panel_margin_input"
                     data-side="bottom" title="Bottom"
                     value="${cur.marginBottom}" id="mar-input-bottom">
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
        <div class="si-section si-typography-section">
          <div class="si-section-header"><span>Typography</span></div>
          <div class="si-typography-grid">
            <label class="si-type-control si-type-select">
              <select data-testid="style_inspector_panel_font_weight_select" id="font-weight-select" aria-label="Font weight">
                <option value="100" ${`${cur.fontWeight}` === "100" ? "selected" : ""}>100 - Thin</option>
                <option value="200" ${`${cur.fontWeight}` === "200" ? "selected" : ""}>200 - Extra Light</option>
                <option value="300" ${`${cur.fontWeight}` === "300" ? "selected" : ""}>300 - Light</option>
                <option value="400" ${`${cur.fontWeight}` === "400" || !cur.fontWeight ? "selected" : ""}>400 - Normal</option>
                <option value="500" ${`${cur.fontWeight}` === "500" ? "selected" : ""}>500 - Medium</option>
                <option value="600" ${`${cur.fontWeight}` === "600" ? "selected" : ""}>600 - Semi Bold</option>
                <option value="700" ${`${cur.fontWeight}` === "700" ? "selected" : ""}>700 - Bold</option>
                <option value="800" ${`${cur.fontWeight}` === "800" ? "selected" : ""}>800 - Extra Bold</option>
                <option value="900" ${`${cur.fontWeight}` === "900" ? "selected" : ""}>900 - Black</option>
              </select>
              ${siIcon("ChevronDown", 13)}
            </label>
            <label class="si-type-control si-type-value si-type-fontsize">
              <span class="si-type-glyph">AA</span>
              <input type="number" data-testid="style_inspector_panel_font_size_input" value="${cur.fontSize}" id="font-size-input" aria-label="Font size">
              <select id="font-size-preset" aria-label="Font size preset" class="si-fontsize-preset">
                <option value="">\u2014</option>
                ${[10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128].map((s) => `<option value="${s}" ${Number(cur.fontSize) === s ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </label>
            <label class="si-type-control si-type-value"><input type="color" class="si-color-swatch" value="${rgbToHex(cur.color, "#ffffff")}" id="color-picker" title="Pick text color"><input type="text" data-testid="style_inspector_panel_color_input" value="${escapeHtml(cur.color)}" id="color-input" aria-label="Text color"></label>
            <label class="si-type-control si-type-value"><span class="si-type-glyph si-type-underlined">A</span><input type="number" step="0.05" data-testid="style_inspector_panel_line_height_input" value="${cur.lineHeight}" id="line-height-input" aria-label="Line height"><span class="si-type-dash">\u2014</span></label>
            <div class="si-type-control si-type-align" role="group" aria-label="Text alignment">
              ${["left", "center", "right", "justify"].map((align) => `<button type="button" class="si-type-icon-btn ${cur.textAlign === align || !cur.textAlign && align === "left" ? "active" : ""}" data-align="${align}" title="Align ${align}">${siIcon(`Align${align[0].toUpperCase()}${align.slice(1)}`, 15)}</button>`).join("")}
            </div>
            <label class="si-type-control si-type-value"><span class="si-type-glyph">|A|</span><input type="number" step="0.1" value="${cur.letterSpacing}" id="letter-spacing-input" aria-label="Letter spacing"><span>em</span></label>
            <label class="si-type-control si-type-transform"><span class="si-type-glyph">Aa</span><select data-testid="style_inspector_panel_text_transform_select" id="text-transform-select" aria-label="Text transform"><option value="none" ${cur.textTransform === "none" || !cur.textTransform ? "selected" : ""}>Normal</option><option value="uppercase" ${cur.textTransform === "uppercase" ? "selected" : ""}>Uppercase</option><option value="lowercase" ${cur.textTransform === "lowercase" ? "selected" : ""}>Lowercase</option><option value="capitalize" ${cur.textTransform === "capitalize" ? "selected" : ""}>Capitalize</option></select></label>
          </div>
        </div>

        <!-- Colors Section -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Colors</span>
          </div>

          <div class="si-control-row">
            <span class="si-control-label">Background</span>
            <div class="si-color-picker-wrap">
              <input type="color" class="si-color-swatch" value="${rgbToHex(cur.backgroundColor, "#1e293b")}" id="bg-color-picker" title="Pick background color">
              <input type="text" class="si-input-text"
                     data-testid="style_inspector_panel_bg_color_input"
                     value="${escapeHtml(cur.backgroundColor)}" id="bg-color-input" placeholder="transparent or #ffffff">
            </div>
          </div>
        </div>

        <!-- Context & Notes Field -->
        <div class="si-section">
          <div class="si-section-header">
            <span>Element Notes (Optional)</span>
          </div>
          <textarea class="si-textarea" id="si-notes-input"
                    placeholder="e.g. Instance of repeated card, desktop breakpoint only...">${escapeHtml(item.notes || "")}</textarea>
        </div>

        <!-- Element-Level Actions -->
        <div class="si-action-row">
          <button class="si-btn si-btn-danger" data-testid="style_inspector_panel_reset_button" id="si-reset-item-btn">
            Reset
          </button>
          <button class="si-btn si-btn-secondary" data-testid="style_inspector_panel_copy_item_button" id="si-copy-item-btn">
            Copy Item MD
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
            this.showToast("Export copied to clipboard!");
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
            this.showToast("Item markdown copied to clipboard!");
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
      bindSync(null, "#font-size-input", "fontSize");
      const fontSizePreset = this.panel.querySelector("#font-size-preset");
      if (fontSizePreset) {
        fontSizePreset.onchange = (event) => {
          if (!event.target.value) return;
          const fontSizeInput = this.panel.querySelector("#font-size-input");
          if (fontSizeInput) fontSizeInput.value = event.target.value;
          this.state.updateStyle(activeItem.id, "fontSize", parseFloat(event.target.value));
        };
      }
      bindSync(null, "#line-height-input", "lineHeight");
      bindSync(null, "#letter-spacing-input", "letterSpacing");
      this.panel.querySelectorAll("[data-align]").forEach((button) => {
        button.onclick = () => {
          const align = button.getAttribute("data-align");
          this.panel.querySelectorAll("[data-align]").forEach((item) => item.classList.toggle("active", item === button));
          this.state.updateStyle(activeItem.id, "textAlign", align);
        };
      });
      const weightSelect = this.panel.querySelector("#font-weight-select");
      if (weightSelect) {
        weightSelect.onchange = (e) => {
          this.state.updateStyle(activeItem.id, "fontWeight", e.target.value);
        };
      }
      const transformSelect = this.panel.querySelector("#text-transform-select");
      if (transformSelect) {
        transformSelect.onchange = (e) => {
          this.state.updateStyle(activeItem.id, "textTransform", e.target.value);
        };
      }
      const bindColor = (pickerId, inputId, prop) => {
        const picker = this.panel.querySelector(pickerId);
        const input = this.panel.querySelector(inputId);
        if (!input) return;
        if (picker) {
          picker.oninput = (e) => {
            input.value = e.target.value;
            this.state.updateStyle(activeItem.id, prop, e.target.value);
          };
        }
        input.oninput = (e) => {
          const val = e.target.value.trim();
          if (picker && val.startsWith("#") && (val.length === 7 || val.length === 4)) {
            picker.value = rgbToHex(val, picker.value);
          }
          this.state.updateStyle(activeItem.id, prop, val);
        };
      };
      bindColor("#color-picker", "#color-input", "color");
      bindColor("#bg-color-picker", "#bg-color-input", "backgroundColor");
    }
    _initDraggable() {
      const header = this.panel.querySelector(".si-panel-header");
      if (!header) return;
      header.style.cursor = "grab";
      const onPointerDown = (e) => {
        if (e.target.closest("button") || e.target.closest(".si-btn-icon")) return;
        e.preventDefault();
        header.style.cursor = "grabbing";
        const rect = this.panel.getBoundingClientRect();
        const shiftX = e.clientX - rect.left;
        const shiftY = e.clientY - rect.top;
        const onPointerMove = (moveEvt) => {
          let newLeft = moveEvt.clientX - shiftX;
          let newTop = moveEvt.clientY - shiftY;
          const panelWidth = this.panel.offsetWidth || 380;
          const maxLeft = Math.max(10, window.innerWidth - panelWidth - 10);
          const maxTop = Math.max(10, window.innerHeight - 60);
          newLeft = Math.max(10, Math.min(maxLeft, newLeft));
          newTop = Math.max(10, Math.min(maxTop, newTop));
          this._panelPosition = { left: newLeft, top: newTop };
          this.panel.style.right = "auto";
          this.panel.style.left = `${newLeft}px`;
          this.panel.style.top = `${newTop}px`;
        };
        const onPointerUp = () => {
          header.style.cursor = "grab";
          window.removeEventListener("pointermove", onPointerMove, true);
          window.removeEventListener("pointerup", onPointerUp, true);
          window.removeEventListener("pointercancel", onPointerUp, true);
        };
        window.addEventListener("pointermove", onPointerMove, true);
        window.addEventListener("pointerup", onPointerUp, true);
        window.addEventListener("pointercancel", onPointerUp, true);
      };
      header.onpointerdown = onPointerDown;
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
/*! Bundled license information:

lucide/dist/esm/defaultAttributes.mjs:
lucide/dist/esm/createElement.mjs:
lucide/dist/esm/icons/bold.mjs:
lucide/dist/esm/icons/check.mjs:
lucide/dist/esm/icons/chevron-down.mjs:
lucide/dist/esm/icons/clipboard.mjs:
lucide/dist/esm/icons/copy.mjs:
lucide/dist/esm/icons/maximize-2.mjs:
lucide/dist/esm/icons/minimize-2.mjs:
lucide/dist/esm/icons/palette.mjs:
lucide/dist/esm/icons/pin.mjs:
lucide/dist/esm/icons/rotate-ccw.mjs:
lucide/dist/esm/icons/strikethrough.mjs:
lucide/dist/esm/icons/text-align-center.mjs:
lucide/dist/esm/icons/text-align-end.mjs:
lucide/dist/esm/icons/text-align-justify.mjs:
lucide/dist/esm/icons/text-align-start.mjs:
lucide/dist/esm/icons/underline.mjs:
lucide/dist/esm/icons/x.mjs:
lucide/dist/esm/icons/zap.mjs:
lucide/dist/esm/lucide.mjs:
  (**
   * @license lucide v1.42.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
