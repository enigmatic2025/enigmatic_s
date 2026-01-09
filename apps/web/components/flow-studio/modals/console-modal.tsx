
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SidebarConsole } from "@/components/dashboard/sidebar-console";
import { useFlowStore } from "@/lib/stores/flow-store";
import { Trash2, Copy, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsoleModal({ isOpen, onClose }: ConsoleModalProps) {
  const { clearLogs, logs } = useFlowStore((state) => ({ 
    clearLogs: state.clearLogs,
    logs: state.logs 
  }));

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const logText = logs.map(l => {
        let det = '';
        if (l.details) {
            det = typeof l.details === 'string' ? l.details : JSON.stringify(l.details, null, 2);
        }
        return `[${new Date(l.timestamp || 0).toLocaleTimeString()}] ${l.type.toUpperCase()}: ${l.message}\n${det}`;
    }).join('\n\n');

    navigator.clipboard.writeText(logText);
    setCopied(true);
    toast.success("Console output copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
   
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-slate-950 border-slate-800 text-slate-200 overflow-hidden rounded-xl sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b border-white/10 bg-slate-900/50 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-mono flex items-center gap-2">
            Execution Console
          </DialogTitle>
          <div className="flex items-center gap-2">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={handleCopy}
                title="Copy all logs"
             >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
             </Button>
             <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={clearLogs}
                title="Clear console"
             >
                <Trash2 className="h-4 w-4" />
             </Button>
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={onClose}
                title="Close console"
             >
                <X className="h-4 w-4" />
             </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
             {/* We can reuse the SidebarConsole logic but style it specifically for modal if needed. 
                 Since SidebarConsole is self-contained with useFlowStore, it works perfectly here. 
             */}
             <SidebarConsole />
        </div>
      </DialogContent>
    </Dialog>
  );
}
