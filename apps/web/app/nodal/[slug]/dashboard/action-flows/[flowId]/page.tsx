"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, MoreHorizontal, Check, Clock, MousePointer2, AlertCircle, Info, Send, User, MessageSquare, LayoutGrid, Sparkles, Activity, X, FileText, Download, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isNatalieOpen, setIsNatalieOpen] = useState(false);
  
  // File Upload State
  const [files, setFiles] = useState([
    { name: "Driver_Contract.pdf", size: "2.4 MB", type: "PDF" },
    { name: "License_Front.jpg", size: "1.8 MB", type: "JPG" },
    { name: "License_Back.jpg", size: "1.9 MB", type: "JPG" }
  ]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
       const newFiles = Array.from(e.dataTransfer.files).map(file => ({
           name: file.name,
           size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
           type: file.name.split('.').pop()?.toUpperCase() || "FILE"
       }));
       setFiles(prev => [...newFiles, ...prev]);
       toast.success("Files uploaded successfully");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).map(file => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
            type: file.name.split('.').pop()?.toUpperCase() || "FILE"
        }));
        setFiles(prev => [...newFiles, ...prev]);
        toast.success("Files uploaded successfully");
     }
  };

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
    <div className="flex flex-col h-full w-full bg-white dark:bg-black p-6 gap-5 overflow-hidden font-sans transition-colors duration-300 relative">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between shrink-0">
          <div className="space-y-4 max-w-3xl">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors group text-xs"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Flows</span>
              </Button>
              
              <div className="space-y-2">
                 <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {data.title || data.flow_name || "Untitled Action Flow"}
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-xs tracking-wider uppercase opacity-70">{data.id}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="font-medium text-sm">{new Date(data.started_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                 </div>
                 
                 {data.input_data?.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed pt-1 max-w-2xl">
                        {data.input_data.description}
                    </p>
                 )}
              </div>
          </div>

          <div className="flex items-center gap-4">
               {/* STATUS BADGE - BORDER ONLY, NO SHADOW */}
               <div className={cn(
                   "pl-2 pr-4 py-1.5 rounded-full border flex items-center gap-2.5 transition-all",
                   'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
               )}>
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                         isSuccess ? 'bg-zinc-900 dark:bg-zinc-100' :
                         isFailed ? 'bg-zinc-500' :
                        'bg-zinc-900 dark:bg-zinc-100 animate-pulse'
                    )} />
                    <span className="text-xs font-semibold tracking-wide uppercase">
                        {data.status === "RUNNING" ? "Running" : data.status}
                    </span>
              </div>

               <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-none">
                  <MoreHorizontal className="h-4 w-4 text-zinc-900 dark:text-zinc-400" />
               </Button>
               
               {/* NATALIE BUTTON - NO SHADOW */}
               <Button 
                    onClick={() => setIsNatalieOpen(!isNatalieOpen)}
                    className={cn(
                        "rounded-full px-8 h-11 font-medium transition-all flex items-center gap-2 text-sm shadow-none",
                        isNatalieOpen 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                    )}
                >
                  Natalie
               </Button>
          </div>
      </div>

      {/* BODY SECTION (Relative for Natalie Drawer) */}
      <div className="flex-1 flex flex-col min-h-0 gap-5 relative">

          {/* 1. PROGRESS BAR - BORDER ONLY */}
          <div className="w-full h-16 shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1.5 flex flex-col justify-center">
             <div className="flex w-full h-full rounded-lg overflow-hidden gap-1">
                {activitySegments.length > 0 ? (
                    activitySegments.map((segment: any, idx: number) => {
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

          {/* 2. THREE-COLUMN LAYOUT REORDERED */}
          <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
              
              {/* COLUMN 1: DATA POINTS (LEFT) - WITH TABS */}
              <div className="col-span-12 lg:col-span-4 flex flex-col h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                    <Tabs defaultValue="data" className="flex flex-col h-full">
                        <div className="px-5 pt-5 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <LayoutGrid className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Context</h2>
                                </div>
                             </div>
                             <TabsList className="w-full bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg grid grid-cols-2">
                                <TabsTrigger 
                                    value="data" 
                                    className="text-xs rounded-md py-1.5 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 font-medium text-zinc-500"
                                >
                                    Data Points
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="files" 
                                    className="text-xs rounded-md py-1.5 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 font-medium text-zinc-500"
                                >
                                    Files
                                </TabsTrigger>
                             </TabsList>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                             <TabsContent value="data" className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 m-0 focus-visible:ring-0 focus-visible:outline-none">
                                <div className="space-y-6">
                                     { data.input_data?._info_fields?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                            {data.input_data._info_fields.map((field: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider truncate w-full" title={field.label}>{field.label}</span>
                                                    <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium truncate w-full leading-none" title={field.value}>{field.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-zinc-400 italic">No data fields available.</div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="files" className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 m-0 focus-visible:ring-0 focus-visible:outline-none">
                                <div className="space-y-4">
                                    {/* DROP ZONE */}
                                    <div 
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                                            isDragging 
                                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" 
                                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                        )}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input 
                                            id="file-upload" 
                                            type="file" 
                                            className="hidden" 
                                            multiple 
                                            onChange={handleFileInput}
                                        />
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <UploadCloud className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Click or drag to upload</p>
                                            <p className="text-[10px] text-zinc-400">PDF, PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>

                                    {/* FILE LIST */}
                                    <div className="space-y-3">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                                                        file.type === 'PDF' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                                        file.type === 'JPG' || file.type === 'PNG' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                                                        "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                                    )}>
                                                        {file.type === 'PDF' || file.type === 'JPG' || file.type === 'PNG' ? <FileText className="w-5 h-5" /> : file.type.slice(0,3)}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]" title={file.name}>{file.name}</span>
                                                        <span className="text-[10px] text-zinc-400">{file.size} • {file.type}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
              </div>

              {/* COLUMN 2: ACTIVITY LOG (CENTER) - NO SHADOW */}
              <div className="col-span-12 lg:col-span-4 flex flex-col h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
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
                                    <div className={cn(
                                        "absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-950 z-10 transition-all duration-300",
                                        activity.status === 'COMPLETED' ? 'bg-zinc-900 dark:bg-zinc-100' :
                                        activity.status === 'RUNNING' ? 'bg-zinc-900 dark:bg-zinc-100 animate-pulse' :
                                        'bg-zinc-300 dark:bg-zinc-700'
                                    )} />
                                    
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-baseline justify-between">
                                            <span className={cn(
                                                "text-sm font-semibold transition-colors truncate max-w-[200px] text-zinc-900 dark:text-zinc-200"
                                            )}>
                                                {activity.name}
                                            </span>
                                            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                                {new Date(activity.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        
                                        <div className={cn(
                                            "p-4 rounded-xl text-sm leading-relaxed border transition-all duration-200 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                        )}>
                                           {activity.type === 'human_action' ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-[10px] uppercase tracking-wide">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Action Required
                                                    </div>
                                                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">Review compliance docs for <strong>{data.input_data?.driver_name}</strong>.</p>
                                                    <div className="flex gap-2 pt-1">
                                                        <Button size="sm" className="h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 shadow-sm px-4 rounded-lg border-0">
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-8 text-xs bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-sm px-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
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


              {/* COLUMN 3: Discussion (RIGHT) - NO SHADOW */}
              <div className="col-span-12 lg:col-span-4 flex flex-col h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                  <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Discussion</h2>
                        </div>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">2</Badge>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 border border-zinc-100 dark:border-zinc-800 mt-0.5">
                                    <AvatarFallback className="text-[10px] bg-zinc-900 text-white dark:bg-white dark:text-black">S</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Sarah</span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">10:42 AM</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg rounded-tl-none">
                                        Checking compliance docs now.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 border border-zinc-100 dark:border-zinc-800 mt-0.5">
                                    <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">M</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Mike</span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">10:45 AM</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg rounded-tl-none">
                                        Noted, thanks Sarah.
                                    </p>
                                </div>
                            </div>
                      </div>
                       
                       <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20">
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3 pr-9 py-2.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all resize-none min-h-[42px]"
                                    placeholder="Add a note..."
                                    rows={1}
                                />
                                <Button size="icon" className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-none">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                       </div>
                  </div>
              </div>

          </div>

          {/* NATALIE LAYERS OVER EVERYTHING - SHADOW RESTORED FOR HOVER EFFECT */}
          {isNatalieOpen && (
                 <div className="absolute right-0 top-0 bottom-0 w-[550px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 flex flex-col overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300">
                     <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                         <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pl-1">Natalie</h2>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() => setIsNatalieOpen(false)}
                        >
                            <X className="w-3 h-3 text-zinc-500" />
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold text-white">
                                     N
                                 </div>
                                 <div className="space-y-1">
                                    <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                                        I've analyzed the driver data. <strong>Phi Tran</strong> has flagged <span className="font-bold text-indigo-600 dark:text-indigo-400">3 critical risk factors</span>.
                                    </div>
                                 </div>
                            </div>
                            
                            <div className="flex gap-3 flex-row-reverse">
                                 <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <User className="w-4 h-4 text-zinc-500" />
                                 </div>
                                 <div className="space-y-1">
                                    <div className="text-sm leading-relaxed text-zinc-100 bg-zinc-900 dark:bg-white dark:text-black p-4 rounded-2xl rounded-tr-none">
                                        Highlight the specific risk factors.
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="relative flex items-center">
                                <input 
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm"
                                    placeholder="Ask Natalie..."
                                    autoFocus
                                />
                                <Button size="icon" className="absolute right-1.5 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-none">
                                    <ArrowLeft className="w-4 h-4 rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </div>
                 </div>
              )}

      </div>
    </div>
  );
}
