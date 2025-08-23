"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      window.location.href = "/admin/routes/tomorrow"; // or /admin
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="input"
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button className="btn w-full" disabled={!password || loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
