import { NextResponse } from "next/server";

export async function GET() {
  // TODO: integrate with email/SMS provider
  return NextResponse.json({ sent: 0, note: "wire up email/SMS provider here" });
}
