import { AdminShell } from "@/components/admin/AdminShell";
import { ResumeEditor } from "@/components/admin/editors/ResumeEditor";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

function getResumeInfo() {
  const publicDir = process.cwd() + "/public";
  const entries = fs.readdirSync(publicDir);
  const found = entries.find(
    (f) => f.toLowerCase().endsWith(".pdf") && f.toLowerCase().includes("resume")
  );
  if (!found) return { exists: false, filename: null, url: null, size: null, modified: null };
  const fullPath = path.join(publicDir, found);
  const stat = fs.statSync(fullPath);
  return {
    exists: true,
    filename: found,
    url: "/" + found,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  };
}

export default async function ResumePage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const info = getResumeInfo();

  return (
    <AdminShell>
      <ResumeEditor initialInfo={info} />
    </AdminShell>
  );
}