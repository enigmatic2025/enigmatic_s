import React, { useState } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useVariableValidation } from '../hooks/use-variable-validation';
import { ValidatedInput } from '../inputs/validated-input';
import { ValidatedTextarea } from '../inputs/validated-textarea';
import { useReactFlow } from 'reactflow';
import { Copy, Check, Plus, Trash2, Info } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AssigneeSelector } from '@/components/assignee-selector';

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
  const t = useTranslations("ConfigDrawer.apiTrigger");
  
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
    <div className="space-y-8">
      
      {/* SECTION 1: Designer Info */}
      <div className="space-y-4">
        {/* Node Label Input (Editable) */}
        <div>
            <label className="text-sm font-medium text-foreground block mb-2">
                {t("name")}
            </label>
            <input
                type="text"
                value={data.label || ''}
                onChange={(e) => onUpdate({ ...data, label: e.target.value })}
                placeholder={t("stepNamePlaceholder")}
                className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all hover:border-accent-foreground/50"
            />
        </div>

        {/* Node Description (Designer Description) */}
        <div>
            <label className="text-sm font-medium text-foreground block mb-2">
                {t("description")} <span className="text-red-500">*</span>
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

      {/* SECTION 2: Configuration (API) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
            {t("configuration")}
        </h3>

        {/* Endpoint URL */}
        <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{t("endpointUrl")}</span>
                </div>
                {flowId ? (
                    <span className="text-[10px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">{t("live")}</span>
                ) : (
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">{t("saveToGenerate")}</span>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-background border border-border rounded-md px-3 py-2.5 truncate select-all text-muted-foreground">
                    {endpointUrl}
                </code>
                <button
                    onClick={copyToClipboard}
                    className="p-2 bg-background border border-border hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                    title={t("copyUrl")}
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
                {t("sendPostRequest")}
            </p>
            
            <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    {t("dynamicUrlInfo")}
                </p>
            </div>
        </div>

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

      <div className="h-px bg-border/60 w-full" />

      {/* SECTION 3: Action Flow Information */}
      <div className="space-y-6">
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Action Flow Information
            </h3>
            <p className="text-xs text-muted-foreground">
                Define how this instance appears in the Action Flow dashboard.
            </p>
        </div>
        
        {/* Validation Helper Logic */}
        {(() => {
            // Note: We use the hook for validation now.
            // We need access to nodes/edges which are not prop-drilled, so we use store + reactflow context
            const { nodes } = useFlowStore();
            // We need to pass the CURRENT node ID. 
            // Since this component is finding the api-trigger, we assume the selected node IS the api-trigger or we find it.
            // The prop 'data' is passed, but we need the ID. 
            // Let's assume the parent passes the node ID or we find the trigger node.
            const triggerNode = nodes.find(n => n.type === 'api-trigger');
            const nodeId = triggerNode?.id || 'trigger'; // Fallback

            return (
                <div className="space-y-5">
                    {/* Title Template */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Action Flow Title Template <span className="text-red-500">*</span>
                        </label>
                        <ValidatedInput 
                            nodeId={nodeId}
                            value={data.instanceNameTemplate || ''}
                            onChange={(e) => onUpdate({ ...data, instanceNameTemplate: e.target.value })}
                            placeholder="e.g. Driver At Risk {{ steps.trigger.body.driver_code }}"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Name the running instance dynamically using variables.
                        </p>
                    </div>

                    {/* Default Priority */}
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Default Priority
                        </label>
                        <select
                            value={data.defaultPriority || 'medium'}
                            onChange={(e) => onUpdate({ ...data, defaultPriority: e.target.value })}
                            className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Priority to assign if not specified in API payload.
                        </p>
                    </div>

                    {/* Default Assignees */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Default Assignees
                        </label>
                        <AssigneeSelector
                            selected={data.assignments || []}
                            onSelect={(newAssignees) => onUpdate({ ...data, assignments: newAssignees })}
                            orgSlug={params?.slug as string}
                        />
                         <p className="text-[10px] text-muted-foreground mt-1">
                            Users/Teams to assign if not specified in API payload.
                        </p>
                    </div>

                    
                    {/* Information (Description) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Information <span className="text-red-500">*</span>
                        </label>
                        <ValidatedTextarea
                            nodeId={nodeId}
                            value={data.instanceDescriptionTemplate || ''}
                            onChange={(e) => onUpdate({ ...data, instanceDescriptionTemplate: e.target.value })}
                            placeholder="Provide detailed instructions or context for this action flow..."
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Additional Fields */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
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
                                className="text-xs flex items-center gap-1.5 text-primary hover:text-primary/80 hover:bg-primary/5 px-2 py-1 rounded-md transition-colors font-medium disabled:opacity-50"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Field
                            </button>
                        </div>

                        <div className="space-y-2">
                            {(!data.infoFields || data.infoFields.length === 0) ? (
                                <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                                    <p className="text-xs text-muted-foreground">No additional fields configured.</p>
                                </div>
                            ) : (
                                data.infoFields.map((field: any, index: number) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-start gap-2 group">
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
                                                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all hover:border-accent-foreground/50"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <ValidatedInput
                                                    nodeId={nodeId}
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const newFields = [...data.infoFields];
                                                        newFields[index] = { ...field, value: e.target.value };
                                                        onUpdate({ ...data, infoFields: newFields });
                                                    }}
                                                    placeholder="Value"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newFields = data.infoFields.filter((_: any, i: number) => i !== index);
                                                    onUpdate({ ...data, infoFields: newFields });
                                                }}
                                                className="h-9 w-9 flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
            );
        })()}
      </div>
    </div>
  );
}
