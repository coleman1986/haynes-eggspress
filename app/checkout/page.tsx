// app/checkout/page.tsx
import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
