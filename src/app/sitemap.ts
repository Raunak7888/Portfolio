import type { MetadataRoute } from "next";
import projects from "@/Data/Project.json";
import { SITE_URL } from "@/lib/seo";

const INCLUDE_PROJECTS = true;

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [{ url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 }];
    if (INCLUDE_PROJECTS) {
        for (const slug of Object.keys(projects)) {
            entries.push({ url: `${SITE_URL}/projects/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
        }
    }
    return entries;
}
