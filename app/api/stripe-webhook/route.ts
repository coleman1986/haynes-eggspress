import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function nextWeekday(weekday: number, from = new Date()) {
  const d = new Date(from);
  const diff = (weekday + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(8, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const qty = sub.items.data[0]?.quantity ?? 1;
    the_weekday: {
      // Stripe metadata may not sync on some updates; default to Thu
    }
    const weekdayMeta = (sub.metadata?.weekday ?? "4");
    const weekday = Math.min(5, Math.max(1, parseInt(weekdayMeta, 10) || 4));

    const local = await prisma.subscription.findFirst({ where: { stripeCustomer: customerId } });
    if (local) {
      await prisma.subscription.update({
        where: { id: local.id },
        data: {
          stripeSubId: sub.id,
          planDozens: qty,
          deliveryDay: weekday,
          status: sub.status === "active" ? "active" : sub.status,
          nextDelivery: nextWeekday(weekday),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
