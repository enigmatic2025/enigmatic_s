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
    
  const endpointUrl = `${baseUrl}/api/proxy/flows/${flowId || '{flow_id}'}/execute`;

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
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trigger Settings
        </label>
        <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Action Flow Title Template</label>
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
              <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => onUpdate({ ...data, description: e.target.value })}
                placeholder="Describe what triggers this flow..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-20 resize-none focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
        </div>
      </div>

      {/* Endpoint URL */}
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
      </div>

      {/* Schema Builder */}
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
      
    </div>
  );
}
