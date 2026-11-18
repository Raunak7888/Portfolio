"use client";
// redesign.sh:v1

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon } from "@hugeicons/core-free-icons";

type Variant = "solid" | "outline" | "ghost";
type Size = "md" | "sm";

export type ButtonProps = {
    children?: ReactNode;
    variant?: Variant;
    size?: Size;
    href?: string;
    external?: boolean;
    type?: "button" | "submit";
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    loading?: boolean;
    iconOnly?: boolean;
    icon?: ReactNode;
    ariaLabel?: string;
    className?: string;
};

/*
 * The site button: a label, then a round arrow chip. On hover the chip's fill
 * grows behind the label and the label flips to the on-fill colour.
 * It reads --tint / --on-tint when a parent sets them (project colours).
 * Hover, focus-visible, active, disabled and loading states are shared by every
 * usage on the site (PlayButton is a thin adapter over this component).
 */
const VARIANTS: Record<Variant, string> = {
    solid:
        "[--btn-fill:var(--tint,var(--primary))] [--btn-on:var(--on-tint,var(--primary-foreground))] [--btn-line:color-mix(in_oklab,var(--foreground)_18%,transparent)]",
    outline:
        "[--btn-fill:var(--foreground)] [--btn-on:var(--background)] [--btn-line:color-mix(in_oklab,var(--foreground)_24%,transparent)]",
    ghost:
        "[--btn-fill:color-mix(in_oklab,var(--foreground)_12%,transparent)] [--btn-on:var(--foreground)] [--btn-line:transparent]",
};

const ROOT =
    "group/btn relative isolate inline-flex shrink-0 select-none items-center gap-3 rounded-full text-sm font-medium text-foreground outline-none " +
    "transition-transform duration-300 active:scale-[0.98] motion-reduce:transition-none " +
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:pointer-events-none disabled:opacity-60 aria-busy:cursor-progress";

const SIZE = {
    md: { box: "h-11 pl-5 pr-1", chip: "size-9", fill: "w-9", icon: "size-11" },
    sm: { box: "h-9 pl-4 pr-1", chip: "size-7", fill: "w-7", icon: "size-9" },
} as const;

function Spinner() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 animate-spin motion-reduce:animate-none" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export default function Button({
    children,
    variant = "outline",
    size = "md",
    href,
    external,
    type = "button",
    onClick,
    disabled,
    loading,
    iconOnly,
    icon,
    ariaLabel,
    className = "",
}: ButtonProps) {
    const label = children ?? "Read case study";
    const s = SIZE[size];
    const cls = `${ROOT} ${VARIANTS[variant]} ${iconOnly ? `${s.icon} justify-center` : s.box} ${className}`;
    const solid = variant === "solid";

    const inner = (
        <>
            {variant !== "ghost" && (
                <span aria-hidden className="absolute inset-0 -z-10 rounded-full border border-[color:var(--btn-line)]" />
            )}
            <span
                aria-hidden
                className={
                    iconOnly
                        ? `absolute inset-0 -z-10 rounded-full bg-[color:var(--btn-fill)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                              solid
                                  ? "scale-100 group-hover/btn:scale-110"
                                  : "scale-0 group-hover/btn:scale-100 group-focus-visible/btn:scale-100"
                          }`
                        : `absolute inset-y-1 right-1 -z-10 ${s.fill} rounded-full bg-[color:var(--btn-fill)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:w-[calc(100%-0.5rem)] group-focus-visible/btn:w-[calc(100%-0.5rem)] motion-reduce:transition-none`
                }
            />
            {iconOnly ? (
                <span
                    className={`relative z-10 grid place-items-center transition-colors duration-300 ${
                        solid
                            ? "text-[color:var(--btn-on)]"
                            : "text-foreground group-hover/btn:text-[color:var(--btn-on)] group-focus-visible/btn:text-[color:var(--btn-on)]"
                    }`}
                >
                    {loading ? <Spinner /> : label}
                </span>
            ) : (
                <>
                    <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap transition-colors duration-300 group-hover/btn:text-[color:var(--btn-on)] group-focus-visible/btn:text-[color:var(--btn-on)]">
                        {label}
                    </span>
                    <span className={`relative z-10 grid ${s.chip} shrink-0 place-items-center rounded-full text-[color:var(--btn-on)]`}>
                        {loading ? (
                            <Spinner />
                        ) : (
                            (icon ?? (
                                <HugeiconsIcon
                                    icon={ArrowRightIcon}
                                    size={16}
                                    strokeWidth={2}
                                    className="transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transition-none"
                                />
                            ))
                        )}
                    </span>
                </>
            )}
        </>
    );

    if (href) {
        const newTab = external === true || (external === undefined && /^https?:/.test(href));
        const plain = newTab || /^(mailto:|tel:)/.test(href);
        if (plain) {
            return (
                <a
                    href={href}
                    target={newTab ? "_blank" : undefined}
                    rel={newTab ? "noopener noreferrer" : undefined}
                    aria-label={ariaLabel}
                    onClick={onClick}
                    className={cls}
                >
                    {inner}
                </a>
            );
        }
        return (
            <Link href={href} aria-label={ariaLabel} onClick={onClick} className={cls}>
                {inner}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            aria-label={ariaLabel}
            onClick={onClick}
            className={cls}
        >
            {inner}
        </button>
    );
}
