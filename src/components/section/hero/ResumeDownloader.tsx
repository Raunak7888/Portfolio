"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";

export default function ResumeButton() {
    const [loading, setLoading] = useState(false);

    return (
        <motion.a
            href="/Raunak_yadav_resume.pdf"
            download="Raunak_yadav_resume.pdf"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1400);
            }}
            className={`h-10 px-5 border border-border text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-150 w-fit rounded-2xl ${
                loading ? "pointer-events-none opacity-60" : ""
            }`}
        >
            {loading ? (
                <>
                    <Loader2 size={13} className="animate-spin" />
                    Downloading…
                </>
            ) : (
                <>
                    Resume
                    <Download size={13} className="opacity-70" />
                </>
            )}
        </motion.a>
    );
}