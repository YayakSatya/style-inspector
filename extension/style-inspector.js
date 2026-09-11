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
    const testId2 = element.getAttribute("data-testid");
    if (testId2 && testId2.trim()) {
      return `[data-testid="${testId2.trim()}"]`;
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
      const testId2 = curr.getAttribute("data-testid");
      if (testId2 && testId2.trim()) {
        path.unshift(`[data-testid="${testId2.trim()}"]`);
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
  function isValidId(id9) {
    return Boolean(id9 && typeof id9 === "string" && !/\s/.test(id9) && !/^[0-9]/.test(id9));
  }
  function getElementLabel(element) {
    if (!element || element.nodeType !== 1) return "";
    const tag = element.tagName.toLowerCase();
    const testId2 = element.getAttribute("data-testid");
    if (testId2) {
      return `<${tag} [${testId2}]>`;
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

  // src/core/css-value.js
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
  function parseNumber(val, fallback = 0) {
    if (typeof val === "number") return Number.isFinite(val) ? val : fallback;
    if (!val || typeof val !== "string") return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : Math.round(num * 1e3) / 1e3;
  }
  var EXPORT_UNITS = ["px", "rem", "em"];
  function trimNumber(value) {
    return `${Math.round(value * 1e4) / 1e4}`;
  }
  function formatLength(value, unit, context = {}) {
    const px = typeof value === "number" ? value : parseFloat(value);
    if (!Number.isFinite(px)) return `${value}`;
    if (unit !== "rem" && unit !== "em") {
      return `${trimNumber(px)}px`;
    }
    const basis = context.basis;
    if (!Number.isFinite(basis) || basis <= 0) {
      return `${trimNumber(px)}px`;
    }
    if (px === 0) return "0";
    return `${trimNumber(px / basis)}${unit}`;
  }
  function splitTopLevel(value, separator) {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of value) {
      if (char === "(") depth += 1;
      else if (char === ")") depth -= 1;
      if (char === separator && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }
  function isColorToken(token) {
    return /^(#|rgba?\(|hsla?\(|color\(|currentcolor$|transparent$)/i.test(token);
  }
  function normalizeSingleShadow(input) {
    let inset = false;
    let color = null;
    const lengths = [];
    for (const token of splitTopLevel(input, " ")) {
      if (token.toLowerCase() === "inset") {
        inset = true;
      } else if (isColorToken(token) && !color) {
        color = token.replace(/\s+/g, "");
      } else {
        lengths.push(token === "0" ? "0px" : token);
      }
    }
    if (lengths.length === 4 && parseFloat(lengths[3]) === 0) {
      lengths.pop();
    }
    const parts = [];
    if (inset) parts.push("inset");
    parts.push(...lengths);
    if (color) parts.push(color);
    return parts.join(" ");
  }
  function normalizeBoxShadow(value) {
    if (!value || typeof value !== "string") return "none";
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "none") return "none";
    return splitTopLevel(trimmed, ",").map(normalizeSingleShadow).join(", ");
  }
  var LENGTH_UNITS = ["px", "%", "rem", "em", "vw", "vh"];
  function splitLength(value) {
    const str = `${value === null || value === void 0 ? "" : value}`.trim();
    if (!str) return { number: "", unit: "", keyword: false, custom: false };
    const match = str.match(/^(-?\d*\.?\d+)\s*([a-z%]*)$/i);
    if (match) {
      const unit = match[2].toLowerCase();
      if (!unit || LENGTH_UNITS.includes(unit)) {
        return { number: match[1], unit: unit || "px", keyword: false, custom: false };
      }
    }
    if (/^[a-z][a-z-]*$/i.test(str)) {
      return { number: "", unit: str.toLowerCase(), keyword: true, custom: false };
    }
    return { number: str, unit: "", keyword: false, custom: true };
  }
  function joinLength(number, unit) {
    if (unit && !LENGTH_UNITS.includes(unit)) return unit;
    const trimmed = `${number === null || number === void 0 ? "" : number}`.trim();
    if (!trimmed) return "";
    if (!/^-?\d*\.?\d+$/.test(trimmed)) return trimmed;
    return `${trimmed}${unit || "px"}`;
  }

  // src/core/schema.js
  var SHORTHAND_GROUPS = [
    {
      name: "padding",
      css: "padding",
      keys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
      // The longhand CSS property for each key. Note this is not always
      // `<shorthand>-<side>`: border-radius corners are `border-top-left-radius`.
      sideCss: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
      sides: ["top", "right", "bottom", "left"],
      allProp: "paddingAll",
      linkFlag: "linkPadding",
      group: "spacing"
    },
    {
      name: "margin",
      css: "margin",
      keys: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
      sideCss: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
      sides: ["top", "right", "bottom", "left"],
      allProp: "marginAll",
      linkFlag: "linkMargin",
      group: "spacing"
    },
    {
      name: "border-radius",
      css: "border-radius",
      keys: [
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderBottomRightRadius",
        "borderBottomLeftRadius"
      ],
      sideCss: [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius"
      ],
      sides: ["top-left", "top-right", "bottom-right", "bottom-left"],
      allProp: "borderRadiusAll",
      linkFlag: "linkRadius",
      group: "border"
    }
  ];
  var SCHEMA = [
    // --- Four-sided groups (padding, margin, border-radius) ---
    ...SHORTHAND_GROUPS.flatMap(
      (group) => group.keys.map((key, index) => ({
        key,
        css: group.sideCss[index],
        type: "length",
        group: group.group,
        default: 0,
        shorthand: group.name,
        read: (computed) => parsePx(computed[toCamel(group.sideCss[index])], 0)
      }))
    ),
    // --- Spacing ---
    {
      key: "gap",
      css: "gap",
      type: "length",
      group: "spacing",
      default: 0,
      // Writing `gap` sets both axes, so both must be snapshotted to restore.
      extraCss: ["row-gap", "column-gap"],
      read: (computed) => {
        const rowGap = parsePx(computed.rowGap, 0);
        const colGap = parsePx(computed.columnGap, 0);
        return rowGap || colGap || parsePx(computed.gap, 0);
      }
    },
    // --- Typography ---
    {
      key: "fontSize",
      css: "font-size",
      type: "length",
      group: "typography",
      default: 16,
      read: (computed) => parsePx(computed.fontSize, 16)
    },
    {
      // line-height is read by `readElementStyles` itself, because a value of
      // `normal` has to be recorded separately in `lineHeightSource`.
      key: "lineHeight",
      css: "line-height",
      type: "number",
      group: "typography",
      default: 1.4,
      read: null
    },
    {
      key: "letterSpacing",
      css: "letter-spacing",
      type: "length",
      group: "typography",
      default: 0,
      read: (computed) => computed.letterSpacing && computed.letterSpacing !== "normal" ? parsePx(computed.letterSpacing, 0) : 0
    },
    {
      key: "fontWeight",
      css: "font-weight",
      type: "keyword",
      group: "typography",
      default: "400",
      read: (computed) => {
        let weight = computed.fontWeight ? `${computed.fontWeight}` : "400";
        if (weight === "normal") weight = "400";
        if (weight === "bold") weight = "700";
        return weight;
      }
    },
    {
      key: "textTransform",
      css: "text-transform",
      type: "keyword",
      group: "typography",
      default: "none",
      read: (computed) => computed.textTransform || "none"
    },
    {
      key: "color",
      css: "color",
      type: "color",
      group: "color",
      default: "rgb(0, 0, 0)",
      read: (computed) => computed.color || "rgb(0, 0, 0)"
    },
    {
      key: "backgroundColor",
      css: "background-color",
      type: "color",
      group: "color",
      default: "transparent",
      read: (computed) => computed.backgroundColor || "transparent"
    },
    {
      key: "textAlign",
      css: "text-align",
      type: "keyword",
      group: "typography",
      default: "left",
      read: (computed) => computed.textAlign || "left"
    },
    {
      key: "fontFamily",
      css: "font-family",
      type: "raw",
      group: "typography",
      default: "",
      read: (computed) => computed.fontFamily || ""
    },
    // --- Border ---
    {
      key: "borderWidth",
      css: "border-width",
      type: "length",
      group: "border",
      default: 0,
      extraCss: ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"],
      read: (computed) => parsePx(computed.borderTopWidth, 0)
    },
    {
      key: "borderStyle",
      css: "border-style",
      type: "keyword",
      group: "border",
      default: "none",
      extraCss: ["border-top-style", "border-right-style", "border-bottom-style", "border-left-style"],
      read: (computed) => computed.borderTopStyle || "none"
    },
    {
      key: "borderColor",
      css: "border-color",
      type: "color",
      group: "border",
      default: "rgb(0, 0, 0)",
      extraCss: ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
      read: (computed) => computed.borderTopColor || "rgb(0, 0, 0)"
    },
    // --- Effects ---
    {
      key: "boxShadow",
      css: "box-shadow",
      type: "raw",
      group: "effects",
      default: "none",
      // Normalized on read so the field shows the authoring form rather than the
      // computed `rgba(...) 0px 2px 8px 0px`.
      read: (computed) => normalizeBoxShadow(computed.boxShadow)
    },
    {
      key: "opacity",
      css: "opacity",
      type: "number",
      group: "effects",
      default: 1,
      read: (computed) => parseNumber(computed.opacity, 1)
    },
    // --- Size ---
    // Raw, not length: these routinely hold `auto`, a percentage, or a clamp().
    {
      key: "width",
      css: "width",
      type: "raw",
      group: "size",
      default: "auto",
      read: (computed) => computed.width || "auto"
    },
    {
      key: "height",
      css: "height",
      type: "raw",
      group: "size",
      default: "auto",
      read: (computed) => computed.height || "auto"
    },
    {
      key: "maxWidth",
      css: "max-width",
      type: "raw",
      group: "size",
      default: "none",
      read: (computed) => computed.maxWidth || "none"
    },
    // --- Layout ---
    {
      key: "display",
      css: "display",
      type: "keyword",
      group: "layout",
      default: "block",
      read: (computed) => computed.display || "block"
    },
    {
      key: "flexDirection",
      css: "flex-direction",
      type: "keyword",
      group: "layout",
      default: "row",
      read: (computed) => computed.flexDirection || "row"
    },
    {
      key: "flexWrap",
      css: "flex-wrap",
      type: "keyword",
      group: "layout",
      default: "nowrap",
      read: (computed) => computed.flexWrap || "nowrap"
    },
    {
      key: "justifyContent",
      css: "justify-content",
      type: "keyword",
      group: "layout",
      default: "flex-start",
      read: (computed) => computed.justifyContent || "flex-start"
    },
    {
      key: "alignItems",
      css: "align-items",
      type: "keyword",
      group: "layout",
      default: "stretch",
      read: (computed) => computed.alignItems || "stretch"
    },
    // --- Self alignment (the align rail) ---
    // These place the element inside *its parent's* layout, so they only take
    // effect when that parent is a flex or grid container. The rail says as much
    // rather than offering controls that quietly do nothing.
    {
      key: "justifySelf",
      css: "justify-self",
      type: "keyword",
      group: "layout",
      default: "auto",
      read: (computed) => computed.justifySelf || "auto"
    },
    {
      key: "alignSelf",
      css: "align-self",
      type: "keyword",
      group: "layout",
      default: "auto",
      read: (computed) => computed.alignSelf || "auto"
    }
  ];
  function toCamel(dashed) {
    return dashed.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  }
  var byKey = new Map(SCHEMA.map((descriptor) => [descriptor.key, descriptor]));
  function getDescriptor(key) {
    return byKey.get(key);
  }
  function isTextualProperty(key) {
    const descriptor = byKey.get(key);
    if (!descriptor) return false;
    return descriptor.type !== "length" && descriptor.type !== "number";
  }
  function inlineCssProperties() {
    const props = /* @__PURE__ */ new Set();
    for (const descriptor of SCHEMA) {
      props.add(descriptor.css);
      for (const extra of descriptor.extraCss || []) {
        props.add(extra);
      }
    }
    return Array.from(props);
  }
  function emBasis(descriptor, context) {
    return descriptor.key === "fontSize" ? context.parentFontSize : context.elementFontSize;
  }
  function formatValue(descriptor, value, context = {}) {
    if (!descriptor) return `${value}`;
    if (descriptor.type !== "length") return `${value}`;
    const unit = context.unit || "px";
    const basis = unit === "rem" ? context.rootFontSize : emBasis(descriptor, context);
    return formatLength(value, unit, { basis });
  }

  // src/core/styles.js
  var DEFAULT_LINE_HEIGHT = 1.4;
  function readLineHeight(computed, fontSize) {
    const raw = computed.lineHeight;
    if (!raw || raw === "normal") {
      return { lineHeight: DEFAULT_LINE_HEIGHT, lineHeightSource: "normal" };
    }
    if (raw.endsWith("px")) {
      const lhPx = parsePx(raw, 0);
      if (fontSize > 0) {
        return {
          lineHeight: Math.round(lhPx / fontSize * 100) / 100,
          lineHeightSource: "ratio"
        };
      }
      return { lineHeight: lhPx, lineHeightSource: "px" };
    }
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? { lineHeight: parsed, lineHeightSource: "ratio" } : { lineHeight: DEFAULT_LINE_HEIGHT, lineHeightSource: "normal" };
  }
  function readElementStyles(element, win = typeof window !== "undefined" ? window : null) {
    if (!element || !win) {
      return createDefaultStyles();
    }
    const computed = win.getComputedStyle(element);
    const record = {};
    for (const descriptor of SCHEMA) {
      if (descriptor.read) {
        record[descriptor.key] = descriptor.read(computed);
      }
    }
    const { lineHeight, lineHeightSource } = readLineHeight(computed, record.fontSize);
    record.lineHeight = lineHeight;
    record.lineHeightSource = lineHeightSource;
    return record;
  }
  function readUnitContext(element, win = typeof window !== "undefined" ? window : null) {
    const fallback = { rootFontSize: 16, parentFontSize: 16 };
    if (!element || !win || typeof win.getComputedStyle !== "function") return fallback;
    const doc = element.ownerDocument || win.document;
    const root = doc && doc.documentElement;
    const parent = element.parentElement;
    return {
      rootFontSize: root ? parsePx(win.getComputedStyle(root).fontSize, 16) : 16,
      parentFontSize: parent ? parsePx(win.getComputedStyle(parent).fontSize, 16) : 16
    };
  }
  function createDefaultStyles() {
    const record = {};
    for (const descriptor of SCHEMA) {
      record[descriptor.key] = descriptor.default;
    }
    record.lineHeightSource = "normal";
    return record;
  }
  var originalInlineStyles = /* @__PURE__ */ new WeakMap();
  function captureOriginalInline(element) {
    if (!element || originalInlineStyles.has(element)) return;
    const saved = {};
    for (const prop of inlineCssProperties()) {
      saved[prop] = element.style.getPropertyValue(prop);
    }
    originalInlineStyles.set(element, saved);
  }
  function applyStyleProperty(element, prop, val, unit = "px") {
    if (!element || !element.style) return;
    const descriptor = getDescriptor(prop);
    if (!descriptor) return;
    captureOriginalInline(element);
    const formatted = descriptor.type === "length" ? `${val}${unit}` : `${val}`;
    element.style.setProperty(descriptor.css, formatted);
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
  function pushShorthandDiff(diffs, group, baseline, current, beforeContext, afterContext) {
    const { keys, sideCss, css } = group;
    const changed = keys.some((key) => baseline[key] !== current[key]);
    if (!changed) return;
    const allSame = (record) => keys.every((key) => record[key] === record[keys[0]]);
    const descriptor = getDescriptor(keys[0]);
    if (allSame(baseline) && allSame(current)) {
      diffs.push({
        property: css,
        before: formatValue(descriptor, baseline[keys[0]], beforeContext),
        after: formatValue(descriptor, current[keys[0]], afterContext)
      });
      return;
    }
    keys.forEach((key, index) => {
      if (baseline[key] === current[key]) return;
      diffs.push({
        property: sideCss[index],
        before: formatValue(descriptor, baseline[key], beforeContext),
        after: formatValue(descriptor, current[key], afterContext)
      });
    });
  }
  function hasChanged(descriptor, baseline, current) {
    const before = baseline[descriptor.key];
    const after = current[descriptor.key];
    if (descriptor.type === "length" || descriptor.type === "number") {
      return before !== after;
    }
    return Boolean(before) && Boolean(after) && `${before}` !== `${after}`;
  }
  function computeStyleDiff(baseline, current, context = {}) {
    const diffs = [];
    const before = { ...context, elementFontSize: baseline.fontSize };
    const after = { ...context, elementFontSize: current.fontSize };
    for (const group of SHORTHAND_GROUPS) {
      pushShorthandDiff(diffs, group, baseline, current, before, after);
    }
    for (const descriptor of SCHEMA) {
      if (descriptor.shorthand) continue;
      if (descriptor.key === "lineHeight") {
        if (baseline.lineHeight !== current.lineHeight) {
          const before2 = baseline.lineHeightSource === "normal" ? "normal" : `${baseline.lineHeight}${baseline.lineHeightSource === "px" ? "px" : ""}`;
          diffs.push({ property: "line-height", before: before2, after: `${current.lineHeight}` });
        }
        continue;
      }
      if (!hasChanged(descriptor, baseline, current)) continue;
      diffs.push({
        property: descriptor.css,
        before: formatValue(descriptor, baseline[descriptor.key], before),
        after: formatValue(descriptor, current[descriptor.key], after)
      });
    }
    return diffs;
  }

  // src/core/text.js
  var originalText = /* @__PURE__ */ new WeakMap();
  function splitWhitespace(raw) {
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw || "");
    if (!match) return { prefix: "", text: raw || "", suffix: "" };
    return { prefix: match[1], text: match[2], suffix: match[3] };
  }
  function meaningfulTextNodes(element) {
    return childNodesOf(element).filter(
      (node) => node.nodeType === 3 && node.nodeValue && node.nodeValue.trim() !== ""
    );
  }
  function childNodesOf(element) {
    return element && element.childNodes ? Array.from(element.childNodes) : [];
  }
  function readElementText(element) {
    const empty = {
      text: "",
      editable: false,
      mode: "none",
      node: null,
      prefix: "",
      suffix: "",
      reason: ""
    };
    if (!element || element.nodeType !== 1) {
      return { ...empty, reason: "Not an element." };
    }
    const hasElementChildren = childNodesOf(element).some((node) => node.nodeType === 1);
    if (!hasElementChildren) {
      const { prefix, text, suffix } = splitWhitespace(element.textContent || "");
      return { text, editable: true, mode: "textContent", node: null, prefix, suffix, reason: "" };
    }
    const textNodes = meaningfulTextNodes(element);
    if (textNodes.length === 1) {
      const node = textNodes[0];
      const { prefix, text, suffix } = splitWhitespace(node.nodeValue || "");
      return { text, editable: true, mode: "textNode", node, prefix, suffix, reason: "" };
    }
    if (textNodes.length === 0) {
      return {
        ...empty,
        reason: "This element only contains other elements \u2014 pin the one holding the text."
      };
    }
    return {
      ...empty,
      reason: `This element has ${textNodes.length} separate text runs \u2014 pin one of its children instead.`
    };
  }
  function captureOriginalText(element, record) {
    if (!element || originalText.has(element)) return;
    if (record.textMode === "textNode" && record.textNode) {
      originalText.set(element, {
        mode: "textNode",
        node: record.textNode,
        value: record.textNode.nodeValue || ""
      });
    } else {
      originalText.set(element, {
        mode: "textContent",
        node: null,
        value: element.textContent || ""
      });
    }
  }
  function applyElementText(element, record, value) {
    if (!element || !record) return false;
    if (record.textMode !== "textContent" && record.textMode !== "textNode") return false;
    captureOriginalText(element, record);
    const next = `${record.textPrefix || ""}${value}${record.textSuffix || ""}`;
    if (record.textMode === "textNode") {
      if (!record.textNode) return false;
      record.textNode.nodeValue = next;
      return true;
    }
    element.textContent = next;
    return true;
  }
  function resetElementText(element) {
    if (!element || !originalText.has(element)) return;
    const saved = originalText.get(element);
    if (saved.mode === "textNode" && saved.node) {
      saved.node.nodeValue = saved.value;
    } else {
      element.textContent = saved.value;
    }
    originalText.delete(element);
  }
  function computeTextDiff(item) {
    if (!item) return null;
    const before = item.baselineText || "";
    const after = item.currentText || "";
    return before === after ? null : { before, after };
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
      this.exportFormat = "markdown";
      this.exportUnit = "px";
      this.customInstruction = "";
    }
    /**
     * @param {'markdown'|'css'|'json'} format
     */
    setExportFormat(format) {
      this.exportFormat = format;
      this.emit("stateUpdated", this);
    }
    /**
     * @param {'px'|'rem'|'em'} unit
     */
    setExportUnit(unit) {
      this.exportUnit = unit;
      this.emit("stateUpdated", this);
    }
    /**
     * Overrides the instruction line appended to an export. Empty means default.
     * @param {string} instruction
     */
    setCustomInstruction(instruction) {
      this.customInstruction = instruction;
      this.emit("stateUpdated", this);
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
      for (const [id10, item2] of this.pinnedItems.entries()) {
        if (item2.element === element) {
          this.activePinnedId = id10;
          this.isPanelOpen = true;
          this.emit("stateUpdated", this);
          return id10;
        }
      }
      this._idCounter += 1;
      const id9 = `pinned_${this._idCounter}`;
      const selector = getElementSelector(element);
      const label = getElementLabel(element);
      const baseline = readElementStyles(element);
      const current = { ...baseline };
      const text = readElementText(element);
      const unitContext2 = readUnitContext(element);
      const item = {
        id: id9,
        element,
        selector,
        label,
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
        rootFontSize: unitContext2.rootFontSize,
        parentFontSize: unitContext2.parentFontSize,
        notes: "",
        linkPadding: true,
        linkMargin: true,
        linkRadius: true,
        timestamp: Date.now()
      };
      this.pinnedItems.set(id9, item);
      this.activePinnedId = id9;
      this.isPanelOpen = true;
      this.emit("pinnedChanged", { item, action: "added" });
      this.emit("stateUpdated", this);
      return id9;
    }
    /**
     * Unpins an element from the session.
     * @param {string} id
     */
    unpinElement(id9) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      this.pinnedItems.delete(id9);
      if (this.activePinnedId === id9) {
        const keys = Array.from(this.pinnedItems.keys());
        this.activePinnedId = keys.length > 0 ? keys[keys.length - 1] : null;
      }
      this.emit("pinnedChanged", { item, action: "removed" });
      this.emit("stateUpdated", this);
    }
    setActivePinnedId(id9) {
      if (this.pinnedItems.has(id9)) {
        this.activePinnedId = id9;
        this.emit("stateUpdated", this);
      }
    }
    /**
     * Updates a style property for a pinned element.
     * @param {string} id
     * @param {string} prop
     * @param {number|string} value
     */
    updateStyle(id9, prop, value) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      const numVal = typeof value === "number" ? value : parseFloat(value) || 0;
      const linkedGroup = SHORTHAND_GROUPS.find(
        (group) => (
          // The combined control always writes all four sides — it only exists
          // while the group is linked.
          prop === group.allProp || item[group.linkFlag] && group.keys.includes(prop)
        )
      );
      if (linkedGroup) {
        for (const key of linkedGroup.keys) {
          item.current[key] = numVal;
          applyStyleProperty(item.element, key, numVal, "px");
        }
      } else {
        const textual = isTextualProperty(prop);
        item.current[prop] = textual ? `${value}` : numVal;
        if (prop === "lineHeight") {
          item.current.lineHeightSource = "ratio";
        }
        applyStyleProperty(item.element, prop, item.current[prop], "px");
      }
      this.emit("styleChanged", { item, prop, value });
      this.emit("stateUpdated", this);
    }
    /**
     * Replaces the visible text of a pinned element.
     * @param {string} id
     * @param {string} text
     */
    setText(id9, text) {
      const item = this.pinnedItems.get(id9);
      if (!item || !item.textEditable) return;
      item.currentText = text;
      applyElementText(item.element, item, text);
      this.emit("styleChanged", { item, textChanged: true });
      this.emit("stateUpdated", this);
    }
    /**
     * Restores a pinned element's text without touching its styles.
     * @param {string} id
     */
    resetText(id9) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      resetElementText(item.element);
      item.currentText = item.baselineText;
      this.emit("styleChanged", { item, textChanged: true });
      this.emit("stateUpdated", this);
    }
    setNotes(id9, notes) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      item.notes = notes;
      this.emit("stateUpdated", this);
    }
    /**
     * Toggles the "link all sides" switch for a four-sided group.
     * @param {string} id
     * @param {string} groupName - 'padding', 'margin', or 'border-radius'
     * @param {boolean} linked
     */
    setLinked(id9, groupName, linked) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      const group = SHORTHAND_GROUPS.find((candidate) => candidate.name === groupName);
      if (!group) return;
      item[group.linkFlag] = Boolean(linked);
      this.emit("stateUpdated", this);
    }
    setLinkPadding(id9, linked) {
      this.setLinked(id9, "padding", linked);
    }
    setLinkMargin(id9, linked) {
      this.setLinked(id9, "margin", linked);
    }
    resetElement(id9) {
      const item = this.pinnedItems.get(id9);
      if (!item) return;
      resetElementStyles(item.element);
      resetElementText(item.element);
      item.current = { ...item.baseline };
      item.currentText = item.baselineText;
      this.emit("styleChanged", { item, reset: true });
      this.emit("stateUpdated", this);
    }
    /**
     * Restores every pinned element to its baseline while keeping the pins,
     * so the session survives the reset.
     */
    resetAllStyles() {
      for (const item of this.pinnedItems.values()) {
        resetElementStyles(item.element);
        resetElementText(item.element);
        item.current = { ...item.baseline };
        item.currentText = item.baselineText;
        this.emit("styleChanged", { item, reset: true });
      }
      this.emit("stateUpdated", this);
    }
    /**
     * Restores every pinned element and then discards the whole session.
     */
    clearAll() {
      for (const item of this.pinnedItems.values()) {
        resetElementStyles(item.element);
        resetElementText(item.element);
      }
      this.pinnedItems.clear();
      this.activePinnedId = null;
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: var(--si-text);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;

  /* Surfaces, back to front */
  --si-bg: #0f0f0f;
  --si-bg-raised: #161616;
  --si-fill: #242424;
  --si-fill-hover: #2c2c2c;
  --si-fill-active: #333333;
  --si-line: #2a2a2a;

  /* Text */
  --si-text: #ededed;
  --si-text-dim: #999999;
  --si-text-mute: #6b6b6b;

  /* Accents */
  --si-accent: #0099ff;
  --si-accent-hover: #33adff;
  --si-accent-soft: rgba(0, 153, 255, 0.15);
  --si-danger: #ff4d4d;
  --si-danger-soft: rgba(255, 77, 77, 0.1);
  --si-on-accent: #ffffff;

  /*
   * Overlay hues stay the familiar DevTools ones \u2014 cyan for the hovered box,
   * amber for a pinned one, orange/green for the margin and padding bands \u2014 so
   * they read the same way as the browser's own inspector. Boxes are outline
   * only (no soft fill): a tint over the element would falsify the very colors
   * the user is tuning.
   */
  --si-hover: #06b6d4;
  --si-hover-tag: #0891b2;
  --si-pin: #f59e0b;
  --si-pin-tag: #d97706;
  --si-margin-band: rgba(246, 178, 107, 0.45);
  --si-padding-band: rgba(147, 196, 125, 0.45);
  --si-overlay-text: #ffffff;
  --si-outline-w: 2px;

  --si-neutral: #ffffff;
  --si-neutral-hover: #d4d4d4;

  /* Shape and metrics */
  --si-r: 8px;
  --si-r-sm: 6px;
  --si-r-pill: 9999px;
  --si-h: 36px;
  --si-label-w: 100px;
  --si-gap: 8px;
  --si-pad: 16px;
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
  background: var(--si-bg);
  border: 1px solid var(--si-line);
  border-radius: var(--si-r);
  padding: 6px 12px 6px 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.si-toolbar:hover {
  background: var(--si-bg-raised);
  border-color: var(--si-line);
}

.si-toolbar.active {
  background: var(--si-bg-raised);
  border-color: var(--si-accent);
}

.si-toolbar-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--si-text-mute);
  transition: background 0.2s ease;
}

