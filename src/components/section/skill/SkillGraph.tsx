"use client";

import { useMemo, useState, useRef } from "react";

import {
    ReactFlow,
    Controls,
    useNodesState,
    useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Divider from "../Divider";
import { TechListMobile } from "./TechListMobile";
import {
    createGraphData,
    TECH_TYPE,
    TechCategory,
    TechNodeData,
} from "./graph-data";
import { TYPE_STYLES } from "./type-styles";
import { nodeTypes } from "./TechNode";
import SkillModal from "./SkillModal";
import React from "react";

const SkillGraph = () => {
    const [activeTech, setActiveTech] = useState<TechNodeData | null>(null);
    const graph = useMemo(() => createGraphData(setActiveTech), []);
    const [legendPos, setLegendPos] = useState({ x: 16, y: 16 });
    const legendRef = useRef<HTMLDivElement | null>(null);

    const [nodes, , onNodesChange] = useNodesState(graph.nodes);
    const [edges, , onEdgesChange] = useEdgesState(graph.edges);

    const onLegendMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const { x, y } = legendPos;

        const onMouseMove = (moveEvent: MouseEvent) => {
            setLegendPos({
                x: x + (moveEvent.clientX - startX),
                y: y + (moveEvent.clientY - startY),
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    return (
        <div className="lg:px-20 2xl:px-32">
            <Divider sectionName="Skills" />

            {/* Mobile */}
            <div className="md:hidden rounded-3xl  p-4">
                <TechListMobile nodes={nodes} onOpen={setActiveTech} />
            </div>

            {/* Desktop */}
            <div className="hidden md:block relative h-130 rounded-4xl border-2 border-foreground/20 overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    panOnScroll
                    nodesConnectable={false}
                >
                    <Controls
                        showInteractive={false}
                        orientation="horizontal"
                    />

                    {/* Legend */}
                    <div
                        ref={legendRef}
                        onMouseDown={onLegendMouseDown}
                        style={{
                            transform: `translate(${legendPos.x}px, ${legendPos.y}px)`,
                        }}
                        className="
                        absolute top-0 left-0 z-50
                        cursor-grab
                        
                        rounded-xl
                        border
                        bg-background/80
                        backdrop-blur-md
                        p-3
                        text-xs
                        space-y-2
                        select-none
                    "
                    >
                        {(Object.values(TECH_TYPE) as TechCategory[]).map(
                            (type) => (
                                <div
                                    key={type}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                TYPE_STYLES[type].legend,
                                        }}
                                    />
                                    <span className="text-muted-foreground font-medium">
                                        {type}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </ReactFlow>
            </div>

            {/* Modal */}
            {activeTech && (
                <SkillModal
                    title={activeTech.label}
                    category={activeTech.type}
                    icon={activeTech.icon}
                    onClose={() => setActiveTech(null)}
                    scalability={activeTech.scalability}
                    debuggability={activeTech.debuggability}
                    consistency={activeTech.consistency}
                    description={activeTech.description}
                    isOpen={activeTech.type != null}
                />
            )}
        </div>
    );
};

export default SkillGraph;
