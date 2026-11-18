"use client";
/* redesign:v1 */

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useAnimationControls,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Shapes from "@/components/ui/Shapes";
import Headline from "@/components/ui/Headline";
import Spotlight from "@/components/ui/Spotlight";
import { about, PILLARS, MASCOT_LINES, type Pillar } from "@/content/about";
import ConfettiLayer from "@/components/ui/ConfettiLayer";
import { useConfetti } from "@/hooks/useConfetti";
import { useFinePointer } from "@/hooks/useFinePointer";
import { spring, softSpring } from "@/lib/motion";
import { clamp } from "@/lib/utils";

/* ==========================================================================
   CONTENT
   Content lives in src/content/about.ts.
   ========================================================================== */


/* ==========================================================================
   HELPERS
   ========================================================================== */

const tiltSpring = { stiffness: 220, damping: 20, mass: 0.6 } as const;

/* Drag, tilt and the spotlight only make sense with a mouse. Touch gets tap-to-flip. */
/* ==========================================================================
   MOTION VARIANTS
   One entrance sequence: words arrive, then the cards drop onto the board.
   Everything after that answers something the visitor does.
   ========================================================================== */

const stack: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const rise: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: spring },
};


const boardStack: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
};

const drop: Variants = {
    hidden: { opacity: 0, y: -48, scale: 0.92, rotate: -6 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 240, damping: 16, mass: 0.9 },
    },
};

const cardHover: Variants = {
    hover: { scale: 1.03 },
};

const iconHover: Variants = {
    hover: {
        rotate: [0, -14, 10, -6, 0],
        scale: 1.12,
        transition: { duration: 0.5 },
    },
};

const emojiHover: Variants = {
    hover: {
        rotate: [0, -18, 14, -8, 0],
        y: [0, -8, 0],
        scale: 1.15,
        transition: { duration: 0.6 },
    },
};

/* ==========================================================================
   CONFETTI
   ========================================================================== */

/* ==========================================================================
   LEFT COLUMN PIECES
   ========================================================================== */

