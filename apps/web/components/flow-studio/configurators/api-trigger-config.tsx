import React, { useState } from 'react';
import { Copy, Check, Plus, Trash2, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

interface ApiTriggerConfigProps {
  nodeId: string;
  data: any;
  onUpdate: (data: any) => void;
}

interface SchemaField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

export default function ApiTriggerConfig({ nodeId, data, onUpdate }: ApiTriggerConfigProps) {
  const params = useParams();
  const flowId = params?.id as string;
  const [copied, setCopied] = useState(false);
  
  // Default schema logic
  const schema: SchemaField[] = data.schema || [];
  
  // Use configured APP_URL or fallback to browser origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : (typeof window !== 'undefined' ? window.location.origin : '');
    
  const endpointUrl = `${baseUrl}/api/flows/${flowId || '{flow_id}'}/execute`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpointUrl);
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
      
      {/* Introduction */}
      {/* Endpoint URL - Moved to Top */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                Endpoint URL
            </span>
            {flowId ? (
                <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">Live</span>
            ) : (
                <span className="text-[10px] text-yellow-500 font-medium bg-yellow-500/10 px-1.5 py-0.5 rounded">Save to Generate</span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <code className="flex-1 text-[10px] font-mono bg-background border border-border rounded px-2 py-1.5 truncate select-all">
                {endpointUrl}
            </code>
            <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
        <p className="text-[10px] text-muted-foreground">
            Send a POST request with the JSON body defined below.
        </p>
        <div className="flex items-start gap-1.5 pt-2 border-t border-border/50">
            <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground/80">
                This URL is dynamic based on your current environment. 
                When deployed to production (Koyeb), it will automatically show your official domain. 
                Local testing URLs (localhost) are not saved.
            </p>
        </div>
      </div>

      {/* Schema Builder - Moved to Top */}
      <div>
        <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expected Payload (Schema)
            </label>
            <button
                onClick={handleAddField}
                className="text-[10px] flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors"
            >
                <Plus className="w-3 h-3" />
                Add Field
            </button>
        </div>
        
        <div className="space-y-2">
            {schema.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">No fields defined.</p>
                    <p className="text-[10px] text-muted-foreground/60">Any JSON body will be accepted.</p>
                </div>
            ) : (
                schema.map((field, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                        <div className="flex-1 space-y-1">
                            <input
                                type="text"
                                value={field.key}
                                onChange={(e) => handleUpdateField(index, { key: e.target.value })}
                                placeholder="Key"
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="w-24">
                            <select
                                value={field.type}
                                onChange={(e) => handleUpdateField(index, { type: e.target.value as any })}
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none appearance-none"
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="object">Object</option>
                                <option value="array">Array</option>
                            </select>
                        </div>
                        <button
                            onClick={() => handleUpdateField(index, { required: !field.required })}
                            className={`px-2 py-1 text-[10px] border rounded transition-colors ${field.required ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-muted border-transparent text-muted-foreground'}`}
                        >
                            {field.required ? 'Req' : 'Opt'}
                        </button>
                        <button
                            onClick={() => handleRemoveField(index)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Action Flow Information - Renamed from Incoming Webhook Settings */}
      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Action Flow Information
        </label>
        
        <div className="space-y-4">
            {/* Title & Description */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Action Flow Title Template <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={data.instanceNameTemplate || ''}
                        onChange={(e) => onUpdate({ ...data, instanceNameTemplate: e.target.value })}
                        placeholder="e.g. New Order {{ order_id }}"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Name the running instance dynamically using variables.
                    </p>
                </div>
                
                <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Information <span className="text-red-500">*</span></label>
                    <textarea
                        value={data.instanceDescriptionTemplate || ''}
                        onChange={(e) => onUpdate({ ...data, instanceDescriptionTemplate: e.target.value })}
                        placeholder="Information about the action flow"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-20 resize-none focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            {/* Custom Information Fields */}
            <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-foreground">
                        Additional Fields
                    </label>
                    <button
                        onClick={() => {
                            const currentFields = data.infoFields || [];
                            if (currentFields.length < 24) {
                                onUpdate({ 
                                    ...data, 
                                    infoFields: [...currentFields, { label: '', value: '' }] 
                                });
                            }
                        }}
                        disabled={(data.infoFields?.length || 0) >= 24}
                        className="text-[10px] flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3 h-3" />
                        Add Field
                    </button>
                </div>

                <div className="space-y-2">
                    {(!data.infoFields || data.infoFields.length === 0) ? (
                         <div className="text-center py-4 border border-dashed border-border rounded-lg bg-muted/20">
                            <p className="text-[10px] text-muted-foreground">No additional fields configured.</p>
                        </div>
                    ) : (
                        data.infoFields.map((field: any, index: number) => (
                            <div key={index} className="flex items-start gap-2 group">
                                <div className="w-1/3">
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => {
                                            const newFields = [...data.infoFields];
                                            newFields[index] = { ...field, label: e.target.value };
                                            onUpdate({ ...data, infoFields: newFields });
                                        }}
                                        placeholder="Label"
                                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) => {
                                            const newFields = [...data.infoFields];
                                            newFields[index] = { ...field, value: e.target.value };
                                            onUpdate({ ...data, infoFields: newFields });
                                        }}
                                        placeholder="Value (supports {{ variables }})"
                                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newFields = data.infoFields.filter((_: any, i: number) => i !== index);
                                        onUpdate({ ...data, infoFields: newFields });
                                    }}
                                    className="p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all self-center"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                    {(data.infoFields?.length || 0) > 0 && (
                        <p className="text-[10px] text-muted-foreground text-right">
                            {(data.infoFields?.length || 0)} / 24 fields used
                        </p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
