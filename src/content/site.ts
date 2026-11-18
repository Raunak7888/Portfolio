import data from "@/Data/Data.json";

const s = data.heroSection.socialLinks;

/** One source of truth for identity, links and navigation. */
export const site = {
    firstName: data.hero.firstName,
    fullName: data.hero.fullName,
    email: data.hero.email,
    location: "Delhi NCR, India",
    timezone: "Asia/Kolkata",
    social: [
        { label: "GitHub", href: s.githubUrl },
        { label: "LinkedIn", href: s.linkedInUrl },
        { label: "Instagram", href: s.instagramUrl },
    ],
    stack: [
        "Java", "Spring Boot", "React", "Next.js", "TypeScript", "Tailwind CSS",
        "Docker", "Kubernetes", "GCP", "Terraform", "Ansible", "GitHub Actions",
    ],
    nav: [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
        { label: "Contact", href: "#contact" },
    ],
};
