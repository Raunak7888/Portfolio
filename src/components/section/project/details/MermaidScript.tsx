"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Generate a unique ID to prevent Mermaid ID collisions
const randomId = () => `mermaid-${Math.floor(Math.random() * 10000)}`;

export function MermaidDiagram({ code }: { code: string }) {
    const [svg, setSvg] = useState<string>("");
    const [id] = useState(randomId());

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "monospace",
            // This ensures the diagram scales to its container
            themeVariables: {
                primaryColor: "#3b82f6", // Matches your blue-600/primary
                mainBkg: "#18181b", // Matches zinc-900
                textColor: "#a1a1aa", // Matches zinc-400
            },
        });

        const renderDiagram = async () => {
            if (!code) return;
            try {
                // mermaid.render returns an object containing the svg string
                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
            } catch (error) {
                console.error("Mermaid Render Error:", error);
                // Clear SVG on error to avoid showing stale/broken diagrams
                setSvg(
                    "<p className='text-red-500 text-xs'>Diagram Syntax Error</p>",
                );
            }
        };

        renderDiagram();
    }, [code, id]);

    return (
        <div
            className="mermaid-container w-full overflow-hidden flex justify-center items-center"
            // Set the generated SVG directly
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
