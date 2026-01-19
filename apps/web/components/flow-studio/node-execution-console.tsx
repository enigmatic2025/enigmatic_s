import { ChevronDown, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface NodeExecutionConsoleProps {
  testResult: any;
  isVisible: boolean;
  onClose: () => void;
}

export function NodeExecutionConsole({ 
  testResult, 
  isVisible, 
  onClose 
}: NodeExecutionConsoleProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syntaxTheme = mounted && resolvedTheme === 'light' ? ghcolors : vscDarkPlus;

  if (!testResult || !isVisible) return null;

  return (
    <div className="flex-none border-t bg-muted/10 flex flex-col h-[300px] shadow-inner transition-all w-full">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm select-none">
        <div className="flex items-center gap-2" onClick={onClose}>
          <ChevronDown className="h-4 w-4 cursor-pointer hover:text-primary" />
          <span className="text-xs font-semibold flex items-center gap-2">
            Step Output
            {testResult.Error ? (
              <span className="text-destructive flex items-center gap-1 font-normal bg-destructive/10 px-1.5 rounded-sm">
                <CheckCircle2 className="h-3 w-3 rotate-45" /> Failed
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-500 flex items-center gap-1 font-normal bg-green-500/10 px-1.5 rounded-sm">
                <CheckCircle2 className="h-3 w-3"/> Success
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
              toast.success("Copied to clipboard");
            }}
            title="Copy JSON"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
                     
      {/* Independent Scrollable Console Area */}
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
            overflow: 'visible', // Ensure parent handles scrolling
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
          {JSON.stringify(testResult.Output || testResult, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
