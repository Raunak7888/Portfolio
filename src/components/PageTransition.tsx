"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import data from "@/Data/Data.json"
export default function PageTransition() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(true);
        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, 400);

        return () => clearTimeout(timeout);
    }, [pathname]);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key="shutter"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{
                        duration: 0.25,
                        ease: [0.19, 1, 0.22, 1],
                    }}
                    style={{ originY: isVisible ? 0 : 1 }}
                    className="fixed inset-0 z-9999 bg-primary pointer-events-none flex items-center justify-center"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="text-white font-black text-[60vh] italic tracking-tighter"
                    >
                        {data.hero.firstName[0]}.
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
