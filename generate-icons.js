/**
 * Generates PNG icons for the Chrome extension using Node built-in zlib
 */

import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

function createPng(size, r = 99, g = 102, b = 241) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 74, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8);      // 8 bits per channel
  ihdrData.writeUInt8(6, 9);      // RGBA color type
  ihdrData.writeUInt8(0, 10);     // compression method
  ihdrData.writeUInt8(0, 11);     // filter method
  ihdrData.writeUInt8(0, 12);     // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data: (1 filter byte + size * 4 bytes RGBA) * size
  const rawData = Buffer.alloc((1 + size * 4) * size);
  let offset = 0;
  for (let y = 0; y < size; y++) {
    rawData.writeUInt8(0, offset++); // Filter byte: 0 (None)
    for (let x = 0; x < size; x++) {
      // Rounded icon shape
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isInside = dist <= (size / 2 - 1);

      if (isInside) {
        rawData.writeUInt8(r, offset++);
        rawData.writeUInt8(g, offset++);
        rawData.writeUInt8(b, offset++);
        rawData.writeUInt8(255, offset++);
      } else {
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
        rawData.writeUInt8(0, offset++);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function generateIcons(dir) {
  const sizes = [16, 48, 128];
  for (const s of sizes) {
    const png = createPng(s, 99, 102, 241);
    fs.writeFileSync(path.join(dir, `icon${s}.png`), png);
  }
}
