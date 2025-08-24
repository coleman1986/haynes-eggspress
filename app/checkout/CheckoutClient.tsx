// app/checkout/CheckoutClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import AddToHomePrompt from "@/components/AddToHomePrompt";
import ShareReferral from "@/components/ShareReferral";

export default function CheckoutClient() {
  const params = useSearchParams();
  const status = params.get("status");

  if (status === "success") {
    return (
      <main className="space-y-4">
        <div className="card">
          <h1 className="text-2xl font-semibold">You’re in! 🎉</h1>
          <p className="text-gray-700 mt-2">
            Your weekly delivery is set. We’ll email details shortly.
          </p>
          <div className="mt-4 space-y-3">
            <ShareReferral />
            <AddToHomePrompt />
          </div>
        </div>
      </main>
    );
  }

  if (status === "cancel") {
    return (
      <main className="space-y-4">
        <div className="card">
          <h1 className="text-2xl font-semibold">No worries</h1>
          <p className="text-gray-700 mt-2">
            You can pick this up anytime. Your spot is saved.
          </p>
          <a className="btn mt-4" href="/signup/plan">
            Return to signup
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <p className="text-gray-700 mt-2">Finishing up…</p>
      </div>
    </main>
  );
}
