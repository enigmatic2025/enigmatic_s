
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { apiClient } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { flowService } from "@/services/flow-service";
import DOMPurify from "isomorphic-dompurify";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { HumanTaskForm } from "@/components/flow-studio/human-task-form";

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
  const t = useTranslations("ActionFlows");
  /* 
   * Data Fetching with SWR 
   * Replaced useEffect/useState with stale-while-revalidate strategy
   */
  /* 
   * Data Fetching with SWR & Realtime
   */
  const { data, error, isLoading } = useSWR<ActionFlowDetail>(
    flowId ? `/action-flows/${flowId}` : null,
    (url) => apiClient.get(url).then(async (res) => {
        if (!res.ok) throw new Error("Failed to load details");
        return res.json();
    }),
    { revalidateOnFocus: true }
  );

  const { mutate } = useSWRConfig();

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!flowId) return;

    // Listen for any changes to human_tasks linked to this flow
    const channel = supabase.channel(`flow-${flowId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'human_tasks', filter: `flow_id=eq.${flowId}` },
        () => {
          console.log("Realtime update received! Revalidating...");
          mutate(`/action-flows/${flowId}`); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flowId, mutate]);



  const loading = isLoading; // Alias for existing logic compatibility

  // No selection state needed for global comments, but keeping logic just in case
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isKeyDataExpanded, setIsKeyDataExpanded] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
      { role: 'assistant', content: "I'm ready to assist with this workflow. Ask me anything about the risks, data, or actions." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
      if (!chatInput.trim() || isChatLoading) return;
      
      const userMsg = chatInput.trim();
      setChatInput("");
      setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      setIsChatLoading(true);

      try {
          // Prepare Context
          const contextData = {
              title: data?.title,
              status: data?.status,
              priority: data?.priority,
              activities: data?.activities?.map(a => ({ name: a.name, status: a.status, output: a.output, type: a.type })),
              key_data: data?.key_data
          };

          // Build conversation history for multi-turn context
          const allMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
          const conversationHistory = allMessages
              .filter(m => m.role === 'user' || m.role === 'assistant')
              .map(m => ({ role: m.role, content: m.content }));

          // Get auth token
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          const res = await fetch('/api/ai/chat/stream', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                  messages: conversationHistory,
                  context: JSON.stringify(contextData)
              }),
          });

          if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              if (errorData.error === 'guardrail_blocked') {
                  toast.error("Message blocked by content filter.");
                  setChatMessages(prev => [...prev, { role: 'assistant', content: errorData.message || "I can only help with business and automation-related questions." }]);
              } else if (errorData.error === 'insufficient_credits') {
                  toast.error("Out of AI credits.");
                  setChatMessages(prev => [...prev, { role: 'assistant', content: errorData.message || "Your organization has run out of AI credits." }]);
              } else {
                  throw new Error("Failed to get response");
              }
              return;
          }

          // Stream using Vercel AI Data Stream Protocol v1
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();

          // Add empty assistant message to start streaming into
          setChatMessages(prev => [...prev, { role: 'assistant', content: "" }]);

          if (reader) {
              let buffer = "";
              while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  for (const line of lines) {
                      if (!line.trim()) continue;

                      // Parse Data Stream Protocol v1 format
                      if (line.startsWith('0:')) {
                          try {
                              const content = JSON.parse(line.slice(2));
                              if (content) {
                                  setChatMessages(prev => {
                                      const updated = [...prev];
                                      const last = updated[updated.length - 1];
                                      if (last?.role === 'assistant') {
                                          updated[updated.length - 1] = { ...last, content: last.content + content };
                                      }
                                      return updated;
                                  });
                              }
                          } catch { /* skip parse errors */ }
                      }
                      // d: lines are finish metadata — ignore
                  }
              }
          }
      } catch (e) {
          toast.error("Natalie failed to respond.");
          setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
      } finally {
          setIsChatLoading(false);
      }
  };

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
                           <StatusBadge status={data.status} />
                           
                           <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <button className={`text-xs px-2 py-0.5 border rounded-full transition-colors cursor-pointer hover:opacity-80 flex items-center gap-1 ${
                                        (order => {
                                            const p = (data.priority || 'medium').toLowerCase();
                                            const base = "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-medium";
                                            if (p === 'critical') return `${base} text-red-600 dark:text-red-400`;
                                            if (p === 'high') return `${base} text-orange-600 dark:text-orange-400`;
                                            if (p === 'medium') return `${base} text-amber-600 dark:text-amber-400`;
                                            if (p === 'low') return `${base} text-blue-600 dark:text-blue-400`;
                                            return `${base} text-zinc-500 dark:text-zinc-400`;
                                        })()
                                    }`}>
                                        {t(`priorities.${(data.priority || 'medium').toLowerCase()}`)}
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {['low', 'medium', 'high', 'critical'].map(p => (
                                        <DropdownMenuItem 
                                            key={p} 
                                            className="text-xs cursor-pointer"
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
                                            {t(`priorities.${p}`)}
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

                        <div className="relative pl-4 space-y-0">
                           {/* Continuous Line Background */}
                           {visibleActivities.length > 1 && (
                                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                           )}

                           {visibleActivities.map((act, i) => {
                               const isDone = act.status === 'COMPLETED';
                               const isRunning = act.status === 'RUNNING' || act.status === 'PENDING';
                               const isFailed = act.status === 'FAILED';
                               const isPendingStart = act.status === 'PENDING_START';
                               const isSelected = selectedActionId === act.id;
                               const stepNum = act.step_number || (i + 1);

                               // Strictly Monochrome Logic
                               const footerClass = isDone || isRunning
                                   ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                                   : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800';

                               const StatusIcon = isDone ? CheckCircle2 : isFailed ? XCircle : isRunning ? Clock : Box;

                               // Format Type
                               const typeLabel = act.type === 'human_action' ? 'Human' : 'Automated';

                               return (
                                   <div key={i} className="flex gap-4 relative pb-6 group-last:pb-0">
                                       {/* Step Bubble */}
                                       <div className="flex-shrink-0 relative z-10 pt-1">
                                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                               isDone ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
                                               : isRunning ? "bg-white text-zinc-900 ring-4 ring-zinc-50 dark:ring-zinc-900/50 dark:bg-zinc-950 dark:text-zinc-100"
                                               : "bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600"
                                           }`}>
                                               {stepNum}
                                           </div>
                                       </div>

                                       {/* Card */}
                                       <div
                                          onClick={() => setSelectedActionId(act.id)}
                                          className={`flex-1 group bg-white dark:bg-zinc-950 border rounded-lg overflow-hidden transition-all min-h-[140px] flex flex-col justify-between cursor-pointer ${
                                              isSelected
                                                ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-md'
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
                                          }`}
                                        >
                                           {/* Header Row */}
                                           <div>
                                               <div className="p-3 pb-2 flex flex-wrap items-center justify-between gap-2">
                                                   <div className="flex items-center gap-2">
                                                       {/* Status Pill (Monochrome) */}
                                                       <div className={`px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300`}>
                                                           <StatusIcon className="w-3 h-3" />
                                                           {act.status === 'PENDING_START' ? 'Pending Start' : act.status}
                                                       </div>
        
                                                       {/* Type Pill (Monochrome - Replaces ID) - Squared corners */}
                                                       <div className="px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 border border-transparent">
                                                           {typeLabel}
                                                       </div>
                                                   </div>
                                                   
                                                   <div className="flex items-center gap-3">
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
                                                   {act.information ? (
                                                       <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed line-clamp-3">
                                                           {act.information}
                                                       </p>
                                                   ) : (
                                                        <p className="text-xs text-zinc-400 italic mt-1">No information provided.</p>
                                                   )}
                                               </div>
                                           </div>

                                           {/* Footer (Monochrome) */}
                                           <div className={`px-3 py-1.5 flex items-center justify-between text-[10px] font-medium ${footerClass}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning || isDone ? 'bg-zinc-50 dark:bg-zinc-950 animate-pulse' : 'bg-zinc-400'}`} />
                                                    {isDone ? 'Completed successfully' : isFailed ? 'Action failed' : isRunning ? 'Active execution' : 'Pending start'}
                                                </div>
                                                <span className="opacity-70 font-mono">2m ago</span>
                                           </div>
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
      <div className="w-[35%] flex flex-col h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
          <Tabs defaultValue="action-details" className="h-full flex flex-col">
              <div className="px-6 pt-6 pb-2 bg-white dark:bg-zinc-950 flex flex-col gap-4">
                  {/* Optional Header/Title could go here, but for now just spacing */}
                  <div className="flex items-center justify-center">
                    <TabsList className="bg-muted p-1 rounded-lg h-auto inline-flex">
                        <TabsTrigger 
                            value="action-details" 
                            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
                        >
                            Action Details
                        </TabsTrigger>
                        <TabsTrigger 
                            value="assistant" 
                            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none"
                        >
                            Natalie
                        </TabsTrigger>
                    </TabsList>
                  </div>
              </div>

              {/* ACTION DETAILS TAB */}
              <TabsContent value="action-details" className="flex-1 overflow-y-auto mt-4 custom-scrollbar">
                  {!selectedActionId ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                              <Box className="w-6 h-6" />
                          </div>
                          <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                  No Action Selected
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  Click on an action to view details
                              </p>
                          </div>
                      </div>
                  ) : (
                      (() => {
                          const action = data.activities?.find(a => a.id === selectedActionId);
                          if (!action) return (
                             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                 <p className="text-sm text-zinc-500">Action not found</p>
                             </div>
                          );

                          return (
                              <div className="p-4 space-y-5">
                                  {/* Header */}
                                  <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                      <div className="flex items-center justify-between">
                                          <Badge variant="outline" className="text-[10px] h-5 rounded-md px-2 uppercase tracking-wide font-semibold border-zinc-300 dark:border-zinc-700">
                                              {action.type}
                                          </Badge>
                                          <StatusBadge status={action.status} />
                                      </div>
                                      
                                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                                          {action.name}
                                      </h2>

                                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                          <span className="break-all">{action.id}</span>
                                      </div>
                                  </div>

                                  {/* Timestamps - Moved to top and made compact */}
                                  <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                              <Clock className="w-2.5 h-2.5" />
                                              Started
                                          </label>
                                          <div className="text-xs text-zinc-900 dark:text-zinc-100">
                                              {action.started_at ? new Date(action.started_at).toLocaleString() : '-'}
                                          </div>
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                              <CheckCircle2 className="w-2.5 h-2.5" />
                                              Completed
                                          </label>
                                          <div className="text-xs text-zinc-900 dark:text-zinc-100">
                                              {action.completed_at ? new Date(action.completed_at).toLocaleString() : '-'}
                                          </div>
                                      </div>
                                  </div>

                                  {/* Info / Description */}
                                  <div className="space-y-2">
                                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                                          Information
                                      </label>
                                      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                          {action.information || <span className="italic text-zinc-400">No information provided.</span>}
                                      </div>
                                  </div>

                                  {/* Instructions (Rich Text) */}
                                  {action.instructions && (
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                              <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                              Instructions
                                          </label>
                                          <div 
                                              className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 prose prose-sm dark:prose-invert max-w-none break-words prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:break-words prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:break-all prose-a:font-medium hover:prose-a:underline prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold prose-ul:text-zinc-700 dark:prose-ul:text-zinc-300 prose-ul:space-y-1 prose-ol:text-zinc-700 dark:prose-ol:text-zinc-300 prose-li:marker:text-purple-500"

                                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(action.instructions) }}
                                          />
                                      </div>
                                  )}


                                  {/* Assignments */}
                                  {action.assignments && action.assignments.length > 0 && (
                                     <div className="space-y-2">
                                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                              <div className="w-1 h-3.5 bg-green-500 rounded-full" />
                                              Assigned To
                                          </label>
                                          <div className="flex flex-wrap gap-1.5">
                                              {action.assignments.map((assignee: Assignee) => (
                                                  <div key={assignee.id} className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200">
                                                      <span className="text-xs font-medium">{assignee.name}</span>
                                                  </div>
                                              ))}
                                          </div>
                                     </div>
                                  )}

                                  {/* Human Task Form - New Render Logic */}
                                  {(action.type === 'human_action' || action.type === 'human_task') && (
                                      <div className="mt-8">
                                          <HumanTaskForm 
                                              key={action.id} // Force remount on action switch
                                              actionId={action.id}
                                              schema={action.schema || action.input?.schema || action.config?.schema || action.data?.schema || []}
                                              status={action.status}
                                              initialData={action.output || {}}
                                              onComplete={() => {
                                                  // Refresh data using key string
                                                  mutate(`/action-flows/${flowId}`); 
                                              }}
                                          />
                                      </div>
                                  )}

                                  {/* Input / Output Data (JSON view for tech details) */}
                                   {(action.input || action.output) && (
                                      <div className="space-y-3">
                                          {action.input && (
                                              <div className="space-y-1.5">
                                                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                                      <div className="w-1 h-3.5 bg-orange-500 rounded-full" />
                                                      Input Data
                                                  </label>
                                                  <pre className="text-[10px] bg-zinc-900 dark:bg-black text-zinc-100 p-3 rounded-lg overflow-x-auto custom-scrollbar border border-zinc-800 font-mono leading-relaxed">
                                                      {JSON.stringify(action.input, null, 2)}
                                                  </pre>
                                              </div>
                                          )}
                                      </div>
                                   )}
                              </div>
                          );
                      })()
                  )}
              </TabsContent>

              {/* ASSISTANT TAB */}
              <TabsContent value="assistant" className="flex-1 flex flex-col min-h-0 mt-4 data-[state=inactive]:hidden">
                   {/* Chat Header - Preserved but slightly compacted for tab context if needed, or kept same */}
                   <div className="h-10 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-3">
                           <div className="w-6 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center">
                               <Bot className="w-3 h-3 stroke-[1.5]" />
                           </div>
                           <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Natalie</span>
                       </div>
                       <Button variant="ghost" size="sm" className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-6 px-2">
                           Clear Context
                       </Button>
                   </div>

                   {/* Messages */}
                   <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                       {chatMessages.map((msg, idx) => (
                           <div key={idx} className={`flex gap-4 max-w-2xl ${msg.role === 'user' ? 'justify-end ml-auto' : ''}`}>
                               {msg.role === 'assistant' && (
                                   <div className="w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center shrink-0 mt-1">
                                       <Bot className="w-3.5 h-3.5 stroke-[1.5]" />
                                   </div>
                               )}
                               
                               <div className={`${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                   <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                       <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                            {msg.role === 'assistant' ? 'Natalie' : 'You'}
                                       </span>
                                   </div>
                                   <div className={`text-sm leading-relaxed ${
                                       msg.role === 'user' 
                                       ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm' 
                                       : 'text-zinc-800 dark:text-zinc-300'
                                   }`}>
                                       {msg.role === 'assistant' ? (
                                           <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content.replace(/\n/g, '<br/>')) }} />
                                       ) : (
                                           msg.content
                                       )}
                                   </div>
                               </div>
                           </div>
                       ))}
                       {isChatLoading && (
                           <div className="flex gap-4 max-w-2xl">
                               <div className="w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex items-center justify-center shrink-0 mt-1">
                                   <Bot className="w-3.5 h-3.5 stroke-[1.5]" />
                               </div>
                               <div className="space-y-2 pt-2">
                                    <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                                    <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                               </div>
                           </div>
                       )}
                       <div ref={chatEndRef} />
                   </div>

                   {/* Input Area - Minimal */}
                   <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                       <div className="relative">
                           <Input 
                               placeholder="Ask Natalie..." 
                               value={chatInput}
                               onChange={(e) => setChatInput(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                               disabled={isChatLoading}
                               className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm py-5 pl-4 pr-12 rounded-lg focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-600 transition-all shadow-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                           />
                           <Button 
                                size="icon" 
                                onClick={handleSendMessage}
                                disabled={isChatLoading || !chatInput.trim()}
                                className="absolute right-1.5 top-1.5 h-7 w-7 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded"
                            >
                               <Send className="w-3.5 h-3.5" />
                           </Button>
                       </div>
                   </div>
              </TabsContent>
          </Tabs>
      </div>

    </div>
  );
}
