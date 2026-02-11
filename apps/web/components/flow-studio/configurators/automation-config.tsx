import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Info, Copy, Check } from 'lucide-react';

interface AutomationConfigProps {
  nodeId: string;
  data: any;
  onUpdate: (data: any) => void;
}

interface SchemaField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

export function AutomationConfig({ nodeId, data, onUpdate }: AutomationConfigProps) {
  const t = useTranslations("ConfigDrawer.automation");
  const [copied, setCopied] = useState(false);
  
  // Default schema logic
  const schema: SchemaField[] = data.schema || [];

  // Resume URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const endpointUrl = `${baseUrl}/api/automation/resume`;

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

      {/* Resume Endpoint URL */}
      <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium">Resume Endpoint</span>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-background border border-border rounded-md px-3 py-2.5 truncate select-all text-muted-foreground">
                  POST {endpointUrl}
              </code>
              <button
                  onClick={copyToClipboard}
                  className="p-2 bg-background border border-border hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                  title="Copy URL"
              >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
              Send a POST request with the <code className="text-[10px] bg-muted px-1 py-0.5 rounded">action_id</code> and <code className="text-[10px] bg-muted px-1 py-0.5 rounded">output</code> payload to resume the flow.
          </p>
      </div>

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
