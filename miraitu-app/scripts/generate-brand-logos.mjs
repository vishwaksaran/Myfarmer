/**
 * Generates polished SVG brand logos for all tractor brands.
 * Design: gradient background, tractor icon silhouette, bold brand initials, brand name.
 * Run: node scripts/generate-brand-logos.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'images', 'brands', 'tractors');
mkdirSync(OUTPUT_DIR, { recursive: true });

const brands = [
  // Tier 1
  { slug: 'mahindra', name: 'Mahindra', color: '#cc0000', color2: '#8b0000', initials: 'M' },
  { slug: 'swaraj', name: 'Swaraj', color: '#e6001f', color2: '#a30016', initials: 'SW' },
  { slug: 'sonalika', name: 'Sonalika', color: '#1a5276', color2: '#0e3450', initials: 'SN' },
  { slug: 'john-deere', name: 'John Deere', color: '#367c2b', color2: '#1e4d18', initials: 'JD' },
  { slug: 'massey-ferguson', name: 'Massey Ferguson', color: '#cc0000', color2: '#990000', initials: 'MF' },
  { slug: 'new-holland', name: 'New Holland', color: '#003da5', color2: '#002266', initials: 'NH' },
  { slug: 'eicher', name: 'Eicher', color: '#b30000', color2: '#800000', initials: 'E' },
  { slug: 'kubota', name: 'Kubota', color: '#f28c00', color2: '#c06e00', initials: 'K' },
  { slug: 'farmtrac', name: 'Farmtrac', color: '#d4200c', color2: '#a01808', initials: 'FT' },
  { slug: 'powertrac', name: 'Powertrac', color: '#002b5c', color2: '#001a38', initials: 'PT' },
  // Tier 2
  { slug: 'tafe', name: 'TAFE', color: '#1b4f72', color2: '#103350', initials: 'TF' },
  { slug: 'solis', name: 'Solis', color: '#e67e22', color2: '#b86318', initials: 'SL' },
  { slug: 'indo-farm', name: 'Indo Farm', color: '#2e86c1', color2: '#1a5f94', initials: 'IF' },
  { slug: 'force', name: 'Force', color: '#2c3e50', color2: '#1a252f', initials: 'FM' },
  { slug: 'vst-shakti', name: 'VST Shakti', color: '#229954', color2: '#14693a', initials: 'VS' },
  { slug: 'captain', name: 'Captain', color: '#e74c3c', color2: '#b83a2e', initials: 'CP' },
  { slug: 'ace', name: 'ACE', color: '#f39c12', color2: '#c07c0e', initials: 'AC' },
  { slug: 'preet', name: 'Preet', color: '#8e44ad', color2: '#6a3382', initials: 'PR' },
  { slug: 'escorts', name: 'Escorts', color: '#2980b9', color2: '#1c5f8a', initials: 'EK' },
  { slug: 'kartar', name: 'Kartar', color: '#27ae60', color2: '#1c8048', initials: 'KR' },
  // Tier 3
  { slug: 'same-deutz-fahr', name: 'Same Deutz Fahr', color: '#005b96', color2: '#003d66', initials: 'SD' },
  { slug: 'trakstar', name: 'Trakstar', color: '#c0392b', color2: '#8e2a1f', initials: 'TS' },
  { slug: 'standard', name: 'Standard', color: '#2c3e50', color2: '#1a252f', initials: 'ST' },
  { slug: 'cooper', name: 'Cooper', color: '#16a085', color2: '#0e7460', initials: 'CO' },
  { slug: 'autonxt', name: 'AutoNxt', color: '#2ecc71', color2: '#1fa855', initials: 'AN' },
  { slug: 'hav', name: 'HAV', color: '#3498db', color2: '#2271a8', initials: 'HV' },
  { slug: 'hindustan', name: 'Hindustan', color: '#7f8c8d', color2: '#5d6566', initials: 'HN' },
  { slug: 'cellestial', name: 'Cellestial', color: '#1abc9c', color2: '#128a72', initials: 'CL' },
  { slug: 'montra', name: 'Montra', color: '#9b59b6', color2: '#724288', initials: 'MO' },
];

// Minimalist tractor silhouette path for the background watermark
const tractorPath = 'M28 62h4v-6h8l4-8h12l2 8h8v6h4v8h-4v4h-8l-2 4h-4l-2-4h-12l-2 4h-4l-2-4h-8v-4h-4z';

function generateSVG(brand) {
  const { name, color, color2, initials } = brand;
  const initialsSize = initials.length <= 2 ? 40 : 30;
  const nameSize = name.length > 14 ? 9 : name.length > 10 ? 10 : 11;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="white" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="120" height="120" rx="20" fill="url(#bg)"/>
  <!-- Shine overlay -->
  <rect width="120" height="120" rx="20" fill="url(#shine)"/>
  <!-- Subtle tractor watermark -->
  <path d="${tractorPath}" fill="white" opacity="0.08" transform="translate(12, 8) scale(0.9)"/>
  <!-- Brand initials -->
  <text x="60" y="52" text-anchor="middle" dominant-baseline="central" font-family="system-ui,'Segoe UI',Roboto,sans-serif" font-size="${initialsSize}" font-weight="800" fill="white" letter-spacing="1">${initials}</text>
  <!-- Brand name -->
  <rect x="10" y="80" width="100" height="22" rx="6" fill="white" opacity="0.2"/>
  <text x="60" y="93" text-anchor="middle" dominant-baseline="central" font-family="system-ui,'Segoe UI',Roboto,sans-serif" font-size="${nameSize}" font-weight="600" fill="white">${name}</text>
</svg>`;
}

let count = 0;
for (const brand of brands) {
  const svg = generateSVG(brand);
  const filePath = join(OUTPUT_DIR, `${brand.slug}.svg`);
  writeFileSync(filePath, svg, 'utf-8');
  count++;
}

console.log(`Generated ${count} brand logo SVGs in ${OUTPUT_DIR}`);
