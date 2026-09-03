import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Read master logo asset
  const logoPath = path.join(publicDir, 'kinetic-mark-master.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradients -->
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A0F1D" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#070C18" />
      </linearGradient>

      <!-- Glow Gradients -->
      <radialGradient id="teal-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#008B8E" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#008B8E" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="volt-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#B4FF39" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#B4FF39" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="pill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(0,139,142,0.2)" />
        <stop offset="100%" stop-color="rgba(180,255,57,0.15)" />
      </linearGradient>
    </defs>

    <!-- Base Canvas -->
    <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

    <!-- Ambient Glow Orbs -->
    <circle cx="600" cy="220" r="320" fill="url(#teal-glow)" />
    <circle cx="600" cy="220" r="220" fill="url(#volt-glow)" />

    <!-- Subtle Grid Lines -->
    <line x1="0" y1="120" x2="${width}" y2="120" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <line x1="0" y1="510" x2="${width}" y2="510" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <line x1="200" y1="0" x2="200" y2="${height}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <line x1="1000" y1="0" x2="1000" y2="${height}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />

    <!-- Centered Logo Image -->
    ${
      logoBase64
        ? `<image href="${logoBase64}" x="510" y="80" width="180" height="110" preserveAspectRatio="xMidYMid meet" />`
        : ''
    }

    <!-- Brand Category Tag -->
    <rect x="425" y="215" width="350" height="34" rx="17" fill="url(#pill-grad)" stroke="rgba(0,139,142,0.4)" stroke-width="1" />
    <text x="600" y="237" fill="#008B8E" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="3" text-anchor="middle">
      PRECISION ATHLETIC TRACKER
    </text>

    <!-- Primary Title: Gym Log -->
    <text x="560" y="325" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="2" text-anchor="middle">
      Gym Log
    </text>
    <circle cx="682" cy="316" r="8" fill="#B4FF39" filter="drop-shadow(0 0 8px #B4FF39)" />

    <!-- Subtitle / Value Proposition -->
    <text x="600" y="380" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" text-anchor="middle">
      Fast, Offline-First Workout Companion &amp; Strength Telemetry
    </text>

    <!-- Feature Pills Strip -->
    <g transform="translate(240, 430)">
      <!-- Pill 1 -->
      <rect x="0" y="0" width="160" height="36" rx="18" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.2)" stroke-width="1" />
      <text x="80" y="23" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">⚡ 100% Offline PWA</text>

      <!-- Pill 2 -->
      <rect x="180" y="0" width="165" height="36" rx="18" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.2)" stroke-width="1" />
      <text x="262" y="23" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">🔒 Zero Accounts</text>

      <!-- Pill 3 -->
      <rect x="365" y="0" width="175" height="36" rx="18" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.2)" stroke-width="1" />
      <text x="452" y="23" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">💾 Local IndexedDB</text>

      <!-- Pill 4 -->
      <rect x="560" y="0" width="160" height="36" rx="18" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.2)" stroke-width="1" />
      <text x="640" y="23" fill="#B4FF39" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">⏱ 60 FPS Telemetry</text>
    </g>

    <!-- Bottom URL and Attribution -->
    <text x="600" y="565" fill="#64748B" font-family="monospace" font-size="14" font-weight="600" letter-spacing="2" text-anchor="middle">
      HTTPS://GYMLOG-18.VERCEL.APP • BUILT BY SUNIL PAUDYAL
    </text>
  </svg>
  `;

  const outputPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log('✅ Generated public/og-image.png (1200x630px)');
}

generateOgImage().catch(console.error);
