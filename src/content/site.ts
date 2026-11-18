import { portfolio } from "./data";

const links = portfolio.heroSection.socialLinks;
const LABELS: Record<string, string> = {
    githubUrl: "GitHub",
    linkedInUrl: "LinkedIn",
    instagramUrl: "Instagram",
    twitterUrl: "X",
    youtubeUrl: "YouTube",
};

/** Identity, links and the tech ticker. All values come from Data.json. */
export const site = {
    firstName: portfolio.hero.firstName,
    fullName: portfolio.hero.fullName,
    email: portfolio.hero.email,
    location: portfolio.site.location,
    timezone: portfolio.site.timezone,
    social: Object.entries(links)
        .filter(([k, v]) => k !== "gmailUrl" && typeof v === "string" && v)
        .map(([k, v]) => ({
            label: LABELS[k] ?? k.replace(/Url$/, "").replace(/^./, (c) => c.toUpperCase()),
            href: v,
        })),
    stack: portfolio.site.stack,
    nav: [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
        { label: "Contact", href: "#contact" },
    ],
};
