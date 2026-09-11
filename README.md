# 🎨 Style Inspector

> Internal browser-based visual adjustment tool that lets developers and designers select elements on running web pages, visually adjust spacing and typography live in the DOM, and export structured Markdown instructions ready to paste into **Antigravity**.

---

## ✨ Features

- **DOM Element Inspection**: Hover with high-contrast outlines and info badges displaying tag names and automation IDs (`data-testid`).
- **Multi-Element Pinning**: Pin multiple elements across a page in a single session.
- **Text Content Editing**: Rewrite an element's copy live in the page and export it alongside the style changes. The tool classifies each pinned element first, so an edit never destroys child elements:
  - Elements with no element children are edited through their whole text content.
  - Elements mixing text and markup (e.g. `<p>Hello <b>world</b></p>`) have their single text run edited in place — sibling elements are left untouched.
  - Elements holding several separate text runs are not editable; the panel says which child to pin instead.
  - Surrounding markup whitespace and indentation are preserved on write.
- **Real-Time Visual Adjustments**:
  - **Padding**: 4 sides (Top, Right, Bottom, Left), or a single value driving all four (`link all sides`).
  - **Margin**: 4 sides (Top, Right, Bottom, Left), or a single value driving all four (`link all sides`).
  - **Gap**: Flex and Grid gap — drag the handle to scrub the value, or type it.
  - **Typography**: Font-size, Line-height, Letter-spacing (px), Font-weight (100–900), Text-transform, Text-align (`left`, `center`, `right`, `justify`), and Font-family.
  - **Colors**: Text color and Background-color with dual picker & hex/rgb text input.
  - **Border**: Corner radius (4 corners, or a single value driving all four), border width, style, and color.
  - **Effects**: Box-shadow (free text plus ready-made presets) and Opacity (drag-scrub or typed).
  - **Size**: Width, Height, Max-width — a number paired with a unit dropdown (`px`, `%`, `rem`, `em`, `vw`, `vh`, plus keywords like `auto` and `fit-content`). An expression the dropdown cannot model, such as `min(640px, 90vw)` or `calc(100% - 2rem)`, stays typable in the value field and round-trips unchanged.
  - **Layout**: Display (a segmented track for the common values, with a dropdown holding all eight), plus Flex direction / wrap / justify / align as segmented icon controls, which appear only when the element's own `display` actually lays out children.
  - **Align rail**: eight icons above the sections place the element inside its parent — `justify-self` and `align-self`, left/centre/right/stretch and top/middle/bottom/stretch. Clicking the lit icon clears the placement. The rail disables itself when the parent is not a flex or grid container, since the properties would have no effect there.
  - **Collapsible sections**: every section folds away; Corner Radius, Border and Effects start collapsed to keep the panel short.
- **Box-Model Overlay**: Hovering shades the element's margin and padding bands the way DevTools does, so spacing is visible before you change it.
- **Zero-Pollution Shadow DOM**: Built inside an isolated Shadow DOM (`mode: 'open'`), ensuring host website CSS (Tailwind, Bootstrap, etc.) never affects the tool and tool styles never leak into the host page. No remote fonts are loaded, so the panel renders correctly on sites with a strict Content-Security-Policy.
- **Per-Element Context & Notes**: Attach optional flags (e.g. *"instance of repeated card component"*, *"desktop breakpoint only"*).
- **Session History & Reset**: **Reset this element** returns one pinned element to its baseline; the trash button in the footer reverts every element and discards the session. Text can be reverted independently of styles. (There is no separate "Reset All" button — it was the same revert as discarding the session, minus the unpin. `inspector.resetAll()` still does it from script.)
- **Export in Three Formats**: **Markdown** (prose for an AI coding agent), **CSS** (a declaration block per selector, with the previous value kept as a comment), or **JSON** (structured, for tooling). Copy to clipboard or download as a file.
- **Unit Conversion**: Export lengths as `px`, `rem`, or `em` instead of asking the agent to convert them. `rem` resolves against the root font size; `em` against the element's own — and `font-size` against its parent, so it is not trivially reported as `1em`.
- **Custom Instruction**: Replace the instruction line appended to the export with your own, e.g. *"Only touch the design tokens file."*

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
| **Edit Element Text** | Type in the panel's **Content** box for the active element |
| **Peek at the Bare Page** | Hold `H` to hide every outline; release to bring them back |
| **Export All to Clipboard** | Click "Copy to Clipboard" in the panel footer |
| **Save Export as a File** | Click "Download" in the panel footer |

`Alt+Shift+S` is deliberately ignored while focus is inside an `input`, `textarea`, `select`, or `contenteditable` region of the host page, so the shortcut cannot fire mid-typing. The same applies to `H`, on the host page and inside the panel alike.

Outlines are drawn outside the element with no fill, so nothing you are tuning is ever tinted or covered. While a panel field has focus, or for a moment after any value changes, the active element's outline fades out on its own so the result can be judged against the untouched page.

---

## 🤖 Antigravity Export Format

Clicking **"Export All to Clipboard"** (or per-element copy) generates structured Markdown:

