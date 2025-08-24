import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/sign";

export default async function AdminProtectedLayout({
  children,
}: { children: React.ReactNode }) {
  const store = await cookies();                // async on newer Next
  const token = store.get("hx_admin")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload?.role || payload.role !== "admin") {
    redirect("/admin/login");                   // login lives OUTSIDE this group
  }
  return <section className="container py-4">{children}</section>;
}
