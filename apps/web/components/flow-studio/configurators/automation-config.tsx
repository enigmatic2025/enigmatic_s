import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Info, Copy, Check, Braces, ChevronDown, Webhook, Globe, Code } from 'lucide-react';
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

const TYPE_DEFAULTS: Record<string, any> = {
  string: '"..."',
  number: '0',
  boolean: 'true',
  object: '{}',
  array: '[]',
};

export function AutomationConfig({ nodeId, flowId, data, onUpdate }: AutomationConfigProps) {
  const t = useTranslations("ConfigDrawer.automation");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    (data.correlations?.length > 0) || !!data.eventName
  );

  const schema: SchemaField[] = data.schema || [];

  // Use site origin for webhook URLs — Next.js rewrites proxy /api/* to the backend
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://enigmatic.works';

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Build example payload from schema
  const buildExamplePayload = () => {
    if (schema.length === 0) return '{\n  "your_field": "your_value"\n}';
    const lines = schema.map((f) => `  "${f.key}": ${TYPE_DEFAULTS[f.type] || '"..."'}`);
    return `{\n${lines.join(',\n')}\n}`;
  };

  // Build curl example
  const buildCurlExample = () => {
    const payload = buildExamplePayload();
    return `curl -X POST ${siteUrl}/api/webhooks/{token} \\\n  -H "Content-Type: application/json" \\\n  -d '${payload}'`;
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
    const newSchema = schema.filter((_: SchemaField, i: number) => i !== index);
    onUpdate({ ...data, schema: newSchema });
  };

  return (
    <div className="space-y-6">

      {/* ─── Section 1: Label & Description ─── */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Label</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdate({ ...data, label: e.target.value })}
            placeholder={t("stepNamePlaceholder")}
            className="w-full bg-background border border-input rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-primary outline-none transition-all hover:border-accent-foreground/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Description</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onUpdate({ ...data, description: e.target.value })}
            placeholder={t("descriptionPlaceholder")}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-20 resize-none focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="h-px bg-border/60 w-full" />

      {/* ─── Section 2: Webhook URL ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Webhook URL</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          A unique webhook URL is generated <strong>each time this flow runs</strong>.
          External systems POST data to this URL to resume the flow. No authentication
          or IDs required — the URL itself is the key.
        </p>

        {/* URL format */}
        <div className="p-3 bg-muted/30 rounded-md border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Endpoint Format</span>
            <button
              onClick={() => copyText(`${siteUrl}/api/webhooks/{token}`, setCopiedUrl)}
              className="text-[10px] flex items-center gap-1 text-primary hover:underline"
            >
              {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>
          <code className="block text-[11px] font-mono bg-background border border-border rounded px-2.5 py-2 text-foreground">
            <span className="text-emerald-600 dark:text-emerald-400">POST</span>{' '}
            {siteUrl}/api/webhooks/<span className="text-primary">{'{token}'}</span>
          </code>
        </div>

        {/* How to access */}
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-primary/5 border border-primary/10">
          <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <p>Access the generated URL in downstream steps:</p>
            <code className="text-[10px] font-mono text-primary mt-1 block">
              {'{{ steps.'}{nodeId}{'.output.webhook_url }}'}
            </code>
            <p className="mt-1.5">
              Use this in an HTTP Request or Email node to send the URL to the external system.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/60 w-full" />

      {/* ─── Section 3: Expected Payload ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-medium">{t("expectedPayload")}</label>
          </div>
          <button
            onClick={handleAddField}
            className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1.5 rounded-md transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("addField")}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Define what data the external system should send. These fields become available to downstream steps.
        </p>

        <div className="space-y-2.5">
          {schema.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10">
              <p className="text-sm text-foreground font-medium mb-1">{t("noSchemaTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("noSchemaDescription")}</p>
            </div>
          ) : (
            schema.map((field: SchemaField, index: number) => (
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
                    onChange={(e) => handleUpdateField(index, { type: e.target.value as SchemaField['type'] })}
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

        {/* Live payload example */}
        <div className="p-3 bg-muted/30 rounded-md border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Example Payload</span>
            <button
              onClick={() => copyText(buildCurlExample(), setCopiedPayload)}
              className="text-[10px] flex items-center gap-1 text-primary hover:underline"
            >
              {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy cURL
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-background border border-border rounded px-2.5 py-2 text-muted-foreground overflow-x-auto">
            {buildExamplePayload()}
          </pre>
        </div>
      </div>

      <div className="h-px bg-border/60 w-full" />

      {/* ─── Section 4: Advanced — Correlation Rules ─── */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 w-full text-left py-1 group"
        >
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAdvanced ? '' : '-rotate-90'}`} />
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Advanced: Correlation Matching
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              For broadcast-style signals via <code className="text-[10px] font-mono bg-muted px-1 rounded">/api/automation/signal</code>.
              Use this when multiple flow instances listen for the same event type (e.g., &ldquo;OrderPaid&rdquo;)
              and you need to match the right one. <strong>All</strong> conditions must match for the flow to resume.
            </p>

            {/* Event Name (node-level) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block flex items-center gap-1">
                Event Name
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                    <TooltipContent>The event type to listen for (e.g., &ldquo;OrderPaid&rdquo;). Defaults to &ldquo;default&rdquo;.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <input
                type="text"
                value={data.eventName || ''}
                onChange={(e) => onUpdate({ ...data, eventName: e.target.value })}
                placeholder="default"
                className="w-full bg-background border border-input rounded px-2 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>

            {/* Criteria key-value pairs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  Match Criteria (AND)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                      <TooltipContent>All key-value pairs must match the incoming signal data.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <button
                  onClick={() => {
                    const list = data.correlations || [];
                    onUpdate({ ...data, correlations: [...list, { key: '', value: '' }] });
                  }}
                  className="text-xs flex items-center gap-1 text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {(!data.correlations || data.correlations.length === 0) && (
                <p className="text-[11px] text-muted-foreground/70 italic py-2">
                  No criteria. The webhook URL approach above is recommended for most use cases.
                </p>
              )}

              {(data.correlations || []).map((rule: any, index: number) => (
                <div key={index} className="flex items-center gap-2 group">
                  <input
                    type="text"
                    value={rule.key || ''}
                    onChange={(e) => {
                      const list = [...(data.correlations || [])];
                      list[index] = { ...list[index], key: e.target.value };
                      onUpdate({ ...data, correlations: list });
                    }}
                    placeholder="e.g. order_id"
                    className="flex-1 bg-background border border-input rounded px-2 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">=</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={rule.value || ''}
                      onChange={(e) => {
                        const list = [...(data.correlations || [])];
                        list[index] = { ...list[index], value: e.target.value };
                        onUpdate({ ...data, correlations: list });
                      }}
                      placeholder="{{ steps.X.output.id }}"
                      className="w-full bg-background border border-input rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-primary pr-6"
                    />
                    <Braces className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  </div>
                  <button
                    onClick={() => {
                      const list = [...(data.correlations || [])];
                      list.splice(index, 1);
                      onUpdate({ ...data, correlations: list });
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Correlation signal example */}
            {(data.correlations?.length > 0) && (
              <div className="p-3 bg-muted/20 rounded-md border border-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Signal Payload Example</span>
                <pre className="text-[11px] font-mono bg-background border border-border rounded px-2.5 py-2 text-muted-foreground overflow-x-auto">
{`{
  "event": "${data.eventName || 'default'}",
  "data": {
${(data.correlations || []).filter((r: any) => r.key).map((r: any) => `    "${r.key}": "..."`).join(',\n')}
  }
}`}
                </pre>
                <p className="text-[10px] text-muted-foreground">
                  Send to <code className="font-mono bg-muted px-1 rounded">POST /api/automation/signal</code> with an Authorization header.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
