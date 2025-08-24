// app/page.tsx
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="card text-center">
        <div className="flex justify-center">
          <Image src="/logo-256.png" alt="Haynes Eggspress" width={96} height={96} />
        </div>
        <h1 className="text-3xl font-bold mt-2">Fresh, local eggs—on your porch every week.</h1>
        <p className="text-gray-600 mt-2">Raised without antibiotics. Start in under 5 minutes. $7 per dozen, delivery included.</p>
        <div className="mt-4 flex gap-3 justify-center">
          <a className="btn" href="/signup/plan">Start Weekly Delivery</a>
          <a className="btn" href="/qr">Scan &amp; Start</a>
        </div>
      </section>

      {/* Value props */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold">Antibiotic-free</h3>
          <p className="text-sm text-gray-600 mt-1">Our hens are raised without antibiotics.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold">Cage-free at home</h3>
          <p className="text-sm text-gray-600 mt-1">A backyard flock here in Seffner.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold">Simple</h3>
          <p className="text-sm text-gray-600 mt-1">Flat $7 per dozen. Pause, skip, or cancel anytime.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="card">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="mt-3 space-y-2 text-gray-700 list-decimal ml-5">
          <li>Enter your address and choose a weekday (Mon–Fri).</li>
          <li>Select how many dozens you want each week.</li>
          <li>We porch-deliver. You enjoy fresh local eggs.</li>
        </ol>
        <a className="btn mt-4" href="/signup/plan">Get started — it takes 5 minutes</a>
      </section>

      {/* FAQ */}
      <section className="card">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-3 space-y-3 text-gray-700">
          <div>
            <p className="font-medium">Where do you deliver?</p>
            <p>We’re launching around 33584 to start. Use the address box when you start to check coverage.</p>
          </div>
          <div>
            <p className="font-medium">How are the hens raised?</p>
            <p>Cage-free on our family property, raised without antibiotics.</p>
          </div>
          <div>
            <p className="font-medium">What if I’m not home?</p>
            <p>Leave drop-off notes (cooler, gate code, pets) on the signup page—we’ll follow them.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
