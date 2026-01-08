
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
import { Trash2 } from "lucide-react";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsoleModal({ isOpen, onClose }: ConsoleModalProps) {
  const clearLogs = useFlowStore((state) => state.clearLogs);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-slate-950 border-slate-800 text-slate-200 overflow-hidden rounded-xl sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b border-white/10 bg-slate-900/50 flex-none flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-mono flex items-center gap-2">
            Execution Console
          </DialogTitle>
          <div className="flex items-center gap-2 mr-8">
             <Button 
                variant="ghost" 
                size="sm"
                className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1"
                onClick={clearLogs}
             >
                <Trash2 className="h-3 w-3" />
                Clear
             </Button>
          </div>
           <DialogDescription className="sr-only">
            View execution logs and debug output
          </DialogDescription>
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
