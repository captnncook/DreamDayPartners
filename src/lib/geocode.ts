export async function geocodeCity(city?: string | null): Promise<{ latitude?: number; longitude?: number }> {
  if (!city) return {};
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Nederland")}&format=json&limit=1`,
      { headers: { "User-Agent": "DreamDayPartners/1.0 (info@dreamdayplatform.com)" } }
    );
    const json = await res.json();
    if (json[0]) return { latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon) };
  } catch {
    // geocoding is best-effort
  }
  return {};
}
