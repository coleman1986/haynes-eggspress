import { NextResponse } from "next/server";
import { signToken } from "@/lib/sign";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 });
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  if (password !== expected) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  const token = signToken({ role: "admin" }, 60 * 60 * 24 * 7); // 7 days
  const res = NextResponse.json({ ok: true });
  res.cookies.set("hx_admin", token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60*60*24*7
  });
  return res;
}
