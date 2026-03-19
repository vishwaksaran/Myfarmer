/**
 * generate-icons.mjs
 * Regenerates all PWA icons with a proper green background (#2c5926)
 * so there's no black or white background showing through.
 * 
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Source logo — the transparent-background logo mark
const sourceIcon = path.join(publicDir, 'icons', 'icon-512x512.png');

// Green brand color
const BG_COLOR = { r: 44, g: 89, b: 38, alpha: 1 }; // #2c5926

// All icon sizes to generate
const STANDARD_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

async function generateIcon(size, outputPath, isMaskable = false) {
  // For maskable icons, the logo should be at ~80% of canvas (safe zone)
  // For regular icons, logo fills ~95% of canvas
  const logoSize = isMaskable ? Math.round(size * 0.7) : Math.round(size * 0.85);
  const padding = Math.round((size - logoSize) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([
      {
        input: await sharp(sourceIcon)
          .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`✅ Generated: ${path.basename(outputPath)} (${size}x${size})`);
}

async function main() {
  console.log('🎨 Generating PWA icons with green background...\n');

  // Generate standard icons
  for (const size of STANDARD_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await generateIcon(size, outputPath, false);
  }

  // Generate maskable icons (safe zone padding)
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(iconsDir, `icon-maskable-${size}x${size}.png`);
    await generateIcon(size, outputPath, true);
  }

  // Also update the root-level icons
  await generateIcon(192, path.join(publicDir, 'icon-192.png'), false);
  await generateIcon(512, path.join(publicDir, 'icon-512.png'), false);
  await generateIcon(512, path.join(publicDir, 'web-app-manifest-192x192.png').replace('512', '192'), false);
  await generateIcon(512, path.join(publicDir, 'web-app-manifest-512x512.png'), false);

  // Generate favicon sizes (32x32 and 16x16) with white bg for browser tab
  await sharp({
    create: { width: 32, height: 32, channels: 4, background: BG_COLOR },
  })
    .composite([
      {
        input: await sharp(sourceIcon)
          .resize(28, 28, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✅ Generated: favicon-32x32.png');

  await sharp({
    create: { width: 16, height: 16, channels: 4, background: BG_COLOR },
  })
    .composite([
      {
        input: await sharp(sourceIcon)
          .resize(14, 14, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✅ Generated: favicon-16x16.png');

  // Apple touch icon - 180x180 with green background
  await generateIcon(180, path.join(publicDir, 'apple-icon.png'), false);
  console.log('✅ Generated: apple-icon.png');

  // Also fix the splash screen logo (miraitu-logo-icon.png)
  // Make it centered with lots of breathing room on transparent background
  await sharp(sourceIcon)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'miraitu-logo-icon.png'));
  console.log('✅ Updated: miraitu-logo-icon.png (for splash screen)');

  console.log('\n🎉 All icons generated successfully!');
  console.log('📝 Remember to clear browser/PWA cache to see the changes.');
}

main().catch(console.error);
