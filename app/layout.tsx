import "./globals.css";
import React from "react";
import SWRegister from "@/components/SWRegister";

export const metadata = {
  title: "Haynes Eggspress",
  description: "Fresh local eggs, porch-delivered weekly in 33584.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo-transparent.png" alt="Haynes Eggspress" width={40} height={40} />
              <span className="font-semibold tracking-wide">Haynes Eggspress</span>
            </a>
            <nav className="ml-auto text-sm flex items-center gap-4">
              <a href="/signup/plan" className="hover:underline">Start</a>
              <a href="/manage" className="hover:underline">Manage</a>
              <a href="/about" className="hover:underline">About</a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>

        {/* Footer */}
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-gray-500">
          <div>© {new Date().getFullYear()} Haynes Eggspress • Fresh, local eggs</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
            <a href="/updates" className="hover:underline">Updates</a>
            <a href="/admin/login" className="hover:underline">Admin</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
        </footer>

        {/* Register PWA service worker */}
        <SWRegister />
      </body>
    </html>
  );
}
