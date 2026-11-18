import { useSpring, useMotionTemplate, motion } from "framer-motion";

export default function Spotlight({
    sx,
    sy,
}: {
    sx: ReturnType<typeof useSpring>;
    sy: ReturnType<typeof useSpring>;
}) {
    const mask = useMotionTemplate`radial-gradient(240px circle at ${sx}px ${sy}px, black, transparent)`;

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden opacity-70 md:block"
            style={{
                backgroundImage:
                    "radial-gradient(var(--primary) 1.2px, transparent 1.5px)",
                backgroundSize: "24px 24px",
                maskImage: mask,
                WebkitMaskImage: mask,
            }}
        />
    );
}