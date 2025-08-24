"use client";
export default function ShareReferral() {
  const link = typeof window !== "undefined"
    ? `${location.origin}/qr?offer=FRIEND-DOZEN`
    : "https://hayneseggspress.com/qr?offer=FRIEND-DOZEN";

  async function share() {
    const text = "Give a dozen on us! Fresh, organic, local eggs — $7/dozen weekly.";
    if (navigator.share) {
      try { await navigator.share({ title: "Haynes Eggspress", text, url: link }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(link);
      alert("Referral link copied!");
    }
  }

  return (
    <button className="btn w-full" onClick={share}>
      Share a free dozen
    </button>
  );
}
