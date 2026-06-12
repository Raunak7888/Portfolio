import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectsEditor } from "@/components/admin/editors/ProjectsEditor";
import { readProjectJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const raw = readProjectJSON() as Record<string, {
    meta: {
      projectName: string;
      version: string;
      status: string;
      repository: string;
      license: string;
      post: string;
    };
    executiveSummary?: { oneLiner?: string };
  }>;

  const projects = Object.entries(raw).map(([key, proj]) => ({
    key,
    meta: proj.meta,
    tagline: proj.executiveSummary?.oneLiner,
  }));

  return (
    <AdminShell>
      <ProjectsEditor initialProjects={projects} />
    </AdminShell>
  );
}