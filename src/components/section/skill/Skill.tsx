"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Divider from "../Divider";
import data from "@/Data/Data.json";
import * as Si from "react-icons/si";
import * as Fa from "react-icons/fa";
import * as Tb from "react-icons/tb";
import type { IconType } from "react-icons";
import { X, Layers, Zap, Star } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Skill {
    id: string;
    type: string;
    data: {
        label: string;
        icon_id: string;
        category: string;
        scalability: string;
        debuggability: string;
        consistency: string;
        description: string;
        featured?: boolean;
    };
}

// ─── Icon resolution ────────────────────────────────────────────────────────

const iconLibraries: Record<string, Record<string, IconType>> = {
    Si: Si as unknown as Record<string, IconType>,
    Fa: Fa as unknown as Record<string, IconType>,
    Tb: Tb as unknown as Record<string, IconType>,
};

function resolveIcon(iconId: string): IconType | null {
    for (const lib of Object.values(iconLibraries)) {
        if (lib[iconId]) return lib[iconId];
    }
    return null;
}

// ─── Design tokens ──────────────────────────────────────────────────────────

const ratingValue: Record<string, number> = {
    "Very High": 4,
    High: 3,
    Moderate: 2,
    Low: 1,
};

const categoryTokens: Record<
    string,
    { text: string; glow: string; bar: string; dot: string; badge: string }
> = {
    Language: {
        text: "text-sky-400",
        glow: "hover:shadow-[0_0_24px_-4px_rgba(56,189,248,0.25)]",
        bar: "bg-sky-400",
        dot: "bg-sky-400",
        badge: "bg-sky-400/10 text-sky-400 border-sky-400/20",
    },
    Framework: {
        text: "text-violet-400",
        glow: "hover:shadow-[0_0_24px_-4px_rgba(167,139,250,0.25)]",
        bar: "bg-violet-400",
        dot: "bg-violet-400",
        badge: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    },
    Database: {
        text: "text-emerald-400",
        glow: "hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]",
        bar: "bg-emerald-400",
        dot: "bg-emerald-400",
        badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    },
    Tool: {
        text: "text-amber-400",
        glow: "hover:shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]",
        bar: "bg-amber-400",
        dot: "bg-amber-400",
        badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    },
    Security: {
        text: "text-rose-400",
        glow: "hover:shadow-[0_0_24px_-4px_rgba(251,113,133,0.25)]",
        bar: "bg-rose-400",
        dot: "bg-rose-400",
        badge: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    },
};

const fallbackToken = {
    text: "text-muted-foreground",
    glow: "",
    bar: "bg-muted-foreground",
    dot: "bg-muted-foreground",
    badge: "bg-muted/20 text-muted-foreground border-border",
};

function getToken(category: string) {
    return categoryTokens[category] ?? fallbackToken;
}

// ─── Tier label ──────────────────────────────────────────────────────────────

const tierLabel: Record<string, { label: string; pips: number }> = {
    "Very High": { label: "Expert", pips: 4 },
    High: { label: "Proficient", pips: 3 },
    Moderate: { label: "Familiar", pips: 2 },
    Low: { label: "Learning", pips: 1 },
};

function overallTier(skill: Skill["data"]): { label: string; pips: number } {
    const avg =
        (ratingValue[skill.scalability] ?? 0) +
        (ratingValue[skill.debuggability] ?? 0) +
        (ratingValue[skill.consistency] ?? 0);
    const r = Math.round(avg / 3);
    const key =
        Object.entries(ratingValue).find(([, v]) => v === r)?.[0] ?? "Moderate";
    return tierLabel[key] ?? { label: "Familiar", pips: 2 };
}

// ─── Pip indicator ────────────────────────────────────────────────────────────

const PipRow: React.FC<{ pips: number; dotClass: string }> = ({
    pips,
    dotClass,
}) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
            <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i <= pips ? dotClass : "bg-border"}`}
            />
        ))}
    </div>
);

// ─── Metric row (modal) ───────────────────────────────────────────────────────

const MetricRow: React.FC<{
    label: string;
    value: number;
    barClass: string;
}> = ({ label, value, barClass }) => (
    <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-24 shrink-0">
            {label}
        </span>
        <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i <= value ? barClass : "bg-border"}`}
                />
            ))}
        </div>
        <span className="font-mono text-[10px] text-muted-foreground w-16 text-right shrink-0">
            {Object.entries(ratingValue).find(([, v]) => v === value)?.[0] ??
                "—"}
        </span>
    </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

