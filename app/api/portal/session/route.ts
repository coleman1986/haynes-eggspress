import { NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyToken } from "@/lib/sign";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/manage?e=missing", process.env.APP_ORIGIN));
  const payload = verifyToken(token);
  if (!payload?.email) return NextResponse.redirect(new URL("/manage?e=invalid", process.env.APP_ORIGIN));
  const email = String(payload.email);

  // Find Stripe customer by email
  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer = customers.data[0];
  if (!customer) return NextResponse.redirect(new URL("/manage?e=notfound", process.env.APP_ORIGIN));

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${process.env.APP_ORIGIN}/account`,
  });
  return NextResponse.redirect(session.url);
}
