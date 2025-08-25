// app/api/portal/open/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/sign";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const payload = verifyToken(token);
    const email: string | undefined = (payload as any)?.email;
    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Prefer your DB for the Stripe customer id
    const user = await prisma.user.findUnique({ where: { email } });
    let customerId: string | null = null;

    if (user) {
      const latestSub = await prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { stripeCustomer: true },
      });
      if (latestSub?.stripeCustomer) {
        customerId = latestSub.stripeCustomer;
      }
    }

    // Fallback: ask Stripe by email
    if (!customerId) {
      const list = await stripe.customers.list({ email, limit: 1 });
      customerId = list.data[0]?.id || null;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer found for this email." },
        { status: 404 }
      );
    }

    const origin =
      process.env.APP_ORIGIN ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    // ✅ Include the token on return so /manage can auto-open the portal again if needed
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/manage?token=${encodeURIComponent(token)}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("portal/open error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to open portal" },
      { status: 500 }
    );
  }
}
