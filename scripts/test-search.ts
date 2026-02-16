import { enDocs } from "../apps/web/data/docs/en";
import { flattenDocs } from "../apps/web/lib/search";
import Fuse from "fuse.js";

console.log("Testing search index...");

const records = flattenDocs(enDocs);
console.log(`Total records: ${records.length}`);

const fuse = new Fuse(records, {
    keys: [
        { name: "title", weight: 2 },
        { name: "content", weight: 1 },
        { name: "sectionTitle", weight: 0.5 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeMatches: true,
});

const query = "MCP";
const results = fuse.search(query);

console.log(`Searching for "${query}"... Found ${results.length} results.`);

results.forEach((result, i) => {
    console.log(`[${i}] ${result.item.title} (${result.item.type})`);
    console.log(`    Content: ${result.item.content?.substring(0, 50)}...`);
    console.log(`    Score: ${result.score}`);
});
