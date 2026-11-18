import type { CSSProperties } from "react";

/** Endless tech ticker. Pauses on hover. Static and wrapped with reduced motion. */
export default function Marquee({
    items,
    duration = 48,
}: {
    items: string[];
    duration?: number;
}) {
    const group = (dup: boolean) => (
        <ul
            className="flex shrink-0 items-center"
            aria-hidden={dup || undefined}
            data-dup={dup || undefined}
        >
            {items.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-center">
                    <span className="ds-eyebrow px-6 text-muted-foreground transition-colors hover:text-foreground">
                        {item}
                    </span>
                    <span aria-hidden className="text-primary">✦</span>
                </li>
            ))}
        </ul>
    );

    return (
        <div
            role="group"
            aria-label="Technologies I work with"
            className="ds-marquee relative overflow-hidden border-y border-border bg-background py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
            <div
                className="ds-marquee-track"
                style={{ "--ds-marquee-duration": `${duration}s` } as CSSProperties}
            >
                {group(false)}
                {group(true)}
            </div>
        </div>
    );
}
