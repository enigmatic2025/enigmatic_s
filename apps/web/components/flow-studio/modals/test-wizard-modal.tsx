"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Play,
  Zap,
  ClipboardList,
  RadioTower,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar as CalendarIcon,
  Star,
  PenTool,
  FileText,
  Circle,
} from 'lucide-react';

// ─── Types ───

interface SchemaField {
  key: string;
  type: string;
  label?: string;
  required: boolean;
  options?: string[];
  allowMultiple?: boolean;
}

interface WizardStep {
  type: 'trigger' | 'human-task' | 'automation' | 'review';
  node?: Node;
}

interface TestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (triggerPayload: any) => void;
  nodes: Node[];
  edges: Edge[];
  onUpdateNodeData: (nodeId: string, data: any) => void;
  flowId?: string;
}

// ─── BFS Utility ───

function bfsOrder(nodes: Node[], edges: Edge[]): Node[] {
  const triggerNode = nodes.find(n =>
    n.type === 'api-trigger' || n.type === 'manual-trigger'
  );
  if (!triggerNode) return nodes;

  const outgoing = new Map<string, string[]>();
  edges.forEach(e => {
    const list = outgoing.get(e.source) || [];
    list.push(e.target);
    outgoing.set(e.source, list);
  });

  const visited = new Set<string>();
  const ordered: Node[] = [];
  const queue = [triggerNode.id];
  visited.add(triggerNode.id);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodes.find(n => n.id === id);
    if (node) ordered.push(node);
    for (const targetId of (outgoing.get(id) || [])) {
      if (!visited.has(targetId)) {
        visited.add(targetId);
        queue.push(targetId);
      }
    }
  }
  return ordered;
}

// ─── Helpers ───

function StepIcon({ type, className }: { type: WizardStep['type']; className?: string }) {
  switch (type) {
    case 'trigger': return <Zap className={cn("w-3.5 h-3.5", className)} />;
    case 'human-task': return <ClipboardList className={cn("w-3.5 h-3.5", className)} />;
    case 'automation': return <RadioTower className={cn("w-3.5 h-3.5", className)} />;
    case 'review': return <ListChecks className={cn("w-3.5 h-3.5", className)} />;
  }
}

function stepLabel(step: WizardStep): string {
  switch (step.type) {
    case 'trigger': return 'Trigger Payload';
    case 'human-task': return step.node?.data?.label || step.node?.data?.title || 'Human Task';
    case 'automation': return step.node?.data?.label || step.node?.data?.eventName || 'Wait for Event';
    case 'review': return 'Review & Run';
  }
}

function stepSubtitle(step: WizardStep): string {
  switch (step.type) {
    case 'trigger': return 'API Trigger';
    case 'human-task': return 'Human Task';
    case 'automation': return 'Wait for Event';
    case 'review': return 'Summary';
  }
}

// ─── Main Component ───

