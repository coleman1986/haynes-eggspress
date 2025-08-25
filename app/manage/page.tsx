import { Suspense } from "react";
import ManageClient from "./ManageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ManagePage() {
  return (
    <main className="mx-auto max-w-md p-4 space-y-3">
      <h1 className="text-xl font-semibold">Manage your delivery</h1>
      <p className="text-sm text-gray-600">
        We’ll email you a secure link—or open automatically if you followed one.
      </p>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <ManageClient />
      </Suspense>
    </main>
  );
}
