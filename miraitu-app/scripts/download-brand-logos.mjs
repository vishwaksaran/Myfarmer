/**
 * Downloads real brand logos from multiple sources.
 * Strategy:
 *   1. Try fetching from tractorjunction.com brand pages (they host all brand logos)
 *   2. Try Google Favicon API (sz=128)
 *   3. Try fetching from official brand websites (common logo paths)
 *   4. Fall back to existing SVG placeholder
 * 
 * Run: node scripts/download-brand-logos.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'images', 'brands', 'tractors');
mkdirSync(OUTPUT_DIR, { recursive: true });

const brands = [
  { slug: 'mahindra', name: 'Mahindra', tj: 'mahindra-tractor', domain: 'mahindra.com' },
  { slug: 'swaraj', name: 'Swaraj', tj: 'swaraj-tractor', domain: 'swarajtractors.com' },
  { slug: 'sonalika', name: 'Sonalika', tj: 'sonalika-tractor', domain: 'sonalika.com' },
  { slug: 'john-deere', name: 'John Deere', tj: 'john-deere-tractor', domain: 'deere.com' },
  { slug: 'massey-ferguson', name: 'Massey Ferguson', tj: 'massey-ferguson-tractor', domain: 'masseyferguson.com' },
  { slug: 'new-holland', name: 'New Holland', tj: 'new-holland-tractor', domain: 'newholland.com' },
  { slug: 'eicher', name: 'Eicher', tj: 'eicher-tractor', domain: 'tmtl.in' },
  { slug: 'kubota', name: 'Kubota', tj: 'kubota-tractor', domain: 'kubota.com' },
  { slug: 'farmtrac', name: 'Farmtrac', tj: 'farmtrac-tractor', domain: 'farmtrac.com' },
  { slug: 'powertrac', name: 'Powertrac', tj: 'powertrac-tractor', domain: 'powertractractors.com' },
  { slug: 'tafe', name: 'TAFE', tj: 'tafe-tractor', domain: 'tafe.com' },
  { slug: 'solis', name: 'Solis', tj: 'solis-tractor', domain: 'solistractors.com' },
  { slug: 'indo-farm', name: 'Indo Farm', tj: 'indo-farm-tractor', domain: 'indofarm.in' },
  { slug: 'force', name: 'Force Motors', tj: 'force-tractor', domain: 'forcemotors.com' },
  { slug: 'vst-shakti', name: 'VST Shakti', tj: 'vst-shakti-tractor', domain: 'vsttillers.com' },
  { slug: 'captain', name: 'Captain', tj: 'captain-tractor', domain: 'captaintractors.com' },
  { slug: 'ace', name: 'ACE', tj: 'ace-tractor', domain: 'ace-tractors.com' },
  { slug: 'preet', name: 'Preet', tj: 'preet-tractor', domain: 'preetgroup.com' },
  { slug: 'escorts', name: 'Escorts Kubota', tj: 'escorts-tractor', domain: 'escorts.co.in' },
  { slug: 'kartar', name: 'Kartar', tj: 'kartar-tractor', domain: 'kartaragro.com' },
  { slug: 'same-deutz-fahr', name: 'Same Deutz Fahr', tj: 'same-deutz-fahr-tractor', domain: 'samedeutz-fahr.com' },
  { slug: 'trakstar', name: 'Trakstar', tj: 'trakstar-tractor', domain: 'trakstartractors.com' },
  { slug: 'standard', name: 'Standard', tj: 'standard-tractor', domain: 'standardtractors.in' },
  { slug: 'cooper', name: 'Cooper', tj: 'cooper-tractor', domain: 'coopercorp.in' },
  { slug: 'autonxt', name: 'AutoNxt', tj: 'autonxt-tractor', domain: 'autonxt.in' },
  { slug: 'hav', name: 'HAV', tj: 'hav-tractor', domain: 'havtractors.com' },
  { slug: 'hindustan', name: 'Hindustan', tj: 'hindustan-tractor', domain: 'hmil.in' },
  { slug: 'cellestial', name: 'Cellestial', tj: 'cellestial-tractor', domain: 'cellestial.ai' },
  { slug: 'montra', name: 'Montra', tj: 'montra-tractor', domain: 'montraelectric.com' },
];

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = (urlStr, redirectCount = 0) => {
      if (redirectCount > 5) return reject(new Error('Too many redirects'));
      protocol.get(urlStr, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith('/')) {
            const u = new URL(urlStr);
            loc = `${u.protocol}//${u.host}${loc}`;
          }
          res.resume();
          return request(loc, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || '' }));
        res.on('error', reject);
      }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
    };
    request(url);
  });
}

// Extract logo image URLs from a brand page HTML
function extractLogoUrls(html) {
  const urls = [];
  // Look for brand logo images - these typically have "brand" or "logo" in alt/class/src
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const fullTag = match[0].toLowerCase();
    if ((fullTag.includes('brand') || fullTag.includes('logo') || fullTag.includes('Brand')) && 
        (src.includes('.png') || src.includes('.webp') || src.includes('.jpg') || src.includes('.svg'))) {
      urls.push(src);
    }
  }
  // Also check og:image meta tag
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch) urls.push(ogMatch[1]);
  return urls;
}

async function tryTractorJunction(brand) {
  // Fetch the brand page HTML and extract the logo image URL
  const pageUrl = `https://www.tractorjunction.com/${brand.tj}/`;
  try {
    const { buffer } = await fetchUrl(pageUrl);
    const html = buffer.toString('utf-8');
    const logoUrls = extractLogoUrls(html);
    
    // Try downloading each found logo URL
    for (const logoUrl of logoUrls) {
      try {
        const fullUrl = logoUrl.startsWith('http') ? logoUrl : `https://www.tractorjunction.com${logoUrl}`;
        const { buffer: imgBuf } = await fetchUrl(fullUrl);
        if (imgBuf.length > 1000) {
          return imgBuf;
        }
      } catch { /* skip to next URL */ }
    }
  } catch { /* page fetch failed */ }
  return null;
}

