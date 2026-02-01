"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ReactFlow, Controls, useNodesState, useEdgesState, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Divider from "../Divider";
import { TechListMobile } from "./TechListMobile";
import { createGraphData, TECH_TYPE, TechCategory, TechNodeData } from "./graph-data";
import { TYPE_STYLES } from "./type-styles";
import { nodeTypes } from "./TechNode";
import SkillModal from "./SkillModal";

gsap.registerPlugin(ScrollTrigger);

const SkillGraph = () => {
    const [activeTech, setActiveTech] = useState<TechNodeData | null>(null);
    const graph = useMemo(() => createGraphData(setActiveTech), []);
    const [nodes, , onNodesChange] = useNodesState(graph.nodes);
    const [edges, , onEdgesChange] = useEdgesState(graph.edges);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: frameRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                }
            });

            // Aperture Opening
            tl.set(".graph-frame", { clipPath: "inset(50% 0 50% 0)", opacity: 1 });
            tl.set(".react-flow__node", { opacity: 0, scale: 0.8, filter: "blur(4px)" });

            tl.to(".graph-frame", {
                clipPath: "inset(0% 0 0% 0)",
                duration: 1.2,
                ease: "expo.inOut"
            })
            .fromTo(".border-scanner", 
                { top: "-5%", opacity: 0 }, 
                { top: "105%", opacity: 1, duration: 1.5, ease: "power2.inOut" },
                "-=0.5"
            )
            .to(".react-flow__node", {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                stagger: { each: 0.05, from: "center" },
                duration: 0.8,
                ease: "power4.out"
            }, "-=1.0");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="lg:px-30 2xl:px-42 py-12 relative text-foreground">
            <Divider sectionName="Skills" />

            {/* Desktop Viewport */}
            <div 
                ref={frameRef}
                className="graph-frame hidden md:block relative h-150 rounded-[2.5rem] border-2 border-foreground/10  opacity-0 overflow-hidden shadow-2xl"
            >
                {/* Cinematic Scan Line */}
                <div className="border-scanner absolute left-0 w-full h-px bg-primary z-20 pointer-events-none shadow-[0_0_15px_var(--primary)]" />

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    zoomOnScroll={false}
                    fitViewOptions={{ padding: 0.2 }}
                    nodesConnectable={false}
                    nodesDraggable={true}
                    
                >
                    {/* Background Grid using Foreground color for subtle contrast */}
                    {/* <Background color="currentColor" className="text-foreground/5" gap={30} size={1} /> */}
                    
                    <Controls className="bg-background! border-foreground/10! fill-foreground! text-foreground!" />

                    {/* Themed Legend */}
                    <motion.div
                        drag
                        dragConstraints={containerRef}
                        className="absolute z-50 cursor-grab active:cursor-grabbing rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-xl p-6 min-w-25 shadow-xl"
                        initial={{ x: 30, y: 30 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Matrix Registry</span>
                        </div>
                        
                        <div className="space-y-2">
                            {(Object.values(TECH_TYPE) as TechCategory[]).map((type) => (
                                <div key={type} className="flex items-center gap-2 group cursor-default">
                                    {/* Using TYPE_STYLES for the dot but strictly Background/Foreground for the text */}
                                    <div 
                                        className="w-2 h-2 rounded-full border border-foreground/20" 
                                        style={{ backgroundColor: TYPE_STYLES[type].legend }} 
                                    />
                                    <span className="text-[11px] font-bold text-foreground/40 group-hover:text-primary transition-colors uppercase tracking-widest">
                                        {type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </ReactFlow>
            </div>

            {/* Mobile Viewport */}
            <div className="md:hidden rounded-3xl p-4 ">
                <TechListMobile nodes={nodes} onOpen={setActiveTech} />
            </div>

            <AnimatePresence>
                {activeTech && (
                    <SkillModal
                        {...activeTech}
                        title={activeTech.label}
                        category={activeTech.type}
                        isOpen={!!activeTech}
                        onClose={() => setActiveTech(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillGraph;