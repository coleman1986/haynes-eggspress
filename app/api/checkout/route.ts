// app/api/checkout/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverInArea } from "@/lib/geo";

export const runtime = "nodejs"; // Ensure Node runtime for Stripe SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function nextWeekday(weekday: number, from = new Date()) {
  const d = new Date(from);
  const diff = (weekday + 7 - d.getDay()) % 7 || 7; // next occurrence, not today
  d.setDate(d.getDate() + diff);
  d.setHours(8, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, planDozens, address, notes, weekday } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    if (
      !address?.postal ||
      typeof address.lat !== "number" ||
      typeof address.lng !== "number"
    ) {
      return NextResponse.json(
        { error: "Valid address with coordinates required" },
        { status: 400 }
      );
    }
    if (![1, 2, 3].includes(planDozens)) {
      return NextResponse.json({ error: "Choose 1–3 dozens." }, { status: 400 });
    }
    if (![1, 2, 3, 4, 5].includes(weekday)) {
      return NextResponse.json(
        { error: "Please choose a weekday (Mon–Fri)." },
        { status: 400 }
      );
    }

    // ✅ Coverage gate (server-side) — loads from SERVICE_AREA_GEOJSON_URL or falls back to ZIP
    const ok = await serverInArea({
      lng: address.lng,
      lat: address.lat,
      postal: address.postal,
    });
    if (!ok) {
      return NextResponse.json(
        { error: "Outside current delivery area." },
        { status: 400 }
      );
    }

    // Pricing
    const price = process.env.STRIPE_PRICE_PER_DOZEN;
    if (!price) {
      return NextResponse.json(
        { error: "Server misconfigured: missing STRIPE_PRICE_PER_DOZEN" },
        { status: 500 }
      );
    }

    // User upsert (store phone if provided)
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, ...(phone ? { phone } : {}) },
      update: phone ? { phone } : {},
    });

    // Store the selected delivery address + notes
    const addr = await prisma.address.create({
      data: {
        userId: user.id,
        line1: address.line1 || address.formattedAddress || "",
        city: address.city || "",
        state: address.state || "",
        postal: address.postal,
        lat: address.lat,
        lng: address.lng,
        notes,
      },
    });

    // Reuse Stripe customer for this email if one exists
    let customerId: string;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data[0]) {
      customerId = existing.data[0].id;
    } else {
      const created = await stripe.customers.create({
        email,
        ...(phone ? { phone } : {}),
      });
      customerId = created.id;
    }

    const origin =
      process.env.APP_ORIGIN || req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price, quantity: planDozens }],
      subscription_data: {
        metadata: {
          weekday: String(weekday),
          planDozens: String(planDozens),
        },
      },
      success_url: `${origin}/checkout?status=success`,
      cancel_url: `${origin}/signup/plan?status=cancel`,
      allow_promotion_codes: true,
      phone_number_collection: { enabled: true },
      metadata: {
        email,
        phone: phone || "",
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        addressId: addr.id,
        planDozens,
        stripeCustomer: customerId,
        stripeSubId: "PENDING",
        status: "pending",
        deliveryDay: weekday,
        nextDelivery: nextWeekday(weekday),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
