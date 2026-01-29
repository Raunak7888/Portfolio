import type { Node, Edge } from "@xyflow/react";
import React from "react";
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
export const TECHS = [
    // ===== Languages =====
    {
        id: "javascript",
        label: "JavaScript",
        icon: <SiJavascript />,
        type: TECH_TYPE.LANGUAGE,
        position: { x: -150, y: 240 },
        scalability: "Moderate",
        debuggability: "Moderate",
        consistency: "Low",
        description:
            "Dynamic, event-driven language powering the web; flexible but prone to runtime errors without strong constraints.",
    },
    {
        id: "typescript",
        label: "TypeScript",
        icon: <SiTypescript />,
        type: TECH_TYPE.LANGUAGE,
        position: { x: -150, y: 340 },
        scalability: "High",
        debuggability: "High",
        consistency: "High",
        description:
            "Statically typed superset of JavaScript that improves correctness, refactoring safety, and large-scale maintainability.",
    },
    {
        id: "java",
        label: "Java",
        icon: <FaJava />,
        type: TECH_TYPE.LANGUAGE,
        position: { x: -150, y: 440 },
        scalability: "Very High",
        debuggability: "High",
        consistency: "High",
        description:
            "Strongly typed, JVM-based language designed for long-running, concurrent, and production-grade backend systems.",
    },
    {
        id: "python",
        label: "Python",
        icon: <SiPython />,
        type: TECH_TYPE.LANGUAGE,
        position: { x: -150, y: 540 },
        scalability: "Moderate",
        debuggability: "Moderate",
        consistency: "Moderate",
        description:
            "High-level language emphasizing readability and rapid development, commonly used for scripting, automation, and data tasks.",
    },

    {
        id: "react",
        label: "React",
        icon: <SiReact />,
        type: TECH_TYPE.FRAMEWORK,
        position: { x: 30, y: 285 },
        scalability: "High",
        debuggability: "Moderate",
        consistency: "High",
        description:
            "Component-based UI library enabling declarative interfaces and reusable view logic.",
    },
    {
        id: "nextjs",
        label: "Next.js",
        icon: <SiNextdotjs />,
        type: TECH_TYPE.FRAMEWORK,
        position: { x: 350, y: 285 },
        scalability: "Very High",
        debuggability: "High",
        consistency: "High",
        description:
            "React framework providing routing, SSR, and production-grade tooling for full-stack web applications.",
    },
    {
        id: "tailwind",
        label: "Tailwind CSS",
        icon: <SiTailwindcss />,
        type: TECH_TYPE.FRAMEWORK,
        position: { x: 200, y: 240 },
        scalability: "High",
        debuggability: "High",
        consistency: "High",
        description:
            "Utility-first CSS framework that enforces design consistency and eliminates ad-hoc styling.",
    },
    {
        id: "springboot",
        label: "Spring Boot",
        icon: <SiSpringboot />,
        type: TECH_TYPE.FRAMEWORK,
        position: { x: 30, y: 440 },
        scalability: "Very High",
        debuggability: "High",
        consistency: "High",
        description:
            "Opinionated Java framework for building secure, scalable, and production-ready backend services.",
    },

    {
        id: "postgresql",
        label: "PostgreSQL",
        icon: <SiPostgresql />,
        type: TECH_TYPE.DATABASE,
        position: { x: 200, y: 390 },
        scalability: "High",
        debuggability: "High",
        consistency: "Very High",
        description:
            "Relational database emphasizing correctness, strong constraints, and complex query capabilities.",
    },
    {
        id: "redis",
        label: "Redis",
        icon: <SiRedis />,
        type: TECH_TYPE.DATABASE,
        position: { x: 200, y: 490 },
        scalability: "High",
        debuggability: "Moderate",
        consistency: "Moderate",
        description:
            "In-memory data store optimized for caching, rate limiting, and fast ephemeral data access.",
    },

    {
        id: "docker",
        label: "Docker",
        icon: <SiDocker />,
        type: TECH_TYPE.TOOL,
        position: { x: 350, y: 440 },
        scalability: "High",
        debuggability: "Moderate",
        consistency: "High",
        description:
            "Containerization platform ensuring consistent runtime environments across development and production.",
    },
    {
        id: "git",
        label: "Git",
        icon: <SiGit />,
        type: TECH_TYPE.TOOL,
        position: { x: -350, y: 390 },
        scalability: "High",
        debuggability: "Moderate",
        consistency: "High",
        description:
            "Distributed version control system enabling collaboration, history tracking, and safe iteration.",
    },

    // ===== Security =====
    {
        id: "jwt",
        label: "JWT",
        icon: <SiJsonwebtokens />,
        type: TECH_TYPE.SECURITY,
        position: { x: 125, y: 540 },
        scalability: "High",
        debuggability: "Low",
        consistency: "Moderate",
        description:
            "Stateless token format for authentication; simple to scale but risky without strict expiration and rotation.",
    },
    {
        id: "oauth2",
        label: "OAuth 2.0",
        icon: <TbBrandOauth />,
        type: TECH_TYPE.SECURITY,
        position: { x: 125, y: 340 },
        scalability: "Very High",
        debuggability: "Low",
        consistency: "High",
        description:
            "Authorization framework enabling secure delegated access between services and identity providers.",
    },
];

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

    const edges: Edge[] = [
        // ===== Language → Framework =====
        {
            id: "e-js-react",
            source: "javascript",
            target: "react",
            animated: true,
        },
        {
            id: "e-ts-react",
            source: "typescript",
            target: "react",
            animated: true,
        },
        {
            id: "e-react-tailwind",
            source: "react",
            target: "tailwind",
            animated: true,
        },
        {
            id: "e-react-nextjs",
            source: "react",
            target: "nextjs",
            animated: true,
        },
        {
            id: "e-tailwind-nextjs",
            source: "tailwind",
            target: "nextjs",
            animated: true,
        },

        {
            id: "e-java-spring",
            source: "java",
            target: "springboot",
            animated: true,
        },

        // ===== Backend → Databases =====
        {
            id: "e-spring-postgres",
            source: "springboot",
            target: "postgresql",
            animated: true,
        },
        {
            id: "e-spring-redis",
            source: "springboot",
            target: "redis",
            animated: true,
        },

        // ===== Databases → Tooling =====
        {
            id: "e-postgres-docker",
            source: "postgresql",
            target: "docker",
            animated: true,
        },
        {
            id: "e-redis-docker",
            source: "redis",
            target: "docker",
            animated: true,
        },

        // ===== Spring Boot → Security & Infra =====
        {
            id: "e-spring-jwt",
            source: "springboot",
            target: "jwt",
            animated: true,
        },
        {
            id: "e-spring-oauth2",
            source: "springboot",
            target: "oauth2",
            animated: true,
        },
        {
            id: "e-spring-docker",
            source: "springboot",
            target: "docker",
            animated: true,
        },

        // ===== Next.js → Security =====
        {
            id: "e-oauth2-nextjs",
            source: "oauth2",
            target: "nextjs",
            animated: true,
        },

        // ===== Git → All Languages =====
        { id: "e-git-js", source: "git", target: "javascript", animated: true },
        { id: "e-git-ts", source: "git", target: "typescript", animated: true },
        { id: "e-git-java", source: "git", target: "java", animated: true },
        { id: "e-git-python", source: "git", target: "python", animated: true },
    ];

    return { nodes, edges };
};
