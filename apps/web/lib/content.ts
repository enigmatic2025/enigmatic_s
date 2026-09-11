import { Compass, Database, Layers3, Workflow, type LucideIcon } from "lucide-react";
import { siExpress, siN8n, siNextdotjs, siSupabase, type SimpleIcon } from "simple-icons";

// Copy shared by more than one marketing page.

export const capabilitiesTitle = "Four ways we make operations run better.";

export const capabilities: { key: string; label: string; icon: LucideIcon; title: string; description: string; examples: string }[] = [
  { key: "consulting", label: "Consulting", icon: Compass, title: "Clarity before code", description: "Map your processes and systems, find the opportunities worth the investment, and define a clear scope and return before anything is built.", examples: "Process mapping · Opportunity assessment · Roadmaps" },
  { key: "data", label: "Data engineering", icon: Database, title: "Data you can trust", description: "Pipelines that bring your TMS, ERP, telematics, and spreadsheets into one clean model, with reporting your team can act on.", examples: "Pipelines · Data models · KPI reporting" },
  { key: "applications", label: "App development", icon: Layers3, title: "Software that fits", description: "Internal tools and portals built around how your team works, connected to your data, and deployed and supported by us.", examples: "Internal tools · Portals · Dashboards" },
  { key: "automation", label: "Workflow automation", icon: Workflow, title: "Connected workflows", description: "Automate the steps between your systems with n8n. AI handles document extraction and triage where it helps, with people reviewing the exceptions.", examples: "Approvals · Integrations · Document intake" },
];

export const stackTitle = "A focused, open-source stack.";
export const stackNote = "Open-source first, with licensing checked for every project. We also build on the stack you already run.";

export const stack: { key: string; icon: SimpleIcon; name: string; role: string; accent?: boolean }[] = [
  { key: "next", icon: siNextdotjs, name: "Next.js", role: "Applications, portals, and dashboards." },
  { key: "express", icon: siExpress, name: "Express", role: "APIs, integrations, and business logic." },
  { key: "supabase", icon: siSupabase, name: "Supabase", role: "Postgres database, auth, and storage." },
  { key: "n8n", icon: siN8n, name: "n8n", role: "Workflow automation between your systems.", accent: true },
];

export const principles = [
  { key: "fit", title: "Built around your business", description: "Bespoke solutions that fit how you operate and the systems you already run." },
  { key: "control", title: "Clarity at every step", description: "Documented workflows, visible exceptions, and human control." },
  { key: "scale", title: "Supported after launch", description: "We deploy, monitor, and maintain what we build, and grow it as your needs evolve." },
] as const;

export const contactBand = {
  label: "Let's build something useful",
  title: "What's slowing your team down?",
  description: "Tell us about the process, the data, and the bottleneck. We'll help you find where better workflows, data, or software can make a difference.",
};
