# Framer-style UI Refit — Audit & Implementation Plan

Status: **complete** (2026-09-10) — all ten phases have landed. 88 unit tests and
the browser E2E (now covering collapse, segmented controls, the align rail, the unit
combo and drag-scrub) pass; `dist/`, `extension/` and the README are up to date.

One bug surfaced after the phases closed and is fixed: clicking any control that
applies a style *without holding focus* — a segmented button, the align rail, a
link-all switch — jumped the panel back to the top. `updateStyle` triggers a full
`innerHTML` rebuild, and the focus guard in `render()` only covers INPUT / SELECT /
TEXTAREA, so the replacement `.si-panel-body` was born at `scrollTop` 0. `render()`
now captures the body's scroll offset and the focused control's id before the
rebuild and restores both afterwards (`_restoreScroll`); segments and rail buttons
carry stable ids so focus can land back on the exact button. Covered by e2e 8f.

Two follow-ups landed after that: the markdown export was reshaped (tables, a
summary line, and an instruction assembled from what the export actually contains
rather than one static paragraph), and the footer was thinned out. **Reset All** was
removed — it was a strict subset of Clear Pins, the same revert minus the unpin,
while per-element Reset covers undoing one element; `inspector.resetAll()` remains
for scripted use. Download and Clear Pins became square icon buttons so the primary
Copy to Clipboard takes the width, and "Copy Item MD" moved up to the selector row as
an icon beside "copy selector".

Anything picked up from here is new work, not a continuation. The obvious
candidates, none of them planned: the pinned-element bar is still a pill strip
rather than a real tab row; `width` still shows a computed float
(`64.4375`) for an auto-sized element; and the panel is fixed at 380px wide.
Created: 2026-09-10
Goal: rework the Style Inspector panel so it reads and behaves like the Framer
right-hand Style panel, without losing any existing capability or test id.

---

## 1. Reference — what the Framer panel actually does

Derived from the Framer Style-panel screenshot supplied with the request.

