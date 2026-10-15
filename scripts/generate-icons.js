import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid uncompressed/deflated PNG buffer in pure Node
function createPng(width, height, drawFn) {
  // RGBA buffer: 4 bytes per pixel
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1)); // +1 for filter byte per row

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter byte: 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // Calculate CRC32
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // Color type 6: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon generator with Emerald background (#059669), Golden Crescent and White "M" star motif
function iconPixelShader(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.44;

  // Rounded rectangle check for rounded icon
  const cornerR = w * 0.22;
  const inBox = Math.abs(dx) <= (w * 0.48) && Math.abs(dy) <= (h * 0.48);
  
  // Emerald gradient base (#059669 to #047857)
  const grad = y / h;
  const bgR = Math.round(5 * (1 - grad) + 4 * grad);
  const bgG = Math.round(150 * (1 - grad) + 120 * grad);
  const bgB = Math.round(105 * (1 - grad) + 87 * grad);

  // Border margin
  const margin = w * 0.04;
  const inBorder = (Math.abs(dx) <= cx - margin) && (Math.abs(dy) <= cy - margin);

  // Center Golden Dome / Crescent
  const crescentOuter = Math.sqrt(dx * dx + dy * dy);
  const crescentInner = Math.sqrt((dx - w * 0.08) ** 2 + (dy + h * 0.06) ** 2);
  const inCrescent = (crescentOuter <= w * 0.32) && (crescentInner >= w * 0.22);

  // Center Star (#FBBF24)
  const starDist = Math.sqrt((dx - w * 0.08) ** 2 + (dy - h * 0.05) ** 2);
  const inStar = starDist <= w * 0.08;

  // Letter "M" or Dome in center
  // If in crescent: Golden Yellow (#FBBF24)
  if (inCrescent || inStar) {
    return [251, 191, 36, 255]; // Golden Amber
  }

  // Inside rounded icon
  if (inBorder) {
    return [bgR, bgG, bgB, 255];
  }

  // Transparent or corner
  return [0, 0, 0, 0];
}

// Maskable icon (solid background without rounded corners)
function maskablePixelShader(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  
  // Emerald solid background
  const grad = y / h;
  const bgR = Math.round(5 * (1 - grad) + 4 * grad);
  const bgG = Math.round(150 * (1 - grad) + 120 * grad);
  const bgB = Math.round(105 * (1 - grad) + 87 * grad);

  const crescentOuter = Math.sqrt(dx * dx + dy * dy);
  const crescentInner = Math.sqrt((dx - w * 0.08) ** 2 + (dy + h * 0.06) ** 2);
  const inCrescent = (crescentOuter <= w * 0.28) && (crescentInner >= w * 0.19);
  const starDist = Math.sqrt((dx - w * 0.08) ** 2 + (dy - h * 0.05) ** 2);
  const inStar = starDist <= w * 0.07;

  if (inCrescent || inStar) {
    return [251, 191, 36, 255]; // Golden Amber
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA Icons...');
const icon192 = createPng(192, 192, iconPixelShader);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, iconPixelShader);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPng(512, 512, maskablePixelShader);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = createPng(180, 180, iconPixelShader);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Favicon copy
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon192);

console.log('Icons generated successfully in public/');

// Generate manifest.webmanifest in public/
const manifest = {
  name: "MutabaahKu - Sahabat Ceria Hafalan & Ibadah",
  short_name: "MutabaahKu",
  description: "Aplikasi Mutabaah Hafalan Quran, Hadis, Doa, dan Ibadah Harian Anak Sholih",
  start_url: "/",
  id: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#F0FDF4",
  theme_color: "#059669",
  categories: ["education", "lifestyle", "kids"],
  icons: [
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/pwa-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('manifest.webmanifest written to public/');
