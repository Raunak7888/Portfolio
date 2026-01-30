"use client";

import { gsap } from "@/lib/gsap";

export type TransitionType = "theme" | "accent";

export function ThemeTransitionLayer() {
    return (
        <div
            id="theme-transition-layer"
            className="fixed inset-0 z-9999 pointer-events-none opacity-0 flex items-center justify-center overflow-hidden"
        >
            {" "}
            <div
                id="transition-circle"
                className="w-0.5 h-0.5 rounded-full scale-0 will-change-transform"
            />{" "}
        </div>
    );
}

export function runThemeTransition(type: TransitionType, action: () => void) {
    const wrapper = document.getElementById("theme-transition-layer");
    const circle = document.getElementById("transition-circle");

    if (!wrapper || !circle) return;

    const color = type === "theme" ? "var(--background)" : "var(--primary)";

    // Prepare the circle
    gsap.set(circle, {
        backgroundColor: color,
        boxShadow: `0 0 80px 40px ${color}`,
        scale: 0,
    });

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(wrapper, { opacity: 0 });
        },
    });

    tl.to(wrapper, {
        opacity: 1,
        duration: 0.1,
    })
        // 1. Scale Up to cover screen
        .to(circle, {
            scale: 3500,
            duration: 1.2,
            ease: "expo.inOut",
        })
        // 2. The "Soul Soothing" Pause & Color Change
        .add(() => {
            action(); // The actual theme change happens while screen is solid
        })
        // 3. Small delay to let the eye register the new color environment
        .to({}, { duration: 0.1 })
        // 4. Scale Down - we change origin to make it feel like it's being sucked away
        .to(circle, {
            scale: 0,
            duration: 1,
            ease: "expo.inOut",
        });
}
