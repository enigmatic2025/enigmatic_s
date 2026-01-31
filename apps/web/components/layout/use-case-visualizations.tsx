import React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
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
  DollarSign,
  Database,
  ArrowRight,
  FileCheck,
  Bot,
  User,
  Plus,
  Sparkles,
  Mic,
  Paperclip,
} from "lucide-react";
import { FlowBlock } from "@/components/layout/nodal-visualizations";

// --- Driver Onboarding Visual ---
export const DriverOnboardingPreview = () => {
  const t = useTranslations('UseCaseVisualizations');
  return (
    <div className="relative flex flex-col items-center h-full w-full p-6">
      {/* Messy Inputs */}
      <div className="flex gap-4 mb-8 w-full justify-center flex-wrap">
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-orange-50 flex items-center justify-center border border-orange-200">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{t('driverOnboarding.tenstreet')}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{t('driverOnboarding.emails')}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-green-50 flex items-center justify-center border border-green-200">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{t('driverOnboarding.hris')}</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center border border-red-200">
            <ShieldCheck className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">{t('driverOnboarding.safety')}</span>
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
              <h4 className="text-sm font-medium">{t('driverOnboarding.title')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('driverOnboarding.candidate')}: John Doe
              </p>
            </div>
          </div>
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
            {t('driverOnboarding.inProgress')}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">{t('driverOnboarding.appReview')}</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">{t('driverOnboarding.mvrCheck')}</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-transparent animate-spin"></div>
            <span className="text-xs font-medium text-foreground">
              {t('driverOnboarding.drugScreen')}
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg opacity-50">
            <div className="h-4 w-4 rounded-full border border-muted-foreground"></div>
            <span className="text-xs">{t('driverOnboarding.orientation')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Billing & Claims Visual ---
export const BillingClaimsPreview = () => {
    const t = useTranslations('UseCaseVisualizations');
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-2 md:p-8">
      <div className="w-full max-w-5xl h-full bg-background border border-border rounded-xl shadow-sm overflow-hidden flex">
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex w-64 bg-muted/30 border-r border-border flex-col p-4 gap-4">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-sm">{t('billing.natalie')}</span>
          </div>

          <div className="text-xs font-medium text-muted-foreground px-2">
            {t('billing.today')}
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-xs text-foreground font-medium cursor-pointer">
            {t('billing.claimDiscrepancy')}
          </div>
          <div className="px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            {t('billing.driverOnboarding')}
          </div>
          <div className="px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            {t('billing.maintenanceRequest')}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative min-w-0">
          {/* Header (Mobile only or minimal) */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 md:hidden shrink-0">
            <span className="font-medium text-sm">{t('billing.claimHeader')}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* AI Message 1 */}
            <div className="flex gap-3 flex-row">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-foreground" />
              </div>
              <div className="rounded-lg p-3 max-w-[80%] text-sm bg-background">
                <p>
                    {t.rich('billing.aiMsg1', {
                        span: (chunks: any) => <span className="font-medium">{chunks}</span>
                    })}
                </p>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 flex-row-reverse">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="rounded-lg p-3 max-w-[80%] text-sm bg-primary text-primary-foreground dark:bg-zinc-800 dark:text-white">
                <p className="mb-2">
                  {t('billing.userMsg')}
                </p>
                {/* Attachment Card */}
                <div className="flex items-center gap-3 p-2 rounded-md bg-background/10 border border-background/20">
                  <div className="h-8 w-8 rounded bg-background/20 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      Signed_POD.pdf
                    </p>
                    <p className="text-[10px] opacity-70">840 KB</p>
                  </div>
                  <CheckCircle className="h-3 w-3 text-white/70 ml-2 shrink-0" />
                </div>
              </div>
            </div>

            {/* AI Message 2 */}
            <div className="flex gap-3 flex-row">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-foreground" />
              </div>
              <div className="rounded-lg p-3 max-w-[80%] text-sm bg-background">
                <p>
                  {t('billing.aiMsg2')}
                </p>
                <p className="mt-2">
                    {t.rich('billing.aiMsg3', {
                        span: (chunks) => <span className="text-green-600 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">{chunks}</span>
                    })}
                </p>
              </div>
            </div>
          </div>

          {/* Input Area - Natalie Style */}
          <div className="p-4 border-t bg-background/50">
            <div className="max-w-3xl mx-auto w-full relative">
              <div className="bg-background border border-primary/10 rounded-md min-h-20 p-3 text-sm text-muted-foreground relative">
                {t('billing.inputPlaceholder')}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-muted-foreground">
                  {t('billing.footer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Manufacturing Material Flow Visual ---
export const ManufacturingMaterialFlowPreview = () => {
    const t = useTranslations('UseCaseVisualizations');
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-6 bg-slate-50 dark:bg-zinc-950/50">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium text-sm">{t('manufacturing.status')}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>

        {/* Status Section */}
        <div className="p-6 grid grid-cols-2 gap-4">
           {/* Metric 1 */}
           <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <span className="text-xs text-muted-foreground block mb-1">{t('manufacturing.outputRate')}</span>
              <span className="text-2xl font-light">98%</span>
           </div>
           {/* Metric 2 */}
           <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <span className="text-xs text-muted-foreground block mb-1">{t('manufacturing.activeShift')}</span>
              <span className="text-2xl font-light">{t('manufacturing.morning')}</span>
           </div>
        </div>

        {/* Alert Section */}
        <div className="mx-6 mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-4 items-start">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md shrink-0">
               <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
               <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">{t('manufacturing.lowInventory')}</h4>
               <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">{t('manufacturing.lowInventoryDesc')}</p>
            </div>
        </div>

        {/* Automated Actions Log */}
        <div className="px-6 pb-6">
           <h5 className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wider">{t('manufacturing.automatedResolution')}</h5>
           <div className="space-y-3 relative">
              {/* Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border"></div>

              {/* Step 1 */}
              <div className="relative flex items-center gap-3">
                 <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 z-10">
                    <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{t('manufacturing.erpSignal')}</span>
                    <span className="text-muted-foreground ml-2 text-xs">08:42:15 AM</span>
                 </div>
              </div>

               {/* Step 2 */}
              <div className="relative flex items-center gap-3">
                 <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0 z-10">
                    <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{t('manufacturing.reorderTriggered')}</span>
                    <span className="text-muted-foreground ml-2 text-xs">08:42:16 AM</span>
                 </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                 </div>
                 <div className="text-sm">
                    <span className="font-medium">{t('manufacturing.supplierConfirmed')}</span>
                     <span className="text-muted-foreground ml-2 text-xs">{t('manufacturing.deliveryTime')}</span>
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
    const t = useTranslations('UseCaseVisualizations');
    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full p-6 bg-slate-50 dark:bg-zinc-950/50">
           {/* Mobile Phone Simulation */}
           <div className="w-[320px] bg-background border border-border shadow-2xl rounded-[32px] overflow-hidden flex flex-col h-[500px]">
              
              {/* App Header */}
              <div className="bg-zinc-900 text-white p-4 pt-12">
                 <div className="flex justify-between items-center">
                    <span className="font-medium">{t('construction.siteReport')}</span>
                    <div className="flex gap-1 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] opacity-80">{t('construction.online')}</span>
                    </div>
                 </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 bg-slate-50 dark:bg-zinc-900/50 p-4 space-y-4 overflow-hidden relative">
                 
                 {/* System Msg */}
                 <div className="flex justify-center">
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{t('construction.timestamp')}</span>
                 </div>

                 {/* User Msg (Right) */}
                 <div className="flex flex-col items-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]">
                       {t('construction.userMsg')}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{t('construction.foreman')}</span>
                 </div>

                 {/* Bot Response (Left) */}
                 <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-end max-w-[90%]">
                        <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                           <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm">
                           <p className="mb-2">
                            {t.rich('construction.aiMsg', {
                                span: (chunks) => <span className="text-red-500 font-medium">{chunks}</span>
                            })}
                           </p>
                           
                           {/* Action Card */}
                           <div className="bg-slate-50 dark:bg-zinc-900 rounded border border-border p-2 space-y-1 mb-2">
                               <div className="flex items-center gap-2">
                                  <Wrench className="h-3 w-3 text-orange-500"/>
                                  <span className="text-xs font-medium">{t('construction.ticketCreated')}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-blue-500"/>
                                  <span className="text-xs font-medium">{t('construction.maintenanceNotify')}</span>
                               </div>
                           </div>

                           <p className="text-xs text-muted-foreground">{t('construction.estimate')}</p>
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
                            {t('construction.pmMsg')}
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
                    {t('construction.typeMessage')}
                 </div>
              </div>

           </div>
        </div>
    )
}
