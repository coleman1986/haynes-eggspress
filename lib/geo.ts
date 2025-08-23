export type LngLat = { lng: number; lat: number };

type Polygon = number[][][];
type MultiPolygon = number[][][][];

type Geo = {
  type: string;
  coordinates?: any;
  features?: any[];
  geometry?: { type: string; coordinates: any };
};

export function pointInPolygon(pt: LngLat, poly: number[][][]): boolean {
  let inside = false;
  for (const ring of poly) {
    let j = ring.length - 1;
    for (let i = 0; i < ring.length; i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > pt.lat) !== (yj > pt.lat)) &&
        (pt.lng < (xj - xi) * (pt.lat - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
      j = i;
    }
  }
  return inside;
}

export function loadPolygonFromEnv(): (pt: LngLat & { postal?: string }) => boolean {
  const raw = process.env.SERVICE_AREA_GEOJSON;
  const zipFallback = process.env.SERVICE_ZIP || process.env.NEXT_PUBLIC_SERVICE_ZIP || "33584";
  if (!raw) {
    return (pt: any) => pt.postal === zipFallback;
  }
  try {
    const geo = JSON.parse(raw) as Geo;

    function anyToPolygons(g: any): Polygon[] {
      if (!g) return [];
      if (g.type === "Polygon") return [g.coordinates as Polygon];
      if (g.type === "MultiPolygon") return g.coordinates as MultiPolygon;
      return [];
    }

    let polys: Polygon[] = [];
    if (geo.type === "FeatureCollection") {
      for (const f of geo.features || []) polys.push(...anyToPolygons(f.geometry));
    } else if (geo.type === "Feature") {
      polys = anyToPolygons(geo.geometry);
    } else {
      polys = anyToPolygons(geo);
    }

    if (polys.length === 0) return (pt: any) => pt.postal === zipFallback;
    return (pt: LngLat) => polys.some(poly => pointInPolygon(pt, poly));
  } catch {
    return (pt: any) => pt.postal === zipFallback;
  }
}
