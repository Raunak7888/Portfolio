export interface Technology {
  name: string;
  iconKey: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  accent: string;
  iconKey: string;
  images: string[];
  highlights: string[];
  technologies: Technology[];
  metrics?: ProjectMetric[];
  links: {
    github?: string;
    live?: string;
    caseStudy?: string;
  };
  previewUrl?: string; // shown in browser chrome address bar
  status: "live" | "wip" | "archived";
}