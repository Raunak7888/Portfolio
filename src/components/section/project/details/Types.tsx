export interface ProjectData {
    meta: Meta;
    images: string[];
    executiveSummary: ExecutiveSummary;
    architecture: Architecture;
    technologyStack: TechnologyStack;
    roadmap: Roadmap;
}

/* ================= META ================= */

export interface Meta {
    projectName: string;
    codename: string;
    version: string;
    status: "active" | "maintenance" | "archived";
    lastUpdated: string;
    maintainers: string[];
    repository: string;
    license: string;
    post: string;
}

/* ============ EXECUTIVE SUMMARY ============ */

export interface ExecutiveSummary {
    oneLiner: string;
    problemStatement: string;
    solutionOverview: string;
    primaryUsers: string[];
    keyCapabilities: string[];
    knownLimitations: string[];
}

/* ============== ARCHITECTURE ============== */

export interface Architecture {
    overview: string;
    diagram: ArchitectureDiagram;
    components: ArchitectureComponent[];
    dataFlow: DataFlow[];
    architectureRationale: string;
}

export interface ArchitectureDiagram {
    type: "text" | "mermaid";
    content: string;
}

export interface ArchitectureComponent {
    name: string;
    type: "frontend" | "backend" | "database" | "broker";
    responsibilities: string[];
    tech: string[];
}

export interface DataFlow {
    flowName: string;
    steps: string[];
}

/* ============ TECHNOLOGY STACK ============ */

export interface TechnologyStack {
    backend: BackendTech[];
    frontend: FrontendTech[];
    infrastructure: string[];
    rejectedAlternatives: RejectedAlternative[];
}

export interface BackendTech {
    name: string;
    version: string;
    purpose: string;
    tradeOffs: string;
}

export interface FrontendTech {
    name: string;
    version: string;
    purpose: string;
    tradeOffs: string;
}

export interface RejectedAlternative {
    option: string;
    reasonRejected: string;
}

/* ================= ROADMAP ================= */

export interface Roadmap {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
}
