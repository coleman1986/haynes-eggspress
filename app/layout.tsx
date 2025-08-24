import "./globals.css";
import React from "react";
import SWRegister from "@/components/SWRegister"; // ✅ import the client component

export const metadata = {
  title: "Haynes Eggspress",
  description: "Fresh organic eggs, porch-delivered weekly in 33584.",
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
          {/* Remove this link entirely if you want it hidden */}
          <div className="mt-2">
            <a href="/admin/login" className="text-gray-400 hover:text-gray-600">Admin</a>
          </div>
        </footer>

        {/* Register service worker (client component) */}
        <SWRegister />
      </body>
    </html>
  );
}
