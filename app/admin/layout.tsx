import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/sign";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("hx_admin")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.role || payload.role !== "admin") {
    redirect(`/admin/login`);
  }
  return <section className="container py-4">{children}</section>;
}
