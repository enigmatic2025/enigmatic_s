
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { flowService } from "@/services/flow-service";
import { ArrowLeft, MoreHorizontal, Check, Clock, MousePointer2, Plus, User, Send, Bot, Sparkles, Paperclip, Mic, ChevronDown, Hash, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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
  
  // No selection state needed for global comments, but keeping logic just in case
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

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

  if (loading) return <DashboardLoading />;
  if (!data) return <div className="p-8 text-center text-zinc-500 font-mono text-sm">Action Flow not found</div>;

  const isSuccess = data.status === "COMPLETED";
  const isFailed = data.status === "FAILED";
  
  // Calculate Progress & Metrics
  const completedActivities = data.activities?.filter(a => a.status === 'COMPLETED').length || 0;
  const totalActivities = Math.max((data.activities?.length || 0), 1);
  const progressPercent = Math.round((completedActivities / totalActivities) * 100);

  const currentAction = data.activities?.find(a => a.status === 'RUNNING') || data.activities?.[data.activities?.length - 1];
  
  // Filter for Human Actions as requested
  const visibleActivities = data.activities?.filter(act => act.type === 'human_action') || [];
  const assignees = ["Retention Team", "Sam Tran"]; 
  return (
    <div className="flex h-[calc(100vh-75px)] w-full bg-white text-zinc-950 font-sans overflow-hidden border-t border-zinc-200">
      
      {/* 50% LEFT PANEL: DASHBOARD CONTENT */}
      {/* COMPACT MODE: Reduced padding, standard text sizes, monochrome */}
      <div className="w-1/2 flex flex-col h-full border-r border-zinc-200 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4 max-w-3xl mx-auto w-full">
              
              {/* Header: Clean, Minimal */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 -ml-2 text-zinc-500 hover:text-zinc-900 px-2 text-sm font-medium"
                        onClick={() => router.back()}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      
                      <div className="flex items-center gap-2">
                           <span className={`text-xs font-mono px-2 py-0.5 border rounded-full ${
                               isSuccess ? 'border-zinc-300 text-zinc-700 bg-zinc-50' : 
                               isFailed ? 'border-zinc-300 text-zinc-700 bg-zinc-50' : 
                               'border-zinc-800 text-zinc-900 bg-zinc-100 font-semibold'
                           }`}>
                               {data.status}
                           </span>
                           <span className="text-xs font-mono px-2 py-0.5 border border-zinc-200 text-zinc-500 rounded-full">
                               HIGH PRIORITY
                           </span>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-900">
                              <MoreHorizontal className="w-4 h-4" />
                           </Button>
                      </div>
                  </div>

                  <div>
                      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                        {data.title || "Untitled Workflow"}
                      </h1>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                          ID: {data.id}
                      </div>
                  </div>

                  <p className="text-sm text-zinc-600 leading-relaxed border-l-2 border-zinc-200 pl-3">
                      {data.input_data?.description || "No description provided."}
                  </p>
              </div>

              <div className="h-px bg-zinc-100 w-full my-4" />

              {/* Data Summary - Dynamic Chunked Rows */ }
              <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Key Data</h3>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                      {/* 
                          LOGIC: Chunk data into groups of 4. 
                          Each chunk gets a Header Row (Gray) followed by a Value Row (White).
                      */}
                      {(() => {
                          const dataPoints = [
                              { label: "Driver Name", value: data.input_data?.driver_name || "John Smith", font: "font-medium" },
                              { label: "Tenure", value: data.input_data?.tenure || "3.5 Years", font: "font-normal" },
                              { label: "Risk Score", value: data.input_data?.risk_score || "85/100", font: "font-mono font-medium" },
                              { label: "Last Contact", value: data.input_data?.last_contact || "2 days ago", font: "font-normal" },
                              // Demo Extra Data
                              { label: "Vehicle ID", value: "VOL-29384", font: "font-mono" },
                              { label: "Region", value: "Southwest", font: "font-normal" },
                              { label: "License Status", value: "Valid (CDL-A)", font: "font-medium text-emerald-600" },
                              { label: "Compliance", value: "Up to Date", font: "font-normal" },
                              
                              // Row 3
                              { label: "Current Route", value: "I-40 Westbound", font: "font-medium text-zinc-900" },
                              { label: "Cargo Type", value: "Refrigerated Goods", font: "font-normal" },
                              { label: "Gross Weight", value: "42,500 lbs", font: "font-mono" },
                              { label: "ETA Destination", value: "Tonight, 8:00 PM", font: "font-medium text-blue-600" },

                              // Row 4
                              { label: "Fuel Efficiency", value: "6.8 MPG", font: "font-normal" },
                              { label: "Idle Time", value: "14% (High)", font: "font-medium text-amber-600" },
                              { label: "Next Service", value: "In 3,000 miles", font: "font-normal" },
                              { label: "Maintenance", value: "No Open Tickets", font: "font-normal text-zinc-500" },

                              // Row 5
                              { label: "Supervisor", value: "Sarah Jenkins", font: "font-medium" },
                              { label: "Shift Pattern", value: "2 Weeks On / 2 Off", font: "font-normal" },
                              { label: "Last drug test", value: "Passed (Jan 10)", font: "font-normal text-emerald-600" },
                              { label: "Contract Type", value: "Full-Time W2", font: "font-normal" }
                          ];

                          const chunkSize = 4;
                          const chunks = [];
                          for (let i = 0; i < dataPoints.length; i += chunkSize) {
                              chunks.push(dataPoints.slice(i, i + chunkSize));
                          }

                          return chunks.map((chunk, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'border-t border-zinc-200' : ''}`}>
                                  {/* Header Row */}
                                  <div className="grid grid-cols-4 bg-zinc-50 border-b border-zinc-200">
                                      {chunk.map((item, i) => (
                                          <div key={i} className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                              {item.label}
                                          </div>
                                      ))}
                                      {/* Fill empty cells if last chunk is incomplete */}
                                      {[...Array(chunkSize - chunk.length)].map((_, i) => <div key={`empty-h-${i}`} />)}
                                  </div>
                                  {/* Value Row */}
                                  <div className="grid grid-cols-4 bg-white">
                                      {chunk.map((item, i) => (
                                          <div key={i} className={`px-4 py-3 text-sm text-zinc-900 truncate ${item.font || ''}`}>
                                              {item.value}
                                          </div>
                                      ))}
                                      {[...Array(chunkSize - chunk.length)].map((_, i) => <div key={`empty-v-${i}`} />)}
                                  </div>
                              </div>
                          ));
                      })()}
                  </div>
              </div>

              {/* Metrics Row - Dense */}
              <div className="grid grid-cols-4 gap-4 py-2">
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Progress</label>
                      <div className="text-lg font-medium text-zinc-900">{progressPercent}%</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Current Step</label>
                      <div className="text-sm font-medium text-zinc-900 truncate">{currentAction?.name || "Initializing..."}</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Started</label>
                      <div className="text-sm font-medium text-zinc-900">{new Date(data.started_at).toLocaleDateString()}</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Involved</label>
                       <div className="flex -space-x-2">
                          {assignees.map((assignee, idx) => (
                              <div key={idx} className="w-6 h-6 rounded-full border border-white bg-zinc-100 flex items-center justify-center text-[9px] font-bold text-zinc-600" title={assignee}>
                                  {assignee.substring(0,1)}
                              </div>
                          ))}
                           <div className="w-6 h-6 rounded-full border border-white bg-white flex items-center justify-center text-[9px] text-zinc-400 border-zinc-200">
                               +
                           </div>
                      </div>
                  </div>
              </div>

              {/* SPLIT CONTENT AREA */}
              <div className="grid grid-cols-12 gap-6 pt-2">
                  
                  {/* ACTIONS LIST (Compact) */}
                  <div className="col-span-5 space-y-3">
                       <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                           <h3 className="text-sm font-semibold text-zinc-900">Actions History</h3>
                           <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-zinc-200 text-zinc-600">
                               + Action
                           </Button>
                       </div>

                       <div className="space-y-0"> 
                           {visibleActivities.map((act, i) => {
                               const isDone = act.status === 'COMPLETED';
                               const isRunning = act.status === 'RUNNING';
                               
                               // Minimalist Item: No shadows, sharp borders for grouping or just simple list
                               return (
                                   <div 
                                      key={i} 
                                      className="group py-3 border-b border-zinc-100 last:border-0 flex items-start gap-3"
                                    >
                                       {/* Simple Status Indicator - No Weird Circles */}
                                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                           isDone ? 'bg-zinc-800' : 
                                           isRunning ? 'bg-zinc-400 animate-pulse' : 
                                           'bg-zinc-200'
                                       }`} />
                                       
                                       <div className="flex-1 min-w-0">
                                           <div className={`text-sm font-medium leading-none ${isDone ? 'text-zinc-600' : 'text-zinc-900'}`}>
                                               {act.name}
                                           </div>
                                           <div className="mt-1.5 flex items-center gap-2">
                                                <span className="text-[11px] text-zinc-400 font-mono">#ACTION-{i+1}</span>
                                                {isRunning && <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-sm">Running</span>}
                                           </div>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                  </div>

                  {/* DISCUSSION PANEL (Compact) */}
                  <div className="col-span-7 pl-4 border-l border-zinc-100">
                      <div className="flex flex-col h-[500px]">
                          <div className="mb-3 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-zinc-900">Discussion</h3>
                              <span className="text-[10px] text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
                                  Global Context
                              </span>
                          </div>
                           
                          {/* Top Input Area */}
                          <div className="mb-4">
                               <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-zinc-900 focus-within:border-zinc-900 transition-all">
                                   <Input 
                                      className="border-0 bg-transparent h-auto p-0 text-sm placeholder:text-zinc-400 focus-visible:ring-0"
                                      placeholder="Reply to thread..."
                                   />
                                   <div className="flex items-center gap-1">
                                       <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900">
                                           <AtSign className="w-3.5 h-3.5" />
                                       </Button>
                                       <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900">
                                           <Hash className="w-3.5 h-3.5" />
                                       </Button>
                                   </div>
                               </div>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                              {/* Comment Thread - Clean - Newest First */}
                              <div className="space-y-4">
                                  
                                  {/* User Comment (Newest) */}
                                  <div className="flex gap-3">
                                      <div className="w-6 h-6 rounded bg-zinc-200 flex items-center justify-center shrink-0 mt-0.5 text-zinc-600 text-[10px] font-bold">
                                           LM
                                      </div>
                                      <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-zinc-900">Lisa M.</span>
                                              <span className="text-[10px] text-zinc-400">10:15 AM</span>
                                          </div>
                                          <p className="text-sm text-zinc-800 leading-snug">
                                              Approved. Check for maintenance delays mentioned in the last haul report.
                                          </p>
                                      </div>
                                  </div>

                                  {/* User Comment */}
                                  <div className="flex gap-3">
                                      <div className="w-6 h-6 rounded bg-black flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-bold">
                                           ST
                                      </div>
                                      <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-zinc-900">Sam Tran</span>
                                              <span className="text-[10px] text-zinc-400">9:45 AM</span>
                                          </div>
                                          <p className="text-sm text-zinc-800 leading-snug">
                                              <span className="font-medium text-zinc-900 bg-zinc-100 px-1 rounded mx-0.5">@Retention</span> 
                                              Reviewing driver logs now. Proceeding with outreach step.
                                          </p>
                                      </div>
                                  </div>

                                  {/* System Log Item (Oldest) */}
                                  <div className="flex gap-3">
                                      <div className="w-6 h-6 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                                           <Hash className="w-3 h-3 text-zinc-400" />
                                      </div>
                                      <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-zinc-800">System</span>
                                              <span className="text-[10px] text-zinc-400">9:30 AM</span>
                                          </div>
                                          <p className="text-sm text-zinc-600 leading-snug">
                                              Workflow initiated. Risk Score <span className="font-mono text-zinc-900">85</span>.
                                          </p>
                                      </div>
                                  </div>

                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 50% RIGHT PANEL: AI CHAT - Monochrome & Clean */}
      <div className="w-1/2 flex flex-col h-full bg-zinc-50 border-l border-zinc-200">
          {/* Chat Header */}
          {/* Chat Header */}
          <div className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-zinc-900 text-white rounded flex items-center justify-center">
                       <Bot className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-sm font-semibold text-zinc-900">Assistant</span>
               </div>
               <Button variant="ghost" size="sm" className="text-[10px] text-zinc-500 hover:text-zinc-900 h-7 px-2">
                   Clear Context
               </Button>
          </div>

          {/* Messages */}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              
              {/* Bot Msg */}
              <div className="flex gap-4 max-w-2xl">
                  <div className="w-7 h-7 bg-zinc-900 text-white rounded flex items-center justify-center shrink-0 mt-1">
                       <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-900">AI</span>
                          <span className="text-[10px] text-zinc-400">Just now</span>
                      </div>
                      <div className="text-sm text-zinc-800 leading-relaxed">
                          <p className="mb-3">I'm ready to assist with the <strong>{data.title}</strong> workflow.</p>
                          <div className="flex flex-wrap gap-2">
                              {["Summarize Risks", "Query Data", "Draft Email"].map((label) => (
                                  <button key={label} className="text-xs bg-white border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors text-zinc-600">
                                      {label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

               {/* User Msg */}
               <div className="flex flex-col items-end gap-1">
                   <div className="bg-zinc-200 text-zinc-900 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-lg">
                       Can you summarize the driver's risk factors?
                   </div>
                   <span className="text-[10px] text-zinc-400 mr-1">You • 1m ago</span>
               </div>

               {/* Bot Msg */}
               <div className="flex gap-4 max-w-2xl">
                  <div className="w-7 h-7 bg-zinc-900 text-white rounded flex items-center justify-center shrink-0 mt-1">
                       <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-900">AI</span>
                          <span className="text-[10px] text-zinc-400">Just now</span>
                      </div>
                      <div className="text-sm text-zinc-800 leading-relaxed space-y-2">
                          <p>Analysis for <strong>Phi Tran</strong>:</p>
                          <ul className="list-disc pl-4 space-y-1 marker:text-zinc-400">
                              <li><strong>Risk Score (85/100)</strong>: Exceeds safe threshold.</li>
                              <li><strong>Tenure</strong>: 3.5 Years (High value retention target).</li>
                          </ul>
                          <p className="text-zinc-600 italic mt-2 text-xs">Recommended: Priority outreach.</p>
                      </div>
                  </div>
              </div>

          </div>

          {/* Input Area - Minimal */}
          <div className="p-4 bg-white border-t border-zinc-200">
              <div className="relative">
                  <Input 
                      placeholder="Ask AI..." 
                      className="bg-zinc-50 border-zinc-200 text-sm py-5 pl-4 pr-12 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 transition-all shadow-none"
                  />
                  <Button size="icon" className="absolute right-1.5 top-1.5 h-7 w-7 bg-zinc-900 hover:bg-zinc-800 text-white rounded">
                      <Send className="w-3.5 h-3.5" />
                  </Button>
              </div>
          </div>
      </div>

    </div>
  );
}