function Greeting({ reduce }: { reduce: boolean }) {
    const controls = useAnimationControls();

    const wave = useCallback(() => {
        if (reduce) return;
        controls.start({
            rotate: [0, 16, -8, 14, -4, 10, 0],
            transition: { duration: 1.2, ease: "easeInOut" },
        });
    }, [controls, reduce]);

    useEffect(() => {
        const first = window.setTimeout(wave, 1200);
        const loop = window.setInterval(wave, 6000);
        return () => {
            window.clearTimeout(first);
            window.clearInterval(loop);
        };
    }, [wave]);

    return (
        <motion.button
            type="button"
            onClick={wave}
            whileHover={reduce ? undefined : { rotate: -2, scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={spring}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pl-4 pr-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            {about.greeting}
            <motion.span
                aria-hidden
                animate={controls}
                className="inline-block origin-[70%_70%] text-base"
            >
                👋
            </motion.span>
        </motion.button>
    );
}

/* A headline word: blurs in on load, hops on hover, squishes on press. */

function Currently({ reduce }: { reduce: boolean }) {
    const [i, setI] = useState(0);
    const topic = about.topics[i];

    return (
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium">
            <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>

            <span>{about.currently}</span>

            <button
                type="button"
                onClick={() => setI((n) => (n + 1) % about.topics.length)}
                title="Click to see another one"
                aria-live="polite"
                className="relative inline-flex h-8 items-center overflow-hidden rounded-full border border-dashed border-primary/50 px-3 text-primary transition-[background-color,transform] duration-200 hover:bg-primary/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={topic}
                        initial={reduce ? false : { y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? undefined : { y: -16, opacity: 0 }}
                        transition={spring}
                        className="block whitespace-nowrap"
                    >
                        {topic}
                    </motion.span>
                </AnimatePresence>
            </button>
        </p>
    );
}

/* Pill button that leans toward the cursor and floods with color on hover. */
function CtaButton({
    reduce,
    fine,
    onBoom,
}: {
    reduce: boolean;
    fine: boolean;
    onBoom: (x: number, y: number) => void;
}) {
    const mx = useSpring(0, { stiffness: 220, damping: 16 });
    const my = useSpring(0, { stiffness: 220, damping: 16 });

    function onMove(e: ReactPointerEvent<HTMLAnchorElement>) {
        if (reduce || !fine) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.18);
        my.set((e.clientY - (r.top + r.height / 2)) * 0.28);
    }

    function onLeave() {
        mx.set(0);
        my.set(0);
    }

    return (
        <motion.div
            variants={rise}
            className="mt-[clamp(1rem,3.5vh,2rem)]"
        >
            <motion.a
                href={about.cta.href}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => onBoom(e.clientX, e.clientY)}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                whileTap={reduce ? undefined : { scale: 0.95 }}
                style={{ x: mx, y: my }}
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-foreground pl-6 pr-5 text-sm font-medium text-background shadow-sm transition-colors duration-300 hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <span
                    aria-hidden
                    className="absolute inset-0 translate-y-full rounded-full bg-primary transition-transform duration-300 ease-out group-hover:translate-y-0 motion-reduce:transition-none"
                />
                <span className="relative">{about.cta.label}</span>
                <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    strokeWidth={2}
                    className="relative transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
            </motion.a>
        </motion.div>
    );
}

/* ==========================================================================
   MASCOT
   Watches your cursor, blinks, grins on hover, hops on click, and cheers
   when every card has been flipped.
   ========================================================================== */

const MOUTH_REST = "M46 78 Q60 92 74 78 Q60 84 46 78 Z";
const MOUTH_OPEN = "M44 76 Q60 104 76 76 Q60 80 44 76 Z";

function Mascot({
    reduce,
    bubble,
    cheer,
    onPoke,
}: {
    reduce: boolean;
    bubble: string | null;
    cheer: number;
    onPoke: (x: number, y: number) => void;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const controls = useAnimationControls();
    const [hover, setHover] = useState(false);

    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const eyeX = useSpring(px, { stiffness: 220, damping: 18 });
    const eyeY = useSpring(py, { stiffness: 220, damping: 18 });

    useEffect(() => {
        if (reduce) return;

        function onMove(e: PointerEvent) {
            const el = ref.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const dist = Math.hypot(dx, dy) || 1;
            const reach = Math.min(dist / 14, 5);
            px.set((dx / dist) * reach);
            py.set((dy / dist) * reach);
        }

        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, [reduce, px, py]);

    const hop = useCallback(
        (big = false) => {
            if (reduce) return;
            const h = big ? -46 : -30;
            controls.start({
                y: [0, h, 0, h / 5, 0],
                scaleY: [1, 1.1, 0.85, 1.03, 1],
                scaleX: [1, 0.92, 1.1, 0.98, 1],
                rotate: big ? [0, -8, 8, -4, 0] : 0,
                transition: { duration: big ? 0.9 : 0.6, times: [0, 0.35, 0.6, 0.8, 1], ease: "easeOut" },
            });
        },
        [controls, reduce],
    );

    useEffect(() => {
        if (cheer > 0) hop(true);
    }, [cheer, hop]);

    function poke(e: MouseEvent<HTMLButtonElement>) {
        onPoke(e.clientX, e.clientY);
        hop();
    }

    const eyeStyle: CSSProperties = {
        transformBox: "fill-box",
        transformOrigin: "center",
    };

    const happy = hover || cheer > 0;

    return (
        <div className="relative shrink-0">
            <AnimatePresence>
                {bubble && (
                    <motion.div
                        key={bubble}
                        role="status"
                        initial={reduce ? false : { opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.92 }}
                        transition={spring}
                        className="absolute bottom-full right-0 z-40 mb-1 w-max max-w-[10rem] origin-bottom-right rounded-2xl bg-foreground px-3.5 py-2 text-xs font-medium leading-5 text-background shadow-lg sm:right-2 sm:max-w-[11rem]"
                    >
                        {bubble}
                        <span
                            aria-hidden
                            className="absolute -bottom-1 right-6 size-2.5 rotate-45 bg-foreground"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                ref={ref}
                type="button"
                aria-label="Poke the blob"
                onClick={poke}
                onHoverStart={() => setHover(true)}
                onHoverEnd={() => setHover(false)}
                whileHover={reduce ? undefined : { rotate: -4, scale: 1.06 }}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                transition={spring}
                className="block w-14 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-20 lg:w-[5.5rem]"
            >
                <motion.svg
                    viewBox="0 -12 120 124"
                    animate={controls}
                    className="block h-auto w-full overflow-visible"
                    style={{ transformOrigin: "50% 100%" }}
                >
                    <path
                        d="M60 8 Q56 -2 66 -6"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <circle cx="66" cy="-6" r="5.5" fill={PILLARS[0].tint} />

                    <path
                        d="M60 8 C92 8 112 32 112 62 C112 90 92 104 60 104 C28 104 8 90 8 62 C8 32 28 8 60 8 Z"
                        fill="var(--primary)"
                    />

                    <circle cx="27" cy="72" r="7" fill={PILLARS[2].tint} opacity="0.55" />
                    <circle cx="93" cy="72" r="7" fill={PILLARS[2].tint} opacity="0.55" />

                    {[42, 78].map((cx) => (
                        <motion.g
                            key={cx}
                            style={eyeStyle}
                            animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
                            transition={{
                                duration: 3.6,
                                times: [0, 0.92, 0.96, 1],
                                repeat: Infinity,
                            }}
                        >
                            <circle cx={cx} cy="54" r="13" fill="var(--background)" />
                            <motion.circle
                                cx={cx}
                                cy="54"
                                r="6"
                                fill="var(--foreground)"
                                style={{ x: eyeX, y: eyeY }}
                            />
                        </motion.g>
                    ))}

                    <motion.path
                        fill="var(--foreground)"
                        initial={false}
                        animate={{ d: happy ? MOUTH_OPEN : MOUTH_REST }}
                        transition={spring}
                    />
                </motion.svg>
            </motion.button>
        </div>
    );
}

/* ==========================================================================
   STICKER CARD
   Drag it, tilt it with the cursor, click it to flip it.
   Keyboard: Enter / Space flips, arrow keys nudge.
   ========================================================================== */

function StickerCard({
    pillar,
    index,
    boardRef,
    canDrag,
    reduce,
    tidyTick,
    isTop,
    flipped,
    onFlip,
    onFront,
}: {
    pillar: Pillar;
    index: number;
    boardRef: RefObject<HTMLDivElement | null>;
    canDrag: boolean;
    reduce: boolean;
    tidyTick: number;
    isTop: boolean;
    flipped: boolean;
    onFlip: (next: boolean) => void;
    onFront: () => void;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [dragging, setDragging] = useState(false);
    const moved = useRef(false);

    // lean into the direction you're dragging, like a real sticker would
    const rotate = useTransform(x, (v) => pillar.tilt + clamp(v / 40, -8, 8));

    // 3D tilt + glare that follow the cursor over the card
    const gx = useMotionValue(50);
    const gy = useMotionValue(50);
    const rx = useSpring(useTransform(gy, [0, 100], [7, -7]), tiltSpring);
    const ry = useSpring(useTransform(gx, [0, 100], [-9, 9]), tiltSpring);
    const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in oklab, white 38%, transparent), transparent 55%)`;

    function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!canDrag || reduce || dragging) return;
        const r = e.currentTarget.getBoundingClientRect();
        gx.set(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
        gy.set(clamp(((e.clientY - r.top) / r.height) * 100, 0, 100));
    }

    function onPointerLeave() {
        gx.set(50);
        gy.set(50);
    }

    // "Tidy up" glides every card home, one after another
    const lastTick = useRef(tidyTick);
    useEffect(() => {
        if (lastTick.current === tidyTick) return;
        lastTick.current = tidyTick;
        const t = reduce ? { duration: 0 } : { ...softSpring, delay: index * 0.06 };
        animate(x, 0, t);
        animate(y, 0, t);
    }, [tidyTick, x, y, reduce, index]);

    function toggle() {
        onFront();
        onFlip(!flipped);
    }

    function onTap() {
        if (moved.current) {
            moved.current = false;
            return;
        }
        toggle();
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
            return;
        }
        const step = 16;
        const lim = 70;
        const t = reduce ? { duration: 0 } : spring;
        const nudge: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
        };
        const d = nudge[e.key];
        if (!d) return;
        e.preventDefault();
        onFront();
        animate(x, clamp(x.get() + d[0], -lim, lim), t);
        animate(y, clamp(y.get() + d[1], -lim, lim), t);
    }

    const tintVars = { "--tint": pillar.tint } as CSSProperties;
    const faceStyle: CSSProperties = {
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
    };

    const glareLayer = (
        <motion.span
            aria-hidden
            style={{ background: glare }}
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover:opacity-100"
        />
    );

    return (
        <motion.li
            variants={drop}
            style={{ ...tintVars, zIndex: isTop ? 30 : 1 }}
            className={`relative h-full min-h-0 ${index % 2 === 1 ? "sm:mt-4 sm:-mb-4" : ""}`}
        >
            <motion.div
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
                aria-label={
                    flipped
                        ? `${pillar.backTitle}. ${pillar.backText} Press to flip back.`
                        : `${pillar.title}. ${pillar.text} Press to flip the card.`
                }
                onKeyDown={onKeyDown}
                onTap={onTap}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                drag={canDrag}
                dragConstraints={boardRef}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => {
                    moved.current = true;
                    setDragging(true);
                    onFront();
                }}
                onDragEnd={() => {
                    setDragging(false);
                    window.setTimeout(() => {
                        moved.current = false;
                    }, 60);
                }}
                variants={cardHover}
                whileHover={reduce ? undefined : "hover"}
                whileDrag={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                style={{ x, y, rotate }}
                className={`group h-full rounded-3xl outline-none [perspective:1100px] focus-visible:ring-2 focus-visible:ring-[color:var(--tint)] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                } ${dragging ? "drop-shadow-2xl" : "drop-shadow-sm"}`}
            >
                {/* cursor tilt */}
                <motion.div
                    style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: "preserve-3d" }}
                    className="h-full w-full"
                >
                    {/* flipper */}
                    <motion.div
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={reduce ? { duration: 0 } : softSpring}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative h-full w-full"
                    >
                        {/* FRONT */}
                        <div
                            aria-hidden
                            style={faceStyle}
                            className="absolute inset-0 flex select-none flex-col rounded-3xl border border-[color-mix(in_oklab,var(--tint)_32%,transparent)] bg-[color-mix(in_oklab,var(--tint)_9%,var(--background))] p-3.5 sm:p-5 lg:p-6"
                        >
                            <span
                                aria-hidden
                                className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 rounded-[3px] bg-[color-mix(in_oklab,var(--tint)_38%,transparent)] backdrop-blur-sm sm:-top-3 sm:h-6 sm:w-16"
                            />

                            <div className="flex items-start justify-between gap-2">
                                <motion.div
                                    variants={iconHover}
                                    className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--tint)_20%,transparent)] text-[color:var(--tint)] sm:size-11 sm:rounded-2xl"
                                >
                                    <HugeiconsIcon icon={pillar.icon} size={22} strokeWidth={1.7} />
                                </motion.div>

                                <span className="hidden rounded-full border border-[color-mix(in_oklab,var(--tint)_32%,transparent)] px-2.5 py-1 text-xs text-muted-foreground sm:inline">
                                    {pillar.kicker}
                                </span>
                            </div>

                            <div className="mt-auto">
                                <h3 className="text-sm font-semibold leading-tight tracking-tight sm:text-lg lg:text-xl">
                                    {pillar.title}
                                </h3>
                                <p className="mt-2 hidden text-[13px] leading-5 text-muted-foreground sm:line-clamp-3 sm:block lg:line-clamp-4 lg:text-sm lg:leading-6">
                                    {pillar.text}
                                </p>
                                <span className="mt-2 hidden items-center gap-1 text-xs font-medium text-[color:var(--tint)] sm:inline-flex">
                                    Click to flip
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
                                </span>
                            </div>
                            {glareLayer}
                        </div>

                        {/* BACK */}
                        <div
                            aria-hidden
                            style={{ ...faceStyle, transform: "rotateY(180deg)" }}
                            className="absolute inset-0 flex select-none flex-col items-start rounded-3xl border border-[color-mix(in_oklab,var(--tint)_45%,transparent)] bg-[color-mix(in_oklab,var(--tint)_22%,var(--background))] p-3.5 sm:p-5 lg:p-6"
                        >
                            <motion.span
                                variants={emojiHover}
                                className="block text-3xl leading-none sm:text-4xl lg:text-5xl"
                            >
                                {pillar.emoji}
                            </motion.span>

                            <h3 className="mt-2 text-sm font-semibold leading-tight tracking-tight sm:mt-4 sm:text-base lg:text-lg">
                                {pillar.backTitle}
                            </h3>
                            <p className="mt-1.5 text-xs leading-4 text-foreground/80 sm:text-[13px] sm:leading-5 lg:text-sm lg:leading-6">
                                {pillar.backText}
                            </p>

                            <span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">
                                Click to flip back
                            </span>
                            {glareLayer}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.li>
    );
}

/* ==========================================================================
   BOARD TOOLBAR
   ========================================================================== */

function Toolbar({
    flipped,
    fine,
    reduce,
    tidyTick,
    onTidy,
    bubble,
    cheer,
    onPoke,
}: {
    flipped: Record<string, boolean>;
    fine: boolean;
    reduce: boolean;
    tidyTick: number;
    onTidy: () => void;
    bubble: string | null;
    cheer: number;
    onPoke: (x: number, y: number) => void;
}) {
    const count = PILLARS.filter((p) => flipped[p.id]).length;
    const done = count === PILLARS.length;

    return (
        <div className="mt-3 flex shrink-0 items-end justify-between gap-3 lg:mt-4">
            <div className="flex flex-col gap-2 lg:gap-3">
                <div className="flex items-center gap-3">
                    <ul aria-hidden className="flex gap-1.5">
                        {PILLARS.map((p) => (
                            <li
                                key={p.id}
                                className="relative size-3 rounded-full border border-border bg-muted"
                            >
                                <motion.span
                                    initial={false}
                                    animate={{ scale: flipped[p.id] ? 1 : 0 }}
                                    transition={reduce ? { duration: 0 } : spring}
                                    className="absolute -inset-px rounded-full"
                                    style={{ background: p.tint }}
                                />
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                        {done ? "You found them all!" : `${count} of ${PILLARS.length} flipped`}
                    </p>
                </div>

                <p className="hidden max-w-[16rem] text-xs leading-5 text-muted-foreground sm:block">
                    {fine
                        ? "Drag the cards around. Click one to flip it."
                        : "Tap a card to flip it."}
                </p>

                <motion.button
                    type="button"
                    onClick={onTidy}
                    whileHover={reduce ? undefined : { y: -2 }}
                    whileTap={reduce ? undefined : { scale: 0.94 }}
                    transition={spring}
                    className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-10"
                >
                    <motion.span
                        aria-hidden
                        animate={{ rotate: tidyTick * 360 }}
                        transition={reduce ? { duration: 0 } : softSpring}
                        className="flex"
                    >
                        <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={2} />
                    </motion.span>
                    Tidy up
                </motion.button>
            </div>

            <Mascot reduce={reduce} bubble={bubble} cheer={cheer} onPoke={onPoke} />
        </div>
    );
}

/* ==========================================================================
   SECTION
   Exactly one screen: never taller or wider than the viewport.
   ========================================================================== */

export default function About() {
    const reduce = !!useReducedMotion();
    const fine = useFinePointer();
    const initial = reduce ? "show" : "hidden";

    const sectionRef = useRef<HTMLElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const { bursts, fire } = useConfetti(!reduce);

    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
    const [topId, setTopId] = useState<string | null>(null);
    const [tidyTick, setTidyTick] = useState(0);
    const [cheer, setCheer] = useState(0);

    // cursor spotlight
    const sx = useSpring(-999, { stiffness: 140, damping: 20 });
    const sy = useSpring(-999, { stiffness: 140, damping: 20 });

    function onSectionMove(e: ReactPointerEvent<HTMLElement>) {
        if (!fine || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        sx.set(e.clientX - r.left);
        sy.set(e.clientY - r.top);
    }

    function onSectionLeave() {
        sx.set(-999);
        sy.set(-999);
    }

    // speech bubble for the mascot
    const [bubble, setBubble] = useState<string | null>(null);
    const bubbleTimer = useRef<number | undefined>(undefined);
    const pokes = useRef(0);

    const say = useCallback((text: string) => {
        setBubble(text);
        window.clearTimeout(bubbleTimer.current);
        bubbleTimer.current = window.setTimeout(() => setBubble(null), 2800);
    }, []);

    useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

    const poke = useCallback(
        (x: number, y: number) => {
            fire(x, y, 14);
            say(MASCOT_LINES[pokes.current++ % MASCOT_LINES.length]);
        },
        [fire, say],
    );

    // easter egg: flip every card and the board celebrates
    const allFlipped = PILLARS.every((p) => flipped[p.id]);
    const wasAll = useRef(false);

    useEffect(() => {
        if (allFlipped && !wasAll.current) {
            const r = boardRef.current?.getBoundingClientRect();
            if (r) {
                fire(r.left + r.width / 2, r.top + r.height / 2, 36);
            }
            setCheer((c) => c + 1);
            say("You found them all! 🎉");
        }
        wasAll.current = allFlipped;
    }, [allFlipped, fire, say]);

    function tidy() {
        setTidyTick((t) => t + 1);
        setFlipped({});
        setTopId(null);
        say("Ahh, much better.");
    }

    function flip(p: Pillar, next: boolean) {
        setFlipped((f) => ({ ...f, [p.id]: next }));
        if (next) say(`${p.emoji} ${p.backTitle}`);
    }

    return (
        <section
            id="about"
            ref={sectionRef}
            onPointerMove={onSectionMove}
            onPointerLeave={onSectionLeave}
            className="relative box-border flex min-h-svh w-full max-w-[100vw] flex-col overflow-x-clip lg:h-svh lg:max-h-svh lg:overflow-hidden border-t border-border bg-background px-4 pb-[clamp(0.75rem,3vh,2rem)] pt-[clamp(4.5rem,11vh,6.5rem)] sm:px-6"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -left-32 top-10 size-[420px] rounded-full bg-primary/10 blur-[110px]"
            />
            <Spotlight sx={sx} sy={sy} />
            <Shapes reduce={reduce} />

            <div className="relative mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-rows-[auto_auto] gap-4 lg:grid-cols-[5fr_7fr] lg:grid-rows-1 lg:items-center lg:gap-16">
                {/* ---------- left: the words ---------- */}
                <motion.div
                    initial={initial}
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={stack}
                    className="flex min-h-0 flex-col items-start"
                >
                    <motion.div variants={rise} className="mb-[clamp(0.5rem,2vh,1.25rem)]">
                        <Greeting reduce={reduce} />
                    </motion.div>

                    <Headline reduce={reduce} toptext={about.headingTop} bottomtext={about.headingBottom} />

                    <div className="mt-[clamp(0.75rem,3vh,2rem)] flex max-w-md flex-col gap-[clamp(0.5rem,1.6vh,1rem)]">
                        <motion.p
                            variants={rise}
                            className="text-base leading-7 text-muted-foreground"
                        >
                            {about.paragraph}
                        </motion.p>

                        <motion.p variants={rise} className="text-sm leading-6 sm:text-base sm:leading-7">
                            {about.half}
                        </motion.p>

                        <motion.div variants={rise}>
                            <Currently reduce={reduce} />
                        </motion.div>
                    </div>

                    <CtaButton reduce={reduce} fine={fine} onBoom={(x, y) => fire(x, y, 22)} />
                </motion.div>

                {/* ---------- right: the playground ---------- */}
                <div className="flex h-full min-h-0 flex-col lg:max-h-[44rem]">
                    <div
                        ref={boardRef}
                        className="relative min-h-[26rem] flex-1 rounded-[1.5rem] sm:min-h-[30rem] lg:min-h-0 border border-dashed border-border p-3 sm:rounded-[2rem] sm:p-5"
                        style={{
                            backgroundImage:
                                "radial-gradient(color-mix(in oklab, var(--foreground) 14%, transparent) 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                        }}
                    >
                        <motion.ul
                            initial={initial}
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={boardStack}
                            className="grid h-full grid-cols-2 grid-rows-2 gap-3 sm:gap-5"
                        >
                            {PILLARS.map((pillar, i) => (
                                <StickerCard
                                    key={pillar.id}
                                    pillar={pillar}
                                    index={i}
                                    boardRef={boardRef}
                                    canDrag={fine}
                                    reduce={reduce}
                                    tidyTick={tidyTick}
                                    isTop={topId === pillar.id}
                                    flipped={!!flipped[pillar.id]}
                                    onFlip={(next) => flip(pillar, next)}
                                    onFront={() => setTopId(pillar.id)}
                                />
                            ))}
                        </motion.ul>
                    </div>

                    <Toolbar
                        flipped={flipped}
                        fine={fine}
                        reduce={reduce}
                        tidyTick={tidyTick}
                        onTidy={tidy}
                        bubble={bubble}
                        cheer={cheer}
                        onPoke={poke}
                    />
                </div>
            </div>

            <ConfettiLayer bursts={bursts} />
        </section>
    );
}