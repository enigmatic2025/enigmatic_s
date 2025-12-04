import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateSchema } from "@/lib/schema-generator";
import { useState } from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

export function ParseNodeConfig({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const [samplePayload, setSamplePayload] = useState("");

  const handleGenerateSchema = () => {
    try {
      if (!samplePayload) {
        toast.error("Please enter a sample payload");
        return;
      }
      const json = JSON.parse(samplePayload);
      const schema = generateSchema(json);
      onUpdate({ ...data, schema: JSON.stringify(schema, null, 2) });
      toast.success("Schema generated successfully");
    } catch (e) {
      toast.error("Invalid JSON in sample payload");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          This node will parse the JSON content from the previous step (e.g., HTTP Response Body).
        </p>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          <Label>Generate Schema from Sample</Label>
          <Textarea
            placeholder="Paste a sample JSON payload here..."
            value={samplePayload}
            onChange={(e) => setSamplePayload(e.target.value)}
            rows={4}
            className="font-mono text-xs"
          />
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateSchema}
            className="w-full"
          >
            Generate Schema
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Schema</Label>
          <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-950">
            <Editor
              value={data.schema || ""}
              onValueChange={(code) => onUpdate({ ...data, schema: code, format: "JSON" })}
              highlight={code => highlight(code, languages.json, 'json')}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                backgroundColor: 'transparent',
                color: '#f8f8f2',
                minHeight: '100px',
              }}
              className="min-h-[100px]"
              textareaClassName="focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            This schema describes the output structure.
          </p>
        </div>
      </div>
    </div>
  );
}
