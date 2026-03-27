"use client";

import { motion, Variants } from "framer-motion";
import { SocialIcons } from "../../ui/SocialLinks";
import data from "@/Data/Data.json";

const Footer = () => {
    // Container Variants: Handles the staggered reveal of children
    const footerVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 10 
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.1, // Staggers the reveal of Left and Right content
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 7 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <footer className="w-full border-t border-border bg-background">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }} // Reverses when 50% of the footer leaves the view
                variants={footerVariants}
                className="
                    mx-auto max-w-7xl
                    px-6 
                    flex flex-col gap-6
                    sm:flex-row sm:items-center sm:justify-between
                "
            >
                {/* Left content - Animated Item */}
                <motion.div
                    variants={itemVariants}
                    className="
                        font-mitr text-xs sm:text-sm
                        text-muted-foreground
                        flex flex-wrap items-center justify-center gap-1
                        sm:justify-start
                    "
                >
                    <span>© {new Date().getFullYear()}</span>

                    <span className="text-foreground font-semibold">
                        {data.hero.fullName}
                    </span>

                    <span className="hidden sm:inline text-border mx-1">—</span>

                    <span className="w-full sm:w-auto block">
                        {data.footer.note}
                    </span>
                </motion.div>

                {/* Right content - Animated Item */}
                <motion.div 
                    variants={itemVariants}
                    className="flex justify-center sm:justify-end"
                >
                    <div className="hover:scale-110 transition-transform duration-300">
                        <SocialIcons size={40} />
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
};

export default Footer;