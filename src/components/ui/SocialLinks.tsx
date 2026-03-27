"use client";

import {
    GithubSvg,
    GmailSvg,
    InstagramSvg,
    LinkedInSvg,
} from "@/components/ui/Icons";
import Link from "next/link";
import data from "@/Data/Data.json";

type SocialItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
};

const SOCIALS: SocialItem[] = [
    { href: data.heroSection.socialLinks.githubUrl, label: "GitHub", icon: <GithubSvg /> },
    {
        href: data.heroSection.socialLinks.linkedInUrl,
        label: "Twitter / X",
        icon: <LinkedInSvg />,
    },
    {
        href: data.heroSection.socialLinks.instagramUrl,
        label: "Instagram",
        icon: <InstagramSvg />,
    },
    { href: data.heroSection.socialLinks.gmailUrl, label: "Email", icon: <GmailSvg /> },
];

export const SocialIcons = ({
    size = 50,
    className,
}: {
    size?: number;
    className?: string;
}) => {
    return (
        <div className={`flex ${className}`}>
            {SOCIALS.map(({ href, label, icon }) => (
                <Link
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                        href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                    }
                    aria-label={label}
                    className={`flex items-center justify-center hover:z-10`}
                    style={{ width: size, height: size }}
                >
                    {icon}
                </Link>
            ))}
        </div>
    );
};
