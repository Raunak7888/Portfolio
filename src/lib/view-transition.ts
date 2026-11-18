import { flushSync } from "react-dom";

type ViewTransitionLike = { ready: Promise<void> };
export type Origin = { x: number; y: number };

/**
 * Runs `update` inside the View Transitions API with a circular reveal.
 * Falls back to a plain update when the API is missing or the visitor
 * prefers reduced motion.
 */
export function runViewTransition(update: () => void, origin?: Origin, duration = 550) {
    const doc = document as Document & {
        startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof doc.startViewTransition !== "function") {
        update();
        return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => {
        flushSync(update);
    });
    transition.ready
        .then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
            );
        })
        .catch(() => {});
}
