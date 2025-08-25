"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ManageClient() {
  const params = useSearchParams();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If a token is present, exchange it for a Stripe portal URL and redirect
  useEffect(() => {
    async function go() {
      if (!token) return;
      setBusy(true);
      setErr(null);
      try {
        const res = await fetch("/api/portal/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          setErr(data.error || "Could not open portal.");
        }
      } catch (e: any) {
        setErr(String(e));
      } finally {
        setBusy(false);
      }
    }
    go();
  }, [token]);

  async function send() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/portal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        if (data.dev_link) setDevLink(data.dev_link);
      } else {
        setErr(data.error || "Failed to send email.");
      }
    } catch (e: any) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (token) {
    return (
      <div className="card">
        <p className="text-sm">
          {busy ? "Opening your portal…" : err ? err : "Redirecting…"}
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      {sent ? (
        <>
          <p>
            We sent a sign-in link to <b>{email}</b>. Check your inbox.
          </p>
          {devLink && (
            <p className="text-xs break-words">
              Dev link:{" "}
              <a className="text-blue-600 underline" href={devLink}>
                {devLink}
              </a>
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
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn w-full" onClick={send} disabled={!email || busy}>
            {busy ? "Sending…" : "Email me a link"}
          </button>
        </>
      )}
    </div>
  );
}
