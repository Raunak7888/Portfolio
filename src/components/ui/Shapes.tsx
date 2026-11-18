import { motion } from "framer-motion";

function Floater({
    children,
    className,
    color,
    delay = 0,
    reduce,
}: {
    children: React.ReactNode;
    className: string;
    color: string;
    delay?: number;
    reduce: boolean;
}) {
    return (
        <motion.div
            aria-hidden
            className={`pointer-events-none absolute hidden lg:block ${className}`}
            style={{ color, opacity: 0.45 }}
            animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, -8, 0] }}
            transition={{
                duration: 6 + delay,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}


export default function Shapes({ reduce }: { reduce: boolean }) {
    return (
        <>
            <Floater className="left-[3%] top-[14%]" color="oklch(0.66 0.17 295)" reduce={reduce}>
                <svg viewBox="0 0 40 40" className="size-8">
                    <polygon
                        points="20,6 35,32 5,32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                </svg>
            </Floater>

            <Floater className="bottom-[10%] right-[3%]" color="oklch(0.72 0.16 75)" delay={2} reduce={reduce}>
                <svg viewBox="0 0 40 40" className="size-9">
                    <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
            </Floater>

            <Floater className="right-[44%] top-[6%]" color="oklch(0.68 0.17 10)" delay={3} reduce={reduce}>
                <svg viewBox="0 0 40 40" className="size-6">
                    <path d="M20 5v30M5 20h30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
            </Floater>
        </>
    );
}