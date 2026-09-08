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

try {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const cmd = `"${edgePath}" --headless --disable-gpu --dump-dom "${fileUrl}"`;
  const output = execSync(cmd, { encoding: 'utf-8' });

  if (output.includes('E2E_SUCCESS')) {
    console.log('✅ Browser E2E Test Passed: Multi-pin, HTML safety, and Panel Drag & Drop verified!');
  } else {
    console.error('❌ Browser E2E Test Failed:', output);
    process.exit(1);
  }
} finally {
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}
