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

// Support both shapes: { params: { id } } OR { params: Promise<{ id }> }
type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  // ✅ Admin auth guard (protects API if called directly)
  const store = await cookies(); // async on newer Next
  const token = store.get("hx_admin")?.value;
  const payload = token ? verifyToken(token) : null;
  if (payload?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Get order id from ctx (works with both Next param shapes)
  // @ts-ignore – narrow at runtime
  const raw = (ctx as any).params;
  const { id } = raw?.then ? await raw : raw;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  // Optional JSON body: { status?: string; driverNotes?: string }
  let body: any = null;
  try { body = await req.json(); } catch { /* body optional */ }
  const newStatus: string = body?.status ?? "delivered";
  const driverNotes: string | undefined = body?.driverNotes;

  // Ensure order exists
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
  }

  // Update using your schema: status:String (+ optional driverNotes)
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      ...(typeof driverNotes === "string" && driverNotes.trim()
        ? { driverNotes: driverNotes.trim() }
        : {}),
      // If you later add deliveredAt: DateTime, set it here:
      // deliveredAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, order: updated });
}
