import { ChevronDown, CheckCircle2, Copy, Clock, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";

interface NodeExecutionConsoleProps {
  testResult: any;
  isVisible: boolean;
  onClose: () => void;
}

function getStatusColor(code: number) {
  if (code >= 200 && code < 300) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (code >= 300 && code < 400) return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
  if (code >= 400 && code < 500) return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NodeExecutionConsole({
  testResult,
  isVisible,
  onClose
}: NodeExecutionConsoleProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  useEffect(() => {
    setMounted(true);
  }, []);

  const syntaxTheme = mounted && resolvedTheme === 'light' ? ghcolors : vscDarkPlus;

  // Extract HTTP-specific metadata from the result
  const httpMeta = useMemo(() => {
    if (!testResult) return null;
    const output = testResult.Output || testResult;
    const statusCode = output?.statusCode || output?.status_code || testResult?.StatusCode;
    const headers = output?.headers || output?.responseHeaders || testResult?.Headers;
    const duration = testResult?.Duration || output?.duration || output?.response_time;

    if (!statusCode && !headers && !duration) return null;

    return { statusCode, headers, duration };
  }, [testResult]);

  // Body content to display
  const bodyContent = useMemo(() => {
    if (!testResult) return '';
    const output = testResult.Output || testResult;
    // If the output has body/data nested, prefer that
    const body = output?.body || output?.data || output;
    return JSON.stringify(body, null, 2);
  }, [testResult]);

  const bodySize = useMemo(() => {
    return new Blob([bodyContent]).size;
  }, [bodyContent]);

  if (!testResult || !isVisible) return null;

  const hasError = !!testResult.Error;
  const statusCode = httpMeta?.statusCode;

  return (
    <div className="flex-none border-t bg-muted/10 flex flex-col h-[300px] shadow-inner transition-all w-full">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm select-none">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="hover:text-primary transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold flex items-center gap-2">
            Response
            {hasError ? (
              <span className="text-destructive flex items-center gap-1 font-normal bg-destructive/10 px-1.5 py-0.5 rounded-sm text-[10px]">
                Failed
              </span>
            ) : statusCode ? (
              <span className={`flex items-center gap-1 font-mono font-semibold px-1.5 py-0.5 rounded border text-[10px] ${getStatusColor(statusCode)}`}>
                {statusCode}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-normal bg-emerald-500/10 px-1.5 py-0.5 rounded-sm text-[10px]">
                <CheckCircle2 className="h-3 w-3"/> OK
              </span>
            )}
          </span>

          {/* HTTP Metadata Pills */}
          {httpMeta && (
            <div className="flex items-center gap-2 ml-2">
              {httpMeta.duration && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  {typeof httpMeta.duration === 'number' ? `${httpMeta.duration}ms` : httpMeta.duration}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <ArrowDownToLine className="h-3 w-3" />
                {formatBytes(bodySize)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Tabs (only show if we have headers) */}
          {httpMeta?.headers && (
            <div className="flex items-center border rounded-md mr-2 overflow-hidden">
              <button
                onClick={() => setActiveTab('body')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${activeTab === 'body' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors border-l ${activeTab === 'headers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Headers
              </button>
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              const content = activeTab === 'headers' && httpMeta?.headers
                ? JSON.stringify(httpMeta.headers, null, 2)
                : bodyContent;
              navigator.clipboard.writeText(content);
              toast.success("Copied", { duration: 1000 });
            }}
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Scrollable Console Area */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 w-full relative group">
        <SyntaxHighlighter
          language="json"
          style={syntaxTheme}
          className="!bg-transparent"
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '13px',
            lineHeight: '1.5',
            minHeight: '100%',
            overflow: 'visible',
          }}
          wrapLongLines={false}
          codeTagProps={{
            style: {
                whiteSpace: 'pre',
                wordBreak: 'normal',
                overflowWrap: 'normal'
            }
          }}
        >
          {activeTab === 'headers' && httpMeta?.headers
            ? JSON.stringify(httpMeta.headers, null, 2)
            : bodyContent
          }
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
