/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { Project, Screenshot } from "@/types/portfolio";

export type InteractionProps = {
    project: Project;
    shots: Screenshot[];
    reduce: boolean;
};

export const ratioOf = (s?: Screenshot) => (s?.width && s?.height ? s.width / s.height : 1.6);

export function Shot({
    shot,
    eager,
    decorative,
    className = "",
}: {
    shot: Screenshot;
    eager?: boolean;
    decorative?: boolean;
    className?: string;
}) {
    return (
        <img
            src={shot.src}
            alt={decorative ? "" : shot.alt}
            aria-hidden={decorative || undefined}
            width={shot.width}
            height={shot.height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={className}
        />
    );
}

export function Frame({ ratio, children, className = "" }: { ratio: number; children: ReactNode; className?: string }) {
    return (
        <div
            style={{ aspectRatio: ratio }}
            className={`relative block w-full overflow-hidden rounded-[6px] border border-border bg-[color-mix(in_oklab,var(--tint)_12%,var(--background))] shadow-[0_30px_70px_-34px_rgba(0,0,0,0.6)] ${className}`}
        >
            {children}
        </div>
    );
}

export function Missing({ name }: { name: string }) {
    return (
        <span className="grid aspect-[16/10] w-full place-items-center rounded-[6px] border border-dashed border-border text-sm text-muted-foreground">
            {name}: screenshot unavailable
        </span>
    );
}
