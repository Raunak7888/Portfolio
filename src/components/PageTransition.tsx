"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import data from "@/Data/Data.json";

/** Shutter wipe on route changes only. Skipped for reduced motion and first load. */
export default function PageTransition() {
    const pathname = usePathname();
    const reduce = useReducedMotion();
    const previous = useRef(pathname);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (previous.current === pathname) return;
        previous.current = pathname;
        if (reduce) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(true);
        const timeout = window.setTimeout(() => setIsVisible(false), 400);
        return () => window.clearTimeout(timeout);
    }, [pathname, reduce]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="shutter"
                    aria-hidden
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                    style={{ originY: 0 }}
                    className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-primary"
                >
                    <div className="text-[60vh] font-black italic tracking-tighter text-primary-foreground">
                        {data.hero.firstName[0]}.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
