"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Toaster } from "@/components/ui/sonner";

import PageTransition from "./PageTransition";
import Navbar from "./section/navbar/Navbar";

/**
 * The provider tree is stable from the first render. Only browser-only
 * pieces wait for mount, so the page never remounts.
 * MotionConfig makes every Framer animation respect reduced-motion.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const mounted = useMounted();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <MotionConfig reducedMotion="user">
                <a href="#main" className="ds-skip">
                    Skip to content
                </a>

                {mounted && <Navbar />}
                {mounted && <PageTransition />}
                <main id="main" tabIndex={-1} className="outline-none">
                    {children}
                </main>
                <Toaster richColors />
            </MotionConfig>
        </ThemeProvider>
    );
}
