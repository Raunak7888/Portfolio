import { aspectRatio } from "framer-motion";
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            animation: {
                "float-slow": "float 6s ease-in-out infinite",
                "float-medium": "float 4s ease-in-out infinite",
            },
            aspectRatio: {
                "16/10": "16 / 10",
            },
            keyframes: {
                float: {
                    "0%, 100%": {
                        transform: "translateY(0px) rotate(var(--tw-rotate))",
                    },
                    "50%": {
                        transform: "translateY(-15px) rotate(var(--tw-rotate))",
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
