import Link from "next/link";
import React from "react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="max-center max-w-md text-center">
                {/* Visual Cue */}
                <p className="text-6xl font-extrabold text-primary">404</p>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground/50 sm:text-5xl">
                    Page not found
                </h1>

                <p className="mt-6 text-base leading-7 text-foreground">
                    Sorry, we couldn’t find the page you’re looking for. Perhaps
                    you typed the wrong URL or the page has moved.
                </p>

                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-primary/70 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        </div>
    );
}
