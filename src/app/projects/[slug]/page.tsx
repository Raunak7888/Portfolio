/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimatedLink from "@/components/ui/AnimatedLink";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import { RECORDS, STATUS } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(RECORDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const s = RECORDS[slug];
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
    const s = RECORDS[slug];
    if (!s) notFound();
    const { meta, executiveSummary: e, roadmap } = s;
    const links = s.links ?? [];
    const shots = s.screenshots ?? [];

    const groups = new Map<string, string[]>();
    for (const t of s.technologies ?? []) {
        const key = t.category ?? "Other";
        groups.set(key, [...(groups.get(key) ?? []), t.name]);
    }

    return (
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
            <AnimatedLink href="/#projects" arrow={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                ← Back to projects
            </AnimatedLink>

            <div className="mt-6">
                <Eyebrow>{STATUS[meta.status] ? `Status: ${STATUS[meta.status].label}` : "Case study"}</Eyebrow>
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                <span className="ds-serif text-primary">{meta.projectName}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{e.oneLiner}</p>

            {links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                    {links.map((l, i) => (
                        <PlayButton key={l.href} href={l.href} variant={i === 0 ? "solid" : "outline"} external>
                            {l.label}
                        </PlayButton>
                    ))}
                </div>
            )}

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

            {groups.size > 0 && (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Built with</h2>
                    <dl className="mt-4 flex flex-col gap-4">
                        {[...groups.entries()].map(([cat, names]) => (
                            <div key={cat} className="grid gap-2 sm:grid-cols-[9rem_1fr]">
                                <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground sm:pt-1.5">{cat}</dt>
                                <dd>
                                    <ul className="flex flex-wrap gap-1.5">
                                        {names.map((n) => (
                                            <li key={n} className="inline-flex h-7 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground/80">
                                                {n}
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {shots.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {shots.map((shot) => (
                            <img
                                key={shot.src}
                                src={shot.src}
                                alt={shot.alt}
                                width={shot.width}
                                height={shot.height}
                                loading="lazy"
                                decoding="async"
                                className="h-auto w-full rounded-[var(--ds-radius-sm)] border border-border"
                            />
                        ))}
                    </div>
                </section>
            )}

            <List title="Next up" items={roadmap?.shortTerm} />
            <List title="Later" items={[...(roadmap?.midTerm ?? []), ...(roadmap?.longTerm ?? [])]} />
        </article>
    );
}
