"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { fade, stackLoose, viewportOnce } from "@/lib/motion";

/** Shared header: numbered eyebrow, headline, optional control on the right. */
export default function SectionHeader({
    index,
    label,
    top,
    bottom,
    reduce,
    aside,
    className = "",
}: {
    index: string;
    label: string;
    top: string;
    bottom: string;
    reduce: boolean;
    aside?: ReactNode;
    className?: string;
}) {
    return (
        <motion.header
            initial={reduce ? "show" : "hidden"}
            whileInView="show"
            viewport={viewportOnce}
            variants={stackLoose}
            className={`flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${className}`}
        >
            <div className="flex flex-col items-start gap-3">
                <motion.div variants={fade}>
                    <Eyebrow index={index}>{label}</Eyebrow>
                </motion.div>
                <Headline reduce={reduce} toptext={top} bottomtext={bottom} />
            </div>

            {aside && (
                <motion.div variants={fade} className="min-w-0 max-w-full lg:pb-1.5">
                    {aside}
                </motion.div>
            )}
        </motion.header>
    );
}
