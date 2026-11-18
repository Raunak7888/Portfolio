import type { ReactNode } from "react";

/**
 * Full-height section. It is at least one viewport tall and grows with its
 * content, so nothing is clipped on short laptops, phones or landscape.
 */
export default function Screen({
    id,
    as: Tag = "section",
    children,
    className = "",
}: {
    id?: string;
    as?: "section" | "footer";
    children: ReactNode;
    className?: string;
}) {
    return (
        <Tag
            id={id}
            className={`relative box-border flex min-h-svh w-full max-w-[100vw] flex-col overflow-x-clip border-t border-border bg-background ${className}`}
        >
            {children}
        </Tag>
    );
}
