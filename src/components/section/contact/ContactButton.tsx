"use client";

import { Loader2, Send } from "lucide-react";
import React from "react";

interface ContactButtonProps {
    handleContact: () => void;
    isSending?: boolean;
}

const ContactButton: React.FC<ContactButtonProps> = ({
    handleContact,
    isSending,
}) => {
    return (
        <button
            onClick={handleContact}
            disabled={isSending}
            className="
                group relative overflow-hidden
                flex items-center justify-center
                w-full sm:w-fit h-14 px-8
                bg-primary text-primary-foreground 
                font-semibold text-lg
                rounded-full cursor-pointer
                transition-all duration-300 ease-out
                hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]
                active:scale-95
                disabled:opacity-70 disabled:cursor-not-allowed
            "
        >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-3">
                {isSending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <span className="translate-x-0 group-hover:-translate-x-1 transition-transform duration-300">
                            Send Message
                        </span>
                        <Send 
                            className="
                                w-5 h-5 
                                transition-all duration-300 ease-out
                                group-hover:translate-x-2 group-hover:-translate-y-1
                                group-active:translate-x-4 group-active:-translate-y-2
                            " 
                        />
                    </>
                )}
            </div>
        </button>
    );
};

export default ContactButton;