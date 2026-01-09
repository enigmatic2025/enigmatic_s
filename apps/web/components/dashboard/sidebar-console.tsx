import { useFlowStore } from "@/lib/stores/flow-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, AlertCircle, CheckCircle, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";

function LogCopyButton({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 shadow-sm"
            onClick={handleCopy}
            title="Copy output"
        >
            {copied ? <Check className="h-3 w-3 text-green-500 dark:text-green-400" /> : <Copy className="h-3 w-3" />}
        </Button>
    );
}

export function SidebarConsole() {
    const logs = useFlowStore((state) => state.logs);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Choose syntax highlighter theme based on current theme
    const syntaxTheme = mounted && resolvedTheme === 'light' ? ghcolors : vscDarkPlus;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono text-base transition-colors duration-200">
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {logs.length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-600 mt-10 italic">
                            No logs yet...
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex flex-col font-mono border-b border-slate-200 dark:border-white/5 pb-4 last:border-0 text-sm">
                            <div className="flex gap-4 items-start mb-2">
                                <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none w-24 pt-0.5">
                                    {log.timestamp && new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <div className="flex-1 min-w-0 flex items-start gap-3">
                                    {log.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />}
                                    {log.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />}
                                    {log.type === 'info' && <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />}
                                    <span className={`
                                        font-mono break-words whitespace-pre-wrap leading-relaxed
                                        ${log.type === 'error' ? 'text-red-600 dark:text-red-300' : ''}
                                        ${log.type === 'success' ? 'text-green-600 dark:text-green-300' : ''}
                                        ${log.type === 'warning' ? 'text-amber-600 dark:text-amber-300' : ''}
                                        ${log.type === 'info' ? 'text-slate-700 dark:text-slate-300' : ''}
                                    `}>
                                        {log.message}
                                    </span>
                                </div>
                            </div>
                            
                            {log.details && (
                                <div className="relative group w-full rounded-md border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
                                    <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <LogCopyButton content={typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)} />
                                    </div>
                                    <div className="w-full grid"> 
                                        <SyntaxHighlighter
                                            language="json"
                                            style={syntaxTheme}
                                            customStyle={{
                                                margin: 0,
                                                padding: '1rem',
                                                fontSize: '13px',
                                                lineHeight: '1.5',
                                                background: 'transparent',
                                                minHeight: '100%',
                                                overflowX: 'auto',
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
                                            {typeof log.details === 'string' 
                                                ? log.details 
                                                : JSON.stringify(log.details, null, 2)}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
