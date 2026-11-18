import { ALGOFORGE_SHOTS } from "./image-meta.generated";

export const copy = {
    badge: "Projects",
    headingTop: "Things I've",
    headingBottom: "built.",
    hintFine: "Scroll",
    hintTouch: "Swipe down through the builds.",
    outroTitle: "There is more where this came from.",
    outroText: "Every repo, commit and experiment lives on my GitHub.",
    outroCta: "Open GitHub",
    githubProfile: "https://github.com/Raunak7888",
    comingSoon: "Public link coming soon",
    caseStudy: "Read case study",
};

export type StatusKind = "live" | "active" | "building";
export type LinkKind = "repo" | "live" | "post";
export type SceneId = "cipher" | "foil" | "loupe" | "forge";

export type Metric = { value: number | string; suffix?: string; label: string };
export type ProjectLink = { kind: LinkKind; label: string; href: string };

export type Project = {
    id: string;
    name: string;
    kind: string;
    tint: string;
    status: StatusKind;
    scene: SceneId;
    cardLine: string;
    summary: string;
    chips: string[];
    bullets: string[];
    metrics: Metric[];
    links: ProjectLink[];
    caseStudy: string;
    image?: string;
    imageAlt?: string;
    /** Real screenshots shown in the sticky stage (generated list, see scripts/gen-image-meta.mjs). */
    shots?: string[];
    readout: string;
};

export const STATUS: Record<StatusKind, { label: string; color: string }> = {
    live: { label: "Live", color: "oklch(0.72 0.17 150)" },
    active: { label: "Active", color: "oklch(0.68 0.14 235)" },
    building: { label: "In development", color: "oklch(0.72 0.16 75)" },
};

export const PROJECTS: Project[] = [
    {
        id: "hermes",
        name: "Hermes",
        kind: "Featured · Full-stack app",
        tint: "oklch(0.68 0.14 235)",
        status: "live",
        scene: "cipher",
        cardLine: "Private chats the server cannot read.",
        summary:
            "A real-time chat platform with end-to-end encrypted private messages and group chat. It runs on a self-managed k3s cluster on GCP that I provisioned and configured myself. Group messages are not end-to-end encrypted.",
        chips: ["Java", "Spring Boot", "React", "TypeScript", "k3s"],
        bullets: [
            "Private chats: ECDH P-256 key exchange and AES-GCM per message, in the browser",
            "Real-time chat over WebSocket/STOMP with presence and typing indicators",
            "Redis sliding-window rate limiting per user",
            "Terraform and Ansible provision the GCP cluster. A GitHub Actions pipeline with Trivy scans is written and not yet switched on",
        ],
        metrics: [
            { value: 2, label: "GCP VMs" },
            { value: 24, suffix: "h", label: "message history" },
            { value: "AES-GCM", label: "private chat encryption" },
        ],
        links: [
            { kind: "live", label: "Live demo", href: "https://23.236.54.241.nip.io/" },
            { kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Hermes" },
        ],
        caseStudy: "/projects/hermes",
        image: "/uploads/hermes1.webp",
        imageAlt: "Hermes chat interface showing a private conversation",
        readout: "hover · open the frames",
    },
    {
        id: "pokeverse",
        name: "Pokeverse",
        kind: "Game platform",
        tint: "oklch(0.72 0.16 75)",
        status: "active",
        scene: "foil",
        cardLine: "One platform, many multiplayer games.",
        summary:
            "A real-time multiplayer platform that provides the shared parts (authentication, rooms, event routing, chat and state) so each new game only has to bring its own rules. One game module exists so far.",
        chips: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Redis"],
        bullets: [
            "Shared auth, rooms, chat and event routing for every game",
            "PostgreSQL 17 with Flyway for history, Redis for live scores",
            "Pokémon Quiz in single-player and room-based multiplayer",
            "Game modules plug in and bring only their own rules",
        ],
        metrics: [
            { value: 2, label: "data stores" },
            { value: 1, label: "game module" },
            { value: "STOMP", label: "room events" },
        ],
        links: [{ kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Pokeverse" }],
        caseStudy: "/projects/pokeverse",
        image: "/uploads/pokeverse1.webp",
        imageAlt: "Pokeverse Pokémon Quiz game screen",
        readout: "hover · tilt the card",
    },
    {
        id: "calculate",
        name: "Calculate",
        kind: "Python library",
        tint: "oklch(0.68 0.17 10)",
        status: "active",
        scene: "loupe",
        cardLine: "A scientific calculator with no eval(), on purpose.",
        summary:
            "A scientific expression evaluator built from scratch with classic compiler techniques. It explores what really happens between typing an expression and seeing a number.",
        chips: ["Python 3.13", "Shunting-Yard", "RPN", "uv"],
        bullets: [
            "Tokenizer, implicit multiplication, Shunting-Yard, stack evaluator",
            "50+ functions and 70+ operators with domain checks",
            "100+ test cases and no external math dependencies",
            "Explained in a public Medium article",
        ],
        metrics: [
            { value: 50, suffix: "+", label: "functions" },
            { value: 70, suffix: "+", label: "operators" },
            { value: 100, suffix: "+", label: "test cases" },
        ],
        links: [
            { kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Calculate" },
            {
                kind: "post",
                label: "Article",
                href: "https://medium.com/@raunakyadav7888/how-i-built-a-better-calculator-using-the-shunting-yard-algorithm-b359b8826045",
            },
        ],
        caseStudy: "/projects/calculate",
        image: "/uploads/calculate1.webp",
        imageAlt: "Calculate expression evaluator test output",
        readout: "hover · loupe 2.2×",
    },
    {
        id: "algoforge",
        name: "AlgoForge",
        kind: "In development · AI dev tool",
        tint: "oklch(0.66 0.17 295)",
        status: "building",
        scene: "forge",
        cardLine: "Code in, explanation and visualization out.",
        summary:
            "Work in progress. An AI-assisted code understanding tool that aims to turn source code into structured explanations and algorithm visualizations. No public link yet.",
        chips: ["Next.js", "Express", "Prisma", "Gemini"],
        bullets: [
            "Separate stages: analysis, visualization JSON, rendering",
            "ForgeCode turns code and AI analysis into visualizer JSON",
            "Workspace drafts, explanation sessions and usage quotas",
            "SHA-256 deduplication, reported at about 60% less duplicate processing",
        ],
        metrics: [
            { value: 60, suffix: "%", label: "reported less duplicate work" },
            { value: 3, label: "pipeline stages" },
            { value: "JSON", label: "visualizer contract" },
        ],
        links: [],
        caseStudy: "/projects/algoforge",
        readout: "hover · pipeline sketch",
        shots: ALGOFORGE_SHOTS,
    },
];

export const TOTAL = PROJECTS.length;
