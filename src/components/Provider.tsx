"use client";

import { ThemeProvider } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Toaster } from "@/components/ui/sonner"


export function Providers({ children }: { children: React.ReactNode }) {
    const mounted = useMounted();

    // Prevents hydration mismatch by waiting until mounted
    if (!mounted) return <>{children}</>;

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
        >
            {children}
            <Toaster richColors/>
        </ThemeProvider>
    );
}
