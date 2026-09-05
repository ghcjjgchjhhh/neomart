export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const query = typeof request.query?.q === 'string' ? request.query.q.trim() : '';
  const state = typeof request.query?.state === 'string' ? request.query.state.trim() : '';
  const lga = typeof request.query?.lga === 'string' ? request.query.lga.trim() : '';
  const city = typeof request.query?.city === 'string' ? request.query.city.trim() : '';

  if (query.length < 2 || !state || !lga) {
    response.status(400).json({ error: 'A search query, state, and LGA are required' });
    return;
  }

  const parts = [query, city, lga, state, 'Nigeria'].filter(Boolean).join(', ');
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', parts);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '8');
  url.searchParams.set('countrycodes', 'ng');
  url.searchParams.set('accept-language', 'en');

  try {
    const result = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NeoMart delivery address search (support@neomart.ng)',
      },
    });
    if (!result.ok) {
      response.status(502).json({ error: 'Location provider unavailable' });
      return;
    }

    const data = await result.json();
    const suggestions = Array.isArray(data)
      ? data.map((item: any) => ({
          displayName: item.display_name,
          name: item.address?.road || item.address?.suburb || item.address?.city || item.name,
          street: item.address?.road || '',
          city: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || '',
          latitude: item.lat,
          longitude: item.lon,
        })).filter((item: any) => item.name)
      : [];

    response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.status(200).json({ suggestions });
  } catch {
    response.status(502).json({ error: 'Location provider unavailable' });
  }
}
