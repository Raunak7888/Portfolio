"use client";

import Link from "next/link";
import { SocialIcons } from "@/components/ui/SocialLinks";
import { HeroFullName, ViewSourceGithubLinkUrl } from "@/Data/Data";
import { FaGithub } from "react-icons/fa";

const HeroIntroCard = () => {
    return (
        <section className="w-full relative top-10 flex justify-center text-mitr px-0 sm:px-4 lg:px-8">
            <div className="relative w-full max-w-3xl">
                {/* Card */}
                <div className="relative  rounded-3xl bg-white/5 backdrop-blur-2xl border border-foreground/10 shadow-2xl p-6 sm:p-8">
                    <Link
                        href={ViewSourceGithubLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute z-10 top-4 right-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium
                                   text-foreground border border-foreground/20 backdrop-blur-sm shadow-md
                                   transition-colors hover:bg-primary hover:text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    >
                        <FaGithub size={16} />
                        <span className="hidden sm:inline ">View Source</span>
                    </Link>

                    {/* Content */}
                    <div className="font-mitr text-left space-y-2">
                        <p className="text-lg sm:text-xl text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ">
                            Hey, I’m
                        </p>

                        <h1 className="font-modak text-4xl sm:text-5xl lg:text-6xl text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {HeroFullName}
                        </h1>

                        <p className="text-base sm:text-lg font-semibold text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Java-Focused Full-Stack Engineer building scalable web systems
                        </p>

                        <p className="text-sm sm:text-base lg:text-lg text-foreground max-w-prose drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            I work across frontend and backend to build
                            maintainable, efficient software—writing clean,
                            scalable code that prioritizes simplicity and real
                            problem-solving over unnecessary complexity.
                        </p>

                        <p className="text-sm sm:text-base lg:text-lg text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Always learning. Always improving.
                        </p>
                    </div>
                </div>

                {/* Social / CTA */}
                <div
                    className="mt-4 flex items-center gap-3 rounded-full bg-white/5 backdrop-blur-2xl
                                border border-foreground/10 shadow-2xl px-3 py-2 w-fit"
                >
                    <div className="rounded-full bg-white/5 backdrop-blur-2xl border border-foreground/10 shadow-2xl">
                        <SocialIcons size={48} className="p-2" />
                    </div>

                    <span
                        className="inline-flex items-center justify-center rounded-full px-6 py-4.5
                                     text-lg sm:text-xl font-jersey text-foreground shadow
                                     transition-colors hover:bg-primary hover:text-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    >
                        Connect
                    </span>
                </div>
            </div>
        </section>
    );
};

export default HeroIntroCard;
