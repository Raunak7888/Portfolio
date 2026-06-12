"use client";
import React from "react";

export const GridBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative min-h-screen w-full bg-background text-foreground">
            {/* Dot grid texture */}
            <div className="fixed inset-0 z-0 pointer-events-none grid-layer" />

            {/* Subtle top gradient to anchor the page */}
            <div className="fixed top-0 left-0 right-0 h-px bg-border z-0 pointer-events-none" />

            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};