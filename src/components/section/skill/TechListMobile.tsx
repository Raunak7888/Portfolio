"use client";

import React, { useState } from "react";
import type { Node } from "@xyflow/react";
import { TECH_TYPE, type TechCategory, type TechNodeData } from "./graph-data";
import { ChevronRight } from "lucide-react";
import { TYPE_STYLES } from "./type-styles";

type Tab = "All" | TechCategory;

export const TechListMobile = ({
    nodes,
    onOpen,
}: {
    nodes: Node<TechNodeData>[];
    onOpen: (TechNode: TechNodeData) => void;
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("All");
    const categories: Tab[] = [
        "All",
        "Language",
        "Framework",
        "Database",
        "Tool",
        "Security",
    ];

    const filteredNodes =
        activeTab === "All"
            ? nodes
            : nodes.filter((n) => n.data.type === activeTab);

    return (
        <div className="flex flex-col gap-6 p-4 lg:hidden">
            {/* 1. Category Scroller */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                            activeTab === cat
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted/50 border-transparent text-muted-foreground"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 2. Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredNodes.map((n, idx) => {
                    const isFeature = idx % 3 === 0;
                    // Extract styles based on the node category
                    const { bg, border, legend } = TYPE_STYLES[n.data.type];

                    return (
                        <button
                            key={n.id}
                            onClick={() => onOpen(n.data)}
                            className={`
                                group relative overflow-hidden rounded-4xl border bg-background p-5 
                                transition-all active:scale-95 text-left h-40
                                ${isFeature ? "col-span-2 " : "col-span-1 max-[440]:col-span-2"}
                                ${border} /* Applied dynamic border class */
                            `}
                        >
                            {/* Ambient Glow using dynamic bg */}
                            <div
                                className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.08] blur-2xl group-hover:opacity-20 transition-opacity ${bg}`}
                            />

                            <div
                                className={`flex ${
                                    isFeature
                                        ? "flex-row items-center gap-6 "
                                        : "min-[440]:flex-col min-[440]:justify-between min-[440]:h-full max-[440]:flex-row max-[440]:items-center max-[440px]:gap-6"
                                }`}
                            >
                                {/* Icon Container using dynamic legend color */}
                                <div
                                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm text-3xl transition-transform group-hover:scale-110"
                                    style={{
                                        color: legend,
                                        border: `2px solid ${legend}`,
                                    }}
                                >
                                    {n.data.icon}
                                </div>

                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                                        {n.data.type}
                                    </span>
                                    {/* Title using dynamic legend color */}
                                    <span
                                        className="text-xl font-black tracking-tight mt-0.5"
                                        style={{ color: legend }}
                                    >
                                        {n.data.label}
                                    </span>
                                </div>

                                {/* Interaction Indicator */}
                                <div
                                    className="ml-auto bg-muted/50 absolute  top-2/3 right-5 p-2 rounded-full text-muted-foreground transition-all group-hover:text-white"
                                    style={{
                                        backgroundColor: `var(--group-hover-bg, transparent)`,
                                    }}
                                >
                                    {/* Using inline style for the hover background logic if Tailwind doesn't support group-hover with hex
                                    <style jsx>{`
                                        button:hover .chevron-bg {
                                            background-color: ${legend};
                                            color: white;
                                        }
                                    `}</style> */}
                                    <div
                                        className={`chevron-bg p-2 rounded-full transition-colors ${bg} not-hover:bg-background text-foreground`}
                                    >
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
