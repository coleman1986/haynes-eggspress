// app/api/portal/request/route.ts
import { NextResponse } from "next/server";
import { signToken } from "@/lib/sign";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const token = signToken({ email }, 15 * 60); // 15 minutes
  const url = `${process.env.APP_ORIGIN}/api/portal/session?token=${encodeURIComponent(token)}`;

  // No email provider yet—return the link so the UI can show it.
  return NextResponse.json({ ok: true, dev_link: url });
}
