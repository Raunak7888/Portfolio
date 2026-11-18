export const copy = {
    badge: "Skills",
    headingTop: "The toolbox",
    headingBottom: "I build with.",
    hintFine: "Click a tile, or move with the arrow keys.",
    hintTouch: "Tap a tile to see how I use it.",
    emptyTitle: "Pick a tile",
    emptyText: "See how I use it and what it pairs with.",
    done: "Whole toolbox explored 🎉",
};

export type CatId = "languages" | "backend" | "frontend" | "tooling";
export type FilterId = CatId | "all";

export type Category = {
    id: FilterId;
    label: string;
    blurb: string;
    tint: string;
};

export const CATEGORIES: Category[] = [
    { id: "all", label: "All", blurb: "Everything in the box.", tint: "var(--primary)" },
    { id: "languages", label: "Languages", blurb: "What I write most of my code in.", tint: "oklch(0.72 0.16 75)" },
    { id: "backend", label: "Backend", blurb: "Where the data and the logic live.", tint: "oklch(0.68 0.17 10)" },
    { id: "frontend", label: "Frontend", blurb: "What people actually see and touch.", tint: "oklch(0.68 0.14 235)" },
    { id: "tooling", label: "Infra & delivery", blurb: "How Hermes gets built, shipped and run.", tint: "oklch(0.66 0.17 295)" },
];

export const LEVELS = ["Learning", "Comfortable", "Strong", "Daily driver"] as const;

export type Skill = {
    id: string;
    name: string;
    mark: string;
    cat: CatId;
    level: 1 | 2 | 3 | 4;
    note: string;
    usedIn?: string;
    related: string[];
};

/**
 * Levels are self-assessed. Review them before publishing.
 * Every note points at a real project in this portfolio.
 */
export const SKILLS: Skill[] = [
    {
        id: "java", name: "Java", mark: "Ja", cat: "languages", level: 3,
        note: "Where I started, and what I use for every backend. It taught me to think in types, objects and structure.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "sql"],
    },
    {
        id: "typescript", name: "TypeScript", mark: "TS", cat: "languages", level: 4,
        note: "Types catch my mistakes before users do. I reach for it on every frontend.",
        usedIn: "This portfolio, Hermes UI, AlgoForge",
        related: ["react", "next", "javascript"],
    },
    {
        id: "javascript", name: "JavaScript", mark: "JS", cat: "languages", level: 3,
        note: "The language underneath it all. I like knowing what the compiler is hiding.",
        related: ["typescript", "react", "next"],
    },
    {
        id: "python", name: "Python", mark: "Py", cat: "languages", level: 2,
        note: "For small, sharp tools. Calculate is a parser and evaluator with 100+ tests.",
        usedIn: "Calculate",
        related: ["java", "typescript", "docker"],
    },
    {
        id: "spring", name: "Spring Boot", mark: "Sb", cat: "backend", level: 3,
        note: "REST, WebSocket/STOMP, Security and JPA. My go-to backend, learned by building and breaking things.",
        usedIn: "Hermes, Pokeverse",
        related: ["java", "rest", "sql", "redis"],
    },
    {
        id: "rest", name: "REST APIs", mark: "API", cat: "backend", level: 3,
        note: "Clear routes, predictable responses, plus JWT and Google OAuth2 sign-in.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "next", "sql"],
    },
    {
        id: "sql", name: "SQL", mark: "SQL", cat: "backend", level: 2,
        note: "MySQL in Hermes. PostgreSQL with Flyway migrations in Pokeverse.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "java"],
    },
    {
        id: "redis", name: "Redis", mark: "Rd", cat: "backend", level: 2,
        note: "Rate limiting, caching and live game state.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "docker"],
    },
    {
        id: "react", name: "React", mark: "Re", cat: "frontend", level: 4,
        note: "Where I fell for the frontend. Small components that compose into whole screens.",
        usedIn: "This portfolio, Hermes, Pokeverse",
        related: ["typescript", "next", "tailwind"],
    },
    {
        id: "next", name: "Next.js", mark: "Nx", cat: "frontend", level: 4,
        note: "Routing, rendering and deployment in one place, so I can focus on the product.",
        usedIn: "This portfolio, Pokeverse, AlgoForge",
        related: ["react", "typescript", "tailwind"],
    },
    {
        id: "tailwind", name: "Tailwind CSS", mark: "Tw", cat: "frontend", level: 4,
        note: "Utility classes keep spacing and colour consistent without leaving the markup.",
        usedIn: "This portfolio, Pokeverse",
        related: ["react", "next", "framer"],
    },
    {
        id: "framer", name: "Framer Motion", mark: "Fm", cat: "frontend", level: 3,
        note: "Springs and gestures that respond to the visitor instead of looping on their own.",
        usedIn: "This portfolio",
        related: ["react", "tailwind", "typescript"],
    },
    {
        id: "docker", name: "Docker", mark: "Dk", cat: "tooling", level: 3,
        note: "Multi-stage builds, non-root users and Compose for local development.",
        usedIn: "Hermes, Pokeverse",
        related: ["kubernetes", "ci", "spring"],
    },
    {
        id: "kubernetes", name: "Kubernetes (k3s)", mark: "K8", cat: "tooling", level: 2,
        note: "A two-VM k3s cluster on GCP: deployments, ingress and default-deny network policies.",
        usedIn: "Hermes",
        related: ["docker", "terraform", "ci"],
    },
    {
        id: "ci", name: "GitHub Actions", mark: "CI", cat: "tooling", level: 2,
        note: "A pipeline for Hermes: tests, Trivy scan, Docker build and rollout. Written, not yet switched on.",
        usedIn: "Hermes",
        related: ["docker", "kubernetes", "terraform"],
    },
    {
        id: "terraform", name: "Terraform & Ansible", mark: "Tf", cat: "tooling", level: 2,
        note: "Terraform builds the GCP network and VMs. Ansible sets up k3s, hardening and monitoring.",
        usedIn: "Hermes",
        related: ["kubernetes", "docker", "ci"],
    },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const CAT_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const COLS = 4;
