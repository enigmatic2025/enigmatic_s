"use client";

import { useEffect, useRef } from "react";
import ReactFlow, { Background, MarkerType, type Edge, type Node, type ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Database,
  FileCheck2,
  Radio,
  RefreshCw,
  Truck,
  User,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "@/lib/tones";
import { FlowBlockNode, type FlowBlockData } from "@/components/ui/flow-nodes";

// Tone carries meaning across every diagram:
// blue = system / data, violet = automated, pink = human, success = done,
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

export const DriverOnboardingFlow = () => (
  <FlowCanvas
    nodes={[
      block("1", CENTER, 0, "Application received", "Tenstreet webhook", Webhook, "API", "blue"),
      block("2", CENTER, 130, "Documents review", "Recruiting team", User, "Human", "pink"),
      block("3", CENTER, 260, "Document validation", "Contract & safety rules", FileCheck2, "Automated", "violet"),
      block("4", LEFT, 400, "Orientation scheduled", "Operations", Calendar, "Human", "pink"),
      block("5", RIGHT, 400, "Systems provisioning", "TMS, HR, payroll", Database, "Assisted", "blue"),
      block("6", CENTER, 540, "Ready for dispatch", "Status: active", Truck, "Complete", "success"),
    ]}
    links={edges([["1", "2"], ["2", "3"], ["3", "4"], ["3", "5"], ["4", "6"], ["5", "6"]])}
  />
);

export const AssetMaintenanceFlow = () => (
  <FlowCanvas
    nodes={[
      block("m1", 0, 0, "Inspection submitted", "Technician DVIR", Truck, "Mobile", "neutral"),
      block("m2", 0, 130, "Defect detected: brakes", "Rule-based alert", AlertTriangle, "Alert", "warning"),
      block("m3", 0, 260, "Work order created", "Parts & labor suggested", Wrench, "Automated", "violet"),
      block("m4", 0, 390, "Fleet status updated", "ERP & TMS", Database, "Sync", "success"),
    ]}
    links={edges([["m1", "m2"], ["m2", "m3"], ["m3", "m4"]])}
  />
);

export const OperationsReportingFlow = () => (
  <FlowCanvas
    nodes={[
      block("d1", LEFT, 0, "TMS & dispatch", "Loads, stops, rates", Database, "Source", "blue"),
      block("d2", RIGHT, 0, "Telematics & ELD", "Location, hours, fuel", Radio, "Source", "blue"),
      block("d3", CENTER, 140, "Ingest & validate", "Scheduled pipelines", RefreshCw, "Automated", "violet"),
      block("d4", CENTER, 280, "Operations data model", "Supabase · Postgres", Database, "Model", "blue"),
      block("d5", LEFT, 420, "KPI dashboard", "On-time, cost per mile", BarChart3, "Live", "success"),
      block("d6", RIGHT, 420, "Exception alerts", "Detention, late loads", AlertTriangle, "Alert", "warning"),
    ]}
    links={edges([["d1", "d3"], ["d2", "d3"], ["d3", "d4"], ["d4", "d5"], ["d4", "d6"]])}
  />
);
