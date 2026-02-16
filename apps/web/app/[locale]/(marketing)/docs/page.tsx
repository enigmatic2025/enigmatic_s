"use client";

import { useState } from "react";
import {
  Webhook,
  BookOpen,
  Code,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const sections = [
  { id: "webhooks", label: "Webhooks (Wait for Event)" },
  { id: "correlation", label: "Advanced: Correlation Signals" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("webhooks");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Documentation
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
            Nodal API Reference
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Learn how to integrate external systems with Nodal&apos;s Flow Studio.
            Trigger workflows, send data via webhooks, and build automation
            pipelines.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <nav className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Guides
            </p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === s.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    activeSection === s.id ? "rotate-90" : ""
                  }`}
                />
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {activeSection === "webhooks" && <WebhooksSection copy={copy} copiedSnippet={copiedSnippet} />}
          {activeSection === "correlation" && <CorrelationSection copy={copy} copiedSnippet={copiedSnippet} />}
        </main>
      </div>
    </div>
  );
}

/* ── Webhooks Section ─────────────────────────────────── */

function WebhooksSection({ copy, copiedSnippet }: { copy: (text: string, id: string) => void; copiedSnippet: string | null }) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <Webhook className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">
            Webhooks (Wait for Event)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong>Wait for Event</strong> node pauses a running flow until an external system
          sends data to a unique webhook URL. This is the recommended way to integrate external
          systems — no IDs, tokens, or complex payloads required.
        </p>
      </div>

      {/* How it works */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">How It Works</h3>
        <div className="grid gap-4">
          {[
            {
              icon: <Zap className="w-4 h-4" />,
              title: "1. Flow reaches Wait for Event",
              desc: "When a running flow hits a Wait for Event node, it pauses and generates a unique webhook URL.",
            },
            {
              icon: <Globe className="w-4 h-4" />,
              title: "2. Send the URL to the external system",
              desc: "Use an upstream HTTP Request or Email node to pass the webhook URL to the system that will trigger the resume.",
            },
            {
              icon: <Code className="w-4 h-4" />,
              title: "3. External system POSTs data",
              desc: "The external system sends a POST request with JSON data to the webhook URL. The flow resumes with that data.",
            },
            {
              icon: <Shield className="w-4 h-4" />,
              title: "4. One-time use",
              desc: "Each webhook URL is single-use. Once triggered, it is marked as completed and cannot be reused.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border border-border rounded-lg bg-card/50"
            >
              <div className="mt-0.5 text-primary">{step.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endpoint</h3>
        <CodeBlock
          id="webhook-endpoint"
          language="http"
          code={`POST /api/webhooks/{token}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <p className="text-xs text-muted-foreground">
          The <code className="font-mono bg-muted px-1 rounded text-foreground">{'{token}'}</code> is
          a unique UUID generated for each flow execution. No authentication headers are required — the
          token itself authenticates the request.
        </p>
      </div>

      {/* Request format */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Request Format</h3>
        <p className="text-sm text-muted-foreground">
          Send a JSON body with the data you want to pass into the flow. The entire body
          becomes available to downstream steps.
        </p>
        <CodeBlock
          id="webhook-payload"
          language="json"
          code={`{
  "payment_status": "confirmed",
  "amount": 149.99,
  "transaction_id": "txn_abc123"
}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
      </div>

      {/* Response */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Response</h3>
        <CodeBlock
          id="webhook-response"
          language="json"
          code={`{
  "status": "ok",
  "message": "Workflow resumed successfully"
}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <div className="space-y-2 text-xs text-muted-foreground">
          <p><code className="font-mono bg-muted px-1 rounded text-foreground">200</code> — Flow resumed successfully.</p>
          <p><code className="font-mono bg-muted px-1 rounded text-foreground">404</code> — Token not found or already used.</p>
          <p><code className="font-mono bg-muted px-1 rounded text-foreground">500</code> — Internal error signaling the workflow.</p>
        </div>
      </div>

      {/* cURL example */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Example: cURL</h3>
        <CodeBlock
          id="webhook-curl"
          language="bash"
          code={`curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_status": "confirmed",
    "amount": 149.99
  }'`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
      </div>

      {/* Accessing the URL */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Accessing the Webhook URL in Your Flow</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When the Wait for Event node pauses, it outputs the unique webhook URL. Reference it
          in downstream steps using the variable syntax:
        </p>
        <CodeBlock
          id="webhook-var"
          language="text"
          code={`{{ steps.WaitForPayment.output.webhook_url }}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <p className="text-xs text-muted-foreground">
          Replace <code className="font-mono bg-muted px-1 rounded text-foreground">WaitForPayment</code> with
          the actual node ID in your flow. Use this in an HTTP Request node (to register a callback) or
          an Email node (to send instructions to a partner).
        </p>
      </div>
    </div>
  );
}

/* ── Correlation Section ──────────────────────────────── */

function CorrelationSection({ copy, copiedSnippet }: { copy: (text: string, id: string) => void; copiedSnippet: string | null }) {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">
            Advanced: Correlation Signals
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For advanced use cases where multiple flow instances listen for the same event type,
          use <strong>correlation matching</strong> to target the correct instance. This is
          useful for broadcast-style integrations where the external system doesn&apos;t have a
          specific webhook URL.
        </p>
      </div>

      {/* When to use */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">When to Use This</h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Multiple flow instances waiting for the same event type (e.g., &ldquo;OrderPaid&rdquo;)</li>
          <li>The external system broadcasts events without knowing which flow to target</li>
          <li>You need to match on business keys (e.g., order_id, customer_id)</li>
        </ul>
        <p className="text-xs text-muted-foreground italic">
          For most integrations, the <strong>webhook URL approach</strong> is simpler and recommended.
        </p>
      </div>

      {/* Endpoint */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endpoint</h3>
        <CodeBlock
          id="signal-endpoint"
          language="http"
          code={`POST /api/automation/signal
Authorization: Bearer <your-jwt-token>`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <p className="text-xs text-muted-foreground">
          This endpoint requires authentication. Use a valid JWT token from Supabase Auth.
        </p>
      </div>

      {/* Request format */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Request Format</h3>
        <CodeBlock
          id="signal-payload"
          language="json"
          code={`{
  "event": "OrderPaid",
  "data": {
    "order_id": "ORD-12345",
    "customer_id": "CUST-789"
  }
}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            <code className="font-mono bg-muted px-1 rounded text-foreground">event</code> — The event
            name configured in the Wait for Event node. Defaults to <code className="font-mono bg-muted px-1 rounded text-foreground">&quot;default&quot;</code>.
          </p>
          <p>
            <code className="font-mono bg-muted px-1 rounded text-foreground">data</code> — Key-value
            pairs that are matched against the flow&apos;s correlation criteria. <strong>All</strong>{" "}
            configured criteria must match (AND logic).
          </p>
        </div>
      </div>

      {/* Matching logic */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Matching Logic</h3>
        <div className="p-4 border border-border rounded-lg bg-card/50 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When a signal arrives, the system:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1.5">
            <li>Finds all active subscriptions with the matching <code className="font-mono bg-muted px-1 rounded text-foreground">event</code> name</li>
            <li>For each subscription, checks that <strong>every</strong> criteria key exists in the signal&apos;s <code className="font-mono bg-muted px-1 rounded text-foreground">data</code> with the same value</li>
            <li>All matching flows are resumed (one signal can resume multiple flows)</li>
          </ol>
        </div>
      </div>

      {/* Response */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Response</h3>
        <CodeBlock
          id="signal-response"
          language="json"
          code={`{
  "status": "ok",
  "resumed": 1
}`}
          copy={copy}
          copiedSnippet={copiedSnippet}
        />
        <p className="text-xs text-muted-foreground">
          The <code className="font-mono bg-muted px-1 rounded text-foreground">resumed</code> field
          indicates how many flow instances were matched and resumed.
        </p>
      </div>
    </div>
  );
}

/* ── Code Block Component ─────────────────────────────── */

function CodeBlock({
  id,
  code,
  copy,
  copiedSnippet,
}: {
  id: string;
  language?: string;
  code: string;
  copy: (text: string, id: string) => void;
  copiedSnippet: string | null;
}) {
  return (
    <div className="relative group">
      <pre className="text-[12px] font-mono bg-zinc-950 dark:bg-zinc-900 text-zinc-100 rounded-lg px-4 py-3.5 overflow-x-auto leading-relaxed border border-zinc-800">
        {code}
      </pre>
      <button
        onClick={() => copy(code, id)}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all"
      >
        {copiedSnippet === id ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
