"use client";

import { useState } from "react";
import { Volume2, VolumeOff, Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { HeroFirstName } from "@/Data/Data";

const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
    // { name: "Test", href: "/test" },
];

const Navbar = () => {
    const [isMute, setIsMute] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-screen max-w-5xl z-50">
            <div className="relative bg-navbar backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="text-xl font-bold font-nunito tracking-tight">
                        {HeroFirstName}
                    </div>
                    <div className="hidden md:flex font-nunito items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMute((v) => !v)}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                            aria-label={isMute ? "Unmute" : "Mute"}
                        >
                            {isMute ? (
                                <VolumeOff size={20} />
                            ) : (
                                <Volume2 size={20} />
                            )}
                        </button>

                        <ThemeToggle />

                        {/* Hamburger (mobile only) */}
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={`
            md:hidden overflow-hidden transition-all duration-300 ease-out
            ${menuOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"}
            `}
                >
                    <div className="flex flex-col gap-3 font-nunito">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="
                    rounded-lg px-3 py-2 text-sm font-medium
                    hover:bg-muted hover:text-primary
                    transition-colors
                "
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
