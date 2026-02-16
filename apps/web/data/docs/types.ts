import { LucideIcon } from "lucide-react";

export type DocBlockType =
    | "h3"
    | "prose"
    | "code"
    | "stepList"
    | "paramTable"
    | "callout"
    | "conceptGrid"
    | "navLinks"
    | "image";

export interface DocBlock {
    type: DocBlockType;
    content?: string; // For simple text/html
    // Specific properties for complex blocks
    code?: string;
    language?: string;
    label?: string; // For CodeBlock label or Button label
    id?: string; // For CodeBlock copy ID

    // StepList
    steps?: { title: string; desc: string }[];

    // ParamTable
    rows?: { name: string; type: string; desc: string }[];

    // ConceptGrid
    concepts?: { iconName: string; title: string; desc: string; color?: string }[];

    // NavLinks
    links?: { label: string; url: string }[];
}

export interface DocSection {
    id: string;
    title: string;
    iconName: string; // We'll map string names to Lucide icons in the renderer
    description: string;
    blocks: DocBlock[];
}

export interface DocSchema {
    sections: DocSection[];
}

export interface SidebarGroup {
    title: string;
    items: { id: string; label: string }[];
}
