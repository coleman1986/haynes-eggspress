// app/api/admin/orders/[id]/delivered/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/sign";

export const runtime = "nodejs";

// Reuse Prisma in dev
declare global { var __prisma: PrismaClient | undefined }
const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

// ✅ Signature that matches your Next version (params is a Promise)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin auth guard
  const store = await cookies();
  const token = store.get("hx_admin")?.value;
  const payload = token ? verifyToken(token) : null;
  if (payload?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve id from promised params
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  // Optional JSON body: { status?: string; driverNotes?: string }
  let body: any = null;
  try { body = await req.json(); } catch {}
  const newStatus: string = body?.status ?? "delivered";
  const driverNotes: string | undefined = body?.driverNotes;

  // Ensure order exists
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
  }

  // Update order (status + optional driver notes)
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      ...(typeof driverNotes === "string" && driverNotes.trim()
        ? { driverNotes: driverNotes.trim() }
        : {}),
      // deliveredAt: new Date(), // add this if you include it in the schema later
    },
  });

  return NextResponse.json({ ok: true, order: updated });
}
