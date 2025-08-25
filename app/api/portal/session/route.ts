// app/api/portal/session/route.ts
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/sign";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function originFromEnv() {
  const base =
    process.env.APP_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return base.replace(/\/+$/, ""); // strip trailing slash
}

export async function GET(req: Request) {
  const origin = originFromEnv();
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return Response.redirect(`${origin}/manage?e=missing`, 302);

    const payload = verifyToken(token);
    const email: string | undefined = (payload as any)?.email;
    if (!email) return Response.redirect(`${origin}/manage?e=invalid`, 302);

    // Prefer DB for Stripe customer id
    let customerId: string | null = null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const latestSub = await prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { stripeCustomer: true },
      });
      customerId = latestSub?.stripeCustomer || null;
    }
    // Fallback: look up by email in Stripe
    if (!customerId) {
      const list = await stripe.customers.list({ email, limit: 1 });
      customerId = list.data[0]?.id || null;
    }
    if (!customerId) return Response.redirect(`${origin}/manage?e=notfound`, 302);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/manage?token=${encodeURIComponent(token)}`,
    });
    return Response.redirect(session.url, 302);
  } catch (err) {
    console.error("portal/session error:", err);
    return Response.redirect(`${origin}/manage?e=error`, 302);
  }
}
