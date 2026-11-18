/** Shared colour tokens. Mirrors the --ds-tint-* CSS variables. */
export const TINTS = {
    amber: "oklch(0.72 0.16 75)",
    rose: "oklch(0.68 0.17 10)",
    sky: "oklch(0.68 0.14 235)",
    violet: "oklch(0.66 0.17 295)",
    green: "oklch(0.72 0.17 150)",
} as const;

export const TINT_LIST = [TINTS.amber, TINTS.rose, TINTS.sky, TINTS.violet];

export const CONFETTI_COLORS = [...TINT_LIST, "var(--primary)"];
