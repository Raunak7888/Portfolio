"use client";
import React, { useState, useEffect } from "react";

export const GridBackground = ({ children }: { children: React.ReactNode }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-background text-foreground transition-colors duration-500">
            {/* 1. Static Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none grid-layer opacity-[0.4] dark:opacity-[0.2]" />

            {/* 2. Dynamic Mouse Spotlight */}
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
                }}
            />

            {/* 3. Global Ambient Glow */}
            <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};