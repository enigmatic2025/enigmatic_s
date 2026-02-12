import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Info, Copy, Check, Braces } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutomationConfigProps {
  nodeId: string;
  flowId?: string;
  data: any;
  onUpdate: (data: any) => void;
}

interface SchemaField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

export function AutomationConfig({ nodeId, flowId, data, onUpdate }: AutomationConfigProps) {
  const t = useTranslations("ConfigDrawer.automation");
  const [copied, setCopied] = useState(false);
  
  // Default schema logic
  const schema: SchemaField[] = data.schema || [];

  // Resume URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const endpointUrl = `${baseUrl}/api/automation/resume`;
  const signalUrl = `${baseUrl}/api/automation/signal`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddField = () => {
    const newField: SchemaField = { key: 'new_field', type: 'string', required: true };
    onUpdate({ ...data, schema: [...schema, newField] });
  };

  const handleUpdateField = (index: number, updates: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    onUpdate({ ...data, schema: newSchema });
  };

  const handleRemoveField = (index: number) => {
    const newSchema = schema.filter((_, i) => i !== index);
    onUpdate({ ...data, schema: newSchema });
  };

  return (
    <div className="space-y-6">
      {/* Label & Description */}
      <div className="space-y-4">
        <div>
            <label className="text-sm font-medium text-foreground block mb-2">
                Label
            </label>
            <input
                type="text"
                value={data.label || ''}
                onChange={(e) => onUpdate({ ...data, label: e.target.value })}
                placeholder={t("stepNamePlaceholder")}
                className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all hover:border-accent-foreground/50"
            />
        </div>

        <div>
            <label className="text-sm font-medium text-foreground block mb-2">
                Description
            </label>
            <textarea
                value={data.description || ''}
                onChange={(e) => onUpdate({ ...data, description: e.target.value })}
                placeholder={t("descriptionPlaceholder")}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-1 focus:ring-primary outline-none transition-all"
            />
        </div>
      </div>

      <div className="h-px bg-border/60 w-full" />

      {/* Correlation Configuration (Primary) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Correlation Rules</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Recommended</span>
            </div>
            <button
                onClick={() => {
                    const currentList = data.correlations || [];
                    onUpdate({ 
                        ...data, 
                        correlations: [...currentList, { eventName: '', key: '', value: '' }] 
                    });
                }}
                className="text-xs flex items-center gap-1 text-primary hover:underline"
            >
                <Plus className="w-3 h-3" />
                Add Condition
            </button>
        </div>
        
        <p className="text-xs text-muted-foreground">
            Configure how external systems can resume this flow. If <strong>any</strong> of these conditions match an incoming signal, the flow will resume.
        </p>

        <div className="space-y-3">
             {(!data.correlations || data.correlations.length === 0) && (
                 <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10">
                     <p className="text-xs text-muted-foreground mb-2">No correlation rules configured.</p>
                     <button
                        onClick={() => onUpdate({ ...data, correlations: [{ eventName: '', key: '', value: '' }] })}
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
                     >
                         Add First Rule
                     </button>
                 </div>
             )}

             {(data.correlations || []).map((rule: any, index: number) => (
                 <div key={index} className="p-3 bg-muted/20 border border-border rounded-md space-y-3 relative group">
                     {/* Remove Button */}
                     <button
                        onClick={() => {
                            const newList = [...(data.correlations || [])];
                            newList.splice(index, 1);
                            onUpdate({ ...data, correlations: newList });
                        }}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Remove Rule"
                     >
                         <Trash2 className="w-3.5 h-3.5" />
                     </button>

                     {/* Event Name */}
                     <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block flex items-center gap-1">
                            Event Name
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                                    <TooltipContent>The type of business event (e.g. 'TruckArrival'). Leave blank for 'default'.</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </label>
                        <input
                            type="text"
                            value={rule.eventName || ''}
                            onChange={(e) => {
                                const newList = [...(data.correlations || [])];
                                newList[index] = { ...newList[index], eventName: e.target.value };
                                onUpdate({ ...data, correlations: newList });
                            }}
                            placeholder="default"
                            className="w-full bg-background border border-input rounded px-2 py-1.5 text-xs outline-none focus:border-primary"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                        {/* Key */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block flex items-center gap-1">
                                Key
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                                        <TooltipContent>Property name to identify the instance (e.g. 'order_id').</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </label>
                            <input
                                type="text"
                                value={rule.key || ''}
                                onChange={(e) => {
                                    const newList = [...(data.correlations || [])];
                                    newList[index] = { ...newList[index], key: e.target.value };
                                    onUpdate({ ...data, correlations: newList });
                                }}
                                placeholder="e.g. order_id"
                                className="w-full bg-background border border-input rounded px-2 py-1.5 text-xs outline-none focus:border-primary"
                            />
                        </div>

                        {/* Value */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block flex items-center gap-1">
                                Value
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                                        <TooltipContent>Expected value for this run (e.g. variable ref).</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={rule.value || ''}
                                    onChange={(e) => {
                                        const newList = [...(data.correlations || [])];
                                        newList[index] = { ...newList[index], value: e.target.value };
                                        onUpdate({ ...data, correlations: newList });
                                    }}
                                    placeholder="{{ ... }}"
                                    className="w-full bg-background border border-input rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-primary pr-6"
                                />
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Braces className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>
             ))}
        </div>

        {/* Signal Endpoint (Helper for the first rule or generic) */}
        {(data.correlations?.length > 0) && (
            <div className="p-3 bg-muted/20 rounded-md border border-border space-y-2 mt-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Signal Endpoint</span>
                     <button
                        onClick={() => copyToClipboard(signalUrl)}
                        className="text-[10px] flex items-center gap-1 text-primary hover:underline"
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy URL
                    </button>
                 </div>
                 <code className="block text-[10px] font-mono bg-background border border-border rounded px-2 py-1.5 text-muted-foreground truncate">
                    POST {signalUrl}
                 </code>
                 <div className="text-[10px] font-mono text-muted-foreground/80 mt-1 break-all">
                    {`{ "event": "${data.correlations[0].eventName || 'default'}", "key": "${data.correlations[0].key}", "value": "...", "flow_id": "${flowId || 'FLOW_UUID'}" }`}
                 </div>
            </div>
        )}
      </div>

      <div className="h-px bg-border/60 w-full" />

      <div className="h-px bg-border/60 w-full" />

       {/* Schema Builder */}
       <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("expectedPayload")}
                </label>
                <button
                    onClick={handleAddField}
                    className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors font-medium"
                >
                    <Plus className="w-3.5 h-3.5" />
                    {t("addField")}
                </button>
            </div>
            
            <div className="space-y-2.5">
                {schema.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/10">
                        <p className="text-sm text-foreground font-medium mb-1">{t("noSchemaTitle")}</p>
                        <p className="text-xs text-muted-foreground">{t("noSchemaDescription")}</p>
                    </div>
                ) : (
                    schema.map((field, index) => (
                        <div key={index} className="flex items-center gap-3 group">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={field.key}
                                    onChange={(e) => handleUpdateField(index, { key: e.target.value })}
                                    placeholder={t("fieldNamePlaceholder")}
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="w-28">
                                <select
                                    value={field.type}
                                    onChange={(e) => handleUpdateField(index, { type: e.target.value as any })}
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
                                >
                                    <option value="string">{t("typeString")}</option>
                                    <option value="number">{t("typeNumber")}</option>
                                    <option value="boolean">{t("typeBoolean")}</option>
                                    <option value="object">{t("typeObject")}</option>
                                    <option value="array">{t("typeArray")}</option>
                                </select>
                            </div>
                            <button
                                onClick={() => handleUpdateField(index, { required: !field.required })}
                                className={`px-3 py-1.5 text-xs text-center border rounded font-medium min-w-[3rem] transition-colors ${field.required ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-muted border-border text-muted-foreground'}`}
                            >
                                {field.required ? t("required") : t("optional")}
                            </button>
                            <button
                                onClick={() => handleRemoveField(index)}
                                className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
}
