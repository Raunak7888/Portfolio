"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { Home, AlertTriangle, Terminal } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 overflow-hidden relative">
            
            {/* 1. Background Cinematic Elements */}
            <div className="absolute inset-0 z-0">
                {/* Scanning lines effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] pointer-events-none" />
                
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]" />
            </div>
            <div className="relative z-10 max-w-md w-full text-center">
                
                {/* 2. Glitchy 404 Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative inline-block"
                >
                    <motion.p 
                        animate={{ 
                            textShadow: [
                                "2px 0px rgba(255,0,0,0.5)", 
                                "-2px 0px rgba(0,0,255,0.5)", 
                                "2px 0px rgba(255,0,0,0.5)"
                            ] 
                        }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                        className="text-9xl font-black text-primary tracking-tighter"
                    >
                        404
                    </motion.p>
                    
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute -bottom-2 left-0 h-1 bg-primary/30"
                    />
                </motion.div>
                {/* 3. Terminal-style Error Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 space-y-2"
                >
                    <div className="flex items-center justify-center gap-2 text-primary/60 font-mono text-xs uppercase tracking-[0.3em]">
                        <AlertTriangle size={12} />
                        <span>Critical Error: Page_Not_Found</span>
                    </div>
                    
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Lost in the Matrix.
                    </h1>
                    <p className="mt-6 text-base leading-7 text-foreground/60 font-medium">
                        The coordinate <span className="text-primary/80 font-mono">&quot;{`{unknown_route}`}&quot;</span> 
                        does not exist in our current database. It may have been purged or relocated.
                    </p>
                </motion.div>
                {/* 4. Interactive Action Buttons */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/"
                        className="group relative flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                    >
                        <Home size={16} />
                        <span>Return to Base</span>
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:animate-pulse group-hover:opacity-100" />
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors border border-foreground/10 rounded-full hover:bg-foreground/5"
                    >
                        <Terminal size={16} />
                        <span>Trace Back</span>
                    </button>
                </motion.div>
                {/* 5. Decorative Footer HUD */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1.2 }}
                    className="mt-20 pt-8 border-t border-foreground/5 flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-foreground/40"
                >
                    <span>ID: NULL_PTR_0x44</span>
                    <span className="animate-pulse">System: Active</span>
                    <span>Loc: Unknown</span>
                </motion.div>
            </div>
        </div>
    );
}