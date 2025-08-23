"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AddressAutocomplete, { PlaceResult } from "@/components/AddressAutocomplete";

export default function PlanClient() {
  const params = useSearchParams();
  const latParam = params.get("lat");
  const lngParam = params.get("lng");
  const zipParam = params.get("zip") || "33584";

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(2);           // dozens
  const [weekday, setWeekday] = useState(1);     // 1=Mon … 5=Fri
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [initialAddressText, setInitialAddressText] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  // Pull carried values from page 1 (CoverageGate) and saved email
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("hx.addr");
      if (raw) {
        const p = JSON.parse(raw);
        setPlace(p);
        setInitialAddressText(p.formattedAddress || p.line1 || "");
      }
      const savedEmail = sessionStorage.getItem("hx.email");
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }, []);

  // Keep email for convenience between visits
  useEffect(() => {
    try {
      if (email) sessionStorage.setItem("hx.email", email);
    } catch {}
  }, [email]);

  const address = useMemo(() => {
    if (!place)
      return {
        line1: "",
        city: "",
        state: "FL",
        postal: zipParam,
        lat: latParam ? Number(latParam) : undefined,
        lng: lngParam ? Number(lngParam) : undefined,
      };
    return {
        line1: place.line1 || "",
        city: place.city || "",
        state: place.state || "FL",
        postal: place.postal || zipParam,
        lat: place.lat,
        lng: place.lng,
        formattedAddress: place.formattedAddress,
        placeId: place.placeId,
      };
  }, [place, zipParam, latParam, lngParam]);

  async function start() {
    if ((!place) && !(latParam && lngParam)) {
      alert("Please choose your address.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, planDozens: plan, address, notes, weekday }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Something went wrong");
    setLoading(false);
  }

  return (
    <>
      {/* Email with proper autofill */}
      <input
        className="input"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="block mt-3 font-medium">Drop-off address</label>
      <AddressAutocomplete onSelect={setPlace} initialValue={initialAddressText} />
      {place?.formattedAddress && (
        <p className="text-sm mt-1">Selected: {place.formattedAddress}</p>
      )}

      <label className="block mt-4 font-medium">Dozens per week</label>
      <select
        className="input"
        value={plan}
        onChange={(e) => setPlan(parseInt(e.target.value))}
      >
        <option value={1}>1 dozen ($7/wk)</option>
        <option value={2}>2 dozen ($14/wk)</option>
        <option value={3}>3 dozen ($21/wk)</option>
      </select>

      <label className="block mt-4 font-medium">Choose your delivery day</label>
      <select
        className="input"
        value={weekday}
        onChange={(e) => setWeekday(parseInt(e.target.value))}
      >
        <option value={1}>Monday</option>
        <option value={2}>Tuesday</option>
        <option value={3}>Wednesday</option>
        <option value={4}>Thursday</option>
        <option value={5}>Friday</option>
      </select>

      <textarea
        className="input mt-4"
        placeholder="Drop-off notes (cooler, gate code, dogs, etc.)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button className="btn mt-4 w-full" onClick={start} disabled={loading}>
        {loading ? "Loading…" : "Start Weekly Delivery"}
      </button>
    </>
  );
}
