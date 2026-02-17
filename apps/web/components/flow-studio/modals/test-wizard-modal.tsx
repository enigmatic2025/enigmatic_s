"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  RotateCcw,
  Save,
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

const STEP_ICONS: Record<WizardStep['type'], typeof Zap> = {
  'trigger': Zap,
  'human-task': ClipboardList,
  'automation': RadioTower,
  'review': ListChecks,
};

const STEP_COLORS: Record<WizardStep['type'], string> = {
  'trigger': 'text-emerald-500',
  'human-task': 'text-teal-500',
  'automation': 'text-pink-500',
  'review': 'text-foreground',
};

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
    case 'trigger': return 'Input data';
    case 'human-task': return 'Mock response';
    case 'automation': return 'Mock payload';
    case 'review': return 'Confirm & execute';
  }
}

// ─── Validation: Check if a step has valid data ───

function isStepValid(step: WizardStep, triggerPayload: Record<string, any>): boolean {
  switch (step.type) {
    case 'trigger': {
      const schema = (step.node?.data?.schema || []) as SchemaField[];
      if (schema.length === 0) return true;
      // Check all required fields have non-empty values
      return schema.every(f => {
        if (!f.required) return true;
        const val = triggerPayload[f.key];
        if (val === undefined || val === null) return false;
        if (typeof val === 'string' && val.trim() === '') return false;
        return true;
      });
    }
    case 'human-task': {
      const schema = (step.node?.data?.schema || []) as SchemaField[];
      const mockResponse = step.node?.data?.mockResponse || {};
      if (schema.length === 0) return true;
      // Check all required fields have values
      return schema.every(f => {
        if (!f.required) return true;
        const val = mockResponse[f.key];
        if (val === undefined || val === null) return false;
        if (typeof val === 'string' && val.trim() === '') return false;
        return true;
      });
    }
    case 'automation': {
      const mockPayload = step.node?.data?.mockPayload;
      if (!mockPayload) return false;
      try {
        JSON.parse(mockPayload);
        return true;
      } catch {
        return false;
      }
    }
    case 'review':
      return true;
  }
}

