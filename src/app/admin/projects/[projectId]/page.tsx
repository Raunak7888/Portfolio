import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectDetailEditor } from "@/components/admin/editors/ProjectDetailEditor";
import { readProjectJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const EMPTY_PROJECT = {
  meta: {
    projectName: "",
    codename: "",
    version: "0.1.0",
    status: "active",
    lastUpdated: new Date().toISOString().slice(0, 10),
    maintainers: [],
    repository: "",
    license: "MIT",
    post: "",
  },
  images: [],
  executiveSummary: {
    oneLiner: "",
    problemStatement: "",
    solutionOverview: "",
    primaryUsers: [],
    keyCapabilities: [],
    knownLimitations: [],
  },
  architecture: {
    overview: "",
    diagram: { type: "text", content: "graph LR\n  A --> B" },
    components: [],
    dataFlow: [],
    architectureRationale: "",
  },
  roadmap: {
    shortTerm: [],
    midTerm: [],
    longTerm: [],
  },
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/admin/login");

  const { projectId } = await params;
  const isNew = projectId === "new";

  if (isNew) {
    return (
      <AdminShell>
        <ProjectDetailEditor
          projectKey=""
          initialData={EMPTY_PROJECT}
          isNew={true}
        />
      </AdminShell>
    );
  }

  const raw = readProjectJSON() as Record<string, unknown>;
  const proj = raw[projectId];

  if (!proj) notFound();

  return (
    <AdminShell>
      <ProjectDetailEditor
        projectKey={projectId}
        initialData={proj as Parameters<typeof ProjectDetailEditor>[0]["initialData"]}
        isNew={false}
      />
    </AdminShell>
  );
}