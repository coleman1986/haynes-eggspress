"use client";

import { useState, useMemo } from "react";
import AddressAutocomplete, { PlaceResult } from "./AddressAutocomplete";

type LngLat = { lng: number; lat: number };

function pointInPoly(pt: LngLat, poly: number[][][]): boolean {
  let inside = false;
  for (const ring of poly) {
    let j = ring.length - 1;
    for (let i = 0; i < ring.length; i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect =
        (yi > pt.lat) !== (yj > pt.lat) &&
        pt.lng < ((xj - xi) * (pt.lat - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) inside = !inside;
      j = i;
    }
  }
  return inside;
}

function loadPolygon(): (pt: LngLat & { postal?: string }) => boolean {
  const raw =
    process.env.NEXT_PUBLIC_SERVICE_AREA_GEOJSON ||
    process.env.SERVICE_AREA_GEOJSON ||
    "";
  const zip = process.env.NEXT_PUBLIC_SERVICE_ZIP || "33584";
  if (!raw) return (pt) => pt.postal === zip;
  try {
    const geo = JSON.parse(raw);
    const collectPolys = (g: any): number[][][] => {
      if (!g) return [];
      if (g.type === "Polygon") return [g.coordinates];
      if (g.type === "MultiPolygon") return g.coordinates.flat();
      return [];
    };
    let polys: number[][][] = [];
    if (geo.type === "FeatureCollection")
      polys = geo.features.flatMap((f: any) => collectPolys(f.geometry));
    else if (geo.type === "Feature") polys = collectPolys(geo.geometry);
    else polys = collectPolys(geo);
    if (polys.length === 0) return (pt) => pt.postal === zip;
    return (pt) => polys.some((poly) => pointInPoly(pt, poly));
  } catch {
    return (pt) => pt.postal === zip;
  }
}

function signupUrl(p: PlaceResult, offer?: string) {
  const qs = new URLSearchParams({
    zip: p.postal || "",
    lat: String(p.lat),
    lng: String(p.lng),
  });
  if (offer) qs.set("offer", offer);
  return `/signup/plan?${qs.toString()}`;
}

export default function CoverageGate({ offer }: { offer?: string }) {
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const inArea = useMemo(() => {
    if (!selected) return null;
    const predicate = loadPolygon();
    return predicate({
      lng: selected.lng,
      lat: selected.lat,
      postal: selected.postal,
    });
  }, [selected]);

  async function saveInterest() {
    if (!selected) return;
    const res = await fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        postal: selected.postal,
        fullAddress: selected.formattedAddress,
        placeId: selected.placeId,
        lat: selected.lat,
        lng: selected.lng,
      }),
    });
    const data = await res.json();
    if (res.ok) setMessage("Thanks! We’ll notify you when we open your area.");
    else setMessage(data.error || "Something went wrong");
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Check coverage</h2>
      <p className="text-sm text-gray-600">
        We’re starting in 33584. Enter your drop-off address:
      </p>

      {/* Save the selected address for page 2 */}
      <AddressAutocomplete
        onSelect={(p) => {
          setSelected(p);
          try {
            sessionStorage.setItem("hx.addr", JSON.stringify(p));
          } catch {}
        }}
      />

      {selected && inArea === true && (
        <button
          className="btn text-center"
          onClick={() => {
            // ensure it’s saved, then navigate
            try {
              sessionStorage.setItem("hx.addr", JSON.stringify(selected));
            } catch {}
            window.location.href = signupUrl(selected, offer);
          }}
        >
          Continue — we deliver to {selected.formattedAddress}
        </button>
      )}

      {selected && inArea === false && (
        <div className="space-y-2">
          <p className="text-sm">We don’t serve this address yet.</p>
          <input
            className="input"
            placeholder="Email for updates"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              try {
                sessionStorage.setItem("hx.email", e.target.value);
              } catch {}
            }}
          />
          <button className="btn" disabled={!email} onClick={saveInterest}>
            Notify me when available
          </button>
          {message && <p className="text-sm mt-2">{message}</p>}
        </div>
      )}
    </div>
  );
}
