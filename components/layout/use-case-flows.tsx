"use client";

import React from "react";
import ReactFlow, {
  Background,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Truck,
  Wrench,
  Database,
  AlertTriangle,
  Webhook,
  Bot,
  User,
  Calendar,
} from "lucide-react";
import { FlowBlockNode, ConditionNode } from "@/components/ui/flow-nodes";

const nodeTypes = {
  flowBlock: FlowBlockNode,
  condition: ConditionNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5, opacity: 0.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--muted-foreground)",
  },
};

// --- Wrapper Component ---
const FlowWrapper = ({
  initialNodes,
  initialEdges,
  fitView = false,
  minZoom = 0.5,
  defaultViewport = { x: 0, y: 0, zoom: 0.8 },
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  fitView?: boolean;
  minZoom?: number;
  defaultViewport?: { x: number; y: number; zoom: number };
}) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={fitView}
        defaultViewport={defaultViewport}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        minZoom={minZoom}
      >
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

// --- Driver Onboarding Flow ---
// Layout: Vertical flow with parallel branches
const onboardingNodes: Node[] = [
  // 1. Application received
  {
    id: "1",
    type: "flowBlock",
    position: { x: 130, y: 0 },
    style: { width: 240 },
    data: {
      label: "Application Received",
      subLabel: "Tenstreet Webhook",
      icon: Webhook,
      badge: "API",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900",
    },
  },
  // 2. Documents collected
  {
    id: "2",
    type: "flowBlock",
    position: { x: 130, y: 140 },
    style: { width: 240 },
    data: {
      label: "Documents Review",
      subLabel: "Stacy (Recruiting)",
      icon: User,
      badge: "Human",
      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900",
    },
  },
  // 3. Background checks approved
  {
    id: "3",
    type: "flowBlock",
    position: { x: 130, y: 280 },
    style: { width: 240 },
    data: {
      label: "Background Checks",
      subLabel: "Natalie AI Agent",
      icon: Bot,
      badge: "Automated",
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900",
    },
  },
  // 4. Orientation scheduled (Left Branch)
  {
    id: "4",
    type: "flowBlock",
    position: { x: 0, y: 440 },
    style: { width: 240 },
    data: {
      label: "Orientation Scheduled",
      subLabel: "John (Ops)",
      icon: Calendar,
      badge: "Human",
      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900",
    },
  },
  // 5. Driver added to TMS and HR systems (Right Branch)
  {
    id: "5",
    type: "flowBlock",
    position: { x: 260, y: 440 },
    style: { width: 240 },
    data: {
      label: "Systems Provisioning",
      subLabel: "TMS, HR, Payroll",
      icon: Database,
      badge: "Automated",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900",
    },
  },
  // 6. Driver ready for dispatch (Merge)
  {
    id: "6",
    type: "flowBlock",
    position: { x: 130, y: 600 },
    style: { width: 240 },
    data: {
      label: "Ready for Dispatch",
      subLabel: "Status: Active",
      icon: Truck,
      badge: "Complete",
      iconBg: "bg-green-100 text-green-600 dark:bg-green-900",
    },
  },
];

const onboardingEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  // Split
  { id: "e3-4", source: "3", target: "4" },
  { id: "e3-5", source: "3", target: "5" },
  // Merge
  { id: "e4-6", source: "4", target: "6" },
  { id: "e5-6", source: "5", target: "6" },
];

export const DriverOnboardingFlow = () => (
  <FlowWrapper
    initialNodes={onboardingNodes}
    initialEdges={onboardingEdges}
    fitView={true}
  />
);

// --- Asset Maintenance Flow ---
const maintenanceNodes: Node[] = [
  // 1. DVIR Submitted
  {
    id: "m1",
    type: "flowBlock",
    position: { x: 0, y: 0 },
    style: { width: 240 },
    data: {
      label: "DVIR Submitted",
      subLabel: "Technician App",
      icon: Truck,
      badge: "Mobile",
      iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800",
    },
  },
  // 2. Defect Detected
  {
    id: "m2",
    type: "flowBlock",
    position: { x: 0, y: 140 },
    style: { width: 240 },
    data: {
      label: "Defect Detected: Brakes",
      subLabel: "Automated Trigger",
      icon: AlertTriangle,
      badge: "Alert",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900",
    },
  },
  // 3. Work Orchestration
  {
    id: "m3",
    type: "flowBlock",
    position: { x: 0, y: 280 },
    style: { width: 240 },
    data: {
      label: "Work Orchestration",
      subLabel: "Parts & Labor Assigned",
      icon: Wrench,
      badge: "Auto",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900",
    },
  },
  // 4. Update Fleet Status
  {
    id: "m4",
    type: "flowBlock",
    position: { x: 0, y: 420 },
    style: { width: 240 },
    data: {
      label: "Update Fleet Status",
      subLabel: "ERP & TMS",
      icon: Database,
      badge: "Sync",
      iconBg: "bg-green-100 text-green-600 dark:bg-green-900",
    },
  },
];

const maintenanceEdges: Edge[] = [
  { id: "e-m1-m2", source: "m1", target: "m2" },
  { id: "e-m2-m3", source: "m2", target: "m3" },
  { id: "e-m3-m4", source: "m3", target: "m4" },
];

export const AssetMaintenanceFlow = () => (
  <FlowWrapper
    initialNodes={maintenanceNodes}
    initialEdges={maintenanceEdges}
    fitView={true}
  />
);
