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

// Inline the extension icon so the landing page needs no extra asset request.
const logoDataUri =
  'data:image/png;base64,' + fs.readFileSync(path.join('extension', 'icon128.png')).toString('base64');

const landing = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-QQT1VWWXRS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-QQT1VWWXRS');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Style Inspector — Visual CSS Adjustment Tool</title>
  <meta name="description" content="Inspect and adjust CSS on any website, then export the changes.">
  <link rel="icon" href="${logoDataUri}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0a0a;
      --surface: #121212;
      --surface-2: #171717;
      --fill: #242424;
      --line: #232323;
      --text: #ededed;
      --dim: #8f8f8f;
      --mute: #6b6b6b;
      --accent: #0099ff;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
    }
    /* Ambient Framer-style glow + hairline grid. */
    body::before {
      content: ""; position: fixed; inset: 0; pointer-events: none;
      background:
        radial-gradient(58% 45% at 50% -5%, rgba(0, 153, 255, .18), transparent 70%),
        linear-gradient(to right, rgba(255,255,255,.022) 1px, transparent 1px) 0 0 / 72px 72px,
        linear-gradient(to bottom, rgba(255,255,255,.022) 1px, transparent 1px) 0 0 / 72px 72px;
      mask-image: radial-gradient(80% 70% at 50% 18%, #000, transparent 85%);
    }
    .wrap {
      position: relative; z-index: 1;
      height: 100%; max-width: 1180px; margin: 0 auto;
      padding: clamp(20px, 4vh, 48px) 32px clamp(24px, 5vh, 56px);
      display: flex; flex-direction: column; justify-content: center;
      gap: clamp(24px, 5vh, 56px);
    }

    /* --- hero --- */
    .hero { text-align: center; }
    .pill {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 12px; color: var(--dim); background: var(--surface);
      border: 1px solid var(--line); border-radius: 999px; padding: 5px 14px 5px 9px;
    }
    .pill .mark { width: 16px; height: 16px; display: block; }
    h1 {
      font-size: clamp(32px, 4.4vw, 56px); line-height: 1.04; letter-spacing: -.045em;
      font-weight: 600; margin: clamp(14px, 2.6vh, 26px) 0 0;
      background: linear-gradient(180deg, #fff 32%, #9a9a9a);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .lede {
      color: var(--dim); font-size: clamp(14px, 1.15vw, 16px); line-height: 1.6;
      margin: 14px auto 0; max-width: 56ch;
    }
    .meta { color: var(--mute); font-size: 12px; margin: clamp(12px, 2vh, 18px) 0 0; }
    .meta kbd {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px;
      background: var(--fill); border-radius: 4px; padding: 2px 5px; color: var(--dim);
    }

    /* --- install cards: the page's centre of gravity --- */
    .cards { display: flex; gap: 18px; align-items: stretch; }
    .card {
      flex: 1; position: relative; overflow: hidden;
      background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
      padding: clamp(18px, 3vh, 28px);
      display: flex; flex-direction: column; gap: 12px;
      transition: border-color .16s, background .16s, transform .16s;
    }
    .card:hover { border-color: #303030; background: var(--surface-2); transform: translateY(-2px); }
    .card.featured { border-color: rgba(0, 153, 255, .35); }
    .card.featured::before {
      content: ""; position: absolute; inset: -40% 20% auto; height: 120px;
      background: radial-gradient(50% 100% at 50% 0, rgba(0,153,255,.28), transparent 70%);
      pointer-events: none;
    }
    .num {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; color: var(--mute);
    }
    .card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .card h2 { font-size: clamp(16px, 1.5vw, 19px); font-weight: 600; margin: 0; letter-spacing: -.02em; }
    .tag {
      font-size: 10px; color: var(--dim); border: 1px solid var(--line);
      border-radius: 999px; padding: 3px 9px; white-space: nowrap;
    }
    .card.featured .tag { color: var(--accent); border-color: rgba(0,153,255,.35); }
    .card p { color: var(--dim); font-size: 13px; line-height: 1.6; margin: 0; }
    .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
    .steps li {
      display: flex; gap: 9px; align-items: baseline;
      font-size: 12.5px; color: var(--dim); line-height: 1.5;
    }
    .steps li::before {
      content: counter(step); counter-increment: step;
      flex: none; width: 17px; height: 17px; border-radius: 5px;
      background: var(--fill); color: var(--mute);
      font-size: 10px; line-height: 17px; text-align: center;
    }
    .steps { counter-reset: step; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      height: 40px; padding: 0 18px; border-radius: 10px;
      font-size: 13.5px; font-weight: 500; text-decoration: none;
      border: 1px solid transparent; margin-top: auto;
      transition: background .15s, border-color .15s;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: #33adff; }
    .btn-ghost { background: var(--fill); border-color: var(--line); color: var(--text); }
    .btn-ghost:hover { background: #2c2c2c; }
    .btn.drag { cursor: grab; }
    .alt { font-size: 11px; color: var(--mute); text-align: center; margin: 0; }
    .alt a { color: var(--mute); }
    code, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px;
      color: #7fc7ff; background: #0d0d0d; border-radius: 8px;
    }
    pre {
      padding: 11px 12px; margin: 0; border: 1px solid var(--line);
      white-space: pre-wrap; word-break: break-all; line-height: 1.5;
    }
    .keys { white-space: nowrap; }
    .steps kbd {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px;
      background: var(--fill); border-radius: 4px; padding: 1px 4px; color: var(--dim);
    }

    @media (max-width: 900px) {
      html, body { height: auto; }
      body { overflow: auto; }
      .wrap { height: auto; padding: 40px 20px; }
      .cards { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <span class="pill">
        <svg class="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="#0099ff"/>
          <path d="M13 12.4l7.6 3.4-3.1 1.2-1.2 3.1-3.3-7.7z" fill="#fff"/>
        </svg>
        Style Inspector · v${version}
      </span>
      <h1>Adjust CSS where you see it.</h1>
      <p class="lede">Point at any element on any page, tune its styles with a real panel, and export exactly the CSS you changed. Pick how you want to install it.</p>
      <p class="meta">Toggle with <kbd class="alt-key">Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> · <kbd>Esc</kbd> stops inspecting · MIT licensed</p>
    </section>

    <section class="cards">
      <div class="card featured">
        <div class="card-top"><span class="num">01</span><span class="tag">Recommended</span></div>
        <h2>Chrome extension</h2>
        <p>Runs on every site, including ones whose Content Security Policy blocks bookmarklets.</p>
        <ol class="steps">
          <li>Unzip the download</li>
          <li>Open <code>chrome://extensions</code></li>
          <li>Turn on Developer mode</li>
          <li>Load unpacked, pick the folder</li>
        </ol>
        <a class="btn btn-primary" href="/${zipName}" download>Download .zip</a>
      </div>

      <div class="card">
        <div class="card-top"><span class="num">02</span><span class="tag">No install</span></div>
        <h2>Bookmarklet</h2>
        <p>The whole tool is inlined in the bookmark — no network, works on <code>localhost</code>. Strict-CSP sites need the extension.</p>
        <ol class="steps">
          <li><span>Show your bookmarks bar <span class="keys"><kbd id="bb-mod">Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd></span></span></li>
          <li>Drag the button below onto it</li>
          <li>Click it on any page</li>
        </ol>
        <a class="btn btn-ghost drag" href="${bookmarkletCode}">Drag me to bookmarks</a>
      </div>

      <div class="card">
        <div class="card-top"><span class="num">03</span><span class="tag">Your own pages</span></div>
        <h2>Script tag</h2>
        <p>Drop the bundle into a page you control and toggle it with the shortcut.</p>
        <ol class="steps">
          <li>Add the tag to your page</li>
          <li>Press <span class="keys"><kbd class="alt-key">Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></span></li>
          <li>Copy the CSS back out</li>
        </ol>
        <pre id="snippet">&lt;script src="/dist/style-inspector.js"&gt;&lt;/script&gt;</pre>
        <a class="btn btn-ghost" href="/dist/style-inspector.js" download>Download bundle</a>
        <p class="alt"><a href="/dist/style-inspector.min.js">Minified build</a></p>
      </div>
    </section>
  </div>
  <script>
    // Same physical keys on every platform, but macOS names them differently:
    // Cmd instead of Ctrl for the bookmarks bar, Option instead of Alt to toggle.
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
      document.getElementById('bb-mod').textContent = 'Cmd';
      for (const el of document.querySelectorAll('.alt-key')) el.textContent = 'Option';
    }
    document.getElementById('snippet').textContent =
      '<script src="' + location.origin + '/dist/style-inspector.js"><\\/script>';
  </script>
</body>
</html>`;
fs.writeFileSync(path.join(publicDir, 'index.html'), landing);
console.log(`✅ Created public/ (index.html, dist/, ${zipName})`);
