export type LatLng = [number, number];

export function parseDbPoint(value: unknown): LatLng | null {
  if (!value) return null;

  if (typeof value === 'object') {
    const geo = value as { type?: string; coordinates?: unknown };
    if (geo.type === 'Point' && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const [lng, lat] = geo.coordinates.map(Number);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
  }

  if (typeof value !== 'string') return null;

  const wktMatch = value.match(/POINT\s*\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)/i);
  if (wktMatch) {
    const lng = Number(wktMatch[1]);
    const lat = Number(wktMatch[2]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  if (/^01010000/i.test(value) && value.length >= 42) {
    const littleEndianHex = value.slice(-32);
    const bytes = littleEndianHex.match(/../g)?.map((hex) => parseInt(hex, 16));
    if (bytes?.length === 16) {
      const view = new DataView(new Uint8Array(bytes).buffer);
      const lng = view.getFloat64(0, true);
      const lat = view.getFloat64(8, true);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
  }

  return null;
}
