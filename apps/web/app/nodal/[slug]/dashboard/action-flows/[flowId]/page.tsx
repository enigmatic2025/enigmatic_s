
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
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      
      {/* Left Panel: Master View (Scrollable) */}
      <div className="w-[55%] min-w-[500px] h-full flex flex-col border-r bg-background overflow-y-auto">
         
         {/* Top Navigation & Header */}
         <div className="p-6 pb-2 space-y-6">
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center gap-2">
                     <Badge 
                        variant="secondary" 
                        className="rounded-full px-3 py-1 font-medium bg-muted hover:bg-muted/80 text-foreground border-0 gap-2"
                     >
                        <div className={`w-2 h-2 rounded-full ${
                             isSuccess ? 'bg-blue-500' : 
                             isFailed ? 'bg-red-500' : 
                             'bg-blue-500'
                        }`} />
                        {data.status === "RUNNING" ? "In Progress" : data.status}
                     </Badge>
                     <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium bg-muted hover:bg-muted/80 text-foreground border-0 gap-2">
                        <div className="w-4 h-4 rounded-full border border-orange-500 flex items-center justify-center">
                            <ArrowLeft className="w-2.5 h-2.5 text-orange-500 rotate-90" />
                        </div>
                        High
                     </Badge>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                     </Button>
                </div>
            </div>

            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {data.title || data.flow_name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{data.id}</span>
                </div>
            </div>

            <div className="space-y-1">
                 <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
                 <p className="text-sm text-foreground/90 leading-relaxed">
                    {data.input_data?.description || "No description provided for this workflow execution."}
                 </p>
            </div>
         </div>

         {/* Data Grid Section */}
         <div className="px-6 py-2">
            <div className="rounded-xl border bg-card/50 shadow-none">
                 <div className="grid grid-cols-4 gap-6 p-5">
                     {data.input_data?._info_fields?.slice(0, 4).map((field: any, i: number) => (
                         <div key={i} className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-medium text-muted-foreground/70 tracking-wider truncate">
                                  {field.label}
                              </span>
                              <span className="text-sm font-medium text-foreground truncate leading-tight" title={field.value}>
                                  {field.value}
                              </span>
                         </div>
                     ))}
                     {(!data.input_data._info_fields || data.input_data._info_fields.length === 0) && (
                         <div className="col-span-4 p-4 text-center text-sm text-muted-foreground italic">
                             No key data points available
                         </div>
                     )}
                 </div>
            </div>
         </div>

         {/* Assignees Section (Empty) */}
         <div className="px-6 py-2 space-y-2">
             <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignees</h4>
             <div className="flex items-center gap-3 min-h-[24px]">
                 <span className="text-sm text-muted-foreground italic">Unassigned</span>
             </div>
         </div>

         {/* Status Line */}
         <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Current Action</span>
                    <p className="text-sm font-medium">
                        {currentAction?.name || "Initializing..."}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <p className="text-sm font-medium">35%</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Started</span>
                    <p className="text-sm font-medium">
                        {new Date(data.started_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Last Update</span>
                    <p className="text-sm font-medium">
                        {new Date(lastUpdate).toLocaleTimeString()}
                    </p>
                </div>
            </div>
         </div>

         {/* Divider */}
         <div className="h-px bg-border mx-6 my-2" />

         {/* Actions List */}
         <div className="flex-1 flex flex-col min-h-0">
             <div className="px-6 pt-2 pb-0">
                 <Tabs defaultValue="actions" className="w-full">
                     <TabsList className="w-full justify-start bg-muted p-1 rounded-lg h-auto inline-flex gap-1 w-auto">
                         <TabsTrigger 
                            value="actions" 
                            className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                         >
                            Actions
                         </TabsTrigger>
                         <TabsTrigger 
                            value="files" 
                            className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                         >
                            Files
                         </TabsTrigger>
                     </TabsList>
                     
                     <TabsContent value="actions" className="pt-6 space-y-4 pb-12">
                         <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Actions</h3>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                + Quick Action
                            </Button>
                         </div>

                         <div className="space-y-3">
                             {data.activities?.filter(a => a.type === 'human_action').map((activity, i) => (
                                 <Card key={i} className="flex flex-col overflow-hidden shadow-none border hover:bg-muted/30 transition-colors cursor-pointer group relative">
                                     <div className="p-4 space-y-3">
                                         <div className="space-y-1">
                                             <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold group-hover:text-foreground transition-colors">
                                                    {activity.name || "Untitled Action"}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                                    {new Date(activity.started_at).toLocaleDateString()}
                                                </span>
                                             </div>
                                             <p className="text-xs text-muted-foreground line-clamp-2">
                                                 Please review the driver details and confirm if intervention is required.
                                             </p>
                                         </div>
                                         
                                         <div className="flex items-center justify-between pt-1">
                                             <div className="flex -space-x-2 overflow-hidden">
                                                 {/* Dummy Assignees */}
                                                 <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-background">
                                                     <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700 font-medium">ST</AvatarFallback>
                                                 </Avatar>
                                                 <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-background">
                                                     <AvatarFallback className="text-[9px] bg-emerald-100 text-emerald-700 font-medium">JD</AvatarFallback>
                                                 </Avatar>
                                                 <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-background">
                                                     <AvatarFallback className="text-[9px] bg-slate-100 text-slate-700 font-medium">+1</AvatarFallback>
                                                 </Avatar>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     {/* Status Bar */}
                                     {activity.status === 'COMPLETED' ? (
                                         <div className="h-1.5 w-full bg-emerald-500/80" />
                                     ) : (
                                         <div className="h-1.5 w-full bg-muted-foreground/20" />
                                     )}
                                 </Card>
                             ))}
                             
                             {(!data.activities || data.activities.filter(a => a.type === 'human_action').length === 0) && (
                                 <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                                     No human actions pending or completed.
                                 </div>
                             )}
                         </div>
                     </TabsContent>
                     
                     <TabsContent value="files" className="pt-6">
                         <div className="p-8 text-center text-muted-foreground text-sm border rounded-lg border-dashed">
                             No files attached.
                         </div>
                     </TabsContent>
                 </Tabs>
             </div>
         </div>
      </div>

      {/* Right Panel: Detail View (Fixed) */}
      <div className="flex-1 bg-muted/10 flex flex-col items-center justify-center p-12 text-center">
           <div className="max-w-sm flex flex-col items-center gap-4 text-muted-foreground/50">
               <MousePointer2 className="w-12 h-12 stroke-[1.5]" />
               <p className="font-medium text-base">Select an action to view details</p>
           </div>
      </div>

    </div>
  );
}
