import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// 1. Pure "Kinetic G Barbell" Vector Mark SVG
export const KINETIC_G_BARBELL_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none">
  <defs>
    <!-- Teal-to-Volt Signature Gradient -->
    <linearGradient id="kineticGradient" x1="15%" y1="90%" x2="85%" y2="10%">
      <stop offset="0%" stop-color="#008B8E" />
      <stop offset="45%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#B4FF39" />
    </linearGradient>

    <!-- Subtle drop shadow for depth -->
    <filter id="markShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#008B8E" flood-opacity="0.15" />
    </filter>
  </defs>

  <g filter="url(#markShadow)">
    <!-- LEFT BARBELL & PLATES (Performance Teal #008B8E) -->
    <!-- Left Bar Collar & End -->
    <rect x="8" y="56" width="6" height="8" rx="2" fill="#008B8E" />
    <!-- Left Shaft -->
    <rect x="14" y="57" width="56" height="6" rx="2" fill="#008B8E" />
    <!-- Left Outer Small Plate -->
    <rect x="18" y="44" width="7" height="32" rx="3" fill="#008B8E" />
    <!-- Left Mid Plate -->
    <rect x="29" y="34" width="8" height="52" rx="3.5" fill="#008B8E" />
    <!-- Left Inner Large Plate -->
    <rect x="41" y="22" width="10" height="76" rx="4" fill="#008B8E" />

    <!-- RIGHT BARBELL & PLATES (Electric Volt #B4FF39) -->
    <!-- Right Shaft -->
    <rect x="120" y="57" width="66" height="6" rx="2" fill="#B4FF39" />
    <!-- Right Inner Large Plate -->
    <rect x="139" y="22" width="10" height="76" rx="4" fill="#B4FF39" />
    <!-- Right Mid Plate -->
    <rect x="153" y="34" width="8" height="52" rx="3.5" fill="#B4FF39" />
    <!-- Right Outer Small Plate -->
    <rect x="165" y="44" width="7" height="32" rx="3" fill="#B4FF39" />
    <!-- Right Bar Collar & End -->
    <rect x="176" y="56" width="6" height="8" rx="2" fill="#B4FF39" />

    <!-- CENTRAL KINETIC "G" (Dynamic Chamfered Form with Fins) -->
    <!-- Outer Kinetic Silhouette -->
    <path d="
      M 136 12
      L 124 22
      C 114 18 103 16 93 18
      C 69 22 53 43 57 68
      C 60 88 77 102 99 102
      C 112 102 123 96 130 87
      L 132 84
      L 118 73
      C 114 78 108 82 99 82
      C 87 82 76 74 74 61
      C 72 47 81 36 96 34
      C 104 33 111 36 116 41
      L 100 54
      L 100 66
      L 137 66
      C 138 66 139 65 139 63
      L 139 48
      L 142 45
      L 142 16
      Z
      M 53 96
      L 67 85
      L 63 76
      Z
    " fill="url(#kineticGradient)" />

    <!-- Sharp Kinetic Accent Slice overlay on G -->
    <path d="
      M 136 12
      L 115 30
      L 125 32
      L 142 16
      Z
    " fill="#C9FF5E" opacity="0.9" />

    <!-- Bottom Left Kinetic Fin Spike -->
    <path d="
      M 51 98
      L 73 82
      L 67 74
      L 46 95
      Z
    " fill="#008B8E" />
  </g>
</svg>`;

// 2. Square App Icon SVG (inside AMOLED dark base #0F172A with rounded squircle)
export const SQUIRCLE_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141E30" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>

    <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
    </linearGradient>

    <linearGradient id="kineticGradient512" x1="15%" y1="90%" x2="85%" y2="10%">
      <stop offset="0%" stop-color="#008B8E" />
      <stop offset="45%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#B4FF39" />
    </linearGradient>

    <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Rounded Squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
  <rect width="512" height="512" rx="128" fill="url(#innerGlow)" />
  <rect x="1" y="1" width="510" height="510" rx="127" stroke="rgba(203, 213, 225, 0.15)" stroke-width="2" />

  <!-- Ambient Glow behind mark -->
  <circle cx="256" cy="256" r="160" fill="#008B8E" opacity="0.18" filter="blur(40px)" />
  <circle cx="280" cy="230" r="120" fill="#B4FF39" opacity="0.12" filter="blur(40px)" />

  <!-- Centered Kinetic G Barbell Mark Scaled to 400x240 -->
  <g transform="translate(56, 136) scale(2.0)">
    <!-- LEFT BARBELL & PLATES -->
    <rect x="8" y="56" width="6" height="8" rx="2" fill="#008B8E" />
    <rect x="14" y="57" width="56" height="6" rx="2" fill="#008B8E" />
    <rect x="18" y="44" width="7" height="32" rx="3" fill="#008B8E" />
    <rect x="29" y="34" width="8" height="52" rx="3.5" fill="#008B8E" />
    <rect x="41" y="22" width="10" height="76" rx="4" fill="#008B8E" />

    <!-- RIGHT BARBELL & PLATES -->
    <rect x="120" y="57" width="66" height="6" rx="2" fill="#B4FF39" />
    <rect x="139" y="22" width="10" height="76" rx="4" fill="#B4FF39" />
    <rect x="153" y="34" width="8" height="52" rx="3.5" fill="#B4FF39" />
    <rect x="165" y="44" width="7" height="32" rx="3" fill="#B4FF39" />
    <rect x="176" y="56" width="6" height="8" rx="2" fill="#B4FF39" />

    <!-- CENTRAL KINETIC G -->
    <path d="
      M 136 12
      L 124 22
      C 114 18 103 16 93 18
      C 69 22 53 43 57 68
      C 60 88 77 102 99 102
      C 112 102 123 96 130 87
      L 132 84
      L 118 73
      C 114 78 108 82 99 82
      C 87 82 76 74 74 61
      C 72 47 81 36 96 34
      C 104 33 111 36 116 41
      L 100 54
      L 100 66
      L 137 66
      C 138 66 139 65 139 63
      L 139 48
      L 142 45
      L 142 16
      Z
      M 53 96
      L 67 85
      L 63 76
      Z
    " fill="url(#kineticGradient512)" />

    <!-- Top Fin Highlight -->
    <path d="M 136 12 L 115 30 L 125 32 L 142 16 Z" fill="#C9FF5E" opacity="0.9" />

    <!-- Bottom Left Fin Spike -->
    <path d="M 51 98 L 73 82 L 67 74 L 46 95 Z" fill="#008B8E" />
  </g>
</svg>`;

// Helper function to build simple multi-size ICO buffer from PNGs
function createIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + pngBuffers.length * 16;
  const directoryEntries = [];
  const imageBuffers = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset

    directoryEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
}

async function generateAssets() {
  console.log('Starting Kinetic G Barbell brand asset generation...');

  // 1. Write public/icon-192.svg and icon-512.svg (vector standards)
  const svgPath = path.join(publicDir, 'icon-192.svg');
  fs.writeFileSync(svgPath, SQUIRCLE_APP_ICON_SVG, 'utf8');
  console.log('✓ Wrote public/icon-192.svg');

  const svg512Path = path.join(publicDir, 'icon-512.svg');
  fs.writeFileSync(svg512Path, SQUIRCLE_APP_ICON_SVG, 'utf8');
  console.log('✓ Wrote public/icon-512.svg');

  // Also create public/favicon.svg (clean transparent mark for modern browsers)
  const faviconSvgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(faviconSvgPath, KINETIC_G_BARBELL_MARK_SVG, 'utf8');
  console.log('✓ Wrote public/favicon.svg');

  // 2. Generate icon-192.png
  const icon192Buffer = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG))
    .resize(192, 192)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192Buffer);
  console.log('✓ Generated public/icon-192.png (192x192)');

  // 3. Generate icon-512.png
  const icon512Buffer = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG))
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512Buffer);
  console.log('✓ Generated public/icon-512.png (512x512)');

  // 4. Generate apple-touch-icon.png (180x180)
  const appleIconBuffer = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG))
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIconBuffer);
  console.log('✓ Generated public/apple-touch-icon.png (180x180)');

  // 5. Generate favicon.ico (16x16, 32x32, 48x48)
  const icon16 = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG)).resize(16, 16).png().toBuffer();
  const icon32 = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG)).resize(32, 32).png().toBuffer();
  const icon48 = await sharp(Buffer.from(SQUIRCLE_APP_ICON_SVG)).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: icon16 },
    { width: 32, height: 32, buffer: icon32 },
    { width: 48, height: 48, buffer: icon48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated public/favicon.ico (multi-res 16, 32, 48)');

  console.log('Brand asset generation complete!');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
