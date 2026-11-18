/** Types for every JSON content file. Change the JSON, not the components. */

export type StatusKind = "live" | "active" | "building";
export type LinkKind = "repo" | "live" | "post";
export type Metric = { value: number | string; suffix?: string; label: string };
export type ProjectLink = { kind: LinkKind; label: string; href: string };
export type Screenshot = { src: string; alt: string; width?: number; height?: number };
export type Technology = { name: string; category?: string };

/** The one schema every entry in Project.json follows. The key is the slug. */
export type ProjectRecord = {
    meta: {
        projectName: string;
        status: StatusKind;
        codename?: string;
        version?: string;
        lastUpdated?: string;
        maintainers?: string[];
        license?: string;
    };
    card: {
        order: number;
        kind: string;
        tagline: string;
        summary: string;
        tint: string;
        chips: string[];
        bullets: string[];
        metrics: Metric[];
        readout?: string;
    };
    /** Picks one of the shared hover interactions. See components/section/project/media. */
    presentation: { interaction: string };
    links: ProjectLink[];
    screenshots: Screenshot[];
    technologies: Technology[];
    executiveSummary: {
        oneLiner: string;
        problemStatement: string;
        solutionOverview: string;
        primaryUsers?: string[];
        keyCapabilities: string[];
        knownLimitations: string[];
    };
    roadmap?: { shortTerm?: string[]; midTerm?: string[]; longTerm?: string[] };
    architecture?: unknown;
    technologyStack?: unknown;
    engineeringImprovements?: unknown;
};

/** Flat shape used by the project stage. Built from ProjectRecord in content/projects.ts. */
export type Project = {
    id: string;
    name: string;
    kind: string;
    tint: string;
    status: StatusKind;
    cardLine: string;
    summary: string;
    chips: string[];
    bullets: string[];
    metrics: Metric[];
    links: ProjectLink[];
    caseStudy: string;
    screenshots: Screenshot[];
    interaction: string;
    readout?: string;
};

export type Cta = { label: string; href: string };

export type HeroData = {
    firstName: string;
    secondName?: string;
    fullName: string;
    email: string;
    eyebrow?: string;
    greeting?: string;
    role?: { before: string; highlight: string };
    intro?: { before: string; emphasis: string; middle: string; after: string };
    rotatorWords?: string[];
    stickers?: { label: string; tilt?: number }[];
    primaryCta?: Cta;
    secondaryCta?: Cta;
};

export type PillarInput = {
    id: string;
    iconKey?: string;
    kicker: string;
    title: string;
    text: string;
    emoji?: string;
    backTitle?: string;
    backText?: string;
    tint?: string;
    tilt?: number;
};

export type AboutData = {
    greeting: string;
    headingTop: string;
    headingBottom: string;
    paragraph: string;
    half: string;
    currently: string;
    topics?: string[];
    cta?: Cta;
    pillars?: PillarInput[];
    mascotLines?: string[];
};

type Heading = { index?: string; badge: string; headingTop: string; headingBottom: string };
export type SkillsCopy = Heading & {
    hintFine: string; hintTouch: string; emptyTitle: string; emptyText: string; done: string; allBlurb?: string;
};
export type ProjectsCopy = Heading & {
    hintFine: string; hintTouch: string; outroTitle: string; outroText: string; outroCta: string; comingSoon: string; caseStudy: string;
};
export type ExperienceCopy = Heading & { educationLabel?: string; writingLabel?: string };
export type ContactCopy = Heading & {
    intro: string;
    primaryCta: string;
    copyLabel?: string;
    copiedLabel?: string;
    availability?: string;
    replyTime?: string;
    formTitle: string;
    topicsLabel: string;
    topics: { id: string; label: string }[];
    submitLabel: string;
    successTitle: string;
    successText: string;
};

export type SkillInput = {
    id: string;
    name: string;
    mark?: string;
    cat?: string;
    level?: number;
    note?: string;
    usedIn?: string;
    related?: string[];
};
export type CategoryInput = { id: string; label?: string; blurb?: string; tint?: string };

export type ExperienceEntry = {
    role: string;
    org: string;
    period: string;
    location?: string;
    summary?: string;
    points?: string[];
    stack?: string[];
    link?: { label: string; href: string };
};
export type EducationEntry = { degree: string; school: string; year?: string };
export type WritingEntry = { title: string; source?: string; href: string };

export type PortfolioData = {
    hero: HeroData;
    heroSection: { description?: string; socialLinks: Record<string, string>; viewSourceGithubLinkUrl?: string };
    about: AboutData;
    site: { location: string; timezone: string; stack: string[] };
    sections: {
        skills: SkillsCopy;
        projects: ProjectsCopy;
        experience: ExperienceCopy;
        contact: ContactCopy;
    };
    skills: { levels?: string[]; categories?: CategoryInput[]; skills: SkillInput[] };
    experience: ExperienceEntry[];
    education: EducationEntry[];
    writing: WritingEntry[];
    footer: { note?: string; availability?: string; copyright?: string };
};
