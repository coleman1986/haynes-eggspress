import "./globals.css";
import React from "react";

export const metadata = {
  title: "Haynes Eggspress",
  description: "Fresh organic eggs, porch-delivered weekly in 33584.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <div className="mx-auto max-w-3xl p-4 flex items-center justify-between">
            <div className="font-semibold">Haynes Eggspress</div>
            <nav className="text-sm space-x-4">
              <a href="/signup/plan">Start</a>
              <a href="/admin/routes/tomorrow">Admin</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl p-4">{children}</main>
      </body>
    </html>
  );
}
