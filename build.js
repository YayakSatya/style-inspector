/**
 * Build Script for Style Inspector
 * Compiles standalone bundle, bookmarklet, and Chrome Extension files.
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

async function build() {
  console.log('🚀 Building Style Inspector...');

  const distDir = path.resolve('dist');
  const extDir = path.resolve('extension');

  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });

  // 1. Build Standalone IIFE Bundle
  const bundleResult = await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'iife',
    globalName: 'StyleInspectorBundle',
    outfile: 'dist/style-inspector.js',
    banner: {
      js: '/* Style Inspector v1.0.0 | Internal Visual Adjustment Tool */'
    }
  });

  console.log('✅ Created dist/style-inspector.js');

  // 2. Build Minified Bundle for Bookmarklet
  const minResult = await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'iife',
    globalName: 'StyleInspectorBundle',
    minify: true,
    write: false
  });

  const minifiedCode = minResult.outputFiles[0].text;
  const bookmarkletCode = `javascript:(function(){${encodeURIComponent(minifiedCode)}})();`;

  fs.writeFileSync(path.join(distDir, 'style-inspector.min.js'), minifiedCode);
  fs.writeFileSync(path.join(distDir, 'bookmarklet.txt'), bookmarkletCode);
  console.log('✅ Created dist/style-inspector.min.js and dist/bookmarklet.txt');

  // 3. Create Bookmarklet Drag-and-Drop Installation Page
  const bookmarkletHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Style Inspector — Bookmarklet Installer</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 32px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #f8fafc;
      font-size: 24px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .bookmarklet-btn {
      display: inline-block;
      background: #6366f1;
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      cursor: move;
      transition: all 0.2s;
    }
    .bookmarklet-btn:hover {
      background: #4f46e5;
      transform: translateY(-2px);
    }
    .instruction-steps {
      text-align: left;
      margin-top: 28px;
      border-top: 1px solid #334155;
      padding-top: 20px;
    }
    .instruction-steps ol {
      padding-left: 20px;
      color: #cbd5e1;
      font-size: 13px;
      line-height: 1.8;
    }
    code {
      background: #0f172a;
      color: #a5b4fc;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1><span>🎨</span> Style Inspector Bookmarklet</h1>
    <p>Drag the button below to your browser's Bookmarks bar. Then click it on any running dev page to inspect and adjust styles!</p>

    <div>
      <a class="bookmarklet-btn" href="${bookmarkletCode}">🎨 Style Inspector</a>
    </div>

    <div class="instruction-steps">
      <ol>
        <li>Show your Bookmarks Bar (Press <code>Ctrl+Shift+B</code> or <code>Cmd+Shift+B</code>).</li>
        <li>Drag the <strong>"🎨 Style Inspector"</strong> button above into your bookmarks bar.</li>
        <li>Navigate to any local dev page (e.g. <code>localhost:3000</code> or <code>localhost:8080</code>).</li>
        <li>Click the bookmarklet to activate inspection mode!</li>
        <li>Press <code>Esc</code> to stop inspecting, or press <code>Alt+Shift+S</code> to toggle.</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'bookmarklet.html'), bookmarkletHtml);
  console.log('✅ Created dist/bookmarklet.html');

  // 4. Build Chrome Extension Files
  fs.copyFileSync('dist/style-inspector.js', path.join(extDir, 'style-inspector.js'));

  const { generateIcons } = await import('./generate-icons.js');
  generateIcons(extDir);

  const manifestJson = {
    manifest_version: 3,
    name: 'Style Inspector',
    version: '1.0.0',
    description: 'Internal visual adjustment tool for Antigravity AI coding agent',
    action: {
      default_title: 'Toggle Style Inspector (Alt+Shift+S)',
      default_icon: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      }
    },
    icons: {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    },
    background: {
      service_worker: 'background.js'
    },
    permissions: ['activeTab', 'scripting'],
    commands: {
      toggle_inspector: {
        suggested_key: {
          default: 'Alt+Shift+S',
          mac: 'Alt+Shift+S'
        },
        description: 'Toggle Style Inspector'
      }
    }
  };

  fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify(manifestJson, null, 2));

  const backgroundJs = `
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    toggleInspector(tab.id);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_inspector') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        toggleInspector(tabs[0].id);
      }
    });
  }
});

function toggleInspector(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (window.__STYLE_INSPECTOR__) {
        window.__STYLE_INSPECTOR__.toggle();
      } else {
        return false;
      }
      return true;
    }
  }).then((results) => {
    const isLoaded = results && results[0] && results[0].result;
    if (!isLoaded) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['style-inspector.js']
      }).then(() => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            if (window.__STYLE_INSPECTOR__) {
              window.__STYLE_INSPECTOR__.enable();
            }
          }
        });
      });
    }
  });
}
`;

  fs.writeFileSync(path.join(extDir, 'background.js'), backgroundJs.trim());
  console.log('✅ Created extension/ manifest.json and background.js');
  console.log('✨ Build finished successfully!');
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
