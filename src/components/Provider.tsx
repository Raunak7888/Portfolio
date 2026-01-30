"use client";

import { ThemeProvider } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Toaster } from "@/components/ui/sonner";
import { ThemeTransitionLayer } from "@/components/ThemeTransitionLayer";

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
            <ThemeTransitionLayer />
            {children}
            <Toaster richColors />
        </ThemeProvider>
    );
}
