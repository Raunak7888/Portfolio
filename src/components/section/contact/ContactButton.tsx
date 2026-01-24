import { Send } from "lucide-react";
import React from "react";

interface ContactButtonProps {
    handleContact: () => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({ handleContact }) => {
    return (
        <button
            onClick={handleContact}
            className="
                group relative flex items-center justify-start
                w-fit h-10 pl-5 pr-10
                bg-primary text-white font-medium
                rounded-[10px] cursor-pointer
                transition-all duration-300
                active:translate-0.5
            "
        >
            <span
                className="
                    transition-opacity duration-300
                    group-hover:opacity-0
                "
            >
                Send Message
            </span>

            <Send
                className="
                    absolute right-5 w-4
                    transition-all duration-500
                    group-hover:right-1/2 group-hover:translate-x-1/2
                "
            />
        </button>
    );
};

export default ContactButton;
