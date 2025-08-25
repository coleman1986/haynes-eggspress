// app/api/portal/request/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { signToken } from "@/lib/sign";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM || "Haynes Eggspress <onboarding@resend.dev>";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const base =
      process.env.APP_ORIGIN ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";
    const origin = base.replace(/\/+$/, ""); // remove trailing slash

    // short-lived magic link token
    const token = signToken({ email }, "15m");
    const link = `${origin}/manage?token=${encodeURIComponent(token)}`;

    const { error } = await resend.emails.send({
      from: FROM, // must be a valid email format; domain should be verified in Resend
      to: email,
      subject: "Your Haynes Eggspress manage link",
      text: `Open your secure link: ${link}`,
      html: `<p>Here’s your secure link to manage your delivery:</p><p><a href="${link}">${link}</a></p>`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Return the link in non-production for convenience
    const dev_link = process.env.NODE_ENV !== "production" ? link : undefined;
    return NextResponse.json({ ok: true, dev_link });
  } catch (err: any) {
    console.error("portal/request error:", err);
    return NextResponse.json({ error: err?.message || "Failed to send link" }, { status: 500 });
  }
}
