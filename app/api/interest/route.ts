// app/api/interest/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, postal, fullAddress, placeId, lat, lng } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // prevent obvious duplicates (same email + place/zip)
    const existing = await prisma.interest.findFirst({
      where: {
        email,
        ...(placeId ? { placeId } : {}),
        ...(postal ? { postal } : {}),
      } as any,
    });

    if (!existing) {
      await prisma.interest.create({
        // NOTE: If your Interest fields are named differently, rename below to match your schema.
        data: {
          email,
          ...(postal ? { postal } : {}),
          ...(fullAddress ? { fullAddress } : {}),
          ...(placeId ? { placeId } : {}),
          ...(typeof lat === "number" ? { lat } : {}),
          ...(typeof lng === "number" ? { lng } : {}),
        } as any,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("interest route error", err);
    return NextResponse.json({ error: "Failed to save interest" }, { status: 500 });
  }
}
