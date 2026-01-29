"use client";
import {  useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { HeroFirstName } from "@/Data/Data";
import Link from "next/link";
import ThemeColorDropdown from "./AccentChanger";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
   
    
    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-100 ">
            <div className="bg-background/60 backdrop-blur-xl border border-primary rounded-full px-6 py-2 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold tracking-tighter">
                        {HeroFirstName}
                        <span className="text-primary">.</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {["Home", "About", "Skills", "Projects", "Contact"].map(
                            (item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {item}
                                </Link>
                            ),
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <ThemeColorDropdown />
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2 text-muted-foreground"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 mt-4 p-4 bg-background/95 border border-border rounded-2xl flex flex-col gap-4">
                        {["About", "Skills", "Projects", "Contact"].map(
                            (item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item}
                                </a>
                            ),
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
