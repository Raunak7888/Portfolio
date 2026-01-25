"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { RotateCcw } from "lucide-react";

// --- Types ---
type CardSize = "small" | "medium" | "large";

interface CardData {
    id: string;
    rotation: number;
    size: CardSize;
    content: React.ReactNode;
}

// --- Card Content Data ---
const CARDS: CardData[] = [
    {
        id: "dfs-tree",
        rotation: -4,
        size: "medium",
        content: (
            <>
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest">
                    Traverser.java
                </div>
                <span className="text-primary">class</span>{" "}
                <span className="text-foreground font-bold">Traverser</span>{" "}
                {"{"} <br />
                &nbsp;&nbsp;<span className="text-primary">void</span>{" "}
                <span className="text-foreground">dfs</span>(TreeNode node){" "}
                {"{"} <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">
                    if
                </span>{" "}
                (node == null) <span className="text-primary">return</span>;{" "}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;visit(node); <br />
                &nbsp;&nbsp;&nbsp;&nbsp;dfs(node.left); <br />
                &nbsp;&nbsp;&nbsp;&nbsp;dfs(node.right); <br />
                &nbsp;&nbsp;{"}"} <br />
                {"}"}
            </>
        ),
    },
    {
        id: "cycle-detection",
        rotation: 5,
        size: "large",
        content: (
            <>
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest">
                    Detector.java
                </div>
                <span className="text-primary">class</span>{" "}
                <span className="text-foreground font-bold">Detector</span>{" "}
                {"{"} <br />
                &nbsp;&nbsp;<span className="text-primary">boolean</span>{" "}
                <span className="text-foreground">hasCycle</span>(ListNode head){" "}
                {"{"} <br />
                &nbsp;&nbsp;&nbsp;&nbsp;ListNode slow = head, fast = head;{" "}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">while</span> (fast !={" "}
                <span className="text-primary">null</span> && fast.next !={" "}
                <span className="text-primary">null</span>) {"{"} <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;slow = slow.next; fast =
                fast.next.next; <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">if</span> (slow == fast){" "}
                <span className="text-primary">return true</span>; <br />
                &nbsp;&nbsp;&nbsp;&nbsp;{"}"} <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">return false</span>; <br />
                &nbsp;&nbsp;{"}"} <br />
                {"}"}
            </>
        ),
    },
    {
        id: "binary-search",
        rotation: -2,
        size: "medium",
        content: (
            <>
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest">
                    binary_search.py
                </div>
                <span className="text-primary">def</span>{" "}
                <span className="text-foreground font-bold">binary_search</span>
                (arr, target): <br />
                &nbsp;&nbsp;l, r = <span className="text-primary">0</span>,
                len(arr) - <span className="text-primary">1</span> <br />
                &nbsp;&nbsp;<span className="text-primary">while</span> l &lt;=
                r: <br />
                &nbsp;&nbsp;&nbsp;&nbsp;m = (l + r) //{" "}
                <span className="text-primary">2</span> <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">
                    if
                </span>{" "}
                arr[m] == target: <span className="text-primary">return</span> m{" "}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">
                    if
                </span>{" "}
                arr[m] &lt; target: l = m +{" "}
                <span className="text-primary">1</span> <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">else</span>: r = m -{" "}
                <span className="text-primary">1</span> <br />
                &nbsp;&nbsp;<span className="text-primary">return</span> -1
            </>
        ),
    },
    {
        id: "two-sum",
        rotation: 3,
        size: "medium",
        content: (
            <>
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest">
                    two_sum.py
                </div>
                <span className="text-primary">def</span>{" "}
                <span className="text-foreground font-bold">two_sum</span>(nums,
                target): <br />
                &nbsp;&nbsp;seen = {"{}"} <br />
                &nbsp;&nbsp;<span className="text-primary">for</span> i, x{" "}
                <span className="text-primary">in</span> enumerate(nums): <br />
                &nbsp;&nbsp;&nbsp;&nbsp;need = target - x <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">
                    if
                </span>{" "}
                need <span className="text-primary">in</span> seen: <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">return</span> seen[need], i{" "}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;seen[x] = i <br />
                &nbsp;&nbsp;<span className="text-primary">return</span> -1, -1
            </>
        ),
    },
    {
        id: "remove-element",
        rotation: -6,
        size: "small",
        content: (
            <>
                <div className="text-muted-foreground mb-2 uppercase text-[10px] tracking-widest">
                    Utils.java
                </div>
                <span className="text-primary">int</span>{" "}
                <span className="text-foreground font-bold">removeElement</span>
                (int[] nums, int val) {"{"} <br />
                &nbsp;&nbsp;<span className="text-primary">int</span> k = 0;{" "}
                <br />
                &nbsp;&nbsp;<span className="text-primary">for</span> (int x :
                nums) {"{"} <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">
                    if
                </span>{" "}
                (x != val) nums[k++] = x; <br />
                &nbsp;&nbsp;{"}"} <br />
                &nbsp;&nbsp;<span className="text-primary">return</span> k;{" "}
                <br />
                {"}"}
            </>
        ),
    },
];

