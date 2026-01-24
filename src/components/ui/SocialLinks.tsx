"use client";

import { GithubSvg, XSvg, GmailSvg, InstagramSvg, LinkedInSvg } from "@/components/ui/Icons";
import Link from "next/link";

type SocialItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
};

const SOCIALS: SocialItem[] = [
    { href: "https://github.com", label: "GitHub", icon: <GithubSvg /> },
    { href: "https://www.linkedin.com/", label: "Twitter / X", icon: <LinkedInSvg /> },
    {
        href: "https://www.instagram.com/",
        label: "Instagram",
        icon: <InstagramSvg />,
    },
    { href: "mailto:you@example.com", label: "Email", icon: <GmailSvg /> },
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