const SkillModal: React.FC<{ skill: Skill; onClose: () => void }> = ({
    skill,
    onClose,
}) => {
    const Icon = resolveIcon(skill.data.icon_id);
    const token = getToken(skill.data.category);
    const tier = overallTier(skill.data);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
            >
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                <motion.div
                    className="relative z-10 w-full max-w-sm border border-border bg-card/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Top gradient rule */}
                    <div
                        className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, hsl(var(--border) / 0.8), transparent)",
                        }}
                    />

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-4 mb-5">
                        <div
                            className={`flex h-12 w-12 items-center justify-center border border-border bg-muted rounded-xl ${token.text}`}
                        >
                            {Icon ? <Icon size={24} /> : null}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground leading-none mb-2">
                                {skill.data.label}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-full ${token.badge}`}
                                >
                                    {skill.data.category}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                    {tier.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border mb-5" />

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {skill.data.description}
                    </p>

                    <div className="flex flex-col gap-3">
                        <MetricRow
                            label="Scalability"
                            value={ratingValue[skill.data.scalability] ?? 0}
                            barClass={token.bar}
                        />
                        <MetricRow
                            label="Debug"
                            value={ratingValue[skill.data.debuggability] ?? 0}
                            barClass={token.bar}
                        />
                        <MetricRow
                            label="Consistency"
                            value={ratingValue[skill.data.consistency] ?? 0}
                            barClass={token.bar}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ─── Featured card (wide) ─────────────────────────────────────────────────────

const FeaturedCard: React.FC<{ skill: Skill; onClick: () => void }> = ({
    skill,
    onClick,
}) => {
    const Icon = resolveIcon(skill.data.icon_id);
    const token = getToken(skill.data.category);
    const tier = overallTier(skill.data);

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -3 }}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex flex-col justify-between w-full h-full min-h-[160px] border border-border bg-card hover:bg-card/80 rounded-2xl p-5 text-left cursor-pointer overflow-hidden transition-all duration-200 ${token.glow}`}
        >
            {/* Ambient corner glow */}
            <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-2xl"
                style={{
                    background: `var(--glow-color, transparent)`,
                }}
            />

            <div className="flex items-start justify-between mb-4">
                <div
                    className={`flex h-11 w-11 items-center justify-center border border-border bg-muted rounded-xl ${token.text} group-hover:scale-105 transition-transform duration-200`}
                >
                    {Icon ? <Icon size={22} /> : null}
                </div>
                <span
                    className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-full ${token.badge}`}
                >
                    {skill.data.category}
                </span>
            </div>

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-foreground">
                        {skill.data.label}
                    </span>
                    <PipRow pips={tier.pips} dotClass={token.dot} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {skill.data.description}
                </p>
            </div>

            {/* Bottom gradient rule */}
            <div
                className="absolute inset-x-0 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(90deg, transparent, ${
                        {
                            Language: "rgba(56,189,248,0.5)",
                            Framework: "rgba(167,139,250,0.5)",
                            Database: "rgba(52,211,153,0.5)",
                            Tool: "rgba(251,191,36,0.5)",
                            Security: "rgba(251,113,133,0.5)",
                        }[skill.data.category] ?? "hsl(var(--border))"
                    }, transparent)`,
                }}
            />
        </motion.button>
    );
};

// ─── Compact card ─────────────────────────────────────────────────────────────

const CompactCard: React.FC<{
    skill: Skill;
    onClick: () => void;
    delay?: number;
}> = ({ skill, onClick, delay = 0 }) => {
    const Icon = resolveIcon(skill.data.icon_id);
    const token = getToken(skill.data.category);
    const tier = overallTier(skill.data);

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -2 }}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
            className={`group flex flex-col items-center gap-2.5 w-fit border border-border bg-card hover:bg-card/80 rounded-xl p-4 text-center w-full cursor-pointer transition-all duration-150 ${token.glow}`}
        >
            <div
                className={`flex h-9 w-9 items-center justify-center border border-border bg-muted rounded-lg ${token.text} group-hover:scale-110 transition-transform duration-150`}
            >
                {Icon ? <Icon size={18} /> : null}
            </div>
            <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-foreground leading-tight block">
                    {skill.data.label}
                </span>
            </div>
        </motion.button>
    );
};

// ─── Category group ───────────────────────────────────────────────────────────

