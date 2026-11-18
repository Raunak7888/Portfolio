"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(QUERY);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
}

/** True on devices with a mouse. Drag, tilt and spotlight effects need it. */
export function useFinePointer() {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
