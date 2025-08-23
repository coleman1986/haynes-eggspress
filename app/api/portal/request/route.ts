import { NextResponse } from "next/server";
import { signToken } from "@/lib/sign";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const token = signToken({ email }, 15 * 60);
  const url = `${process.env.APP_ORIGIN}/api/portal/session?token=${encodeURIComponent(token)}`;

  const key = process.env.RESEND_API_KEY; // optional; if missing we just log the link
  if (!key) {
    console.log("MAGIC LINK (dev):", url);
    return NextResponse.json({ ok: true, dev_link: url });
  }

  // Send with Resend (or swap in your mailer)
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  await resend.emails.send({
    from: "Haynes Eggspress <noreply@hayneseggspress.com>",
    to: email,
    subject: "Manage your weekly egg delivery",
    html: `<p>Tap to manage your subscription:</p><p><a href="${url}">${url}</a></p><p>This link expires in 15 minutes.</p>`
  });

  return NextResponse.json({ ok: true });
}