async function tryGoogleFavicon(domain) {
  try {
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const { buffer } = await fetchUrl(url);
    if (buffer.length > 1000) return buffer;
  } catch { /* skip */ }
  return null;
}

async function tryDirectLogo(domain) {
  const paths = ['/logo.png', '/images/logo.png', '/assets/images/logo.png', '/favicon-192x192.png'];
  for (const path of paths) {
    try {
      const { buffer } = await fetchUrl(`https://www.${domain}${path}`);
      if (buffer.length > 1000) return buffer;
    } catch { /* skip */ }
  }
  return null;
}

async function main() {
  let success = 0;
  let failed = 0;

  console.log('\n  Downloading real tractor brand logos...\n');

  for (const brand of brands) {
    process.stdout.write(`  ${brand.name.padEnd(20)}`);
    let buffer = null;
    let source = '';

    // Strategy 1: TractorJunction brand page
    buffer = await tryTractorJunction(brand);
    if (buffer) source = 'TractorJunction';

    // Strategy 2: Google Favicon
    if (!buffer) {
      buffer = await tryGoogleFavicon(brand.domain);
      if (buffer) source = 'Google Favicon';
    }

    // Strategy 3: Direct from official site
    if (!buffer) {
      buffer = await tryDirectLogo(brand.domain);
      if (buffer) source = 'Official site';
    }

    if (buffer) {
      const ext = 'png';
      writeFileSync(join(OUTPUT_DIR, `${brand.slug}.${ext}`), buffer);
      console.log(` ✓ ${(buffer.length / 1024).toFixed(1)}KB (${source})`);
      success++;
    } else {
      console.log(` ✗ keeping SVG placeholder`);
      failed++;
    }
  }

  console.log(`\n  Done: ${success} real logos, ${failed} kept as SVG\n`);
}

main();