export function TestWizardModal({
  isOpen,
  onClose,
  onRun,
  nodes,
  edges,
  onUpdateNodeData,
  flowId,
}: TestWizardModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [triggerPayload, setTriggerPayload] = useState<Record<string, any>>({});
  const [triggerJson, setTriggerJson] = useState("{\n  \n}");
  const [triggerMode, setTriggerMode] = useState<'form' | 'json'>('form');

  // Compute wizard steps
  const steps = useMemo(() => {
    const result: WizardStep[] = [];

    const triggerNode = nodes.find(n => n.type === 'api-trigger');
    if (triggerNode?.data?.schema?.length > 0) {
      result.push({ type: 'trigger', node: triggerNode });
    }

    const ordered = bfsOrder(nodes, edges);
    for (const node of ordered) {
      if (node.type === 'human-task') {
        const hasMock = node.data?.mockResponse && Object.keys(node.data.mockResponse).length > 0;
        if (!hasMock) result.push({ type: 'human-task', node });
      }
      if (node.type === 'automation') {
        let hasMock = false;
        if (node.data?.mockPayload) {
          try { JSON.parse(node.data.mockPayload); hasMock = true; } catch { /* invalid */ }
        }
        if (!hasMock) result.push({ type: 'automation', node });
      }
    }

    result.push({ type: 'review' });
    return result;
  }, [nodes, edges]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);

      const triggerNode = nodes.find(n => n.type === 'api-trigger');
      const sessionKey = flowId ? `test_payload_${flowId}` : null;
      let loaded: Record<string, any> | null = null;

      if (sessionKey) {
        try {
          const stored = sessionStorage.getItem(sessionKey);
          if (stored) loaded = JSON.parse(stored);
        } catch { /* ignore */ }
      }

      if (loaded) {
        setTriggerPayload(loaded);
        setTriggerJson(JSON.stringify(loaded, null, 2));
      } else if (triggerNode?.data?.schema) {
        const initial: Record<string, any> = {};
        (triggerNode.data.schema as SchemaField[]).forEach(f => {
          if (f.type === 'string') initial[f.key] = "";
          if (f.type === 'number') initial[f.key] = 0;
          if (f.type === 'boolean') initial[f.key] = false;
          if (f.type === 'array') initial[f.key] = [];
          if (f.type === 'object') initial[f.key] = {};
        });
        setTriggerPayload(initial);
        setTriggerJson(JSON.stringify(initial, null, 2));
      } else {
        setTriggerPayload({});
        setTriggerJson("{\n  \n}");
      }

      setTriggerMode('form');
    }
  }, [isOpen, nodes, flowId]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // ─── Trigger Handlers ───

  const handleTriggerFormChange = (key: string, value: any) => {
    const newData = { ...triggerPayload, [key]: value };
    setTriggerPayload(newData);
    setTriggerJson(JSON.stringify(newData, null, 2));
    if (flowId) {
      try { sessionStorage.setItem(`test_payload_${flowId}`, JSON.stringify(newData)); } catch { /* */ }
    }
  };

  const handleTriggerJsonChange = (str: string) => {
    setTriggerJson(str);
    try {
      const parsed = JSON.parse(str);
      setTriggerPayload(parsed);
      if (flowId) {
        try { sessionStorage.setItem(`test_payload_${flowId}`, JSON.stringify(parsed)); } catch { /* */ }
      }
    } catch { /* invalid */ }
  };

  // ─── Navigation ───

  const handleNext = () => {
    if (isLastStep) return;
    if (currentStepData.type === 'trigger' && triggerMode === 'json') {
      try { JSON.parse(triggerJson); } catch {
        toast.error("Invalid JSON in trigger payload");
        return;
      }
    }
    setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    setCurrentStep(s => s - 1);
  };

  const handleRun = () => {
    let payload = triggerPayload;
    if (steps.some(s => s.type === 'trigger')) {
      if (triggerMode === 'json') {
        try { payload = JSON.parse(triggerJson); } catch {
          toast.error("Invalid JSON in trigger payload");
          return;
        }
      }
      const triggerNode = nodes.find(n => n.type === 'api-trigger');
      if (triggerNode?.data?.schema) {
        const missing: string[] = [];
        (triggerNode.data.schema as SchemaField[]).forEach(f => {
          if (f.required) {
            const val = payload[f.key];
            if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
              missing.push(f.key);
            }
          }
        });
        if (missing.length > 0) {
          toast.error(`Missing required fields: ${missing.join(', ')}`);
          return;
        }
      }
    }

    if (flowId) {
      try { sessionStorage.setItem(`test_payload_${flowId}`, JSON.stringify(payload)); } catch { /* */ }
    }

    onRun(payload);
    onClose();
  };

  // ─── Step Renderers ───

  const renderTriggerStep = (node: Node) => {
    const schema = (node.data?.schema || []) as SchemaField[];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <span className="text-[11px] text-muted-foreground">JSON</span>
          <Switch
            checked={triggerMode === 'json'}
            onCheckedChange={(checked: boolean) => setTriggerMode(checked ? 'json' : 'form')}
          />
        </div>

        {triggerMode === 'form' && schema.length > 0 ? (
          <div className="space-y-3">
            {schema.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  <span className="font-mono">{field.key}</span>
                  {field.required && <span className="text-foreground ml-1">*</span>}
                </Label>
                <div>
                  {field.type === 'boolean' ? (
                    <Switch
                      checked={!!triggerPayload[field.key]}
                      onCheckedChange={(checked: boolean) => handleTriggerFormChange(field.key, checked)}
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      type="number"
                      value={triggerPayload[field.key] || 0}
                      onChange={(e) => handleTriggerFormChange(field.key, parseFloat(e.target.value))}
                      className="h-9 text-sm"
                    />
                  ) : field.type === 'object' || field.type === 'array' ? (
                    <p className="text-xs text-muted-foreground py-2 px-3 border border-dashed rounded-md">
                      Switch to JSON mode to edit complex types
                    </p>
                  ) : (
                    <Input
                      value={triggerPayload[field.key] || ''}
                      onChange={(e) => handleTriggerFormChange(field.key, e.target.value)}
                      className="h-9 text-sm"
                      placeholder={`Enter ${field.key}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Textarea
            value={triggerJson}
            onChange={(e) => handleTriggerJsonChange(e.target.value)}
            className="font-mono text-xs h-70 resize-none bg-muted/30 border-border"
            placeholder='{ "key": "value" }'
          />
        )}
      </div>
    );
  };

  const renderHumanTaskStep = (node: Node) => {
    const schema = (node.data?.schema || []) as SchemaField[];
    const mockResponse = node.data?.mockResponse || {};

    const updateMock = (key: string, value: any) => {
      const newMock = { ...mockResponse, [key]: value };
      onUpdateNodeData(node.id, { ...node.data, mockResponse: newMock });
    };

    if (schema.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No form fields defined</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Configure fields in the node settings first</p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {schema.map((field) => {
          const mockValue = mockResponse[field.key] ?? '';
          return (
            <div key={field.key} className="space-y-2">
              <Label className="text-xs">
                {field.label || field.key}
                {field.required && <span className="text-foreground ml-0.5">*</span>}
                <span className="text-muted-foreground/60 font-normal ml-1.5 text-[10px] uppercase tracking-wider">{field.type}</span>
              </Label>
              {renderFieldInput(field, mockValue, (val) => updateMock(field.key, val))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFieldInput = (field: SchemaField, value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'long-text':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label || field.key}`}
            className="resize-none h-20 text-sm"
          />
        );
      case 'boolean':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange(true)}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all",
                value === true
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange(false)}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all",
                value === false
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
              )}
            >
              No
            </button>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder="0"
            className="h-9 text-sm"
          />
        );
      case 'rating':
        return (
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className="p-0.5 rounded transition-all hover:scale-110"
              >
                <Star className={cn(
                  "w-6 h-6 transition-all",
                  (value || 0) >= star
                    ? "fill-foreground text-foreground"
                    : "text-border"
                )} />
              </button>
            ))}
            {value > 0 && (
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">{value}/5</span>
            )}
          </div>
        );
      case 'date':
      case 'datetime':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted/30 transition-colors text-left",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {value ? format(new Date(value), field.type === 'datetime' ? 'PPP p' : 'PPP') : `Select ${field.type === 'datetime' ? 'date & time' : 'date'}`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date ? date.toISOString() : '')}
              />
              {field.type === 'datetime' && (
                <div className="p-3 pt-0 border-t">
                  <Label className="text-[10px] text-muted-foreground">Time</Label>
                  <Input
                    type="time"
                    value={value ? format(new Date(value), 'HH:mm') : ''}
                    onChange={(e) => {
                      const base = value ? new Date(value) : new Date();
                      const [h, m] = e.target.value.split(':');
                      base.setHours(parseInt(h), parseInt(m));
                      onChange(base.toISOString());
                    }}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 text-sm"
          />
        );
      case 'multi-choice':
        if (field.allowMultiple) {
          return (
            <div className="space-y-2 py-1">
              {(field.options || []).map((opt, i) => {
                const currentVals = (value as string[]) || [];
                const isChecked = Array.isArray(currentVals) && currentVals.includes(opt);
                return (
                  <div key={i} className="flex items-center space-x-2.5">
                    <Checkbox
                      id={`wizard-${field.key}-${i}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newVals = [...(Array.isArray(currentVals) ? currentVals : [])];
                        if (checked) newVals.push(opt);
                        else newVals = newVals.filter(v => v !== opt);
                        onChange(newVals);
                      }}
                    />
                    <Label htmlFor={`wizard-${field.key}-${i}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
                  </div>
                );
              })}
            </div>
          );
        }
        return (
          <Select value={String(value)} onValueChange={(val) => onChange(val)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt, i) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'signature':
        return (
          <div className="py-4 border border-dashed border-border rounded-lg bg-muted/10 text-center">
            <PenTool className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground">Auto-filled during test</p>
          </div>
        );
      case 'file':
        return (
          <div className="py-4 border border-dashed border-border rounded-lg bg-muted/10 text-center">
            <FileText className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground">Skipped during test</p>
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label || field.key}`}
            className="h-9 text-sm"
          />
        );
    }
  };

  const renderAutomationStep = (node: Node) => {
    const schema = (node.data?.schema || []) as { key: string; type: string }[];
    const TYPE_DEFAULTS: Record<string, string> = {
      string: '"..."', number: '0', boolean: 'true', object: '{}', array: '[]',
    };
    const buildDefault = () => {
      if (schema.length === 0) return '{\n  "your_field": "your_value"\n}';
      const lines = schema.map((f) => `  "${f.key}": ${TYPE_DEFAULTS[f.type] || '"..."'}`);
      return `{\n${lines.join(',\n')}\n}`;
    };

    const currentValue = node.data?.mockPayload || buildDefault();

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">
            Mock Webhook Body
          </Label>
          <Textarea
            value={currentValue}
            onChange={(e) => onUpdateNodeData(node.id, { ...node.data, mockPayload: e.target.value })}
            placeholder={buildDefault()}
            className="font-mono text-xs h-60 resize-none bg-muted/20 border-border"
            spellCheck={false}
          />
          <p className="text-[11px] text-muted-foreground">
            Valid JSON matching the expected payload schema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdateNodeData(node.id, { ...node.data, mockPayload: buildDefault() })}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Reset to defaults
        </button>
      </div>
    );
  };

  const renderReviewStep = () => {
    const ordered = bfsOrder(nodes, edges);
    const triggerNode = nodes.find(n => n.type === 'api-trigger');
    const hasTriggerSchema = triggerNode?.data?.schema?.length > 0;
    const blockingNodes = ordered.filter(n => n.type === 'human-task' || n.type === 'automation');

    return (
      <div className="space-y-3">
        {/* Trigger */}
        {hasTriggerSchema && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/30">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium flex-1">Trigger Payload</span>
              <Check className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <pre className="text-[11px] font-mono px-4 py-2.5 text-muted-foreground overflow-x-auto max-h-18 border-t border-border bg-muted/10">
              {JSON.stringify(triggerPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Blocking nodes */}
        {blockingNodes.map((node) => {
          const name = node.data?.label || node.data?.title || node.data?.eventName || node.id.slice(0, 8);
          const isHumanTask = node.type === 'human-task';
          const isConfigured = isHumanTask
            ? (node.data?.mockResponse && Object.keys(node.data.mockResponse).length > 0)
            : !!node.data?.mockPayload;

          let previewData: any = null;
          if (isHumanTask && node.data?.mockResponse) {
            previewData = node.data.mockResponse;
          } else if (!isHumanTask && node.data?.mockPayload) {
            try { previewData = JSON.parse(node.data.mockPayload); } catch { previewData = node.data.mockPayload; }
          }

          return (
            <div key={node.id} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/30">
                {isHumanTask
                  ? <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                  : <RadioTower className="w-3.5 h-3.5 text-muted-foreground" />
                }
                <span className="text-xs font-medium truncate flex-1">{name}</span>
                <span className="text-[10px] text-muted-foreground/60 mr-1">
                  {isHumanTask ? 'Task' : 'Event'}
                </span>
                {isConfigured ? (
                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground/40" />
                )}
              </div>
              {previewData && (
                <pre className="text-[11px] font-mono px-4 py-2.5 text-muted-foreground overflow-x-auto max-h-14 border-t border-border bg-muted/10">
                  {typeof previewData === 'string' ? previewData : JSON.stringify(previewData, null, 2)}
                </pre>
              )}
            </div>
          );
        })}

        {blockingNodes.length === 0 && !hasTriggerSchema && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Play className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Ready to run</p>
            <p className="text-xs text-muted-foreground/60 mt-1">No test data required</p>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    if (!currentStepData) return null;
    switch (currentStepData.type) {
      case 'trigger': return renderTriggerStep(currentStepData.node!);
      case 'human-task': return renderHumanTaskStep(currentStepData.node!);
      case 'automation': return renderAutomationStep(currentStepData.node!);
      case 'review': return renderReviewStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-180 p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex h-130">

          {/* ─── Left: Step Nav ─── */}
          <div className="w-[200px] shrink-0 border-r border-border bg-muted/20 flex flex-col">
            <div className="px-5 pt-5 pb-4">
              <DialogHeader>
                <DialogTitle className="text-sm font-medium tracking-tight">Test Wizard</DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground/70">
                  Configure mock data
                </DialogDescription>
              </DialogHeader>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              {steps.map((step, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs group",
                      isCurrent && "bg-foreground text-background",
                      !isCurrent && "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-semibold transition-all",
                      isCurrent && "bg-background text-foreground",
                      isComplete && "bg-foreground/10 text-foreground border border-foreground/20",
                      !isCurrent && !isComplete && "border border-border"
                    )}>
                      {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium leading-tight">
                        {stepLabel(step)}
                      </span>
                      <span className={cn(
                        "block text-[9px] mt-0.5 uppercase tracking-wider",
                        isCurrent ? "text-background/60" : "text-muted-foreground/50"
                      )}>
                        {stepSubtitle(step)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                <span>{currentStep + 1}/{steps.length}</span>
              </div>
            </div>
          </div>

          {/* ─── Right: Content ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <StepIcon type={currentStepData?.type || 'review'} className="text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium leading-tight">
                    {currentStepData ? stepLabel(currentStepData) : 'Review'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    {currentStepData ? stepSubtitle(currentStepData) : 'Summary'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="gap-1.5 text-muted-foreground"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>

                {isLastStep ? (
                  <Button
                    size="sm"
                    onClick={handleRun}
                    className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Run Test
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