const getSizeClasses = (size: CardSize) => {
    switch (size) {
        case "small":
            return "w-[240px] md:w-[290px] text-[10px] md:text-xs";
        case "large":
            return "w-[340px] md:w-[490px] text-sm md:text-base";
        case "medium":
        default:
            return "w-[280px] md:w-[330px] text-xs md:text-sm";
    }
};

const HeroVisualStack = () => {
    const [cards, setCards] = useState(CARDS);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [, setStackKey] = useState(0);

    const bringToFront = (id: string) => {
        setCards((prev) => {
            const card = prev.find((c) => c.id === id);
            if (!card) return prev;
            return [...prev.filter((c) => c.id !== id), card];
        });
    };

    const handleDragEnd = (id: string, info: PanInfo) => {
        setDraggedId(null);

        const thrown =
            Math.abs(info.velocity.x) > 700 || Math.abs(info.offset.x) > 1000;

        if (thrown) {
            setCards((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const restack = () => {
        setDraggedId(null);
        setStackKey((k) => k + 1);
        setCards(
            CARDS.map((card) => ({
                ...card,
                id: `${card.id}-${Date.now()}`, // force remount
            })),
        );
    };

    return (
        <div className="relative w-full h-150 flex items-center justify-center isolate">
            {/* Cards Layer */}
            <AnimatePresence>
                {cards.map((card, index) => {
                    const sizeClass = getSizeClasses(card.size);
                    const isDragging = draggedId === card.id;

                    return (
                        <motion.div
                            key={card.id}
                            drag
                            onPointerDown={() => bringToFront(card.id)}
                            onDragStart={() => setDraggedId(card.id)}
                            onDragEnd={(_, info) =>
                                handleDragEnd(card.id, info)
                            }
                            initial={{ x: 0, y: 50, opacity: 0, rotate: 0 }}
                            animate={{
                                opacity: 1,
                                rotate: isDragging ? 0 : card.rotation,
                                zIndex: isDragging ? 100 : index,
                                scale: isDragging ? 1.05 : 1,
                            }}
                            exit={{
                                x: 500,
                                opacity: 0,
                                rotate: 20,
                                transition: { duration: 0.3 },
                            }}
                            whileDrag={{ cursor: "grabbing" }}
                            className={`absolute select-none ${sizeClass} cursor-grab active:cursor-grabbing`}
                        >
                            <div className="w-full h-full bg-card/90 border border-border backdrop-blur-xl rounded-2xl p-6 shadow-2xl font-mono overflow-hidden transition-shadow duration-300">
                                <div className="flex gap-1.5 mb-4 opacity-50">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                </div>
                                <pre className="leading-relaxed tracking-wide whitespace-pre-wrap break-all">
                                    {card.content}
                                </pre>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Button Layer - Always visible, absolute positioned at bottom */}
            <motion.button
                onClick={restack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-10 z-1000 flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 text-primary rounded-full hover:bg-primary/20 transition-colors backdrop-blur-sm font-google text-sm cursor-pointer shadow-lg"
            >
                <RotateCcw size={16} />
                Restack Cards
            </motion.button>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full -z-10 animate-pulse pointer-events-none" />
        </div>
    );
};

export default HeroVisualStack;