// ─── Storage Key ───
function getStorageKey(flowId: string | undefined) {
  return flowId ? `test_data_${flowId}` : null;
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
  const [localMockPayloads, setLocalMockPayloads] = useState<Record<string, string>>({});

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
        result.push({ type: 'human-task', node });
      }
      if (node.type === 'automation') {
        result.push({ type: 'automation', node });
      }
    }

    result.push({ type: 'review' });
    return result;
  }, [nodes, edges]);

  // Track previous isOpen to detect open transition
  const prevIsOpenRef = useRef(false);

  // Reset only when modal opens (isOpen transitions false → true)
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!justOpened) return;

    setCurrentStep(0);
    setTriggerMode('form');

    const triggerNode = nodes.find(n => n.type === 'api-trigger');
    const storageKey = getStorageKey(flowId);
    let loadedTrigger: Record<string, any> | null = null;

    // Try to load saved test data
    if (storageKey) {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          loadedTrigger = parsed.trigger || null;

          // Restore mock data to nodes
          if (parsed.mocks) {
            for (const [nodeId, mockData] of Object.entries(parsed.mocks)) {
              const node = nodes.find(n => n.id === nodeId);
              if (node) {
                if (node.type === 'human-task' && mockData) {
                  onUpdateNodeData(nodeId, { ...node.data, mockResponse: mockData });
                } else if (node.type === 'automation' && mockData) {
                  onUpdateNodeData(nodeId, { ...node.data, mockPayload: mockData });
                }
              }
            }
          }
        }
      } catch { /* ignore */ }
    }

    if (loadedTrigger) {
      setTriggerPayload(loadedTrigger);
      setTriggerJson(JSON.stringify(loadedTrigger, null, 2));
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
  }, [isOpen, nodes, flowId, onUpdateNodeData]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // ─── Save all test data ───

  const buildTestData = useCallback(() => {
    const mocks: Record<string, any> = {};
    let hasMockData = false;
    for (const step of steps) {
      if (step.type === 'human-task' && step.node) {
        const mock = step.node.data?.mockResponse || null;
        mocks[step.node.id] = mock;
        if (mock && Object.keys(mock).length > 0) hasMockData = true;
      }
      if (step.type === 'automation' && step.node) {
        const mock = step.node.data?.mockPayload || null;
        mocks[step.node.id] = mock;
        if (mock) hasMockData = true;
      }
    }
    const hasTriggerData = Object.keys(triggerPayload).length > 0 &&
      Object.values(triggerPayload).some(v => v !== '' && v !== 0 && v !== false && v !== null && v !== undefined);
    return { data: { trigger: triggerPayload, mocks }, hasData: hasTriggerData || hasMockData };
  }, [steps, triggerPayload]);

  const saveAllTestData = useCallback((silent = false) => {
    const storageKey = getStorageKey(flowId);
    if (!storageKey) {
      if (!silent) toast.error("Cannot save: no flow ID");
      return;
    }

    const { data, hasData } = buildTestData();
    if (!hasData) {
      if (!silent) toast.info("No test data to save");
      return;
    }

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(data));
      if (!silent) toast.success("Test data saved");
    } catch {
      if (!silent) toast.error("Failed to save test data");
    }
  }, [flowId, buildTestData]);

  // ─── Trigger Handlers ───

  const handleTriggerFormChange = (key: string, value: any) => {
    const newData = { ...triggerPayload, [key]: value };
    setTriggerPayload(newData);
    setTriggerJson(JSON.stringify(newData, null, 2));
  };

  const handleTriggerJsonChange = (str: string) => {
    setTriggerJson(str);
    try {
      const parsed = JSON.parse(str);
      setTriggerPayload(parsed);
    } catch { /* invalid */ }
  };

  // ─── Flush local mock payloads to node data ───

  const flushLocalMockPayloads = useCallback(() => {
    for (const [nodeId, value] of Object.entries(localMockPayloads)) {
      const node = nodes.find(n => n.id === nodeId);
      if (node && value !== undefined) {
        onUpdateNodeData(nodeId, { ...node.data, mockPayload: value });
      }
    }
  }, [localMockPayloads, nodes, onUpdateNodeData]);

  // ─── Navigation ───

  const handleNext = () => {
    if (isLastStep) return;
    flushLocalMockPayloads();
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
    flushLocalMockPayloads();
    setCurrentStep(s => s - 1);
  };

  const handleRun = () => {
    flushLocalMockPayloads();
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

    // Auto-save silently before running
    saveAllTestData(true);

    onRun(payload);
    onClose();
  };

  // ─── Step Renderers ───

  const renderTriggerStep = (node: Node) => {
    const schema = (node.data?.schema || []) as SchemaField[];
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Provide the data that will be sent to the trigger endpoint.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {triggerMode === 'form' ? 'Form' : 'JSON'}
            </span>
            <Switch
              checked={triggerMode === 'json'}
              onCheckedChange={(checked: boolean) => setTriggerMode(checked ? 'json' : 'form')}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {triggerMode === 'form' && schema.length > 0 ? (
          <div className="space-y-5">
            {schema.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="font-mono text-muted-foreground">{field.key}</span>
                  {field.required && <span className="text-red-500 text-[10px]">*</span>}
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal ml-auto">
                    {field.type}
                  </Badge>
                </Label>
                {field.type === 'boolean' ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={!!triggerPayload[field.key]}
                      onCheckedChange={(checked: boolean) => handleTriggerFormChange(field.key, checked)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {triggerPayload[field.key] ? 'true' : 'false'}
                    </span>
                  </div>
                ) : field.type === 'number' ? (
                  <Input
                    type="number"
                    value={triggerPayload[field.key] ?? 0}
                    onChange={(e) => handleTriggerFormChange(field.key, parseFloat(e.target.value))}
                    className="h-9 text-sm font-mono"
                  />
                ) : field.type === 'object' || field.type === 'array' ? (
                  <div className="flex items-center gap-2 py-2.5 px-3 border border-dashed rounded-md bg-muted/20">
                    <span className="text-xs text-muted-foreground">Switch to JSON mode to edit complex types</span>
                  </div>
                ) : (
                  <Input
                    value={triggerPayload[field.key] || ''}
                    onChange={(e) => handleTriggerFormChange(field.key, e.target.value)}
                    className="h-9 text-sm"
                    placeholder={`Enter ${field.key}...`}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Textarea
            value={triggerJson}
            onChange={(e) => handleTriggerJsonChange(e.target.value)}
            className="font-mono text-xs min-h-[320px] resize-none bg-muted/20"
            placeholder='{ "key": "value" }'
            spellCheck={false}
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No form fields defined</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Configure fields in the node settings first.</p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Provide mock responses for this human task. These will be used instead of waiting for real input.
        </p>

        <div className="h-px bg-border" />

        <div className="space-y-5">
          {schema.map((field) => {
            const mockValue = mockResponse[field.key] ?? '';
            return (
              <div key={field.key} className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  {field.label || field.key}
                  {field.required && <span className="text-red-500 text-[10px]">*</span>}
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal ml-auto">
                    {field.type}
                  </Badge>
                </Label>
                {renderFieldInput(field, mockValue, (val) => updateMock(field.key, val))}
              </div>
            );
          })}
        </div>
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
            placeholder={`Enter ${field.label || field.key}...`}
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
                "flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all",
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
                "flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all",
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
            className="h-9 text-sm font-mono"
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
                  "w-5 h-5 transition-all",
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
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {value ? format(new Date(value), field.type === 'datetime' ? 'PPP p' : 'PPP') : `Select ${field.type === 'datetime' ? 'date & time' : 'date'}...`}
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
              <SelectValue placeholder="Select an option..." />
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
          <div className="py-3 border border-dashed rounded-md bg-muted/10 text-center">
            <PenTool className="w-4 h-4 mx-auto mb-1 text-muted-foreground/40" />
            <p className="text-[10px] text-muted-foreground">Auto-filled during test</p>
          </div>
        );
      case 'file':
        return (
          <div className="py-3 border border-dashed rounded-md bg-muted/10 text-center">
            <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground/40" />
            <p className="text-[10px] text-muted-foreground">Skipped during test</p>
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label || field.key}...`}
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

    // Use local state if available, otherwise fall back to node data
    const currentValue = localMockPayloads[node.id] ?? node.data?.mockPayload ?? buildDefault();

    return (
      <div className="space-y-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Provide the JSON payload this event would receive. This will be used instead of waiting for the real webhook.
        </p>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Webhook Body (JSON)</Label>
            <button
              type="button"
              onClick={() => {
                const def = buildDefault();
                setLocalMockPayloads(prev => ({ ...prev, [node.id]: def }));
                onUpdateNodeData(node.id, { ...node.data, mockPayload: def });
              }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
          <Textarea
            value={currentValue}
            onChange={(e) => {
              setLocalMockPayloads(prev => ({ ...prev, [node.id]: e.target.value }));
            }}
            onBlur={() => {
              // Sync to parent on blur so node data stays up to date
              const val = localMockPayloads[node.id];
              if (val !== undefined) {
                onUpdateNodeData(node.id, { ...node.data, mockPayload: val });
              }
            }}
            placeholder={buildDefault()}
            className="font-mono text-xs min-h-[320px] resize-none bg-muted/20"
            spellCheck={false}
          />
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const ordered = bfsOrder(nodes, edges);
    const triggerNode = nodes.find(n => n.type === 'api-trigger');
    const hasTriggerSchema = triggerNode?.data?.schema?.length > 0;
    const blockingNodes = ordered.filter(n => n.type === 'human-task' || n.type === 'automation');

    const hasAnyData = hasTriggerSchema || blockingNodes.length > 0;

    return (
      <div className="space-y-5">
        {hasAnyData && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Review the test data below before running. Click a step in the sidebar to make changes.
          </p>
        )}

        {hasTriggerSchema && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-medium">Trigger Payload</span>
              </div>
              <pre className="text-[11px] font-mono p-3 rounded-md bg-muted/30 text-muted-foreground overflow-auto max-h-32 border">
                {JSON.stringify(triggerPayload, null, 2)}
              </pre>
            </div>
          </>
        )}

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

          const Icon = isHumanTask ? ClipboardList : RadioTower;
          const color = isHumanTask ? 'text-teal-500' : 'text-pink-500';

          return (
            <React.Fragment key={node.id}>
              <div className="h-px bg-border" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", color)} />
                  <span className="text-xs font-medium truncate">{name}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal shrink-0">
                    {isHumanTask ? 'Task' : 'Event'}
                  </Badge>
                  {isConfigured ? (
                    <Check className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/30 ml-auto shrink-0" />
                  )}
                </div>
                {previewData ? (
                  <pre className="text-[11px] font-mono p-3 rounded-md bg-muted/30 text-muted-foreground overflow-auto max-h-28 border">
                    {typeof previewData === 'string' ? previewData : JSON.stringify(previewData, null, 2)}
                  </pre>
                ) : (
                  <p className="text-[11px] text-muted-foreground/50 italic pl-6">No mock data configured</p>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {!hasAnyData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Ready to run</p>
            <p className="text-xs text-muted-foreground mt-1">No test data required for this flow.</p>
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
      <DialogContent className="w-[90vw]! max-w-300! h-[85vh]! max-h-225! p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex h-full">

          {/* ─── Left: Step Nav ─── */}
          <div className="w-[240px] shrink-0 border-r border-border bg-muted/10 flex flex-col">
            <div className="px-5 pt-5 pb-4 border-b border-border">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-sm font-semibold">Test Flow</DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground leading-tight">
                  Configure test data for each step
                </DialogDescription>
              </DialogHeader>
            </div>

            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
              {steps.map((step, index) => {
                const valid = isStepValid(step, triggerPayload);
                const isCurrent = index === currentStep;
                const isReview = step.type === 'review';
                const Icon = STEP_ICONS[step.type];
                const color = STEP_COLORS[step.type];

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-xs",
                      isCurrent && "bg-foreground text-background shadow-sm",
                      !isCurrent && "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all",
                      isCurrent && "bg-background/15",
                      valid && !isCurrent && !isReview && "bg-emerald-500/15",
                      !valid && !isCurrent && !isReview && "bg-muted/50",
                      isReview && !isCurrent && "bg-muted/50"
                    )}>
                      {valid && !isCurrent && !isReview ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Icon className={cn("w-3.5 h-3.5", isCurrent ? "text-background" : color)} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium leading-tight">
                        {stepLabel(step)}
                      </span>
                      <span className={cn(
                        "block text-[9px] mt-0.5 leading-tight",
                        isCurrent ? "text-background/50" : "text-muted-foreground/50"
                      )}>
                        {stepSubtitle(step)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 rounded-full flex-1 transition-all",
                      index <= currentStep ? "bg-foreground" : "bg-border"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right: Content ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
              {(() => {
                const Icon = STEP_ICONS[currentStepData?.type || 'review'];
                const color = STEP_COLORS[currentStepData?.type || 'review'];
                return (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight truncate">
                  {currentStepData ? stepLabel(currentStepData) : 'Review'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>

            {/* Scrollable content — fixed height, no layout shift */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-5">
                {renderStepContent()}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0 bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isFirstStep ? onClose : handlePrev}
                  className="gap-1.5 text-muted-foreground h-8"
                >
                  {isFirstStep ? (
                    "Cancel"
                  ) : (
                    <>
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Save button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveAllTestData(false)}
                  className="gap-1.5 h-8 text-muted-foreground"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>

                {isLastStep ? (
                  <Button
                    size="sm"
                    onClick={handleRun}
                    className="gap-2 h-8"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Run Test
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1.5 h-8"
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
