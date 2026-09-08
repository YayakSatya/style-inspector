# 🎨 Style Inspector

> Internal browser-based visual adjustment tool that lets developers and designers select elements on running web pages, visually adjust spacing and typography live in the DOM, and export structured Markdown instructions ready to paste into **Antigravity**.

---

## ✨ Features

- **DOM Element Inspection**: Hover with high-contrast outlines and info badges displaying tag names and automation IDs (`data-testid`).
- **Multi-Element Pinning**: Pin multiple elements across a page in a single session.
- **Real-Time Visual Adjustments**:
  - **Padding**: 4 sides (Top, Right, Bottom, Left) or unified master slider (`link all sides`).
  - **Margin**: 4 sides (Top, Right, Bottom, Left) or unified master slider (`link all sides`).
  - **Gap**: Flex and Grid gap slider + manual input.
  - **Typography**: Font-size, Line-height, and Letter-spacing sliders + number inputs.
- **Zero-Pollution Shadow DOM**: Built inside an isolated Shadow DOM (`mode: 'open'`), ensuring host website CSS (Tailwind, Bootstrap, etc.) never affects the tool and tool styles never leak into the host page.
- **Per-Element Context & Notes**: Attach optional flags (e.g. *"instance of repeated card component"*, *"desktop breakpoint only"*).
- **Session History & Reset**: Reset individual elements or all elements back to their initial baseline.
- **Antigravity Markdown Exporter**: One-click copy formatted Markdown with automation IDs, deltas (e.g. `padding: 12px → 20px`), notes, and AI instructions.

---

## 🚀 Ways to Run

### Method 1: Bookmarklet (Easiest)
1. Open [`dist/bookmarklet.html`](dist/bookmarklet.html) in your browser.
2. Drag the **"🎨 Style Inspector"** button onto your browser's Bookmarks bar (press `Ctrl+Shift+B` to show bookmarks).
3. Navigate to any running web application (e.g. `http://localhost:3000`).
4. Click the bookmarklet to toggle inspector mode!

Alternatively, copy the raw bookmarklet string from [`dist/bookmarklet.txt`](dist/bookmarklet.txt) and paste it into a new bookmark's URL field.

---

### Method 2: Chrome Extension (Manifest V3)
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the [`extension/`](extension/) directory from this repository.
4. Now you can toggle the inspector by clicking the extension icon or pressing `Alt+Shift+S`.

---

### Method 3: Browser DevTools Console
Copy the contents of [`dist/style-inspector.js`](dist/style-inspector.js) and paste it directly into your browser's DevTools Console (`F12` or `Ctrl+Shift+I`).

---

### Method 4: Local Demo & Playground
Run the built-in local static server:
```bash
npm start
```
Then visit:
- **Interactive Playground**: [http://localhost:3000/demo/index.html](http://localhost:3000/demo/index.html)
- **Bookmarklet Installer**: [http://localhost:3000/dist/bookmarklet.html](http://localhost:3000/dist/bookmarklet.html)

---

## ⌨️ Shortcuts & Controls

| Action | Shortcut / Trigger |
| --- | --- |
| **Toggle Inspector Mode** | Floating badge at bottom-right or `Alt+Shift+S` |
| **Exit Inspector Mode** | `Escape` key |
| **Pin Element** | Left-click any element while inspector is active |
| **Switch Active Pinned Element** | Click the element pill in the panel's pinned carousel |
| **Remove Pinned Element** | Click the `×` icon on the element pill |
| **Export All to Clipboard** | Click "Export All to Clipboard" or press the button in panel |

---

## 🤖 Antigravity Export Format

Clicking **"Export All to Clipboard"** (or per-element copy) generates structured Markdown strictly matching PRD Section 7.3:

```markdown
## Style Adjustment Request

### Element: `[data-testid="dashboard_page_stat_card"]`
- padding: 12px → 20px
- gap: 8px → 16px

### Element: `[data-testid="dashboard_page_stat_card_title"]`
- font-size: 14px → 16px
- line-height: 1.2 → 1.4

Instruction: Apply the changes above to the relevant SCSS/style file(s). The selectors above reference the automation-id (data-testid) already present in the source code — find the element with that attribute. Values are in px as read from the browser; convert to the file's existing unit convention (rem/em/%) if applicable.
```

Simply paste this directly into your Antigravity prompt:
> *"Apply the following style adjustments to the relevant components and review the diff."*

---

## 🏷️ Internal Automation IDs

In accordance with PRD Section 8, all tool interactive elements implement specific `data-testid` attributes:

| Element | Automation ID |
| --- | --- |
| Toggle button to enable/disable the inspector | `style_inspector_toolbar_toggle_button` |
| Adjustment panel | `style_inspector_panel_modal` |
| Padding input | `style_inspector_panel_padding_input` (with `data-side="all|top|right|bottom|left"`) |
| Margin input | `style_inspector_panel_margin_input` (with `data-side="all|top|right|bottom|left"`) |
| Gap input | `style_inspector_panel_gap_input` |
| Font-size input | `style_inspector_panel_font_size_input` |
| Line-height input | `style_inspector_panel_line_height_input` |
| Link-all-sides toggle (padding/margin) | `style_inspector_panel_link_sides_switch` |
| Per-element reset button | `style_inspector_panel_reset_button` |
| List of pinned elements | `style_inspector_panel_pinned_item` |
| Export/copy-all button | `style_inspector_panel_export_button` |
| Per-element copy button | `style_inspector_panel_copy_item_button` |

---

## 🛠️ Development & Building

```bash
# Run unit tests
npm test

# Build all distribution artifacts (standalone bundle, minified, bookmarklet, extension)
npm run build

# Start local demo server
npm start
```
