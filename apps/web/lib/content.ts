// Copy shared by more than one marketing page.

// --- Services: what we sell, in the language buyers use ---------------------

export const servicesTitle = "End-to-end AI and automation, from strategy to operations.";

export const services: { key: string; label: string; title: string; description: string; examples: string }[] = [
  { key: "strategy", label: "AI strategy", title: "Find where AI pays off", description: "Assess your processes and data readiness, prioritize the use cases worth funding, and build a roadmap and business case your leadership can back.", examples: "Readiness assessment · Use-case prioritization · Roadmaps" },
  { key: "automation", label: "Intelligent automation", title: "Automate the work in between", description: "Redesign end-to-end workflows so routine steps run on their own across your systems, and people focus on the decisions and exceptions.", examples: "Approvals · Document intake · System integration" },
  { key: "ai", label: "AI & machine learning", title: "Put AI to work", description: "Assistants, agents, forecasts, and document intelligence built around your operations and grounded in your own data.", examples: "AI assistants · Forecasting · Document intelligence" },
  { key: "managed", label: "Managed services", title: "Keep it running and improving", description: "We deploy, monitor, and maintain what we build, keep models and workflows accurate as things change, and help your teams adopt it.", examples: "Monitoring · Support · Adoption & training" },
];

// --- Capabilities: the technology, in plain terms (tags are for the technical reader) ---

export const capabilitiesTitle = "The capabilities behind it.";
export const capabilitiesIntro = "Proven technology, chosen for the job and explained in plain terms.";
export const capabilitiesNote = "Model- and platform-agnostic. Open-source first with licensing checked, and built on the systems you already run.";

export const capabilities: { key: string; title: string; description: string; tags: string }[] = [
  { key: "genai", title: "Generative AI & agents", description: "Assistants and agents that draft, summarize, and act, grounded in your own data.", tags: "LLMs · Retrieval (RAG) · Guardrails" },
  { key: "ml", title: "Machine learning", description: "Forecasts, predictions, and early warnings learned from your history.", tags: "Forecasting · Classification · Anomaly detection" },
  { key: "documents", title: "Document intelligence", description: "Invoices, forms, and contracts read and turned into validated data.", tags: "OCR · Extraction · Human review" },
  { key: "automation", title: "Process automation", description: "Connected, auditable workflows across your systems and teams.", tags: "Workflow orchestration · APIs · n8n" },
  { key: "data", title: "Data foundations", description: "Clean, connected, governed data that AI can rely on.", tags: "Pipelines · Postgres · Data quality" },
  { key: "apps", title: "Custom applications", description: "Simple portals and dashboards where people review, approve, and act.", tags: "Web apps · Dashboards · Next.js" },
];

// --- Responsible by design ---------------------------------------------------

export const principlesTitle = "Responsible by design.";

export const principles = [
  { key: "control", title: "People stay in control", description: "AI handles the routine. People approve what matters and review the exceptions." },
  { key: "data", title: "Your data stays yours", description: "Privacy and security are designed in from day one, and solutions run in environments you control." },
  { key: "outcomes", title: "Measured by outcomes", description: "Every engagement starts from a baseline and reports results you can see." },
] as const;

export const contactBand = {
  label: "Let's talk about AI",
  title: "What's slowing your team down?",
  description: "Tell us about the process, the people, and the bottleneck. We'll help you find where AI and automation can make the biggest difference.",
};
