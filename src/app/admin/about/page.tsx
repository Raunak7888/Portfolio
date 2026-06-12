import { AdminShell } from "@/components/admin/AdminShell";
import { AboutEditor } from "@/components/admin/editors/AboutEditor";
import { readDataJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AboutPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const raw = readDataJSON() as {
    about: {
      endingLine: string;
      segments: { id: string; title: string; label: string; text: string }[];
    };
  };

  // Ensure about exists with defaults if not
  const data = {
    about: raw.about ?? {
      endingLine: "",
      segments: [],
    },
  };

  return (
    <AdminShell>
      <AboutEditor initialData={data} />
    </AdminShell>
  );
}