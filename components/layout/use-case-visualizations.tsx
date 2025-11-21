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
} from "lucide-react";
import { FlowBlock } from "@/components/layout/nodal-visualizations";

// --- Driver Onboarding Visual ---
export const DriverOnboardingPreview = () => {
  return (
    <div className="relative flex flex-col items-center h-full w-full p-6">
      {/* Messy Inputs */}
      <div className="flex gap-4 mb-8 w-full justify-center flex-wrap">
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center border border-orange-200">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">Tenstreet</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">Emails</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center border border-green-200">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-[10px] text-muted-foreground">HRIS</span>
        </div>
        <div className="flex flex-col gap-2 items-center opacity-70 scale-90">
          <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center border border-red-200">
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
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
      <div className="w-full max-w-5xl h-[600px] bg-background border border-border rounded-xl shadow-sm overflow-hidden flex">
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
            {/* AI Message 1 */}
            <div className="flex gap-3 md:gap-4 max-w-3xl mx-auto">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="text-sm font-medium">Nodal AI</div>
                <div className="text-sm leading-relaxed text-muted-foreground wrap-break-word">
                  <p>
                    I&apos;ve analyzed the documents for{" "}
                    <span className="text-foreground font-medium">
                      Invoice #4021
                    </span>
                    . The rate matches the contract, but I detected a
                    discrepancy in the detention time claimed.
                  </p>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 md:gap-4 max-w-3xl mx-auto">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="text-sm font-medium">Operations Manager</div>
                <div className="text-sm leading-relaxed text-foreground wrap-break-word">
                  <p>
                    Okay, I have the signed POD showing the arrival and
                    departure times. Uploading it now.
                  </p>
                </div>
                {/* Attachment Card */}
                <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/20 w-full md:w-fit mt-2 max-w-full overflow-hidden">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 shrink-0 flex items-center justify-center text-red-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Signed_POD.pdf</p>
                    <p className="text-xs text-muted-foreground">840 KB</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2 shrink-0" />
                </div>
              </div>
            </div>

            {/* AI Message 2 */}
            <div className="flex gap-3 md:gap-4 max-w-3xl mx-auto">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="text-sm font-medium">Nodal AI</div>
                <div className="text-sm leading-relaxed text-muted-foreground wrap-break-word">
                  <p>
                    Received. I&apos;ve verified the timestamps. The detention
                    charge is valid.
                  </p>
                  <p className="mt-2">
                    I&apos;ve updated the claim status to{" "}
                    <span className="text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs inline-block mt-1 md:mt-0">
                      Ready for Payment
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 pt-2">
            <div className="max-w-3xl mx-auto relative">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Message Nodal AI..."
                  className="w-full bg-muted/30 border border-border rounded-2xl py-3.5 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  disabled
                />
                <button className="absolute right-2 p-1.5 rounded-lg bg-primary text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </button>
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
