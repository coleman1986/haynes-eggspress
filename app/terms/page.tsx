export default function TermsPage() {
  return (
    <main className="space-y-4">
      <section className="card">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-2">
          <li>Weekly subscription at $7 per dozen, delivery included.</li>
          <li>Pause/skip/cancel anytime via the Manage link or by emailing us.</li>
          <li>We deliver Monday–Friday to eligible addresses in our coverage area.</li>
          <li>If we can’t deliver (weather, flock issues), we’ll notify and credit you.</li>
        </ul>
        <p className="text-gray-700 mt-3">
          Questions? <a className="text-emerald-700 underline" href="mailto:contact@hayneseggspress.com">contact@hayneseggspress.com</a>
        </p>
      </section>
    </main>
  );
}
