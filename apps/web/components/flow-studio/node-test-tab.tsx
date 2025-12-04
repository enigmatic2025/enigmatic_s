import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

interface NodeTestTabProps {
  selectedNode: any;
  testBody: string;
  setTestBody: (body: string) => void;
  testResult: any;
  isTesting: boolean;
}

export function NodeTestTab({
  selectedNode,
  testBody,
  setTestBody,
  testResult,
  isTesting,
}: NodeTestTabProps) {
  const [isTestBodyOpen, setIsTestBodyOpen] = useState(false);

  const subtype = selectedNode.data?.subtype;
  const isTestable = selectedNode.type !== 'schedule' && subtype !== 'parse' && subtype !== 'map';

  if (!isTestable) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 p-4 border rounded-md bg-muted/20">
        <p className="text-sm font-medium text-muted-foreground">No test available</p>
        <p className="text-xs text-muted-foreground">
          {selectedNode.type === 'schedule' 
            ? "Schedule triggers cannot be manually tested here."
            : "This node type cannot be manually tested in isolation."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md bg-muted/20">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsTestBodyOpen(!isTestBodyOpen)}
        >
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
              {isTestBodyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Test Configuration
            </h4>
            <p className="text-xs text-muted-foreground">
              Override input data for testing (Optional).
            </p>
          </div>
        </div>

        {isTestBodyOpen && (
          <div className="p-4 pt-0 space-y-2 border-t">
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    if (!testBody) return;
                    const parsed = JSON.parse(testBody);
                    setTestBody(JSON.stringify(parsed, null, 2));
                    toast.success("JSON formatted");
                  } catch (e) {
                    toast.error("Invalid JSON");
                  }
                }}
              >
                Prettify JSON
              </Button>
            </div>
            <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-950">
              <Editor
                value={testBody}
                onValueChange={setTestBody}
                highlight={code => highlight(code, languages.json, 'json')}
                padding={16}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  backgroundColor: 'transparent',
                  color: '#f8f8f2',
                  minHeight: '150px',
                }}
                className="min-h-[150px]"
                textareaClassName="focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {testResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Result</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
                toast.success("Result copied to clipboard");
              }}
              title="Copy Result"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="rounded-md overflow-hidden border bg-slate-950">
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                maxHeight: '300px',
              }}
              wrapLongLines={true}
            >
              {JSON.stringify(testResult, null, 2)}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}
