import raw from "@/Data/Project.json";
import { portfolio } from "./data";
import type { Project, ProjectRecord, StatusKind } from "@/types/portfolio";

export type { Project, ProjectRecord, StatusKind, LinkKind, Metric, ProjectLink, Screenshot, Technology } from "@/types/portfolio";

const s = portfolio.sections.projects;

export const copy = {
    index: s.index ?? "03",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    hintFine: s.hintFine,
    hintTouch: s.hintTouch,
    outroTitle: s.outroTitle,
    outroText: s.outroText,
    outroCta: s.outroCta,
    comingSoon: s.comingSoon,
    caseStudy: s.caseStudy,
    githubProfile: portfolio.heroSection.socialLinks.githubUrl,
};

export const STATUS: Record<StatusKind, { label: string; color: string }> = {
    live: { label: "Live", color: "oklch(0.72 0.17 150)" },
    active: { label: "Active", color: "oklch(0.68 0.14 235)" },
    building: { label: "In development", color: "oklch(0.72 0.16 75)" },
};

/** Every project record, keyed by slug. */
export const RECORDS = raw as unknown as Record<string, ProjectRecord>;

/** Cards in display order. Adding a project means adding an entry to Project.json. */
export const PROJECTS: Project[] = Object.entries(RECORDS)
    .filter(([, r]) => !!r?.card)
    .sort((a, b) => (a[1].card.order ?? 99) - (b[1].card.order ?? 99))
    .map(([id, r]) => ({
        id,
        name: r.meta.projectName,
        kind: r.card.kind ?? "Project",
        tint: r.card.tint ?? "var(--primary)",
        status: r.meta.status ?? "active",
        cardLine: r.card.tagline ?? r.executiveSummary?.oneLiner ?? "",
        summary: r.card.summary ?? "",
        chips: r.card.chips ?? [],
        bullets: r.card.bullets ?? [],
        metrics: r.card.metrics ?? [],
        links: r.links ?? [],
        caseStudy: `/projects/${id}`,
        screenshots: r.screenshots ?? [],
        interaction: r.presentation?.interaction ?? "filmstrip",
        readout: r.card.readout,
    }));

export const TOTAL = PROJECTS.length;
