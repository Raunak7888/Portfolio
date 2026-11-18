import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// >>> redesign:helpers
export const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);
export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
export const rand = (min: number, max: number) =>
    Math.random() * (max - min) + min;
export const pad2 = (n: number) => String(n).padStart(2, "0");
// <<< redesign:helpers
