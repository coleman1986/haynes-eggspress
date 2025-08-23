"use client";

import { useSearchParams } from "next/navigation";
import CoverageGate from "@/components/CoverageGate";

export default function QRPage() {
  const params = useSearchParams();
  const offer = params.get("offer") || undefined;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome to Haynes Eggspress 🥚</h1>
      <p>Fresh, organic eggs—porch delivered every week. Start in under 5 minutes.</p>
      <CoverageGate offer={offer} />
    </div>
  );
}
