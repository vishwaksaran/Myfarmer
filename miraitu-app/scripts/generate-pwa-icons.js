/**
 * PWA Icon Generator
 * Generates all required icon sizes for crisp PWA icons on all devices.
 * Run: node scripts/generate-pwa-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// ── Config ─────────────────────────────────────────────────────────────────
// Use the highest quality source available (PNG preferred over JPEG)
const CANDIDATES = [
  "public/icon-512.png",
  "public/miraitu-logo-icon.png",
  "public/logo-icon.png",
  "public/icon-192.png",
  "public/Logo-512x512.jpg",
  "public/logo-192x192.jpg",
];

const OUTPUT_DIR = "public/icons";

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// ── Helpers ─────────────────────────────────────────────────────────────────
function findSource() {
  for (const candidate of CANDIDATES) {
    if (fs.existsSync(candidate)) {
      console.log(`✅ Using source icon: ${candidate}`);
      return candidate;
    }
  }
  throw new Error(
    "❌ No source icon found. Please place a high-res icon (512x512+) in the public/ folder."
  );
}

async function generateIcons() {
  const source = findSource();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  console.log("\n🎨 Generating standard icons...");
  for (const size of SIZES) {
    const outPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(source)
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // transparent bg
        kernel: sharp.kernel.lanczos3, // high-quality downscaling
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`  ✔ ${outPath} (${size}×${size})`);
  }

  // Maskable icons need extra safe zone padding (icon fills ~80% of canvas)
  console.log("\n🎭 Generating maskable icons...");
  for (const size of [192, 512]) {
    const outPath = path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`);
    const iconSize = Math.round(size * 0.72); // 72% = safe zone for maskable
    const padding = Math.round((size - iconSize) / 2);

    await sharp(source)
      .resize(iconSize, iconSize, {
        fit: "contain",
        background: { r: 44, g: 89, b: 38, alpha: 1 }, // #2c5926 brand green
        kernel: sharp.kernel.lanczos3,
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 44, g: 89, b: 38, alpha: 1 }, // brand green bg
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`  ✔ ${outPath} (${size}×${size}, maskable)`);
  }

  // Apple touch icon (180x180, white bg, no transparency)
  console.log("\n🍎 Generating Apple touch icon...");
  await sharp(source)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: sharp.kernel.lanczos3,
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ quality: 100 })
    .toFile("public/apple-icon.png");
  console.log("  ✔ public/apple-icon.png (180×180)");

  // Favicon.ico (16x16 + 32x32 via sharp → use 32x32 PNG as favicon)
  console.log("\n🌐 Generating favicon...");
  await sharp(source)
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100 })
    .toFile("public/favicon-32x32.png");
  await sharp(source)
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png({ quality: 100 })
    .toFile("public/favicon-16x16.png");
  console.log("  ✔ public/favicon-32x32.png & favicon-16x16.png");

  console.log("\n✅ All icons generated successfully!");
  console.log(`📂 Icons saved to: ${OUTPUT_DIR}/`);
  console.log("\n📋 Next steps:");
  console.log("   1. Icons are already referenced in manifest.json");
  console.log("   2. Restart your dev server");
  console.log("   3. Clear browser cache / reinstall PWA");
}

generateIcons().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
