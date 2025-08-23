"use client";

import { useSearchParams } from "next/navigation";
import CoverageGate from "@/components/CoverageGate";

export default function QrClient() {
  const params = useSearchParams();
  const offer = params.get("offer") || undefined;

  return <CoverageGate offer={offer} />;
}
