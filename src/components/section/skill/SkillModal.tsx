"use client";

import React, { useLayoutEffect, useRef } from "react";
import { X, Layers, Bug, Repeat, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
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
    const textRef = useRef<HTMLParagraphElement>(null);
    const style = TYPE_STYLES[category] || { legend: "#3b82f6" };
    const color = style.legend;

    useLayoutEffect(() => {
        if (isOpen && textRef.current) {
            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: 0.3,
                },
            );
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="relative w-full max-w-2xl bg-background rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-t sm:border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar"
                    >
                        <div className="flex flex-col md:flex-row min-h-full">
                            {/* Visual Side (Top on mobile, Left on Desktop) */}
                            <div
                                className="relative w-full md:w-5/12 h-48 md:h-auto flex items-center justify-center p-8 overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${color}15, ${color}30)`,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.5, 0.3],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                    }}
                                    className="absolute inset-0 blur-[60px]"
                                    style={{ backgroundColor: color }}
                                />

                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 2.5, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative z-10"
                                    style={{ color: color }}
                                >
                                    {icon}
                                </motion.div>

                                {/* Mobile Close Handle */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-background/20 rounded-full md:hidden" />
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 p-6 sm:p-10 md:p-12 flex flex-col">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">
                                            {category}
                                        </p>
                                        <h2
                                            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                                            style={{
                                                color: color,
                                            }}
                                        >
                                            {title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full bg-background text-foreground/80 hidden sm:block hover:scale-110 transition-transform"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Description */}
                                <p
                                    ref={textRef}
                                    className="text-base sm:text-lg text-foreground/50 leading-relaxed mb-8"
                                >
                                    {description}
                                </p>

                                {/* Stats Grid - Now stacks on tiny screens */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                    {[
                                        {
                                            label: "Scalability",
                                            val: scalability,
                                            icon: <Layers size={14} />,
                                        },
                                        {
                                            label: "Debuggability",
                                            val: debuggability,
                                            icon: <Bug size={14} />,
                                        },
                                        {
                                            label: "Consistency",
                                            val: consistency,
                                            icon: <Repeat size={14} />,
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex sm:flex-col items-center sm:justify-center justify-between p-4 rounded-2xl border border-foregound gap-2"
                                        >
                                            <div
                                                className="flex items-center gap-2"
                                                style={{
                                                    color: color,
                                                }}
                                            >
                                                {item.icon}
                                                <span className="text-[10px] font-bold uppercase tracking-wider sm:hidden">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className="text-right sm:text-center">
                                                <div className="text-sm font-bold text-fore">
                                                    {item.val}
                                                </div>
                                                <div className="text-[8px] font-bold text-foreground uppercase tracking-widest hidden sm:block">
                                                    {item.label}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="w-full sm:w-auto mt-auto py-4 sm:py-0 flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-foreground group"
                                >
                                    Dismiss{" "}
                                    <ArrowRight
                                        size={18}
                                        style={{ color }}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SkillModal;