```markdown
## Style Adjustment Request

2 elements · 5 style changes · 1 copy change · lengths in `px`

### 1. `[data-testid="dashboard_page_stat_card"]`

`<div [testid]>`

| Property | From | To |
| --- | --- | --- |
| `padding` | `12px` | `20px` |
| `gap` | `8px` | `16px` |

### 2. `[data-testid="dashboard_page_stat_card_title"]`

`<h3 [testid]>`

**Text:** "Total Revenue" → "Gross Revenue"

| Property | From | To |
| --- | --- | --- |
| `font-size` | `14px` | `16px` |
| `line-height` | `1.2` | `1.4` |

> **Note:** desktop breakpoint only

---

### How to apply

- Apply the changes above to the source that renders each element — the component, template, or stylesheet it comes from.
- Each heading is a `data-testid` attribute that already exists in the source. Search for it to find the element.
- Use whichever styling mechanism the project already uses for that element — stylesheet, CSS module, utility classes, CSS-in-JS. Do not introduce inline styles unless the file already works that way.
- The `From` column is the computed value at the time of inspection, not necessarily what the source declares. When a value comes from a shared class or a design token, change it where it is defined, or add a narrower override if that shared rule has other users.
- A **Text** line is a copy change. It belongs to the template, component, or i18n catalogue that produces the string, never to a stylesheet.
- A **Note** line is context from whoever requested the change, and may constrain where the edit belongs.
```

Text changes lead the style changes for an element, and multi-line copy is emitted as a fenced block rather than inline. An element whose line-height is browser-default reports `normal → 1.5` rather than inventing a numeric "before" value.

**The instruction is assembled from what the export contains, not pasted in whole.** A style-only export does not carry the paragraph about copy changes; an export whose selectors are structural paths rather than `data-testid` attributes says so instead of claiming otherwise. A custom instruction replaces the composed one entirely.

### Other formats

Pick **CSS** from the footer to get something you can paste straight into a stylesheet — only the target values, with the previous one kept as a comment:

```css
/* text: "Total Revenue" → "Gross Revenue" */
[data-testid="dashboard_page_stat_card_title"] {
  font-size: 2rem; /* was 1.25rem */
  padding: 1.5rem; /* was 0.75rem */
}
```

Pick **JSON** to consume the same information as data — `{ unit, instruction, elements: [{ selector, label, text, changes, notes }] }`.

CSS cannot express a copy change, so `text:` appears as a comment above the block. There is no separate SCSS option: the selectors this tool emits are flat, so a SCSS file would be byte-identical to the CSS one.

### Units

The **unit** dropdown converts lengths on the way out; the page itself is always adjusted in px. `%` is deliberately not offered — its basis differs per property (the containing block's width for padding, the parent font size for font-size, the element's own for line-height), so a single session-wide percentage setting would emit confidently wrong numbers.

Simply paste this directly into your Antigravity prompt:
> *"Apply the following style adjustments to the relevant components and review the diff."*

---

## 🏷️ Internal Automation IDs

In accordance with PRD Section 8, all tool interactive elements implement specific `data-testid` attributes:

| Element | Automation ID |
| --- | --- |
| Toggle button to enable/disable the inspector | `style_inspector_toolbar_toggle_button` |
| Adjustment panel | `style_inspector_panel_modal` |
| Text content input | `style_inspector_panel_text_content_input` |
| Padding input | `style_inspector_panel_padding_input` (with `data-side="all|top|right|bottom|left"`) |
| Margin input | `style_inspector_panel_margin_input` (with `data-side="all|top|right|bottom|left"`) |
| Gap input | `style_inspector_panel_gap_input` |
| Font-size input | `style_inspector_panel_font_size_input` |
| Line-height input | `style_inspector_panel_line_height_input` |
| Font-weight select | `style_inspector_panel_font_weight_select` |
| Text-transform select | `style_inspector_panel_text_transform_select` |
| Text-align button group (buttons carry `data-align="left\|center\|right\|justify"`) | `style_inspector_panel_text_align_group` |
| Font color input | `style_inspector_panel_color_input` |
| Background color input | `style_inspector_panel_bg_color_input` |
| Font-family input | `style_inspector_panel_font_family_input` |
| Border-radius input | `style_inspector_panel_border_radius_input` (with `data-side="all\|top-left\|top-right\|bottom-right\|bottom-left"`) |
| Border width / style / color | `style_inspector_panel_border_width_input`, `..._border_style_select`, `..._border_color_input` |
| Box-shadow input | `style_inspector_panel_box_shadow_input` |
| Opacity input | `style_inspector_panel_opacity_input` |
| Size inputs | `style_inspector_panel_width_input`, `..._height_input`, `..._max_width_input` (each paired with a unit select `#width-unit`, `#height-unit`, `#max-width-unit`) |
| Layout controls | `style_inspector_panel_display_select` (dropdown), and the segmented tracks `..._flex_direction_select`, `..._justify_content_select`, `..._align_items_select` (buttons carry `data-value`) |
| Align rail | `style_inspector_panel_align_rail` (buttons carry `data-rail-axis="justify\|align"` and `data-value="start\|center\|end\|stretch"`) |
| Link-all-sides toggle (padding/margin/border-radius) | `style_inspector_panel_link_sides_switch` (with `data-switch="padding\|margin\|border-radius"`) |
| Per-element reset button | `style_inspector_panel_reset_button` |
| List of pinned elements | `style_inspector_panel_pinned_item` |
| Export format select | `style_inspector_panel_export_format_select` |
| Export unit select | `style_inspector_panel_export_unit_select` |
| Custom instruction textarea | `style_inspector_panel_instruction_input` |
| Download button | `style_inspector_panel_download_button` |
| Export/copy-all button | `style_inspector_panel_export_button` |
| Per-element copy button | `style_inspector_panel_copy_item_button` |

---

## 🛠️ Development & Building

```bash
# Run unit tests
npm test

# Run the headless browser end-to-end test
npm run test:e2e

# Build all distribution artifacts (standalone bundle, minified, bookmarklet, extension)
npm run build

# Start local demo server
npm start
```

`test:e2e` locates a Chromium-family browser automatically on macOS, Windows, and Linux, and skips with a message when none is installed. Override the binary with `SI_BROWSER=/path/to/chrome npm run test:e2e`.