.si-toolbar.active .si-toolbar-indicator {
  background: var(--si-accent);
}

.si-toolbar-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--si-text);
}

.si-toolbar-badge {
  background: var(--si-fill);
  color: var(--si-text-dim);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--si-r-sm);
}

/* Active Mode Banner */
.si-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483645;
  background: var(--si-bg-raised);
  border-bottom: 1px solid var(--si-line);
  color: var(--si-text-dim);
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
  color: var(--si-accent);
  display: flex;
  align-items: center;
}

.si-banner-keys {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  color: var(--si-text-dim);
}

.si-key {
  background: var(--si-fill);
  border: 1px solid var(--si-line);
  border-radius: var(--si-r-sm);
  padding: 1px 5px;
}

.si-banner-close {
  background: transparent;
  border: none;
  color: var(--si-text-dim);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--si-r-sm);
  font-size: 11px;
  font-weight: 600;
}
.si-banner-close:hover {
  background: var(--si-fill);
  color: var(--si-text);
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
  transition: opacity 0.1s ease-out;
}

/*
 * Overlay boxes trace the real geometry of a host element, so they keep square
 * corners on purpose: a rounded outline would misreport where the box ends.
 *
 * They carry no fill and their border is drawn *outside* the element's border
 * box (the JS side inflates the rect by --si-outline-w), so not a single pixel
 * of the element is tinted or covered \u2014 the result of a tweak stays visible
 * exactly as the page renders it.
 */
