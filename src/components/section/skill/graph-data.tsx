import type { Node, Edge } from "@xyflow/react";
import React, { JSX } from "react";
import {
    SiJavascript,
    SiTypescript,
    SiPython,
    SiReact,
    SiNextdotjs,
    SiTailwindcss,
    SiSpringboot,
    SiPostgresql,
    SiRedis,
    SiDocker,
    SiGit,
    SiJsonwebtokens,
} from "react-icons/si";
import { TbBrandOauth } from "react-icons/tb";
import { FaJava } from "react-icons/fa";
import data from "@/Data/Data.json";
/* -------------------- Tech Types -------------------- */

export const TECH_TYPE = {
    LANGUAGE: "Language",
    FRAMEWORK: "Framework",
    DATABASE: "Database",
    TOOL: "Tool",
    SECURITY: "Security",
} as const;

export type TechCategory = (typeof TECH_TYPE)[keyof typeof TECH_TYPE];

/* -------------------- Node Data -------------------- */

export interface TechNodeData {
    label: string;
    icon: React.ReactNode;
    type: TechCategory;
    scalability: string;
    debuggability: string;
    consistency: string;
    description: string;
    onOpen: () => void;
    [key: string]: unknown;
}

/* -------------------- Base Tech Definitions -------------------- */
/**
 * Single source of truth.
 * No React Flow knowledge here.
 */
export const ICON_MAP: Record<string, JSX.Element> = {
    SiJavascript: <SiJavascript />,
    SiTypescript: <SiTypescript />,
    SiPython: <SiPython />,
    SiReact: <SiReact />,
    SiNextdotjs: <SiNextdotjs />,
    SiTailwindcss: <SiTailwindcss />,
    SiSpringboot: <SiSpringboot />,
    SiPostgresql: <SiPostgresql />,
    SiRedis: <SiRedis />,
    SiDocker: <SiDocker />,
    SiGit: <SiGit />,
    SiJsonwebtokens: <SiJsonwebtokens />,
    TbBrandOauth: <TbBrandOauth />,
    FaJava: <FaJava />,
};

export const TECHS = data.skills.nodes.map((node) => ({
    id: node.id,
    label: node.data.label,
    icon: ICON_MAP[node.data.icon_id],
    type: node.data.category as TechCategory, // 🔑 FIX
    position: node.position,
    scalability: node.data.scalability,
    debuggability: node.data.debuggability,
    consistency: node.data.consistency,
    description: node.data.description,
}));


export const createGraphData = (
    onOpen: (data: TechNodeData) => void,
): {
    nodes: Node<TechNodeData>[];
    edges: Edge[];
} => {
    const nodes: Node<TechNodeData>[] = TECHS.map((tech) => ({
        id: tech.id,
        type: "tech",
        position: tech.position,
        data: {
            label: tech.label,
            icon: tech.icon,
            type: tech.type,
            scalability: tech.scalability,
            debuggability: tech.debuggability,
            consistency: tech.consistency,
            description: tech.description,
            onOpen: () =>
                onOpen({
                    label: tech.label,
                    icon: tech.icon,
                    type: tech.type,
                    onOpen: () => {},
                    scalability: tech.scalability,
                    debuggability: tech.debuggability,
                    consistency: tech.consistency,
                    description: tech.description,
                }),
        },
    }));

    const edges: Edge[] = data.skills.edges;

    return { nodes, edges };
};
