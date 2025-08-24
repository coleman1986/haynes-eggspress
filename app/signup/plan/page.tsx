"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AddressAutocomplete, { PlaceResult } from "@/components/AddressAutocomplete";

export default function Plan() {
  const params = useSearchParams();
  const latParam = params.get("lat");
  const lngParam = params.get("lng");
  const zipParam = params.get("zip") || "33584";

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");           // 👈 NEW
  const [plan, setPlan] = useState(2);
  const [weekday, setWeekday] = useState(1);
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [initialAddressText, setInitialAddressText] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  // Pull carried values from page 1 and saved email/phone
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
      const savedPhone = sessionStorage.getItem("hx.phone");        // 👈 NEW
      if (savedPhone) setPhone(savedPhone);
    } catch {}
  }, []);

  // Keep email/phone between visits
  useEffect(() => {
    try { if (email) sessionStorage.setItem("hx.email", email); } catch {}
  }, [email]);
  useEffect(() => {
    try { if (phone) sessionStorage.setItem("hx.phone", phone); } catch {}  // 👈 NEW
  }, [phone]);

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

  // Simple normalization to E.164-ish (+1 for US 10-digit)
  function normalizePhone(v: string) {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return `+${digits}`;
  }

  async function start() {
    if ((!place) && !(latParam && lngParam)) {
      alert("Please choose your address.");
      return;
    }
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    const phoneE164 = phone ? normalizePhone(phone) : "";          // 👈 NEW

    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone: phoneE164,                                          // 👈 NEW
        planDozens: plan,
        address,
        notes,
        weekday,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Something went wrong");
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-lg p-2">
      <h1 className="text-2xl font-semibold mb-1">Fresh eggs, weekly</h1>
      <p className="text-sm text-gray-500 mb-4">$7 per dozen — delivery included</p>

      {/* Email */}
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

      {/* Phone (NEW) */}
      <label className="block mt-3 font-medium">Phone (for delivery updates)</label>
      <input
        className="input"
        type="tel"
        name="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="(555) 555-5555"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Address */}
      <label className="block mt-3 font-medium">Drop-off address</label>
      <AddressAutocomplete onSelect={setPlace} initialValue={initialAddressText} />
      {place?.formattedAddress && <p className="text-sm mt-1">Selected: {place.formattedAddress}</p>}

      {/* Plan */}
      <label className="block mt-4 font-medium">Dozens per week</label>
      <select className="input" value={plan} onChange={(e) => setPlan(parseInt(e.target.value))}>
        <option value={1}>1 dozen ($7/wk)</option>
        <option value={2}>2 dozen ($14/wk)</option>
        <option value={3}>3 dozen ($21/wk)</option>
      </select>

      {/* Day */}
      <label className="block mt-4 font-medium">Choose your delivery day</label>
      <select className="input" value={weekday} onChange={(e) => setWeekday(parseInt(e.target.value))}>
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

      {/* Sticky mobile CTA (optional) */}
      <div className="h-20 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur border-t p-3 md:hidden pb-[env(safe-area-inset-bottom)]">
        <button className="btn w-full" onClick={start} disabled={loading}>
          {loading ? "Loading…" : `Start Weekly Delivery — $${plan * 7}/wk`}
        </button>
      </div>
    </main>
  );
}
