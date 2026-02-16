/**
 * Pre-build script: generates static JSON files from TypeScript doc data.
 * These files are placed in /public/docs/ and served as pure CDN assets.
 *
 * Run: npx tsx scripts/generate-docs-json.ts
 * Or add to package.json build: "prebuild": "tsx scripts/generate-docs-json.ts"
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Use dynamic import to load the TS data
async function main() {
  const { enDocs } = await import("../data/docs/en");
  const { viDocs } = await import("../data/docs/vi");
  const { zhTwDocs } = await import("../data/docs/zh-TW");

  const outDir = join(__dirname, "..", "public", "docs");
  mkdirSync(outDir, { recursive: true });

  const files: Record<string, unknown> = {
    "en.json": enDocs,
    "vi.json": viDocs,
    "zh-TW.json": zhTwDocs,
  };

  for (const [filename, data] of Object.entries(files)) {
    const path = join(outDir, filename);
    writeFileSync(path, JSON.stringify(data), "utf-8");
    console.log(`Generated ${path}`);
  }

  console.log("Static docs JSON generated successfully.");
}

main().catch(console.error);
