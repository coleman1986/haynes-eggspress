// app/about/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AboutPage() {
  return (
    <main className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-bold">Our family & the flock</h1>
        <p className="text-gray-700 mt-2">
          We’re the Haynes family in <b>Seffner, Florida</b> — parents + three
          sons (12, 9, and 7). The boys feed, water, and collect eggs each day,
          and help pack weekly deliveries.
        </p>
        <p className="text-gray-700 mt-2">
          Our hens live <b>cage-free</b> on our property and are raised <b>without antibiotics</b>.
          Eggs are collected locally and delivered the same week — that’s why they taste so fresh.
        </p>
        <p className="text-gray-700 mt-2">
          This small business is the kids’ idea and their hands-on project.
          Thank you for supporting local families and teaching entrepreneurs in
          the making!
        </p>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">What “quality & local” means to us</h2>
        <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
          <li>Raised without antibiotics.</li>
          <li>Cage-free hens on our family property in Seffner.</li>
          <li>Collected nearby and delivered the same week.</li>
          <li>Flat price: <b>$7/dozen</b>, delivery included.</li>
        </ul>
        <a href="/signup/plan" className="btn mt-4">Start weekly delivery</a>
      </section>
    </main>
  );
}
