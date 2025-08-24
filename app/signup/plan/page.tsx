// app/signup/plan/page.tsx
import { Suspense } from "react";
import PlanClient from "./PlanClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <PlanClient />
    </Suspense>
  );
}
