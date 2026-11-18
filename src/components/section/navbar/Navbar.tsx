// Navbar.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type Transition,
    type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    UserIcon,
    CodeIcon,
    Folder01Icon,
    Mail01Icon,
    Menu01Icon,
    Briefcase01Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";

import { ThemeToggle } from "../../ThemeToggle";
import ThemeColorDropdown from "./AccentChanger";
import Data from "@/Data/Data.json";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { id: "home", label: "Home", icon: Home01Icon },
    { id: "about", label: "About", icon: UserIcon },
    { id: "skills", label: "Skills", icon: CodeIcon },
    { id: "projects", label: "Projects", icon: Folder01Icon },
    { id: "experience", label: "Experience", icon: Briefcase01Icon },
    { id: "contact", label: "Contact", icon: Mail01Icon },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

const MOBILE_ITEMS = NAV_ITEMS.filter((i) => i.id !== "home");

const NAV_HEIGHT = 48; // px — radius is 50% of this (full pill)
const COMPACT_WIDTH = 124; // px — collapsed "Raunak." pill
const EXPANDED_MAX = 880; // px
const EXPANDED_VW = 0.94;
const SCROLL_THRESHOLD = 80; // px before collapsing
const DOWN_DEADZONE = 6; // px of downward scroll to count
const UP_DEADZONE = 10; // px of upward scroll to count (avoids accidental expands)
const HOVER_SCROLL_GUARD_MS = 350; // ignore hover right after scrolling
const LEAVE_DELAY_MS = 180; // grace period before collapsing after mouse leaves

// One spring drives the whole collapse/expand (critically damped = no wobble).
const T_SPRING = { stiffness: 210, damping: 30, mass: 0.9, restDelta: 0.0005 };
const T_SPRING_REDUCED = { stiffness: 4000, damping: 200, mass: 1 };

