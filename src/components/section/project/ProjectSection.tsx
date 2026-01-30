import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, Shield, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import Divider from "../Divider";
import projectData from "@/Data/Data.json";

interface Project {
    id: string;
    title: string;
    category: string;
    badge: string;
    accent: string;
    iconKey: string;
    highlights: string[];
    description: string;
    tech: string[];
    link: string;
    github: string;
    images: string[];
}

const iconMap: Record<string, React.ReactNode> = {
    globe: <Globe size={20} />,
    shield: <Shield size={20} />,
    zap: <Zap size={20} />,
};

const ProjectCard: React.FC<{
    project: Project;
    isEven: boolean;
    cardRef: (el: HTMLDivElement | null) => void;
}> = ({ project, isEven, cardRef }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
   
    const nextSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentIndex((prev) =>
            prev === project.images.length - 1 ? 0 : prev + 1,
        );
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentIndex((prev) =>
            prev === 0 ? project.images.length - 1 : prev - 1,
        );
    };

    return (
        <div
            ref={cardRef}
            className="project-card absolute inset-0 flex items-center justify-center px-4 lg:px-20 will-change-transform"
        >
            {/* Main Card Container */}
            <div
                className={`relative flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center w-full max-w-7xl bg-background/5 backdrop-blur-2xl p-6 lg:p-12 rounded-[3.5rem] border border-foreground/10 overflow-hidden`}
            >
                {/* Decorative Background Glow */}
                <div
                    className="absolute -top-24 -left-24 w-96 h-96 opacity-20 blur-[120px] rounded-full pointer-events-none"
                    style={{ backgroundColor: project.accent }}
                />

                {/* Visual Side: Interactive Carousel */}
                <div className="w-full lg:w-3/5 relative group">
                    <div className="relative aspect-16/10 overflow-hidden rounded-4xl border border-foreground/5 shadow-2xl bg-background/20">
                        {project.images.map((img, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"}`}
                            >
                                <Image
                                    src={img}
                                    alt={`${project.title} screenshot`}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />
                            </div>
                        ))}

                        {/* Carousel Navigation */}
                        {project.images.length > 1 && (
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={prevSlide}
                                    className="p-3 rounded-2xl bg-background/50 backdrop-blur-md text-foreground hover:bg-foreground/20 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="p-3 rounded-2xl bg-background/50 backdrop-blur-md text-foreground hover:bg-foreground/20 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* Image Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                            {project.images.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? "w-8" : "w-2 bg-white/30"}`}
                                    style={{
                                        backgroundColor:
                                            i === currentIndex
                                                ? project.accent
                                                : "",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Project Floating Badge */}
                    <div className="absolute -top-4 -right-4 bg-white dark:bg-zinc-800 shadow-2xl px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/10 z-40 transform group-hover:-translate-y-1 transition-transform">
                        <span
                            className="p-1.5 rounded-lg bg-foreground/5"
                            style={{ color: project.accent }}
                        >
                            {iconMap[project.iconKey]}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/80">
                            {project.badge}
                        </span>
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-2/5 flex flex-col z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span
                            className="font-mono text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 border border-white/10"
                            style={{ color: project.accent }}
                        >
                            {project.category}
                        </span>
                    </div>

                    <h3 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter text-foreground leading-[0.9]">
                        {project.title}
                    </h3>

                    <p className="text-foreground/70 text-lg mb-8 leading-relaxed font-medium">
                        {project.description}
                    </p>

                    {/* Highlights List */}
                    <div className="space-y-3 mb-8">
                        {project.highlights.map((highlight, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 group/item"
                            >
                                <div
                                    className="h-1 w-1 rounded-full transition-all group-hover/item:scale-150"
                                    style={{ backgroundColor: project.accent }}
                                />
                                <span className="text-sm font-semibold text-foreground/80 tracking-wide">
                                    {highlight}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {project.tech.map((t) => (
                            <span
                                key={t}
                                className="text-[10px] font-bold font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-foreground/60 hover:border-white/30 transition-colors"
                            >
                                {t.toUpperCase()}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Link
                            href={project.github}
                            className="flex-1 flex items-center justify-center gap-2 font-bold p-4 rounded-2xl border border-foreground/10 hover:bg-foreground hover:text-background transition-all active:scale-95"
                        >
                            <FaGithub size={20} /> Source
                        </Link>
                        <Link
                            href={project.link}
                            style={{ backgroundColor: project.accent }}
                            className="flex-[1.5] flex items-center justify-center gap-2 text-white p-4 rounded-2xl font-bold hover:brightness-110 shadow-lg shadow-black/20 transition-all active:scale-95"
                        >
                            Live Preview <ExternalLink size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectSection: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = cardsRef.current;

            // Initial State: Position all cards except the first one off-screen
            gsap.set(cards.slice(1), { yPercent: 100, opacity: 0, scale: 0.9 });

            // Create the ScrollTrigger Master Timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${cards.length * 100}%`, // Dynamic scroll length based on project count
                    pin: true,
                    scrub: 1, // Smoothly tracks the scrollbar
                    anticipatePin: 1,
                },
            });

            cards.forEach((card, index) => {
                if (index === 0) return; // Skip first card

                // Previous card scales down and fades slightly
                tl.to(
                    cards[index - 1],
                    {
                        scale: 0.85,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.inOut",
                    },
                    index - 0.5,
                );

                // Current card slides up
                tl.to(
                    card,
                    {
                        yPercent: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: "power2.out",
                    },
                    index - 0.5,
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative h-screen w-full overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full z-50 ">
                <Divider sectionName="Projects" />
            </div>

            {/* Background Aesthetic Elements */}
            <div className="absolute top-0  left-1/4 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div ref={containerRef} className="relative h-full w-full top-10">
                {projectData.projects.map((project, index) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isEven={index % 2 === 0}
                        cardRef={(el: HTMLDivElement | null) =>
                            (cardsRef.current[index] = el)
                        }
                    />
                ))}
            </div>
        </section>
    );
};

export default ProjectSection;
