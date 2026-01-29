"use client";

import React from "react";
import { X, Layers, Bug, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type TechCategory } from "./graph-data";
import { TYPE_STYLES } from "./type-styles";

interface SkillModalProps {
    title: string;
    category: TechCategory;
    icon: React.ReactNode;
    scalability: string;
    debuggability: string;
    consistency: string;
    description: string;
    isOpen: boolean;
    onClose: () => void;
}

const SkillModal: React.FC<SkillModalProps> = ({
    title,
    category,
    icon,
    scalability,
    debuggability,
    consistency,
    description,
    isOpen,
    onClose,
}) => {
    const color = TYPE_STYLES[category]?.legend || "#ffffff";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Animation */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80"
                    />

                    {/* Modal Card Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="relative w-full max-w-sm bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header Section */}
                        <div className="relative h-32 flex items-center justify-center overflow-hidden border-b border-border/50 bg-linear-to-b from-primary/5 to-transparent">
                            <div
                                className="absolute inset-0 opacity-20 blur-3xl scale-150"
                                style={{ backgroundColor: color }}
                            />
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="relative text-6xl drop-shadow-2xl transition-transform duration-500 hover:scale-110"
                            >
                                <div style={{ color: color }}>{icon}</div>
                            </motion.div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all z-10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-1 text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                                    {category}
                                </span>
                                <h2
                                    className="text-3xl font-black text-foreground tracking-tighter italic"
                                    style={{ color: color }}
                                >
                                    {title}
                                    <span style={{ color }}>_</span>
                                </h2>
                            </div>

                            <div className="relative px-2">
                                <p className="text-xs leading-relaxed text-muted-foreground font-medium border-l-2 border-primary/20 pl-4">
                                    {description}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        label: "Scalability",
                                        icon: <Layers size={12} />,
                                        value: scalability,
                                    },
                                    {
                                        label: "Debuggability",
                                        icon: <Bug size={12} />,
                                        value: debuggability,
                                    },
                                    {
                                        label: "Consistency",
                                        icon: <Repeat size={12} />,
                                        value: consistency,
                                    },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.05 }}
                                        className="bg-foreground/3 border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all hover:bg-foreground/5"
                                    >
                                        <div
                                            className="opacity-80"
                                            style={{ color }}
                                        >
                                            {stat.icon}
                                        </div>
                                        <div className="text-[10px] font-black text-foreground tracking-tight">
                                            {stat.value}
                                        </div>
                                        <div className="text-[7px] uppercase tracking-widest text-muted-foreground font-bold">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="group relative w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95"
                            >
                                <div
                                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="absolute inset-0 border border-border rounded-xl group-hover:border-primary/50 transition-colors" />
                                <span className="relative text-muted-foreground group-hover:text-foreground transition-colors">
                                    Initialize Exit
                                </span>
                            </button>
                        </div>

                        {/* Bottom Shimmer */}
                        <div className="h-1 w-full bg-foreground/5 relative overflow-hidden">
                            <motion.div
                                animate={{ x: ["-100%", "300%"] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2.5,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 w-1/3"
                                style={{
                                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SkillModal;
