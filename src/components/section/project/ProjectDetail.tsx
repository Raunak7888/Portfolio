"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Data from "@/Data/Project.json";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  ArrowUpRight,
  GitBranch,
  Layers,
  AlertCircle,
  Milestone,
  ChevronRight,
  Zap,
  Play,
  Circle,
  ExternalLink,
  Code2,
  Database,
  Globe,
  Cpu,
  ArrowRight,
} from "lucide-react";

import ProjectFooter from "./details/ProjectFooter";
import { ProjectData } from "@/components/section/project/details/Types";

gsap.registerPlugin(ScrollTrigger);

const MermaidDiagram = dynamic(
  () => import("./details/MermaidScript").then((m) => m.MermaidDiagram),
  { ssr: false }
);

/* ─── Constants ─── */
const ROADMAP_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  shortTerm: { label: "Near Term", color: "#22c55e", dotColor: "#166534" },
  midTerm:   { label: "Mid Term",  color: "#3b82f6", dotColor: "#1d4ed8" },
  longTerm:  { label: "Long Term", color: "#a855f7", dotColor: "#7e22ce" },
};

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  frontend: <Globe size={14} />,
  backend:  <Cpu    size={14} />,
  database: <Database size={14} />,
  broker:   <Code2  size={14} />,
};

/* ─── Sub-components ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
       style={{ color: "#525252" }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #1a1a1a" }} className="mx-6 lg:mx-20" />;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-2 group"
         style={{ background: "#111111", border: "1px solid #1f1f1f" }}>
      <p className="text-[10px] font-semibold tracking-[0.16em] uppercase"
         style={{ color: "#525252" }}>{label}</p>
      <p className="text-4xl font-black tracking-tight" style={{ color: "#ffffff" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "#404040" }}>{sub}</p>}
    </div>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium"
          style={{
            background: accent ? "#0f1f0f" : "#141414",
            color: accent ? "#4ade80" : "#737373",
            border: `1px solid ${accent ? "#14532d" : "#262626"}`,
          }}>
      {children}
    </span>
  );
}

/* ─── Main Component ─── */

