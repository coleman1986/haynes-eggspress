// app/(public)/qr/page.tsx
import { Suspense } from "react";
import QrClient from "./QrClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function QRPage() {
  return (
    <main className="mx-auto max-w-lg p-4">
      {/* Hero */}
      <section className="card mb-4 text-center">
        <h1 className="text-2xl font-semibold">Fresh, local eggs—on your porch every week.</h1>
        <p className="text-gray-600 mt-1">Raised without antibiotics. Start in under 5 minutes.</p>
      </section>

      {/* Coverage / QR flow */}
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <QrClient />
      </Suspense>
    </main>
  );
}
