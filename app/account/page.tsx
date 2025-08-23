export default function AccountPage() {
  return (
    <main className="mx-auto max-w-md p-4 space-y-3">
      <h1 className="text-xl font-semibold">Account</h1>
      <p>Use the portal to change plan, update card, pause, or cancel.</p>
      <a className="btn w-full" href="/manage">Get a sign-in link</a>
    </main>
  );
}
