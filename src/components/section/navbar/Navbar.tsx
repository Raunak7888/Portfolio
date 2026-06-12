// Navbar.tsx
"use client";

import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { ThemeToggle } from "../../ThemeToggle";
import ThemeColorDropdown from "./AccentChanger";
import Data from "@/Data/Data.json";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * We store the expanded width as a px value computed at runtime (see
 * computeExpandedWidth) so GSAP always tweens between two numeric px values.
 * Tweening from a px value to a vw string causes GSAP to re-query the DOM on
 * every frame, which produces a subtle jitter when the viewport is not exactly
 * divisible into round numbers.
 */
const NAV_VW_RATIO = 0.68; // 68 vw
const NAV_MAX_PX = 620; // hard cap
const BEAD_SIZE_PX = 80; // collapsed diameter
const SCROLL_THRESHOLD_PX = 80; // scroll-down distance before collapsing

/** Computes the expanded pill width in pixels, capped at NAV_MAX_PX. */
function computeExpandedWidth(): number {
    return Math.min(window.innerWidth * NAV_VW_RATIO, NAV_MAX_PX);
}

// ─────────────────────────────────────────────────────────────────────────────
// Framer Motion variants (mobile menu only — GSAP owns the pill)
// ─────────────────────────────────────────────────────────────────────────────

