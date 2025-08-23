import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(8, 0, 0, 0);
  return x;
}

export async function GET() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekday = tomorrow.getDay();
  if (weekday === 0 || weekday === 6) return NextResponse.json({ created: 0, note: "weekend" });

  const subs = await prisma.subscription.findMany({
    where: { status: "active", deliveryDay: weekday }
  });

  let created = 0;
  for (const s of subs) {
    const exists = await prisma.order.findFirst({
      where: { subscriptionId: s.id, deliveryDate: startOfDay(tomorrow) }
    });
    if (!exists) {
      await prisma.order.create({
        data: {
          subscriptionId: s.id,
          deliveryDate: startOfDay(tomorrow),
          dozens: s.planDozens,
          status: "planned"
        }
      });
      await prisma.subscription.update({
        where: { id: s.id },
        data: { nextDelivery: startOfDay(tomorrow) }
      });
      created++;
    }
  }
  return NextResponse.json({ created, weekday });
}
