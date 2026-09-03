import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');
const srcDir = path.resolve(__dirname, '../src');

// Multi-size ICO builder
function createIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + pngBuffers.length * 16;
  const directoryEntries = [];
  const imageBuffers = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    directoryEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
}

async function run() {
  console.log('Generating 100% same-to-same Kinetic G Barbell brand assets...');

  const masterMarkPath = path.join(publicDir, 'kinetic-mark-master.png');
  const masterBuffer = fs.readFileSync(masterMarkPath);
  const masterMeta = await sharp(masterBuffer).metadata();
  console.log('Master dimensions:', masterMeta.width, masterMeta.height);

  // 1. Export base64 data URI module for seamless React embedding
  const base64Data = `data:image/png;base64,${masterBuffer.toString('base64')}`;
  const tsContent = `// Auto-generated 100% exact Kinetic G Barbell master mark
export const KINETIC_G_BARBELL_PNG = "${base64Data}";
export const KINETIC_G_BARBELL_ASPECT = ${masterMeta.width} / ${masterMeta.height};
`;
  fs.writeFileSync(path.join(srcDir, 'components/ui/kineticMarkData.ts'), tsContent, 'utf8');
  console.log('✓ Wrote src/components/ui/kineticMarkData.ts');

  // 2. Standalone Transparent SVG (wraps master image in scalable SVG container)
  const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${masterMeta.width} ${masterMeta.height}" width="100%" height="100%">
  <image href="${base64Data}" width="${masterMeta.width}" height="${masterMeta.height}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), transparentSvg, 'utf8');
  console.log('✓ Wrote public/favicon.svg');

  // 3. Generate App Icons on AMOLED Dark Container (#0F172A / #141E30 gradient with rounded border)
  // Matching the design pack: squircle with subtle neon glow behind the mark
  async function generateSquircleIcon(size) {
    const cornerRadius = Math.round(size * 0.23);
    const markWidth = Math.round(size * 0.76);
    const markHeight = Math.round((markWidth / masterMeta.width) * masterMeta.height);

    const markResized = await sharp(masterBuffer)
      .resize(markWidth, markHeight, { fit: 'contain' })
      .toBuffer();

    const top = Math.round((size - markHeight) / 2);
    const left = Math.round((size - markWidth) / 2);

    // Background SVG with gradient and squircle shape
    const bgSvg = Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141E30" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#008B8E" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#B4FF39" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bgGrad)" />
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${cornerRadius - 2}" stroke="rgba(203, 213, 225, 0.18)" stroke-width="2" fill="none" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="url(#glow)" />
    </svg>`);

    const iconBuffer = await sharp(bgSvg)
      .composite([{ input: markResized, top, left }])
      .png()
      .toBuffer();

    return iconBuffer;
  }

  // Generate 512x512
  const icon512 = await generateSquircleIcon(512);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  console.log('✓ Generated public/icon-512.png (512x512)');

  // Generate 192x192
  const icon192 = await generateSquircleIcon(192);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  console.log('✓ Generated public/icon-192.png (192x192)');

  // Generate 180x180 apple-touch-icon
  const appleIcon = await generateSquircleIcon(180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
  console.log('✓ Generated public/apple-touch-icon.png (180x180)');

  // 4. Vector icon-192.svg and icon-512.svg wrapping the base64 composite
  const icon512Base64 = `data:image/png;base64,${icon512.toString('base64')}`;
  const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="${icon512Base64}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), iconSvgContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), iconSvgContent, 'utf8');
  console.log('✓ Wrote public/icon-192.svg and icon-512.svg');

  // 5. Generate Multi-size favicon.ico
  const ico16 = await sharp(masterBuffer).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const ico32 = await sharp(masterBuffer).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const ico48 = await sharp(masterBuffer).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  const ico = createIco([
    { width: 16, height: 16, buffer: ico16 },
    { width: 32, height: 32, buffer: ico32 },
    { width: 48, height: 48, buffer: ico48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log('✓ Generated public/favicon.ico (16, 32, 48)');

  // Clean up temporary test crops
  try {
    fs.unlinkSync(path.join(publicDir, 'test-crop.png'));
    fs.unlinkSync(path.join(publicDir, 'test-crop2.png'));
    fs.unlinkSync(path.join(publicDir, 'test-crop-topleft.png'));
    fs.unlinkSync(path.join(publicDir, 'kinetic-mark-transparent.png'));
  } catch (e) {}

  console.log('All 100% same-to-same brand assets generated successfully!');
}

run().catch((err) => {
  console.error('Error generating exact assets:', err);
  process.exit(1);
});
