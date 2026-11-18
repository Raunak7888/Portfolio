"use client";

import type { ComponentType } from "react";
import type { Project, Screenshot } from "@/types/portfolio";
import Blueprint from "./Blueprint";
import Bubble from "./Bubble";
import Cover from "./Cover";
import Focus from "./Focus";
import Pan from "./Pan";
import Strata from "./Strata";
import { Missing, type InteractionProps } from "./parts";

/*
 * One screenshot per project, one unique hover each.
 * Resolution order:
 *   1. project.interaction, if it names one of the keys below
 *   2. keyword match on project id / name
 *   3. stable hash of the id, so different projects still differ
 */
const REGISTRY: Record<string, ComponentType<InteractionProps>> = {
    bubble: Bubble,
    blueprint: Blueprint,
    focus: Focus,
    strata: Strata,
    cover: Cover,
    pan: Pan,
};
const KEYS = Object.keys(REGISTRY);

// field names that might hold the screenshot list on a Project
const SHOT_KEYS = ["screenshots", "shots", "images", "screens"] as const;

const KEYWORDS: [RegExp, string][] = [
    [/hermes|chat/, "bubble"],
    [/algo/, "focus"],
    [/atmos|climate|air/, "strata"],
    [/study|life|planner|tracker|knowledge/, "cover"],
    [/portfolio|site|cms/, "pan"],
];

function pick(project: Project): string {
    const rec = project as unknown as Record<string, unknown>;
    const explicit = typeof rec.interaction === "string" ? rec.interaction : "";
    if (explicit && REGISTRY[explicit]) return explicit;

    const hay = `${rec.id ?? ""} ${rec.name ?? ""}`.toLowerCase();
    for (const [re, key] of KEYWORDS) if (re.test(hay)) return key;

    let h = 0;
    for (const c of hay) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return KEYS[h % KEYS.length];
}

function shotsOf(project: Project): Screenshot[] {
    const rec = project as unknown as Record<string, unknown>;
    for (const k of SHOT_KEYS) {
        const v = rec[k];
        if (Array.isArray(v) && v.length) return v as Screenshot[];
    }
    return [];
}

export default function ProjectMedia({
    project,
    reduce,
}: {
    project: Project;
    enter?: unknown;
    exit?: unknown;
    live?: boolean;
    reduce: boolean;
}) {
    const all = shotsOf(project);
    if (!all.length) return <Missing name={project.name} />;

    const Cmp = REGISTRY[pick(project)];
    return <Cmp project={project} shots={all.slice(0, 1)} reduce={reduce} />;
}
