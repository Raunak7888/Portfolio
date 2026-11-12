// Navbar.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
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
    Cancel01Icon,
    ArrowUp01Icon,
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
    { id: "contact", label: "Contact", icon: Mail01Icon },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

const MOBILE_ITEMS = NAV_ITEMS.filter((i) => i.id !== "home");

const NAV_HEIGHT = 48; // px — radius is 50% of this (full pill)
const COMPACT_WIDTH = 196; // px — collapsed pill
const EXPANDED_MAX = 720; // px
const EXPANDED_VW = 0.94;
const SCROLL_THRESHOLD = 80; // px before collapsing
const SCROLL_DEADZONE = 6; // px — ignore tiny scroll jitters

const SPRING: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 28,
    mass: 0.9,
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

        // Near the top of the page, always treat "home" as active.
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
        transition: { ...SPRING, staggerChildren: 0.045, delayChildren: 0.04 },
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
    visible: { opacity: 1, x: 0, transition: SPRING },
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
                                    className={`group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
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
    const spring: Transition = reduceMotion ? { duration: 0 } : SPRING;

    const navRef = useRef<HTMLElement>(null);
    const lastY = useRef(0);

    const [collapsed, setCollapsed] = useState(false);
    const [peek, setPeek] = useState(false); // hover / focus / tap re-expands
    const [menuOpen, setMenuOpen] = useState(false);
    const [hovered, setHovered] = useState<NavId | null>(null);

    const active = useActiveSection();
    const expandedWidth = useExpandedWidth();

    const expanded = !collapsed || peek || menuOpen;
    const highlighted = hovered ?? active;
    const activeItem = NAV_ITEMS.find((i) => i.id === active) ?? NAV_ITEMS[0];

    const firstName = Data.hero.firstName as string;

    // ── Scroll progress line ────────────────────────────────────────────────
    const { scrollY, scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        restDelta: 0.001,
    });

    // ── Collapse on scroll down, expand on scroll up ────────────────────────
    useMotionValueEvent(scrollY, "change", (y) => {
        const delta = y - lastY.current;
        if (Math.abs(delta) < SCROLL_DEADZONE) return;
        lastY.current = y;

        if (y <= SCROLL_THRESHOLD) {
            setCollapsed(false);
        } else if (delta > 0) {
            setCollapsed(true);
            setPeek(false);
            setMenuOpen(false);
        } else {
            setCollapsed(false);
        }
    });

    // ── Close the mobile menu on outside click / Escape ─────────────────────
    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
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
    }, [menuOpen]);

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

    const scrollTop = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav
            ref={navRef}
            aria-label="Primary"
            className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center px-3"
        >
            {/* ── Pill ───────────────────────────────────────────────────── */}
            <motion.div
                initial={{ width: NAV_HEIGHT, opacity: 0, y: -16 }}
                animate={{
                    width: expanded ? expandedWidth : COMPACT_WIDTH,
                    opacity: 1,
                    y: 0,
                }}
                transition={spring}
                onMouseEnter={() => collapsed && setPeek(true)}
                onMouseLeave={() => {
                    setPeek(false);
                    setHovered(null);
                }}
                onFocusCapture={() => collapsed && setPeek(true)}
                style={{ height: NAV_HEIGHT, borderRadius: NAV_HEIGHT / 2 }}
                className="pointer-events-auto relative border border-border bg-background/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.45)]"
            >
                {/* Scroll progress — clipped to the pill's curve */}
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    style={{ borderRadius: NAV_HEIGHT / 2 }}
                    aria-hidden="true"
                >
                    <motion.div
                        style={{ scaleX: progress }}
                        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary/80"
                    />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    {expanded ? (
                        <motion.div
                            key="full"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { delay: 0.1, duration: 0.2 },
                            }}
                            exit={{ opacity: 0, transition: { duration: 0.08 } }}
                            className="flex h-full w-full items-center justify-between gap-3 pl-5 pr-2"
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
                            <div className="hidden items-center gap-0.5 md:flex">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = active === item.id;
                                    const isHighlighted = highlighted === item.id;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/#${item.id}`}
                                            onClick={(e) => goTo(e, item.id)}
                                            onMouseEnter={() => setHovered(item.id)}
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
                                                    transition={spring}
                                                    className={`absolute inset-0 z-0 rounded-full ${
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
                            <div className="flex shrink-0 items-center gap-1">
                                <ThemeToggle />
                                <ThemeColorDropdown />
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen((o) => !o)}
                                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                                    aria-expanded={menuOpen}
                                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:hidden"
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
                    ) : (
                        <motion.div
                            key="compact"
                            role="button"
                            tabIndex={0}
                            aria-label="Expand navigation"
                            onClick={() => setPeek(true)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setPeek(true);
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                transition: { delay: 0.08, duration: 0.18 },
                            }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.08 } }}
                            className="flex h-full w-full cursor-pointer items-center justify-between pl-4 pr-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                            style={{ borderRadius: NAV_HEIGHT / 2 }}
                        >
                            <span className="text-sm font-semibold leading-none tracking-tight">
                                {firstName[0]}
                                <span className="text-primary">.</span>
                            </span>

                            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <HugeiconsIcon
                                    icon={activeItem.icon}
                                    size={15}
                                    strokeWidth={1.75}
                                    className="text-primary"
                                />
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={activeItem.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.14 }}
                                    >
                                        {activeItem.label}
                                    </motion.span>
                                </AnimatePresence>
                            </span>

                            <button
                                type="button"
                                onClick={scrollTop}
                                aria-label="Scroll to top"
                                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                            >
                                <HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
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