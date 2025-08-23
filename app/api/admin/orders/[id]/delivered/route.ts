import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await prisma.order.update({ where: { id: params.id }, data: { status: "delivered" } });
  return NextResponse.redirect(new URL("/admin/routes/tomorrow", process.env.APP_ORIGIN || "http://localhost:3000"));
}
