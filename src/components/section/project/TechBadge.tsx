"use client";

import React from "react";
import {
  CodeIcon,
  Database01Icon,
  CloudIcon,
  ShieldIcon,
  ChartLineDataIcon,
  BracketsIcon,
  JavaIcon,
  GitCompareIcon,
  SparklesIcon,
  WebProgrammingIcon,
  Github01Icon,
} from "@hugeicons/core-free-icons";

import { 
  SiDocker, 
  SiKubernetes, 
  SiAmazon, 
  SiGooglecloud, 
  SiSpring, 
  SiReact, 
  SiTypescript, 
  SiRedis, 
  SiGithub, 
  SiTerraform,
  SiPostgresql
} from "react-icons/si";
import { HugeiconsIcon } from "@hugeicons/react";

const iconRegistry: Record<string, React.ReactNode> = {
  java:        <HugeiconsIcon icon={JavaIcon} size={12} />,
  nextjs:      <HugeiconsIcon icon={WebProgrammingIcon} size={12} />,
  security:    <HugeiconsIcon icon={ShieldIcon} size={12} />,
  analytics:   <HugeiconsIcon icon={ChartLineDataIcon} size={12} />,
  ai:          <HugeiconsIcon icon={SparklesIcon} size={12} />,
  terraform:   <SiTerraform size={12} />,
  spring:      <SiSpring size={12} />,
  react:       <SiReact size={12} />,
  typescript:  <SiTypescript size={12} />,
  github:      <HugeiconsIcon icon={Github01Icon} size={12} />,
  postgres:    <SiPostgresql size={12} />,
  redis:       <SiRedis size={12} />,
  docker:      <SiDocker size={12} />,
  kubernetes:  <SiKubernetes size={12} />,
  gcp:         <SiGooglecloud size={12} />,
  aws:         <SiAmazon size={12} />,
  default:     <HugeiconsIcon icon={CodeIcon} size={12} />,
};

interface TechBadgeProps {
  name: string;
  iconKey: string;
}

export function TechBadge({ name, iconKey }: TechBadgeProps) {
  const icon = iconRegistry[iconKey.toLowerCase()] ?? iconRegistry.default;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 text-[11px] font-medium tracking-wide whitespace-nowrap select-none">
      <span className="text-neutral-500 flex items-center justify-center">{icon}</span>
      {name}
    </span>
  );
}