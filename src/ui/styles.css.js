/**
 * Encapsulated CSS styles for Style Inspector Shadow DOM
 */

export const inspectorStyles = `
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
