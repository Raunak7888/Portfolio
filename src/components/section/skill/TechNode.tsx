"use client";

import { Handle, Position } from "@xyflow/react";
import { Search } from "lucide-react";
import { memo, useState } from "react";
import { TechNodeData } from "./graph-data";
import { TYPE_STYLES } from "./type-styles";

export const TechNode = memo(({ data }: { data: TechNodeData }) => {
    const [hovered, setHovered] = useState(false);
    const style = TYPE_STYLES[data.type];

    return (
        <div
            className="relative cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="w-2! h-2! bg-muted-foreground!"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-2! h-2! bg-muted-foreground!"
            />

            <div
                className={`
                    flex items-center h-11 rounded-full
                    border-2 ${style.border}
                    transition-[width,background-color,opacity] duration-1000 ${style.bg}
                    ${hovered ? `w-44 px-3 gap-3` : `w-11 justify-center `}
                `}
            >
                <div
                    className={`text-lg shrink-0 `}
                    style={{ color: style.legend }}
                >
                    {data.icon}
                </div>

                {hovered && (
                    <>
                        <span
                            className="text-sm font-bold truncate "
                            style={{ color: style.legend }}
                        >
                            {data.label}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onOpen();
                            }}
                            className="ml-auto text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-1000"
                        >
                            <Search size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

TechNode.displayName = "TechNode";
export const nodeTypes = { tech: TechNode };
