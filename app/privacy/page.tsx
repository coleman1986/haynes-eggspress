export default function PrivacyPage() {
  return (
    <main className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-gray-700 mt-2">
          We only collect what we need to deliver eggs: your name, email, phone (optional),
          and delivery address. We never sell your data. You can request deletion anytime at
          <a className="text-emerald-700 underline ml-1" href="mailto:contact@hayneseggspress.com">
            contact@hayneseggspress.com
          </a>.
        </p>
        <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-1">
          <li>Payments are processed by Stripe; we don’t store card numbers.</li>
          <li>We use email to send receipts and delivery updates.</li>
          <li>You can unsubscribe from non-essential emails anytime.</li>
        </ul>
      </section>
    </main>
  );
}