.si-hover-box {
  position: fixed !important;
  box-sizing: border-box !important;
  border: var(--si-outline-w) solid var(--si-hover);
  background: transparent;
  border-radius: 0;
  transition: all 0.05s ease-out;
  pointer-events: none !important;
  z-index: 2147483641;
}

/*
 * Box-model bands. Each band is a transparent box whose border *is* the shaded
 * region, so the highlighted area is exactly the space the property occupies.
 * They sit above the hover box so its fill does not wash them out; the hues are
 * the familiar DevTools ones (orange for margin, green for padding).
 */
.si-hover-margin,
.si-hover-padding {
  position: fixed !important;
  box-sizing: border-box !important;
  background: transparent;
  border-style: solid;
  border-width: 0;
  pointer-events: none !important;
}

.si-hover-margin {
  border-color: var(--si-margin-band);
  z-index: 2147483642;
}

.si-hover-padding {
  border-color: var(--si-padding-band);
  z-index: 2147483643;
}

.si-hover-tag {
  position: absolute;
  top: -24px;
  left: 0;
  background: var(--si-hover-tag);
  color: var(--si-overlay-text);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--si-r-sm) var(--si-r-sm) 0 0;
  white-space: nowrap;
  pointer-events: none !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.si-pinned-box {
  position: fixed !important;
  box-sizing: border-box !important;
  border: var(--si-outline-w) dashed var(--si-pin);
  background: transparent;
  border-radius: 0;
  pointer-events: none !important;
  z-index: 2147483640;
  transition: opacity 0.12s ease-out;
}

/*
 * While the user is editing a pinned element \u2014 a panel field has focus, a
 * scrub handle is being dragged, or a value just changed \u2014 its outline fades
 * out so the tweak can be judged against the untouched page. Other pins stay
 * visible, so context is not lost.
 */
.si-pinned-box.si-quiet {
  opacity: 0;
}

/* Hold H to peek at the page with every overlay hidden. */
.si-overlay-container.si-peek {
  opacity: 0;
}

.si-pinned-tag {
  position: absolute;
  top: -22px;
  left: 0;
  background: var(--si-pin-tag);
  color: var(--si-overlay-text);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--si-r-sm) var(--si-r-sm) 0 0;
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
  background: var(--si-bg);
  border: 1px solid var(--si-line);
  border-radius: var(--si-r);
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
  background: var(--si-bg-raised);
  border-bottom: 1px solid var(--si-line);
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
  font-weight: 600;
  font-size: 13px;
  color: var(--si-text);
}

.si-panel-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.si-btn-icon {
  background: transparent;
  border: none;
  color: var(--si-text-dim);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--si-r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.si-btn-icon:hover {
  background: var(--si-fill);
  color: var(--si-text);
}

/* Pinned Items Carousel / Bar */
.si-pinned-bar {
  padding: 8px 12px;
  background: var(--si-bg-raised);
  border-bottom: 1px solid var(--si-line);
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
  background: var(--si-line);
  border-radius: var(--si-r-sm);
}

.si-pinned-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  padding: 6px 10px;
  font-size: 12px;
  color: var(--si-text-dim);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.si-pinned-pill:hover {
  background: var(--si-fill-hover);
  color: var(--si-text);
}

.si-pinned-pill.active {
  background: var(--si-fill-active);
  color: var(--si-text);
  font-weight: 600;
}

.si-pinned-pill-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  font-size: 12px;
  cursor: pointer;
  padding: 0 2px;
}

.si-pinned-pill-close:hover {
  opacity: 1;
  color: var(--si-danger);
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
  background: var(--si-line);
  border-radius: var(--si-r-sm);
}

.si-target-info {
  background: var(--si-bg-raised);
  border-radius: var(--si-r);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--si-line);
}

.si-target-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.si-target-selector {
  font-size: 11px;
  color: var(--si-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}

.si-section {
  display: flex;
  flex-direction: column;
  gap: var(--si-gap);
}

/*
 * Sections are separated by a full-width hairline with breathing room either
 * side, rather than by a rule hung under each title. The panel body's own gap
 * supplies the space above the line, the padding supplies the space below.
 */
.si-section + .si-section {
  border-top: 1px solid var(--si-line);
  padding-top: var(--si-pad);
}

.si-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--si-gap);
  font-size: 14px;
  font-weight: 600;
  color: var(--si-text);
  padding-bottom: 2px;
}

.si-section-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.si-section-body {
  display: flex;
  flex-direction: column;
  gap: var(--si-gap);
}

.si-section.collapsed .si-section-body {
  display: none;
}

.si-section-toggle {
  background: transparent;
  border: none;
  color: var(--si-text-dim);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--si-r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.si-section-toggle:hover {
  background: var(--si-fill);
  color: var(--si-text);
}

/*
 * Both glyphs ship in the markup and CSS decides which one is visible, because
 * the panel applies "collapsed" after the section HTML is built.
 */
.si-section-toggle .si-toggle-open {
  display: flex;
}

.si-section-toggle .si-toggle-closed {
  display: none;
}

.si-section.collapsed .si-section-toggle .si-toggle-open {
  display: none;
}

.si-section.collapsed .si-section-toggle .si-toggle-closed {
  display: flex;
}

/*
 * A section's own action \u2014 the "Link all" switch \u2014 hides while the section is
 * folded away, since the controls it governs are not on screen to be linked.
 */
.si-section.collapsed .si-section-tools > .si-switch-label {
  display: none;
}

/* Switch */
.si-switch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: var(--si-text-dim);
}

.si-switch {
  position: relative;
  width: 28px;
  height: 16px;
  background: var(--si-fill);
  border-radius: var(--si-r-pill);
  transition: background 0.2s;
}

.si-switch.checked {
  background: var(--si-accent);
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

/*
 * The field surface. Every editable control in the panel is one of these:
 * a filled, borderless box that only shows an edge when focused. The border is
 * declared transparent rather than absent so focusing does not shift layout.
 */
.si-field,
.si-input-text,
.si-input-number,
.si-textarea,
.si-select-wrap select,
.si-type-control,
.si-spacing-pill,
.si-spacing-edge {
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 13px;
}

.si-field:hover,
.si-input-text:hover,
.si-input-number:hover,
.si-select-wrap select:hover,
.si-type-control:hover,
.si-spacing-pill:hover {
  background: var(--si-fill-hover);
}

.si-field:focus,
.si-field:focus-within,
.si-input-text:focus,
.si-input-number:focus,
.si-textarea:focus,
.si-select-wrap select:focus,
.si-type-control:focus-within,
.si-spacing-pill:focus-within,
.si-spacing-edge:focus {
  border-color: var(--si-accent);
  background: var(--si-fill);
}

/* Controls (Sliders and Inputs) */
.si-control-row {
  display: grid;
  grid-template-columns: var(--si-label-w) 1fr;
  align-items: center;
  gap: var(--si-gap);
}

.si-control-label {
  font-size: 13px;
  color: var(--si-text-dim);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Segmented control \u2014 one filled track, the current option lit */
.si-segmented {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  background: var(--si-fill);
  border-radius: var(--si-r);
  padding: 2px;
  height: var(--si-h);
  min-width: 0;
  flex: 1;
}

.si-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  background: transparent;
  border: none;
  border-radius: var(--si-r-sm);
  color: var(--si-text-dim);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  padding: 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
}

.si-segment:hover {
  color: var(--si-text);
}

.si-segment.active {
  background: var(--si-fill-active);
  color: var(--si-text);
}

/* A segmented control paired with a dropdown holding the full value list */
.si-combo-wide {
  grid-template-columns: 1fr 92px;
}

/* Align rail \u2014 self-alignment, above the first section */
.si-align-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  padding: 4px 0 12px;
  border-bottom: 1px solid var(--si-line);
}

.si-rail-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--si-r-sm);
  color: var(--si-text-mute);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.si-rail-btn:hover:not(:disabled) {
  background: var(--si-fill);
  color: var(--si-text);
}

.si-rail-btn.active {
  background: var(--si-fill-active);
  color: var(--si-text);
}

.si-rail-btn:disabled {
  cursor: default;
  opacity: 0.4;
}

.si-rail-divider {
  width: 1px;
  height: 16px;
  margin: 0 6px;
  background: var(--si-line);
  flex-shrink: 0;
}

/* A row whose control needs the full width; the label sits above it */
.si-control-row-wide {
  grid-template-columns: 1fr;
  gap: 4px;
}

/* Holds whatever the row's control is, including multi-part ones */
.si-control-field {
  display: flex;
  align-items: center;
  gap: var(--si-gap);
  min-width: 0;
}

/* Number + unit pair (Size) */
.si-combo {
  display: grid;
  grid-template-columns: 1fr 96px;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.si-combo-value:disabled {
  color: var(--si-text-mute);
  cursor: not-allowed;
}

.si-combo-unit select {
  padding-right: 24px;
}

/*
 * Drag-to-change number field. The handle is the grab target; the field beside
 * it still takes a typed value, which is why this replaced the slider pairs \u2014
 * same gesture, a third of the width, and no range ceiling.
 */
.si-scrub-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--si-text-dim);
  cursor: ew-resize;
  flex-shrink: 0;
  touch-action: none;
  user-select: none;
}

.si-scrub-handle:hover,
.si-scrub-handle.scrubbing {
  color: var(--si-accent);
}

.si-scrub-suffix {
  font-size: 11px;
  color: var(--si-text-mute);
  flex-shrink: 0;
}

.si-input-number {
  width: 58px;
  height: var(--si-h);
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 12px;
  padding: 0 10px;
  text-align: right;
  outline: none;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
  appearance: textfield;
}

.si-input-number::-webkit-inner-spin-button,
.si-input-number::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.si-input-number:focus {
  border-color: var(--si-accent);
}

/* Select in a labelled control row, with the chevron overlaid */
.si-select-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

.si-select-wrap select {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 12px;
  font-family: inherit;
  padding: 0 28px 0 10px;
  outline: none;
  cursor: pointer;
  height: var(--si-h);
  text-overflow: ellipsis;
}

.si-select-wrap select:focus {
  border-color: var(--si-accent);
}

.si-select-wrap select option {
  background: var(--si-bg-raised);
  color: var(--si-text);
}

.si-select-wrap .si-icon {
  position: absolute;
  right: 9px;
  pointer-events: none;
  color: var(--si-text-mute);
}

/*
 * A field that needs the whole row rather than a label + control pair.
 * .si-input-text carries flex:1 for use inside a flex row; here the parent is
 * not a row, so that flex-basis has to be cancelled or the input collapses to
 * zero height.
 */
.si-field-block {
  margin-top: 8px;
}

.si-field-block .si-input-text {
  flex: none;
  width: 100%;
  display: block;
}

/* Fields holding a raw CSS value read better in a monospace face */
.si-input-css {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0;
}

/* Export settings row in the footer */
.si-export-settings {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.si-export-select {
  flex: 1;
  min-width: 0;
}

.si-export-select select {
  height: var(--si-h);
  font-size: 12px;
}

.si-instruction-input {
  min-height: 62px;
  font-size: 11px;
  line-height: 1.5;
}

.si-btn-icon.active {
  background: var(--si-fill-active);
  color: var(--si-accent);
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
  border: 1px solid var(--si-line);
  width: 28px;
  height: 28px;
  border-radius: var(--si-r-sm);
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
  border-radius: var(--si-r-sm);
}

.si-input-text {
  flex: 1;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 12px;
  padding: 0 10px;
  outline: none;
  height: var(--si-h);
  min-width: 0;
}

.si-input-text:focus {
  border-color: var(--si-accent);
}

/* Typography compact grid */
.si-typography-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px;
  border-radius: var(--si-r);
}

.si-type-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  padding: 4px 10px;
  height: var(--si-h);
  font-size: 12px;
  color: var(--si-text);
  min-width: 0;
}

.si-type-control:focus-within {
  border-color: var(--si-accent);
}

.si-type-glyph {
  font-size: 11px;
  color: var(--si-text-dim);
  flex-shrink: 0;
  user-select: none;
}

.si-type-underlined {
  text-decoration: underline;
}

.si-type-dash {
  color: var(--si-text-dim);
  font-size: 11px;
}

.si-type-control input,
.si-type-control select {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--si-text);
  font-size: 12px;
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
  color: var(--si-text-dim);
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
  color: var(--si-text-dim);
  pointer-events: none;
}

.si-type-value .si-color-swatch {
  width: 16px;
  height: 16px;
  border: 1px solid var(--si-line);
  border-radius: var(--si-r-sm);
}

.si-type-align {
  padding: 0;
  gap: 0;
  border-radius: var(--si-r);
  overflow: hidden;
  border: 1px solid transparent;
}

.si-type-icon-btn {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--si-text-dim);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}

.si-type-icon-btn:hover {
  color: var(--si-text);
}

