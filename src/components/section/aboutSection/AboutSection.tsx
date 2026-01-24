import React from "react";
import Divider from "../Divider";

const AboutSection = () => {
    const segments = [
        {
            id: "01",
            title: "Core Ethos",
            text: "I think about software as something that has to survive change. Code that works today but becomes fragile tomorrow is a liability, so I prioritize correctness, clarity, and long-term maintainability over short-term convenience.",
        },
        {
            id: "02",
            title: "Architecture",
            text: "My work is primarily backend-focused using Java and Spring, where I spend most of my time designing authentication flows, modeling data, reasoning about concurrency, and shaping APIs that remain predictable under load.",
        },
        {
            id: "03",
            title: "Methodology",
            text: "I learn by building and breaking systems. Instead of memorizing patterns, I try to understand what’s happening underneath, then test those assumptions by implementing and stress-testing small, focused components.",
        },
        {
            id: "04",
            title: "Roadmap",
            text: "Right now, I’m deliberately strengthening my fundamentals in system design, performance, and distributed systems so I can reason confidently about larger, more complex architectures.",
        },
    ];

    return (
        <div className="w-full bg-background px-6">
            <Divider sectionName="About Me" />

            <div className="max-w-5xl mx-auto mt-14">
                <div className="divide-y divide-foreground/50 ">
                    {segments.map((s) => (
                        <div key={s.id} className="py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                
                                {/* Metadata */}
                                <div className="lg:col-span-3">
                                    <div className="sticky top-16 space-y-4">
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-mono text-lg text-blue-500 dark:text-blue-400">
                                                {s.id}
                                            </span>
                                            <h3 className="text-xl font-semibold uppercase font-jersey tracking-wide">
                                                {s.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="lg:col-span-9">
                                    <p className="text-base md:text-base font-mitr leading-relaxed text-zinc-800 dark:text-zinc-200 ">
                                        {s.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Closing Note */}
                
            </div>
            <div className="flex justify-end">
                    <p className="max-w-sm text-right font-poetsen text-[11px] text-zinc-500 leading-relaxed border-r border-blue-500/60 pr-4">
                        Engineered for long-term stability, predictable behavior,
                        and human readability under change.
                    </p>
                </div>
        </div>
    );
};

export default AboutSection;
