import { DocSection, DocBlock } from "@/data/docs/types";

export interface SearchRecord {
    id: string;
    title: string;
    content: string;
    url: string;
    type: "section" | "block";
    sectionTitle: string;
}

export function flattenDocs(docs: DocSection[]): SearchRecord[] {
    const records: SearchRecord[] = [];

    docs.forEach((section) => {
        // Add the main section title
        records.push({
            id: section.id,
            title: section.title,
            content: section.description,
            url: section.id,
            type: "section",
            sectionTitle: section.title,
        });

        // Add individual blocks
        section.blocks.forEach((block, index) => {
            if (block.type === "h3") {
                records.push({
                    id: `${section.id}-h3-${index}`,
                    title: block.content || "", // Fallback to empty string if undefined
                    content: "",
                    url: section.id, // We could add hash anchors if we implemented them
                    type: "block",
                    sectionTitle: section.title,
                });
            } else if (block.type === "prose" || block.type === "callout") {
                // Strip HTML tags for better search
                const rawContent = block.content || "";
                const textContent = rawContent.replace(/<[^>]*>?/gm, "");
                if (textContent.trim()) {
                    records.push({
                        id: `${section.id}-content-${index}`,
                        title: section.title, // Fallback to section title
                        content: textContent,
                        url: section.id,
                        type: "block",
                        sectionTitle: section.title,
                    });
                }
            } else if (block.type === "stepList") {
                block.steps?.forEach((step, stepIndex) => {
                    records.push({
                        id: `${section.id}-step-${index}-${stepIndex}`,
                        title: step.title,
                        content: step.desc,
                        url: section.id,
                        type: "block",
                        sectionTitle: section.title,
                    });
                });
            } else if (block.type === "conceptGrid") {
                block.concepts?.forEach((concept, cIndex) => {
                    records.push({
                        id: `${section.id}-concept-${index}-${cIndex}`,
                        title: concept.title,
                        content: concept.desc,
                        url: section.id,
                        type: "block",
                        sectionTitle: section.title,
                    });
                })
            }
        });
    });

    return records;
}
