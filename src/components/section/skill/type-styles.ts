import type { TechCategory } from "./graph-data";
export const TYPE_STYLES: Record<
    TechCategory,
    { bg: string; border: string; legend: string }
> = {
    Security: {
        bg: "bg-[#22c55e]/15", // Green
        border: "border-[#22c55e]",
        legend: "#22c55e",
    },
    Tool: {
        bg: "bg-[#f59e0b]/20", // Yellow-orange
        border: "border-[#f59e0b]",
        legend: "#f59e0b",
    },
    Database: {
        bg: "bg-[#ef4444]/15", // Red
        border: "border-[#ef4444]",
        legend: "#ef4444",
    },
    Framework: {
        bg: "bg-[#8b5cf6]/15", // Purple
        border: "border-[#8b5cf6]",
        legend: "#8b5cf6",
    },
    Language: {
        bg: "bg-[#3b82f6]/15", // Blue
        border: "border-[#3b82f6]",
        legend: "#3b82f6",
    },
};
