
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr"; // Added useSWRConfig

import { useRouter } from "@/navigation";
import { flowService } from "@/services/flow-service";
import { apiClient } from "@/lib/api-client"; // Added apiClient
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    Box,
    ChevronDown,
    Bot,
    Send
} from "lucide-react";
import { AssigneeSelector, Assignee } from "@/components/assignee-selector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { toast } from "sonner";
import DashboardLoading from "../../loading"; 
import { ActionFlowComments } from "@/components/flow-studio/action-flow-comments";

interface ActionFlowDetail {
  id: string;
  org_id: string; // Added org_id
  flow_id: string;
  flow_name: string;
  title: string;
  status: string;
  temporal_workflow_id: string;
  started_at: string;
  input_data: any;
  key_data: Record<string, any>;
  priority?: string;
  assignments?: Assignee[]; // Added assignments
  output: any;
  activities: any[];
}


export default function ActionFlowDetailPage() {
  const { slug, flowId } = useParams();
  const router = useRouter();
  /* 
   * Data Fetching with SWR 
   * Replaced useEffect/useState with stale-while-revalidate strategy
   */
  const { data, error, isLoading } = useSWR<ActionFlowDetail>(
    flowId ? `/action-flows/${flowId}` : null,
    (url) => apiClient.get(url).then(async (res) => {
        if (!res.ok) throw new Error("Failed to load details");
        return res.json();
    }),
    {
        refreshInterval: 10000, // Poll every 10s for status updates
    }
  );

  const { mutate } = useSWRConfig(); // Need to import useSWRConfig or just destructure from return


  const loading = isLoading; // Alias for existing logic compatibility

  // No selection state needed for global comments, but keeping logic just in case
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isKeyDataExpanded, setIsKeyDataExpanded] = useState(false);

  // Removed manual useEffect fetch


  if (loading) return <DashboardLoading />;
  if (error) return <div className="p-8 text-center text-red-500 font-mono text-sm">Failed to load action flow details</div>;
  if (!data) return <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 font-mono text-sm">Action Flow not found</div>;

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
    <div className="flex h-[calc(100vh-75px)] w-full bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
      
      {/* 65% LEFT PANEL (Now responsive flex-1): DASHBOARD CONTENT */}
      {/* COMPACT MODE: Reduced padding, standard text sizes, monochrome */}
      <div className="flex-1 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950 min-w-0">
          <div className="p-4 space-y-4 w-full">
              
              {/* Header: Clean, Minimal */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 -ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 text-sm font-medium"
                        onClick={() => router.push(`/nodal/${slug}/dashboard/action-flows`)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      
                      <div className="flex items-center gap-2">
                           <span className={`text-xs font-mono px-2 py-0.5 border rounded-full ${
                               isSuccess ? 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900' : 
                               isFailed ? 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900' : 
                               'border-zinc-800 dark:border-zinc-200 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold'
                           }`}>
                               {data.status}
                           </span>
                           
                           <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <button className={`text-xs font-mono px-2 py-0.5 border rounded-full uppercase transition-colors cursor-pointer hover:opacity-80 flex items-center gap-1 ${
                                        (order => {
                                            const p = (data.priority || 'medium').toLowerCase();
                                            if (p === 'critical') return 'border-red-500/50 text-red-600 bg-red-50 dark:bg-red-900/20';
                                            if (p === 'high') return 'border-orange-500/50 text-orange-600 bg-orange-50 dark:bg-orange-900/20';
                                            if (p === 'low') return 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-900/20';
                                            return 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400';
                                        })()
                                    }`}>
                                        {data.priority || 'MEDIUM'}
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {['low', 'medium', 'high', 'critical'].map(p => (
                                        <DropdownMenuItem 
                                            key={p} 
                                            className="uppercase text-xs font-mono cursor-pointer"
                                            onClick={async () => {
                                                try {
                                                     // Optimistic Update
                                                     const newData = { ...data, priority: p };
                                                     await apiClient.patch(`/action-flows/${data.id}`, { priority: p });
                                                     // Revalidate
                                                     // mutate provided by useSWR hook call if we destructured it, 
                                                     // but we didn't destructure 'mutate' from the hook call above.
                                                     // We must destructure it first or import global mutate.
                                                     // Let's modify the hook call next.
                                                     toast.success(`Priority updated to ${p}`);
                                                     mutate(`/action-flows/${data.id}`); 
                                                } catch (e) {
                                                    toast.error("Failed to update priority");
                                                }
                                            }}
                                        >
                                            {p}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                           </DropdownMenu>



                           <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                               <MoreHorizontal className="w-4 h-4" />
                           </Button>
                      </div>
                  </div>

                  <div>
                      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {data.title || "Untitled Workflow"}
                      </h1>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                          ID: {data.id}
                      </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-3">
                      {data.input_data?.description || "No description provided."}
                  </p>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full my-4" />

              {/* Data Summary - Dynamic Chunked Rows */ }
              <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Key Data</h3>
                  <div className="space-y-3">
                      {/* Render Key Data dynamically from backend */}
                      {(() => {
                          // Map key_data to dataPoints
                          const rawKeyData = data.key_data || {};
                          const dataPoints = Object.entries(rawKeyData).map(([key, value]) => ({
                              label: key,
                              value: String(value),
                              font: "font-medium"
                          }));

                          if (dataPoints.length === 0) {
                              return (
                                  <div className="p-4 text-center text-xs text-zinc-400 italic border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                      No key data available.
                                  </div>
                              );
                          }

                          const chunkSize = 4;
                          const chunks = [];
                          for (let i = 0; i < dataPoints.length; i += chunkSize) {
                              chunks.push(dataPoints.slice(i, i + chunkSize));
                          }

                          // Expansion Logic
                          const INITIAL_VISIBLE_CHUNKS = 2; // Show first 2 rows by default
                          const visibleChunks = isKeyDataExpanded ? chunks : chunks.slice(0, INITIAL_VISIBLE_CHUNKS);
                          const hasHiddenChunks = chunks.length > INITIAL_VISIBLE_CHUNKS;

                          return (
                              <div className="space-y-3">
                                  {visibleChunks.map((chunk, idx) => (
                                      <div key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                                          {/* Header Row */}
                                          <div className="grid grid-cols-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                              {chunk.map((item, i) => (
                                                  <div key={i} className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider truncate" title={item.label}>
                                                      {item.label}
                                                  </div>
                                              ))}
                                              {/* Fill empty cells */}
                                              {[...Array(chunkSize - chunk.length)].map((_, i) => <div key={`empty-h-${i}`} />)}
                                          </div>
                                          {/* Value Row */}
                                          <div className="grid grid-cols-4 bg-white dark:bg-zinc-950">
                                              {chunk.map((item, i) => (
                                                  <div key={i} className={`px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 truncate ${item.font || ''}`} title={item.value}>
                                                      {item.value}
                                                  </div>
                                              ))}
                                              {[...Array(chunkSize - chunk.length)].map((_, i) => <div key={`empty-v-${i}`} />)}
                                          </div>
                                      </div>
                                  ))}
                                  
                                  {hasHiddenChunks && (
                                     <div className="flex justify-center">
                                          <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={() => setIsKeyDataExpanded(!isKeyDataExpanded)}
                                              className="text-xs text-muted-foreground hover:text-foreground h-7"
                                          >
                                              {isKeyDataExpanded ? (
                                                  <>Hide <ChevronDown className="ml-1 w-3 h-3 rotate-180" /></>
                                              ) : (
                                                  <>Show All <ChevronDown className="ml-1 w-3 h-3" /></>
                                              )}
                                          </Button>
                                     </div>
                                  )}
                              </div>
                          );

                      })()}
                  </div>
              </div>

              {/* Metrics Row - Dense */}
              <div className="grid grid-cols-4 gap-4 py-2">
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Progress</label>
                      <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{progressPercent}%</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Current Step</label>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{currentAction?.name || "Initializing..."}</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Started</label>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{new Date(data.started_at).toLocaleDateString()}</div>
                  </div>
                  <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase">Involved</label>
                       <div className="flex -space-x-2">
                          {(() => {
                              // Aggregate unique assignees from Flow and all Activities
                              const allAssignees = [...(data.assignments || [])];
                              data.activities?.forEach(act => {
                                  if (act.assignments) {
                                      allAssignees.push(...act.assignments);
                                  }
                              });

                              // Deduplicate by ID
                              const uniqueInvolved = Array.from(new Map(allAssignees.map(a => [a.id, a])).values());

                              if (uniqueInvolved.length === 0) return null;

                              return uniqueInvolved.map((assignee, idx) => (
                                  <div key={`${assignee.id}-${idx}`} className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden relative" title={assignee.name}>
                                      {assignee.avatar ? (
                                          <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                                      ) : (
                                          <span>{assignee.name ? assignee.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : '?'}</span>
                                      )}
                                  </div>
                              ));
                          })()}
                      </div>
                  </div>
              </div>

              {/* SPLIT CONTENT AREA */}
              <div className="grid grid-cols-12 gap-6 pt-2">
                  
                  {/* ACTIONS LIST (Compact) */}
                  <div className="col-span-5 space-y-3">
                       <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                           <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</h3>
                           <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                               + Action
                           </Button>
                       </div>

                       <div className="space-y-3"> 
                           {visibleActivities.map((act, i) => {
                               const isDone = act.status === 'COMPLETED';
                               const isRunning = act.status === 'RUNNING';
                               const isFailed = act.status === 'FAILED';
                               
                               // Strictly Monochrome Logic
                               const footerClass = isDone || isRunning
                                   ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900' 
                                   : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800';

                               const StatusIcon = isDone ? CheckCircle2 : isFailed ? XCircle : isRunning ? Clock : Box;

                               // Format Type
                               const typeLabel = act.type === 'human_action' ? 'Human' : 'Automated';

                               return (
                                   <div 
                                      key={i} 
                                      className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                                    >
                                       {/* Header Row */}
                                       <div className="p-3 pb-2 flex items-center justify-between gap-2">
                                           <div className="flex items-center gap-2">
                                               {/* Status Pill (Monochrome) */}
                                               <div className={`px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300`}>
                                                   <StatusIcon className="w-3 h-3" />
                                                   {act.status}
                                               </div>

                                               {/* Type Pill (Monochrome - Replaces ID) - Squared corners */}
                                               <div className="px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 border border-transparent">
                                                   {typeLabel}
                                               </div>
                                           </div>
                                           
                                           <div className="flex items-center gap-3">
                                               <span className="text-[10px] text-zinc-400 font-mono">#{i+1} • 2m ago</span>
                                                <AssigneeSelector
                                                    variant="avatar-group"
                                                    selected={(act.assignments || []).map((a: any) => ({
                                                        id: a.id,
                                                        type: a.type,
                                                        name: a.name || "Unknown",
                                                        avatar: a.avatar,
                                                        info: a.info
                                                    }))}
                                                    onSelect={async (newAssignees) => {
                                                        try {
                                                            if (act.id) {
                                                                await apiClient.patch(`/tasks/${act.id}`, { assignments: newAssignees });
                                                                toast.success("Task assignments updated");
                                                                mutate(flowId ? `/action-flows/${flowId}` : null);
                                                            } else {
                                                                toast.error("Task ID missing");
                                                            }
                                                        } catch (e) {
                                                            toast.error("Failed to update task assignments");
                                                            console.error(e);
                                                        }
                                                    }}
                                                    orgSlug={slug as string}
                                                />
                                           </div>
                                       </div>

                                       {/* Description Body */}
                                       <div className="px-3 pb-3 pt-0 text-left">
                                           <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                               {act.name}
                                           </p>
                                           {act.description && (
                                               <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                                                   {act.description}
                                               </p>
                                           )}
                                           {!act.description && (
                                                <p className="text-xs text-zinc-400 italic mt-1">No description provided.</p>
                                           )}
                                       </div>

                                       {/* Footer (Monochrome) */}
                                       <div className={`px-3 py-1.5 flex items-center gap-2 text-[10px] font-medium ${footerClass}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isRunning || isDone ? 'bg-zinc-50 dark:bg-zinc-950 animate-pulse' : 'bg-zinc-400'}`} />
                                            {isDone ? 'Completed successfully' : isFailed ? 'Action failed' : isRunning ? 'Active execution' : 'Pending start'}
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                  </div>

                  {/* DISCUSSION PANEL (Compact) */}
                  <div className="col-span-7 pl-4 border-l border-zinc-100 dark:border-zinc-800">
                      <div className="flex flex-col h-[500px]">
                           {/* Using the new ActionFlowComments component */}
                           {data && (
                               <ActionFlowComments 
                                   actionFlowId={data.id} 
                                   orgId={data.org_id} 
                               />
                           )}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 35% RIGHT PANEL: AI CHAT - Monochrome & Clean */}
      <div className="w-[35%] flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
          {/* Chat Header */}
          {/* Chat Header */}
          <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center">
                       <Bot className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Assistant</span>
               </div>
               <Button variant="ghost" size="sm" className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-7 px-2">
                   Clear Context
               </Button>
          </div>

          {/* Messages */}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              
              {/* Bot Msg */}
              <div className="flex gap-4 max-w-2xl">
                  <div className="w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center shrink-0 mt-1">
                       <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI</span>
                          <span className="text-[10px] text-zinc-400">Just now</span>
                      </div>
                      <div className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
                          <p className="mb-3">I'm ready to assist with the <strong>{data.title}</strong> workflow.</p>
                          <div className="flex flex-wrap gap-2">
                              {["Summarize Risks", "Query Data", "Draft Email"].map((label) => (
                                  <button key={label} className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors text-zinc-600 dark:text-zinc-400">
                                      {label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

               {/* User Msg */}
               <div className="flex flex-col items-end gap-1">
                   <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-lg">
                       Can you summarize the driver's risk factors?
                   </div>
                   <span className="text-[10px] text-zinc-400 mr-1">You • 1m ago</span>
               </div>

               {/* Bot Msg */}
               <div className="flex gap-4 max-w-2xl">
                  <div className="w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center shrink-0 mt-1">
                       <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI</span>
                          <span className="text-[10px] text-zinc-400">Just now</span>
                      </div>
                      <div className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed space-y-2">
                          <p>Analysis for <strong>Phi Tran</strong>:</p>
                          <ul className="list-disc pl-4 space-y-1 marker:text-zinc-400">
                              <li><strong>Risk Score (85/100)</strong>: Exceeds safe threshold.</li>
                              <li><strong>Tenure</strong>: 3.5 Years (High value retention target).</li>
                          </ul>
                          <p className="text-zinc-600 dark:text-zinc-400 italic mt-2 text-xs">Recommended: Priority outreach.</p>
                      </div>
                  </div>
              </div>

          </div>

          {/* Input Area - Minimal */}
          <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                  <Input 
                      placeholder="Ask AI..." 
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm py-5 pl-4 pr-12 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-600 transition-all shadow-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                  <Button size="icon" className="absolute right-1.5 top-1.5 h-7 w-7 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded">
                      <Send className="w-3.5 h-3.5" />
                  </Button>
              </div>
          </div>
      </div>

    </div>
  );
}
