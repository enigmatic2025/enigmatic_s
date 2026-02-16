"use client";

import React from "react";
import {
  BookOpen,
  Copy,
  Check,
  Zap,
  Globe,
  Play,
  User,
  Webhook,
  ArrowRight,
  GitBranch,
  Repeat,
  Variable,
  Send,
  Layers,
  LucideIcon,
  Search,
} from "lucide-react";
import { useLocale } from "next-intl";
import { enDocs } from "@/data/docs/en";
import { viDocs } from "@/data/docs/vi";
import { zhTwDocs } from "@/data/docs/zh-TW";
import { DocBlock, DocSection } from "@/data/docs/types";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Globe,
  Layers,
  Play,
  User,
  Webhook,
  ArrowRight,
  GitBranch,
  Repeat,
  Variable,
  Send,
  Search
};

// Data mapping
const docsData: Record<string, DocSection[]> = {
  en: enDocs,
  vi: viDocs,
  "zh-TW": zhTwDocs,
};

/* ── Section Router ─────────────────────────────────────── */

export type CP = {
  copy: (text: string, id: string) => void;
  copiedSnippet: string | null;
  onNavigate: (id: string) => void;
};

export function SectionContent(props: CP & { id: string }) {
  const locale = useLocale();
  const docs = docsData[locale] || enDocs;
  
  // Find the section data
  const section = docs.find((s) => s.id === props.id) || docs[0];
  
  return <SectionRenderer section={section} {...props} />;
}

/* ── Renderer ───────────────────────────────────────────── */

function SectionRenderer({ section, copy, copiedSnippet, onNavigate }: { section: DocSection } & CP) {
  const Icon = iconMap[section.iconName] || BookOpen;

  return (
    <>
      <SectionHeader
        icon={<Icon className="w-6 h-6" />}
        title={section.title}
        description={section.description}
      />
      
      <div className="space-y-8">
        {section.blocks.map((block, index) => {
          switch (block.type) {
            case "h3":
              return <H3 key={index}>{block.content}</H3>;
              
            case "prose":
              return (
                <div 
                  key={index} 
                  className="text-base text-muted-foreground leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: block.content || "" }} 
                />
              );
              
            case "code":
              return (
                <CodeBlock
                  key={index}
                  id={block.id || `code-${index}`}
                  code={block.code || ""}
                  label={block.label}
                  copy={copy}
                  copiedSnippet={copiedSnippet}
                />
              );
              
            case "stepList":
              if (!block.steps) return null;
              return <StepList key={index} steps={block.steps} />;
              
            case "paramTable":
              if (!block.rows) return null;
              return <ParamTable key={index} rows={block.rows} />;
              
            case "callout":
              return (
                <Callout key={index} onNavigate={onNavigate}>
                  <span dangerouslySetInnerHTML={{ __html: block.content || "" }} />
                </Callout>
              );
              
            case "conceptGrid":
              if (!block.concepts) return null;
              return (
                <div key={index} className="grid md:grid-cols-2 gap-6">
                  {block.concepts.map((c, i) => {
                    const CIcon = iconMap[c.iconName] || BookOpen;
                    return (
                      <div key={i} className="flex gap-4 p-5 border border-border rounded-xl bg-card hover:bg-muted/20 transition-colors">
                        <span className={cn("mt-1", c.color || "text-foreground")}>
                          <CIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="text-base font-semibold text-foreground mb-1">{c.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              
            case "navLinks":
              if (!block.links) return null;
              return (
                <div key={index} className="flex gap-4 flex-wrap pt-4 border-t border-border/40">
                  {block.links.map((link, i) => (
                    <NavLink key={i} label={link.label} onClick={() => onNavigate(link.url)} />
                  ))}
                </div>
              );
              
            default:
              return null;
          }
        })}
      </div>
    </>
  );
}

/* ── Helper Components ──────────────────────────────────── */

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-border/40">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold tracking-tight mt-8 mb-4">{children}</h3>;
}

function Callout({ children, onNavigate }: { children: React.ReactNode, onNavigate: (id: string) => void }) {
  // We need to intercept clicks on 'data-nav' links in the HTML content
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const navId = target.getAttribute("data-nav");
    if (navId) {
      e.preventDefault();
      onNavigate(navId);
    }
  };

  return (
    <div 
      className="flex gap-3 p-4 px-5 rounded-lg border border-l-4 border-l-primary/50 bg-muted/30 text-sm text-foreground leading-relaxed my-6"
      onClick={handleClick}
    >
      <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
    >
      {label} <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

function ParamTable({ rows }: { rows: { name: string; type: string; desc: string }[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{r.name}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{r.type}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({
  id,
  code,
  copy,
  copiedSnippet,
  label,
}: {
  id: string;
  code: string;
  copy: (text: string, id: string) => void;
  copiedSnippet: string | null;
  label?: string;
}) {
  return (
    <div className="relative group mb-6 rounded-lg overflow-hidden border border-border bg-muted/30">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <button
            onClick={() => copy(code, id)}
            className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedSnippet === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSnippet === id ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <div className="relative">
        <pre className={`text-sm font-mono text-foreground p-4 overflow-x-auto leading-relaxed`}>
          {code}
        </pre>
        {!label && (
           <button
             onClick={() => copy(code, id)}
             className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
           >
             {copiedSnippet === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
           </button>
        )}
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="space-y-4 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
            {i + 1}
          </span>
          <div className="pt-1">
            <h4 className="text-base font-semibold text-foreground mb-1">{step.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
