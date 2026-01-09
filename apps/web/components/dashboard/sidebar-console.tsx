import { useFlowStore } from "@/lib/stores/flow-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, AlertCircle, CheckCircle, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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
            className="h-6 w-6 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 shadow-sm"
            onClick={handleCopy}
            title="Copy output"
        >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
        </Button>
    );
}

export function SidebarConsole() {
    const logs = useFlowStore((state) => state.logs);

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-mono text-base">
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {logs.length === 0 && (
                        <div className="text-center text-slate-600 mt-10 italic">
                            No logs yet...
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 font-mono border-b border-white/5 pb-4 last:border-0">
                            <span className="text-slate-500 shrink-0 select-none w-24 pt-0.5 text-sm"> {/* Keep timestamp slightly smaller/cleaner */}
                                {log.timestamp && new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-1"> {/* items-start for multi-line text alignment */}
                                    {log.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
                                    {log.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />}
                                    {log.type === 'info' && <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />}
                                    <span className={`
                                        text-sm font-mono break-words whitespace-pre-wrap leading-relaxed
                                        ${log.type === 'error' ? 'text-red-300' : ''}
                                        ${log.type === 'success' ? 'text-green-300' : ''}
                                        ${log.type === 'warning' ? 'text-amber-300' : ''}
                                        ${log.type === 'info' ? 'text-slate-300' : ''}
                                    `}>
                                        {log.message}
                                    </span>
                                </div>
                                {log.details && (
                                    <div className="relative group mt-2">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <LogCopyButton content={typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)} />
                                        </div>
                                        <pre className="text-sm text-slate-300 bg-black/40 p-3 rounded-md overflow-x-hidden whitespace-pre-wrap break-all border border-white/5 font-mono">
                                            {typeof log.details === 'string' 
                                                ? log.details 
                                                : JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
