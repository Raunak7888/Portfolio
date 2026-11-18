"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <p className="ds-eyebrow text-primary">Something broke</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                That did not <span className="ds-serif text-primary">go to plan.</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform active:scale-95"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:border-foreground"
                >
                    Back home
                </Link>
            </div>
        </div>
    );
}
