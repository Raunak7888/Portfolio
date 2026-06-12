"use client";

import React from "react";
import { motion } from "framer-motion";
import { Project } from "@/components/section/project/project";

interface ProjectNavigatorProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  wip: "In Progress",
  archived: "Archived",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  live: "bg-emerald-500",
  wip: "bg-amber-400",
  archived: "bg-neutral-600",
};

export function ProjectNavigator({
  projects,
  activeIndex,
  onSelect,
}: ProjectNavigatorProps) {
  return (
    <nav
      className="flex flex-col gap-1 w-full"
      role="tablist"
      aria-label="Project list"
    >
      {projects.map((project, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={project.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`project-panel-${project.id}`}
            onClick={() => onSelect(i)}
            className={`
              relative w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500
              ${
                isActive
                  ? "border-neutral-700 bg-neutral-900"
                  : "border-transparent bg-transparent hover:bg-neutral-900/50 hover:border-neutral-800/60"
              }
            `}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-6 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}

            <div className="pl-2 flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-semibold tracking-tight transition-colors duration-150 ${
                    isActive ? "text-white" : "text-neutral-500"
                  }`}
                >
                  {project.title}
                </span>

                {/* Status dot */}
                <span className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_COLOR[project.status]}`}
                  />
                  <span className="text-[10px] text-neutral-600 font-medium tracking-wide uppercase">
                    {STATUS_LABEL[project.status]}
                  </span>
                </span>
              </div>

              <span
                className={`text-xs leading-snug transition-colors duration-150 line-clamp-1 ${
                  isActive ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {project.tagline}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}