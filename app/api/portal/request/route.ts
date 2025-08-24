// app/api/portal/request/route.ts
import { NextResponse } from "next/server";
import { signToken } from "@/lib/sign";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const origin = process.env.APP_ORIGIN;
  if (!origin) {
    return NextResponse.json({ error: "Server misconfigured: missing APP_ORIGIN" }, { status: 500 });
  }

  // 15-minute magic link
  const token = signToken({ email }, 15 * 60);
  const url = `${origin}/api/portal/session?token=${encodeURIComponent(token)}`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Fallback for dev: no email provider configured, return the link so UI can show it.
    return NextResponse.json({
      ok: true,
      dev_link: url,
      note: "RESEND_API_KEY not set; returning link instead of sending email.",
    });
  }

  try {
    const resend = new Resend(key);
    const from = process.env.EMAIL_FROM || "Haynes Eggspress <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: email,
      subject: "Manage your weekly egg delivery",
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
          <tr><td style="padding:16px;">
            <h2 style="margin:0 0 12px 0;color:#065f46;">Haynes Eggspress</h2>
            <p style="margin:0 0 12px 0;">Tap the button below to manage your subscription.</p>
            <p style="margin:0 0 16px 0;">
              <a href="${url}"
                 style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;">
                Open Customer Portal
              </a>
            </p>
            <p style="font-size:12px;color:#6b7280;margin:0;">This link expires in 15 minutes. If you didn’t request it, you can ignore this email.</p>
          </td></tr>
        </table>
      `,
      text: `Manage your subscription: ${url}\n\nThis link expires in 15 minutes.`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Resend send error:", err);
    // Still return the link so you can complete the flow if email fails
    return NextResponse.json({ error: "Failed to send email", dev_link: url }, { status: 500 });
  }
}
