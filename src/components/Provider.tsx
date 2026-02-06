"use client";

import { ThemeProvider } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Toaster } from "@/components/ui/sonner";
import { ThemeTransitionLayer } from "@/components/ThemeTransitionLayer";
import Navbar from "./section/navbar/Navbar";
import PageTransition from "./PageTransition";

export function Providers({ children }: { children: React.ReactNode }) {
    const mounted = useMounted();
    if (!mounted) return <>{children}</>;

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <Navbar />
            <ThemeTransitionLayer />
            <PageTransition />
            {children}
            <Toaster richColors />
        </ThemeProvider>
    );
}
