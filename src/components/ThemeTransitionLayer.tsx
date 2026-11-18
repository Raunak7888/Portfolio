import { runViewTransition, type Origin } from "@/lib/view-transition";

export type TransitionType = "theme" | "accent";

/** Kept for compatibility. The View Transitions API needs no overlay element. */
export function ThemeTransitionLayer() {
    return null;
}

export function runThemeTransition(_type: TransitionType, action: () => void, origin?: Origin) {
    runViewTransition(action, origin);
}
