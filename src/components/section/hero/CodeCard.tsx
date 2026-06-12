"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { RotateCcw } from "lucide-react";

type CardSize = "small" | "medium" | "large";

interface CardData {
    id: string;
    rotation: number;
    size: CardSize;
    content: React.ReactNode;
}

const CARDS: CardData[] = [
    {
        id: "dfs-tree",
        rotation: -4,
        size: "medium",
        content: (
            <>
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest uppercase">
                    Traverser.java
                </div>
                <span className="text-primary">class</span>{" "}
                <span className="text-foreground font-bold">Traverser</span> {"{"}
                <br />
                &nbsp;&nbsp;<span className="text-primary">void</span>{" "}
                <span className="text-foreground">dfs</span>(TreeNode node) {"{"}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span>{" "}
                (node == null) <span className="text-primary">return</span>;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;visit(node);
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;dfs(node.left);
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;dfs(node.right);
                <br />
                &nbsp;&nbsp;{"}"}
                <br />
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
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest uppercase">
                    Detector.java
                </div>
                <span className="text-primary">boolean</span>{" "}
                <span className="text-foreground font-bold">hasCycle</span>(ListNode head){" "}
                {"{"}
                <br />
                &nbsp;&nbsp;ListNode slow = head, fast = head;
                <br />
                &nbsp;&nbsp;<span className="text-primary">while</span> (fast !={" "}
                <span className="text-primary">null</span> && fast.next !={" "}
                <span className="text-primary">null</span>) {"{"}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;slow = slow.next;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;fast = fast.next.next;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span> (slow ==
                fast) <span className="text-primary">return true</span>;
                <br />
                &nbsp;&nbsp;{"}"}
                <br />
                &nbsp;&nbsp;<span className="text-primary">return false</span>;
                <br />
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
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest uppercase">
                    binary_search.py
                </div>
                <span className="text-primary">def</span>{" "}
                <span className="text-foreground font-bold">binary_search</span>(arr, target):
                <br />
                &nbsp;&nbsp;l, r = <span className="text-primary">0</span>, len(arr) -{" "}
                <span className="text-primary">1</span>
                <br />
                &nbsp;&nbsp;<span className="text-primary">while</span> l &lt;= r:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;m = (l + r) // <span className="text-primary">2</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span> arr[m] ==
                target: <span className="text-primary">return</span> m<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">elif</span> arr[m] &lt;
                target: l = m + <span className="text-primary">1</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">else</span>: r = m -{" "}
                <span className="text-primary">1</span>
                <br />
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
                <div className="text-muted-foreground mb-2 text-[10px] tracking-widest uppercase">
                    two_sum.py
                </div>
                <span className="text-primary">def</span>{" "}
                <span className="text-foreground font-bold">two_sum</span>(nums, target):
                <br />
                &nbsp;&nbsp;seen = {"{}"}
                <br />
                &nbsp;&nbsp;<span className="text-primary">for</span> i, x{" "}
                <span className="text-primary">in</span> enumerate(nums):
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;need = target - x<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span> need{" "}
                <span className="text-primary">in</span> seen:
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-primary">return</span> seen[need], i<br />
                &nbsp;&nbsp;&nbsp;&nbsp;seen[x] = i<br />
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
                <span className="text-foreground font-bold">removeElement</span>(int[] nums,
                int val) {"{"}
                <br />
                &nbsp;&nbsp;<span className="text-primary">int</span> k = 0;
                <br />
                &nbsp;&nbsp;<span className="text-primary">for</span> (int x : nums) {"{"}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span> (x != val)
                nums[k++] = x;
                <br />
                &nbsp;&nbsp;{"}"}
                <br />
                &nbsp;&nbsp;<span className="text-primary">return</span> k;
                <br />
                {"}"}
            </>
        ),
    },
];

const getSizeClasses = (size: CardSize) => {
    switch (size) {
        case "small":
            return "w-[230px] md:w-[270px] text-[10px] md:text-xs";
        case "large":
            return "w-[320px] md:w-[460px] text-xs md:text-sm";
        case "medium":
        default:
            return "w-[270px] md:w-[310px] text-xs md:text-sm";
    }
};

const HeroVisualStack = () => {
    const [cards, setCards] = useState(CARDS);
    const [draggedId, setDraggedId] = useState<string | null>(null);

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
            Math.abs(info.velocity.x) > 8000 || Math.abs(info.offset.x) > 900;
        if (thrown) {
            setCards((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const restack = () => {
        setDraggedId(null);
        setCards(
            CARDS.map((card) => ({
                ...card,
                id: `${card.id}-${Date.now()}`,
            })),
        );
    };

    return (
        <div className="relative w-full h-[520px] flex items-center justify-center isolate">
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
                            onDragEnd={(_, info) => handleDragEnd(card.id, info)}
                            initial={{ x: 0, y: 40, opacity: 0, rotate: 0 }}
                            animate={{
                                opacity: 1,
                                rotate: isDragging ? 0 : card.rotation,
                                zIndex: isDragging ? 100 : index,
                                scale: isDragging ? 1.04 : 1,
                            }}
                            exit={{
                                x: 480,
                                opacity: 0,
                                rotate: 15,
                                transition: { duration: 0.25 },
                            }}
                            whileDrag={{ cursor: "grabbing" }}
                            className={`absolute select-none ${sizeClass} cursor-grab active:cursor-grabbing`}
                            style={{
                                filter: isDragging
                                    ? "drop-shadow(0 20px 40px hsl(var(--primary) / 0.25))"
                                    : "drop-shadow(0 4px 16px rgba(0,0,0,0.4))",
                            }}
                        >
                            {/* Glass card */}
                            <div className="w-full h-full bg-card/70 border border-border font-mono overflow-hidden p-5 backdrop-blur-md rounded-xl relative">
                                {/* Inner top gradient */}
                                <div
                                    className="absolute inset-x-0 top-0 h-px"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, transparent, hsl(var(--border) / 0.8), transparent)",
                                    }}
                                />
                                <div className="flex gap-1.5 mb-4 ">
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

            <motion.button
                onClick={restack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="absolute bottom-6 z-[1000] flex items-center gap-2 px-5 py-2.5 border border-border bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-150 font-mono text-xs cursor-pointer rounded-2xl"
            >
                <RotateCcw size={13} />
                Restack
            </motion.button>
        </div>
    );
};

export default HeroVisualStack;