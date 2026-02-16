"use client";

import { useState, useCallback } from "react";
import { DocsLayout } from "@/components/docs/docs-layout";
import { SectionContent, CP } from "@/components/docs/sections";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }, []);

  const navigate = (id: string) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const cp: CP = { copy, copiedSnippet, onNavigate: navigate };

  return (
    <DocsLayout activeSection={activeSection} onNavigate={navigate}>
      <SectionContent id={activeSection} {...cp} />
    </DocsLayout>
  );
}
