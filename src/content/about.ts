import { ViewIcon, Layers01Icon, RefreshIcon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { portfolio } from "./data";

const ICONS = { view: ViewIcon, layers: Layers01Icon, refresh: RefreshIcon, rocket: Rocket01Icon } as const;
type IconKey = keyof typeof ICONS;

const a = portfolio.about;

export const about = {
    greeting: a.greeting,
    headingTop: a.headingTop,
    headingBottom: a.headingBottom,
    paragraph: a.paragraph,
    half: a.half,
    currently: a.currently,
    topics: a.topics ?? [],
    cta: a.cta ?? { label: "", href: "#about" },
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

const TINTS = ["oklch(0.72 0.16 75)", "oklch(0.68 0.14 235)", "oklch(0.68 0.17 10)", "oklch(0.66 0.17 295)"];

export const PILLARS: Pillar[] = (a.pillars ?? []).map((p, i) => ({
    id: p.id,
    icon: ICONS[(p.iconKey ?? "view") as IconKey] ?? ViewIcon,
    kicker: p.kicker,
    title: p.title,
    text: p.text,
    emoji: p.emoji ?? "✨",
    backTitle: p.backTitle ?? p.title,
    backText: p.backText ?? p.text,
    tint: p.tint ?? TINTS[i % TINTS.length],
    tilt: p.tilt ?? 0,
}));

export const MASCOT_LINES = a.mascotLines?.length ? a.mascotLines : ["Hey!"];
