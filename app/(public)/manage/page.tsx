"use client";
import { useState } from "react";

export default function ManagePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function send() {
    const res = await fetch("/api/portal/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setSent(true);
    if (data.dev_link) setDevLink(data.dev_link);
  }

  return (
    <main className="mx-auto max-w-md p-4 space-y-3">
      <h1 className="text-xl font-semibold">Manage your delivery</h1>
      {sent ? (
        <>
          <p>We sent a sign-in link to <b>{email}</b>. Check your inbox.</p>
          {devLink && (
            <p className="text-xs break-words">
              Dev link (no email set): <a className="text-blue-600 underline" href={devLink}>{devLink}</a>
            </p>
          )}
        </>
      ) : (
        <>
          <input
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn w-full" onClick={send} disabled={!email}>
            Email me a link
          </button>
        </>
      )}
    </main>
  );
}
