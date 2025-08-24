import "./globals.css";
import Image from "next/image";
import React from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Haynes Eggspress",
  description: "Fresh organic eggs, porch-delivered weekly in 33584.",
  themeColor: "#10b981",
  icons: {
    icon: "/icon-32.png",
    apple: "/icon-180.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Haynes Eggspress",
    description: "Fresh local eggs delivered weekly — $7/dozen, delivery included.",
    url: "https://hayneseggspress.com",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
  <header className="bg-white border-b">
    <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
      <a href="/" className="flex items-center gap-3">
        <img src="/logo-transparent.png" alt="Haynes Eggspress" width={40} height={40} />
        <span className="font-semibold tracking-wide">Haynes Eggspress</span>
      </a>
      <nav className="ml-auto text-sm flex items-center gap-4">
        <a href="/signup/plan" className="hover:underline">Start</a>
        <a href="/manage" className="hover:underline">Manage</a>
      </nav>
    </div>
  </header>

  <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>

  <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-gray-500">
    <div>© {new Date().getFullYear()} Haynes Eggspress • Fresh, organic, local eggs</div>
    <div className="mt-2">
      <a href="/admin/login" className="text-gray-400 hover:text-gray-600">Admin</a>
    </div>
  </footer>
{/* Register SW */}
{/* @ts-expect-error Server Component parent */}
{require("@/components/SWRegister").default()}
</body>
    </html>
  );
}
