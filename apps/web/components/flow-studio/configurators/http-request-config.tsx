import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyValueList } from "./key-value-list";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface HttpRequestConfigProps {
  data: any;
  onUpdate: (newData: any) => void;
}

export function HttpRequestConfig({ data, onUpdate }: HttpRequestConfigProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const updateAuth = (field: string, value: string) => {
    onUpdate({
      ...data,
      auth: { ...(data.auth || {}), [field]: value },
    });
  };

  const method = data.method || "GET";
  const authType = data.auth?.type || "none";
  const hasBody = method !== "GET" && method !== "DELETE";

  return (
    <div className="space-y-6">
      {/* Method + URL inline */}
      <div className="space-y-2">
        <Label>Request</Label>
        <div className="flex gap-2">
          <Select
            value={method}
            onValueChange={(val) => handleChange("method", val)}
          >
            <SelectTrigger className="w-[120px] font-mono text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="https://api.example.com/v1/resource"
            value={data.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            className="font-mono text-xs"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Supports variable references, e.g. <code>{"{{ steps.trigger.body.url }}"}</code>
        </p>
      </div>

      {/* Authentication */}
      <div className="space-y-3">
        <Label>Authentication</Label>
        <Select
          value={authType}
          onValueChange={(val) => updateAuth("type", val)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
          </SelectContent>
        </Select>

        {authType === "bearer" && (
          <div className="space-y-2 pl-3 border-l-2 border-orange-500/30">
            <Label className="text-xs">Token</Label>
            <Input
              placeholder="sk-... or {{ variables.api_token }}"
              value={data.auth?.token || ""}
              onChange={(e) => updateAuth("token", e.target.value)}
              className="font-mono text-xs"
              type="password"
            />
          </div>
        )}

        {authType === "basic" && (
          <div className="space-y-2 pl-3 border-l-2 border-orange-500/30">
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input
                placeholder="username"
                value={data.auth?.username || ""}
                onChange={(e) => updateAuth("username", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input
                placeholder="password"
                value={data.auth?.password || ""}
                onChange={(e) => updateAuth("password", e.target.value)}
                className="font-mono text-xs"
                type="password"
              />
            </div>
          </div>
        )}

        {authType === "api-key" && (
          <div className="space-y-2 pl-3 border-l-2 border-orange-500/30">
            <div className="space-y-1">
              <Label className="text-xs">Header Name</Label>
              <Input
                placeholder="X-API-Key"
                value={data.auth?.headerName || ""}
                onChange={(e) => updateAuth("headerName", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">API Key</Label>
              <Input
                placeholder="key_... or {{ variables.api_key }}"
                value={data.auth?.apiKey || ""}
                onChange={(e) => updateAuth("apiKey", e.target.value)}
                className="font-mono text-xs"
                type="password"
              />
            </div>
          </div>
        )}
      </div>

      {/* Query Params */}
      <KeyValueList
        title="Query Params"
        initialData={data.params}
        onUpdate={(val) => handleChange("params", val)}
      />

      {/* Headers */}
      <KeyValueList
        title="Headers"
        initialData={typeof data.headers === "string" ? {} : data.headers}
        onUpdate={(val) => handleChange("headers", val)}
      />

      {/* Body - only for methods that support it */}
      {hasBody && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Body</Label>
            <Select
              value={data.contentType || "json"}
              onValueChange={(val) => handleChange("contentType", val)}
            >
              <SelectTrigger className="w-[160px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="form">Form URL-Encoded</SelectItem>
                <SelectItem value="raw">Raw Text</SelectItem>
                <SelectItem value="none">No Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.contentType || "json") === "json" && (
            <Textarea
              placeholder='{ "key": "value" }'
              className="font-mono text-xs"
              rows={6}
              value={
                typeof data.body === "string"
                  ? data.body
                  : JSON.stringify(data.body || {}, null, 2)
              }
              onChange={(e) => handleChange("body", e.target.value)}
            />
          )}

          {data.contentType === "form" && (
            <KeyValueList
              title="Form Fields"
              initialData={typeof data.formData === "object" ? data.formData : {}}
              onUpdate={(val) => handleChange("formData", val)}
            />
          )}

          {data.contentType === "raw" && (
            <Textarea
              placeholder="Raw request body..."
              className="font-mono text-xs"
              rows={6}
              value={data.body || ""}
              onChange={(e) => handleChange("body", e.target.value)}
            />
          )}
        </div>
      )}

      {/* Advanced Settings */}
      <div className="border rounded-md overflow-hidden">
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 w-full p-3 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {advancedOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Advanced Settings
        </button>
        {advancedOpen && (
          <div className="p-3 pt-0 space-y-4 border-t">
            <div className="space-y-2">
              <Label className="text-xs">Timeout (ms)</Label>
              <Input
                type="number"
                placeholder="30000"
                value={data.timeout || ""}
                onChange={(e) => handleChange("timeout", e.target.value ? Number(e.target.value) : undefined)}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Max wait time in milliseconds. Default: 30000 (30s).
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Retry on Failure</Label>
              <Select
                value={String(data.retryCount || 0)}
                onValueChange={(val) => handleChange("retryCount", Number(val))}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Retry</SelectItem>
                  <SelectItem value="1">1 Retry</SelectItem>
                  <SelectItem value="2">2 Retries</SelectItem>
                  <SelectItem value="3">3 Retries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