.si-type-icon-btn.active {
  background: var(--si-fill-active);
  color: var(--si-text);
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

  .si-control-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.si-type-transform select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.si-type-transform .si-icon {
  flex-shrink: 0;
  color: var(--si-text-dim);
  pointer-events: none;
}

/* Box-model spacing editor (Padding / Margin) */
.si-spacing-box {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  grid-template-rows: 32px 1fr 32px;
  gap: 6px;
  background: var(--si-bg-raised);
  border: 1px solid var(--si-line);
  border-radius: var(--si-r);
  padding: 20px 8px 8px;
  min-height: 130px;
}

.si-spacing-label {
  position: absolute;
  top: 6px;
  left: 10px;
  font-size: 10px;
  font-style: italic;
  color: var(--si-text-dim);
  pointer-events: none;
}

.si-spacing-edge {
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 12px;
  text-align: center;
  outline: none;
  width: 100%;
  -moz-appearance: textfield;
  appearance: textfield;
  font-variant-numeric: tabular-nums;
}

.si-spacing-edge::-webkit-inner-spin-button,
.si-spacing-edge::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.si-spacing-edge:focus {
  border-color: var(--si-accent);
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
  background: var(--si-bg);
  border: 1px dashed var(--si-line);
  border-radius: var(--si-r);
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

.si-spacing-row {
  display: flex;
  gap: 6px;
}

.si-spacing-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  padding: 0 10px;
  height: var(--si-h);
  min-width: 0;
  transition: background 0.15s, border-color 0.15s;
}

.si-spacing-pill:focus-within {
  border-color: var(--si-accent);
}

.si-spacing-pill .si-icon {
  flex-shrink: 0;
  color: var(--si-text-dim);
}

.si-spacing-pill .si-spacing-edge {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  text-align: left;
}

.si-spacing-pill .si-spacing-edge:focus {
  border-color: transparent;
  box-shadow: none;
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
  border-left: 1px solid var(--si-line);
  color: var(--si-text-dim);
  font-size: 11px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  padding-left: 4px;
}

.si-fontsize-preset option {
  background: var(--si-bg-raised);
  color: var(--si-text);
}

/* Notes Textarea */
.si-textarea {
  width: 100%;
  background: var(--si-fill);
  border: 1px solid transparent;
  border-radius: var(--si-r);
  color: var(--si-text);
  font-size: 12px;
  padding: 8px;
  min-height: 52px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.si-textarea:focus {
  border-color: var(--si-accent);
}

.si-textarea::placeholder {
  color: var(--si-text-mute);
}

/* Content (text) editing */
.si-text-content {
  min-height: 40px;
  font-size: 13px;
  line-height: 1.5;
}

.si-text-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  color: var(--si-text-mute);
}

.si-text-dirty {
  color: var(--si-accent);
}

.si-text-disabled {
  background: var(--si-bg-raised);
  border: 1px dashed var(--si-line);
  border-radius: var(--si-r);
  color: var(--si-text-mute);
  font-size: 11px;
  line-height: 1.5;
  padding: 10px;
}

/* Panel Footer & Actions */
.si-panel-footer {
  padding: 12px 16px;
  background: var(--si-bg-raised);
  border-top: 1px solid var(--si-line);
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

/*
 * Buttons carry a surface. An earlier pass made the secondary actions fully
 * transparent, which read as floating labels rather than things you could
 * press \u2014 Framer's own secondary button ("Invite") is a filled pill too, and
 * only the primary one is coloured. The press state is a real one: the surface
 * darkens instead of the button moving, so a mis-click does not shift the row.
 */
.si-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: var(--si-h);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--si-r);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  user-select: none;
}

.si-btn:active {
  background: var(--si-fill-active);
}

.si-btn:focus-visible {
  outline: none;
  border-color: var(--si-accent);
}

/*
 * A square icon button inside an action row: it keeps the row height but gives
 * up its flex share, so the primary action beside it takes the freed space.
 */
.si-btn-square {
  flex: 0 0 var(--si-h);
  width: var(--si-h);
  padding: 0;
}

.si-btn-secondary {
  background: var(--si-fill);
  color: var(--si-text);
}
.si-btn-secondary:hover {
  background: var(--si-fill-hover);
}

.si-btn-primary {
  background: var(--si-accent);
  color: var(--si-on-accent);
}
.si-btn-primary:hover {
  background: var(--si-accent-hover);
}
.si-btn-primary:active {
  background: var(--si-accent);
}

.si-btn-white {
  background: var(--si-neutral);
  color: var(--si-bg);
}
.si-btn-white:hover {
  background: var(--si-neutral-hover);
}

/*
 * Ghost: no surface until hovered. Reserved for buttons that sit *inside*
 * another surface \u2014 a section header, a field \u2014 never for a standalone action
 * in a row of its own, which needs to look pressable at rest.
 */
.si-btn-ghost {
  background: transparent;
  color: var(--si-text-dim);
  border-color: var(--si-line);
}
.si-btn-ghost:hover {
  background: var(--si-fill);
  color: var(--si-text);
}

/*
 * Destructive actions keep the secondary surface and spend their colour on the
 * label, so "Clear Pins" is identifiable without shouting louder than the
 * primary action beside it.
 */
.si-btn-danger {
  background: var(--si-fill);
  color: var(--si-danger);
}
.si-btn-danger:hover {
  background: var(--si-danger-soft);
  color: var(--si-danger);
}

