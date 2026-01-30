import React from "react";
import Divider from "../Divider";
import { ShieldCheck, Cpu, Map, Terminal, Brain, Layers } from "lucide-react";
import data from "@/Data/Data.json";

// 1. Define Types for your JSON data
interface SegmentData {
    id: string;
    title: string;
    label: string;
    text: string;
}

const AboutSection = () => {
    // 2. Icon Lookup Table: Matches JSON 'id' to the Lucide Component
    const iconMap: Record<string, React.ReactNode> = {
        "01": <ShieldCheck className="w-5 h-5 text-primary" />,
        "02": <Cpu className="w-5 h-5 text-primary" />,
        "03": <Brain className="w-5 h-5 text-primary" />,
        "04": <Map className="w-5 h-5 text-primary" />,
    };

    // 3. Destructure the data from JSON
    const { endingLine, segments } = data.about;

    return (
        <section className="relative w-full min-h-screen flex flex-col text-foreground overflow-hidden">
            {/* Header Area */}
            <div className="w-full px-6 shrink-0">
                <Divider sectionName="About Me" />
            </div>

            {/* Dashboard Container */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-5 lg:pb-10 flex items-center justify-center">
                <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/5">
                    {/* Central Floating Node (Desktop Only) */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-all duration-500" />
                            <div className="relative p-5 rounded-xl bg-background border border-foreground/20 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Terminal className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Map through the JSON segments */}
                    {segments.map((s: SegmentData) => (
                        <div
                            key={s.id}
                            className="group relative p-8 lg:p-14 bg-background hover:bg-white/2 transition-colors duration-500 flex flex-col gap-6"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-primary/60 font-bold border border-primary/20 px-2 py-0.5 rounded">
                                        LVL_{s.id}
                                    </span>
                                    <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold font-jersey uppercase tracking-wide group-hover:text-primary transition-colors">
                                    {s.title}
                                </h3>
                            </div>

                            {/* Status Tag */}
                            <div className="flex items-center gap-3 bg-foreground/5 self-start px-3 py-1.5 rounded-md border border-foreground/10">
                                {iconMap[s.id]}
                                <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-widest">
                                    {s.label}
                                </span>
                            </div>

                            {/* Body Text */}
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-mitr">
                                {s.text}
                            </p>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Layers className="w-4 h-4 text-blue-400/20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technical Footer */}
            <div className="w-full flex items-center justify-end px-6 pb-6">
                <div className="md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/40 pl-4 md:pl-0 md:pr-4">
                    <p className="font-poetsen max-w-xs text-[11px] text-zinc-500 leading-tight">
                        {endingLine}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
