import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type Props = {
    href: string;
    children: ReactNode;
    /** underline: inline text links. nudge: items in a list. */
    variant?: "underline" | "nudge";
    external?: boolean;
    /** Show the ↗ mark. Defaults to true for external links. */
    arrow?: boolean;
    className?: string;
    ariaLabel?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * The only way to write an animated text link. Handles external links,
 * mailto, in-page anchors and Next routes. Hover and keyboard focus look the
 * same, and reduced motion turns the movement off (see styles/links.css).
 */
export default function AnimatedLink({
    href,
    children,
    variant = "underline",
    external,
    arrow,
    className = "",
    ariaLabel,
    onClick,
}: Props) {
    const isExternal = external ?? /^https?:/.test(href);
    const plain = isExternal || /^(mailto:|tel:|#)/.test(href);
    const cls = `${variant === "nudge" ? "lnk-nudge" : "lnk"} ${className}`.trim();
    const showArrow = arrow ?? isExternal;
    const content = (
        <>
            {children}
            {showArrow && <span aria-hidden className="lnk-arrow">{"\u00A0↗"}</span>}
        </>
    );

    if (plain) {
        return (
            <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={ariaLabel}
                onClick={onClick}
                className={cls}
            >
                {content}
            </a>
        );
    }
    return (
        <Link href={href} aria-label={ariaLabel} onClick={onClick} className={cls}>
            {content}
        </Link>
    );
}
