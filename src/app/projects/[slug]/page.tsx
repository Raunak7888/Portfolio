/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import raw from "@/Data/Project.json";
import Link from "next/link";


type Study = {
    meta: { projectName: string; status?: string; live?: string; repository?: string; post?: string };
    images?: string[];
    executiveSummary: {
        oneLiner: string;
        problemStatement: string;
        solutionOverview: string;
        keyCapabilities: string[];
        knownLimitations: string[];
    };
    roadmap?: { shortTerm?: string[]; midTerm?: string[]; longTerm?: string[] };
};

const studies = raw as unknown as Record<string, Study>;

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(studies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const s = studies[slug];
    if (!s) return {};
    return {
        title: s.meta.projectName,
        description: s.executiveSummary.oneLiner,
        alternates: { canonical: `/projects/${slug}` },
    };
}

function List({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
                {items.map((i) => (
                    <li key={i} className="flex gap-3 text-base leading-7 text-foreground/85">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{i}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const s = studies[slug];
    if (!s) notFound();
    const { meta, executiveSummary: e, roadmap } = s;

    return (
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
            <Link href="/#projects" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                ← Back to projects
            </Link>

            <div className="mt-6">
                <Eyebrow>{meta.status ? `Status: ${meta.status}` : "Case study"}</Eyebrow>
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                <span className="ds-serif text-primary">{meta.projectName}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{e.oneLiner}</p>

            <div className="mt-6 flex flex-wrap gap-3">
                {meta.live ? (
                    <PlayButton href={meta.live} variant="solid" external>
                        Live demo
                    </PlayButton>
                ) : null}
                {meta.repository ? (
                    <PlayButton href={meta.repository} external>
                        Source
                    </PlayButton>
                ) : null}
                {meta.post ? (
                    <PlayButton href={meta.post} external>
                        Article
                    </PlayButton>
                ) : null}
            </div>

            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The problem</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.problemStatement}</p>
            </section>
            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The solution</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.solutionOverview}</p>
            </section>

            <List title="What it does" items={e.keyCapabilities} />
            <List title="Known limitations" items={e.knownLimitations} />

            {s.images && s.images.length > 0 ? (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {s.images.map((src, i) => (
                            <img
                                key={src}
                                src={src}
                                alt={`${meta.projectName} screenshot ${i + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full rounded-[var(--ds-radius-sm)] border border-border"
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            <List title="Next up" items={roadmap?.shortTerm} />
            <List title="Later" items={[...(roadmap?.midTerm ?? []), ...(roadmap?.longTerm ?? [])]} />
        </article>
    );
}
