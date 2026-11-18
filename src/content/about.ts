import { ViewIcon, Layers01Icon, RefreshIcon, Rocket01Icon } from "@hugeicons/core-free-icons";

export const about = {
    greeting: "Hey, I'm Raunak",

    headingTop: "Curious about",
    headingBottom: "how things work.",

    paragraph:
        "I'm a BCA graduate and full-stack developer. I started with Java and Spring Boot, then moved into React and TypeScript. I enjoy building things, trying new ideas, and figuring out how everything fits together.",

    half: "I like knowing why something works, not just that it does.",

    currently: "Currently exploring",
    topics: ["AI", "system design", "new ideas"],

    cta: { label: "A little more about me", href: "#about" },
};

export type Pillar = {
    id: string;
    icon: typeof ViewIcon;
    kicker: string;
    title: string;
    text: string;
    emoji: string;
    backTitle: string;
    backText: string;
    tint: string;
    tilt: number;
};

export const PILLARS: Pillar[] = [
    {
        id: "understand",
        icon: ViewIcon,
        kicker: "How I think",
        title: "Understand first",
        text: "I like figuring out the problem before jumping into a solution. Simple and clear is usually better.",
        emoji: "🦆",
        backTitle: "Rubber duck approved",
        backText:
            "Sometimes I explain bugs to a duck. Surprisingly, it helps more than you'd think.",
        tint: "oklch(0.72 0.16 75)",
        tilt: -2,
    },
    {
        id: "stack",
        icon: Layers01Icon,
        kicker: "How I build",
        title: "A bit of everything",
        text: "From APIs and databases to user interfaces, I enjoy bringing all the pieces together.",
        emoji: "🧩",
        backTitle: "Pieces that fit",
        backText:
            "There's something satisfying about seeing everything finally work together.",
        tint: "oklch(0.68 0.14 235)",
        tilt: 1.5,
    },
    {
        id: "learn",
        icon: RefreshIcon,
        kicker: "How I learn",
        title: "Learn by doing",
        text: "I learn by trying things, making mistakes, and figuring out how to fix them.",
        emoji: "🐛",
        backTitle: "Bugs happen",
        backText:
            "Every bug has something to teach. Some just take longer to explain themselves.",
        tint: "oklch(0.68 0.17 10)",
        tilt: 2,
    },
    {
        id: "next",
        icon: Rocket01Icon,
        kicker: "What's next",
        title: "Always growing",
        text: "There's always something new to learn, and I like keeping that curiosity alive.",
        emoji: "🔭",
        backTitle: "What's on the horizon?",
        backText:
            "Exploring AI, system design, and building things that can grow with more users.",
        tint: "oklch(0.66 0.17 295)",
        tilt: -1.5,
    },
];

export const MASCOT_LINES = [
    "Hey! I'm Blob 👋",
    "Go on, move the cards!",
    "Psst... try flipping one.",
    "I help Raunak find bugs. Sometimes.",
    "Flip all four for a surprise!",
    "Hehe, that tickles!",
];