const menuVariants: Variants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.18,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.04,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        scale: 0.98,
        transition: { duration: 0.14, ease: "easeIn" },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.14 } },
    exit: { opacity: 0, x: -4, transition: { duration: 0.1 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// MobileMenu — purely Framer Motion, no GSAP, no shared refs
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS_MOBILE = ["About", "Skills", "Projects", "Contact"] as const;
const NAV_ITEMS_DESKTOP = ["Home", "About", "Skills", "Projects", "Contact"] as const;

interface MobileMenuProps {
    open: boolean;
    onClose: () => void;
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="mobile-menu"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    /**
                     * Positioned outside the GSAP-controlled pill div so the
                     * mobile dropdown never triggers a GSAP layout recalculation.
                     * It sits in a wrapper that is a sibling of the pill, still
                     * inside <nav> which is fixed to the viewport.
                     */
                    className="mt-1.5 p-3 rounded-2xl bg-background/95 backdrop-blur-md border border-border flex flex-col gap-0.5 shadow-lg"
                    style={{
                        // Inherit the pill's computed width so it aligns cleanly.
                        width: `min(68vw, ${NAV_MAX_PX}px)`,
                    }}
                >
                    {NAV_ITEMS_MOBILE.map((item) => (
                        <motion.a
                            key={item}
                            variants={itemVariants}
                            href={`/#${item.toLowerCase()}`}
                            onClick={onClose}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 py-2.5 px-3 rounded-2xl hover:bg-muted"
                        >
                            {item}
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pill GSAP animation helpers
// ─────────────────────────────────────────────────────────────────────────────

interface PillRefs {
    pill: HTMLDivElement;
    content: HTMLDivElement;
    logo: HTMLDivElement;
}

/**
 * All pill GSAP state lives in this object so the scroll handler closure and
 * the resize handler closure share a single source of truth without stale refs.
 */
interface PillState {
    isCollapsed: boolean;
    expandedWidth: number;
    lastScrollY: number;
    /** gsap.delayedCall() tickets — stored so we can kill them on cleanup. */
    delayedCalls: gsap.core.Tween[];
}

function killDelayedCalls(state: PillState) {
    state.delayedCalls.forEach((t) => t.kill());
    state.delayedCalls = [];
}

/**
 * Build a set of reusable tweens for the collapse / expand cycle.
 * Each tween targets a single CSS property on a single element.
 * `overwrite: "auto"` is set here — it only fires when a tween is
 * `.play()`-ed or `.restart()`-ed, cleanly cancelling the opposing
 * in-flight tween on the same property/target pair.
 *
 * IMPORTANT: We call `.restart()` (not `.play()`) so the tween always
 * starts from its declared `from` values regardless of where the
 * previous interrupted tween left off.
 */
function buildTweens(refs: PillRefs, expandedWidth: number) {
    const { pill, content, logo } = refs;

    // ── Collapse ────────────────────────────────────────────────────────────
    const collapseWidth = gsap.to(pill, {
        width: BEAD_SIZE_PX,
        borderRadius: 9999,
        duration: 0.32,
        ease: "expo.in",
        paused: true,
        overwrite: "auto",
    });

    const collapseContent = gsap.to(content, {
        opacity: 0,
        duration: 0.12,
        ease: "power2.in",
        paused: true,
        overwrite: "auto",
    });

    const showLogo = gsap.fromTo(
        logo,
        { opacity: 0, scale: 0.75 },
        {
            opacity: 1,
            scale: 1,
            duration: 0.18,
            ease: "back.out(1.6)",
            paused: true,
            overwrite: "auto",
        }
    );

    // ── Expand ──────────────────────────────────────────────────────────────
    const expandWidth = gsap.to(pill, {
        width: expandedWidth,
        borderRadius: 6,
        duration: 0.42,
        ease: "expo.out",
        paused: true,
        overwrite: "auto",
    });

    const showContent = gsap.to(content, {
        opacity: 1,
        duration: 0.18,
        ease: "power1.out",
        paused: true,
        overwrite: "auto",
    });

    const hideLogo = gsap.to(logo, {
        opacity: 0,
        scale: 0.75,
        duration: 0.1,
        ease: "power2.in",
        paused: true,
        overwrite: "auto",
    });

    return { collapseWidth, collapseContent, showLogo, expandWidth, showContent, hideLogo };
}

type PillTweens = ReturnType<typeof buildTweens>;

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navRef     = useRef<HTMLElement>(null);
    const pillRef    = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const logoRef    = useRef<HTMLDivElement>(null);

    // Mutable refs for GSAP state — never stored in React state to avoid
    // triggering re-renders inside scroll/resize handlers.
    const tweensRef    = useRef<PillTweens | null>(null);
    const pillStateRef = useRef<PillState>({
        isCollapsed: false,
        expandedWidth: 0,
        lastScrollY: 0,
        delayedCalls: [],
    });

    // ── Entry animation ─────────────────────────────────────────────────────
    useLayoutEffect(() => {
        const pill    = pillRef.current;
        const content = contentRef.current;
        const logo    = logoRef.current;
        if (!pill || !content || !logo) return;

        const expandedWidth = computeExpandedWidth();
        pillStateRef.current.expandedWidth = expandedWidth;

        // Set initial hidden state synchronously before first paint.
        gsap.set(pill, {
            width: BEAD_SIZE_PX,
            borderRadius: 9999,
            opacity: 1,
        });
        gsap.set(content, { opacity: 0 });
        gsap.set(logo,    { opacity: 0, scale: 0.75 });

        // Build and cache tweens so the scroll handler can use them without
        // recreating GSAP objects on every scroll event.
        tweensRef.current = buildTweens(
            { pill, content, logo },
            expandedWidth
        );

        // Entry sequence: bead → pill → reveal content.
        const tl = gsap.timeline({ delay: 0.15 });
        tl.to(pill, {
            width: expandedWidth,
            borderRadius: 6,
            duration: 0.65,
            ease: "expo.out",
        }).to(
            content,
            { opacity: 1, duration: 0.22, ease: "power1.out" },
            "-=0.12"
        );

        return () => {
            tl.kill();
            // Kill any tweens GSAP created via gsap.set() above.
            gsap.killTweensOf([pill, content, logo]);
        };
    }, []);

    // ── Resize: keep expandedWidth in sync ──────────────────────────────────
    useEffect(() => {
        const onResize = () => {
            const newWidth = computeExpandedWidth();
            pillStateRef.current.expandedWidth = newWidth;

            // Rebuild tweens with the new target width so subsequent
            // scroll-driven expand animations land at the correct size.
            const pill    = pillRef.current;
            const content = contentRef.current;
            const logo    = logoRef.current;
            if (!pill || !content || !logo) return;

            // Kill the old tweens before rebuilding to avoid leaks.
            if (tweensRef.current) {
                Object.values(tweensRef.current).forEach((t) => t.kill());
            }
            tweensRef.current = buildTweens({ pill, content, logo }, newWidth);

            // If currently expanded, snap the pill width so it never stays
            // at a stale px value when the window is resized while expanded.
            if (!pillStateRef.current.isCollapsed) {
                gsap.set(pill, { width: newWidth });
            }
        };

        // Debounce to avoid hammering GSAP on every pixel of resize.
        let rafId: ReturnType<typeof requestAnimationFrame>;
        const debouncedResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(onResize);
        };

        window.addEventListener("resize", debouncedResize, { passive: true });
        return () => {
            window.removeEventListener("resize", debouncedResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    // ── Scroll collapse / expand ─────────────────────────────────────────────
    useEffect(() => {
        const tweens = tweensRef.current;
        const state  = pillStateRef.current;
        if (!tweens) return;

        /**
         * Schedule a delayed tween and register the ticket so it can be
         * cancelled if the user reverses scroll direction before it fires.
         */
        const delayed = (delay: number, cb: () => void) => {
            const ticket = gsap.delayedCall(delay, cb);
            state.delayedCalls.push(ticket);
            return ticket;
        };

        const collapse = () => {
            // Cancel any pending expand delayed calls first.
            killDelayedCalls(state);

            tweensRef.current!.collapseContent.restart(true);
            delayed(0.06, () => tweensRef.current!.collapseWidth.restart(true));
            delayed(0.22, () => tweensRef.current!.showLogo.restart(true));
        };

        const expand = () => {
            killDelayedCalls(state);

            tweensRef.current!.hideLogo.restart(true);
            delayed(0.06, () => tweensRef.current!.expandWidth.restart(true));
            delayed(0.22, () => tweensRef.current!.showContent.restart(true));
        };

        const onScroll = () => {
            const currentY    = window.scrollY;
            const scrollingDown = currentY > state.lastScrollY;

            if (scrollingDown && currentY > SCROLL_THRESHOLD_PX && !state.isCollapsed) {
                state.isCollapsed = true;
                collapse();
            } else if (!scrollingDown && state.isCollapsed) {
                state.isCollapsed = false;
                expand();
            }

            state.lastScrollY = currentY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
            killDelayedCalls(state);

            // Kill all tweens to prevent them from firing after unmount.
            if (tweensRef.current) {
                Object.values(tweensRef.current).forEach((t) => t.kill());
            }
        };
    }, []);

    const handleMenuToggle = useCallback(() => {
        setMenuOpen((prev) => !prev);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const firstName = Data.hero.firstName as string;

    return (
        /**
         * Two children:
         *  1. The GSAP-controlled pill
         *  2. The Framer Motion mobile menu (sibling, not child of pill)
         *
         * Keeping them as siblings prevents Framer Motion's layout engine from
         * measuring the pill during mobile-menu enter/exit, which was causing
         * the pill to stutter at the start of the dropdown animation.
         */
        <nav
            ref={navRef}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
        >
            {/* ── Pill ───────────────────────────────────────────────────── */}
            <div
                ref={pillRef}
                className="relative h-11 bg-background/90 backdrop-blur-md border border-border flex items-center "
                /**
                 * `will-change` hints the compositor to promote this element to
                 * its own layer, so width/border-radius tweens run on the GPU
                 * and do not trigger main-thread layout in the rest of the document.
                 */
                style={{ willChange: "width, border-radius" }}
            >
                {/* Collapsed monogram — shown only when pill is collapsed */}
                <div
                    ref={logoRef}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ opacity: 0 }}
                    aria-hidden="true"
                >
                    <span className="text-sm font-semibold tracking-tight leading-none">
                        {firstName[0]}
                        <span className="text-primary">.</span>
                    </span>
                </div>

                {/* Full nav content */}
                <div
                    ref={contentRef}
                    className="w-full px-5 flex items-center justify-between gap-6"
                    style={{ opacity: 0 }}
                >
                    {/* Logo / name */}
                    <div className="text-lg font-semibold tracking-tight whitespace-nowrap leading-none shrink-0">
                        {firstName}
                        <span className="text-primary">.</span>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_ITEMS_DESKTOP.map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors duration-150 whitespace-nowrap"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Right-side controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle />
                        <ThemeColorDropdown />
                        <button
                            onClick={handleMenuToggle}
                            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile dropdown — sibling of pill, not a child ─────────── */}
            <MobileMenu open={menuOpen} onClose={handleMenuClose} />
        </nav>
    );
}