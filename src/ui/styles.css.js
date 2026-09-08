/**
 * Encapsulated CSS styles for Style Inspector Shadow DOM
 */

export const inspectorStyles = `
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
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
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
