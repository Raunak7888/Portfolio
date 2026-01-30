"use client";

import { Loader2, Send } from "lucide-react";
import React from "react";

interface ContactButtonProps {
    isSending?: boolean;
}

const ContactButton: React.FC<ContactButtonProps> = ({ isSending }) => {
    return (
        <button
            type="submit"
            disabled={isSending}
            className="
                group relative overflow-hidden
                flex items-center justify-center
                w-full sm:w-fit h-14 px-10
                bg-primary text-primary-foreground 
                font-bold text-lg rounded-full cursor-pointer
                transition-all duration-300 ease-out
                hover:shadow-[0_0_30px_rgba(var(--primary),0.6)]
                hover:scale-105 active:scale-95
                disabled:opacity-70 disabled:cursor-not-allowed
            "
        >
            <div className="relative flex items-center gap-3 z-10">
                {isSending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="animate-pulse">LAUNCHING...</span>
                    </>
                ) : (
                    <>
                        <span className="group-hover:opacity-0 transition-all duration-300">
                            Send Message
                        </span>
                        <Send
                            className="
                                w-5 h-5 absolute -right-6 group-hover:right-[-10px] 
                                transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]
                                group-hover:scale-125
                            "
                        />
                        <span className="absolute left-[-100px] group-hover:left-[7px] opacity-0 group-hover:opacity-100 transition-all duration-500 font-black">
                            CONFIRM?
                        </span>
                    </>
                )}
            </div>

            {/* Liquid Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </button>
    );
};

export default ContactButton;