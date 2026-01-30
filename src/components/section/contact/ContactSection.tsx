"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Divider from "../Divider";
import ContactButton from "./ContactButton";

type ContactForm = {
    name: string;
    email: string;
    message: string;
};

const ContactSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<ContactForm>();

    // 1. BEAST PHYSICS: Magnetic Tilt
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!formRef.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } =
            formRef.current.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) / 25;
        const y = (clientY - (top + height / 2)) / 25;

        gsap.to(formRef.current, {
            rotateY: x,
            rotateX: -y,
            transformPerspective: 1000,
            duration: 0.4,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        gsap.to(formRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
        });
    };

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
            });

            // 2. BEAST ENTRANCE: Cinematic reveal
            tl.from(".beast-text", {
                y: 50,
                opacity: 0,
                rotateX: -45,
                stagger: 0.1,
                duration: 1,
                ease: "expo.out",
            }).from(
                formRef.current,
                {
                    scale: 0.7,
                    z: -500,
                    opacity: 0,
                    rotateY: 45,
                    duration: 1,
                    ease: "expo.inOut",
                },
                "-=0.7",
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const onSubmit = async (data: ContactForm) => {
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error();

            toast.success("Message sent 🚀", {
                description:
                    "Thanks for reaching out! I’ll get back to you soon.",
            });

            reset();
        } catch {
            toast.error("Couldn’t send the message", {
                description:
                    "Something went wrong on our side. Please try again in a moment.",
            });
        }
    };

    // 3. BEAST VALIDATION: Shake and Toast
    const onError = () => {
        // Slam the form with a shake animation on error
        gsap.fromTo(
            formRef.current,
            { x: -10 },
            {
                x: 10,
                duration: 0.1,
                repeat: 5,
                yoyo: true,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set(formRef.current, { x: 0 });
                },
            },
        );

        if (errors.email) {
            toast.error("That email doesn’t look right", {
                description:
                    "Please enter a valid email address so I can reply.",
            });
        } else {
            toast.warning("Almost there", {
                description: "Please fill in all the fields before submitting.",
            });
        }
    };

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-20 px-4 sm:px-8 overflow-hidden "
            style={{ perspective: "1500px" }}
        >
            <Divider sectionName="Contact" />

            <div className="mx-auto max-w-6xl mt-16">
                <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start">
                    {/* Content Side */}
                    <div
                        ref={contentRef}
                        className="w-full lg:w-5/12 space-y-8 text-center lg:text-left"
                    >
                        <div className="beast-text inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 tracking-tighter uppercase">
                            Available for new projects
                        </div>
                        <h2
                            ref={headingRef}
                            className="beast-text text-5xl md:text-8xl font-black font-madimi tracking-tighter leading-[0.9] uppercase"
                        >
                            Let&apos;s build <br />
                            <span className="text-primary italic">
                                something
                            </span>{" "}
                            <br />
                            <span className="text-primary underline decoration-2 underline-offset-8">
                                great.
                            </span>
                        </h2>
                        <p className="beast-text text-lg text-foreground/50 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
                            System is ready for input. Transmit your message
                            below to initiate communication.
                        </p>
                    </div>

                    {/* Form Side */}
                    <div className="w-full lg:w-7/12">
                        <form
                            ref={formRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onSubmit={handleSubmit(onSubmit, onError)}
                            className="relative p-8 md:p-12 rounded-[3rem] border border-foreground/10 bg-card/30 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.2)] space-y-8 will-change-transform transform-gpu"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Decorative Shard */}
                            <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] uppercase tracking-widest font-black opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">
                                        Full Name
                                    </label>
                                    <input
                                        {...register("name", {
                                            required: true,
                                        })}
                                        autoComplete="off"
                                        placeholder="JANE DOE"
                                        className="w-full bg-transparent border-b-2 border-foreground/10 focus:border-primary py-2 transition-all outline-none font-bold placeholder:opacity-20 uppercase tracking-tighter"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] uppercase tracking-widest font-black opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">
                                        Email Address
                                    </label>
                                    <input
                                        {...register("email", {
                                            required: true,
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Invalid",
                                            },
                                        })}
                                        autoComplete="off"
                                        placeholder="JANE@EXAMPLE.COM"
                                        className="w-full bg-transparent border-b-2 border-foreground/10 focus:border-primary py-2 transition-all outline-none font-bold placeholder:opacity-20 uppercase tracking-tighter"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 group">
                                <label className="text-[10px] uppercase tracking-widest font-black opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">
                                    Payload_Message
                                </label>
                                <textarea
                                    {...register("message", { required: true })}
                                    autoComplete="off"
                                    placeholder="DESCRIBE THE PROJECT..."
                                    rows={4}
                                    className="w-full bg-transparent border-b-2 border-foreground/10 focus:border-primary py-2 transition-all outline-none font-bold placeholder:opacity-20 resize-none uppercase tracking-tighter"
                                />
                            </div>

                            <div className="pt-6 flex justify-center items-center">
                                <ContactButton isSending={isSubmitting} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
