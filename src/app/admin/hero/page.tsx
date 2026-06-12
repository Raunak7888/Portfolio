import { AdminShell } from "@/components/admin/AdminShell";
import { HeroEditor } from "@/components/admin/editors/HeroEditor";
import { readDataJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HeroPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const data = readDataJSON() as {
    hero: { firstName: string; secondName: string; fullName: string; email: string };
    heroSection: {
      description: string;
      socialLinks: { githubUrl: string; linkedInUrl: string; instagramUrl: string; gmailUrl: string };
      viewSourceGithubLinkUrl: string;
    };
    footer?: { note: string };
  };

  return (
    <AdminShell>
      <HeroEditor initialData={data} />
    </AdminShell>
  );
}