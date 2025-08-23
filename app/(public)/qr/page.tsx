import { Suspense } from "react";
import QrClient from "./QrClient";

export default function QRPage() {
  return (
    <main className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-semibold mb-2">Start weekly egg delivery</h1>
      <p className="text-sm text-gray-600 mb-4">
        Scan & start your subscription in under 5 minutes.
      </p>

      {/* useSearchParams lives in a Client Component, wrapped in Suspense */}
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <QrClient />
      </Suspense>
    </main>
  );
}