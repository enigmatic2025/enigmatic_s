"use client";

import React from "react";
import { useTranslations } from "next-intl";
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
  Activity,
  Package,
  ClipboardList,
  Siren,
  HardHat,
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
        maxZoom={1}
      >
        <Background color="var(--muted-foreground)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

// --- Driver Onboarding Flow ---
// Layout: Vertical flow with parallel branches
export const DriverOnboardingFlow = () => {
  const t = useTranslations('UseCaseFlows');

  const onboardingNodes: Node[] = [
    // 1. Application received
    {
      id: "1",
      type: "flowBlock",
      position: { x: 130, y: 0 },
      style: { width: 240 },
      data: {
        label: t('onboarding.appReceived'),
        subLabel: t('onboarding.tenstreetWebhook'),
        icon: Webhook,
        badge: t('badges.api'),
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    // 2. Documents collected
    {
      id: "2",
      type: "flowBlock",
      position: { x: 130, y: 140 },
      style: { width: 240 },
      data: {
        label: t('onboarding.docsReview'),
        subLabel: t('onboarding.recruiting'),
        icon: User,
        badge: t('badges.human'),
        iconBg:
          "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    // 3. Background checks approved
    {
      id: "3",
      type: "flowBlock",
      position: { x: 130, y: 280 },
      style: { width: 240 },
      data: {
        label: t('onboarding.bgChecks'),
        subLabel: t('onboarding.natalieAgent'),
        icon: Bot,
        badge: t('badges.automated'),
        iconBg:
          "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      },
    },
    // 4. Orientation scheduled (Left Branch)
    {
      id: "4",
      type: "flowBlock",
      position: { x: 0, y: 440 },
      style: { width: 240 },
      data: {
        label: t('onboarding.orientation'),
        subLabel: t('onboarding.ops'),
        icon: Calendar,
        badge: t('badges.human'),
        iconBg:
          "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    // 5. Driver added to TMS and HR systems (Right Branch)
    {
      id: "5",
      type: "flowBlock",
      position: { x: 260, y: 440 },
      style: { width: 240 },
      data: {
        label: t('onboarding.provisioning'),
        subLabel: t('onboarding.systems'),
        icon: Database,
        badge: t('badges.automated'),
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    // 6. Driver ready for dispatch (Merge)
    {
      id: "6",
      type: "flowBlock",
      position: { x: 130, y: 600 },
      style: { width: 240 },
      data: {
        label: t('onboarding.ready'),
        subLabel: t('onboarding.active'),
        icon: Truck,
        badge: t('badges.complete'),
        iconBg:
          "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
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

  return (
    <FlowWrapper
      initialNodes={onboardingNodes}
      initialEdges={onboardingEdges}
      fitView={true}
    />
  );
};

// --- Asset Maintenance Flow ---
export const AssetMaintenanceFlow = () => {
  const t = useTranslations('UseCaseFlows');

  const maintenanceNodes: Node[] = [
    // 1. DVIR Submitted
    {
      id: "m1",
      type: "flowBlock",
      position: { x: 0, y: 0 },
      style: { width: 240 },
      data: {
        label: t('maintenance.dvir'),
        subLabel: t('maintenance.techApp'),
        icon: Truck,
        badge: t('badges.mobile'),
        iconBg:
          "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
      },
    },
    // 2. Defect Detected
    {
      id: "m2",
      type: "flowBlock",
      position: { x: 0, y: 140 },
      style: { width: 240 },
      data: {
        label: t('maintenance.defect'),
        subLabel: t('maintenance.trigger'),
        icon: AlertTriangle,
        badge: t('badges.alert'),
        iconBg:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      },
    },
    // 3. Work Orchestration
    {
      id: "m3",
      type: "flowBlock",
      position: { x: 0, y: 280 },
      style: { width: 240 },
      data: {
        label: t('maintenance.orchestration'),
        subLabel: t('maintenance.assigned'),
        icon: Wrench,
        badge: t('badges.auto'),
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    // 4. Update Fleet Status
    {
      id: "m4",
      type: "flowBlock",
      position: { x: 0, y: 420 },
      style: { width: 240 },
      data: {
        label: t('maintenance.update'),
        subLabel: t('maintenance.erpTms'),
        icon: Database,
        badge: t('badges.sync'),
        iconBg:
          "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      },
    },
  ];

  const maintenanceEdges: Edge[] = [
    { id: "e-m1-m2", source: "m1", target: "m2" },
    { id: "e-m2-m3", source: "m2", target: "m3" },
    { id: "e-m3-m4", source: "m3", target: "m4" },
  ];

  return (
    <FlowWrapper
      initialNodes={maintenanceNodes}
      initialEdges={maintenanceEdges}
      fitView={true}
    />
  );
};

// --- Manufacturing Predictive Flow ---
export const ManufacturingFlow = () => {
  const t = useTranslations('UseCaseFlows');

  const manufacturingNodes: Node[] = [
    // 1. IoT Sensor Stream
    {
      id: "mf1",
      type: "flowBlock",
      position: { x: 130, y: 0 },
      style: { width: 240 },
      data: {
        label: t('manufacturing.iot'),
        subLabel: t('manufacturing.vibration'),
        icon: Activity,
        badge: t('badges.mqtt'),
        iconBg:
          "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      },
    },
    // 2. Anomaly Detection
    {
      id: "mf2",
      type: "flowBlock",
      position: { x: 130, y: 140 },
      style: { width: 240 },
      data: {
        label: t('manufacturing.anomaly'),
        subLabel: t('manufacturing.confidence'),
        icon: Bot,
        badge: t('badges.aiAnalysis'),
        iconBg:
          "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      },
    },
    // 3. Maintenance Ticket (Branch Left)
    {
      id: "mf3",
      type: "flowBlock",
      position: { x: 0, y: 300 },
      style: { width: 240 },
      data: {
        label: t('manufacturing.workOrder'),
        subLabel: t('manufacturing.shiftLead'),
        icon: Wrench,
        badge: t('badges.cmms'),
        iconBg:
          "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      },
    },
    // 4. Production Schedule Update (Branch Right)
    {
      id: "mf4",
      type: "flowBlock",
      position: { x: 260, y: 300 },
      style: { width: 240 },
      data: {
        label: t('manufacturing.adjust'),
        subLabel: t('manufacturing.reroute'),
        icon: Calendar,
        badge: t('badges.erpSync'),
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
  ];

  const manufacturingEdges: Edge[] = [
    { id: "e-mf1-mf2", source: "mf1", target: "mf2" },
    { id: "e-mf2-mf3", source: "mf2", target: "mf3" },
    { id: "e-mf2-mf4", source: "mf2", target: "mf4" },
  ];

  return (
    <FlowWrapper
      initialNodes={manufacturingNodes}
      initialEdges={manufacturingEdges}
      fitView={true}
    />
  );
};

// --- Construction Material Flow ---
export const ConstructionFlow = () => {
  const t = useTranslations('UseCaseFlows');

  const constructionNodes: Node[] = [
    // 1. Site Request
    {
      id: "cn1",
      type: "flowBlock",
      position: { x: 130, y: 0 },
      style: { width: 240 },
      data: {
        label: t('construction.request'),
        subLabel: t('construction.concrete'),
        icon: ClipboardList,
        badge: t('badges.fieldApp'),
        iconBg:
          "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
      },
    },
    // 2. Inventory Check
    {
      id: "cn2",
      type: "flowBlock",
      position: { x: 130, y: 140 },
      style: { width: 240 },
      data: {
        label: t('construction.inventory'),
        subLabel: t('construction.plant'),
        icon: Package,
        badge: t('badges.erp'),
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    // 3. Dispatch Truck (Branch Left)
    {
      id: "cn3",
      type: "flowBlock",
      position: { x: 0, y: 300 },
      style: { width: 240 },
      data: {
        label: t('construction.dispatch'),
        subLabel: t('construction.eta'),
        icon: Truck,
        badge: t('badges.logistics'),
        iconBg:
          "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      },
    },
    // 4. Site Access (Branch Right)
    {
      id: "cn4",
      type: "flowBlock",
      position: { x: 260, y: 300 },
      style: { width: 240 },
      data: {
        label: t('construction.gate'),
        subLabel: t('construction.access'),
        icon: HardHat,
        badge: t('badges.security'),
        iconBg:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      },
    },
     // 5. Delivery Complete (Merge)
     {
      id: "cn5",
      type: "flowBlock",
      position: { x: 130, y: 480 },
      style: { width: 240 },
      data: {
        label: t('construction.pour'),
        subLabel: t('construction.quality'),
        icon: Database,
        badge: t('badges.record'),
        iconBg:
          "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
      },
    },
  ];

  const constructionEdges: Edge[] = [
    { id: "e-cn1-cn2", source: "cn1", target: "cn2" },
    { id: "e-cn2-cn3", source: "cn2", target: "cn3" },
    { id: "e-cn2-cn4", source: "cn2", target: "cn4" },
    { id: "e-cn3-cn5", source: "cn3", target: "cn5" },
    { id: "e-cn4-cn5", source: "cn4", target: "cn5" },
  ];

  return (
    <FlowWrapper
      initialNodes={constructionNodes}
      initialEdges={constructionEdges}
      fitView={true}
    />
  );
};

