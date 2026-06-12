import { AdminShell } from "@/components/admin/AdminShell";
import { SkillsEditor } from "@/components/admin/editors/SkillsEditor";
import { readDataJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SkillsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const raw = readDataJSON() as {
    skills?: {
      tech_types: string[];
      skills: unknown[];
    };
  };

  const data = {
    skills: raw.skills ?? { tech_types: [], skills: [] },
  };

  return (
    <AdminShell>
      <SkillsEditor initialData={data as { skills: { tech_types: string[]; skills: Parameters<typeof SkillsEditor>[0]["initialData"]["skills"]["skills"] } }} />
    </AdminShell>
  );
}