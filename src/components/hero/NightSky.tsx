"use client";

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  Real constellations                                                       */
/*  stars: [x, y, brightness]  (x,y in 0..1 inside the constellation's box)   */
/*  edges: pairs of star indexes, drawn in order                              */
/* -------------------------------------------------------------------------- */

type Placement = { x: number; y: number; w: number };

type ConstellationDef = {
    name: string;
    aspect: number;
    stars: [number, number, number][];
    edges: [number, number][];
    desktop: Placement;
    mobile: Placement | null;
    delay: number;
};

const CONSTELLATIONS: ConstellationDef[] = [
    {
        name: "Orion",
        aspect: 1.55,
        stars: [
            [0.5, 0.0, 0.45],
            [0.18, 0.06, 1.0],
            [0.82, 0.1, 0.75],
            [0.36, 0.52, 0.7],
            [0.5, 0.49, 0.75],
            [0.64, 0.46, 0.65],
            [0.24, 1.0, 0.6],
            [0.86, 0.94, 1.0],
        ],
        edges: [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 5],
            [3, 4],
            [4, 5],
            [3, 6],
            [5, 7],
        ],
        desktop: { x: 0.13, y: 0.5, w: 150 },
        mobile: null,
        delay: 500,
    },
    {
        name: "Big Dipper",
        aspect: 0.5,
        stars: [
            [0.0, 0.18, 0.7],
            [0.17, 0.3, 0.7],
            [0.34, 0.36, 0.85],
            [0.52, 0.5, 0.55],
            [0.56, 0.95, 0.7],
            [0.97, 0.92, 0.7],
            [1.0, 0.45, 0.9],
        ],
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 3],
        ],
        desktop: { x: 0.8, y: 0.2, w: 250 },
        mobile: { x: 0.74, y: 0.08, w: 150 },
        delay: 1100,
    },
    {
        name: "Cassiopeia",
        aspect: 0.42,
        stars: [
            [0.0, 0.2, 0.75],
            [0.22, 0.85, 0.95],
            [0.5, 0.42, 0.8],
            [0.78, 0.95, 0.7],
            [1.0, 0.1, 0.6],
        ],
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
        ],
        desktop: { x: 0.25, y: 0.14, w: 190 },
        mobile: { x: 0.24, y: 0.1, w: 120 },
        delay: 1700,
    },
    {
        name: "Cygnus",
        aspect: 1.3,
        stars: [
            [0.5, 0.0, 1.0],
            [0.5, 0.42, 0.75],
            [0.5, 1.0, 0.65],
            [0.04, 0.34, 0.55],
            [0.96, 0.5, 0.5],
        ],
        edges: [
            [0, 1],
            [1, 2],
            [3, 1],
            [1, 4],
        ],
        desktop: { x: 0.87, y: 0.64, w: 150 },
        mobile: { x: 0.84, y: 0.9, w: 100 },
        delay: 2300,
    },
    {
        name: "Scorpius",
        aspect: 1.1,
        stars: [
            [0.9, 0.0, 0.55],
            [1.0, 0.16, 0.5],
            [0.7, 0.28, 1.0],
            [0.52, 0.36, 0.55],
            [0.36, 0.52, 0.55],
            [0.22, 0.68, 0.5],
            [0.1, 0.84, 0.55],
            [0.2, 1.0, 0.6],
            [0.46, 0.97, 0.8],
        ],
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 7],
            [7, 8],
        ],
        desktop: { x: 0.22, y: 0.86, w: 230 },
        mobile: { x: 0.2, y: 0.9, w: 130 },
        delay: 2900,
    },
];

type FieldStar = {
    x: number;
    y: number;
    r: number;
    depth: number;
    phase: number;
    speed: number;
    tint: boolean;
};

type Placed = {
    def: ConstellationDef;
    pts: {
        x: number;
        y: number;
        mag: number;
        phase: number;
        firstEdge: number;
    }[];
    box: { x0: number; y0: number; x1: number; y1: number };
    labelX: number;
    labelY: number;
    seed: number;
    hl: number;
};

type Meteor = { x: number; y: number; vx: number; vy: number; life: number };
type Spark = { x: number; y: number; life: number; rot: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);

