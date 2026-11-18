"use client";
// redesign.sh:v1

import { useCallback, useSyncExternalStore } from "react";

/** True from `px` upward. False on the server, so the mobile layout is the safe default. */
export function useMinWidth(px: number) {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const mq = window.matchMedia(`(min-width: ${px}px)`);
            mq.addEventListener("change", onChange);
            return () => mq.removeEventListener("change", onChange);
        },
        [px],
    );
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(`(min-width: ${px}px)`).matches,
        () => false,
    );
}
