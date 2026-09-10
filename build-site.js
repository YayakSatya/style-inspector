/**
 * Site Build Script
 * Assembles a static, deployable folder (public/) holding the distributable
 * builds of the tool: bookmarklet, standalone bundle, and packaged extension.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve('public');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(path.join(publicDir, 'dist'), { recursive: true });

// Copy build output.
for (const file of fs.readdirSync('dist')) {
  fs.copyFileSync(path.join('dist', file), path.join(publicDir, 'dist', file));
}

const bookmarkletCode = fs.readFileSync(path.join('dist', 'bookmarklet.txt'), 'utf8');

// --- Minimal ZIP writer (deflate, no external dependency) ---

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const deflated = zlib.deflateRawSync(data);
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0x21, 12); // mod date (1996-01-01, deterministic)
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(deflated.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    localParts.push(local, nameBuf, deflated);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(deflated.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + deflated.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, end]);
}

const extensionFiles = fs
  .readdirSync('extension')
  .filter((name) => !name.startsWith('.'))
  .map((name) => ({ name, data: fs.readFileSync(path.join('extension', name)) }));

const zipName = `style-inspector-extension-v${version}.zip`;
fs.writeFileSync(path.join(publicDir, zipName), createZip(extensionFiles));

const landing = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Style Inspector — Visual CSS Adjustment Tool</title>
  <meta name="description" content="Inspect and adjust CSS on any website, then export the changes.">
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a; color: #e2e8f0; margin: 0;
      display: flex; justify-content: center; padding: 48px 20px;
    }
    main { width: 100%; max-width: 720px; }
    h1 { font-size: 32px; color: #f8fafc; margin: 0 0 8px; }
    .lede { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 32px; }
    .card {
      background: #1e293b; border: 1px solid #334155; border-radius: 12px;
      padding: 24px; margin-bottom: 16px;
    }
    h2 { font-size: 16px; color: #f8fafc; margin: 0 0 4px; }
    .tag {
      display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .04em;
      text-transform: uppercase; color: #a5b4fc; background: #312e81;
      padding: 3px 8px; border-radius: 999px; margin-bottom: 10px;
    }
    p { color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    ol { color: #cbd5e1; font-size: 13px; line-height: 1.9; padding-left: 20px; margin: 0; }
    a.btn {
      display: inline-block; background: #6366f1; color: #fff; text-decoration: none;
      font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 8px;
    }
    a.btn:hover { background: #4f46e5; }
    a.btn.drag { cursor: move; }
    a.ghost { color: #a5b4fc; }
    code, pre {
      background: #0f172a; color: #a5b4fc; border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;
    }
    code { padding: 2px 6px; }
    pre { padding: 12px; overflow-x: auto; border: 1px solid #334155; }
    footer { color: #64748b; font-size: 12px; margin-top: 32px; line-height: 1.8; }
  </style>
</head>
<body>
  <main>
    <h1>🎨 Style Inspector</h1>
    <p class="lede">Point at any element on any website, adjust its styles visually, and export the resulting CSS. Version ${version}.</p>

    <div class="card">
      <span class="tag">Works everywhere</span>
      <h2>Chrome extension</h2>
      <p>The reliable option: it runs on every site, including ones whose Content Security Policy blocks bookmarklets.</p>
      <a class="btn" href="/${zipName}" download>Download .zip</a>
      <ol style="margin-top:20px">
        <li>Unzip the download.</li>
        <li>Open <code>chrome://extensions</code> and turn on <strong>Developer mode</strong>.</li>
        <li>Click <strong>Load unpacked</strong> and pick the unzipped folder.</li>
        <li>Click the toolbar icon, or press <code>Alt+Shift+S</code>, on any page.</li>
      </ol>
    </div>

    <div class="card">
      <span class="tag">No install</span>
      <h2>Bookmarklet</h2>
      <p>Drag this button to your bookmarks bar, then click it on a page. The whole tool is inlined in the bookmark, so it needs no network and works on <code>localhost</code>. Strict-CSP sites will refuse to run it — use the extension there.</p>
      <a class="btn drag" href="${bookmarkletCode}">🎨 Style Inspector</a>
      <p style="margin-top:16px">Longer instructions: <a class="ghost" href="/dist/bookmarklet.html">installer page</a>.</p>
    </div>

    <div class="card">
      <span class="tag">Your own pages</span>
      <h2>Script tag</h2>
      <pre id="snippet">&lt;script src="/dist/style-inspector.js"&gt;&lt;/script&gt;</pre>
      <p>Press <code>Alt+Shift+S</code> to toggle, <code>Esc</code> to stop inspecting.</p>
    </div>

    <footer>
      MIT licensed.
      <a class="ghost" href="/dist/style-inspector.js">Bundle</a> ·
      <a class="ghost" href="/dist/style-inspector.min.js">Minified</a>
    </footer>
  </main>
  <script>
    document.getElementById('snippet').textContent =
      '<script src="' + location.origin + '/dist/style-inspector.js"><\\/script>';
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), landing);
console.log(`✅ Created public/ (index.html, dist/, ${zipName})`);
