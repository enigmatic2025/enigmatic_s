
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, MoreHorizontal, Check, Copy, Clock, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import DashboardLoading from "../../loading"; 

interface ActionFlowDetail {
  id: string;
  flow_id: string;
  flow_name: string;
  title: string;
  status: string;
  temporal_workflow_id: string;
  started_at: string;
  input_data: any;
  output: any;
  activities: any[];
}

export default function ActionFlowDetailPage() {
  const { slug, flowId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ActionFlowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (flowId) {
        fetchDetails();
    }
  }, [flowId]);

  const fetchDetails = async () => {
    try {
        setLoading(true);
        const res = await flowService.getActionFlow(flowId as string);
        setData(res);
    } catch (e) {
        toast.error("Failed to load details");
    } finally {
        setLoading(false);
    }
  };

  const copyId = () => {
     if (data?.id) {
         navigator.clipboard.writeText(data.id);
         setCopiedId(true);
         setTimeout(() => setCopiedId(false), 2000);
         toast.success("Action Flow ID copied");
     }
  };

  if (loading) return <DashboardLoading />;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Action Flow not found</div>;

  const isSuccess = data.status === "COMPLETED";
  const isFailed = data.status === "FAILED";
  const isRunning = data.status === "RUNNING";

  const currentAction = data.activities?.find(a => a.status === 'RUNNING') || data.activities?.[data.activities?.length - 1];
  const lastUpdate = currentAction?.started_at || data.started_at;

  return (
    <div className="flex flex-col h-full w-full bg-muted/5 p-6 gap-6 overflow-hidden">
      
      {/* Top Header Area */}
      <div className="flex items-start justify-between shrink-0">
          <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 -ml-2 text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Flows
              </Button>
              
              <div className="space-y-1">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {data.title || data.flow_name || "Untitled Action Flow"}
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{data.id}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{new Date(data.started_at).toLocaleDateString()}</span>
                 </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${
                    isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                    isFailed ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-600'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        isSuccess ? 'bg-emerald-500' :
                        isFailed ? 'bg-red-500' :
                        'bg-blue-500'
                    }`} />
                    {data.status === "RUNNING" ? "In Progress" : data.status}
              </div>
               <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
               <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90">
                  Action
               </Button>
          </div>
      </div>


      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          
          {/* Left Column: Details Card */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="p-5 rounded-[24px] bg-white dark:bg-zinc-900 border border-border shadow-none space-y-6 h-full overflow-y-auto">
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold tracking-tight">Details</h2>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted -mr-2">
                              <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                      </div>
                      
                      {/* Description */}
                      <div className="space-y-1.5">
                           <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50">Description</label>
                           <p className="text-sm leading-snug text-foreground/90 font-medium">
                               {data.input_data?.description || "No description provided."}
                           </p>
                      </div>

                      {/* Horizontal Ribbon for Data Points - CLEAN STYLE */}
                      <div className="space-y-4">
                           <div className="flex items-center justify-between">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50">Data Points</label>
                           </div>
                           
                           <div className="flex overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide mask-fade-right">
                               {/* Render Inputs */}
                               {data.input_data?._info_fields?.map((field: any, i: number) => (
                                   <div key={i} className="flex-none flex flex-col justify-center gap-1.5 pr-8 mr-8 border-r border-border/40 last:border-0 last:mr-0 min-w-[120px]">
                                       <span className="text-[10px] uppercase font-bold text-muted-foreground/50 truncate w-full tracking-wide" title={field.label}>
                                           {field.label}
                                       </span>
                                       <span className="text-sm font-medium text-foreground w-full truncate" title={field.value}>
                                           {field.value}
                                       </span>
                                   </div>
                               ))}
                               
                               {(!data.input_data._info_fields || data.input_data._info_fields.length === 0) && (
                                   <div className="text-sm text-muted-foreground italic">
                                       No additional data.
                                   </div>
                               )}
                           </div>
                      </div>
                  </div>
              </div>
          </div>


          {/* Middle Column: Timeline & Pipeline (Expanded) */}
          <div className="col-span-9 grid grid-cols-3 gap-6 overflow-hidden h-full min-h-0">
               
               {/* LEFT COLUMN: Pipeline + Timeline */}
               <div className="col-span-2 flex flex-col gap-4 h-full overflow-hidden min-h-0">
                   

                   

                    {/* Progress Pipeline Bar */}
                    <div className="w-full rounded-[20px] bg-white dark:bg-zinc-900 border border-border shadow-none shrink-0 overflow-hidden flex h-16 p-2">
                        <div className="flex-1 flex h-full w-full rounded-[14px] overflow-hidden gap-1">
                            {/* Map Activities to Segments */}
                            {(() => {
                                const allActivities = [...(data.activities || [])];
                                const hasActivities = allActivities.length > 0;
                                
                                // Calculate Durations for Proportional Sizing
                                const activitiesWithDuration = allActivities.map((act, idx) => {
                                    const start = new Date(act.started_at).getTime();
                                    let end = new Date().getTime(); 
                                    
                                    if (allActivities[idx + 1]) {
                                        end = new Date(allActivities[idx+1].started_at).getTime();
                                    } else if (act.status === 'COMPLETED') {
                                        end = start + (15 * 60 * 1000); 
                                    }
                                    
                                    let durationMs = Math.max(end - start, 60000); 
                                    return { ...act, durationMs };
                                });

                                const pendingWeight = 300000; 

                                return allActivities.map((act, idx) => {
                                    const isDone = act.status === 'COMPLETED';
                                    const isRunning = act.status === 'RUNNING';
                                    const isPending = !isDone && !isRunning;

                                    let durationDisplay = "";
                                    let computedWeight = pendingWeight;

                                    if (!isPending) {
                                        const ad = activitiesWithDuration[idx];
                                        computedWeight = ad ? ad.durationMs : pendingWeight;
                                        
                                        const diffMins = Math.floor(computedWeight / 60000);
                                         if (diffMins < 1) durationDisplay = "< 1m";
                                        else if (diffMins < 60) durationDisplay = `${diffMins}m`;
                                        else durationDisplay = `${Math.floor(diffMins/60)}h ${diffMins%60}m`;
                                    }

                                    // Colors
                                    const activeBg = isPending ? 'bg-muted/30' : (isDone ? 'bg-emerald-500' : 'bg-blue-500'); 
                                    const textColor = isPending ? 'text-muted-foreground' : 'text-white';

                                    const flexStyle = { flex: `${computedWeight} 1 0%` };
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            style={flexStyle}
                                            className={`h-full flex flex-col justify-center items-center p-2 relative rounded-xl transition-all duration-500 ${activeBg}`}
                                        >
                                           <div className={`flex flex-col items-center gap-0.5 text-center w-full truncate px-1`}>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <span className={`text-[10px] font-bold leading-tight truncate ${textColor}`}>
                                                        {act.name}
                                                    </span>
                                                    {isDone && <Check className="w-3 h-3 text-white/90" />}
                                                    {isRunning && <Clock className="w-3 h-3 text-white/90 animate-spin" />}
                                                </div>
                                                
                                                {durationDisplay && (
                                                    <span className={`text-[9px] font-medium opacity-80 ${textColor}`}>
                                                        {durationDisplay}
                                                    </span>
                                                )}
                                           </div>
                                        </div>
                                    );
                                });
                            })()}
                             
                             {(!data.activities || data.activities.length < 5) && (
                                <div className="flex-[0.5] h-full bg-muted/10 rounded-xl flex items-center justify-center">
                                    <span className="text-[9px] text-muted-foreground/40">...</span>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Activity Timeline Card */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-[24px] border border-border shadow-none overflow-hidden min-h-0">
                        <div className="p-6 pb-4 border-b border-border/40">
                             <div className="flex items-center justify-between">
                                 <h2 className="text-base font-bold">Activity Timeline</h2>
                                 <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2">
                                    View Logs
                                 </Button>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
                            {/* Left Pane: Timeline List */}
                            <div className="flex-1 overflow-y-auto p-6 pt-4">
                                <div className="relative border-l-2 border-muted/50 pl-6 ml-3 space-y-8">
                                    {data.activities?.map((activity, i) => (
                                        <div key={i} className="relative group">
                                            <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-background ring-1 ring-border/20 ${
                                                activity.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                activity.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                                                'bg-muted'
                                            }`} />
                                            
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors">
                                                        {activity.name || "System Event"}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {new Date(activity.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                
                                                <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs text-foreground/80 leading-relaxed hover:bg-muted/30 transition-colors cursor-pointer">
                                                    {activity.type === 'human_action' ? (
                                                        <div className="flex items-start gap-2.5">
                                                            <Avatar className="w-5 h-5 mt-0.5 rounded-md">
                                                                <AvatarFallback className="text-[8px] rounded-md bg-background border">H</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p>Human Action Required: Check updated driver parameters.</p>
                                                                {activity.status === 'RUNNING' && (
                                                                    <Button size="sm" className="mt-2 h-6 text-[10px] bg-foreground text-background hover:bg-foreground/80 px-3">
                                                                        Respond
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>System processed updated variables.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             {/* Right Pane: User Comments */}
                             <div className="w-[300px] border-l border-border/40 bg-muted/5 flex flex-col">
                                <div className="p-4 border-b border-border/40">
                                    <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                        User Comments
                                    </h3>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                     <div className="text-[11px] p-3 rounded-lg bg-white border border-border/40 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                            <span className="font-semibold text-foreground">Sarah Admin</span>
                                            <span className="text-[9px] text-muted-foreground">10:42 AM</span>
                                        </div>
                                        <p className="text-muted-foreground/90 leading-relaxed">Checking compliance docs now. Will update status shortly.</p>
                                     </div>
                                      <div className="text-[11px] p-3 rounded-lg bg-white border border-border/40 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                            <span className="font-semibold text-foreground">Mike Ops</span>
                                            <span className="text-[9px] text-muted-foreground">10:45 AM</span>
                                        </div>
                                        <p className="text-muted-foreground/90 leading-relaxed">Noted, thanks Sarah.</p>
                                     </div>
                                </div>

                                <div className="p-3 border-t border-border/40 bg-white/50">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Add a note..." 
                                            className="w-full bg-white dark:bg-zinc-900 border border-border/50 rounded-lg pl-3 pr-8 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm"
                                        />
                                        <Button size="icon" variant="ghost" className="absolute right-1 top-0.5 h-7 w-7 text-indigo-500 rounded-md">
                                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
               </div>

               {/* RIGHT COLUMN: AI CHAT (Full Height) */}
               <div className="col-span-1 flex flex-col bg-white dark:bg-zinc-900 rounded-[24px] border border-border shadow-none overflow-hidden h-full">
                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                               {/* Sparkles Icon Replacement */}
                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 0 0 1-1.275-1.275L12 3Z"/></svg>
                            </div>
                            <h2 className="text-sm font-semibold">AI Assistant</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* AI Message */}
                        <div className="flex gap-3 max-w-[90%]">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] shrink-0 mt-0.5">
                                AI
                            </div>
                            <div className="space-y-1">
                                <div className="p-3 rounded-2xl rounded-tl-none bg-muted/20 border border-border/50 text-xs shadow-sm">
                                    <p className="leading-relaxed">
                                        I've analyzed the driver data. <strong>Phi Tran</strong> has flagged 3 critical risk factors in the last 24 hours. Recommended action: Verify documents immediately.
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground pl-1">Just now</span>
                            </div>
                        </div>
                        
                        {/* User Message Mock */}
                         <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
                            <Avatar className="w-6 h-6 mt-0.5">
                                <AvatarFallback className="text-[9px]">JD</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 text-right">
                                <div className="p-3 rounded-2xl rounded-tr-none bg-blue-500 text-white text-xs shadow-sm text-left">
                                    <p className="leading-relaxed">
                                        Can you highlight the specific risk factors?
                                    </p>
                                </div>
                                <span className="text-[10px] text-muted-foreground pr-1">2m ago</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border/40 bg-white dark:bg-zinc-900/50">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Ask about this flow..." 
                                className="w-full bg-muted/30 border border-border/50 rounded-xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm"
                            />
                            <Button size="icon" variant="ghost" className="absolute right-1.5 top-1.5 h-8 w-8 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Button>
                        </div>
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
}
