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

// 1. Define the Interface for Type Safety
interface Project {
    title: string;
    category: string;
    badge: string;
    accent: string;
    highlights: string[];
    description: string;
    tech: string[];
    link: string;
    github: string;
    images: string[];
    icon: React.ReactNode;
}

const projects: Project[] = [
    {
        title: "EcoTrack Pro",
        category: "Full-Stack Development",
        badge: "Most Innovative",
        accent: "#ff0000",
        highlights: [
            "Architected a real-time dashboard tracking 50+ global supply chain nodes.",
            "Integrated OpenWeather API to correlate environmental data with logistics.",
            "Reduced data processing latency by 45% using Redis caching.",
        ],
        description:
            "An enterprise-grade carbon footprint monitor designed for logistics giants to track Scope 3 emissions.",
        tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis"],
        link: "https://demo.com",
        github: "https://github.com/user/repo",
        images: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2400&auto=format&fit=crop",
        ],
        icon: <Globe size={20} />,
    },
    {
        title: "Sentinul AI",
        category: "Machine Learning / Security",
        badge: "Trending",
        accent: "#FF7F00",
        highlights: [
            "Trained Random Forest models on 1M+ anonymized transaction records.",
            "Deployed as a containerized microservice via Docker and Kubernetes.",
            "Achieved a 99.2% precision rate in identifying fraudulent credit patterns.",
        ],
        description:
            "A real-time fraud detection engine that identifies anomalous transaction patterns using ML models.",
        tech: ["Python", "FastAPI", "Scikit-Learn", "Docker"],
        link: "https://demo.com",
        github: "https://github.com/user/repo",
        images: [
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2400&auto=format&fit=crop",
        ],
        icon: <Shield size={20} />,
    },
    {
        title: "Nexus Stream",
        category: "System Architecture",
        badge: "High Performance",
        accent: "#f59e0b",
        highlights: [
            "Engineered a Kafka-based pipeline for asynchronous event streaming.",
            "Optimized WebSocket handshakes to support 10k+ concurrent users.",
            "Implemented horizontal scaling strategies via Kubernetes HPA.",
        ],
        description:
            "A high-concurrency video streaming backend built to handle massive traffic spikes.",
        tech: ["Go", "Kafka", "MongoDB", "Kubernetes"],
        link: "https://demo.com",
        github: "https://github.com/user/repo",
        images: [
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2400&auto=format&fit=crop",
        ],
        icon: <Zap size={20} />,
    },
];
// 2. Apply Types to the Component Props
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
                        {project.icon}
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
        <section className="relative px-6 overflow-hidden bg-background">
            <Divider sectionName="Projects" />

            <div className="absolute top-0 left-1/4 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl pt-5 pb-35 mx-auto">
                <div className="space-y-48">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.title}
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
