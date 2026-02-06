import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import { ArrowBigRightDash } from "lucide-react";

export default function ProjectFooter({ link }: { link: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const magneticRef = useRef<HTMLDivElement>(null);
    const bgTextRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(containerRef, { once: false, amount: 0.2 });
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        const update = () => {
            setTime(
                new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            );
        };

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background Parallax
            gsap.to(bgTextRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
                xPercent: 20,
            });

            // Magnetic Logic
            const mouseMove = (e: MouseEvent) => {
                if (!magneticRef.current) return;
                const { clientX, clientY } = e;
                const { left, top, width, height } =
                    magneticRef.current.getBoundingClientRect();
                const x = clientX - (left + width / 2);
                const y = clientY - (top + height / 2);

                gsap.to(magneticRef.current, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.5,
                    ease: "power2.out",
                });
            };

            const mouseLeave = () => {
                gsap.to(magneticRef.current, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)",
                });
            };

            containerRef.current?.addEventListener("mousemove", mouseMove);
            containerRef.current?.addEventListener("mouseleave", mouseLeave);
        });

        return () => ctx.revert();
    }, []);

    const titleVariants: Variants = {
        hidden: { y: "100%" },
        visible: {
            y: 0,
            transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
        },
    };

    return (
        <footer
            ref={containerRef}
            className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden text-foreground"
        >
            {/* Background Text - Parallax */}
            <div
                ref={bgTextRef}
                className="absolute top-1/2 -translate-y-1/2 text-[20vw] font-black text-foreground/2 whitespace-nowrap pointer-events-none z-0 select-none"
            >
                RAUNAK RAUNAK RAUNAK
            </div>

            {/* Magnetic Link Container */}
            <div
                ref={magneticRef}
                className="relative z-10 cursor-pointer group"
            >
                <Link href={link} target="_blank">
                    <div className="overflow-hidden flex items-center">
                        <motion.h2
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                            variants={titleVariants}
                            className="text-[clamp(4rem,12vw,15rem)] font-black leading-[0.9] flex items-center gap-4 transition-colors duration-300 group-hover:text-primary"
                        >
                            GITHUB
                            <motion.span
                                className="inline-block"
                                animate={
                                    isInView
                                        ? { rotate: 0, opacity: 1 }
                                        : { rotate: -45, opacity: 0 }
                                }
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <ArrowBigRightDash
                                    size="1em"
                                    strokeWidth={2}
                                    className="text-primary group-hover:text-foreground transition-colors duration-300"
                                />
                            </motion.span>
                        </motion.h2>
                    </div>
                </Link>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-10 w-full px-[5vw] flex justify-between items-end text-[0.75rem] md:text-sm uppercase tracking-[2px] text-neutral-500 font-medium">
                <div className="space-y-1">
                    <p className="hover:text-foreground transition-colors cursor-default">
                        © 2026 Raunak
                    </p>
                    <p>Full-Stack Developer</p>
                </div>

                <div className="text-right space-y-1">
                    <p className="text-neutral-600">Local Time</p>
                    <p className="tabular-nums">
                        {time}{" "}
                        IST
                    </p>
                </div>
            </div>
        </footer>
    );
}
