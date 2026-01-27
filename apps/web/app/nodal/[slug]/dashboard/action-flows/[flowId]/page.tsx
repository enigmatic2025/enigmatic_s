
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, Copy, Check, Clock, Activity, Map as MapIcon, FileJson, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { slug, flowId } = useParams(); // flowId is the ACTION FLOW ID (execution id) here, confusing naming in route but standard for Next.js [param]
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
         toast.success("ID copied to clipboard");
     }
  };

  if (loading) return <DashboardLoading />;

  if (!data) return <div className="p-8 text-center text-muted-foreground">Action Flow not found</div>;

  const isSuccess = data.status === "COMPLETED";
  const isFailed = data.status === "FAILED";
  const isRunning = data.status === "RUNNING";

  return (
    <div className="h-full w-full flex flex-col bg-background/50">
       {/* Header */}
       <div className="border-b bg-background px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
             >
                <ArrowLeft className="h-4 w-4" />
             </Button>
             <div className="flex flex-col">
                <h1 className="text-xl font-semibold tracking-tight">{data.title || data.flow_name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground/80 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-sm" />
                        Action Flow
                    </span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="font-mono text-[10px]">{data.id}</span>
                    <button onClick={copyId} className="hover:text-foreground transition-colors" title="Copy ID">
                        {copiedId ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {new Date(data.started_at).toLocaleString()}
                    </span>
                </div>
             </div>
             
             <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchDetails} className="h-8 gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Refresh
                </Button>
                {/* Status Badge */}
                <Badge 
                    variant={isSuccess ? "default" : isFailed ? "destructive" : "secondary"}
                    className={`h-8 px-3 text-xs font-medium uppercase tracking-wide
                        ${isSuccess ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200' : ''}
                        ${isFailed ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200' : ''}
                        ${isRunning ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200 animate-pulse' : ''}
                    `}
                >
                    {data.status === "RUNNING" ? "Active" : data.status}
                </Badge>
             </div>
          </div>
       </div>

       {/* Tabs & Content */}
       <div className="flex-1 overflow-hidden flex flex-col p-6">
          <Tabs defaultValue="overview" className="h-full flex flex-col space-y-6">
              <div>
                  <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
                      <TabsTrigger 
                        value="overview" 
                        className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
                      >
                         <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Overview
                         </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="map" 
                        className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
                      >
                         <div className="flex items-center gap-2">
                            <MapIcon className="w-4 h-4" /> Map
                         </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
                      >
                         <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" /> Activity
                         </div>
                      </TabsTrigger>
                  </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                  <TabsContent value="overview" className="m-0 w-full pb-10">
                       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                           
                           {/* Left Column: Actions Timeline */}
                           {/* User requested 'alligned better on the left' and 'taking up the whole space'. 
                               Taking 1/4th of the screen for the list, 3/4th for the content. */}
                           <div className="lg:col-span-1 space-y-4">
                               <div className="flex items-center justify-between">
                                   <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                       Actions
                                       <span className="text-xs font-normal bg-muted text-foreground px-2 py-0.5 rounded-full tabular-nums">
                                           {data.activities?.length || 0}
                                       </span>
                                   </h3>
                               </div>
                               
                               <div className="space-y-3">
                                   {data.activities?.map((activity: any, i: number) => (
                                       <Card key={i} className="overflow-hidden border transition-all">
                                           <div className="p-3 flex items-start gap-3">
                                               <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 
                                                   ${activity.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                                     activity.status === 'FAILED' ? 'bg-red-500' : 
                                                     'bg-blue-500 animate-pulse'}`} 
                                               />
                                               <div className="flex-1 space-y-1">
                                                   <div className="flex items-center justify-between">
                                                       <p className="text-sm font-medium leading-none">{activity.name || "Action"}</p>
                                                       <span className="text-[10px] text-muted-foreground tabular-nums">
                                                           {new Date(activity.started_at).toLocaleTimeString()}
                                                       </span>
                                                   </div>
                                                   <p className="text-xs text-muted-foreground">{activity.type === 'trigger' ? 'Trigger' : 'Human Action'}</p>
                                               </div>
                                           </div>
                                            {/* Footer for Human Tasks logic if needed, e.g. View Task button */}
                                            {activity.type === 'human_action' && (
                                                <div className="bg-muted/30 px-3 py-1.5 border-t flex justify-end">
                                                    <Button variant="ghost" size="sm" className="h-5 text-[10px] hover:text-primary px-2">
                                                        View Details
                                                    </Button>
                                                </div>
                                            )}
                                       </Card>
                                   ))}
                                   
                                   {(!data.activities || data.activities.length === 0) && (
                                       <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                                           No actions recorded.
                                       </div>
                                   )}
                               </div>
                           </div>

                           {/* Right Column: Info & Details */}
                           <div className="lg:col-span-3 space-y-8">
                               
                               {/* Title & Description (Borderless) */}
                               <div className="space-y-2">
                                   <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                       {data.title || "Untitled Action Flow"}
                                   </h2>
                                   {data.input_data?.description ? (
                                       <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                                           {data.input_data.description}
                                       </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No description provided.</p>
                                    )}
                               </div>

                               {/* Card 2: Information Table */}
                               <Card>
                                   <CardHeader className="pb-3 border-b">
                                       <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                           Action Flow Information
                                       </h4>
                                   </CardHeader>
                                   <CardContent className="p-0">
                                       {data.input_data?._info_fields && data.input_data._info_fields.length > 0 ? (
                                           <div className="divide-y">
                                               {data.input_data._info_fields.map((field: any, i: number) => (
                                                   <div key={i} className="grid grid-cols-3 p-4 hover:bg-muted/5 transition-colors">
                                                       <div className="text-sm font-medium text-muted-foreground">
                                                           {field.label}
                                                       </div>
                                                       <div className="col-span-2 text-sm text-foreground font-medium">
                                                           {field.value}
                                                       </div>
                                                   </div>
                                               ))}
                                           </div>
                                       ) : (
                                           <div className="p-8 text-center text-muted-foreground text-sm">
                                               No additional information fields.
                                           </div>
                                       )}
                                   </CardContent>
                               </Card>

                           </div>
                       </div>
                  </TabsContent>

                  <TabsContent value="map" className="m-0 h-full flex flex-col items-center justify-center p-12 text-muted-foreground">
                       <MapIcon className="w-12 h-12 mb-4 opacity-20" />
                       <p className="">Visual execution map coming soon.</p>
                  </TabsContent>

                  <TabsContent value="activity" className="m-0 h-full flex flex-col items-center justify-center p-12 text-muted-foreground">
                       <FileJson className="w-12 h-12 mb-4 opacity-20" />
                       <p>Detailed event log coming soon.</p>
                  </TabsContent>
              </div>
          </Tabs>
       </div>
    </div>
  );
}
