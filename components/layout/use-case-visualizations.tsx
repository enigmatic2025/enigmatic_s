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
} from "lucide-react";
import { FlowBlock } from "@/components/layout/nodal-visualizations";

// --- Driver Onboarding Visual ---
export const DriverOnboardingPreview = () => {
  return (
    <div className="relative flex flex-col items-center h-full w-full p-6">
      {/* Messy Inputs */}
      <div className="flex gap-4 mb-8 w-full justify-center">
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
      <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-lg p-4 relative overflow-hidden">
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
    <div className="relative flex flex-col items-center justify-center h-full w-full p-4 md:p-8">
      <div className="w-full h-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* App Header */}
        <div className="h-14 border-b border-border bg-muted/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer">
                Claims
              </span>
              <span>/</span>
              <span className="text-foreground">#CLM-892</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">
              Ready for Payment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Document Viewer */}
          <div className="flex-1 bg-muted/10 p-6 border-r border-border flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Attached Documents (3)</h4>
              <button className="text-xs text-primary hover:underline">
                View All
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Bill of Lading.pdf", type: "PDF", size: "1.2 MB" },
                { name: "Proof of Delivery.pdf", type: "PDF", size: "840 KB" },
                { name: "Invoice #4021.pdf", type: "PDF", size: "450 KB" },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="group relative aspect-3/4 bg-background border border-border rounded-lg p-3 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="h-8 w-8 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  </div>

                  {/* Document Skeleton Preview */}
                  <div className="flex-1 w-full my-3 space-y-2 opacity-30">
                    <div className="h-1.5 w-3/4 bg-foreground/20 rounded-full" />
                    <div className="h-1.5 w-full bg-foreground/20 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-foreground/20 rounded-full" />
                    <div className="h-1.5 w-full bg-foreground/20 rounded-full" />
                  </div>

                  <div>
                    <p className="text-xs font-medium truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {doc.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Nodal AI verified all line items against rate sheet.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rate Match</span>
                  <span className="text-green-600 font-medium">100% Match</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fuel Surcharge</span>
                  <span className="text-green-600 font-medium">
                    Verified ($452.00)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Validation & Actions */}
          <div className="w-80 bg-background p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h4 className="text-sm font-medium mb-4">Validation Checklist</h4>
              <div className="space-y-3">
                {[
                  { label: "Carrier Active", status: "success" },
                  { label: "Insurance Valid", status: "success" },
                  { label: "Rate Confirmation", status: "success" },
                  { label: "POD Signature", status: "success" },
                  { label: "No Claims Found", status: "success" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span className="text-foreground/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h4 className="text-sm font-medium mb-4">Payment Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Line Haul</span>
                  <span>$2,400.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel</span>
                  <span>$452.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lumper</span>
                  <span>$150.00</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>$3,002.00</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve for Payment
              </button>
              <button className="w-full mt-3 bg-muted text-muted-foreground h-10 rounded-md font-medium text-sm hover:bg-muted/80 transition-colors">
                Flag for Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
