import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/redesign.css";
import "@/styles/polish.css";
import "@/styles/editorial.css";
import "@/styles/links.css";
import "@/styles/project-media.css";
import { Instrument_Serif, JetBrains_Mono, Outfit, Bungee, Nunito, Mitr, Modak, Jersey_25, Luckiest_Guy, Madimi_One, Krona_One, Aclonica, Mogra, Lemon, Piedra, Poetsen_One } from "next/font/google";
import { Providers } from "@/components/Provider";
import data from "@/Data/Data.json";
import { SITE_URL } from "@/lib/seo";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
    display: "swap",
});
const bungee = Bungee({ variable: "--font-bungee", subsets: ["latin"], weight: ["400"], display: "swap" });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400"], display: "swap" });
const mitr = Mitr({ variable: "--font-mitr", subsets: ["latin"], weight: ["200","300","400","500","600","700"], display: "swap" });
const modak = Modak({ variable: "--font-modak", subsets: ["latin"], weight: ["400"], display: "swap" });
const jersey = Jersey_25({ variable: "--font-jersey", subsets: ["latin"], weight: ["400"], display: "swap" });
const luckiest = Luckiest_Guy({ variable: "--font-luckiest", subsets: ["latin"], weight: ["400"], display: "swap" });
const madimi = Madimi_One({ variable: "--font-madimi", subsets: ["latin"], weight: ["400"], display: "swap" });
const krona = Krona_One({ variable: "--font-krona", subsets: ["latin"], weight: ["400"], display: "swap" });
const aclonica = Aclonica({ variable: "--font-aclonica", subsets: ["latin"], weight: ["400"], display: "swap" });
const mogra = Mogra({ variable: "--font-mogra", subsets: ["latin"], weight: ["400"], display: "swap" });
const lemon = Lemon({ variable: "--font-lemon", subsets: ["latin"], weight: ["400"], display: "swap" });
const piedra = Piedra({ variable: "--font-piedra", subsets: ["latin"], weight: ["400"], display: "swap" });
const poetsen = Poetsen_One({ variable: "--font-poetsen", subsets: ["latin"], weight: ["400"], display: "swap" });

const title = "Raunak Yadav | Full-Stack Developer";
const description =
    "Raunak Yadav is a full-stack developer from Delhi NCR. Java, Spring Boot, React and TypeScript. Main project: Hermes, an end-to-end encrypted chat app.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | Raunak Yadav" },
    description,
    authors: [{ name: "Raunak Yadav" }],
    keywords: ["Raunak Yadav", "full-stack developer", "Java", "Spring Boot", "React", "TypeScript", "Next.js"],
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", siteName: "Raunak Yadav", type: "website", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    ],
};

/*
 * Apply the saved accent colour before first paint, so it never flashes.
 * Same contrast maths as readableOn() in lib/accent.ts.
 */
const accentScript =
    "(function(){try{var c=localStorage.getItem('theme-primary');if(c&&/^#[0-9a-fA-F]{6}$/.test(c)){var h=c.slice(1),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),f=function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)},L=0.2126*f(r)+0.7152*f(g)+0.0722*f(b),s=document.documentElement.style;s.setProperty('--primary',c);s.setProperty('--primary-rgb',r+', '+g+', '+b);s.setProperty('--primary-foreground',1.05/(L+0.05)>=(L+0.05)/0.05?'#ffffff':'#0a0a0a')}}catch(e){}})();";

const links = data.heroSection.socialLinks;
const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.hero.fullName,
    url: SITE_URL,
    jobTitle: "Full-Stack Developer",
    email: `mailto:${data.hero.email}`,
    sameAs: [links.githubUrl, links.linkedInUrl, links.instagramUrl],
    alumniOf: { "@type": "CollegeOrUniversity", name: "DAV Institute of Management, Faridabad" },
    knowsAbout: ["Java", "Spring Boot", "React", "TypeScript", "Next.js"],
};
const personJson = JSON.stringify(personLd).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${outfit.className} ${outfit.variable} ${mono.variable} ${serif.variable} ${bungee.variable} ${nunito.variable} ${mitr.variable} ${modak.variable} ${jersey.variable} ${luckiest.variable} ${madimi.variable} ${krona.variable} ${aclonica.variable} ${mogra.variable} ${lemon.variable} ${piedra.variable} ${poetsen.variable} antialiased overflow-x-hidden`}
            >
                <script dangerouslySetInnerHTML={{ __html: accentScript }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJson }} />
                <noscript>
                    <style dangerouslySetInnerHTML={{ __html: "[data-ed-hide],[style*=\"opacity:0;\"],[style$=\"opacity:0\"]{opacity:1!important;transform:none!important;filter:none!important}" }} />
                </noscript>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
