import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMediaFiles } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MediaPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const files = listMediaFiles();

  return (
    <AdminShell>
      <MediaLibrary initialFiles={files} />
    </AdminShell>
  );
}