/* Toast */
.si-toast {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: var(--si-bg-raised);
  color: var(--si-text);
  padding: 10px 16px;
  border-radius: var(--si-r);
  border: 1px solid var(--si-line);
  font-weight: 500;
  font-size: 13px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: siToastFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.si-toast .si-icon {
  color: var(--si-accent);
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

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-center-horizontal.mjs
  var AlignCenterHorizontal = [
    ["path", { d: "M2 12h20" }],
    ["path", { d: "M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" }],
    ["path", { d: "M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" }],
    ["path", { d: "M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1" }],
    ["path", { d: "M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-center-vertical.mjs
  var AlignCenterVertical = [
    ["path", { d: "M12 2v20" }],
    ["path", { d: "M8 10H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h4" }],
    ["path", { d: "M16 10h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4" }],
    ["path", { d: "M8 20H7a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h1" }],
    ["path", { d: "M16 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-end-horizontal.mjs
  var AlignEndHorizontal = [
    ["rect", { width: "6", height: "16", x: "4", y: "2", rx: "2" }],
    ["rect", { width: "6", height: "9", x: "14", y: "9", rx: "2" }],
    ["path", { d: "M22 22H2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-end-vertical.mjs
  var AlignEndVertical = [
    ["rect", { width: "16", height: "6", x: "2", y: "4", rx: "2" }],
    ["rect", { width: "9", height: "6", x: "9", y: "14", rx: "2" }],
    ["path", { d: "M22 22V2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-distribute-center.mjs
  var AlignHorizontalDistributeCenter = [
    ["rect", { width: "6", height: "14", x: "4", y: "5", rx: "2" }],
    ["rect", { width: "6", height: "10", x: "14", y: "7", rx: "2" }],
    ["path", { d: "M17 22v-5" }],
    ["path", { d: "M17 7V2" }],
    ["path", { d: "M7 22v-3" }],
    ["path", { d: "M7 5V2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-justify-center.mjs
  var AlignHorizontalJustifyCenter = [
    ["rect", { width: "6", height: "14", x: "2", y: "5", rx: "2" }],
    ["rect", { width: "6", height: "10", x: "16", y: "7", rx: "2" }],
    ["path", { d: "M12 2v20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-justify-end.mjs
  var AlignHorizontalJustifyEnd = [
    ["rect", { width: "6", height: "14", x: "2", y: "5", rx: "2" }],
    ["rect", { width: "6", height: "10", x: "12", y: "7", rx: "2" }],
    ["path", { d: "M22 2v20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-justify-start.mjs
  var AlignHorizontalJustifyStart = [
    ["rect", { width: "6", height: "14", x: "6", y: "5", rx: "2" }],
    ["rect", { width: "6", height: "10", x: "16", y: "7", rx: "2" }],
    ["path", { d: "M2 2v20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-space-around.mjs
  var AlignHorizontalSpaceAround = [
    ["rect", { width: "6", height: "10", x: "9", y: "7", rx: "2" }],
    ["path", { d: "M4 22V2" }],
    ["path", { d: "M20 22V2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-horizontal-space-between.mjs
  var AlignHorizontalSpaceBetween = [
    ["rect", { width: "6", height: "14", x: "3", y: "5", rx: "2" }],
    ["rect", { width: "6", height: "10", x: "15", y: "7", rx: "2" }],
    ["path", { d: "M3 2v20" }],
    ["path", { d: "M21 2v20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-start-horizontal.mjs
  var AlignStartHorizontal = [
    ["rect", { width: "6", height: "16", x: "4", y: "6", rx: "2" }],
    ["rect", { width: "6", height: "9", x: "14", y: "6", rx: "2" }],
    ["path", { d: "M22 2H2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/align-start-vertical.mjs
  var AlignStartVertical = [
    ["rect", { width: "9", height: "6", x: "6", y: "14", rx: "2" }],
    ["rect", { width: "16", height: "6", x: "6", y: "4", rx: "2" }],
    ["path", { d: "M2 2v20" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/arrow-down.mjs
  var ArrowDown = [
    ["path", { d: "M12 5v14" }],
    ["path", { d: "m19 12-7 7-7-7" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/arrow-left.mjs
  var ArrowLeft = [
    ["path", { d: "m12 19-7-7 7-7" }],
    ["path", { d: "M19 12H5" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/arrow-right.mjs
  var ArrowRight = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "m12 5 7 7-7 7" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/arrow-up.mjs
  var ArrowUp = [
    ["path", { d: "m5 12 7-7 7 7" }],
    ["path", { d: "M12 19V5" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/baseline.mjs
  var Baseline = [
    ["path", { d: "M4 20h16" }],
    ["path", { d: "m6 16 6-12 6 12" }],
    ["path", { d: "M8 12h8" }]
  ];

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

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/download.mjs
  var Download = [
    ["path", { d: "M12 15V3" }],
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["path", { d: "m7 10 5 5 5-5" }]
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

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/minus.mjs
  var Minus = [["path", { d: "M5 12h14" }]];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/move-horizontal.mjs
  var MoveHorizontal = [
    ["path", { d: "m18 8 4 4-4 4" }],
    ["path", { d: "M2 12h20" }],
    ["path", { d: "m6 8-4 4 4 4" }]
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

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/plus.mjs
  var Plus = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/rotate-ccw.mjs
  var RotateCcw = [
    ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
    ["path", { d: "M3 3v5h5" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/stretch-horizontal.mjs
  var StretchHorizontal = [
    ["rect", { width: "20", height: "6", x: "2", y: "4", rx: "2" }],
    ["rect", { width: "20", height: "6", x: "2", y: "14", rx: "2" }]
  ];

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/stretch-vertical.mjs
  var StretchVertical = [
    ["rect", { width: "6", height: "20", x: "4", y: "2", rx: "2" }],
    ["rect", { width: "6", height: "20", x: "14", y: "2", rx: "2" }]
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

  // node_modules/.pnpm/lucide@1.42.0/node_modules/lucide/dist/esm/icons/trash.mjs
  var Trash = [
    ["path", { d: "M10 11v6" }],
    ["path", { d: "M14 11v6" }],
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
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
    AlignCenterHorizontal,
    AlignCenterVertical,
    AlignEndHorizontal,
    AlignEndVertical,
    AlignHorizontalDistributeCenter,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignHorizontalJustifyStart,
    AlignHorizontalSpaceAround,
    AlignHorizontalSpaceBetween,
    AlignJustify: TextAlignJustify,
    AlignLeft: TextAlignStart,
    AlignRight: TextAlignEnd,
    AlignStartHorizontal,
    AlignStartVertical,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Baseline,
    Bold,
    Check,
    ChevronDown,
    Clipboard,
    Copy,
    Download,
    Maximize2,
    Minimize2,
    Minus,
    MoveHorizontal,
    Palette,
    Pin,
    Plus,
    RotateCcw,
    Strikethrough,
    StretchHorizontal,
    StretchVertical,
    Trash2: Trash,
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
  var OUTLINE_WIDTH = 2;
  var QUIET_AFTER_CHANGE_MS = 900;
  function placeOutlineBox(box, rect) {
    box.style.top = `${rect.top - OUTLINE_WIDTH}px`;
    box.style.left = `${rect.left - OUTLINE_WIDTH}px`;
    box.style.width = `${rect.width + OUTLINE_WIDTH * 2}px`;
    box.style.height = `${rect.height + OUTLINE_WIDTH * 2}px`;
  }
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
      this.marginBand = document.createElement("div");
      this.marginBand.className = "si-hover-margin";
      this.marginBand.style.display = "none";
      this.paddingBand = document.createElement("div");
      this.paddingBand.className = "si-hover-padding";
      this.paddingBand.style.display = "none";
      this.container.appendChild(this.marginBand);
      this.container.appendChild(this.paddingBand);
      this.hoverBox = document.createElement("div");
      this.hoverBox.className = "si-hover-box";
      this.hoverBox.style.display = "none";
      this.hoverTag = document.createElement("div");
      this.hoverTag.className = "si-hover-tag";
      this.hoverBox.appendChild(this.hoverTag);
      this.container.appendChild(this.hoverBox);
      this.shadowRoot.appendChild(this.container);
      this.pinnedBoxes = /* @__PURE__ */ new Map();
      this._quietByFocus = false;
      this._quietTimer = null;
      this._peeking = false;
      this._bindEvents();
    }
    _bindEvents() {
      this.state.on("hoverChanged", ({ element }) => this.updateHover(element));
      this.state.on("stateUpdated", () => this.updatePinned());
      this.state.on("modeChanged", ({ isInspecting }) => {
        if (!isInspecting) {
          this._hideHover();
        }
      });
      this._onViewportChange = () => this.refresh();
      window.addEventListener("scroll", this._onViewportChange, { passive: true });
      window.addEventListener("resize", this._onViewportChange, { passive: true });
      this._onFocusIn = (e) => this._setQuietByFocus(this._isPanelField(e.target));
      this._onFocusOut = () => this._setQuietByFocus(false);
      this.shadowRoot.addEventListener("focusin", this._onFocusIn);
      this.shadowRoot.addEventListener("focusout", this._onFocusOut);
      this.state.on("styleChanged", () => this._quietAfterChange());
      this._onKeyDown = (e) => {
        if (e.repeat || !this._isPeekKey(e) || this._isTypingAnywhere()) return;
        this.setPeek(true);
      };
      this._onKeyUp = (e) => {
        if (this._isPeekKey(e)) this.setPeek(false);
      };
      this._onWindowBlur = () => this.setPeek(false);
      window.addEventListener("keydown", this._onKeyDown, true);
      window.addEventListener("keyup", this._onKeyUp, true);
      window.addEventListener("blur", this._onWindowBlur);
    }
    /**
     * True for a control inside the adjustment panel whose focus means the user
     * is editing a value.
     * @param {EventTarget|null} target
     */
    _isPanelField(target) {
      if (!(target instanceof Element)) return false;
      if (!target.closest(".si-panel")) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
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
        return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      };
      return check(document.activeElement) || check(this.shadowRoot.activeElement);
    }
    _isPeekKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return false;
      return e.code === "KeyH" || e.key === "h" || e.key === "H";
    }
    /**
     * Hides or shows every overlay at once.
     * @param {boolean} on
     */
    setPeek(on) {
      if (this._peeking === on) return;
      this._peeking = on;
      this.container.classList.toggle("si-peek", on);
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
      for (const [id9, box] of this.pinnedBoxes.entries()) {
        box.classList.toggle("si-quiet", quiet && id9 === activeId);
      }
    }
    /**
     * Hides the hover outline and both box-model bands.
     */
    _hideHover() {
      this.hoverBox.style.display = "none";
      this.marginBand.style.display = "none";
      this.paddingBand.style.display = "none";
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
        this.marginBand.style.display = "none";
        this.paddingBand.style.display = "none";
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
      const marginTop = Math.max(0, margin.top);
      const marginRight = Math.max(0, margin.right);
      const marginBottom = Math.max(0, margin.bottom);
      const marginLeft = Math.max(0, margin.left);
      const hasMargin = marginTop || marginRight || marginBottom || marginLeft;
      if (hasMargin) {
        this.marginBand.style.display = "block";
        this.marginBand.style.top = `${rect.top - marginTop}px`;
        this.marginBand.style.left = `${rect.left - marginLeft}px`;
        this.marginBand.style.width = `${rect.width + marginLeft + marginRight}px`;
        this.marginBand.style.height = `${rect.height + marginTop + marginBottom}px`;
        this.marginBand.style.borderWidth = `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`;
      } else {
        this.marginBand.style.display = "none";
      }
      const hasPadding = padding.top || padding.right || padding.bottom || padding.left;
      if (hasPadding) {
        this.paddingBand.style.display = "block";
        this.paddingBand.style.top = `${rect.top}px`;
        this.paddingBand.style.left = `${rect.left}px`;
        this.paddingBand.style.width = `${rect.width}px`;
        this.paddingBand.style.height = `${rect.height}px`;
        this.paddingBand.style.borderWidth = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
      } else {
        this.paddingBand.style.display = "none";
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
      this.hoverBox.style.display = "block";
      placeOutlineBox(this.hoverBox, rect);
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
      for (const [id9, item] of this.state.pinnedItems.entries()) {
        activeIds.add(id9);
        let box = this.pinnedBoxes.get(id9);
        if (!box) {
          box = document.createElement("div");
          box.className = "si-pinned-box";
          const tag = document.createElement("div");
          tag.className = "si-pinned-tag";
          tag.innerHTML = `${siIcon("Pin")}<span>${escapeHtml(item.label)}</span>`;
          box.appendChild(tag);
          this.container.appendChild(box);
          this.pinnedBoxes.set(id9, box);
        }
        const rect = item.element.getBoundingClientRect();
        box.style.display = "block";
        placeOutlineBox(box, rect);
      }
      for (const [id9, box] of this.pinnedBoxes.entries()) {
        if (!activeIds.has(id9)) {
          box.remove();
          this.pinnedBoxes.delete(id9);
        }
      }
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
        window.removeEventListener("scroll", this._onViewportChange, { passive: true });
        window.removeEventListener("resize", this._onViewportChange, { passive: true });
        this._onViewportChange = null;
      }
      this.shadowRoot.removeEventListener("focusin", this._onFocusIn);
      this.shadowRoot.removeEventListener("focusout", this._onFocusOut);
      window.removeEventListener("keydown", this._onKeyDown, true);
      window.removeEventListener("keyup", this._onKeyUp, true);
      window.removeEventListener("blur", this._onWindowBlur);
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
  var INSTRUCTION = {
    apply: "Apply the changes above to the source that renders each element \u2014 the component, template, or stylesheet it comes from.",
    selectorTestId: "Each heading is a `data-testid` attribute that already exists in the source. Search for it to find the element.",
    selectorMixed: "Each heading is a CSS selector for the element as it appears in the rendered DOM. Some are attribute selectors present verbatim in the source; others are structural paths you will need to trace.",
    mechanism: "Use whichever styling mechanism the project already uses for that element \u2014 stylesheet, CSS module, utility classes, CSS-in-JS. Do not introduce inline styles unless the file already works that way.",
    computed: "The `From` column is the computed value at the time of inspection, not necessarily what the source declares. When a value comes from a shared class or a design token, change it where it is defined, or add a narrower override if that shared rule has other users.",
    text: "A **Text** line is a copy change. It belongs to the template, component, or i18n catalogue that produces the string, never to a stylesheet.",
    notes: "A **Note** line is context from whoever requested the change, and may constrain where the edit belongs."
  };
  function isTestIdSelector(selector) {
    return /^\[data-testid=/.test(`${selector || ""}`);
  }
  function instructionLines(items, options = {}) {
    const custom = (options.instruction || "").trim();
    if (custom) return [custom];
    const list = items || [];
    const lines = [
      INSTRUCTION.apply,
      list.length > 0 && list.every((item) => isTestIdSelector(item.selector)) ? INSTRUCTION.selectorTestId : INSTRUCTION.selectorMixed,
      INSTRUCTION.mechanism,
      INSTRUCTION.computed
    ];
    if (list.some((item) => computeTextDiff(item))) lines.push(INSTRUCTION.text);
    if (list.some((item) => item.notes && item.notes.trim())) lines.push(INSTRUCTION.notes);
    return lines;
  }
  function summaryLine(items, options = {}) {
    const styleCount = items.reduce((total, item) => total + diffsFor(item, options).length, 0);
    const textCount = items.filter((item) => computeTextDiff(item)).length;
    const parts = [`${items.length} element${items.length === 1 ? "" : "s"}`];
    parts.push(`${styleCount} style change${styleCount === 1 ? "" : "s"}`);
    if (textCount > 0) parts.push(`${textCount} copy change${textCount === 1 ? "" : "s"}`);
    parts.push(`lengths in \`${options.unit || "px"}\``);
    return parts.join(" \xB7 ");
  }
  var EXPORT_FORMATS = [
    { id: "markdown", label: "Markdown", extension: "md", mime: "text/markdown" },
    { id: "css", label: "CSS", extension: "css", mime: "text/css" },
    { id: "json", label: "JSON", extension: "json", mime: "application/json" }
  ];
  function unitContext(item, options = {}) {
    return {
      unit: options.unit || "px",
      rootFontSize: item.rootFontSize,
      parentFontSize: item.parentFontSize
    };
  }
  function diffsFor(item, options) {
    return computeStyleDiff(item.baseline, item.current, unitContext(item, options));
  }
  function formatTextChange(diff) {
    const isMultiline = diff.before.includes("\n") || diff.after.includes("\n");
    if (!isMultiline) {
      return `**Text:** ${JSON.stringify(diff.before)} \u2192 ${JSON.stringify(diff.after)}`;
    }
    return [
      "**Text:**",
      "",
      "Before:",
      "",
      "```",
      diff.before,
      "```",
      "",
      "After:",
      "",
      "```",
      diff.after,
      "```"
    ].join("\n");
  }
  function formatDiffTable(diffs) {
    return [
      "| Property | From | To |",
      "| --- | --- | --- |",
      ...diffs.map((diff) => `| \`${diff.property}\` | \`${diff.before}\` | \`${diff.after}\` |`)
    ].join("\n");
  }
  function hasChanges(item) {
    if (!item) return false;
    if (computeTextDiff(item)) return true;
    if (item.notes && item.notes.trim()) return true;
    return computeStyleDiff(item.baseline, item.current).length > 0;
  }
  function targetItems(items) {
    const changed = items.filter(hasChanges);
    return changed.length > 0 ? changed : items;
  }
  function formatElementSection(item, options, index) {
    const diffs = diffsFor(item, options);
    const textDiff = computeTextDiff(item);
    const notes = item.notes && item.notes.trim();
    const heading = `### ${index ? `${index}. ` : ""}\`${item.selector}\``;
    const lines = [heading];
    if (item.label && !heading.includes(item.label)) {
      lines.push("", `\`${item.label}\``);
    }
    if (diffs.length === 0 && !textDiff) {
      lines.push("", notes ? "_No style or copy changes recorded._" : "*(No style changes recorded)*");
    }
    if (textDiff) {
      lines.push("", formatTextChange(textDiff));
    }
    if (diffs.length > 0) {
      lines.push("", formatDiffTable(diffs));
    }
    if (notes) {
      lines.push("", `> **Note:** ${notes}`);
    }
    return lines.join("\n");
  }
  function generateMarkdownExport(items, options = {}) {
    if (!items || items.length === 0) {
      return "## Style Adjustment Request\n\n*(No elements were pinned or modified)*";
    }
    const list = targetItems(items);
    const sections = list.map(
      (item, index) => formatElementSection(item, options, list.length > 1 ? index + 1 : 0)
    );
    return [
      "## Style Adjustment Request",
      "",
      summaryLine(list, options),
      "",
      sections.join("\n\n"),
      "",
      "---",
      "",
      "### How to apply",
      "",
      ...instructionLines(list, options).map((line) => `- ${line}`)
    ].join("\n");
  }
  function generateSingleItemExport(item, options = {}) {
    return [
      "## Style Adjustment Request",
      "",
      summaryLine([item], options),
      "",
      formatElementSection(item, options),
      "",
      "---",
      "",
      "### How to apply",
      "",
      ...instructionLines([item], options).map((line) => `- ${line}`)
    ].join("\n");
  }
  function generateCssExport(items, options = {}) {
    if (!items || items.length === 0) {
      return "/* Style Adjustment Request \u2014 no elements were pinned or modified */";
    }
    const blocks = targetItems(items).map((item) => {
      const diffs = diffsFor(item, options);
      const textDiff = computeTextDiff(item);
      const lines = [];
      if (textDiff) {
        lines.push(`/* text: ${JSON.stringify(textDiff.before)} \u2192 ${JSON.stringify(textDiff.after)} */`);
      }
      if (item.notes && item.notes.trim()) {
        lines.push(`/* ${item.notes.trim().replace(/\*\//g, "*\\/")} */`);
      }
      if (diffs.length === 0) {
        lines.push(`/* ${item.selector} \u2014 no style changes */`);
        return lines.join("\n");
      }
      lines.push(`${item.selector} {`);
      for (const diff of diffs) {
        lines.push(`  ${diff.property}: ${diff.after}; /* was ${diff.before} */`);
      }
      lines.push("}");
      return lines.join("\n");
    });
    const instruction = instructionLines(targetItems(items), options);
    return [
      "/* Style Adjustment Request */",
      "",
      blocks.join("\n\n"),
      "",
      "/*",
      ...instruction.map((line) => ` * ${line.replace(/\*\//g, "*\\/")}`),
      " */"
    ].join("\n");
  }
  function generateJsonExport(items, options = {}) {
    const list = items && items.length ? targetItems(items) : [];
    const payload = {
      unit: options.unit || "px",
      instruction: instructionLines(list, options).join("\n"),
      elements: list.map((item) => {
        const textDiff = computeTextDiff(item);
        return {
          selector: item.selector,
          label: item.label,
          text: textDiff ? { before: textDiff.before, after: textDiff.after } : null,
          changes: diffsFor(item, options),
          notes: item.notes || ""
        };
      })
    };
    return JSON.stringify(payload, null, 2);
  }
  function generateExport(items, options = {}) {
    switch (options.format) {
      case "css":
        return generateCssExport(items, options);
      case "json":
        return generateJsonExport(items, options);
      default:
        return generateMarkdownExport(items, options);
    }
  }
  function exportFormatInfo(format) {
    return EXPORT_FORMATS.find((entry) => entry.id === format) || EXPORT_FORMATS[0];
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
  function downloadExport(text, format) {
    if (typeof document === "undefined" || typeof URL === "undefined") return false;
    const info = exportFormatInfo(format);
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([text], { type: `${info.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `style-adjustments-${stamp}.${info.extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e4);
    return true;
  }

  // src/ui/sections/content.js
  var content_exports = {};
  __export(content_exports, {
    bind: () => bind,
    id: () => id,
    render: () => render
  });

  // src/ui/sections/shared.js
  function sectionKey(title) {
    return `${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function section({ title, body, action = "", id: id9, collapsible = true }) {
    const key = id9 || sectionKey(title);
    const toggle = collapsible ? `<button type="button" class="si-section-toggle" data-toggle="${key}"
               aria-label="Collapse or expand ${escapeHtml(title)}">
         <span class="si-toggle-open">${siIcon("Minus", 13)}</span>
         <span class="si-toggle-closed">${siIcon("Plus", 13)}</span>
       </button>` : "";
    return `
    <div class="si-section" data-section="${key}">
      <div class="si-section-header">
        <span>${escapeHtml(title)}</span>
        <div class="si-section-tools">${action}${toggle}</div>
      </div>
      <div class="si-section-body">${body}</div>
    </div>
  `;
  }
  function linkSwitch(group, linked) {
    return `
    <label class="si-switch-label">
      <span>Link all</span>
      <div class="si-switch ${linked ? "checked" : ""}"
           data-testid="style_inspector_panel_link_sides_switch"
           data-switch="${group.name}">
        <div class="si-switch-thumb"></div>
      </div>
    </label>
  `;
  }
  var SIDE_ICONS = {
    padding: ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"],
    margin: ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"],
    "border-radius": ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"]
  };
  function fourSidedControl(group, item, { idPrefix, testId: testId2 }) {
    const current = item.current;
    const linked = Boolean(item[group.linkFlag]);
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    if (linked) {
      return `
      <div class="si-spacing-row">
        <label class="si-spacing-pill" title="All sides">
          ${siIcon("Maximize2", 12)}
          <input type="number" class="si-spacing-edge" ${testAttr}
                 data-side="all"
                 value="${current[group.keys[0]]}" id="${idPrefix}-all">
        </label>
      </div>
    `;
    }
    const icons = SIDE_ICONS[group.name] || SIDE_ICONS.padding;
    const pills = group.keys.map((key, index) => {
      const side = group.sides[index];
      const label = side.replace("-", " ");
      return `
      <label class="si-spacing-pill" title="${label}">
        ${siIcon(icons[index], 12)}
        <input type="number" class="si-spacing-edge" ${testAttr}
               data-side="${side}"
               value="${current[key]}" id="${idPrefix}-${side}">
      </label>
    `;
    });
    return `<div class="si-spacing-row">${pills.join("")}</div>`;
  }
  function bindFourSided(group, { panel, state, item }, idPrefix) {
    if (item[group.linkFlag]) {
      bindNumber(panel, `#${idPrefix}-all`, (value) => state.updateStyle(item.id, group.allProp, value));
      return;
    }
    group.keys.forEach((key, index) => {
      const side = group.sides[index];
      bindNumber(panel, `#${idPrefix}-${side}`, (value) => state.updateStyle(item.id, key, value));
    });
  }
  function bindNumber(panel, selector, onChange) {
    const input = panel.querySelector(selector);
    if (!input) return;
    input.oninput = (event) => {
      const value = parseFloat(event.target.value);
      if (Number.isNaN(value)) return;
      onChange(value);
    };
  }
  function scrubControl({ id: id9, testId: testId2, value, icon = "MoveHorizontal", step = 1, min, max, suffix = "" }) {
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    const bounds = `${min === void 0 ? "" : `min="${min}"`} ${max === void 0 ? "" : `max="${max}"`}`;
    return `
    <label class="si-spacing-pill si-scrub">
      <span class="si-scrub-handle" id="${id9}-handle" title="Drag to change">${siIcon(icon, 12)}</span>
      <input type="number" class="si-spacing-edge" ${testAttr}
             id="${id9}" value="${value}" step="${step}" ${bounds}>
      ${suffix ? `<span class="si-scrub-suffix">${escapeHtml(suffix)}</span>` : ""}
    </label>
  `;
  }
  function bindScrub(panel, id9, { step = 1, min, max } = {}, onChange) {
    const input = panel.querySelector(`#${id9}`);
    const handle = panel.querySelector(`#${id9}-handle`);
    if (!input) return;
    const decimals = `${step}`.includes(".") ? `${step}`.split(".")[1].length : 0;
    const clamp = (value) => {
      let next = value;
      if (min !== void 0) next = Math.max(min, next);
      if (max !== void 0) next = Math.min(max, next);
      return Number(next.toFixed(decimals));
    };
    bindNumber(panel, `#${id9}`, (value) => onChange(clamp(value)));
    if (!handle) return;
    handle.onpointerdown = (event) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("scrubbing");
      input.focus();
      const startX = event.clientX;
      const startValue = parseFloat(input.value) || 0;
      const onMove = (moveEvent) => {
        const next = clamp(startValue + (moveEvent.clientX - startX) * step);
        input.value = `${next}`;
        onChange(next);
      };
      const onUp = () => {
        handle.classList.remove("scrubbing");
        handle.releasePointerCapture(event.pointerId);
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    };
  }
  function bindText(panel, selector, onChange) {
    const input = panel.querySelector(selector);
    if (!input) return;
    input.oninput = (event) => onChange(event.target.value);
  }
  function bindSelect(panel, selector, onChange) {
    const select = panel.querySelector(selector);
    if (!select) return;
    select.onchange = (event) => onChange(event.target.value);
  }
  function controlRow(label, control, { wide = false } = {}) {
    return `
    <div class="si-control-row ${wide ? "si-control-row-wide" : ""}">
      <span class="si-control-label">${escapeHtml(label)}</span>
      <div class="si-control-field">${control}</div>
    </div>
  `;
  }
  function comboControl({ valueId, unitId, testId: testId2, value, units, placeholder = "" }) {
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    const parts = splitLength(value);
    const offered = parts.unit && !units.includes(parts.unit) ? [...units, parts.unit] : units;
    const options = offered.map(
      (unit) => `<option value="${escapeHtml(unit)}" ${unit === parts.unit ? "selected" : ""}>${escapeHtml(unit)}</option>`
    ).join("");
    return `
    <div class="si-combo">
      <input type="text" class="si-input-text si-combo-value" ${testAttr}
             id="${valueId}" value="${escapeHtml(parts.number)}"
             placeholder="${escapeHtml(placeholder)}"
             ${parts.keyword ? "disabled" : ""}
             spellcheck="false" autocomplete="off">
      <label class="si-select-wrap si-combo-unit">
        <select id="${unitId}" aria-label="Unit">
          <option value="" ${parts.unit ? "" : "selected"}>\u2014</option>
          ${options}
        </select>
        ${siIcon("ChevronDown", 12)}
      </label>
    </div>
  `;
  }
  function bindCombo(panel, { valueId, unitId }, onChange) {
    const value = panel.querySelector(`#${valueId}`);
    const unit = panel.querySelector(`#${unitId}`);
    if (!value || !unit) return;
    value.oninput = () => onChange(joinLength(value.value, unit.value));
    unit.onchange = () => {
      const isKeyword = unit.value && !LENGTH_UNITS.includes(unit.value);
      if (isKeyword) {
        value.value = "";
        value.disabled = true;
        onChange(unit.value);
        return;
      }
      value.disabled = false;
      if (!value.value.trim()) {
        value.focus();
        return;
      }
      onChange(joinLength(value.value, unit.value));
    };
  }
  function selectControl({ id: id9, testId: testId2, label, value, options }) {
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    const markup = options.map((option) => {
      const optionValue = typeof option === "string" ? option : option.value;
      const optionLabel = typeof option === "string" ? option : option.label;
      const selected = `${value}` === `${optionValue}` ? "selected" : "";
      return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
    }).join("");
    return `
    <label class="si-select-wrap">
      <select id="${id9}" ${testAttr} aria-label="${escapeHtml(label)}">${markup}</select>
      ${siIcon("ChevronDown", 13)}
    </label>
  `;
  }
  function segmented({ id: id9, testId: testId2, label, value, options }) {
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    const known = options.some((option) => `${option.value}` === `${value}`);
    const all = known || value === void 0 || value === "" ? options : [...options, { value, label: value }];
    const buttons = all.map((option) => {
      const active = `${option.value}` === `${value}` ? "active" : "";
      const title = option.title || option.label || option.value;
      const content = option.icon ? siIcon(option.icon, 15) : escapeHtml(option.label || option.value);
      return `<button type="button" class="si-segment ${active}"
                      id="${id9}-${escapeHtml(option.value)}"
                      data-value="${escapeHtml(option.value)}"
                      title="${escapeHtml(title)}"
                      aria-label="${escapeHtml(title)}"
                      aria-pressed="${active ? "true" : "false"}">${content}</button>`;
    }).join("");
    return `
    <div class="si-segmented" id="${id9}" ${testAttr} role="group" aria-label="${escapeHtml(label)}">
      ${buttons}
    </div>
  `;
  }
  function bindSegmented(panel, selector, onChange) {
    const group = panel.querySelector(selector);
    if (!group) return;
    group.querySelectorAll("[data-value]").forEach((button) => {
      button.onclick = () => {
        group.querySelectorAll("[data-value]").forEach((other) => {
          const isActive = other === button;
          other.classList.toggle("active", isActive);
          other.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        onChange(button.getAttribute("data-value"));
      };
    });
  }
  function colorControl({ pickerId, inputId, testId: testId2, value, fallback, placeholder = "" }, toHex) {
    const testAttr = testId2 ? `data-testid="${testId2}"` : "";
    return `
    <div class="si-color-picker-wrap">
      <input type="color" class="si-color-swatch" value="${toHex(value, fallback)}" id="${pickerId}">
      <input type="text" class="si-input-text" ${testAttr}
             value="${escapeHtml(value || "")}" id="${inputId}"
             placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
  }
  function bindColor({ panel, state, item }, pickerId, inputId, prop) {
    const picker = panel.querySelector(pickerId);
    const input = panel.querySelector(inputId);
    if (picker) {
      picker.oninput = (event) => {
        if (input) input.value = event.target.value;
        state.updateStyle(item.id, prop, event.target.value);
      };
    }
    if (input) {
      input.oninput = (event) => {
        const value = event.target.value.trim();
        if (picker && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
          picker.value = value;
        }
        state.updateStyle(item.id, prop, value);
      };
    }
  }

  // src/ui/sections/content.js
  var id = "content";
  function render(item) {
    const action = item.textEditable ? `<button class="si-btn-icon" id="si-reset-text-btn" title="Revert text to original">${siIcon("RotateCcw", 12)}</button>` : "";
    if (!item.textEditable) {
      return section({
        title: "Content",
        action,
        body: `<div class="si-text-disabled">${escapeHtml(
          item.textReason || "This element has no directly editable text."
        )}</div>`
      });
    }
    const text = item.currentText || "";
    return section({
      title: "Content",
      action,
      body: `
      <textarea class="si-textarea si-text-content"
                data-testid="style_inspector_panel_text_content_input"
                id="si-text-input"
                rows="2"
                placeholder="Element text\u2026">${escapeHtml(text)}</textarea>
      <div class="si-text-meta">
        <span>${text.length} chars</span>
        ${item.currentText !== item.baselineText ? '<span class="si-text-dirty">edited</span>' : ""}
      </div>
    `
    });
  }
  function bind({ panel, state, item, showToast }) {
    const input = panel.querySelector("#si-text-input");
    if (input) {
      input.oninput = (event) => state.setText(item.id, event.target.value);
    }
    const resetBtn = panel.querySelector("#si-reset-text-btn");
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.resetText(item.id);
        showToast("Text reverted to original.");
      };
    }
  }

  // src/ui/sections/spacing.js
  var spacing_exports = {};
  __export(spacing_exports, {
    bind: () => bind2,
    id: () => id2,
    render: () => render2
  });
  var id2 = "spacing";
  var PADDING = SHORTHAND_GROUPS.find((group) => group.name === "padding");
  var MARGIN = SHORTHAND_GROUPS.find((group) => group.name === "margin");
  var PREFIX = { padding: "pad-input", margin: "mar-input" };
  function render2(item) {
    const gap = scrubControl({
      id: "gap-input",
      testId: "style_inspector_panel_gap_input",
      value: item.current.gap,
      min: 0,
      suffix: "px"
    });
    return [
      section({
        title: "Padding",
        action: linkSwitch(PADDING, item.linkPadding),
        body: fourSidedControl(PADDING, item, {
          idPrefix: PREFIX.padding,
          testId: "style_inspector_panel_padding_input"
        })
      }),
      section({
        title: "Margin",
        action: linkSwitch(MARGIN, item.linkMargin),
        body: fourSidedControl(MARGIN, item, {
          idPrefix: PREFIX.margin,
          testId: "style_inspector_panel_margin_input"
        })
      }),
      section({ title: "Gap (Flex / Grid)", body: controlRow("Gap", gap) })
    ].join("");
  }
  function bind2(context) {
    const { panel, state, item } = context;
    bindFourSided(PADDING, context, PREFIX.padding);
    bindFourSided(MARGIN, context, PREFIX.margin);
    bindScrub(panel, "gap-input", { step: 1, min: 0 }, (value) => state.updateStyle(item.id, "gap", value));
  }

  // src/ui/sections/typography.js
  var typography_exports = {};
  __export(typography_exports, {
    bind: () => bind3,
    id: () => id3,
    render: () => render3
  });
  var id3 = "typography";
  var WEIGHTS = [
    ["100", "Thin"],
    ["200", "Extra Light"],
    ["300", "Light"],
    ["400", "Normal"],
    ["500", "Medium"],
    ["600", "Semi Bold"],
    ["700", "Bold"],
    ["800", "Extra Bold"],
    ["900", "Black"]
  ];
  var FONT_SIZE_PRESETS = [10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128];
  var ALIGNMENTS = ["left", "center", "right", "justify"];
  var TRANSFORMS = [
    ["none", "Normal"],
    ["uppercase", "Uppercase"],
    ["lowercase", "Lowercase"],
    ["capitalize", "Capitalize"]
  ];
  function render3(item) {
    const cur = item.current;
    const weightOptions = WEIGHTS.map(
      ([value, label]) => `<option value="${value}" ${`${cur.fontWeight}` === value || value === "400" && !cur.fontWeight ? "selected" : ""}>${value} - ${label}</option>`
    ).join("");
    const sizePresets = FONT_SIZE_PRESETS.map(
      (size) => `<option value="${size}" ${Number(cur.fontSize) === size ? "selected" : ""}>${size}</option>`
    ).join("");
    const alignButtons = ALIGNMENTS.map((align) => {
      const active = cur.textAlign === align || !cur.textAlign && align === "left";
      const icon = `Align${align[0].toUpperCase()}${align.slice(1)}`;
      return `<button type="button" class="si-type-icon-btn ${active ? "active" : ""}" data-align="${align}" title="Align ${align}">${siIcon(icon, 15)}</button>`;
    }).join("");
    const transformOptions = TRANSFORMS.map(
      ([value, label]) => `<option value="${value}" ${cur.textTransform === value || value === "none" && !cur.textTransform ? "selected" : ""}>${label}</option>`
    ).join("");
    const body = `
      <div class="si-typography-grid">
        <label class="si-type-control si-type-select">
          <select data-testid="style_inspector_panel_font_weight_select" id="font-weight-select" aria-label="Font weight">${weightOptions}</select>
          ${siIcon("ChevronDown", 13)}
        </label>
        <label class="si-type-control si-type-value si-type-fontsize">
          <span class="si-type-glyph">AA</span>
          <input type="number" data-testid="style_inspector_panel_font_size_input" value="${cur.fontSize}" id="font-size-input" aria-label="Font size">
          <select id="font-size-preset" aria-label="Font size preset" class="si-fontsize-preset">
            <option value="">\u2014</option>
            ${sizePresets}
          </select>
          ${siIcon("ChevronDown", 10)}
        </label>
        <label class="si-type-control si-type-value">
          <input type="color" class="si-color-swatch" value="${rgbToHex(cur.color, "#ffffff")}" id="color-picker" title="Pick text color">
          <input type="text" data-testid="style_inspector_panel_color_input" value="${escapeHtml(cur.color || "")}" id="color-input" aria-label="Text color">
        </label>
        <label class="si-type-control si-type-value">
          <span class="si-type-glyph si-type-underlined">A</span>
          <input type="number" step="0.05" data-testid="style_inspector_panel_line_height_input" value="${cur.lineHeight}" id="line-height-input" aria-label="Line height">
          <span class="si-type-dash">\u2014</span>
        </label>
        <div class="si-type-control si-type-align" role="group" aria-label="Text alignment"
             data-testid="style_inspector_panel_text_align_group">${alignButtons}</div>
        <label class="si-type-control si-type-value">
          <span class="si-type-glyph">|A|</span>
          <input type="number" step="0.1" value="${cur.letterSpacing}" id="letter-spacing-input" aria-label="Letter spacing">
          <span>px</span>
        </label>
        <label class="si-type-control si-type-transform">
          <span class="si-type-glyph">Aa</span>
          <select data-testid="style_inspector_panel_text_transform_select" id="text-transform-select" aria-label="Text transform">${transformOptions}</select>
          ${siIcon("ChevronDown", 13)}
        </label>
      </div>
      <div class="si-control-row">
        <span class="si-control-label">Font family</span>
        <div class="si-control-field">
          <input type="text" class="si-input-text"
                 data-testid="style_inspector_panel_font_family_input"
                 value="${escapeHtml(cur.fontFamily || "")}" id="font-family-input"
                 placeholder="Inter, system-ui, sans-serif">
        </div>
      </div>
  `;
    return section({ title: "Typography", body });
  }
  function bind3(context) {
    const { panel, state, item } = context;
    const set = (prop, value) => state.updateStyle(item.id, prop, value);
    bindNumber(panel, "#font-size-input", (value) => set("fontSize", value));
    bindNumber(panel, "#line-height-input", (value) => set("lineHeight", value));
    bindNumber(panel, "#letter-spacing-input", (value) => set("letterSpacing", value));
    bindText(panel, "#font-family-input", (value) => set("fontFamily", value));
    bindSelect(panel, "#font-weight-select", (value) => set("fontWeight", value));
    bindSelect(panel, "#text-transform-select", (value) => set("textTransform", value));
    bindColor(context, "#color-picker", "#color-input", "color");
    const preset = panel.querySelector("#font-size-preset");
    if (preset) {
      preset.onchange = (event) => {
        if (!event.target.value) return;
        const sizeInput = panel.querySelector("#font-size-input");
        if (sizeInput) sizeInput.value = event.target.value;
        set("fontSize", parseFloat(event.target.value));
      };
    }
    panel.querySelectorAll("[data-align]").forEach((button) => {
      button.onclick = () => {
        const align = button.getAttribute("data-align");
        panel.querySelectorAll("[data-align]").forEach((other) => other.classList.toggle("active", other === button));
        set("textAlign", align);
      };
    });
  }

  // src/ui/sections/color.js
  var color_exports = {};
  __export(color_exports, {
    bind: () => bind4,
    id: () => id4,
    render: () => render4
  });
  var id4 = "color";
  function render4(item) {
    return section({
      title: "Colors",
      body: controlRow(
        "Background",
        colorControl(
          {
            pickerId: "bg-color-picker",
            inputId: "bg-color-input",
            testId: "style_inspector_panel_bg_color_input",
            value: item.current.backgroundColor,
            fallback: "#1e293b",
            placeholder: "transparent or #ffffff"
          },
          rgbToHex
        )
      )
    });
  }
  function bind4(context) {
    bindColor(context, "#bg-color-picker", "#bg-color-input", "backgroundColor");
  }

  // src/ui/sections/border.js
  var border_exports = {};
  __export(border_exports, {
    bind: () => bind5,
    id: () => id5,
    render: () => render5
  });
  var id5 = "border";
  var RADIUS = SHORTHAND_GROUPS.find((group) => group.name === "border-radius");
  var PREFIX2 = "radius-input";
  var BORDER_STYLES = ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"];
  function render5(item) {
    const cur = item.current;
    const width = `
    <input type="number" class="si-input-number" min="0"
           data-testid="style_inspector_panel_border_width_input"
           value="${cur.borderWidth}" id="border-width-input">
  `;
    return [
      section({
        title: "Corner Radius",
        action: linkSwitch(RADIUS, item.linkRadius),
        body: fourSidedControl(RADIUS, item, {
          idPrefix: PREFIX2,
          testId: "style_inspector_panel_border_radius_input"
        })
      }),
      section({
        title: "Border",
        body: [
          controlRow("Width", width),
          controlRow(
            "Style",
            selectControl({
              id: "border-style-select",
              testId: "style_inspector_panel_border_style_select",
              label: "Border style",
              value: cur.borderStyle,
              options: BORDER_STYLES
            })
          ),
          controlRow(
            "Color",
            colorControl(
              {
                pickerId: "border-color-picker",
                inputId: "border-color-input",
                testId: "style_inspector_panel_border_color_input",
                value: cur.borderColor,
                fallback: "#262626",
                placeholder: "currentColor or #262626"
              },
              rgbToHex
            )
          )
        ].join("")
      })
    ].join("");
  }
  function bind5(context) {
    const { panel, state, item } = context;
    const set = (prop, value) => state.updateStyle(item.id, prop, value);
    bindFourSided(RADIUS, context, PREFIX2);
    bindNumber(panel, "#border-width-input", (value) => set("borderWidth", value));
    bindSelect(panel, "#border-style-select", (value) => set("borderStyle", value));
    bindColor(context, "#border-color-picker", "#border-color-input", "borderColor");
  }

  // src/ui/sections/effects.js
  var effects_exports = {};
  __export(effects_exports, {
    bind: () => bind6,
    id: () => id6,
    render: () => render6
  });
  var id6 = "effects";
  var SHADOW_PRESETS = [
    ["none", "None"],
    ["0px 1px 2px rgba(0,0,0,0.08)", "Subtle"],
    ["0px 2px 8px rgba(0,0,0,0.12)", "Soft"],
    ["0px 8px 24px rgba(0,0,0,0.18)", "Elevated"],
    ["0px 20px 48px rgba(0,0,0,0.24)", "Dramatic"],
    ["inset 0px 1px 2px rgba(0,0,0,0.15)", "Inset"]
  ];
  function render6(item) {
    const cur = item.current;
    const shadow = normalizeBoxShadow(cur.boxShadow);
    const presetOptions = SHADOW_PRESETS.map(
      ([value, label]) => `<option value="${escapeHtml(value)}" ${normalizeBoxShadow(value) === shadow ? "selected" : ""}>${label}</option>`
    ).join("");
    const custom = SHADOW_PRESETS.every(([value]) => normalizeBoxShadow(value) !== shadow);
    const opacity = scrubControl({
      id: "opacity-input",
      testId: "style_inspector_panel_opacity_input",
      value: cur.opacity,
      step: 0.01,
      min: 0,
      max: 1
    });
    return section({
      title: "Effects",
      body: [
        controlRow(
          "Shadow",
          `<label class="si-select-wrap">
           <select id="box-shadow-preset" aria-label="Shadow preset">
             <option value="" ${custom ? "selected" : ""}>${custom ? "Custom\u2026" : "Preset\u2026"}</option>
             ${presetOptions}
           </select>
         </label>`
        ),
        `<div class="si-field-block">
         <input type="text" class="si-input-text si-input-css"
                data-testid="style_inspector_panel_box_shadow_input"
                id="box-shadow-input"
                value="${escapeHtml(shadow)}"
                placeholder="0px 2px 8px rgba(0,0,0,0.12)"
                spellcheck="false" autocapitalize="off" autocomplete="off"
                aria-label="Box shadow">
       </div>`,
        controlRow("Opacity", opacity)
      ].join("")
    });
  }
  function bind6(context) {
    const { panel, state, item } = context;
    const set = (prop, value) => state.updateStyle(item.id, prop, value);
    bindText(panel, "#box-shadow-input", (value) => set("boxShadow", value));
    const preset = panel.querySelector("#box-shadow-preset");
    if (preset) {
      preset.onchange = (event) => {
        if (!event.target.value) return;
        const input = panel.querySelector("#box-shadow-input");
        if (input) input.value = event.target.value;
        set("boxShadow", event.target.value);
      };
    }
    bindScrub(panel, "opacity-input", { step: 0.01, min: 0, max: 1 }, (value) => set("opacity", value));
  }

  // src/ui/sections/size.js
  var size_exports = {};
  __export(size_exports, {
    bind: () => bind7,
    id: () => id7,
    render: () => render7
  });
  var id7 = "size";
  var FIELDS = [
    {
      key: "width",
      label: "Width",
      valueId: "width-input",
      unitId: "width-unit",
      keywords: ["auto", "fit-content", "min-content", "max-content"]
    },
    {
      key: "height",
      label: "Height",
      valueId: "height-input",
      unitId: "height-unit",
      keywords: ["auto", "fit-content", "min-content", "max-content"]
    },
    {
      key: "maxWidth",
      label: "Max width",
      valueId: "max-width-input",
      unitId: "max-width-unit",
      keywords: ["none", "fit-content"]
    }
  ];
  function testId(key) {
    return `style_inspector_panel_${key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}_input`;
  }
  function render7(item) {
    const rows = FIELDS.map(
      (field) => controlRow(
        field.label,
        comboControl({
          valueId: field.valueId,
          unitId: field.unitId,
          testId: testId(field.key),
          value: item.current[field.key] || "",
          units: [...LENGTH_UNITS, ...field.keywords],
          placeholder: "auto"
        })
      )
    ).join("");
    return section({ title: "Size", body: rows });
  }
  function bind7({ panel, state, item }) {
    for (const field of FIELDS) {
      bindCombo(
        panel,
        { valueId: field.valueId, unitId: field.unitId },
        (value) => state.updateStyle(item.id, field.key, value)
      );
    }
  }

  // src/ui/sections/layout.js
  var layout_exports = {};
  __export(layout_exports, {
    bind: () => bind8,
    id: () => id8,
    render: () => render8
  });
  var id8 = "layout";
  var DISPLAYS = ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "none"];
  var DISPLAY_SEGMENTS = [
    { value: "block", label: "Block" },
    { value: "flex", label: "Flex" },
    { value: "grid", label: "Grid" },
    { value: "none", label: "None" }
  ];
  var DIRECTIONS = [
    { value: "row", icon: "ArrowRight", title: "Row" },
    { value: "row-reverse", icon: "ArrowLeft", title: "Row reverse" },
    { value: "column", icon: "ArrowDown", title: "Column" },
    { value: "column-reverse", icon: "ArrowUp", title: "Column reverse" }
  ];
  var WRAPS = [
    { value: "nowrap", label: "No" },
    { value: "wrap", label: "Yes" },
    { value: "wrap-reverse", label: "Rev", title: "Wrap reverse" }
  ];
  var JUSTIFY = [
    { value: "flex-start", icon: "AlignHorizontalJustifyStart", title: "Start" },
    { value: "center", icon: "AlignHorizontalJustifyCenter", title: "Center" },
    { value: "flex-end", icon: "AlignHorizontalJustifyEnd", title: "End" },
    { value: "space-between", icon: "AlignHorizontalSpaceBetween", title: "Space between" },
    { value: "space-around", icon: "AlignHorizontalSpaceAround", title: "Space around" },
    { value: "space-evenly", icon: "AlignHorizontalDistributeCenter", title: "Space evenly" }
  ];
  var ALIGN = [
    { value: "stretch", icon: "StretchVertical", title: "Stretch" },
    { value: "flex-start", icon: "AlignStartHorizontal", title: "Start" },
    { value: "center", icon: "AlignCenterHorizontal", title: "Center" },
    { value: "flex-end", icon: "AlignEndHorizontal", title: "End" },
    { value: "baseline", icon: "Baseline", title: "Baseline" }
  ];
  var SYNONYMS = {
    justifyContent: { normal: "flex-start", start: "flex-start", end: "flex-end", left: "flex-start", right: "flex-end" },
    alignItems: { normal: "stretch", start: "flex-start", end: "flex-end" }
  };
  function canonical(key, value) {
    const map = SYNONYMS[key] || {};
    const current = `${value || ""}`.trim();
    return map[current] || current;
  }
  function laysOutChildren(display) {
    return typeof display === "string" && /flex|grid/.test(display);
  }
  function render8(item) {
    const cur = item.current;
    const displayControl = `
    <div class="si-combo si-combo-wide">
      ${segmented({
      id: "display-segments",
      label: "Display",
      value: cur.display,
      options: DISPLAY_SEGMENTS
    })}
      ${selectControl({
      id: "display-select",
      testId: "style_inspector_panel_display_select",
      label: "Display (all values)",
      value: cur.display,
      options: DISPLAYS
    })}
    </div>
  `;
    const rows = [controlRow("Display", displayControl)];
    if (laysOutChildren(cur.display)) {
      rows.push(
        controlRow(
          "Direction",
          segmented({
            id: "flex-direction-segments",
            testId: "style_inspector_panel_flex_direction_select",
            label: "Flex direction",
            value: cur.flexDirection,
            options: DIRECTIONS
          })
        ),
        controlRow(
          "Wrap",
          segmented({
            id: "flex-wrap-segments",
            label: "Flex wrap",
            value: cur.flexWrap,
            options: WRAPS
          })
        ),
        controlRow(
          "Justify",
          segmented({
            id: "justify-content-segments",
            testId: "style_inspector_panel_justify_content_select",
            label: "Justify content",
            value: canonical("justifyContent", cur.justifyContent),
            options: JUSTIFY
          }),
          { wide: true }
        ),
        controlRow(
          "Align",
          segmented({
            id: "align-items-segments",
            testId: "style_inspector_panel_align_items_select",
            label: "Align items",
            value: canonical("alignItems", cur.alignItems),
            options: ALIGN
          }),
          { wide: true }
        )
      );
    }
    return section({ title: "Layout", body: rows.join("") });
  }
  function bind8({ panel, state, item }) {
    const set = (prop, value) => state.updateStyle(item.id, prop, value);
    const select = panel.querySelector("#display-select");
    const segments = panel.querySelector("#display-segments");
    bindSegmented(panel, "#display-segments", (value) => {
      if (select) select.value = value;
      set("display", value);
    });
    bindSelect(panel, "#display-select", (value) => {
      if (segments) {
        segments.querySelectorAll("[data-value]").forEach((button) => {
          const isActive = button.getAttribute("data-value") === value;
          button.classList.toggle("active", isActive);
          button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }
      set("display", value);
    });
    bindSegmented(panel, "#flex-direction-segments", (value) => set("flexDirection", value));
    bindSegmented(panel, "#flex-wrap-segments", (value) => set("flexWrap", value));
    bindSegmented(panel, "#justify-content-segments", (value) => set("justifyContent", value));
    bindSegmented(panel, "#align-items-segments", (value) => set("alignItems", value));
  }

  // src/ui/sections/index.js
  var SECTIONS = [content_exports, size_exports, spacing_exports, layout_exports, typography_exports, color_exports, border_exports, effects_exports];

  // src/ui/sections/align.js
  var HORIZONTAL = [
    { value: "start", icon: "AlignStartVertical", title: "Align left" },
    { value: "center", icon: "AlignCenterVertical", title: "Align horizontal centre" },
    { value: "end", icon: "AlignEndVertical", title: "Align right" },
    { value: "stretch", icon: "StretchHorizontal", title: "Stretch horizontally" }
  ];
  var VERTICAL = [
    { value: "start", icon: "AlignStartHorizontal", title: "Align top" },
    { value: "center", icon: "AlignCenterHorizontal", title: "Align vertical centre" },
    { value: "end", icon: "AlignEndHorizontal", title: "Align bottom" },
    { value: "stretch", icon: "StretchVertical", title: "Stretch vertically" }
  ];
  var SYNONYMS2 = {
    "flex-start": "start",
    "flex-end": "end",
    normal: "stretch",
    auto: ""
  };
  function normalize(value) {
    const key = `${value || ""}`.trim();
    return key in SYNONYMS2 ? SYNONYMS2[key] : key;
  }
  function parentLaysOut(item) {
    const parent = item.element && item.element.parentElement;
    if (!parent || typeof getComputedStyle !== "function") return false;
    return /flex|grid/.test(getComputedStyle(parent).display || "");
  }
  function railGroup(options, axis, value, enabled) {
    const current = normalize(value);
    return options.map(
      (option) => `
        <button type="button"
                class="si-rail-btn ${option.value === current ? "active" : ""}"
                id="rail-${axis}-${option.value}"
                data-rail-axis="${axis}"
                data-value="${option.value}"
                title="${escapeHtml(option.title)}"
                aria-label="${escapeHtml(option.title)}"
                aria-pressed="${option.value === current ? "true" : "false"}"
                ${enabled ? "" : "disabled"}>${siIcon(option.icon, 16)}</button>
      `
    ).join("");
  }
  function render9(item) {
    const enabled = parentLaysOut(item);
    const hint = enabled ? "Place this element inside its parent" : "The parent is not a flex or grid container, so these have no effect";
    return `
    <div class="si-align-rail ${enabled ? "" : "disabled"}"
         data-testid="style_inspector_panel_align_rail"
         role="group" aria-label="Self alignment" title="${escapeHtml(hint)}">
      ${railGroup(HORIZONTAL, "justify", item.current.justifySelf, enabled)}
      <span class="si-rail-divider" aria-hidden="true"></span>
      ${railGroup(VERTICAL, "align", item.current.alignSelf, enabled)}
    </div>
  `;
  }
  function bind9({ panel, state, item }) {
    panel.querySelectorAll("[data-rail-axis]").forEach((button) => {
      button.onclick = () => {
        const axis = button.getAttribute("data-rail-axis");
        const value = button.getAttribute("data-value");
        const property = axis === "justify" ? "justifySelf" : "alignSelf";
        const isActive = button.classList.contains("active");
        panel.querySelectorAll(`[data-rail-axis="${axis}"]`).forEach((other) => {
          const nowActive = !isActive && other === button;
          other.classList.toggle("active", nowActive);
          other.setAttribute("aria-pressed", nowActive ? "true" : "false");
        });
        state.updateStyle(item.id, property, isActive ? "auto" : value);
      };
    });
  }

  // src/ui/panel.js
  var DEFAULT_COLLAPSED = ["corner-radius", "border", "effects"];
  var InspectorPanel = class {
    /**
     * @param {ShadowRoot} shadowRoot
     * @param {import('../core/state.js').InspectorState} state
     */
    constructor(shadowRoot, state) {
      this.shadowRoot = shadowRoot;
      this.state = state;
      this.isMinimized = false;
      this.showInstruction = false;
      this._panelPosition = null;
      this.collapsed = new Set(DEFAULT_COLLAPSED);
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
      const focusedEl = this.shadowRoot.activeElement;
      if (focusedEl && this.panel.contains(focusedEl) && (focusedEl.tagName === "INPUT" || focusedEl.tagName === "SELECT" || focusedEl.tagName === "TEXTAREA")) {
        return;
      }
      const previousBody = this.panel.querySelector(".si-panel-body");
      const scrollTop = previousBody ? previousBody.scrollTop : 0;
      const focusedId = focusedEl && focusedEl.id ? focusedEl.id : null;
      if (this.isMinimized) {
        this.panel.innerHTML = `
        <div class="si-panel-header" title="Drag to move">
          <div class="si-panel-title">
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

      ${this._renderFooter(pinnedList)}
    `;
      this._attachEventListeners(activeItem);
      this._initDraggable();
      this._restoreScroll(scrollTop, focusedId);
    }
    /**
     * Puts the body back where it was after a rebuild, and returns focus to the
     * control that had it.
     * @param {number} scrollTop
     * @param {string|null} focusedId
     */
    _restoreScroll(scrollTop, focusedId) {
      const body = this.panel.querySelector(".si-panel-body");
      if (body && scrollTop) body.scrollTop = scrollTop;
      if (!focusedId) return;
      const refocus = this.panel.querySelector(`#${CSS.escape(focusedId)}`);
      if (refocus && typeof refocus.focus === "function") refocus.focus({ preventScroll: true });
    }
    /**
     * Footer: export settings, then the session-wide actions.
     * @param {Array<object>} pinnedList
     * @returns {string}
     */
    _renderFooter(pinnedList) {
      const formatOptions = EXPORT_FORMATS.map(
        (format) => `<option value="${format.id}" ${this.state.exportFormat === format.id ? "selected" : ""}>${format.label}</option>`
      ).join("");
      const unitOptions = EXPORT_UNITS.map(
        (unit) => `<option value="${unit}" ${this.state.exportUnit === unit ? "selected" : ""}>${unit}</option>`
      ).join("");
      const instruction = this.state.customInstruction || "";
      return `
      <div class="si-panel-footer">
        <div class="si-export-settings">
          <label class="si-select-wrap si-export-select">
            <select id="si-export-format" data-testid="style_inspector_panel_export_format_select"
                    aria-label="Export format">${formatOptions}</select>
            ${siIcon("ChevronDown", 12)}
          </label>
          <label class="si-select-wrap si-export-select">
            <select id="si-export-unit" data-testid="style_inspector_panel_export_unit_select"
                    aria-label="Export unit">${unitOptions}</select>
            ${siIcon("ChevronDown", 12)}
          </label>
          <button class="si-btn-icon ${this.showInstruction ? "active" : ""}"
                  id="si-instruction-toggle"
                  title="${this.showInstruction ? "Hide" : "Edit"} the instruction appended to the export">
            ${siIcon("Zap", 13)}
          </button>
        </div>

        ${this.showInstruction ? `<div class="si-field-block">
                 <textarea class="si-textarea si-instruction-input"
                           id="si-instruction-input"
                           data-testid="style_inspector_panel_instruction_input"
                           rows="3"
                           placeholder="Leave empty to use the default instruction\u2026">${escapeHtml(instruction)}</textarea>
               </div>` : ""}

        <div class="si-action-row">
          <button class="si-btn si-btn-primary" data-testid="style_inspector_panel_export_button" id="si-export-all-btn">
            Copy to Clipboard
          </button>
          <button class="si-btn si-btn-secondary si-btn-square" id="si-download-btn"
                  data-testid="style_inspector_panel_download_button"
                  title="Download the export as a file"
                  aria-label="Download the export as a file">
            ${siIcon("Download", 15)}
          </button>
          <button class="si-btn si-btn-danger si-btn-square" id="si-clear-all-btn"
                  title="Revert every element and discard the session (${pinnedList.length} pinned)"
                  aria-label="Revert every element and discard the session">
            ${siIcon("Trash2", 15)}
          </button>
        </div>
      </div>
    `;
    }
    /**
     * Options every export call needs: which format, which unit, and the
     * instruction override if the user set one.
     * @returns {{ format: string, unit: string, instruction: string }}
     */
    _exportOptions() {
      return {
        format: this.state.exportFormat,
        unit: this.state.exportUnit,
        instruction: (this.state.customInstruction || "").trim()
      };
    }
    _renderActiveItemBody(item) {
      return `
      <div class="si-panel-body">
        <div class="si-target-info">
          <span class="si-target-selector" title="${escapeHtml(item.selector)}">${escapeHtml(item.selector)}</span>
          <div class="si-target-actions">
            <button class="si-btn-icon" id="si-copy-selector-btn"
                    title="Copy selector" aria-label="Copy selector">${siIcon("Copy")}</button>
            <button class="si-btn-icon" id="si-copy-item-btn"
                    data-testid="style_inspector_panel_copy_item_button"
                    title="Copy this element's changes as markdown"
                    aria-label="Copy this element's changes as markdown">${siIcon("Clipboard")}</button>
          </div>
        </div>

        ${render9(item)}

        ${SECTIONS.map((section2) => section2.render(item)).join("")}

        <!-- Context & Notes Field -->
        ${section({
        title: "Notes",
        body: `<textarea class="si-textarea" id="si-notes-input"
                    placeholder="e.g. Instance of repeated card, desktop breakpoint only...">${escapeHtml(
          item.notes || ""
        )}</textarea>`
      })}

        <!-- Element-Level Actions -->
        <div class="si-action-row">
          <button class="si-btn si-btn-secondary" data-testid="style_inspector_panel_reset_button" id="si-reset-item-btn"
                  title="Revert this element to the styles it had when it was pinned">
            Reset this element
          </button>
        </div>
      </div>
    `;
    }
    _attachEventListeners(activeItem) {
      this._applyCollapsedState();
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
          const removeTarget = e.target.closest("[data-remove]");
          const removeId = removeTarget ? removeTarget.getAttribute("data-remove") : null;
          if (removeId) {
            e.stopPropagation();
            this.state.unpinElement(removeId);
          } else {
            const id9 = pill.getAttribute("data-id");
            this.state.setActivePinnedId(id9);
          }
        };
      });
      const clearAllBtn = this.panel.querySelector("#si-clear-all-btn");
      if (clearAllBtn) {
        clearAllBtn.onclick = () => {
          if (confirm("Reset all elements and discard the whole session?")) {
            this.state.clearAll();
          }
        };
      }
      const formatSelect = this.panel.querySelector("#si-export-format");
      if (formatSelect) {
        formatSelect.onchange = (e) => this.state.setExportFormat(e.target.value);
      }
      const unitSelect = this.panel.querySelector("#si-export-unit");
      if (unitSelect) {
        unitSelect.onchange = (e) => this.state.setExportUnit(e.target.value);
      }
      const instructionToggle = this.panel.querySelector("#si-instruction-toggle");
      if (instructionToggle) {
        instructionToggle.onclick = () => {
          this.showInstruction = !this.showInstruction;
          this.render();
        };
      }
      const instructionInput = this.panel.querySelector("#si-instruction-input");
      if (instructionInput) {
        instructionInput.oninput = (e) => {
          this.state.customInstruction = e.target.value;
        };
      }
      const exportAllBtn = this.panel.querySelector("#si-export-all-btn");
      if (exportAllBtn) {
        exportAllBtn.onclick = async () => {
          const options = this._exportOptions();
          const text = generateExport(this.state.getPinnedList(), options);
          const ok = await copyToClipboard(text);
          if (ok) {
            this.showToast(`${options.format.toUpperCase()} export copied to clipboard!`);
          } else {
            alert("Failed to copy to clipboard. Please allow clipboard permissions.");
          }
        };
      }
      const downloadBtn = this.panel.querySelector("#si-download-btn");
      if (downloadBtn) {
        downloadBtn.onclick = () => {
          const options = this._exportOptions();
          const text = generateExport(this.state.getPinnedList(), options);
          if (downloadExport(text, options.format)) {
            this.showToast("Export downloaded.");
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
          const group = el.getAttribute("data-switch");
          const flag = SHORTHAND_GROUPS.find((candidate) => candidate.name === group);
          if (!flag) return;
          this.state.setLinked(activeItem.id, group, !activeItem[flag.linkFlag]);
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
          const markdown = generateSingleItemExport(activeItem, this._exportOptions());
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
      const context = {
        panel: this.panel,
        state: this.state,
        item: activeItem,
        showToast: (message) => this.showToast(message)
      };
      bind9(context);
      for (const section2 of SECTIONS) {
        section2.bind(context);
      }
    }
    /**
     * Reflects the collapse set onto the freshly rendered sections and wires the
     * toggles. The handlers mutate classes directly instead of re-rendering: a
     * rebuild would reset the body's scroll position, which is exactly what a
     * user folding a section away is trying to avoid.
     */
    _applyCollapsedState() {
      this.panel.querySelectorAll(".si-section[data-section]").forEach((el) => {
        el.classList.toggle("collapsed", this.collapsed.has(el.getAttribute("data-section")));
      });
      this.panel.querySelectorAll("[data-toggle]").forEach((button) => {
        button.onclick = (event) => {
          event.stopPropagation();
          const key = button.getAttribute("data-toggle");
          const isCollapsed = !this.collapsed.has(key);
          if (isCollapsed) {
            this.collapsed.add(key);
          } else {
            this.collapsed.delete(key);
          }
          const target = this.panel.querySelector(`.si-section[data-section="${key}"]`);
          if (target) target.classList.toggle("collapsed", isCollapsed);
        };
      });
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
      .si-overlay-container, .si-hover-box, .si-hover-tag, .si-pinned-box, .si-pinned-tag,
      .si-hover-margin, .si-hover-padding {
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
    /**
     * True when the host page currently has focus in a field where a bare
     * keystroke is meaningful text input rather than a shortcut.
     */
    _isEditingHostPage() {
      const active = document.activeElement;
      if (!active || this._isInsideInspector(active)) return false;
      if (active.isContentEditable) return true;
      const tag = active.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    }
    _onKeyDown(e) {
      if (e.key === "Escape" && this.state.isInspecting) {
        this.state.stopInspecting();
        return;
      }
      const isSKey = e.code === "KeyS" || e.key === "S" || e.key === "s";
      if (e.altKey && e.shiftKey && isSKey && !this._isEditingHostPage()) {
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
    /**
     * Copies the session export using the panel's current format and unit.
     * @param {{ format?: string, unit?: string, instruction?: string }} [options]
     * @returns {Promise<string>}
     */
    async exportAll(options = {}) {
      const text = generateExport(this.state.getPinnedList(), {
        format: this.state.exportFormat,
        unit: this.state.exportUnit,
        instruction: (this.state.customInstruction || "").trim(),
        ...options
      });
      await copyToClipboard(text);
      this.panel.showToast();
      return text;
    }
    resetAll() {
      this.state.resetAllStyles();
    }
    clearAll() {
      this.state.clearAll();
    }
    destroy() {
      window.removeEventListener("pointermove", this._onPointerMove, true);
      window.removeEventListener("mousemove", this._onPointerMove, true);
      window.removeEventListener("click", this._onClickCapture, true);
      window.removeEventListener("keydown", this._onKeyDown, true);
      if (this.overlay) {
        this.overlay.destroy();
      }
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
lucide/dist/esm/icons/align-center-horizontal.mjs:
lucide/dist/esm/icons/align-center-vertical.mjs:
lucide/dist/esm/icons/align-end-horizontal.mjs:
lucide/dist/esm/icons/align-end-vertical.mjs:
lucide/dist/esm/icons/align-horizontal-distribute-center.mjs:
lucide/dist/esm/icons/align-horizontal-justify-center.mjs:
lucide/dist/esm/icons/align-horizontal-justify-end.mjs:
lucide/dist/esm/icons/align-horizontal-justify-start.mjs:
lucide/dist/esm/icons/align-horizontal-space-around.mjs:
lucide/dist/esm/icons/align-horizontal-space-between.mjs:
lucide/dist/esm/icons/align-start-horizontal.mjs:
lucide/dist/esm/icons/align-start-vertical.mjs:
lucide/dist/esm/icons/arrow-down.mjs:
lucide/dist/esm/icons/arrow-left.mjs:
lucide/dist/esm/icons/arrow-right.mjs:
lucide/dist/esm/icons/arrow-up.mjs:
lucide/dist/esm/icons/baseline.mjs:
lucide/dist/esm/icons/bold.mjs:
lucide/dist/esm/icons/check.mjs:
lucide/dist/esm/icons/chevron-down.mjs:
lucide/dist/esm/icons/clipboard.mjs:
lucide/dist/esm/icons/copy.mjs:
lucide/dist/esm/icons/download.mjs:
lucide/dist/esm/icons/maximize-2.mjs:
lucide/dist/esm/icons/minimize-2.mjs:
lucide/dist/esm/icons/minus.mjs:
lucide/dist/esm/icons/move-horizontal.mjs:
lucide/dist/esm/icons/palette.mjs:
lucide/dist/esm/icons/pin.mjs:
lucide/dist/esm/icons/plus.mjs:
lucide/dist/esm/icons/rotate-ccw.mjs:
lucide/dist/esm/icons/stretch-horizontal.mjs:
lucide/dist/esm/icons/stretch-vertical.mjs:
lucide/dist/esm/icons/strikethrough.mjs:
lucide/dist/esm/icons/text-align-center.mjs:
lucide/dist/esm/icons/text-align-end.mjs:
lucide/dist/esm/icons/text-align-justify.mjs:
lucide/dist/esm/icons/text-align-start.mjs:
lucide/dist/esm/icons/trash.mjs:
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
