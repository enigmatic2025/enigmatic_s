import { useFlowStore } from "@/lib/stores/flow-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertCircle, CheckCircle, Info, Copy, Check, ClipboardList, RadioTower,
    Workflow, AlertTriangle, Globe, GitBranch, Repeat, Variable, Filter,
    Mail, FileCode, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const NODE_TYPE_META: Record<string, { label: string; icon: typeof Workflow; color: string }> = {
    'human-task': { label: 'Task', icon: ClipboardList, color: 'text-teal-500' },
    'automation': { label: 'Event', icon: RadioTower, color: 'text-pink-500' },
    'action': { label: 'HTTP', icon: Globe, color: 'text-blue-500' },
    'http': { label: 'HTTP', icon: Globe, color: 'text-blue-500' },
    'condition': { label: 'Condition', icon: GitBranch, color: 'text-amber-500' },
    'switch': { label: 'Switch', icon: GitBranch, color: 'text-purple-500' },
    'loop': { label: 'Loop', icon: Repeat, color: 'text-orange-500' },
    'variable': { label: 'Variable', icon: Variable, color: 'text-cyan-500' },
    'set': { label: 'Variable', icon: Variable, color: 'text-cyan-500' },
    'filter': { label: 'Filter', icon: Filter, color: 'text-indigo-500' },
    'map': { label: 'Map', icon: Workflow, color: 'text-violet-500' },
    'parse': { label: 'Parse', icon: FileCode, color: 'text-emerald-500' },
    'email': { label: 'Email', icon: Mail, color: 'text-sky-500' },
    'goto': { label: 'Goto', icon: ArrowRight, color: 'text-rose-500' },
};

// Override syntax theme backgrounds to be transparent so our container bg shows through
const neutralSyntaxTheme: Record<string, React.CSSProperties> = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
        ...(vscDarkPlus['pre[class*="language-"]'] || {}),
        background: 'transparent',
    },
    'code[class*="language-"]': {
        ...(vscDarkPlus['code[class*="language-"]'] || {}),
        background: 'transparent',
    },
};

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
            className="h-6 w-6 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border shadow-sm"
            onClick={handleCopy}
            title="Copy output"
        >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </Button>
    );
}

const LOG_ICONS: Record<string, { icon: typeof Info; color: string }> = {
    'error': { icon: AlertCircle, color: 'text-red-500' },
    'success': { icon: CheckCircle, color: 'text-emerald-500' },
    'warning': { icon: AlertTriangle, color: 'text-amber-500' },
    'info': { icon: Info, color: 'text-muted-foreground' },
};

const LOG_TEXT_COLORS: Record<string, string> = {
    'error': 'text-red-400',
    'success': 'text-emerald-400',
    'warning': 'text-amber-400',
    'info': 'text-foreground',
};

export function SidebarConsole() {
    const logs = useFlowStore((state) => state.logs);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (scrollRef.current) {
            const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (el) el.scrollTop = el.scrollHeight;
        }
    }, [logs.length]);

    return (
        <div ref={scrollRef} className="flex flex-col h-full bg-background text-foreground font-mono text-base transition-colors duration-200">
            <ScrollArea className="flex-1 p-5">
                <div className="space-y-3">
                    {logs.length === 0 && (
                        <div className="text-center text-muted-foreground/50 mt-10 italic text-sm">
                            No logs yet...
                        </div>
                    )}
                    {logs.map((log, i) => {
                        const logMeta = LOG_ICONS[log.type] || LOG_ICONS['info'];
                        const LogIcon = logMeta.icon;
                        const textColor = LOG_TEXT_COLORS[log.type] || LOG_TEXT_COLORS['info'];
                        const nodeMeta = log.nodeType ? NODE_TYPE_META[log.nodeType] : null;
                        const NodeIcon = nodeMeta?.icon;

                        return (
                            <div key={log.id || i} className="flex flex-col font-mono border-b border-border/50 pb-3 last:border-0 text-sm">
                                <div className="flex gap-3 items-start mb-1.5">
                                    <span className="text-muted-foreground/60 shrink-0 select-none text-xs tabular-nums pt-0.5 w-20">
                                        {log.timestamp && new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <div className="flex-1 min-w-0 flex items-start gap-2.5">
                                        <LogIcon className={`h-4 w-4 shrink-0 mt-0.5 ${logMeta.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`font-mono wrap-break-word whitespace-pre-wrap leading-relaxed text-[13px] ${textColor}`}>
                                                    {log.message}
                                                </span>
                                                {nodeMeta && NodeIcon && (
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal shrink-0 gap-1 border-border/60">
                                                        <NodeIcon className={`w-2.5 h-2.5 ${nodeMeta.color}`} />
                                                        {nodeMeta.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {log.details && (
                                    <div className="ml-26.5 relative group w-auto rounded-md border border-border/60 bg-muted/30 overflow-hidden">
                                        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <LogCopyButton content={typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)} />
                                        </div>
                                        <div className="w-full grid">
                                            <SyntaxHighlighter
                                                language="json"
                                                style={neutralSyntaxTheme}
                                                className="bg-transparent!"
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '12px',
                                                    lineHeight: '1.5',
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
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
