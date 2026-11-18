import { portfolio } from "./data";

const s = portfolio.sections.experience;

export const copy = {
    index: s.index ?? "04",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    educationLabel: s.educationLabel ?? "Education",
    writingLabel: s.writingLabel ?? "Writing",
};

export const experience = portfolio.experience ?? [];
export const education = portfolio.education ?? [];
export const writing = portfolio.writing ?? [];
