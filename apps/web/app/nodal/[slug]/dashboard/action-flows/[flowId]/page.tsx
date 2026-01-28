"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, MoreHorizontal, Check, Clock, MousePointer2, AlertCircle, Info, Send, User, MessageSquare, LayoutGrid, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import DashboardLoading from "../../loading";
import { cn } from "@/lib/utils";

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

  const activitySegments = useMemo(() => {
    if (!data?.activities) return [];
    const allActivities = [...data.activities];
    
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

        return {
            ...act,
            computedWeight,
            durationDisplay,
            isDone,
            isRunning,
            isPending
        };
    });
  }, [data]);


  if (loading) return <DashboardLoading />;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Action Flow not found</div>;

  const isSuccess = data.status === "COMPLETED";
  const isFailed = data.status === "FAILED";

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black p-6 gap-5 overflow-hidden font-sans transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between shrink-0">
          <div className="space-y-4 max-w-3xl">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors group"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
                <span>Back to Flows</span>
              </Button>
              
              <div className="space-y-2">
                 <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {data.title || data.flow_name || "Untitled Action Flow"}
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-[10px] tracking-wider uppercase opacity-70">{data.id}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="font-medium">{new Date(data.started_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                 </div>
                 
                 {/* MOVED DESCRIPTION HERE */}
                 {data.input_data?.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed pt-1 max-w-2xl">
                        {data.input_data.description}
                    </p>
                 )}
              </div>
          </div>

          <div className="flex items-center gap-4">
               {/* STATUS BADGE - MONOCHROME */}
               <div className={cn(
                   "pl-1.5 pr-3 py-1 rounded-full border flex items-center gap-2 shadow-sm transition-all",
                   // Pure Black/White/Gray
                   'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
               )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                         isSuccess ? 'bg-zinc-900 dark:bg-zinc-100' :
                         isFailed ? 'bg-zinc-500' :
                        'bg-zinc-900 dark:bg-zinc-100 animate-pulse'
                    )} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">
                        {data.status === "RUNNING" ? "Running" : data.status}
                    </span>
              </div>

               <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-all">
                  <MoreHorizontal className="h-4 w-4 text-zinc-900 dark:text-zinc-400" />
               </Button>
               <Button className="rounded-full px-6 h-10 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 font-medium shadow-sm transition-all hover:scale-[1.02]">
                  Primary Action
               </Button>
          </div>
      </div>

      {/* BODY SECTION */}
      <div className="flex-1 flex flex-col min-h-0 gap-5">

          {/* 1. PROGRESS BAR (COLORFUL) */}
          <div className="w-full h-16 shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1.5 flex flex-col justify-center">
             <div className="flex w-full h-full rounded-lg overflow-hidden gap-1">
                {activitySegments.length > 0 ? (
                    activitySegments.map((segment: any, idx: number) => {
                         // KEEPING COLORS
                         const activeBg = segment.isPending 
                            ? 'bg-zinc-200 dark:bg-zinc-800' 
                            : (segment.isDone ? 'bg-emerald-500' : 'bg-blue-500'); 
                         
                         const textColor = segment.isPending 
                            ? 'text-zinc-400 dark:text-zinc-500' 
                            : 'text-white';
                         
                         return (
                            <div 
                                key={idx} 
                                style={{ flex: `${segment.computedWeight} 1 0%` }}
                                className={cn(
                                    "h-full flex flex-col justify-center items-center relative transition-all duration-700 ease-in-out group first:rounded-l-md last:rounded-r-md", 
                                    activeBg
                                )}
                            >
                                <div className="flex flex-col items-center gap-0.5 text-center w-full truncate px-2">
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <span className={cn("text-[10px] font-bold leading-tight truncate tracking-wide uppercase", textColor)}>
                                            {segment.name}
                                        </span>
                                        {segment.isRunning && <Clock className={cn("w-3 h-3 animate-spin", textColor)} />}
                                    </div>
                                    
                                    {segment.durationDisplay && (
                                        <span className={cn("text-[9px] font-medium opacity-80 font-mono", textColor)}>
                                            {segment.durationDisplay}
                                        </span>
                                    )}
                                </div>
                            </div>
                         );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <span className="text-zinc-400 text-xs">Initializing...</span>
                    </div>
                )}
             </div>
          </div>

          {/* 2. THREE-COLUMN LAYOUT - Compact Gap */}
          <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
              
              {/* COLUMN 1: Activity Log (42%) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                  <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-2.5">
                            <Activity className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity Log</h2>
                            </div>
                        </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                      <div className="relative border-l border-zinc-200 dark:border-zinc-800 pl-6 ml-2 space-y-12 py-2">
                            {data.activities?.map((activity, i) => (
                                <div key={i} className="relative group">
                                    {/* Timeline Node - Monochrome */}
                                    <div className={cn(
                                        "absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-950 z-10 transition-all duration-300",
                                        activity.status === 'COMPLETED' ? 'bg-zinc-900 dark:bg-zinc-100' :
                                        activity.status === 'RUNNING' ? 'bg-zinc-900 dark:bg-zinc-100 animate-pulse' :
                                        'bg-zinc-300 dark:bg-zinc-700'
                                    )} />
                                    
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-baseline justify-between">
                                            <span className={cn(
                                                "text-xs font-semibold transition-colors truncate max-w-[200px] text-zinc-900 dark:text-zinc-200"
                                            )}>
                                                {activity.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                                {new Date(activity.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        
                                        {/* Activity Content - Pure Monochrome */}
                                        <div className={cn(
                                            "p-4 rounded-xl text-xs leading-relaxed border transition-all duration-200 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                        )}>
                                           {activity.type === 'human_action' ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-[10px] uppercase tracking-wide">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Action Required
                                                    </div>
                                                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">Review compliance docs for <strong>{data.input_data?.driver_name}</strong>.</p>
                                                    <div className="flex gap-2 pt-1">
                                                        <Button size="sm" className="h-7 text-[10px] bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 shadow-sm px-4 rounded-lg border-0">
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-[10px] bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-sm px-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-2">
                                                    <p className="text-zinc-600 dark:text-zinc-400">{activity.description || "System updated state."}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                      </div>
                  </div>
              </div>


              {/* COLUMN 2: Discussion (25%) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                  <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Discussion</h2>
                        </div>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">2</Badge>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {/* Comment 1 */}
                            <div className="flex gap-3">
                                <Avatar className="w-7 h-7 border border-zinc-100 dark:border-zinc-800 mt-1">
                                    <AvatarFallback className="text-[9px] bg-zinc-900 text-white dark:bg-white dark:text-black">S</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Sarah</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">10:42 AM</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg rounded-tl-none">
                                        Checking compliance docs now.
                                    </p>
                                </div>
                            </div>

                            {/* Comment 2 */}
                            <div className="flex gap-3">
                                <Avatar className="w-7 h-7 border border-zinc-100 dark:border-zinc-800 mt-1">
                                    <AvatarFallback className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">M</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Mike</span>
                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">10:45 AM</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg rounded-tl-none">
                                        Noted, thanks Sarah.
                                    </p>
                                </div>
                            </div>
                      </div>
                       
                       <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20">
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3 pr-9 py-2.5 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all resize-none min-h-[42px]"
                                    placeholder="Add a note..."
                                    rows={1}
                                />
                                <Button size="icon" className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-none">
                                    <Send className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                       </div>
                  </div>
              </div>


              {/* COLUMN 3: Intelligence (33%) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col h-full gap-5">
                
                {/* DATA POINTS */}
                <div className="flex-1 max-h-[45%] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                         <div className="flex items-center gap-2.5">
                            <LayoutGrid className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Data Points</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                        <div className="space-y-6">
                             {/* REMOVED DESCRIPTION FROM HERE */}

                             { data.input_data?._info_fields?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    {data.input_data._info_fields.map((field: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider truncate w-full" title={field.label}>{field.label}</span>
                                            <span className="text-xs text-zinc-900 dark:text-zinc-100 font-medium truncate w-full" title={field.value}>{field.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-zinc-400 italic">No data fields available.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Assistant - Monochrome */}
                <div className="flex-1 flex flex-col min-h-[350px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                     <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                         <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Copilot</h2>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                             {/* AI Message */}
                            <div className="flex gap-3">
                                 <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                     <Sparkles className="w-3.5 h-3.5 text-white dark:text-black" />
                                 </div>
                                 <div className="space-y-1 max-w-[90%]">
                                    <div className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                                        I've analyzed the driver data. <strong>Phi Tran</strong> has flagged <span className="font-bold">3 critical risk factors</span>.
                                    </div>
                                 </div>
                            </div>

                             {/* User Message */}
                             <div className="flex gap-3 flex-row-reverse">
                                 <Avatar className="w-7 h-7 rounded-lg mt-0.5 border border-zinc-200 dark:border-zinc-700">
                                     <AvatarFallback className="text-[9px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200">ME</AvatarFallback>
                                 </Avatar>
                                 <div className="space-y-1 max-w-[90%] text-right">
                                    <div className="p-3 bg-zinc-900 dark:bg-zinc-100 rounded-2xl rounded-tr-none text-[11px] leading-relaxed text-white dark:text-black text-left shadow-sm">
                                        Highlight the specific risk factors please.
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <div className="p-4 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950 dark:to-transparent">
                             <div className="relative flex items-center">
                                <input 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all shadow-sm"
                                    placeholder="Ask for insights..."
                                />
                                <Button size="icon" className="absolute right-1.5 h-7 w-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white shadow-none">
                                    <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

              </div>
          </div>

      </div>
    </div>
  );
}
