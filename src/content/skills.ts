import { portfolio } from "./data";

const s = portfolio.sections.skills;

export const copy = {
    index: s.index ?? "02",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    hintFine: s.hintFine,
    hintTouch: s.hintTouch,
    emptyTitle: s.emptyTitle,
    emptyText: s.emptyText,
    done: s.done,
    allBlurb: s.allBlurb ?? "Everything in the box.",
};

export type CatId = string;
export type FilterId = string;
export type Category = { id: FilterId; label: string; blurb: string; tint: string };
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

const PALETTE = [
    "oklch(0.72 0.16 75)",
    "oklch(0.68 0.17 10)",
    "oklch(0.68 0.14 235)",
    "oklch(0.66 0.17 295)",
    "oklch(0.72 0.17 150)",
];

export const LEVELS: readonly string[] = portfolio.skills.levels?.length
    ? portfolio.skills.levels
    : ["Learning", "Comfortable", "Strong", "Daily driver"];

const titleCase = (v: string) => v.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const markOf = (name: string) => {
    const w = name.split(/[\s.&()]+/).filter(Boolean);
    const m = w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2);
    return m.charAt(0).toUpperCase() + m.slice(1);
};
const clampLevel = (n: unknown): 1 | 2 | 3 | 4 => {
    const v = Math.round(typeof n === "number" ? n : 2);
    return Math.min(4, Math.max(1, v)) as 1 | 2 | 3 | 4;
};

const seen = new Set<string>();
const list = (portfolio.skills.skills ?? []).filter((x) => {
    if (!x?.id || !x?.name || seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
});

/** Skills with every optional field filled in. */
export const SKILLS: Skill[] = list.map((x) => ({
    id: x.id,
    name: x.name,
    mark: x.mark ?? markOf(x.name),
    cat: x.cat ?? "other",
    level: clampLevel(x.level),
    note: x.note ?? "",
    usedIn: x.usedIn || undefined,
    related: (x.related ?? []).filter((r) => seen.has(r) && r !== x.id),
}));

const declared = new Map((portfolio.skills.categories ?? []).map((c) => [c.id, c]));
const used: string[] = [];
for (const sk of SKILLS) if (!used.includes(sk.cat)) used.push(sk.cat);
// declared categories keep their JSON order; unknown ones are added automatically
const ordered = [
    ...(portfolio.skills.categories ?? []).map((c) => c.id).filter((id) => used.includes(id)),
    ...used.filter((id) => !declared.has(id)),
];

export const CATEGORIES: Category[] = [
    { id: "all", label: "All", blurb: copy.allBlurb, tint: "var(--primary)" },
    ...ordered.map((id, i) => {
        const c = declared.get(id);
        return {
            id,
            label: c?.label ?? titleCase(id),
            blurb: c?.blurb ?? "",
            tint: c?.tint ?? PALETTE[i % PALETTE.length],
        };
    }),
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((x) => [x.id, x]));
export const CAT_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const COLS = 4;
