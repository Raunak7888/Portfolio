"use client";

import React, { useState } from "react";
import type { Node } from "@xyflow/react";
import { type TechCategory, type TechNodeData } from "./graph-data";
import { ChevronRight } from "lucide-react";
import { TYPE_STYLES } from "./type-styles";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Tab = "All" | TechCategory;

export const TechListMobile = ({
    nodes,
    onOpen,
}: {
    nodes: Node<TechNodeData>[];
    onOpen: (TechNode: TechNodeData) => void;
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("All");

    const categories: Tab[] = ["All", "Language", "Framework", "Database", "Tool", "Security"];

    const filteredNodes = activeTab === "All"
        ? nodes
        : nodes.filter((n) => n.data.type === activeTab);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 30, 
            scale: 0.9 
        },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 120, 
                damping: 20 
            },
        },
    };

    return (
        <div className="flex flex-col gap-4 p-4 lg:hidden overflow-hidden   ">
            {/* Category Scroller */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
                            activeTab === cat
                                ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-background border-foreground/10 text-foreground/50"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Bento Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }} 
                className="grid grid-cols-2 gap-3"
            >
                <AnimatePresence mode="popLayout">
                    {filteredNodes.map((n, idx) => {
                        const isFeature = idx % 3 === 0;
                        const { legend } = TYPE_STYLES[n.data.type as keyof typeof TYPE_STYLES] || TYPE_STYLES.Tool;

                        return (
                            <motion.button
                                key={n.id}
                                layout
                                variants={itemVariants}
                                onClick={() => onOpen(n.data)}
                                className={`
                                    group relative overflow-hidden rounded-3xl border bg-background p-4 
                                    transition-all active:scale-95 text-left h-28 border-foreground/10
                                    ${isFeature ? "col-span-2 h-32" : "col-span-1"}
                                `}
                            >
                                <div
                                    className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.05] blur-2xl transition-opacity group-hover:opacity-20"
                                    style={{ backgroundColor: legend }}
                                />

                                <div className={`flex h-full relative z-10 ${isFeature ? "flex-row items-center gap-4" : "flex-col justify-between"}`}>
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border shadow-sm text-xl transition-transform group-hover:scale-110"
                                        style={{
                                            color: legend,
                                            borderColor: `${legend}33`,
                                            backgroundColor: `${legend}10`,
                                        }}
                                    >
                                        {n.data.icon}
                                    </div>

                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                            {n.data.type}
                                        </span>
                                        <span className="text-base font-bold tracking-tight truncate text-foreground">
                                            {n.data.label}
                                        </span>
                                    </div>

                                    <div
                                        className={`
                                        absolute bottom-0 right-0 p-1.5 rounded-full border border-foreground/5 transition-all
                                        ${isFeature ? "top-1/2 -translate-y-1/2 bottom-auto" : ""}
                                        bg-background text-foreground/30 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary
                                    `}
                                    >
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};