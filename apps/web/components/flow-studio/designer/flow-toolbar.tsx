"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Square, Trash, Wand2, Rocket, Terminal, Loader2, Eraser } from "lucide-react";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FlowToolbarProps {
  flowId?: string;
  flowName: string;
  setFlowName: (name: string) => void;
  publishStatus: 'draft' | 'published' | 'changed';
  isConsoleOpen: boolean;
  setIsConsoleOpen: (open: boolean) => void;
  unreadLogs: boolean;
  isPolling: boolean;
  currentRun: any;
  onPlayClick: () => void;
  handleStop: () => void;
  handleSave: () => void;
  handlePublish: () => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  onLayout: (direction: string) => void;
  onClearTestResults: () => void;
}

export function FlowToolbar({
  flowId,
  flowName,
  setFlowName,
  publishStatus,
  isConsoleOpen,
  setIsConsoleOpen,
  unreadLogs,
  isPolling,
  currentRun,
  onPlayClick,
  handleStop,
  handleSave,
  handlePublish,
  setIsDeleteModalOpen,
  onLayout,
  onClearTestResults,
}: FlowToolbarProps) {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("FlowDesigner");
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (flowName.trim() === "") {
      setFlowName(t("toolbar.untitled"));
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    }
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4 z-10 relative">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/nodal/${params.slug}/dashboard/flow-studio`)
          }
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          {isEditingName ? (
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="text-sm font-semibold bg-transparent border-b border-primary outline-none px-1 w-[300px]"
            />
          ) : (
            <h2 
              className="text-sm font-semibold cursor-text hover:underline decoration-dashed underline-offset-4 w-[300px] truncate"
              onDoubleClick={() => setIsEditingName(true)}
              title={t("toolbar.renamePlaceholder")}
            >
              {flowName}
            </h2>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {flowId ? t("toolbar.lastSaved") : t("toolbar.unsavedChanges")}
            </span>
            
            {publishStatus === 'published' && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />
                {t("status.published")}
              </Badge>
            )}
            {publishStatus === 'changed' && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20 gap-1">
                <span className="w-1 h-1 rounded-full bg-yellow-500 inline-block" />
                {t("status.unpublishedChanges")}
              </Badge>
            )}
            {publishStatus === 'draft' && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20">
                {t("status.draft")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => onLayout('LR')}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.magicOrganize")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={onClearTestResults}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.clearTestResults")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 transition-all duration-300 relative ${
                  isConsoleOpen 
                    ? 'text-primary bg-primary/10' 
                    : unreadLogs 
                      ? 'text-green-500 bg-green-500/10 animate-pulse' 
                      : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsConsoleOpen(true)}
              >
                <Terminal className="h-4 w-4" />
                {unreadLogs && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{unreadLogs ? t("tooltips.newLogsAvailable") : t("tooltips.openConsole")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 transition-colors ${isPolling ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={isPolling ? handleStop : onPlayClick}
                disabled={isPolling && !currentRun}
              >
                {isPolling ? (
                  currentRun ? <Square className="h-4 w-4 fill-current" /> : <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPolling ? t("tooltips.stopExecution") : t("tooltips.runFlow")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltips.saveDraft")}</p>
            </TooltipContent>
          </Tooltip>

          {flowId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePublish}
                >
                  <Rocket className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltips.publishToProduction")}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {flowId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltips.deleteFlow")}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
