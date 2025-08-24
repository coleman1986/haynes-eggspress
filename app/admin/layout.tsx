import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/sign";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next.js (newer) returns a Promise<ReadonlyRequestCookies>
  const store = await cookies();
  const token = store.get("hx_admin")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload?.role || payload.role !== "admin") {
    redirect("/admin/login");
  }

  return <section className="container py-4">{children}</section>;
}
