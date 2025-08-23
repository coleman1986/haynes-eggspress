import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function TomorrowRoute() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const start = startOfDay(tomorrow);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: { deliveryDate: { gte: start, lt: end } },
    include: { subscription: { include: { address: true, user: true } } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tomorrow’s Deliveries</h1>
      <p className="text-sm text-gray-600">{format(tomorrow, "EEE, MMM d")}</p>
      <div className="space-y-3">
        {orders.length === 0 && <div className="card">No orders scheduled for tomorrow.</div>}
        {orders.map(o => (
          <div key={o.id} className="card">
            <div className="font-medium">{o.subscription.user.email} — {o.dozens} dozen(s)</div>
            <div className="text-sm">
              {o.subscription.address.line1}, {o.subscription.address.city}, {o.subscription.address.state} {o.subscription.address.postal}
            </div>
            <div className="text-xs text-gray-600">Notes: {o.subscription.address.notes || "—"}</div>
            <form action={`/api/admin/orders/${o.id}/delivered`} method="post">
              <button className="btn mt-2" formAction={`/api/admin/orders/${o.id}/delivered`}>Mark delivered</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