| Zone | Observed detail |
|---|---|
| Top bar | Avatar (blue rounded square), play icon, `Invite` (ghost pill), `Publish` (solid blue pill). All ~36px tall, ~8px radius, sentence case. |
| Tab row | Segmented `Agent` / `Style`. Active tab is a filled pill (~#2b2b2b); inactive is dim text. No borders. |
| Align rail | Eight bare icon buttons in one row — no boxes, stroke ~#7a7a7a — fenced by hairlines above and below. |
| Section header | Title in white ~14px semi-bold, **sentence case, no letter-spacing**. Right side carries a `+` (add) or `−` (collapse) affordance. |
| Row | Fixed left label column (~100px) in #999 sentence case; the control fills the remaining width. |
| Input | Fill #242424, **no border**, 8px radius, ~40px tall, white text, #6b6b6b placeholder. |
| Combo | Value and unit are two separate fields side by side (`100%` + `Rel`, `648` + `Fit`). |
| Segmented | `Stack\|Grid`, `↔\|↕`, `Yes\|No`, and a 3-icon align group. One container; the active segment is a lighter fill. |
| Divider | Full-width 1px hairline (#2a2a2a) between sections with ~16px vertical padding — not a border under the title. |
| Accent | Blue #0099ff, used only for the primary CTA and active state. No glows. |

## 2. Audit — where the current tool diverges

### `src/ui/styles.css.js`

1. **Uppercase everywhere.** `.si-panel-title`, `.si-section-header`, `.si-btn`,
   `.si-toolbar-label`, `.si-toast`, `.si-banner-left`, `.si-text-meta`,
   `.si-spacing-label` all use `text-transform: uppercase` plus
   `letter-spacing: .06em`. Framer uses none of this. Largest single visual gap.
2. **Inconsistent radius.** A mix of `0`, `--si-r-sm: 4px`, and `--si-r-md: 10px`.
   Framer is a consistent 8px.
3. **Inverted control contrast.** Every control is `border: 1px solid #262626`
   over a `#111` fill, i.e. darker than the panel body. Framer uses a borderless
   fill *lighter* than the panel.
4. **Control heights disagree**: 36px (input/select), 32px (`.si-spacing-pill`),
   30px (export select), 28px (colour swatch).
5. **Label column is 72px** (`.si-control-label`) — "Font family" and "Max width"
   crowd their controls.
6. **Accent is `#3b82f6`** with blue glow shadows on the toolbar and toast.
   Framer is flat, `#0099ff`, no glow.
7. **Sections cannot collapse.** Eight always-open sections make for a long
   scroll. Framer offers `−` / `+`.
8. `.si-section-header` uses `border-bottom` rather than a between-section divider.
9. ~60 hardcoded hex values; only three radius variables. There is no colour token layer.

### `src/ui/sections/*`

10. **Dropdowns where Framer uses segmented controls**: `display`,
    `flexDirection`, `flexWrap`, `justifyContent`, `alignItems`. Five stacked
    selects in `layout.js` is exactly the pattern Framer avoids.
11. **Size is free text** (`auto, 320px, 100%`, `src/ui/sections/size.js`).
    Framer pairs a number with a unit dropdown (`Rel` / `Fit` / `px` / `%`).
    Free text is more expressive but slower for the common case.
12. **Slider + number for `gap` and `opacity`** consumes a whole row per property.
    Framer drag-scrubs the number field instead.
13. **No align rail** (the row of eight icons).
14. **Section order** (content, spacing, typography, color, border, effects, size,
    layout) does not match the Framer mental model (position, size, layout,
    typography, fill, border, effects).
15. `.si-typography-grid` (2-column) is already the closest thing to Framer in the
    codebase — it should become the pattern for the other sections.

### `src/ui/toolbar.js`

16. `.si-toolbar` is uppercase, lifts on hover (`translateY(-2px)`), and glows —
    far from Framer's flat chrome.

---

## 3. Implementation plan

Phases are ordered so that stopping after any one of them still leaves the UI
coherent. Tick the boxes as they land.

### Phase 0 — token layer  `[x]`

File: `src/ui/styles.css.js`, the `:host` block.

```css
--si-bg:#0f0f0f; --si-bg-raised:#161616; --si-fill:#242424;
--si-fill-hover:#2c2c2c; --si-fill-active:#333333;
--si-line:#2a2a2a; --si-text:#ededed; --si-text-dim:#999999;
--si-text-mute:#6b6b6b; --si-accent:#0099ff; --si-accent-hover:#33adff;
--si-danger:#ff4d4d;
--si-r:8px; --si-r-sm:6px; --si-r-pill:9999px;
--si-h:36px;              /* single-control height */
--si-label-w:100px;
--si-gap:8px; --si-pad:16px;
```

Replace every hex literal with a variable. Drop `--si-r-md: 10px` and
`--si-r-sm: 4px`. Pure find-and-replace; no JavaScript changes.

**Landed as:** the token block also carries the overlay hues
(`--si-hover`, `--si-pin`, `--si-margin-band`, `--si-padding-band`,
`--si-overlay-text`) and `--si-neutral` / `--si-neutral-hover` for `.si-btn-white`,
so no raw hex survives outside `:host`. The overlay boxes deliberately keep
`border-radius: 0` — they trace real element geometry and a rounded outline would
misreport where the box ends. Focus rings were recoloured to `--si-accent-soft`
rather than removed; removing them is Phase 3's job.

### Phase 1 — typographic chrome  `[x]`

- Remove `text-transform: uppercase` and `letter-spacing` from `.si-panel-title`,
  `.si-section-header`, `.si-btn`, `.si-toolbar-label`, `.si-toast`,
  `.si-banner-left`, `.si-text-meta`, `.si-spacing-label`.
- `.si-section-header`: `font-size:14px; font-weight:600; color:var(--si-text)`;
  drop `border-bottom`.
- `.si-btn`: `font-weight:500; font-size:13px`, radius `var(--si-r)`, drop the
  `transform: translateY(-1px)` hover.

**Landed as:** the eight uppercase selectors are all sentence case now, and
`.si-btn-primary` / `.si-toast` switched to white text (`--si-on-accent`) since
`#0099ff` is too dark to carry near-black text. Section dividers, the label column
width, and the button hierarchy are still the old ones — those are Phases 2, 3 and 7.

Phases 0 and 1 alone get roughly halfway to the target look and touch no markup.

### Phase 2 — collapsible section shell  `[x]`

File: `src/ui/sections/shared.js` (plus CSS).

Extend `section()` to `section({ title, body, action, id, collapsible = true })`:

```html
<div class="si-section" data-section="{id}">
  <div class="si-section-header">
    <span>{title}</span>
    <div class="si-section-tools">{action}<button class="si-section-toggle" data-toggle="{id}">−</button></div>
  </div>
  <div class="si-section-body">{body}</div>
</div>
```

CSS:

```css
.si-section + .si-section { border-top:1px solid var(--si-line); padding-top:var(--si-pad); }
.si-section-body { display:flex; flex-direction:column; gap:var(--si-gap); }
.si-section.collapsed .si-section-body { display:none; }
```

Collapse state lives on `InspectorPanel` (`this.collapsed = new Set()`), **not** on
`InspectorState` — it is presentation only and must not reach the export. Wire the
toggle in `panel.js` `_attachEventListeners` and mutate `classList` directly rather
than calling `render()`, so the scroll position survives.

Default-collapsed sections: `border`, `effects`, `layout`.

**Landed as:** section keys are slugged from the title by `sectionKey()`, so the
default-collapsed list is `['corner-radius', 'border', 'effects', 'layout']`. The
toggle ships *both* glyphs (`Plus` and `Minus`, new in `icons.js`) and CSS picks
which is visible — the panel applies `.collapsed` after the markup is built, so a
toggle that baked its icon in at render time would show the wrong one. Typography
and the Notes block were hand-rolling their own `.si-section` markup; both now go
through `section()` — which also shortened the notes heading from "Element Notes
(Optional)" to "Notes", since the section now folds away when it is not wanted.
A section's "Link all" switch hides while it is collapsed, since the controls it
governs are off screen.

### Phase 3 — row and field primitives  `[x]`

- `.si-control-row`: `display:grid; grid-template-columns: var(--si-label-w) 1fr; gap:var(--si-gap)`.
- `.si-control-label`: drop `width:72px`; `color:var(--si-text-dim)`; 13px.
- New shared `.si-field` class replacing the ad-hoc styling on `.si-input-text`,
  `.si-input-number`, `.si-select-wrap select`, `.si-spacing-pill`, `.si-type-control`:

```css
.si-field { background:var(--si-fill); border:1px solid transparent; border-radius:var(--si-r);
            height:var(--si-h); color:var(--si-text); font-size:13px; padding:0 10px; }
.si-field:hover { background:var(--si-fill-hover); }
.si-field:focus, .si-field:focus-within { border-color:var(--si-accent); background:var(--si-fill); }
```

Remove the `box-shadow: 0 0 0 2px rgba(59,130,246,.15)` focus ring — Framer has no
thick ring.

- New helper `comboControl({ valueId, unitId, value, unit, units })` rendering two
  adjacent fields at `grid-template-columns: 1fr 96px`. Consumed by the Size section.

**Landed as:** `controlRow()` now wraps its control in a `.si-control-field` flex
box — the row is a two-column grid, and several callers pass *two* elements (a
slider and a number field, a swatch and a text input) which would otherwise spill
into a third, non-existent column.

The `.si-field` surface is applied as one grouped selector covering
`.si-input-text`, `.si-input-number`, `.si-textarea`, `.si-select-wrap select`,
`.si-type-control`, `.si-spacing-pill` and `.si-spacing-edge`, so no section file
had to be rewritten and every automation id stayed put. `.si-spacing-pill` (32px)
and the footer export selects (30px) moved onto `--si-h`.

Size keeps free text underneath the unit dropdown, via two new primitives in
`src/core/css-value.js` — `splitLength()` and `joinLength()`, covered by
`test/css-length.test.js`. A length splits into number + unit, a keyword (`auto`,
`fit-content`) becomes the unit with the number field disabled, and anything else
(`calc(100% - 2rem)`, `min(640px, 90vw)`) is carried through verbatim as a
`custom` value rather than being mangled into `…px`. Switching to a length unit
with nothing typed focuses the field instead of writing `0px`.

### Phase 4 — segmented controls  `[x]`

New in `shared.js`:

```js
export function segmented({ id, testId, value, options, ariaLabel })
export function bindSegmented(panel, selector, onChange)
```

Renders `<div class="si-segmented" role="group">` containing `<button data-seg-value>`
children. CSS: container gets
`background:var(--si-fill); border-radius:var(--si-r); padding:2px; display:grid; grid-auto-flow:column; grid-auto-columns:1fr`;
the active button gets `background:var(--si-fill-active); border-radius:var(--si-r-sm)`.
`bindSegmented` toggles the active class locally and calls `state.updateStyle`.

Dropdown → segmented migration:

| Property | File | Becomes |
|---|---|---|
| `display` | `layout.js` | Segmented `Block\|Flex\|Grid\|Inline\|None`; rarer values stay reachable via a "more" select |
| `flexDirection` | `layout.js` | Two icons `↔` `↕` (or four, including the reverse variants) |
| `flexWrap` | `layout.js` | Segmented `Yes\|No` |
| `justifyContent` | `layout.js` | Six-icon segmented |
| `alignItems` | `layout.js` | Five-icon segmented |
| `textTransform` | `typography.js` | Stays a select (Framer uses a dropdown here too) |
| `borderStyle` | `border.js` | Stays a select |

New icons added to `src/ui/icons.js`: the `AlignHorizontal*` / `AlignVertical*` /
`AlignStart*` / `AlignCenter*` / `AlignEnd*` families, `StretchHorizontal`,
`StretchVertical`, `Baseline`, plus `Plus` and `Minus` from Phase 2.

**Landed as, with two deviations from the table above:**

`display` kept its `<select>` *alongside* a four-segment track
(`Block | Flex | Grid | None`) rather than replacing it. Eight values do not fit a
segmented track, and dropping the rarer ones would have made `inline-flex` and
`inline-grid` unreachable from any starting point. The two controls drive the same
property and mirror each other's state on change.

`justifyContent` and `alignItems` needed a synonym fold before rendering: Chrome
reports an unset value as `normal`, which is not one of the offered options, so
`segmented()`'s unknown-value fallback was growing a stray seventh segment labelled
"normal" on every flex element. `layout.js` now maps `normal` → `flex-start` /
`stretch` and `start`/`end`/`left`/`right` onto their flex equivalents.

Those two rows also became `wide` rows — `controlRow(label, control, { wide: true })`
drops the label onto its own line and gives the control the full panel width, which
six icon segments need before they start colliding at 380px.

### Phase 5 — align rail  `[x]`

New file `src/ui/sections/align.js`. Renders a row of eight icons at the top of
`.si-panel-body`, before the `SECTIONS.map` output. Writes `alignSelf`,
`justifySelf`, and `margin:auto` to the selected element.

Requires two new schema keys (`alignSelf`, `justifySelf`) in `src/core/schema.js` —
one entry each, as that file's header describes.

```css
.si-align-rail { display:grid; grid-auto-flow:column; padding:10px 0; border-bottom:1px solid var(--si-line); }
```

Buttons are bare, `color:var(--si-text-mute)`, hover to `var(--si-text)`.

**Landed as:** `src/ui/sections/align.js`, rendered and bound by `panel.js` directly
rather than joining `SECTIONS` — the rail has no title, no divider and no collapse,
so it is not a section. Eight buttons in two groups of four separated by a hairline:
`justify-self` (left / centre / right / stretch) and `align-self` (top / middle /
bottom / stretch).

Two behaviours worth keeping: clicking the lit button writes `auto` instead of
re-applying the value, so a placement can be undone without reaching for Reset; and
the whole rail renders **disabled**, with a tooltip explaining why, when the
element's parent is not a flex or grid container — these properties would otherwise
be eight buttons that quietly do nothing. Computed synonyms (`flex-start`,
`flex-end`, `normal`, `auto`) are folded onto the four buttons before matching.

`margin: auto` was dropped from the scope: `justify-self` covers the same intent
inside a real layout parent, and writing margins from an alignment control would
fight the Margin section for the same property.

### Phase 6 — drag-scrub numbers  `[x]`

New in `shared.js`:

```js
export function bindScrub(panel, iconSelector, inputSelector, { step, min, max })
```

On `pointerdown` call `setPointerCapture`; on `pointermove` apply `value += dx * step`;
cursor `ew-resize`.

Replaces the sliders in:

- `src/ui/sections/spacing.js` — remove `#gap-slider`, keep the field plus a scrub icon.
- `src/ui/sections/effects.js` — same for opacity, `step: 0.01`.

**Caveat:** the scrub handler calls `state.updateStyle`, which must not trigger a
`render()` mid-drag. `panel.js` already skips the rebuild while an input is focused,
so `bindScrub` must call `input.focus()` on `pointerdown` for that guard to apply.

**Landed as:** a `scrubControl()` / `bindScrub()` pair in `shared.js`. The control
renders as a `.si-spacing-pill` — the same field shape the padding and margin sides
already use — with a drag handle on the left and an optional unit suffix on the
right. The number of decimals is derived from the step, so a 0.01 opacity scrub does
not accumulate floating-point dust in the value the user reads. Both `.si-slider`
rules were deleted; nothing renders one any more.

### Phase 7 — remaining chrome  `[x]`

- `.si-panel-header`: `background: var(--si-bg-raised)`; title 13px/600 sentence case;
  badge becomes a grey pill rather than uppercase text.
- `.si-pinned-bar` becomes a Framer-style tab strip: 8px-radius pills, active pill
  filled with `--si-fill-active`.
- `.si-toolbar`: drop the glow and the `translateY(-2px)` hover; 8px radius; sentence
  case; hover only changes `background` to `var(--si-fill-hover)`.
- `.si-toast` and `.si-banner`: 8px radius, sentence case, `--si-bg-raised` background
  with a `--si-line` border, accent colour confined to the icon.
- Footer: `Copy to Clipboard` becomes the primary blue `--si-accent` button (replacing
  `si-btn-white`); everything else goes ghost.

**Landed as:** the primary/secondary split holds, but the first attempt overshot:
every secondary action was made fully transparent, which read as a floating label
rather than something pressable. Corrected — secondary actions keep the `--si-fill`
surface (Framer's own "Invite" is a filled pill; only "Publish" is coloured),
`.si-btn-danger` keeps that surface and spends its colour on the label instead of an
always-red outline, and `.si-btn-ghost` is now reserved for buttons sitting *inside*
another surface, never for a standalone action in a row of its own. Buttons also
picked up `--si-h`, an `:active` surface darken (the button does not move, so a
mis-click cannot shift the row) and a `:focus-visible` accent border.
The toast stopped being a blue slab: it is `--si-bg-raised` with a hairline border and
an accent-coloured icon, which is the same treatment the banner got. The toolbar lost
its glow and its hover lift.

### Phase 8 — section reorder  `[x]`

File: `src/ui/sections/index.js`.

```js
export const SECTIONS = [align, content, size, spacing, layout, typography, color, border, effects];
```

**Landed as:** `[content, size, spacing, layout, typography, color, border, effects]`
— `align` is not in the list, since Phase 5 made it a rail the panel renders itself.
`layout` also came off the default-collapsed list: it sits fourth now, and it already
hides its own flex/grid rows when the element does not lay out children. Corner
Radius, Border and Effects remain collapsed by default.

Matches the Framer order: position and size first, styling afterwards.

### Phase 9 — tests and build  `[x]`

- Every existing `data-testid` must survive. Segmented controls inherit the test id of
  the select they replace (`style_inspector_panel_display_select`, etc.), but the
  assertion changes from reading `select.value` to querying `[data-seg-value].active`.
  Update `test/browser-e2e.js` and `test/integration.test.js` accordingly.
- Run `npm run build` to regenerate `dist/*` and `extension/style-inspector.js`.

**Landed as:** no existing assertion needed changing — the unit and integration
suites never reached into the panel's controls, and every automation id survived the
rework. What was missing was coverage of the new behaviour, so `test/browser-e2e.js`
grew a section 8 that pins a flex child and checks: Effects starts collapsed and its
toggle expands it; a segmented click writes `flex-direction`; the align rail writes
`align-self` and clears it on a second click; a keyword unit writes `fit-content` and
disables the number field; and a 12px drag on the gap handle writes `gap: 12px`.
`test/css-length.test.js` (Phase 3) covers the parsing underneath. README's feature
list and automation-id table were updated to match.

---

## 4. Sequencing and risk

| Phases | Nature | Risk |
|---|---|---|
| 0–1 | CSS only | Low — no markup or behaviour change; delivers ~50% of the visual target |
| 2–4 | Markup + binding | Medium — test assertions need updating |
| 5–6 | New schema keys and new interaction | Highest — cut these first if the scope needs trimming |
| 7–9 | Polish, ordering, build | Low |

Suggested execution: Phases 0–1 in one pass, 2–4 in a second, 5–9 in a third.
