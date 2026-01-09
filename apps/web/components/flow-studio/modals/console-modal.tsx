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
import { Eraser, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsoleModal({ isOpen, onClose }: ConsoleModalProps) {
  const { clearLogs, logs } = useFlowStore((state) => ({ 
    clearLogs: state.clearLogs,
    logs: state.logs 
  }));

  const handleClear = () => {
      clearLogs();
      toast.success("Console cleared");
  };
   
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 overflow-hidden rounded-xl sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-mono flex items-center gap-2">
            Execution Console
          </DialogTitle>
          <div className="flex items-center gap-1">
              <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleClear}
                        className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Clear Console</TooltipContent>
                  </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />

              <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onClose()}
                        className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Close</TooltipContent>
                  </Tooltip>
              </TooltipProvider>
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
