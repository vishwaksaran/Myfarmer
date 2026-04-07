const allTerms = [
  'bag of fertilizer farm store',
  'earthworms in soil compost',
  'millet close up grain cereal',
  'sorghum field plant grain',
  'butter slab knife spread',
  'urea granules chemical',
  'fertilizer store bags stacked',
  'worm casting soil organic'
];

async function searchFree(q) {
  try {
    const resp = await fetch(
      'https://unsplash.com/napi/search/photos?query=' + encodeURIComponent(q) + '&per_page=20',
      { headers: { 'Accept': 'application/json' } }
    );
    if (!resp.ok) return q + ' ||| ERR ' + resp.status;
    const data = await resp.json();
    if (!data.results || !data.results.length) return q + ' ||| NO RESULTS';

    // Filter for non-premium images only
    const freePhotos = data.results.filter(
      (item) => item.urls && item.urls.raw && !item.urls.raw.includes('plus.unsplash.com')
    );

    if (!freePhotos.length) return q + ' ||| ALL PREMIUM (' + data.results.length + ' results checked)';
    
    const photo = freePhotos[0];
    const baseUrl = photo.urls.raw.split('?')[0];
    return q + ' ||| ' + baseUrl + '?w=400&h=400&fit=crop';
  } catch (e) {
    return q + ' ||| ERROR: ' + e.message;
  }
}

async function main() {
  for (let i = 0; i < allTerms.length; i += 4) {
    const batch = allTerms.slice(i, i + 4);
    const results = await Promise.all(batch.map(searchFree));
    for (const r of results) {
      console.log(r);
    }
    // Small delay between batches
    if (i + 4 < allTerms.length) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

main();
