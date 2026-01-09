import { useFlowStore } from "@/lib/stores/flow-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                                    <pre className="mt-2 text-sm text-slate-300 bg-black/40 p-3 rounded-md overflow-x-hidden whitespace-pre-wrap break-all border border-white/5">
                                        {typeof log.details === 'string' 
                                            ? log.details 
                                            : JSON.stringify(log.details, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
