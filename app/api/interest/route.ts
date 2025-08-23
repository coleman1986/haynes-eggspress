import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, postal, fullAddress, placeId, lat, lng, note } = await req.json();
  if (!email || !postal) return NextResponse.json({ error: "email and postal required" }, { status: 400 });
  await prisma.interest.create({ data: { email, postal, fullAddress, placeId, lat, lng, note } });
  return NextResponse.json({ ok: true });
}
