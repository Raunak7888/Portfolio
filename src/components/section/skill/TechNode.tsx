"use client";

import { Handle, Position } from "@xyflow/react";
import { Search } from "lucide-react";
import { memo, useState } from "react";
import { TechNodeData } from "./graph-data";
import { TYPE_STYLES } from "./type-styles";
import { motion } from "framer-motion";

export const TechNode = memo(({ data }: { data: TechNodeData }) => {
    const [hovered, setHovered] = useState(false);
    const style =
        TYPE_STYLES[data.type as keyof typeof TYPE_STYLES] || TYPE_STYLES.Tool;

    // Isolate the click handler
    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents React Flow from selecting/dragging the node
        e.preventDefault(); // Prevents any default browser behavior
        if (data.onOpen) {
            data.onOpen();
        }
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            // Ensure the expanded node sits above everything else
            style={{ zIndex: hovered ? 9999 : 1 }}
        >
            <Handle
                type="target"
                position={Position.Left}
                className={`w-2! h-2! transition-opacity duration-200 border-none! ${hovered ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundColor: style.legend }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={`w-2! h-2! transition-opacity duration-200 border-none! ${hovered ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundColor: style.legend }}
            />

            <motion.div
                animate={{ width: hovered ? 160 : 48 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`
                    relative flex items-center h-12 rounded-2xl border 
                    backdrop-blur-md overflow-hidden justify-center
                    bg-background/95 border-foreground/10 pl-3   transition-all duration-200
                    ${hovered ? "px-2" : "justify-center"}
                `}
            >
                {/* 1. Static Icon */}
                <div
                    className="relative z-10 flex items-center justify-center shrink-0 w-8 h-8 rounded-lg"
                    style={{
                        backgroundColor: `${style.legend}15`,
                        color: style.legend,
                        border: `1px solid ${style.legend}33`,
                    }}
                >
                    {data.icon}
                </div>

                {/* 2. Content & Button */}
                <motion.div
                    animate={{
                        opacity: hovered ? 1 : 0,
                        pointerEvents: hovered ? "auto" : "none",
                    }}
                    className="flex items-center flex-1 ml-3 overflow-hidden"
                >
                    <div className="flex flex-col flex-1 overflow-hidden pointer-events-none">
                        <span className="text-[7px] font-black uppercase opacity-40 leading-none mb-1">
                            {data.type}
                        </span>
                        <span className="text-xs font-bold truncate text-foreground">
                            {data.label}
                        </span>
                    </div>

                    {/* Button with explicit click prevention */}
                    <button
                        type="button"
                        onClick={handleButtonClick}
                        className="p-2 ml-1 rounded-md text-foreground hover:bg-primary hover:text-primary-foreground transition-all shrink-0 cursor-pointer"
                        aria-label="View Details"
                    >
                        <Search size={14} />
                    </button>
                </motion.div>
            </motion.div>

            <div
                className={`absolute inset-0 -z-10 blur-xl rounded-full transition-opacity duration-300 pointer-events-none ${hovered ? "opacity-30" : "opacity-0"}`}
                style={{ backgroundColor: style.legend }}
            />
        </div>
    );
});

TechNode.displayName = "TechNode";
export const nodeTypes = { tech: TechNode };
