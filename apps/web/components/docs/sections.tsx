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
} from "lucide-react";

/* ── Section Router ─────────────────────────────────────── */

export type CP = {
  copy: (text: string, id: string) => void;
  copiedSnippet: string | null;
  onNavigate: (id: string) => void;
};

export function SectionContent(props: CP & { id: string }) {
  switch (props.id) {
    case "overview": return <OverviewSection {...props} />;
    case "concepts": return <ConceptsSection {...props} />;
    case "trigger-api": return <ApiTriggerSection {...props} />;
    case "human-task": return <HumanTaskSection {...props} />;
    case "wait-for-event": return <WaitForEventSection {...props} />;
    case "http-request": return <HttpRequestSection {...props} />;
    case "correlation": return <CorrelationSection {...props} />;
    case "set-variable": return <SetVariableSection {...props} />;
    case "condition": return <ConditionSection {...props} />;
    case "switch": return <SwitchSection {...props} />;
    case "loop": return <LoopSection {...props} />;
    case "filter": return <FilterSection {...props} />;
    case "map": return <MapSection {...props} />;
    case "expressions": return <ExpressionsSection {...props} />;
    default: return <OverviewSection {...props} />;
  }
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

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-muted-foreground leading-relaxed mb-4">{children}</p>;
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{children}</code>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 px-5 rounded-lg border border-l-4 border-l-primary/50 bg-muted/30 text-sm text-foreground leading-relaxed my-6">
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
        <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border">
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

/* ── SECTIONS ───────────────────────────────────────────── */

function OverviewSection({ onNavigate }: CP) {
  return (
    <>
      <SectionHeader
        icon={<BookOpen className="w-6 h-6" />}
        title="Overview"
        description="Nodal is an operational orchestration platform. It connects your people, systems, and processes into automated flows that run your business."
      />

      <div className="space-y-10">
        <div>
          <H3>What is Flow Studio?</H3>
          <Prose>
            Flow Studio is the visual designer where you build business process
            flows. Each flow is a sequence of steps — triggers that start the
            process, tasks assigned to people, data transformations, API calls to
            external systems, and decision logic that routes work based on
            conditions.
          </Prose>
        </div>

        <div>
          <H3>What are Action Flows?</H3>
          <Prose>
            Action Flows are <strong>running instances</strong> of a flow. When a
            flow is triggered — by an API call, a schedule, or a manual start — it
            creates an Action Flow that tracks the execution through each step.
            Team members see their assigned tasks in the Action Flows dashboard and
            complete them to advance the process.
          </Prose>
        </div>

        <div>
          <H3>How a flow runs</H3>
          <StepList
            steps={[
              {
                title: "Trigger fires",
                desc: "A flow starts when its trigger activates — an API call, a schedule, or a manual start.",
              },
              {
                title: "Steps execute in sequence",
                desc: "Each node runs in order. Data flows from one step to the next. Conditions and switches route the path.",
              },
              {
                title: "Pauses when needed",
                desc: "Human Tasks wait for a person to respond. Wait for Event nodes wait for an external webhook. The flow resumes automatically when the input arrives.",
              },
              {
                title: "Completes or fails",
                desc: "The flow reaches the end and completes, or an error occurs and it fails. All execution data is logged.",
              },
            ]}
          />
        </div>

        <div className="flex gap-4 flex-wrap pt-4 border-t border-border/40">
          <NavLink label="Learn about triggers" onClick={() => onNavigate("trigger-api")} />
          <NavLink label="Human Tasks" onClick={() => onNavigate("human-task")} />
          <NavLink label="Expression syntax" onClick={() => onNavigate("expressions")} />
        </div>
      </div>
    </>
  );
}

function ConceptsSection({ onNavigate }: CP) {
  const concepts = [
    { icon: <Play className="w-5 h-5 text-blue-500" />, title: "Nodes", desc: "The building blocks of a flow. Each node performs one action — triggering, transforming data, calling an API, assigning a task, or making a decision." },
    { icon: <ArrowRight className="w-5 h-5 text-gray-500" />, title: "Edges", desc: "Connections between nodes that define the execution order. Data flows along edges from one node to the next." },
    { icon: <Variable className="w-5 h-5 text-purple-500" />, title: "Expressions", desc: "Dynamic references to data from previous steps. Written as {{ steps.NodeId.output.field }} to pass data between nodes." },
    { icon: <Layers className="w-5 h-5 text-orange-500" />, title: "Action Flows", desc: "A running instance of a flow. Each trigger creates a new Action Flow that progresses through the steps until completion." },
    { icon: <User className="w-5 h-5 text-green-500" />, title: "Human-in-the-Loop", desc: "Flows can pause and wait for human input. Human Task nodes assign work to team members who complete it through the Action Flows dashboard." },
    { icon: <Webhook className="w-5 h-5 text-red-500" />, title: "Webhooks", desc: "External systems can resume paused flows by sending data to a unique webhook URL. No API keys or IDs required." },
  ];

  return (
    <>
      <SectionHeader
        icon={<Layers className="w-6 h-6" />}
        title="Core Concepts"
        description="Key ideas to understand before building flows."
      />
      <div className="grid md:grid-cols-2 gap-6">
        {concepts.map((c, i) => (
          <div key={i} className="flex gap-4 p-5 border border-border rounded-xl bg-card hover:bg-muted/20 transition-colors">
            <span className="mt-1">{c.icon}</span>
            <div>
              <p className="text-base font-semibold text-foreground mb-1">{c.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 flex-wrap mt-8 pt-6 border-t border-border/40">
        <NavLink label="Expression syntax" onClick={() => onNavigate("expressions")} />
      </div>
    </>
  );
}

function ApiTriggerSection({ copy, copiedSnippet, onNavigate }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Globe className="w-6 h-6" />}
        title="API Trigger"
        description="Start a flow via HTTP POST. Use this to integrate external systems, build automation pipelines, or create event-driven workflows."
      />
      <div className="space-y-8">
        <div>
          <H3>Endpoint</H3>
          <CodeBlock id="api-trigger-endpoint" label="HTTP" code={`POST https://enigmatic.works/api/flows/{flowId}/execute\nAuthorization: Bearer <your-jwt-token>\nContent-Type: application/json`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>
            The <InlineCode>flowId</InlineCode> is the unique identifier of the published flow.
            You can find it in the Flow Studio URL or the flow settings.
          </Prose>
        </div>
        <div>
          <H3>Request body</H3>
          <Prose>Send any JSON payload. The fields you send become available to all downstream steps via expressions.</Prose>
          <CodeBlock id="api-trigger-body" label="JSON" code={`{\n  "order_id": "ORD-12345",\n  "customer_name": "Acme Corp",\n  "total": 2499.00,\n  "priority": "high"\n}`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Configuration options</H3>
          <ParamTable rows={[
            { name: "schema", type: "SchemaField[]", desc: "Define expected payload fields with types and required flags." },
            { name: "instanceNameTemplate", type: "string", desc: "Dynamic title for the Action Flow instance. Supports expressions." },
            { name: "defaultPriority", type: "enum", desc: "Priority level: low, medium, high, or critical." },
            { name: "instanceDescriptionTemplate", type: "string", desc: "Instructions displayed to users in the Action Flow dashboard." },
          ]} />
        </div>
        <div>
          <H3>Accessing trigger data</H3>
          <CodeBlock id="api-trigger-access" code={`{{ steps.trigger.data.order_id }}     // "ORD-12345"\n{{ steps.trigger.data.customer_name }} // "Acme Corp"\n{{ steps.trigger.data.total }}         // 2499.00`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Example: cURL</H3>
          <CodeBlock id="api-trigger-curl" label="Bash" code={`curl -X POST https://enigmatic.works/api/flows/YOUR_FLOW_ID/execute \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "order_id": "ORD-12345",\n    "customer_name": "Acme Corp"\n  }'`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <Callout>
          The API Trigger requires authentication. The JWT token comes from Supabase Auth.
          For unauthenticated external webhooks, use the <button onClick={() => onNavigate("wait-for-event")} className="underline underline-offset-2 hover:text-primary">Wait for Event</button> node instead.
        </Callout>
      </div>
    </>
  );
}

function HumanTaskSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<User className="w-6 h-6" />}
        title="Human Task"
        description="Pause the flow and assign work to a person. The flow resumes when the assignee completes the task through the Action Flows dashboard."
      />
      <div className="space-y-8">
        <div>
          <H3>How it works</H3>
          <StepList steps={[
            { title: "Flow reaches the Human Task node", desc: "The flow pauses and creates a task record. The task appears in the assignee's Action Flows dashboard." },
            { title: "Assignee reviews and responds", desc: "The assignee sees the task title, instructions, and a form to fill out. They can review context from previous steps." },
            { title: "Flow resumes with the response", desc: "When the assignee submits their response, the flow continues. The form data is available to downstream steps." },
          ]} />
        </div>
        <div>
          <H3>Configuration</H3>
          <ParamTable rows={[
            { name: "title", type: "string", desc: "Task title shown to the assignee. Supports expressions for dynamic titles." },
            { name: "instructions", type: "rich text", desc: "Detailed instructions in HTML. Explain what the assignee needs to do." },
            { name: "assignments", type: "User[]", desc: "One or more team members who will see and can complete the task." },
            { name: "schema", type: "FormField[]", desc: "Form fields the assignee must fill out (text, number, date, rating, signature, etc.)." },
          ]} />
        </div>
        <div>
          <H3>Form field types</H3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {["Text", "Long Text", "Number", "Rating", "Boolean", "Date", "Time", "DateTime", "File", "Multiple Choice", "Checkboxes", "Signature"].map((t) => (
              <div key={t} className="px-3 py-2 border border-border rounded-md text-xs font-medium text-muted-foreground text-center bg-muted/20">{t}</div>
            ))}
          </div>
        </div>
        <div>
          <H3>Dynamic titles with expressions</H3>
          <Prose>Use expressions to create context-aware task titles:</Prose>
          <CodeBlock id="ht-title" code={`Review order {{ steps.trigger.data.order_id }} for {{ steps.trigger.data.customer_name }}`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>This produces titles like <strong>&ldquo;Review order ORD-12345 for Acme Corp&rdquo;</strong>.</Prose>
        </div>
        <div>
          <H3>Accessing task responses</H3>
          <CodeBlock id="ht-output" code={`// The assignee's form responses are available as:\n{{ steps.ReviewTask.output.approval }}    // "approved"\n{{ steps.ReviewTask.output.comments }}    // "Looks good"\n{{ steps.ReviewTask.output.rating }}      // 5`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <Callout>
          Human Tasks are the core of human-in-the-loop automation. Use them for
          approvals, quality checks, data entry, document review, or any step that
          requires human judgment.
        </Callout>
      </div>
    </>
  );
}

function WaitForEventSection({ copy, copiedSnippet, onNavigate }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Webhook className="w-6 h-6" />}
        title="Wait for Event"
        description="Pause the flow and wait for an external system to send data via a unique webhook URL. No authentication, IDs, or complex payloads required."
      />
      <div className="space-y-8">
        <div>
          <H3>How it works</H3>
          <StepList steps={[
            { title: "Flow reaches the Wait for Event node", desc: "The flow pauses and generates a unique, single-use webhook URL." },
            { title: "Webhook URL is sent to the external system", desc: "Use an upstream HTTP Request or Email node to pass the webhook URL to the external system." },
            { title: "External system POSTs data", desc: "The external system sends a POST request with JSON data to the webhook URL." },
            { title: "Flow resumes", desc: "The flow continues with the received data available to all downstream steps." },
          ]} />
        </div>
        <div>
          <H3>Endpoint</H3>
          <CodeBlock id="wfe-endpoint" label="HTTP" code={`POST https://enigmatic.works/api/webhooks/{token}`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>
            The <InlineCode>{"{token}"}</InlineCode> is a unique UUID generated for each flow execution.
            No authentication headers are required — the token itself authenticates the request. Each URL is single-use.
          </Prose>
        </div>
        <div>
          <H3>Request format</H3>
          <Prose>Send any JSON body. The entire payload becomes available to downstream steps.</Prose>
          <CodeBlock id="wfe-payload" label="JSON" code={`{\n  "payment_status": "confirmed",\n  "amount": 149.99,\n  "transaction_id": "txn_abc123"\n}`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Response</H3>
          <CodeBlock id="wfe-response" label="Response 200" code={`{\n  "status": "ok",\n  "message": "Workflow resumed successfully"\n}`} copy={copy} copiedSnippet={copiedSnippet} />
          <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
            <p><InlineCode>200</InlineCode> — Flow resumed successfully.</p>
            <p><InlineCode>404</InlineCode> — Token not found or already used.</p>
            <p><InlineCode>500</InlineCode> — Internal error.</p>
          </div>
        </div>
        <div>
          <H3>Example: cURL</H3>
          <CodeBlock id="wfe-curl" label="Bash" code={`curl -X POST https://enigmatic.works/api/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_status": "confirmed",\n    "amount": 149.99\n  }'`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Accessing the webhook URL in your flow</H3>
          <Prose>When the node pauses, it outputs the unique webhook URL. Reference it in upstream steps to pass it to the external system:</Prose>
          <CodeBlock id="wfe-var" code={`{{ steps.WaitForPayment.output.webhook_url }}`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>
            Replace <InlineCode>WaitForPayment</InlineCode> with the node ID in your flow.
            Use this in an HTTP Request node (to register a callback) or an Email node (to send instructions).
          </Prose>
        </div>
        <Callout>
          For advanced use cases where multiple flows listen for the same event type, see{" "}
          <button onClick={() => onNavigate("correlation")} className="underline underline-offset-2 hover:text-primary">Correlation Signals</button>.
        </Callout>
      </div>
    </>
  );
}

function HttpRequestSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Send className="w-6 h-6" />}
        title="HTTP Request"
        description="Make HTTP requests to external APIs. Call third-party services, fetch data, or send notifications as part of your flow."
      />
      <div className="space-y-8">
        <div>
          <H3>Configuration</H3>
          <ParamTable rows={[
            { name: "method", type: "enum", desc: "HTTP method: GET, POST, PUT, DELETE, or PATCH." },
            { name: "url", type: "string", desc: "The endpoint URL. Supports expressions for dynamic URLs." },
            { name: "headers", type: "KeyValue[]", desc: "Custom HTTP headers (e.g., Authorization, API keys)." },
            { name: "params", type: "KeyValue[]", desc: "URL query parameters." },
            { name: "body", type: "JSON", desc: "Request body for POST/PUT/PATCH. Supports expressions." },
          ]} />
        </div>
        <div>
          <H3>Example: Call an external API</H3>
          <CodeBlock id="http-example" label="Configuration" code={`Method:  POST\nURL:     https://api.example.com/orders/{{ steps.trigger.data.order_id }}\nHeaders: Authorization: Bearer {{ steps.GetToken.output.token }}\nBody:    {\n           "status": "confirmed",\n           "amount": {{ steps.trigger.data.total }}\n         }`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Output</H3>
          <Prose>The response is parsed automatically and available to downstream steps:</Prose>
          <CodeBlock id="http-output" code={`{{ steps.CallAPI.output.status }}       // 200\n{{ steps.CallAPI.output.data }}         // Parsed JSON response body\n{{ steps.CallAPI.output.data.result }}  // Nested field access`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <Callout>
          HTTP Request nodes have a 10-second timeout. For long-running external operations, use Wait for Event with a callback pattern instead.
        </Callout>
      </div>
    </>
  );
}

function CorrelationSection({ copy, copiedSnippet, onNavigate }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Globe className="w-6 h-6" />}
        title="Correlation Signals"
        description="For advanced use cases where multiple flow instances listen for the same event type. Use correlation matching to target the correct instance."
      />
      <div className="space-y-8">
        <div>
          <H3>When to use</H3>
          <ul className="space-y-2 text-base text-muted-foreground list-disc pl-5 mb-4">
            <li>Multiple flow instances waiting for the same event type (e.g., &ldquo;OrderPaid&rdquo;)</li>
            <li>The external system broadcasts events without knowing which flow to target</li>
            <li>You need to match on business keys (e.g., order_id, customer_id)</li>
          </ul>
          <Callout>
            For most integrations, the <button onClick={() => onNavigate("wait-for-event")} className="underline underline-offset-2 hover:text-primary">webhook URL approach</button> is simpler and recommended. Use correlation only when the external system can&apos;t call a specific URL.
          </Callout>
        </div>
        <div>
          <H3>Endpoint</H3>
          <CodeBlock id="sig-endpoint" label="HTTP" code={`POST https://enigmatic.works/api/automation/signal\nAuthorization: Bearer <your-jwt-token>\nContent-Type: application/json`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>This endpoint requires authentication with a valid JWT token.</Prose>
        </div>
        <div>
          <H3>Request format</H3>
          <CodeBlock id="sig-payload" label="JSON" code={`{\n  "event": "OrderPaid",\n  "data": {\n    "order_id": "ORD-12345",\n    "customer_id": "CUST-789"\n  }\n}`} copy={copy} copiedSnippet={copiedSnippet} />
          <ParamTable rows={[
            { name: "event", type: "string", desc: "The event name configured in the Wait for Event node. Defaults to \"default\"." },
            { name: "data", type: "object", desc: "Key-value pairs matched against the flow's correlation criteria. All criteria must match (AND logic)." },
          ]} />
        </div>
        <div>
          <H3>Matching logic</H3>
          <StepList steps={[
            { title: "Find active subscriptions", desc: "The system finds all active subscriptions matching the event name." },
            { title: "Check criteria", desc: "For each subscription, every configured criteria key must exist in the signal data with the same value." },
            { title: "Resume matches", desc: "All matching flows are resumed. One signal can resume multiple flow instances." },
          ]} />
        </div>
        <div>
          <H3>Response</H3>
          <CodeBlock id="sig-response" label="Response 200" code={`{\n  "status": "ok",\n  "resumed": 1\n}`} copy={copy} copiedSnippet={copiedSnippet} />
          <Prose>
            The <InlineCode>resumed</InlineCode> field indicates how many flow instances were matched and resumed.
          </Prose>
        </div>
      </div>
    </>
  );
}

function SetVariableSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Variable className="w-6 h-6" />}
        title="Set Variable"
        description="Create or update variables within the flow. Store computed values, rename fields, or prepare data for downstream steps."
      />
      <div className="space-y-8">
        <div>
          <H3>Single variable</H3>
          <Prose>Set one variable with a name and value. The value can be static or an expression.</Prose>
          <CodeBlock id="var-single" label="Configuration" code={`Variable Name:  total_with_tax\nValue:          {{ steps.trigger.data.total * 1.13 }}`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Multiple variables</H3>
          <Prose>Set several variables at once in a single node:</Prose>
          <CodeBlock id="var-multi" label="Configuration" code={`customer_name  →  {{ steps.trigger.data.name }}\norder_total    →  {{ steps.trigger.data.total }}\nstatus         →  "pending_review"`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Output</H3>
          <Prose>Variables are available to all downstream steps:</Prose>
          <CodeBlock id="var-output" code={`{{ steps.SetVars.output.total_with_tax }}  // 2823.87\n{{ steps.SetVars.output.customer_name }}   // "Acme Corp"`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
      </div>
    </>
  );
}

function ConditionSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<GitBranch className="w-6 h-6" />}
        title="Condition (If/Else)"
        description="Branch the flow based on a logical condition. Route work down the True path or the False path."
      />
      <div className="space-y-8">
        <div>
          <H3>Configuration</H3>
          <Prose>Define a condition with a left value, an operator, and a right value. All values support expressions.</Prose>
          <CodeBlock id="cond-example" label="Example" code={`Left:      {{ steps.trigger.data.amount }}\nOperator:  >\nRight:     1000`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Operators</H3>
          <ParamTable rows={[
            { name: "==", type: "equals", desc: "Values are equal (strings or numbers)." },
            { name: "!=", type: "not equals", desc: "Values are not equal." },
            { name: ">", type: "greater than", desc: "Left is greater than right (numeric)." },
            { name: "<", type: "less than", desc: "Left is less than right (numeric)." },
            { name: ">=", type: "greater or equal", desc: "Left is greater than or equal to right." },
            { name: "<=", type: "less or equal", desc: "Left is less than or equal to right." },
            { name: "contains", type: "substring", desc: "Left string contains right string." },
            { name: "matches", type: "regex", desc: "Left string matches the right regex pattern." },
          ]} />
        </div>
        <div>
          <H3>Branching</H3>
          <Prose>
            The Condition node has two output paths: <strong>True</strong> and <strong>False</strong>.
            Connect different nodes to each path to create branching logic. The result is also available as output:
          </Prose>
          <CodeBlock id="cond-output" code={`{{ steps.CheckAmount.output.result }}  // true or false`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
      </div>
    </>
  );
}

function SwitchSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<GitBranch className="w-6 h-6" />}
        title="Switch"
        description="Route the flow to different paths based on a variable's value. Like a multi-way if/else — cleaner when you have more than two branches."
      />
      <div className="space-y-8">
        <div>
          <H3>Configuration</H3>
          <Prose>Set the variable to evaluate, then define case values for each branch:</Prose>
          <CodeBlock id="switch-example" label="Example" code={`Variable:  {{ steps.trigger.data.department }}\n\nCase "engineering"  →  Engineering Review path\nCase "finance"      →  Finance Approval path\nCase "legal"        →  Legal Review path\nDefault             →  General Processing path`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Behavior</H3>
          <ul className="space-y-2 text-base text-muted-foreground list-disc pl-5 mb-4">
            <li>The variable is compared against each case value in order.</li>
            <li>The first matching case path is followed.</li>
            <li>If no cases match, the <strong>Default</strong> path is followed.</li>
            <li>Each case creates a separate output edge in the flow designer.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function LoopSection({ copy, copiedSnippet }: CP) {
  return (
    <>
      <SectionHeader
        icon={<Repeat className="w-6 h-6" />}
        title="Loop"
        description="Iterate over an array of items and run a set of steps for each one. Process lists of orders, users, records, or any collection."
      />
      <div className="space-y-8">
        <div>
          <H3>Configuration</H3>
          <Prose>Point the loop at an array variable:</Prose>
          <CodeBlock id="loop-config" label="Configuration" code={`Items:  {{ steps.FetchOrders.output.data }}`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <div>
          <H3>Inside the loop</H3>
          <Prose>Access the current item using the <InlineCode>item</InlineCode> variable:</Prose>
          <CodeBlock id="loop-item" code={`{{ steps.MyLoop.item }}           // The current item object\n{{ steps.MyLoop.item.order_id }}  // A field on the current item\n{{ steps.MyLoop.item.total }}     // Another field`} copy={copy} copiedSnippet={copiedSnippet} />
        </div>
        <Callout>
          Nodes placed inside the loop body run once per item in the array. This is useful for sending
          individual notifications, processing records, or calling APIs for each item.
        </Callout>
      </div>
    </>
  );
}

function FilterSection({ copy, copiedSnippet }: CP) {
    return (
        <>
            <SectionHeader title="Filter" icon={<Layers className="w-6 h-6" />} description="Filter an array based on conditions, creating a new array with only matching items." />
            <Prose>Filters are essential for processing subsets of data, like selecting only active users or high-value orders.</Prose>
             <CodeBlock id="filter-example" label="Example" code={`Items: {{ steps.GetUsers.output.data }}\nCondition: item.status == "active"`} copy={copy} copiedSnippet={copiedSnippet} />
        </>
    );
}
function MapSection({ copy, copiedSnippet }: CP) {
    return (
        <>
            <SectionHeader title="Map (Transform)" icon={<Variable className="w-6 h-6" />} description="Transform each item in an array to a new structure." />
             <Prose>Use Map to reshape data before sending it to an API or another system.</Prose>
             <CodeBlock id="map-example" label="Example" code={`Items: {{ steps.GetUsers.output.data }}\nTransform: { "id": item.id, "fullName": item.first + " " + item.last }`} copy={copy} copiedSnippet={copiedSnippet} />
        </>
    );
}

function ExpressionsSection({ copy, copiedSnippet }: CP) {
    return (
        <>
            <SectionHeader title="Expression Syntax" icon={<Variable className="w-6 h-6" />} description="Learn how to write dynamic expressions to access data and perform calculations." />
            <div className="space-y-8">
                <div>
                    <H3>Basics</H3>
                    <Prose>Expressions are wrapped in double curly braces <InlineCode>{"{{ }}"}</InlineCode>. They support JavaScript-like syntax for accessing object properties and array elements.</Prose>
                    <CodeBlock id="expr-basic" code={`{{ steps.trigger.data.id }}\n{{ steps.MyStep.output.result }}\n{{ steps.MyStep.output.items[0] }}`} copy={copy} copiedSnippet={copiedSnippet} />
                </div>
            </div>
        </>
    )
}
