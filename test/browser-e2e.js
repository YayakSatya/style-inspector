/**
 * Automated Browser E2E Test
 * Runs demo in headless Chromium/Edge:
 * - Tests hover & pin on cards and containers (order_action_bar, user_growth_card)
 * - Tests DOM layout integrity (no HTML injection breaks)
 * - Tests Drag & Drop for the adjustment panel and toolbar
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const testHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="stat-card" data-testid="dashboard_page_stat_card" style="width: 200px; height: 100px; padding: 12px; margin: 10px; background: red;">
    Card
  </div>
  <div id="action-bar" data-testid="order_action_bar" style="width: 300px; height: 50px; padding: 8px; margin: 10px; display: flex;">
    Action Bar
    <div id="flex-child" data-testid="order_action_bar_item" style="display: flex; padding: 4px; gap: 0px;">Item</div>
  </div>
  <div id="growth-card" data-testid="page_dashboard_user_growth_card" style="width: 200px; height: 100px; padding: 12px; margin: 10px;">
    Growth Card
  </div>

  <script src="../dist/style-inspector.js"></script>
  <script>
    window.addEventListener('load', () => {
      try {
        const inspector = window.__STYLE_INSPECTOR__;
        if (!inspector) throw new Error('Inspector not initialized on window');

        // 1. Enable inspector
        inspector.enable();
        if (!inspector.state.isInspecting) throw new Error('State is not inspecting');

        // 2. Hover over stat-card
        const statCard = document.getElementById('stat-card');
        statCard.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, view: window }));
        if (inspector.state.hoveredElement !== statCard) throw new Error('Hovered element mismatch');

        // 3. Pin stat-card
        statCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        // 4. Pin order_action_bar (the element that caused the glitch previously)
        const actionBar = document.getElementById('action-bar');
        actionBar.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        // 5. Pin growth-card
        const growthCard = document.getElementById('growth-card');
        growthCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        if (inspector.state.pinnedItems.size !== 3) {
          throw new Error('Pinned items count expected 3, got: ' + inspector.state.pinnedItems.size);
        }

        // 6. Verify panel layout structure is NOT broken
        const panel = inspector.panel.panel;
        const header = panel.querySelector('.si-panel-header');
        const pinnedBar = panel.querySelector('.si-pinned-bar');
        const body = panel.querySelector('.si-panel-body');
        const footer = panel.querySelector('.si-panel-footer');

        if (!header) throw new Error('Missing .si-panel-header');
        if (!pinnedBar) throw new Error('Missing .si-pinned-bar');
        if (!body) throw new Error('Missing .si-panel-body');
        if (!footer) throw new Error('Missing .si-panel-footer');

        // Check that body and footer are direct children of panel, NOT swallowed into pinned pills
        if (body.parentElement !== panel) throw new Error('.si-panel-body is not direct child of .si-panel (HTML injection glitch!)');
        if (footer.parentElement !== panel) throw new Error('.si-panel-footer is not direct child of .si-panel (HTML injection glitch!)');

        // Check pills: all 3 pills rendered
        const pills = panel.querySelectorAll('.si-pinned-pill');
        if (pills.length !== 3) throw new Error('Expected 3 pills, found: ' + pills.length);

        // 7. Test Drag & Drop on Panel Header
        const startRect = panel.getBoundingClientRect();
        const startLeft = startRect.left;
        const startTop = startRect.top;

        // Pointerdown on header
        header.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: startLeft + 50,
          clientY: startTop + 10,
          pointerId: 1
        }));

        // Move by 100px left, 40px down
        window.dispatchEvent(new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          clientX: startLeft + 50 - 100,
          clientY: startTop + 10 + 40,
          pointerId: 1
        }));

        // Pointerup
        window.dispatchEvent(new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId: 1
        }));

        const newRect = panel.getBoundingClientRect();
        if (Math.abs(newRect.left - (startLeft - 100)) > 5) {
          throw new Error('Panel Drag failed! Expected left around ' + (startLeft - 100) + ' but got ' + newRect.left);
        }

        // 8. Framer-style controls: collapse, segmented, align rail, unit combo, scrub.
        // Pinned last so it is the active item every control below renders for.
        const flexChild = document.getElementById('flex-child');
        flexChild.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        const q = selector => inspector.panel.panel.querySelector(selector);

        // 8a. Sections collapse, and the toggle expands them
        const effects = q('.si-section[data-section="effects"]');
        if (!effects) throw new Error('Missing collapsible Effects section');
        if (!effects.classList.contains('collapsed')) throw new Error('Effects should start collapsed');

        q('[data-toggle="effects"]').click();
        if (q('.si-section[data-section="effects"]').classList.contains('collapsed')) {
          throw new Error('Effects did not expand when its toggle was clicked');
        }

        // 8b. Segmented control writes the property
        const columnSegment = q('#flex-direction-segments [data-value="column"]');
        if (!columnSegment) throw new Error('Missing flex-direction segmented control');
        columnSegment.click();
        if (flexChild.style.flexDirection !== 'column') {
          throw new Error('Segmented control did not apply flex-direction, got: ' + flexChild.style.flexDirection);
        }

        // 8c. Align rail is live inside a flex parent and writes align-self
        const rail = q('.si-align-rail');
        if (!rail) throw new Error('Missing align rail');
        if (rail.classList.contains('disabled')) throw new Error('Align rail should be enabled inside a flex parent');

        q('[data-rail-axis="align"][data-value="center"]').click();
        if (flexChild.style.alignSelf !== 'center') {
          throw new Error('Align rail did not apply align-self, got: ' + flexChild.style.alignSelf);
        }

        // Clicking the lit button clears the placement rather than reapplying it
        q('[data-rail-axis="align"][data-value="center"]').click();
        if (flexChild.style.alignSelf !== 'auto') {
          throw new Error('Align rail did not clear align-self, got: ' + flexChild.style.alignSelf);
        }

        // 8d. Size combo: a keyword unit writes the keyword and disables the number
        const heightUnit = q('#height-unit');
        if (!heightUnit) throw new Error('Missing height unit dropdown');
        heightUnit.value = 'fit-content';
        heightUnit.dispatchEvent(new Event('change', { bubbles: true }));
        if (flexChild.style.height !== 'fit-content') {
          throw new Error('Unit dropdown did not apply the keyword, got: ' + flexChild.style.height);
        }
        if (!q('#height-input').disabled) throw new Error('Number field should be disabled for a keyword unit');

        // 8e. Drag-scrub moves the value by one step per pixel
        const handle = q('#gap-input-handle');
        if (!handle) throw new Error('Missing gap scrub handle');
        handle.setPointerCapture = () => {};
        handle.releasePointerCapture = () => {};

        handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, pointerId: 2 }));
        handle.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX: 112, pointerId: 2 }));
        handle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 2 }));

        if (parseFloat(flexChild.style.gap) !== 12) {
          throw new Error('Scrub did not apply gap, got: ' + flexChild.style.gap);
        }

        // 8f. A rebuild must not throw the user back to the top of the panel
        const panelBody = inspector.panel.panel.querySelector('.si-panel-body');
        panelBody.scrollTop = 200;
        const scrollBefore = panelBody.scrollTop;
        if (scrollBefore === 0) throw new Error('Panel body did not scroll; the check below would be meaningless');

        q('#justify-content-segments [data-value="center"]').click();
        const scrollAfter = inspector.panel.panel.querySelector('.si-panel-body').scrollTop;
        if (scrollAfter !== scrollBefore) {
          throw new Error('Panel scroll jumped on a control click: ' + scrollBefore + ' -> ' + scrollAfter);
        }

        // All assertions passed
        document.body.innerHTML = '<h1 id="test-result">E2E_SUCCESS</h1>';
      } catch (err) {
        document.body.innerHTML = '<h1 id="test-result">E2E_FAILURE: ' + err.message + '</h1>';
      }
    });
  </script>
</body>
</html>
`;

const htmlPath = path.resolve('test/browser-test.html');
fs.writeFileSync(htmlPath, testHtml);

/**
 * Locates a Chromium-family binary that supports --headless --dump-dom.
 * Set SI_BROWSER to override. Returns null when none is available, in which
 * case this test skips rather than failing the suite.
 */
function findBrowser() {
  if (process.env.SI_BROWSER) return process.env.SI_BROWSER;

  const candidates = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    ],
    win32: [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/microsoft-edge'
    ]
  };

  return (candidates[process.platform] || []).find(p => fs.existsSync(p)) || null;
}

const browserPath = findBrowser();

if (!browserPath) {
  console.log(
    '⏭️  Browser E2E skipped: no Chromium-family browser found. ' +
      'Set SI_BROWSER=/path/to/chrome to run it.'
  );
  fs.unlinkSync(htmlPath);
  process.exit(0);
}

try {
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const cmd = `"${browserPath}" --headless --disable-gpu --dump-dom "${fileUrl}"`;
  const output = execSync(cmd, { encoding: 'utf-8' });

  if (output.includes('E2E_SUCCESS')) {
    console.log(
      '✅ Browser E2E Test Passed: multi-pin, HTML safety, panel drag & drop, ' +
        'collapsible sections, segmented controls, align rail, unit combo, drag-scrub, ' +
        'and scroll retention verified!'
    );
  } else {
    console.error('❌ Browser E2E Test Failed:', output);
    process.exit(1);
  }
} finally {
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}
