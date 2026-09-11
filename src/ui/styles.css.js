/**
 * Encapsulated CSS styles for Style Inspector Shadow DOM
 */

/*
 * No remote @import here on purpose: this stylesheet is injected into arbitrary
 * host pages, and a strict style-src/font-src CSP blocks a Google Fonts import
 * silently. The stack below picks up a locally installed Inter and otherwise
 * falls back to the platform UI font.
 *
 * Every colour, radius, and metric below comes from the token block on :host.
 * Nothing outside that block should carry a raw hex value — the palette is a
 * dark, borderless, Framer-style surface set, and having it in one place is
 * what lets it be retuned without hunting through 800 lines of rules.
 */
export const inspectorStyles = `
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
   * Overlay hues stay the familiar DevTools ones — cyan for the hovered box,
   * amber for a pinned one, orange/green for the margin and padding bands — so
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
 * of the element is tinted or covered — the result of a tweak stays visible
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
 * While the user is editing a pinned element — a panel field has focus, a
 * scrub handle is being dragged, or a value just changed — its outline fades
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
 * A section's own action — the "Link all" switch — hides while the section is
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

/* Segmented control — one filled track, the current option lit */
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

/* Align rail — self-alignment, above the first section */
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
 * it still takes a typed value, which is why this replaced the slider pairs —
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
 * press — Framer's own secondary button ("Invite") is a filled pill too, and
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
 * another surface — a section header, a field — never for a standalone action
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
