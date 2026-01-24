import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
