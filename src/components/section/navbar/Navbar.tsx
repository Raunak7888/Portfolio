"use client";

import { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "../../ThemeToggle";
import ThemeColorDropdown from "./AccentChanger";
import Data from "@/Data/Data.json";

/* ===================== CONSTANTS ===================== */

const NAV_WIDTH = "70vw";
const NAV_MAX_WIDTH = 640;
const BEAD_SIZE = 44;
const SCROLL_THRESHOLD = 120;

/* ===================== MOBILE MENU ===================== */

const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.06, duration: 0.25 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
};

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="md:hidden mt-4 p-4 bg-background/95 border border-border
                     rounded-2xl flex flex-col gap-4"
                >
                    {["About", "Skills", "Projects", "Contact"].map((item) => (
                        <motion.a
                            key={item}
                            variants={itemVariants}
                            href={`#${item.toLowerCase()}`}
                            onClick={onClose}
                            className="text-sm font-medium"
                        >
                            {item}
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ===================== NAVBAR ===================== */

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navRef = useRef<HTMLElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    /* ---------- ARRIVAL: BEAD → NAVBAR ---------- */

    useLayoutEffect(() => {
        const pill = pillRef.current;
        const content = contentRef.current;
        if (!pill || !content) return;

        const ctx = gsap.context(() => {
            gsap.set(pill, {
                width: BEAD_SIZE,
                paddingLeft: 0,
                paddingRight: 0,
                borderRadius: 999,
            });

            gsap.set(content, { opacity: 0 });

            gsap.timeline({ delay: 0.15 })
                .to(pill, {
                    width: NAV_WIDTH,
                    maxWidth: NAV_MAX_WIDTH,
                    duration: 0.75,
                    ease: "expo.out",
                    overwrite: "auto",
                })
                .to(
                    content,
                    {
                        opacity: 1,
                        duration: 0.25,
                        ease: "power1.out",
                    },
                    "-=0.2",
                );
        }, navRef);

        return () => ctx.revert();
    }, []);

    /* ---------- SCROLL: EXPAND / COLLAPSE ---------- */

    useLayoutEffect(() => {
        const pill = pillRef.current;
        const content = contentRef.current;
        if (!pill || !content) return;

        let lastScroll = window.scrollY;
        let isCollapsed = false;

        const collapse = gsap.to(pill, {
            width: BEAD_SIZE,
            y: -80,
            duration: 0.35,
            ease: "expo.in",
            paused: true,
            overwrite: "auto",
        });

        const expand = gsap.to(pill, {
            width: NAV_WIDTH,
            maxWidth: NAV_MAX_WIDTH,
            y: 0,
            duration: 0.45,
            ease: "expo.out",
            paused: true,
            overwrite: "auto",
        });

        const fadeOut = gsap.to(content, {
            opacity: 0,
            duration: 0.15,
            paused: true,
        });

        const fadeIn = gsap.to(content, {
            opacity: 1,
            duration: 0.25,
            paused: true,
        });

        const onScroll = () => {
            const current = window.scrollY;
            const scrollingDown = current > lastScroll;

            if (scrollingDown && current > SCROLL_THRESHOLD && !isCollapsed) {
                fadeOut.restart();
                collapse.restart();
                isCollapsed = true;
            }

            if (!scrollingDown && isCollapsed) {
                expand.restart();
                fadeIn.restart();
                isCollapsed = false;
            }

            lastScroll = current;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            {/* MORPH CONTAINER (GSAP OWNS GEOMETRY) */}
            <div
                ref={pillRef}
                className="h-12 bg-background/60 backdrop-blur-xl
                   border border-primary shadow-2xl
                   rounded-full 
                   flex items-center"
                style={{ willChange: "width, transform" }}
            >
                {/* CONTENT (PASSIVE) */}
                <div
                    ref={contentRef}
                    className="w-full px-6 flex items-center justify-between"
                >
                    <div className="text-lg font-bold tracking-tighter">
                        {Data.hero.firstName}
                        <span className="text-primary">.</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {["Home", "About", "Skills", "Projects", "Contact"].map(
                            (item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-xs font-medium uppercase tracking-widest
                           text-muted-foreground hover:text-primary"
                                >
                                    {item}
                                </Link>
                            ),
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <ThemeColorDropdown />
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </nav>
    );
}
