import React, { useState } from "react";
import {
    ExternalLink,
    Shield,
    Zap,
    Globe,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Divider from "../Divider";
import Image from "next/image";
import Link from "next/link";
import projectData from "@/Data/Data.json";

// 1. Refined Interface for JSON Data
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

// 2. Icon Mapping Dictionary
const iconMap: Record<string, React.ReactNode> = {
    globe: <Globe size={20} />,
    shield: <Shield size={20} />,
    zap: <Zap size={20} />,
};

interface ProjectCardProps {
    project: Project;
    isEven: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isEven }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === project.images.length - 1 ? 0 : prev + 1,
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? project.images.length - 1 : prev - 1,
        );
    };

    return (
        <div
            className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 lg:gap-24 items-start`}
        >
            {/* Visual Side (Carousel) */}
            <div className="w-full lg:w-1/2 group relative top-12">
                <div
                    className="absolute -inset-4 rounded-[2.5rem] -z-10 transition-transform duration-500 group-hover:scale-105 opacity-10"
                    style={{ backgroundColor: project.accent }}
                />

                <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-2xl border border-foreground/10 bg-foreground/5">
                    {project.images.length > 1 && (
                        <div className="absolute inset-0 z-20 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background shadow-lg pointer-events-auto transition-all active:scale-90"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background shadow-lg pointer-events-auto transition-all active:scale-90"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}

                    <div
                        className="flex h-full transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {project.images.map((img, i) => (
                            <div key={i} className="relative min-w-full h-full">
                                <Image
                                    src={img}
                                    alt={`${project.title} slide ${i}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        ))}
                    </div>

                    {project.images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {project.images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-6" : "w-1.5"}`}
                                    style={{
                                        backgroundColor:
                                            currentIndex === i
                                                ? project.accent
                                                : "rgba(255,255,255,0.4)",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="absolute -top-4 -right-4 bg-background shadow-xl px-4 py-2 rounded-full flex items-center gap-2 border border-foreground/20 backdrop-blur-md z-30">
                    <span style={{ color: project.accent }}>
                        {iconMap[project.iconKey]}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                        {project.badge}
                    </span>
                </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 flex flex-col pt-4">
                <span
                    className="font-mono text-sm font-bold tracking-tighter uppercase mb-2"
                    style={{ color: project.accent }}
                >
                    {project.category}
                </span>

                <h3 className="text-5xl font-bold mb-6 text-foreground leading-tight">
                    {project.title}
                </h3>
                <p className="text-foreground/60 mb-8 leading-relaxed max-w-xl">
                    {project.description}
                </p>
                <ul className="space-y-4 mb-8">
                    {project.highlights.map((point, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-4 text-foreground/80"
                        >
                            <div
                                className="mt-2.5 h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                                style={{ backgroundColor: project.accent }}
                            />
                            <span className="text-lg leading-snug font-medium">
                                {point}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-wrap gap-2 mb-10">
                    {project.tech.map((t) => (
                        <span
                            key={t}
                            className="text-xs font-mono text-foreground/50 bg-foreground/5 border border-foreground/10 px-2 py-1 rounded-md"
                        >
                            #{t}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-8">
                    <Link
                        href={project.github}
                        className="flex items-center gap-2 text-foreground font-bold transition-all p-3.5 px-10 rounded-2xl border-2 border-primary hover:bg-primary"
                    >
                        <FaGithub size={22} /> Code
                    </Link>
                    <Link
                        href={project.link}
                        style={{ backgroundColor: project.accent }}
                        className="flex items-center gap-2 text-white px-8 py-4 rounded-xl font-bold hover:brightness-110 hover:shadow-lg transition-all active:scale-95"
                    >
                        Live Demo <ExternalLink size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ProjectSection: React.FC = () => {
    return (
        <section className="relative px-6 overflow-hidden ">
            <Divider sectionName="Projects" />

            <div className="absolute top-0 left-1/4 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl pt-5 pb-35 mx-auto">
                <div className="space-y-48">
                    {projectData.projects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isEven={index % 2 === 0}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectSection;