export default function NightSky() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        let w = 0;
        let h = 0;
        let field: FieldStar[] = [];
        let placed: Placed[] = [];
        let meteor: Meteor | null = null;
        let sparks: Spark[] = [];
        let raf = 0;
        let visible = true;
        const t0 = performance.now();
        let nextMeteor = t0 + 4500;

        const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };
        const smooth = { x: 0, y: 0 };

        let fg = "#ffffff";
        let accent = "#ef4444";
        const readColors = () => {
            const s = getComputedStyle(document.documentElement);
            fg = s.getPropertyValue("--foreground").trim() || fg;
            accent = s.getPropertyValue("--primary").trim() || accent;
        };
        readColors();

        const layout = () => {
            const mobile = w < 768;
            const k = Math.min(1.15, Math.max(0.7, w / 1440));

            const total = Math.min(
                340,
                Math.max(110, Math.floor((w * h) / 5200)),
            );
            field = Array.from({ length: total }, (_, i) => {
                const layer = i % 10 < 6 ? 0 : i % 10 < 9 ? 1 : 2;
                return {
                    x: Math.random(),
                    y: Math.random(),
                    r: [0.45, 0.8, 1.25][layer] * (0.8 + Math.random() * 0.5),
                    depth: [0.25, 0.6, 1][layer],
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.0008 + Math.random() * 0.002,
                    tint: Math.random() < 0.12,
                };
            });

            placed = CONSTELLATIONS.flatMap((def) => {
                const p = mobile ? def.mobile : def.desktop;
                if (!p) return [];
                const cw = mobile ? p.w : p.w * k;
                const ch = cw * def.aspect;
                const clamp = (v: number, lo: number, hi: number) =>
                    Math.max(lo, Math.min(hi, v));
                const padX = mobile ? 20 : 48;
                const padTop = mobile ? 70 : 90;
                const padBottom = 90;
                const ox = clamp(p.x * w - cw / 2, padX, w - cw - padX);
                const oy = clamp(p.y * h - ch / 2, padTop, h - ch - padBottom);
                const pts = def.stars.map(([sx, sy, mag], i) => {
                    const firstEdge = def.edges.findIndex(
                        (e) => e[0] === i || e[1] === i,
                    );
                    return {
                        x: ox + sx * cw,
                        y: oy + sy * ch,
                        mag,
                        phase: Math.random() * Math.PI * 2,
                        firstEdge: Math.max(0, firstEdge),
                    };
                });
                return [
                    {
                        def,
                        pts,
                        box: {
                            x0: ox - 30,
                            y0: oy - 30,
                            x1: ox + cw + 30,
                            y1: oy + ch + 30,
                        },
                        labelX: ox + cw / 2,
                        labelY: oy + ch + 26,
                        seed: Math.random(),
                        hl: 0,
                    },
                ];
            });
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = rect.width;
            h = rect.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            layout();
            if (reduce) draw(t0 + 99999);
        };

        const glow = (
            x: number,
            y: number,
            r: number,
            color: string,
            alpha: number,
        ) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, color);
            g.addColorStop(1, "transparent");
            ctx.globalAlpha = alpha;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        };

        const draw = (t: number) => {
            const elapsed = t - t0;
            ctx.clearRect(0, 0, w, h);

            smooth.x += (pointer.nx - smooth.x) * 0.05;
            smooth.y += (pointer.ny - smooth.y) * 0.05;

            for (const s of field) {
                const px = s.x * w - smooth.x * 16 * s.depth;
                const py = s.y * h - smooth.y * 12 * s.depth;
                const tw = reduce
                    ? 0.75
                    : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
                ctx.globalAlpha = (0.25 + tw * 0.65) * (0.45 + s.depth * 0.55);
                ctx.fillStyle = s.tint ? accent : fg;
                ctx.beginPath();
                ctx.arc(px, py, s.r, 0, Math.PI * 2);
                ctx.fill();
            }

            const ox = -smooth.x * 7;
            const oy = -smooth.y * 5;

            for (const c of placed) {
                const inside =
                    pointer.active &&
                    pointer.x > c.box.x0 &&
                    pointer.x < c.box.x1 &&
                    pointer.y > c.box.y0 &&
                    pointer.y < c.box.y1;
                c.hl += ((inside ? 1 : 0) - c.hl) * 0.08;
                const hl = c.hl;

                const n = c.def.edges.length;
                const p = reduce
                    ? 1
                    : easeOut(clamp01((elapsed - c.def.delay) / 3200));
                if (p <= 0) continue;
                const run = p * n;

                ctx.lineCap = "round";
                ctx.strokeStyle = fg;
                ctx.lineWidth = 0.9 + hl * 0.7;
                ctx.globalAlpha = 0.3 + hl * 0.5;
                ctx.beginPath();
                c.def.edges.forEach(([a, b], k) => {
                    const ep = clamp01(run - k);
                    if (ep <= 0) return;
                    const A = c.pts[a];
                    const B = c.pts[b];
                    ctx.moveTo(A.x + ox, A.y + oy);
                    ctx.lineTo(
                        A.x + ox + (B.x - A.x) * ep,
                        A.y + oy + (B.y - A.y) * ep,
                    );
                });
                ctx.stroke();

                if (!reduce && p >= 0.999) {
                    const pos = ((t * 0.00018 + c.seed) % 1) * n;
                    const k = Math.min(n - 1, Math.floor(pos));
                    const f = pos - k;
                    const [a, b] = c.def.edges[k];
                    const A = c.pts[a];
                    const B = c.pts[b];
                    glow(
                        A.x + ox + (B.x - A.x) * f,
                        A.y + oy + (B.y - A.y) * f,
                        9 + hl * 5,
                        accent,
                        0.85,
                    );
                }

                c.pts.forEach((s, i) => {
                    const appear = clamp01(run - s.firstEdge + 0.35);
                    if (appear <= 0) return;
                    const x = s.x + ox;
                    const y = s.y + oy;
                    const tw = reduce
                        ? 0.9
                        : 0.78 + 0.22 * Math.sin(t * 0.0015 + s.phase + i);
                    const r = (1.1 + s.mag * 2.1 + hl * 0.9) * appear;

                    glow(
                        x,
                        y,
                        r * (5 + hl * 2),
                        s.mag > 0.8 ? accent : fg,
                        (0.13 + hl * 0.2) * tw * appear,
                    );

                    ctx.globalAlpha = tw * appear;
                    ctx.fillStyle = fg;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();

                    if (s.mag > 0.8) {
                        const len =
                            (7 + s.mag * 9 + hl * 5) *
                            appear *
                            (0.85 + 0.15 * tw);
                        ctx.lineWidth = 0.8;
                        ctx.strokeStyle = fg;
                        ctx.globalAlpha = 0.55 * appear;
                        ctx.beginPath();
                        ctx.moveTo(x - len, y);
                        ctx.lineTo(x + len, y);
                        ctx.moveTo(x, y - len);
                        ctx.lineTo(x, y + len);
                        ctx.stroke();
                    }
                });

                if (hl > 0.03) {
                    ctx.globalAlpha = hl * 0.85;
                    ctx.fillStyle = fg;
                    ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(c.def.name, c.labelX + ox, c.labelY + oy);
                }
            }

            // sparks from clicks on the sky
            sparks = sparks.filter((s) => s.life > 0);
            for (const s of sparks) {
                s.life -= 0.022;
                const len = 4 + (1 - s.life) * 22;
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rot);
                ctx.globalAlpha = Math.max(0, s.life) * 0.9;
                ctx.strokeStyle = accent;
                ctx.lineWidth = 1.3;
                ctx.lineCap = "round";
                ctx.beginPath();
                for (let a = 0; a < 4; a++) {
                    const ang = (Math.PI / 2) * a;
                    ctx.moveTo(Math.cos(ang) * len * 0.3, Math.sin(ang) * len * 0.3);
                    ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
                }
                ctx.stroke();
                ctx.restore();
            }

            if (!reduce) {
                if (!meteor && t > nextMeteor) {
                    const fromLeft = Math.random() > 0.5;
                    meteor = {
                        x: fromLeft
                            ? Math.random() * w * 0.45
                            : w * 0.55 + Math.random() * w * 0.45,
                        y: Math.random() * h * 0.3,
                        vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 4),
                        vy: 4 + Math.random() * 3,
                        life: 1,
                    };
                    nextMeteor = t + 6000 + Math.random() * 7000;
                }
                if (meteor) {
                    const m = meteor;
                    m.x += m.vx;
                    m.y += m.vy;
                    m.life -= 0.016;
                    const tx = m.x - m.vx * 16;
                    const ty = m.y - m.vy * 16;
                    const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
                    g.addColorStop(0, fg);
                    g.addColorStop(0.3, accent);
                    g.addColorStop(1, "transparent");
                    ctx.globalAlpha = Math.max(0, m.life);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(m.x, m.y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                    glow(m.x, m.y, 6, fg, Math.max(0, m.life));
                    if (
                        m.life <= 0 ||
                        m.x < -80 ||
                        m.x > w + 80 ||
                        m.y > h + 80
                    )
                        meteor = null;
                }
            }

            ctx.globalAlpha = 1;
        };

        const loop = (t: number) => {
            if (visible) draw(t);
            raf = requestAnimationFrame(loop);
        };

        const onMove = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            pointer.x = e.clientX - r.left;
            pointer.y = e.clientY - r.top;
            pointer.nx = (pointer.x / r.width - 0.5) * 2;
            pointer.ny = (pointer.y / r.height - 0.5) * 2;
            pointer.active =
                pointer.x >= 0 &&
                pointer.x <= r.width &&
                pointer.y >= 0 &&
                pointer.y <= r.height;
        };
        const onLeave = () => {
            pointer.active = false;
            pointer.nx = 0;
            pointer.ny = 0;
        };
        const onDown = (e: PointerEvent) => {
            if (reduce) return;
            const target = e.target as HTMLElement | null;
            if (target?.closest("a,button,input,textarea,[data-sticker]")) return;
            const r = canvas.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            if (y < 0 || y > r.height) return;
            for (let i = 0; i < 5; i++) {
                sparks.push({
                    x: i === 0 ? x : x + (Math.random() - 0.5) * 50,
                    y: i === 0 ? y : y + (Math.random() - 0.5) * 50,
                    life: 1,
                    rot: Math.random() * Math.PI,
                });
            }
            if (sparks.length > 40) sparks = sparks.slice(-40);
        };

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        const io = new IntersectionObserver(
            ([e]) => (visible = e.isIntersecting),
        );
        io.observe(canvas);
        const mo = new MutationObserver(readColors);
        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "style"],
        });

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        document.documentElement.addEventListener("mouseleave", onLeave);

        resize();
        if (!reduce) raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            mo.disconnect();
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            document.documentElement.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 size-full"
        />
    );
}
