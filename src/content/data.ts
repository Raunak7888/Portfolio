import raw from "@/Data/Data.json";
import type { PortfolioData } from "@/types/portfolio";

/** The one typed handle on Data.json. Every section reads its content from here. */
export const portfolio = raw as unknown as PortfolioData;
