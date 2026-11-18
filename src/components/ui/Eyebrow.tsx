import type { ReactNode } from "react";

/** Pulse dot, optional mono index, label. Used by every section. */
export default function Eyebrow({
    index,
    children,
    className = "",
}: {
    index?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-2.5 rounded-full border border-border bg-muted/50 py-1.5 pl-3.5 pr-4 ${className}`}
        >
            <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {index && <span className="ds-eyebrow text-primary">{index}</span>}
            <span className="text-sm font-medium">{children}</span>
        </span>
    );
}
