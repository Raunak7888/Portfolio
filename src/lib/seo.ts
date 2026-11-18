/**
 * Canonical site URL. Order: NEXT_PUBLIC_SITE_URL, then Vercel's production
 * URL, then localhost. Set NEXT_PUBLIC_SITE_URL for any other host.
 */
function resolveSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, "");
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`.replace(/\/+$/, "");
    return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
