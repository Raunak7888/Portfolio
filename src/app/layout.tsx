import type { Metadata } from "next";
import "./globals.css";
import {
    Mitr,
    Modak,
    Jersey_25,
    Luckiest_Guy,
    Madimi_One,
    Nunito,
    Krona_One,
    Outfit,
    Aclonica,
    Mogra,
    Lemon,
    Piedra,
    Poetsen_One,
    Bungee,
    JetBrains_Mono,
} from "next/font/google";
import { Providers } from "@/components/Provider";

const bungee = Bungee({
    variable: "--font-bungee",
    subsets: ["latin"],
    weight: ["400"],
});

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"],
    weight: ["400"],
});
const mitr = Mitr({
    variable: "--font-mitr",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
});
const modak = Modak({
    variable: "--font-modak",
    subsets: ["latin"],
    weight: "400",
});
const jersey = Jersey_25({
    variable: "--font-jersey",
    subsets: ["latin"],
    weight: "400",
});
const luckiest = Luckiest_Guy({
    variable: "--font-luckiest",
    subsets: ["latin"],
    weight: "400",
});
const madimi = Madimi_One({
    variable: "--font-madimi",
    subsets: ["latin"],
    weight: "400",
});
const krona = Krona_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-krona",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const aclonica = Aclonica({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-aclonica",
});
const mogra = Mogra({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-mogra",
});
const lemon = Lemon({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-lemon",
});
const piedra = Piedra({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-piedra",
});
const poetsen = Poetsen_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-poetsen",
});

export const google = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "Raunak Yadav",
    description:
        "Portfolio of Raunak Yadav - Software Developer, Tech Enthusiast, and Lifelong Learner.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${outfit.className} ${bungee.variable} ${google.variable} ${krona.variable} ${aclonica.variable} ${mogra.variable} ${modak.variable} ${lemon.variable} ${piedra.variable} ${poetsen.variable} antialiased ${mitr.variable} ${modak.variable} ${jersey.variable} ${luckiest.variable} ${madimi.variable} ${nunito.variable}`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
