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
  return (
    <div className="relative flex flex-col items-center h-full w-full p-6">
      {/* Messy Inputs */}
      <div className="flex gap-4 mb-8 w-full justify-center flex-wrap">
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-orange-50 flex items-center justify-center border border-orange-200">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">Tenstreet</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">Emails</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-green-50 flex items-center justify-center border border-green-200">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">HRIS</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center border border-red-200">
            <ShieldCheck className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">Safety</span>
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
              <h4 className="text-sm font-medium">Driver Onboarding</h4>
              <p className="text-xs text-muted-foreground">
                Candidate: John Doe
              </p>
            </div>
          </div>
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
            In Progress
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">Application Review</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">MVR Check</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-transparent animate-spin"></div>
            <span className="text-xs font-medium text-foreground">
              Drug Screen Results
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg opacity-50">
            <div className="h-4 w-4 rounded-full border border-muted-foreground"></div>
            <span className="text-xs">Orientation Scheduling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Billing & Claims Visual ---
export const BillingClaimsPreview = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-2 md:p-8">
      <div className="w-full max-w-5xl h-full bg-background border border-border rounded-xl shadow-sm overflow-hidden flex">
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex w-64 bg-muted/30 border-r border-border flex-col p-4 gap-4">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-sm">Nodal AI</span>
          </div>

          <div className="text-xs font-medium text-muted-foreground px-2">
            Today
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-xs text-foreground font-medium cursor-pointer">
            Claim #CLM-892 Discrepancy
          </div>
          <div className="px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            Driver Onboarding - John Doe
          </div>
          <div className="px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            Maintenance Request #442
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative min-w-0">
          {/* Header (Mobile only or minimal) */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 md:hidden shrink-0">
            <span className="font-medium text-sm">Claim #CLM-892</span>
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
                  I&apos;ve analyzed the documents for{" "}
                  <span className="font-medium">Invoice #4021</span>. The rate
                  matches the contract, but I detected a discrepancy in the
                  detention time claimed.
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
                  Okay, I have the signed POD showing the arrival and departure
                  times. Uploading it now.
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
                  Received. I&apos;ve verified the timestamps. The detention
                  charge is valid.
                </p>
                <p className="mt-2">
                  I&apos;ve updated the claim status to{" "}
                  <span className="text-green-600 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                    Ready for Payment
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Input Area - Natalie Style */}
          <div className="p-4 border-t bg-background/50">
            <div className="max-w-3xl mx-auto w-full relative">
              <div className="bg-background border border-primary/10 rounded-md min-h-20 p-3 text-sm text-muted-foreground relative">
                Message Nodal AI...
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
                  Nodal AI can make mistakes. Please verify important
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
