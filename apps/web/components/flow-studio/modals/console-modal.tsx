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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-background border-border text-foreground overflow-hidden rounded-xl sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0">
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
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Clear Console</TooltipContent>
                  </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1" />

              <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onClose()}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
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
             <SidebarConsole />
        </div>
      </DialogContent>
    </Dialog>
  );
}
