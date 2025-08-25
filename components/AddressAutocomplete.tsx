/// <reference types="google.maps" />
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export type PlaceResult = {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;
  postal?: string;
  city?: string;
  state?: string;
  line1?: string;
};

function extractComponents(place: google.maps.places.PlaceResult): PlaceResult | null {
  if (!place || !place.address_components || !place.geometry?.location) return null;
  const comp = Object.fromEntries(place.address_components.map((c) => [c.types[0], c]));
  const get = (type: string) => comp[type]?.long_name || comp[type]?.short_name;
  const line1 = [get("street_number"), get("route")].filter(Boolean).join(" ");
  const city = get("locality") || get("sublocality") || get("administrative_area_level_2");
  const state = get("administrative_area_level_1");
  const postal = get("postal_code");
  const loc = place.geometry.location;
  return {
    formattedAddress: place.formatted_address || line1,
    placeId: place.place_id || "",
    lat: typeof loc.lat === "function" ? loc.lat() : (loc as any).lat,
    lng: typeof loc.lng === "function" ? loc.lng() : (loc as any).lng,
    postal,
    city,
    state,
    line1,
  };
}

export default function AddressAutocomplete({
  onSelect,
  initialValue,
}: {
  onSelect: (p: PlaceResult) => void;
  initialValue?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  // Seed input once with initial address (if provided)
  useEffect(() => {
    if (initialValue && inputRef.current && !inputRef.current.value) {
      inputRef.current.value = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    if (!ready || !inputRef.current || !(window as any).google?.maps?.places) return;
    const ac = new google.maps.places.Autocomplete(inputRef.current!, {
      fields: ["address_components", "formatted_address", "geometry", "place_id"],
      types: ["address"],
      componentRestrictions: { country: "us" },
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const parsed = extractComponents(place);
      if (parsed) onSelect(parsed);
    });
  }, [ready, onSelect]);

  return (
    <div className="space-y-2">
      {!apiKey && <p className="text-sm text-red-600">Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <input
        ref={inputRef}
        className="input"
        placeholder="Start typing your address…"
        name="street-address"
        autoComplete="street-address"
      />
    </div>
  );
}
