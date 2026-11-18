import type { Variants } from "framer-motion";

/** Springs used across the site. */
export const spring = { type: "spring", stiffness: 260, damping: 22 } as const;
export const softSpring = { type: "spring", stiffness: 180, damping: 18 } as const;
export const bouncy = { type: "spring", stiffness: 320, damping: 16 } as const;

/** Scroll reveals fire once, when 30% of the element is visible. */
export const viewportOnce = { once: true, amount: 0.3 } as const;

export const fade: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: spring },
};

export const rise: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: spring },
};

export const stack: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

export const stackLoose: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};

/** Fast, snappy spring for stamps, presses and confirmations. */
export const pop = { type: "spring", stiffness: 520, damping: 18 } as const;

/** Hover wiggle for icons and stickers. */
export const wiggle: Variants = {
    rest: { rotate: 0 },
    hover: { rotate: [0, -8, 7, -4, 0], transition: { duration: 0.5 } },
};

// ed:motion (redesign.sh:v1) shared easings for the editorial motion system
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeInOutQuint = [0.65, 0, 0.35, 1] as const;
