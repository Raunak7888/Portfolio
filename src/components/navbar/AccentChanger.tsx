"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
    { name: "Deep Purple", value: "#7C3AED" },
    { name: "Sky Blue", value: "#0EA5E9" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Burnt Orange", value: "#EA580C" },
    { name: "Red", value: "#EF4444" },
];

const ThemeColorPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [color, setColor] = useState(() => {
        if (typeof window === "undefined") return "#8a5cf5";
        return localStorage.getItem("theme-primary") || "#8a5cf5";
    });

    useEffect(() => {
        document.documentElement.style.setProperty("--primary", color);
        localStorage.setItem("theme-primary", color);
    }, [color]);

    return (
        <div
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Active Trigger Bead */}
            <motion.button
                layout={"preserve-aspect"}
                className="w-5 h-5 rounded-full bg-primary cursor-pointer z-20"
                // transition={{ type: "spring", stiffness: 300, damping: 10 }}
            />

            {/* Vertical Dropdown Bead-string */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col gap-2 p-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-foreground/5 shadow-2xl z-10"
                    >
                        {COLORS.filter((c) => c.value !== color).map((c, i) => (
                            <motion.button
                                key={c.value}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setColor(c.value)}
                                className="w-5 h-5 rounded-full transition-all hover:scale-125 active:scale-90"
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeColorPicker;
