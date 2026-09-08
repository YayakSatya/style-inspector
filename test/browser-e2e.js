/**
 * Automated Browser E2E Test
 * Runs demo/index.html in headless Chromium/Edge, tests hover, pin, and UI state.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const testHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="test-card" data-testid="dashboard_page_stat_card" style="width: 200px; height: 100px; padding: 12px; margin: 10px; background: red;">
    Card Content
  </div>
  <script src="../dist/style-inspector.js"></script>
  <script>
    window.addEventListener('load', () => {
      try {
        const inspector = window.__STYLE_INSPECTOR__;
        if (!inspector) throw new Error('Inspector not initialized on window');

        // Test 1: Enable inspector
        inspector.enable();
        if (!inspector.state.isInspecting) throw new Error('State is not inspecting');

        // Test 2: Trigger hover over test-card
        const card = document.getElementById('test-card');
        const moveEvt = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        card.dispatchEvent(moveEvt);

        // Check if hovered element in state is test-card
        if (inspector.state.hoveredElement !== card) {
          throw new Error('Hovered element in state is: ' + (inspector.state.hoveredElement ? inspector.state.hoveredElement.tagName : 'null'));
        }

        // Check overlay hoverBox
        const hoverBox = inspector.overlay.hoverBox;
        if (hoverBox.style.display !== 'block') {
          throw new Error('Hover box display is not block: ' + hoverBox.style.display);
        }

        const tagText = inspector.overlay.hoverTag.textContent;
        if (!tagText.includes('dashboard_page_stat_card')) {
          throw new Error('Tag text does not include testid: ' + tagText);
        }

        // Test 3: Click to pin
        const clickEvt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        card.dispatchEvent(clickEvt);

        if (inspector.state.pinnedItems.size !== 1) {
          throw new Error('Pinned items count is not 1: ' + inspector.state.pinnedItems.size);
        }

        // All passed
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
    console.log('✅ Browser E2E Test Passed: Hover, Pin, and UI state verified in Chromium!');
  } else {
    console.error('❌ Browser E2E Test Failed:', output);
    process.exit(1);
  }
} finally {
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}
