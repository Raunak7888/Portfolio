export const ACCENT_STORAGE_KEY = "theme-primary";

export type Accent = { name: string; value: string };

export const ACCENTS: Accent[] = [
    { name: "Deep Purple", value: "#7C3AED" },
    { name: "Sky Blue", value: "#0EA5E9" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Burnt Orange", value: "#EA580C" },
    { name: "Rose Red", value: "#EF4444" },
];

export const DEFAULT_ACCENT = ACCENTS[0].value;

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

function channel(v: number) {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function toRgb(hex: string): [number, number, number] {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** Pick white or near-black text, whichever has the higher contrast on `hex`. */
export function readableOn(hex: string): "#ffffff" | "#0a0a0a" {
    const [r, g, b] = toRgb(hex);
    const L = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? "#ffffff" : "#0a0a0a";
}

/**
 * Sets --primary, --primary-rgb and a readable --primary-foreground.
 * The same maths runs in the inline script in app/layout.tsx (before first paint).
 */
export function applyAccent(hex: string) {
    if (!isHex(hex)) return;
    const [r, g, b] = toRgb(hex);
    const s = document.documentElement.style;
    s.setProperty("--primary", hex);
    s.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
    s.setProperty("--primary-foreground", readableOn(hex));
}

export function readStoredAccent(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const v = window.localStorage.getItem(ACCENT_STORAGE_KEY);
        return isHex(v) ? v : null;
    } catch {
        return null;
    }
}

export function storeAccent(hex: string) {
    try {
        window.localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } catch {
        /* storage blocked: the choice just won't persist */
    }
}