const ProjectDetail = ({ projectId }: { projectId: string }) => {
  const data = (Data as unknown as Record<string, ProjectData>)[projectId];

  const containerRef        = useRef<HTMLDivElement | null>(null);
  const galleryTriggerRef   = useRef<HTMLDivElement | null>(null);
  const gallerySectionRef   = useRef<HTMLDivElement | null>(null);
  const heroRef             = useRef<HTMLElement | null>(null);

  const [heroVisible, setHeroVisible]   = useState(false);
  const [terminalLine, setTerminalLine] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const allTech = [
    ...(data.technologyStack?.backend  ?? []),
    ...(data.technologyStack?.frontend ?? []),
  ];

  /* scroll to top */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* terminal typing effect */
  useEffect(() => {
    if (!heroVisible) return;
    const lines = 5;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTerminalLine(i);
      if (i >= lines) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [heroVisible]);

  /* GSAP */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        if (gallerySectionRef.current && galleryTriggerRef.current) {
          const w = gallerySectionRef.current.scrollWidth;
          gsap.to(gallerySectionRef.current, {
            x: () => -(w - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: galleryTriggerRef.current,
              pin: true,
              scrub: 0.5,
              start: "top top",
              end: () => `+=${w}`,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const terminalLines = [
    `> project: ${data.meta.projectName}`,
    `> version: v${data.meta.version}`,
    `> status: ${data.meta.status}`,
    `> codename: ${data.meta.codename}`,
    `> updated: ${data.meta.lastUpdated}`,
  ];

  return (
    <div
      ref={containerRef}
      style={{
        background: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "var(--font-geist-sans, Inter, system-ui, sans-serif)",
      }}
      className="min-h-screen overflow-x-hidden selection:bg-white"
    >
      {/* ── Progress bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 origin-left"
        style={{ scaleX, height: "1px", background: "#ffffff" }}
      />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-between px-6 lg:px-20 pt-24 pb-16 overflow-hidden"
      >
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.35,
          }}
        />
        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #0a0a0a 100%)",
          }}
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill accent>{data.meta.status}</Pill>
            <Pill>{data.meta.codename}</Pill>
            <Pill>v{data.meta.version}</Pill>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href={data.meta.repository}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-200 hover:opacity-75"
              style={{ background: "#ffffff", color: "#000000" }}
            >
              <GitBranch size={12} /> GitHub <ArrowUpRight size={12} />
            </Link>
            {data.meta.live && (
              <Link
                href={data.meta.live}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 border-2 border-foreground hover:bg-foreground hover:text-background rounded-2xl text-xs font-medium transition-all duration-200"
              >
                <Globe size={12} /> Live Demo <ArrowUpRight size={12} />
              </Link>
            )}
            {data.meta.post && (
              <Link
                href={data.meta.post}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-200 hover:opacity-75"
                style={{ background: "#141414", color: "#a3a3a3", border: "1px solid #262626" }}
              >
                Medium <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12 mt-auto">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.85]"
              style={{ fontSize: "clamp(3.2rem, 11vw, 10rem)", color: "#ffffff" }}
            >
              {data.meta.projectName}
              <span style={{ color: "#262626" }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base lg:text-xl leading-relaxed max-w-2xl"
              style={{ color: "#737373" }}
            >
              {data.executiveSummary.oneLiner}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={heroVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={data.meta.repository}
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                <GitBranch size={14} /> View Repository <ArrowUpRight size={14} />
              </Link>
              {data.meta.post && (
                <Link
                  href={data.meta.post}
                  target="_blank"
                  className="lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-80"
                  style={{ background: "#141414", color: "#a3a3a3", border: "1px solid #262626" }}
                >
                  Read Post <ExternalLink size={14} />
                </Link>
              )}
            </motion.div>
          </div>

          {/* Terminal card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={heroVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block w-80 rounded-2xl overflow-hidden shrink-0"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #1a1a1a" }}>
              <span className="w-3 h-3 rounded-full" style={{ background: "#3a3a3a" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#3a3a3a" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#3a3a3a" }} />
              <span className="ml-2 text-[10px] font-medium" style={{ color: "#404040", fontFamily: "monospace" }}>
                project.info
              </span>
            </div>
            <div className="p-4 space-y-2">
              {terminalLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={terminalLine > i ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-mono"
                  style={{ color: i === 0 ? "#4ade80" : "#525252" }}
                >
                  {line}
                </motion.p>
              ))}
              {terminalLine >= 5 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-3 align-middle"
                  style={{ background: "#4ade80" }}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroVisible ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="relative mt-16 flex items-center gap-2"
          style={{ color: "#404040" }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <ChevronRight size={14} className="rotate-90" />
          </motion.div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase">Scroll to explore</p>
        </motion.div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          STATS ROW
      ════════════════════════════════════════════ */}
      <section className="reveal px-6 lg:px-20 py-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Primary Users"   value={`${data.executiveSummary.primaryUsers.length}+`}  sub="target personas" />
        <StatCard label="Key Capabilities" value={data.executiveSummary.keyCapabilities.length}    sub="core features" />
        <StatCard label="Components"       value={data.architecture.components.length}              sub="system modules" />
        <StatCard
          label="Last Updated"
          value={data.meta.lastUpdated !== "unknown" ? data.meta.lastUpdated : "—"}
          sub="release date"
        />
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          PROBLEM + SOLUTION
      ════════════════════════════════════════════ */}
      <section className="reveal px-6 lg:px-20 py-24">
        <SectionLabel>The Story</SectionLabel>
        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-16" style={{ color: "#ffffff" }}>
          Challenge &amp; Solution
        </h2>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Problem */}
          <div
            className="rounded-2xl p-8 lg:p-10 flex flex-col gap-6"
            style={{ background: "#100a0a", border: "1px solid #2a1515" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: "#1f0a0a", border: "1px solid #3b1a1a" }}>
                <AlertCircle size={14} style={{ color: "#ef4444" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#7f1d1d" }}>
                The Problem
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#a3a3a3" }}>
              {data.executiveSummary.problemStatement}
            </p>
          </div>

          {/* Solution */}
          <div
            className="rounded-2xl p-8 lg:p-10 flex flex-col gap-6"
            style={{ background: "#0a100a", border: "1px solid #152a15" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: "#0a1f0a", border: "1px solid #1a3b1a" }}>
                <Zap size={14} style={{ color: "#22c55e" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#166534" }}>
                The Solution
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#a3a3a3" }}>
              {data.executiveSummary.solutionOverview}
            </p>
          </div>
        </div>

        {/* Primary users */}
        {data.executiveSummary.primaryUsers.length > 0 && (
          <div className="mt-4 rounded-2xl p-8" style={{ background: "#111111", border: "1px solid #1f1f1f" }}>
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-5" style={{ color: "#525252" }}>
              Built For
            </p>
            <div className="flex flex-wrap gap-2">
              {data.executiveSummary.primaryUsers.map((u, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm"
                  style={{ background: "#141414", color: "#a3a3a3", border: "1px solid #262626" }}
                >
                  <Circle size={6} fill="currentColor" style={{ color: "#525252" }} />
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          VISUAL GALLERY  (horizontal scroll)
      ════════════════════════════════════════════ */}
      <section
        ref={galleryTriggerRef}
        className="py-16 lg:h-screen flex items-center overflow-hidden"
      >
        <div ref={gallerySectionRef} className="flex flex-col lg:flex-row gap-6 px-6 lg:px-20">
          <div className="lg:w-72 shrink-0 flex flex-col justify-center pr-0 lg:pr-12">
            <SectionLabel>Screenshots</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4"
                style={{ color: "#ffffff" }}>
              Visual<br /><span style={{ color: "#404040" }}>Overview</span>
            </h2>
            <p className="text-xs flex items-center gap-2" style={{ color: "#404040" }}>
              <Play size={10} fill="currentColor" /> Scroll to explore
            </p>
          </div>

          {data.images.map((img, i) => (
            <div
              key={i}
              className="relative shrink-0 overflow-hidden rounded-2xl group"
              style={{
                width: "clamp(320px, 64vw, 860px)",
                aspectRatio: "16/10",
                border: "1px solid #1f1f1f",
              }}
            >
              <Image
                src={img}
                alt={`${data.meta.projectName} screenshot ${i + 1}`}
                fill
                className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-[1.02]"
                unoptimized
              />
              <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-500 group-hover:opacity-0"
                style={{ background: "rgba(10,10,10,0.2)" }}
              />
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          CAPABILITIES
      ════════════════════════════════════════════ */}
      <section className="reveal px-6 lg:px-20 py-24">
        <SectionLabel>What It Does</SectionLabel>
        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-16" style={{ color: "#ffffff" }}>
          Key Capabilities
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.executiveSummary.keyCapabilities.map((cap, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-5 group transition-all duration-300 hover:border-neutral-700 cursor-default"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <Zap size={13} style={{ color: "#525252" }} className="group-hover:text-white transition-colors duration-300" />
                </span>
                <span className="text-[10px] font-mono" style={{ color: "#2e2e2e" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#d4d4d4" }}>
                {cap}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          ARCHITECTURE
      ════════════════════════════════════════════ */}
      <section className="reveal px-6 lg:px-20 py-24">
        <SectionLabel>System Design</SectionLabel>
        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4" style={{ color: "#ffffff" }}>
          Architecture
        </h2>

        {/* Overview */}
        <div
          className="mt-8 rounded-2xl p-8 mb-6"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "#737373" }}>
            {data.architecture.overview}
          </p>
          {data.architecture.architectureRationale && (
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "#404040" }}>
              ↳ {data.architecture.architectureRationale}
            </p>
          )}
        </div>

        {/* Bento grid: data flow + diagram */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Data flow */}
          <div className="rounded-2xl p-8" style={{ background: "#111111", border: "1px solid #1f1f1f" }}>
            <SectionLabel>Data Flow</SectionLabel>
            <div className="space-y-10">
              {data.architecture.dataFlow.map((flow) => (
                <div key={flow.flowName}>
                  <p className="text-xs font-semibold mb-4" style={{ color: "#ffffff" }}>
                    {flow.flowName}
                  </p>
                  <ol className="relative space-y-0">
                    {flow.steps.map((s, i) => (
                      <li key={i} className="flex gap-4">
                        {/* Timeline spine */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold"
                            style={{ background: "#1a1a1a", border: "1px solid #2e2e2e", color: "#525252" }}
                          >
                            {i + 1}
                          </div>
                          {i < flow.steps.length - 1 && (
                            <div className="w-px flex-1 mt-1 mb-1" style={{ background: "#1f1f1f", minHeight: "20px" }} />
                          )}
                        </div>
                        <p className="text-xs leading-relaxed pb-4 pt-1" style={{ color: "#737373" }}>
                          {s}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram */}
          <div className="rounded-2xl p-8 overflow-x-auto" style={{ background: "#0d0d0d", border: "1px solid #1f1f1f" }}>
            <SectionLabel>System Diagram</SectionLabel>
            <MermaidDiagram code={data.architecture.diagram.content} />
          </div>
        </div>

        {/* Components bento */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.architecture.components.map((comp) => (
            <div
              key={comp.name}
              className="rounded-2xl p-6 group hover:border-neutral-700 transition-colors duration-200"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: "#525252" }}>{COMPONENT_ICONS[comp.type] ?? <Layers size={14} />}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#525252" }}>
                  {comp.type}
                </span>
              </div>
              <p className="text-sm font-semibold mb-3" style={{ color: "#e5e5e5" }}>{comp.name}</p>
              {comp.responsibilities.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {comp.responsibilities.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: "#525252" }}>
                      <ArrowRight size={10} className="mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-1.5 pt-4" style={{ borderTop: "1px solid #1a1a1a" }}>
                {comp.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                    style={{ background: "#1a1a1a", color: "#737373", border: "1px solid #262626" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════
          TECH STACK
      ════════════════════════════════════════════ */}
      {allTech.length > 0 && (
        <section className="reveal px-6 lg:px-20 py-24">
          <SectionLabel>Built With</SectionLabel>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-16" style={{ color: "#ffffff" }}>
            Tech Stack
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allTech.map((tech, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 group transition-all duration-300 hover:border-neutral-700"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: "#e5e5e5" }}>{tech.name}</p>
                  {tech.version && tech.version !== "N/A" && (
                    <span
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 ml-2"
                      style={{ background: "#141414", color: "#525252", border: "1px solid #1f1f1f" }}
                    >
                      {tech.version}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed mb-5" style={{ color: "#737373" }}>
                  {tech.purpose}
                </p>
                <div
                  className="flex items-start gap-2 pt-4"
                  style={{ borderTop: "1px solid #1a1a1a" }}
                >
                  <span className="shrink-0 mt-0.5 text-[10px]" style={{ color: "#2e2e2e" }}>↳</span>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#404040" }}>
                    {tech.tradeOffs}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rejected alternatives */}
          {(data.technologyStack?.rejectedAlternatives?.length ?? 0) > 0 && (
            <div
              className="mt-4 rounded-2xl p-8"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              <SectionLabel>Considered &amp; Rejected</SectionLabel>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {data.technologyStack.rejectedAlternatives.map((alt) => (
                  <div key={alt.option} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-sm" style={{ color: "#3a3a3a" }}>✕</span>
                    <div>
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "#404040", textDecoration: "line-through" }}
                      >
                        {alt.option}
                      </p>
                      <p className="text-xs" style={{ color: "#333333" }}>{alt.reasonRejected}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <Divider />

      {/* ════════════════════════════════════════════
          KNOWN LIMITATIONS
      ════════════════════════════════════════════ */}
      {(data.executiveSummary.knownLimitations?.length ?? 0) > 0 && (
        <section className="reveal px-6 lg:px-20 py-12">
          <div
            className="rounded-2xl p-8 lg:p-10"
            style={{ background: "#0e0b00", border: "1px solid #2a2000" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#1a1400", border: "1px solid #3a2e00" }}
              >
                <AlertCircle size={14} style={{ color: "#ca8a04" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#92400e" }}>
                Known Limitations
              </p>
            </div>
            <ul className="space-y-3">
              {data.executiveSummary.knownLimitations.map((lim, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "#92400e" }}
                >
                  <span className="shrink-0 mt-2 w-1 h-1 rounded-full bg-current" />
                  {lim}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          ROADMAP
      ════════════════════════════════════════════ */}
      <section className="reveal px-6 lg:px-20 py-24">
        <SectionLabel>What&apos;s Next</SectionLabel>
        <h2
          className="text-3xl lg:text-5xl font-black tracking-tight mb-16 flex items-center gap-4"
          style={{ color: "#ffffff" }}
        >
          <Milestone size={32} style={{ color: "#404040" }} />
          Roadmap
        </h2>

        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(data.roadmap).map(([period, goals]) => {
            const cfg = ROADMAP_CONFIG[period] ?? { label: period, color: "#737373", dotColor: "#404040" };
            return (
              <div
                key={period}
                className="rounded-2xl p-6 lg:p-8 group hover:border-neutral-700 transition-colors duration-200"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "#525252" }}
                  >
                    {cfg.label}
                  </p>
                </div>
                <ul className="space-y-3">
                  {(goals as string[]).map((g) => (
                    <li
                      key={g}
                      className="flex items-start gap-3 text-xs leading-relaxed"
                      style={{ color: "#737373" }}
                    >
                      <ChevronRight size={12} className="shrink-0 mt-0.5" style={{ color: cfg.dotColor }} />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <ProjectFooter link={data.meta.repository} />
    </div>
  );
};

export default ProjectDetail;