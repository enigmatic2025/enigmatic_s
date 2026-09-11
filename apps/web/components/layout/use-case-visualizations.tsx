import React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Mail,
  Users,
  ShieldCheck,
  CheckCircle,
  Truck,
  Wrench,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  AlertTriangle,
  Workflow,
  DollarSign,
  Database,
  ArrowRight,
  FileCheck,
  User,
  Plus,
} from "lucide-react";
import { FlowBlock } from "@/components/layout/nodal-visualizations";

// --- Driver Onboarding Visual ---
export const DriverOnboardingPreview = () => {
  return (
    <div className="relative flex flex-col items-center h-full w-full p-6">
      {/* Messy Inputs */}
      <div className="flex gap-4 mb-8 w-full justify-center flex-wrap">
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-orange-50 flex items-center justify-center border border-orange-200">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{"Tenstreet Application"}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{"Email Correspondence"}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-green-50 flex items-center justify-center border border-green-200">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{"HRIS Profile"}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center border border-red-200">
            <ShieldCheck className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{"Safety Records"}</span>
        </div>
      </div>

      {/* Funnel / Arrow */}
      <div className="mb-4 text-muted-foreground/50">
        <ArrowRight className="h-6 w-6 rotate-90" />
      </div>

      {/* Nodal Unified View */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">{"Unified Candidate View"}</h4>
              <p className="text-xs text-muted-foreground">
                {"Candidate"}: John Doe
              </p>
            </div>
          </div>
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
            {"In Progress"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">{"App Review Complete"}</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">{"MVR Check Passed"}</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-transparent animate-spin"></div>
            <span className="text-xs font-medium text-foreground">
              {"Drug Screen Scheduled"}
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg opacity-50">
            <div className="h-4 w-4 rounded-full border border-muted-foreground"></div>
            <span className="text-xs">{"Orientation Pending"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Billing & Claims Visual ---
export const BillingClaimsPreview = () => {
  const claims = [
    { id: "CLM-887", type: "Detention", amount: "$1,240", status: "Approved", tone: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30" },
    { id: "INV-4021", type: "Linehaul Invoice", amount: "$8,930", status: "Matched", tone: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" },
    { id: "CLM-892", type: "Detention", amount: "$2,180", status: "Exception", tone: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30" },
    { id: "INV-4018", type: "Fuel Surcharge", amount: "$560", status: "Synced", tone: "text-muted-foreground bg-muted" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-2 md:p-8">
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">{"Billing & Claims"}</h4>
              <p className="text-[11px] text-muted-foreground">{"Week 24 · 4 items need attention"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            {"SYNCED"}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">{"Open Claims"}</span>
            <span className="text-xl font-light">12</span>
          </div>
          <div className="px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">{"Flagged for Review"}</span>
            <span className="text-xl font-light text-amber-600 dark:text-amber-400">3</span>
          </div>
          <div className="px-5 py-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">{"Recovered This Month"}</span>
            <span className="text-xl font-light">$18.4k</span>
          </div>
        </div>

        {/* Claims Table */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-[10px] uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">
            <span>{"Claim"}</span>
            <span className="text-right">{"Amount"}</span>
            <span className="text-right">{"Status"}</span>
          </div>
          <div className="divide-y divide-border/60">
            {claims.map((claim) => (
              <div key={claim.id} className={`grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-2 text-xs ${claim.id === "CLM-892" ? "bg-amber-50/50 dark:bg-amber-900/10 -mx-2 px-2 rounded" : ""}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium block truncate">{"#"}{claim.id}</span>
                    <span className="text-[10px] text-muted-foreground">{claim.type}</span>
                  </div>
                </div>
                <span className="text-right font-mono text-xs">{claim.amount}</span>
                <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${claim.tone}`}>{claim.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exception Detail */}
        <div className="mx-4 mb-4 p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-900 dark:text-amber-100">{"Detention Discrepancy — #CLM-892"}</span>
            <span className="ml-auto text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">{"Ready for Review"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-md bg-background border border-border/60">
              <span className="text-[10px] text-muted-foreground block">{"Carrier Log"}</span>
              <span className="text-sm font-medium">{"4 hours"}</span>
            </div>
            <div className="p-2 rounded-md bg-background border border-border/60">
              <span className="text-[10px] text-muted-foreground block">{"Geofence Record"}</span>
              <span className="text-sm font-medium">{"2 hours"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 min-w-0">
              <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
              <span className="truncate">{"Signed_POD.pdf attached · Rate matches contract"}</span>
            </span>
            <div className="flex gap-2 shrink-0">
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-md border border-border bg-background">{"Review"}</span>
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground">{"Approve"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Manufacturing Material Flow Visual ---
export const ManufacturingMaterialFlowPreview = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-6">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium text-sm">{"Production Line A4 Status"}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>

        {/* Status Section */}
        <div className="p-6 grid grid-cols-2 gap-4">
           {/* Metric 1 */}
           <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <span className="text-xs text-muted-foreground block mb-1">{"Output Rate"}</span>
              <span className="text-2xl font-light">98%</span>
           </div>
           {/* Metric 2 */}
           <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <span className="text-xs text-muted-foreground block mb-1">{"Active Shift"}</span>
              <span className="text-2xl font-light">{"Morning"}</span>
           </div>
        </div>

        {/* Alert Section */}
        <div className="mx-6 mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-4 items-start">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md shrink-0">
               <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
               <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">{"Potential Inventory Shortage"}</h4>
               <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">{"Based on current output, resin levels may be low in 4 hours."}</p>
            </div>
        </div>

        {/* Automated Actions Log */}
        <div className="px-6 pb-6">
           <h5 className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wider">{"Automated Resolution Steps"}</h5>
           <div className="space-y-3 relative">
              {/* Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border"></div>

              {/* Step 1 */}
              <div className="relative flex items-center gap-3">
                 <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 z-10">
                    <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{"ERP Signal Received"}</span>
                    <span className="text-muted-foreground ml-2 text-xs">08:42:15 AM</span>
                 </div>
              </div>

               {/* Step 2 */}
              <div className="relative flex items-center gap-3">
                 <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 z-10">
                    <Workflow className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{"Reorder Suggested"}</span>
                    <span className="text-muted-foreground ml-2 text-xs">08:42:16 AM</span>
                 </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{"Supplier Confirmed"}</span>
                     <span className="text-muted-foreground ml-2 text-xs">{"Delivery: Tomorrow, 6 AM"}</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- Construction Site Coordination Visual ---
export const ConstructionSiteCoordinationPreview = () => {
    return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-6">
           {/* Mobile Phone Simulation */}
       <div className="w-[320px] bg-background border border-border shadow-sm rounded-[32px] overflow-hidden flex flex-col h-[500px]">
              
              {/* App Header */}
              <div className="bg-zinc-900 text-white p-4 pt-12">
                 <div className="flex justify-between items-center">
                    <span className="font-medium">{"Site Report"}</span>
                    <div className="flex gap-1 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] opacity-80">{"Online"}</span>
                    </div>
                 </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 bg-slate-50 dark:bg-zinc-900/50 p-4 space-y-4 overflow-hidden relative">
                 
                 {/* System Msg */}
                 <div className="flex justify-center">
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{"Today, 09:14 AM"}</span>
                 </div>

                 {/* User Msg (Right) */}
                 <div className="flex flex-col items-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]">
                       {"Main excavator hydraulic failure. We're halted on Zone B."}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{"Foreman Mike"}</span>
                 </div>

                 {/* Automated Response (Left) */}
                 <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-end max-w-[90%]">
                        <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                           <Workflow className="h-3 w-3 text-white" />
                        </div>
                        <div className="bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm">
                           <p className="mb-2">
                            Received. Highlighting as <span className="text-red-500 font-medium">Critical Priority</span> for your review.
                           </p>
                           
                           {/* Action Card */}
                           <div className="bg-slate-50 dark:bg-zinc-900 rounded border border-border p-2 space-y-1 mb-2">
                               <div className="flex items-center gap-2">
                                  <Wrench className="h-3 w-3 text-orange-500"/>
                                  <span className="text-xs font-medium">{"Ticket #8821 Drafted"}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-blue-500"/>
                                  <span className="text-xs font-medium">{"Maintenance Team Notified"}</span>
                               </div>
                           </div>

                           <p className="text-xs text-muted-foreground">{"Estimate: Tech arriving in 45m."}</p>
                        </div>
                    </div>
                 </div>

                  {/* Project Manager Msg (Left) */}
                 <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-end max-w-[85%]">
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300">PM</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm">
                            {"Moving Crew B to Zone C foundation work until resolved."}
                        </div>
                    </div>
                 </div>

              </div>

              {/* Input Area */}
              <div className="p-3 bg-background border-t border-border flex gap-2 items-center">
                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Plus className="h-4 w-4" />
                 </div>
                 <div className="h-8 flex-1 rounded-full bg-muted/50 border border-border px-3 text-xs flex items-center text-muted-foreground">
                    {"Type a message..."}
                 </div>
              </div>

           </div>
        </div>
    )
}
