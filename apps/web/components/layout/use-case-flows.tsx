"use client";

import { useEffect, useRef } from "react";
import ReactFlow, { Background, MarkerType, type Edge, type Node, type ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Calendar,
  CheckCircle2,
  Database,
  FileCheck2,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  Truck,
  Upload,
  User,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "@/lib/tones";
import { FlowBlockNode, type FlowBlockData } from "@/components/ui/flow-nodes";

// Tone carries meaning across every diagram:
// blue = system / data, violet = automated or AI, pink = human, success = done,
// warning = alert, neutral = field input.

const nodeTypes = { flowBlock: FlowBlockNode };

const NODE_WIDTH = 280;
// Column x positions: a centered spine with a left and right branch.
const LEFT = 0;
const CENTER = 150;
const RIGHT = 300;

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { stroke: "var(--subtle)", strokeWidth: 1.25, opacity: 0.7 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "var(--subtle)" },
};

function block(id: string, x: number, y: number, label: string, subLabel: string, icon: LucideIcon, badge: string, tone: Tone): Node<FlowBlockData> {
  return { id, type: "flowBlock", position: { x, y }, style: { width: NODE_WIDTH }, data: { label, subLabel, icon, badge, tone } };
}

function edges(pairs: [string, string][]): Edge[] {
  return pairs.map(([source, target]) => ({ id: `e-${source}-${target}`, source, target }));
}

const fitViewOptions = { padding: 0.12 };

/** Static, non-interactive ReactFlow canvas. Refits when its frame changes size. */
function FlowCanvas({ nodes, links }: { nodes: Node<FlowBlockData>[]; links: Edge[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const instance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!frame.current) return;
    const observer = new ResizeObserver(() => instance.current?.fitView(fitViewOptions));
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="h-full w-full">
      <ReactFlow
        onInit={flow => { instance.current = flow; }}
        nodes={nodes}
        edges={links}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={fitViewOptions}
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        minZoom={0.4}
        maxZoom={1}
      >
        <Background color="var(--border-strong)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}

export const EmployeeOnboardingFlow = () => (
  <FlowCanvas
    nodes={[
      block("o1", CENTER, 0, "Application received", "HR system", Webhook, "Source", "blue"),
      block("o2", CENTER, 130, "Documents collected", "Candidate portal", Upload, "Portal", "blue"),
      block("o3", CENTER, 260, "AI credential check", "Licenses & certifications", FileCheck2, "AI", "violet"),
      block("o4", LEFT, 400, "Orientation scheduled", "HR team", Calendar, "Human", "pink"),
      block("o5", RIGHT, 400, "Systems access", "Email, records, payroll", KeyRound, "Assisted", "blue"),
      block("o6", CENTER, 540, "Ready to start", "Day one confirmed", CheckCircle2, "Complete", "success"),
    ]}
    links={edges([["o1", "o2"], ["o2", "o3"], ["o3", "o4"], ["o3", "o5"], ["o4", "o6"], ["o5", "o6"]])}
  />
);

export const CustomerServiceFlow = () => (
  <FlowCanvas
    nodes={[
      block("c1", CENTER, 0, "Customer email received", "Shared inbox", Mail, "Source", "blue"),
      block("c2", CENTER, 130, "AI reads & classifies", "Orders, returns, quotes", Sparkles, "AI", "violet"),
      block("c3", LEFT, 270, "Routine: reply sent", "Includes order status", Send, "Automated", "violet"),
      block("c4", RIGHT, 270, "Complex: to a specialist", "Context & draft attached", User, "Human", "pink"),
      block("c5", CENTER, 410, "CRM updated", "Full history logged", Database, "Complete", "success"),
    ]}
    links={edges([["c1", "c2"], ["c2", "c3"], ["c2", "c4"], ["c3", "c5"], ["c4", "c5"]])}
  />
);

export const AssetMaintenanceFlow = () => (
  <FlowCanvas
    nodes={[
      block("m1", 0, 0, "Inspection submitted", "Technician app", Truck, "Mobile", "neutral"),
      block("m2", 0, 130, "Defect detected: brakes", "Rule-based alert", AlertTriangle, "Alert", "warning"),
      block("m3", 0, 260, "Work order created", "AI suggests parts & labor", Wrench, "AI", "violet"),
      block("m4", 0, 390, "Fleet status updated", "ERP & fleet systems", Database, "Sync", "success"),
    ]}
    links={edges([["m1", "m2"], ["m2", "m3"], ["m3", "m4"]])}
  />
);

export const OperationsIntelligenceFlow = () => (
  <FlowCanvas
    nodes={[
      block("d1", LEFT, 0, "ERP & finance", "Orders, invoices, costs", Database, "Source", "blue"),
      block("d2", RIGHT, 0, "Operations systems", "Jobs, schedules, assets", Boxes, "Source", "blue"),
      block("d3", CENTER, 140, "Ingest & validate", "Scheduled pipelines", RefreshCw, "Automated", "violet"),
      block("d4", CENTER, 280, "Unified data model", "One source of truth", Database, "Model", "blue"),
      block("d5", LEFT, 420, "Executive dashboard", "Live KPIs by location", BarChart3, "Live", "success"),
      block("d6", RIGHT, 420, "AI weekly briefing", "Trends & anomalies", Sparkles, "AI", "violet"),
    ]}
    links={edges([["d1", "d3"], ["d2", "d3"], ["d3", "d4"], ["d4", "d5"], ["d4", "d6"]])}
  />
);
