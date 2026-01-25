"use client";

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
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<ContactForm>();

    const onSubmit = async (data: ContactForm) => {
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error();

            toast.success("Message sent!", {
                description: "I'll be in touch soon.",
            });
            reset();
        } catch {
            toast.error("Send failed", {
                description: "Please try again later.",
            });
        }
    };

    return (
        <section className="relative w-full py-12 px-4 sm:px-8">
            <Divider sectionName="Contact me" />
            <div className="mx-auto max-w-6xl mt-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                    {/* Content Side: Text & Image */}
                    <div className="w-full lg:w-5/12 space-y-6 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            Available for new projects
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold font-madimi tracking-tight leading-tight">
                            Let&apos;s build <br />
                            <span className="text-primary">
                                something great.
                            </span>
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-md mx-auto lg:mx-0">
                            Have a question or just want to chat? Drop me a
                            message and I’ll get back to you within 24 hours.
                        </p>
                    </div>
                    {/* Form Side: The Glass Card */}
                    <div className="w-full lg:w-7/12">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="relative p-6 sm:p-10 rounded-[2.5rem] border border-foreground/10 bg-card/40 backdrop-blur-xl shadow-2xl space-y-6"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold ml-2 opacity-70">
                                        Full Name
                                    </label>
                                    <input
                                        {...register("name", {
                                            required: "Name is required",
                                        })}
                                        autoComplete="off"
                                        placeholder="Jane Doe"
                                        className="w-full px-6 py-4 rounded-2xl bg-foreground/5 border border-transparent focus:border-primary/50 focus:bg-background transition-all outline-none"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500 ml-2">
                                            {errors.name.message}
                                        </span>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold ml-2 opacity-70">
                                        Email Address
                                    </label>
                                    <input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message:
                                                    "Invalid email address",
                                            },
                                        })}
                                        autoComplete="off"
                                        placeholder="jane@example.com"
                                        className="w-full px-6 py-4 rounded-2xl bg-foreground/5 border border-transparent focus:border-primary/50 focus:bg-background transition-all outline-none"
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-red-500 ml-2">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Message Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold ml-2 opacity-70">
                                    Your Message
                                </label>
                                <textarea
                                    {...register("message", {
                                        required: "Message cannot be empty",
                                    })}
                                    placeholder="Tell me about your project..."
                                    rows={5}
                                    className="w-full px-6 py-4 rounded-3xl bg-foreground/5 border border-transparent focus:border-primary/50 focus:bg-background transition-all outline-none resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-center items-center">
                                <ContactButton
                                    handleContact={handleSubmit(onSubmit)}
                                    isSending={isSubmitting}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
