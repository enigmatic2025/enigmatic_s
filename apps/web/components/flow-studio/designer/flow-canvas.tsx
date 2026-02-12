"use client";

import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NODE_TYPES } from '../constants/node-registry';
import { ForwardedRef, useCallback } from 'react';

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDragOver,
  onDrop,
  onNodeClick,
  wrapperRef,
}: FlowCanvasProps) {
  return (
    <div className="flex-1 bg-muted/10 relative" ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={{ animated: true }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
