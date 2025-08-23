import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadPolygonFromEnv } from "@/lib/geo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function nextWeekday(weekday: number, from = new Date()) {
  const d = new Date(from);
  const diff = (weekday + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(8, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const { email, planDozens, address, notes, weekday } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!address?.postal || address?.lat === undefined || address?.lng === undefined) {
    return NextResponse.json({ error: "Valid address with coordinates required" }, { status: 400 });
  }
  if (![1,2,3].includes(planDozens)) {
    return NextResponse.json({ error: "Choose 1–3 dozens." }, { status: 400 });
  }
  if (![1,2,3,4,5].includes(weekday)) {
    return NextResponse.json({ error: "Please choose a weekday (Mon–Fri)." }, { status: 400 });
  }

  const inArea = loadPolygonFromEnv()({ lng: address.lng, lat: address.lat, postal: address.postal });
  if (!inArea) {
    return NextResponse.json({ error: "Outside current delivery area." }, { status: 400 });
  }

  const price = process.env.STRIPE_PRICE_PER_DOZEN;
  if (!price) return NextResponse.json({ error: "Server misconfigured: missing STRIPE_PRICE_PER_DOZEN" }, { status: 500 });

  const user = await prisma.user.upsert({ where: { email }, create: { email }, update: {} });
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
  const customer = await stripe.customers.create({ email });

  const origin = process.env.APP_ORIGIN || req.headers.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price, quantity: planDozens }],
    subscription_data: {
      metadata: { weekday: String(weekday), planDozens: String(planDozens) }
    },
    success_url: `${origin}/checkout?status=success`,
    cancel_url: `${origin}/signup/plan?status=cancel`,
    payment_method_types: ["card", "us_bank_account"],
    allow_promotion_codes: true,
    phone_number_collection: { enabled: true },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      addressId: addr.id,
      planDozens,
      stripeCustomer: customer.id,
      stripeSubId: "PENDING",
      status: "pending",
      deliveryDay: weekday,
      nextDelivery: nextWeekday(weekday)
    },
  });

  return NextResponse.json({ url: session.url });
}
