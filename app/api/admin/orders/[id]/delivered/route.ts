// app/api/admin/orders/[id]/delivered/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// ✅ Prisma must run on Node, not Edge
export const runtime = "nodejs";

// ✅ Reuse Prisma in dev without exporting it
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}
const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

// POST /api/admin/orders/:id/delivered
export async function POST(
  req: Request,
  // Some Next builds type params as a Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

    // Optional JSON body: { status?: string; driverNotes?: string }
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      /* no body is fine */
    }
    const newStatus: string = body?.status ?? "delivered";
    const driverNotes: string | undefined = body?.driverNotes;

    // Ensure order exists
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });

    // Update using your schema: status:String (and optional notes)
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...(typeof driverNotes === "string" ? { driverNotes } : {}),
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err: any) {
    console.error("Deliver order error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to mark delivered" },
      { status: 500 }
    );
  }
}
