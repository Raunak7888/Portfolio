import Link from "next/link";
import type { ReactNode } from "react";

type PlayProps = {
    href: string;
    children: ReactNode;
    /** "solid" takes the surrounding --tint (or the accent). "outline" is paper. */
    variant?: "outline" | "solid";
    external?: boolean;
    round?: boolean;
    ariaLabel?: string;
};

/**
 * A chunky, physical button: a hard offset shadow that it lifts away from on
 * hover and sinks into on press. Replaces the old glass pills everywhere.
 */
const BASE =
    "group/play relative inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full border-2 border-foreground text-sm font-semibold outline-none " +
    "shadow-[3px_3px_0_0_var(--foreground)] transition-[transform,box-shadow,background-color] duration-150 ease-out " +
    "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--foreground)] " +
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--foreground)] " +
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0 " +
    "[&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:-rotate-12 hover:[&_svg]:scale-110";

const VARIANT = {
    outline:
        "bg-background text-foreground hover:bg-[color-mix(in_oklab,var(--tint,var(--primary))_24%,var(--background))]",
    solid: "bg-[color:var(--tint,var(--primary))] text-[color:var(--on-tint,var(--primary-foreground))]",
} as const;

export default function PlayButton({
    href,
    children,
    variant = "outline",
    external = false,
    round = false,
    ariaLabel,
}: PlayProps) {
    const cls = `${BASE} ${VARIANT[variant]} ${round ? "size-10" : "h-10 px-4"}`;

    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={cls}>
                {children}
            </a>
        );
    }
    return (
        <Link href={href} aria-label={ariaLabel} className={cls}>
            {children}
        </Link>
    );
}
