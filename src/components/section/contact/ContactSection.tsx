import Divider from "../Divider";
import ContactButton from "./ContactButton";
import MessageImage from "./MessageImage";
import { useState } from "react";

const ContactSection = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const sendEmail = async () => {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            alert("Failed to send message");
            return;
        }

        alert("Message sent");
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <div className="w-full bg-background px-4 sm:px-6">
            <Divider sectionName="Contact me" />

            {/* Outer shell */}
            <div
                className="
                mx-auto my-10
                max-w-6xl
                rounded-4xl
                bg-linear-to-tl from-background/50 to-foreground/50
                p-0.5
                h-140
                "
            >
                {/* Inner container */}
                <div
                    className="
                    w-full
                    rounded-4xl
                    h-full
                    bg-linear-to-br from-background to-foreground/40
                    flex flex-col lg:flex-row
                    "
                >
                    {/* Image */}
                    <div
                        className="
                        w-full lg:w-1/2
                        flex items-center justify-center
                        p-6
                        border-b lg:border-b-0 lg:border-r
                        border-foreground/20
                        "
                    >
                        <MessageImage />
                    </div>

                    {/* Form */}
                    <div
                        className="
                        w-full lg:w-1/2
                        flex flex-col items-center justify-center
                        p-6 sm:p-8
                        font-madimi
                        "
                    >
                        <div className="text-3xl sm:text-4xl font-bold mb-4">
                            Let&apos;s Talk
                        </div>

                        <div className="text-center text-lg sm:text-xl">
                            Have an <span className="text-primary">Idea</span>,{" "}
                            <span className="text-primary">Question</span>, or
                            just want to
                        </div>

                        <div className="text-center text-lg sm:text-xl mb-6">
                            <span className="text-primary">say Hi</span>? Drop a
                            message below!
                        </div>

                        {/* Inputs wrapper only controls width */}
                        <div className="w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full p-3 px-5 mb-4 rounded-full border 
                                border-foreground/20 bg-card text-foreground 
                                placeholder-foreground/50 focus:outline-none focus:ring-2
                                focus:ring-primary 
                                shadow-[inset_2px_4px_6px_rgba(0,0,0,0.2),inset_-2px_-4px_6px_rgba(255,255,255,0.1)]
                                "
                            />

                            <input
                                type="email"
                                placeholder="Your Email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="w-full p-3 px-5 mb-4 rounded-full border
                                border-foreground/20 bg-card text-foreground 
                                placeholder-foreground/50 focus:outline-none focus:ring-2
                                focus:ring-primary
                                shadow-[inset_2px_4px_6px_rgba(0,0,0,0.2),inset_-2px_-4px_6px_rgba(255,255,255,0.1)]
                                "
                            />

                            <textarea
                                placeholder="Your Message"
                                value={form.message}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        message: e.target.value,
                                    })
                                }
                                className="w-full p-3 px-5 mb-4 rounded-2xl border
                                border-foreground/20 bg-card text-foreground 
                                placeholder-foreground/50 focus:outline-none 
                                focus:ring-2 focus:ring-primary h-24
                                shadow-[inset_2px_4px_6px_rgba(0,0,0,0.2),inset_-2px_-4px_6px_rgba(255,255,255,0.1)]"
                            />
                        </div>

                        <ContactButton
                            handleContact={sendEmail}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSection;
