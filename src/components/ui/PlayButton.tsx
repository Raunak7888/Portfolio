// redesign.sh:v1
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

type PlayProps = {
    href: string;
    children: ReactNode;
    /** "solid" takes the surrounding --tint (or the accent). "outline" is the hairline pill. */
    variant?: "outline" | "solid";
    external?: boolean;
    round?: boolean;
    ariaLabel?: string;
};

/**
 * Compatibility adapter. The neo-brutalist offset-shadow button is gone; every
 * existing <PlayButton> now renders the site's custom Button (label + arrow chip).
 */
export default function PlayButton({ href, children, variant = "outline", external = false, round = false, ariaLabel }: PlayProps) {
    return (
        <Button
            href={href}
            variant={variant}
            external={external ? true : undefined}
            iconOnly={round}
            ariaLabel={ariaLabel}
        >
            {children}
        </Button>
    );
}
