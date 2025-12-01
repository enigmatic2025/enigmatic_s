"use client";

import { useEffect, useState } from "react";
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

interface HttpRequestConfigProps {
  data: any;
  onUpdate: (newData: any) => void;
}

export function HttpRequestConfig({ data, onUpdate }: HttpRequestConfigProps) {
  const [formData, setFormData] = useState<any>(data || {});

  // Sync local state when prop data changes (e.g. switching nodes)
  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Method</Label>
        <Select
          value={formData.method || "GET"}
          onValueChange={(val) => handleChange("method", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          placeholder="https://api.example.com/v1/resource"
          value={formData.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
        />
      </div>

      <KeyValueList
        title="Query Params"
        initialData={formData.params}
        onUpdate={(data) => handleChange("params", data)}
      />

      <KeyValueList
        title="Headers"
        initialData={typeof formData.headers === 'string' ? {} : formData.headers}
        onUpdate={(data) => handleChange("headers", data)}
      />

      <div className="space-y-2">
        <Label>Body (JSON)</Label>
        <Textarea
          placeholder='{ "key": "value" }'
          className="font-mono text-xs"
          rows={8}
          value={
            typeof formData.body === "string"
              ? formData.body
              : JSON.stringify(formData.body || {}, null, 2)
          }
          onChange={(e) => handleChange("body", e.target.value)}
        />
      </div>
    </div>
  );
}