// Snappier spring for the sliding link highlight and menu.
const UI_SPRING: Transition = {
    type: "spring",
    stiffness: 380,
    damping: 32,
    mass: 0.8,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Tracks which section is under the middle of the viewport. */
function useActiveSection(): NavId {
    const [active, setActive] = useState<NavId>("home");

    useEffect(() => {
        const els = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
            (el): el is HTMLElement => el !== null
        );

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id as NavId);
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        els.forEach((el) => io.observe(el));

        const onScroll = () => {
            if (window.scrollY < 120) setActive("home");
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            io.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return active;
}

/** Expanded pill width in px, kept in sync with the viewport. */
function useExpandedWidth(): number {
    const [width, setWidth] = useState(EXPANDED_MAX);

    useEffect(() => {
        let raf = 0;
        const compute = () =>
            setWidth(Math.min(window.innerWidth * EXPANDED_VW, EXPANDED_MAX));
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(compute);
        };
        compute();
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return width;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile menu
// ─────────────────────────────────────────────────────────────────────────────

const menuVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { ...UI_SPRING, staggerChildren: 0.045, delayChildren: 0.04 },
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.97,
        transition: { duration: 0.14, ease: "easeIn" },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: UI_SPRING },
    exit: { opacity: 0, transition: { duration: 0.08 } },
};

interface MobileMenuProps {
    open: boolean;
    width: number;
    active: NavId;
    onNavigate: (e: React.MouseEvent, id: NavId) => void;
}

function MobileMenu({ open, width, active, onNavigate }: MobileMenuProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="mobile-menu"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ width, transformOrigin: "top center" }}
                    className="pointer-events-auto mt-2 flex flex-col gap-1 rounded-[28px] border border-border bg-background/85 p-2 shadow-xl backdrop-blur-xl"
                >
                    {MOBILE_ITEMS.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <motion.div key={item.id} variants={itemVariants}>
                                <Link
                                    href={`/#${item.id}`}
                                    onClick={(e) => onNavigate(e, item.id)}
                                    aria-current={isActive ? "true" : undefined}
                                    className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                                        isActive
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        size={18}
                                        strokeWidth={1.75}
                                        className={isActive ? "text-primary" : ""}
                                    />
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    const navRef = useRef<HTMLElement>(null);
    const lastY = useRef(0);
    const lastScrollAt = useRef(0);
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [entered, setEntered] = useState(false);
    const [collapsed, setCollapsed] = useState(
        () => typeof window !== "undefined" && window.scrollY > SCROLL_THRESHOLD
    );
    const [peek, setPeek] = useState(false); // hover / focus / tap re-expands
    const [menuOpen, setMenuOpen] = useState(false);
    const [hovered, setHovered] = useState<NavId | null>(null);

    const active = useActiveSection();
    const expandedWidth = useExpandedWidth();

    const expanded = entered && (!collapsed || peek || menuOpen);
    const highlighted = hovered ?? active;

    const firstName = Data.hero.firstName as string;

    // ── Single spring drives everything: 0 = compact, 1 = expanded ──────────
    const t = useSpring(0, reduceMotion ? T_SPRING_REDUCED : T_SPRING);
    const expandedMV = useMotionValue(EXPANDED_MAX);

    useEffect(() => {
        expandedMV.set(expandedWidth);
    }, [expandedWidth, expandedMV]);

    useEffect(() => {
        t.set(expanded ? 1 : 0);
    }, [expanded, t]);

    // Derived values — computed per frame outside React.
    const pillWidth = useTransform([t, expandedMV], (latest: number[]) => {
        const [tv, ev] = latest;
        return COMPACT_WIDTH + (ev - COMPACT_WIDTH) * Math.min(Math.max(tv, 0), 1);
    });
    const innerWidth = useTransform(expandedMV, (v) => v - 2); // minus 1px borders

    const compactOpacity = useTransform(t, [0.1, 0.5], [1, 0]);
    const compactScale = useTransform(t, [0, 0.5], [1, 0.9]);
    const compactVisibility = useTransform(t, (v) => (v > 0.5 ? "hidden" : "visible"));

    const fullOpacity = useTransform(t, [0.5, 0.9], [0, 1]);
    const fullScale = useTransform(t, [0.5, 1], [0.96, 1]);
    const fullVisibility = useTransform(t, (v) => (v < 0.5 ? "hidden" : "visible"));

    // Clip the full content to the pill's current shape while animating,
    // then remove the clip entirely at rest so dropdowns are never cut off.
    const fullClip = useTransform([t, expandedMV], (latest: number[]) => {
        const [tv, ev] = latest;
        if (tv >= 0.999) return "none";
        const w = COMPACT_WIDTH + (ev - COMPACT_WIDTH) * Math.max(0, tv);
        const inset = Math.max(0, (ev - w) / 2);
        return `inset(0px ${inset}px round ${NAV_HEIGHT / 2}px)`;
    });

    // ── Entry: bead pops in, then expands ───────────────────────────────────
    useEffect(() => {
        lastY.current = window.scrollY;
        const id = setTimeout(() => setEntered(true), 220);
        return () => clearTimeout(id);
    }, []);

    // ── Scroll progress line ────────────────────────────────────────────────
    const { scrollY, scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        restDelta: 0.001,
    });

    // ── Collapse on scroll down, expand on scroll up ────────────────────────
    useMotionValueEvent(scrollY, "change", (y) => {
        lastScrollAt.current = performance.now();

        // Ignore rubber-band overscroll at the very top / bottom.
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (y < 0 || y > max) return;

        const delta = y - lastY.current;

        if (y <= SCROLL_THRESHOLD) {
            lastY.current = y;
            setCollapsed(false);
            return;
        }
        if (delta > DOWN_DEADZONE) {
            lastY.current = y;
            setCollapsed(true);
            setPeek(false);
            setMenuOpen(false);
        } else if (delta < -UP_DEADZONE) {
            lastY.current = y;
            setCollapsed(false);
        }
    });

    // ── Outside click closes menu / peek, Escape closes menu ────────────────
    useEffect(() => {
        if (!menuOpen && !peek) return;
        const onPointerDown = (e: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
                setPeek(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen, peek]);

    useEffect(
        () => () => {
            if (leaveTimer.current) clearTimeout(leaveTimer.current);
        },
        []
    );

    // ── Hover handling (mouse only, ignores synthetic post-scroll events) ───
    const clearLeaveTimer = () => {
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        clearLeaveTimer();
        if (!collapsed || peek) return;
        if (performance.now() - lastScrollAt.current < HOVER_SCROLL_GUARD_MS) return;
        if (e.movementX === 0 && e.movementY === 0) return;
        setPeek(true);
    };

    const onPointerLeave = (e: React.PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        setHovered(null);
        clearLeaveTimer();
        leaveTimer.current = setTimeout(() => setPeek(false), LEAVE_DELAY_MS);
    };

    // ── Smooth in-page navigation ───────────────────────────────────────────
    const goTo = useCallback(
        (e: React.MouseEvent, id: NavId) => {
            setMenuOpen(false);
            if (pathname !== "/") return; // let Next route to "/#id"
            e.preventDefault();
            if (id === "home") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            window.history.replaceState(null, "", id === "home" ? "/" : `/#${id}`);
        },
        [pathname]
    );

    return (
        <nav
            ref={navRef}
            aria-label="Primary"
            className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center px-3"
        >
            {/* ── Pill ───────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onFocusCapture={() => collapsed && setPeek(true)}
                style={{
                    width: pillWidth,
                    height: NAV_HEIGHT,
                    borderRadius: NAV_HEIGHT / 2,
                    willChange: "width",
                }}
                className="pointer-events-auto relative border border-border bg-background/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.45)]"
            >
                {/* Scroll progress — clipped to the pill's curve */}
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    style={{ borderRadius: NAV_HEIGHT / 2 }}
                    aria-hidden="true"
                >
                    <motion.div
                        style={{ scaleX: progress }}
                        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-primary/80"
                    />
                </div>

                {/* ── Compact: just the name ─────────────────────────────── */}
                <motion.div
                    role="button"
                    tabIndex={0}
                    aria-label="Expand navigation"
                    onClick={() => setPeek(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setPeek(true);
                    }}
                    style={{
                        opacity: compactOpacity,
                        scale: compactScale,
                        visibility: compactVisibility,
                        borderRadius: NAV_HEIGHT / 2,
                    }}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                    <span className="text-[15px] font-semibold leading-none tracking-tight">
                        {firstName}
                        <span className="text-primary">.</span>
                    </span>
                </motion.div>

                {/* ── Full: fixed width, centered, never reflows ─────────── */}
                <motion.div
                    style={{
                        width: innerWidth,
                        left: "50%",
                        x: "-50%",
                        opacity: fullOpacity,
                        scale: fullScale,
                        visibility: fullVisibility,
                        clipPath: fullClip,
                    }}
                    className="absolute top-0 flex h-full items-center justify-between gap-3 pl-5 pr-2"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={(e) => goTo(e, "home")}
                        aria-label="Back to top"
                        className="shrink-0 rounded-full text-lg font-semibold leading-none tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                        {firstName}
                        <span className="text-primary">.</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-0.5 lg:flex">
                        {NAV_ITEMS.map((item) => {
                            const isActive = active === item.id;
                            const isHighlighted = highlighted === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/#${item.id}`}
                                    onClick={(e) => goTo(e, item.id)}
                                    onPointerEnter={(e) =>
                                        e.pointerType === "mouse" && setHovered(item.id)
                                    }
                                    onFocus={() => setHovered(item.id)}
                                    onBlur={() => setHovered(null)}
                                    aria-current={isActive ? "true" : undefined}
                                    className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                                        isHighlighted
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {isHighlighted && (
                                        <motion.span
                                            layoutId="nav-highlight"
                                            transition={UI_SPRING}
                                            className={`absolute inset-0 rounded-full ${
                                                hovered && hovered !== active
                                                    ? "bg-muted"
                                                    : "bg-primary/10"
                                            }`}
                                        />
                                    )}
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        size={15}
                                        strokeWidth={1.75}
                                        className={`relative z-10 transition-colors duration-150 ${
                                            isActive ? "text-primary" : ""
                                        }`}
                                    />
                                    <span className="relative z-10">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right-side controls */}
                    <div className="flex shrink-0 items-center gap-2 pr-3">
                        <ThemeToggle />
                        <ThemeColorDropdown />
                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 lg:hidden"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={menuOpen ? "close" : "open"}
                                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                                    transition={{ duration: 0.16 }}
                                    className="grid place-items-center"
                                >
                                    <HugeiconsIcon
                                        icon={menuOpen ? Cancel01Icon : Menu01Icon}
                                        size={18}
                                        strokeWidth={1.75}
                                    />
                                </motion.span>
                            </AnimatePresence>
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── Mobile dropdown — sibling of the pill ──────────────────── */}
            <MobileMenu
                open={menuOpen}
                width={expandedWidth}
                active={active}
                onNavigate={goTo}
            />
        </nav>
    );
}