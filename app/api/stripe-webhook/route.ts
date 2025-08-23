// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Webhooks must run on Node (NOT Edge)
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    // 1) Read the raw body for signature verification
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !secret) {
      console.error("Missing stripe-signature header or STRIPE_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Misconfigured webhook" }, { status: 400 });
    }

    // 2) Verify & construct the event
    const event = stripe.webhooks.constructEvent(payload, sig, secret);

    // 3) Handle events (log for now)
    switch (event.type) {
      case "checkout.session.completed":
        console.log("✅ checkout.session.completed", (event.data.object as any).id);
        break;
      case "customer.subscription.created":
        console.log("✅ subscription.created", (event.data.object as any).id);
        break;
      case "customer.subscription.updated":
        console.log("✅ subscription.updated", (event.data.object as any).id);
        break;
      default:
        console.log("ℹ️  Unhandled event", event.type);
        break;
    }

    // 4) Acknowledge
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}