const CategoryGroup: React.FC<{
    category: string;
    skills: Skill[];
    onSelect: (s: Skill) => void;
}> = ({ category, skills, onSelect }) => {
    const token = getToken(category);
    const featured = skills.filter((s) => s.data.featured);
    const rest = skills.filter((s) => !s.data.featured);

    return (
        <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
        >
            {/* Category header */}
            <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${token.dot}`} />
                <span
                    className={`font-mono text-[11px] uppercase tracking-widest ${token.text}`}
                >
                    {category}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground">
                    {skills.length} {skills.length === 1 ? "skill" : "skills"}
                </span>
            </div>

            {/* Featured row */}
            {featured.length > 0 && (
                <div
                    className={`grid gap-3 ${
                        featured.length === 1
                            ? "grid-cols-1"
                            : featured.length === 2
                              ? "grid-cols-1 sm:grid-cols-2"
                              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                >
                    {featured.map((s) => (
                        <FeaturedCard
                            key={s.id}
                            skill={s}
                            onClick={() => onSelect(s)}
                        />
                    ))}
                </div>
            )}

            {/* Compact grid */}
            {rest.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {rest.map((s, i) => (
                        <CompactCard
                            key={s.id}
                            skill={s}
                            onClick={() => onSelect(s)}
                            delay={i * 0.03}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ─── Filter pills ─────────────────────────────────────────────────────────────

const FilterPills: React.FC<{
    filters: string[];
    active: string;
    onChange: (f: string) => void;
}> = ({ filters, active, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
            <button
                key={f}
                onClick={() => onChange(f)}
                className={`relative px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-widest border rounded-full transition-all duration-150 ${
                    active === f
                        ? "border-foreground/40 text-foreground bg-card"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground/70"
                }`}
            >
                {active === f && (
                    <motion.span
                        layoutId="filter-indicator"
                        className="absolute inset-0 rounded-full bg-foreground/5"
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                )}
                <span className="relative">{f}</span>
            </button>
        ))}
    </div>
);

// ─── Stats bar ────────────────────────────────────────────────────────────────

const StatsBar: React.FC<{ skills: Skill[] }> = ({ skills }) => {
    const expertCount = skills.filter((s) => {
        const avg =
            (ratingValue[s.data.scalability] ?? 0) +
            (ratingValue[s.data.debuggability] ?? 0) +
            (ratingValue[s.data.consistency] ?? 0);
        return Math.round(avg / 3) >= 4;
    }).length;

    const categories = [...new Set(skills.map((s) => s.data.category))].length;

    return (
        <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-6 mb-10"
        >
            {[
                { icon: Layers, label: "Technologies", value: skills.length },
                { icon: Star, label: "Expert-level", value: expertCount },
                { icon: Zap, label: "Categories", value: categories },
            ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center border border-border bg-card rounded-lg text-muted-foreground">
                        <Icon size={14} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground leading-none mb-0.5">
                            {value}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            {label}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

// ─── Section ──────────────────────────────────────────────────────────────────

const SkillSection: React.FC = () => {
    const skills = data.skills.skills as Skill[];
    const types = data.skills.tech_types as string[];
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [selected, setSelected] = useState<Skill | null>(null);

    const filters = ["All", ...types];

    const filteredSkills =
        activeFilter === "All"
            ? skills
            : skills.filter((s) => s.data.category === activeFilter);

    // Group by category, preserving order from types array
    const categoryOrder = types;
    const grouped: Record<string, Skill[]> = {};
    for (const s of filteredSkills) {
        if (!grouped[s.data.category]) grouped[s.data.category] = [];
        grouped[s.data.category].push(s);
    }
    const orderedCategories =
        activeFilter === "All"
            ? categoryOrder.filter((c) => grouped[c]?.length)
            : [activeFilter];

    return (
        <section className="py-0 min-h-screen">
            <Divider sectionName="Skills" />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pb-10">
                {/* Section headline */}
                <motion.div
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 16 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-5"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                        Tools I Use
                    </h2>
                </motion.div>


                {/* Filters */}
                <div className="mb-4 pb-6">
                    <FilterPills
                        filters={filters}
                        active={activeFilter}
                        onChange={setActiveFilter}
                    />
                </div>

                {/* Grouped content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-12"
                    >
                        {orderedCategories.map((category) =>
                            grouped[category] ? (
                                <CategoryGroup
                                    key={category}
                                    category={category}
                                    skills={grouped[category]}
                                    onSelect={setSelected}
                                />
                            ) : null,
                        )}
                    </motion.div>
                </AnimatePresence>

                <p className="mt-8 text-[11px] font-mono text-muted-foreground tracking-wide">
                    Click any card to inspect metrics
                </p>
            </div>

            {selected && (
                <SkillModal
                    skill={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </section>
    );
};

export default SkillSection;
