import { AdminShell } from "@/components/admin/AdminShell";
import { OverviewStats } from "@/components/admin/OverviewStats";
import { getDashboardStats } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const stats = getDashboardStats();

  return (
    <AdminShell>
      <OverviewStats stats={stats} />
    </AdminShell>
  );
}