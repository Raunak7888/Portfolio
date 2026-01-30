"use client";

import Link from "next/link";
import { FaGithub, FaArrowRight } from "react-icons/fa";
import { SocialIcons } from "@/components/ui/SocialLinks";
import HeroVisualStack from "./CodeCard";
import data from "@/Data/Data.json";

const HeroContent = () => {
    return (
        <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
                {/* Animated Badge */}
                <Link
                    href={data.heroSection.viewSourceGithubLinkUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all group"
                >
                    <FaGithub className="group-hover:scale-110 transition-transform" />
                    <span>Portfolio Source Code</span>
                    <FaArrowRight
                        size={10}
                        className="opacity-50 group-hover:translate-x-1 transition-transform"
                    />
                </Link>

                {/* Heading Section */}
                <div className="select-none space-y-4">
                    <h2 className="text-foreground/70 text-lg md:text-xl font-medium tracking-tight">
                        Hi, I&apos;m
                        <span className="text-foreground font-bold"></span>
                    </h2>
                    <h1 className="text-5xl text-primary  md:text-7xl font-bungee font-bold tracking-tight">
                        {data.hero.fullName}
                    </h1>
                </div>

                {/* Narrative */}
                <p className="max-w-135 select-none text-muted-foreground text-lg md:text-xl leading-relaxed">
                    {data.heroSection.description}
                </p>

                {/* Call to Actions */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                    <div className="h-12 flex items-center px-4 border-2  backdrop-blur-sm  border-primary rounded-full">
                        <SocialIcons />
                    </div>
                    <button
                        className="h-12 px-8 bg-primary hover:scale-[1.05] text-primary-foreground font-semibold rounded-full hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:opacity-90 transition-all flex items-center gap-2 group"
                        onClick={() => {
                            const contactSection =
                                document.getElementById("contact");
                            if (contactSection) {
                                contactSection.scrollIntoView({
                                    behavior: "smooth",
                                });
                            }
                        }}
                    >
                        Connect
                        <FaArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 relative">
                <HeroVisualStack />
                <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 group-hover:bg-primary/30 transition-colors" />
            </div>
        </div>
    );
};

export default HeroContent;
