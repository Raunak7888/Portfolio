"use client";
// redesign.sh:v1

import { useEffect, useRef, type CSSProperties } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { STATUS, type LinkKind, type Metric, type StatusKind } from "@/content/projects";

export function GithubMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
    );
}

function Stroke({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

export function LinkIcon({ kind, className }: { kind: LinkKind; className?: string }) {
    if (kind === "repo") return <GithubMark className={className} />;
    if (kind === "post")
        return (
            <Stroke className={className}>
                <path d="M6 3h9l4 4v14H6z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h7M9 17h5" />
            </Stroke>
        );
    return (
        <Stroke className={className}>
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
        </Stroke>
    );
}

export function Sparkle({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
            <path d="M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10Z" />
        </svg>
    );
}

export function StatusChip({ status }: { status: StatusKind }) {
    const s = STATUS[status];
    return (
        <span
            style={{ "--chip": s.color } as CSSProperties}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
            <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--chip)] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--chip)]" />
            </span>
            {s.label}
        </span>
    );
}

function CountUp({ to, suffix, reduce }: { to: number; suffix?: string; reduce: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const mv = useMotionValue(reduce ? to : 0);
    const text = useTransform(mv, (v) => Math.round(v).toString());

    useEffect(() => {
        if (reduce) {
            mv.set(to);
            return;
        }
        if (!inView) return;
        const controls = animate(mv, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [to, reduce, inView, mv]);

    return (
        <span ref={ref} className="tabular-nums">
            <motion.span>{text}</motion.span>
            {suffix}
        </span>
    );
}

export function Metrics({ metrics, reduce }: { metrics: Metric[]; reduce: boolean }) {
    return (
        <div className="grid grid-cols-3 gap-3 border-y border-border py-3">
            {metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-1">
                    <span className="text-lg font-semibold leading-none tracking-tight text-[color:var(--tint)]">
                        {typeof m.value === "number" ? <CountUp to={m.value} suffix={m.suffix} reduce={reduce} /> : m.value}
                    </span>
                    <span className="text-xs leading-4 text-muted-foreground">{m.label}</span>
                </div>
            ))}
        </div>
    );
}
