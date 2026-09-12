import {
  siDocker,
  siExpress,
  siHuggingface,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siOllama,
  siReact,
  siSupabase,
  type SimpleIcon,
} from "simple-icons";

// Copy shared by more than one marketing page.

// --- Services: what we sell, in the language buyers use ---------------------

export const servicesTitle = "Business problems, solved with automation.";

export const services: { key: string; label: string; title: string; description: string; examples: string }[] = [
  { key: "strategy", label: "Automation strategy", title: "Find what's worth automating", description: "Map your processes and systems, find the problems worth solving, and build a roadmap and business case your leadership can back.", examples: "Process assessment · Opportunity prioritization · Roadmaps" },
  { key: "automation", label: "Process automation", title: "Automate the work in between", description: "Connect your systems and automate the repetitive steps between them, so work moves on its own and people focus on decisions and exceptions.", examples: "Approvals · Document intake · System integration" },
  { key: "ai", label: "AI & agents", title: "Put AI to work", description: "AI agents and assistants that read documents, answer questions, and take action, plus forecasts that see problems coming, all built into your processes.", examples: "AI agents · Document intelligence · Forecasting" },
  { key: "data", label: "Data & insights", title: "See what's really happening", description: "Bring scattered data together into one trusted view, with dashboards and reporting your leaders can act on.", examples: "Data integration · Dashboards · KPI reporting" },
];

// --- Capabilities: the technology, in plain terms (tags are for the technical reader) ---

export const capabilitiesTitle = "The capabilities behind it.";
export const capabilitiesIntro = "Proven technology, chosen for the job and explained in plain terms.";
export const capabilitiesNote = "Model- and platform-agnostic. Open-source first with licensing checked, and built on the systems you already run.";

export const capabilities: { key: string; title: string; description: string; tags: string }[] = [
  { key: "automation", title: "Process automation", description: "Connected, auditable processes across your systems and teams.", tags: "Orchestration · APIs · n8n" },
  { key: "agents", title: "AI agents & assistants", description: "Assistants and agents that draft, summarize, and act, grounded in your own data.", tags: "LLMs · Retrieval (RAG) · Guardrails" },
  { key: "documents", title: "Document intelligence", description: "Invoices, forms, and contracts read and turned into validated data.", tags: "OCR · Extraction · Human review" },
  { key: "ml", title: "Machine learning", description: "Forecasts, predictions, and early warnings learned from your history.", tags: "Forecasting · Classification · Anomaly detection" },
  { key: "data", title: "Data foundations", description: "Clean, connected, governed data that automation and AI can rely on.", tags: "Pipelines · Postgres · Data quality" },
  { key: "apps", title: "Custom applications", description: "Simple portals and dashboards where people review, approve, and act.", tags: "Web apps · Dashboards · Next.js" },
];

// --- Technology we build with (logo band under the hero) --------------------
// All free for commercial use. Everything is OSI open source except n8n, which
// is source-available ("fair-code") and free to self-host for business use —
// hence the "open-source and source-available" wording on the page.

export const techNote = "Open-source and source-available tools, licensed for commercial use.";

export const techStack: { key: string; icon: SimpleIcon; name: string }[] = [
  { key: "n8n", icon: siN8n, name: "n8n" },
  { key: "node", icon: siNodedotjs, name: "Node.js" },
  { key: "express", icon: siExpress, name: "Express" },
  { key: "next", icon: siNextdotjs, name: "Next.js" },
  { key: "react", icon: siReact, name: "React" },
  { key: "supabase", icon: siSupabase, name: "Supabase" },
  { key: "huggingface", icon: siHuggingface, name: "Hugging Face" },
  { key: "ollama", icon: siOllama, name: "Ollama" },
  { key: "docker", icon: siDocker, name: "Docker" },
];

// --- Responsible by design ---------------------------------------------------

export const principlesTitle = "Responsible by design.";

export const principles = [
  { key: "control", title: "People stay in control", description: "Automation handles the routine. People approve what matters and review the exceptions." },
  { key: "data", title: "Your data stays yours", description: "Privacy and security are designed in from day one, and solutions run in environments you control." },
  { key: "outcomes", title: "Measured by outcomes", description: "Every engagement starts from a baseline and reports results you can see." },
] as const;

export const contactBand = {
  label: "Let's solve it",
  title: "What's slowing your team down?",
  description: "Tell us about the process, the people, and the bottleneck. We'll help you find where automation can make the biggest difference.",
};
