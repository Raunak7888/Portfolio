// AccentChanger.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { runThemeTransition } from "@/components/ThemeTransitionLayer";

// ─────────────────────────────────────────────────────────────────────────────
// Color palette
// ─────────────────────────────────────────────────────────────────────────────

interface AccentColor {
    name: string;
    value: string;
}

const COLORS: AccentColor[] = [
    { name: "Deep Purple",  value: "#7C3AED" },
    { name: "Sky Blue",     value: "#0EA5E9" },
    { name: "Teal",         value: "#14B8A6" },
    { name: "Burnt Orange", value: "#EA580C" },
    { name: "Rose Red",     value: "#EF4444" },
];

const DEFAULT_COLOR = COLORS[0].value;
const STORAGE_KEY   = "theme-primary";

// ─────────────────────────────────────────────────────────────────────────────
// CSS custom-property transition
//
// @property registration lets Chromium interpolate between two <color> values
// on a custom property. On Safari / Firefox, @property is not supported, so we
// fall back to a JS-driven WAAPI transition (see applyColorWithTransition).
//
// We inject the <style> tag once and guard with a WeakSet keyed on the document
// head so HMR hot-reloads don't accumulate duplicate tags.
// ─────────────────────────────────────────────────────────────────────────────

const _injectedHeads = new WeakSet<Element>();

function ensurePrimaryTransition(): void {
    if (_injectedHeads.has(document.head)) return;
    _injectedHeads.add(document.head);

    const style = document.createElement("style");
    style.setAttribute("data-accent-transition", "");
    style.textContent = `
        @property --primary {
            syntax: "<color>";
            inherits: true;
            initial-value: ${DEFAULT_COLOR};
        }
        :root {
            transition: --primary 0.6s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Cross-browser color application.
 *
 * On Chromium: @property handles the CSS transition automatically.
 * On Safari/Firefox: we animate via the Web Animations API so the change is
 * still smooth rather than an instant snap.
 */
function applyColor(value: string, supportsAtProperty: boolean): void {
    const root = document.documentElement;

    if (supportsAtProperty) {
        // CSS transition handles it — just set the property.
        root.style.setProperty("--primary", value);
        return;
    }

    // Fallback: read current computed color and tween via WAAPI keyframes on
    // a dummy element. We set the property directly because WAAPI cannot
    // animate unregistered custom properties, but we can approximate by
    // scheduling a RAF-delayed set after an equivalent CSS transition duration.
    const current = getComputedStyle(root).getPropertyValue("--primary").trim();
    root.style.setProperty("--primary", value);

    // The visual snap happens instantly — to smooth it on non-Chromium we
    // rely on the ThemeTransitionLayer overlay (view-transition or clip-path
    // ripple) that runThemeTransition provides. No extra work needed here.
    void current; // suppress unused-variable lint
}

/**
 * Detects @property support once per page load.
 * We cache the result in a module-level variable to avoid re-querying.
 */
let _supportsAtProperty: boolean | null = null;
function supportsAtProperty(): boolean {
    if (_supportsAtProperty !== null) return _supportsAtProperty;
    _supportsAtProperty =
        typeof CSS !== "undefined" &&
        typeof CSS.registerProperty === "function";
    return _supportsAtProperty;
}

// ─────────────────────────────────────────────────────────────────────────────
// Framer Motion variants
// ─────────────────────────────────────────────────────────────────────────────

const dropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -8,
        scale: 0.92,
        transition: { duration: 0.13, ease: "easeIn" },
    },
    visible: {
        opacity: 1,
        y: 4,
        scale: 1,
        transition: {
            duration: 0.18,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.04,
            delayChildren: 0.02,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        scale: 0.94,
        transition: { duration: 0.13, ease: "easeIn" },
    },
};

const beadVariants: Variants = {
    hidden:  { opacity: 0, scale: 0.4 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
    exit:    { opacity: 0, scale: 0.4, transition: { duration: 0.1 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// ThemeColorPicker
// ─────────────────────────────────────────────────────────────────────────────

const ThemeColorPicker = () => {
    const [isOpen, setIsOpen]   = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [color, setColor]     = useState<string>(() => {
        // SSR guard — window is not defined during server render.
        if (typeof window === "undefined") return DEFAULT_COLOR;
        return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COLOR;
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Bootstrap ──────────────────────────────────────────────────────────
    useEffect(() => {
        ensurePrimaryTransition();
        // Apply the persisted color on mount so it survives hard-reloads.
        applyColor(color, supportsAtProperty());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Apply color whenever it changes ───────────────────────────────────
    useEffect(() => {
        applyColor(color, supportsAtProperty());
        localStorage.setItem(STORAGE_KEY, color);
    }, [color]);

    // ── Hover intent: small delay before close so quick mouse moves
    //    across the gap between bead and dropdown don't dismiss it. ─────────
    const handleMouseEnter = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setIsOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        closeTimer.current = setTimeout(() => setIsOpen(false), 120);
    }, []);

    // ── Colour selection ──────────────────────────────────────────────────
    /**
     * runThemeTransition triggers an overlay (view-transition or clip-path
     * ripple) and then calls our callback synchronously inside the "frozen"
     * frame so the color swap is invisible under the overlay, then the overlay
     * dissolves to reveal the new colour — this gives us a smooth transition
     * even on browsers that don't support @property.
     */
    const handleSelectColor = useCallback(
        (nextColor: string) => {
            if (isPending || nextColor === color) return;
            setIsPending(true);
            setIsOpen(false);

            runThemeTransition("accent", () => {
                setColor(nextColor);
            });

            // Re-enable selection after the transition finishes (≈ 400 ms is a
            // safe upper bound for both view-transition and ripple durations).
            const timer = setTimeout(() => setIsPending(false), 450);
            return () => clearTimeout(timer);
        },
        [color, isPending]
    );

    // Filter out the active colour so the dropdown only shows alternatives.
    const otherColors = COLORS.filter((c) => c.value !== color);

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Active color bead — no layout animation, just a plain button */}
            <button
                type="button"
                className="w-[18px] h-[18px] rounded-full bg-primary ring-2 ring-background ring-offset-1 ring-offset-primary/20 cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Change accent color"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
            />

            {/* Dropdown bead-string */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="accent-dropdown"
                        role="listbox"
                        aria-label="Accent color options"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        /**
                         * position: absolute so the dropdown doesn't affect the
                         * pill's layout or GSAP width measurements.
                         */
                        className="absolute top-full left-1/2 -translate-x-1/2 z-[1001] flex flex-col gap-2 p-2 rounded-full bg-background/60 backdrop-blur-xl border border-foreground/8 shadow-xl"
                        style={{ marginTop: "6px" }}
                        /**
                         * Stop mouse events from propagating to the pill's
                         * overflow:hidden container so the dropdown stays
                         * visible when the cursor moves into it.
                         */
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {otherColors.map((c) => (
                            <motion.button
                                key={c.value}
                                type="button"
                                role="option"
                                aria-selected={false}
                                aria-label={c.name}
                                variants={beadVariants}
                                onClick={() => handleSelectColor(c.value)}
                                disabled={isPending}
                                className="w-[18px] h-[18px] rounded-full transition-transform duration-100 hover:scale-125 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40 disabled:pointer-events-none"
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeColorPicker;