
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, Copy, Check, Clock, Activity, Map as MapIcon, FileJson, CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Skeleton } from "@/components/ui/skeleton";
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
       <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 border-b bg-background/50 backdrop-blur-sm z-10">
                  <TabsList className="h-10 bg-transparent p-0 gap-6">
                      <TabsTrigger 
                        value="overview" 
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                      >
                         <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Overview
                         </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="map" 
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                      >
                         <div className="flex items-center gap-2">
                            <MapIcon className="w-4 h-4" /> Map
                         </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                      >
                         <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" /> Activity
                         </div>
                      </TabsTrigger>
                  </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto bg-muted/5 p-6 space-y-6">
                  <TabsContent value="overview" className="m-0 space-y-6 max-w-5xl mx-auto w-full p-12 text-center text-muted-foreground">
                       <Activity className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                       <p>Overview details coming soon.</p>
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
