import { Suspense } from "react";
import PlanClient from "./PlanClient";

export default function PlanPage() {
  return (
    <main className="mx-auto max-w-lg p-2">
      <h1 className="text-2xl font-semibold mb-1">Fresh eggs, weekly</h1>
      <p className="text-sm text-gray-500 mb-4">
        $7 per dozen — delivery included
      </p>

      {/* Wrap the client component (which uses useSearchParams) in Suspense */}
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <PlanClient />
      </Suspense>
    </main>
  );
}