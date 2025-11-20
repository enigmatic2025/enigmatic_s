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
              <p className="text-xs text-muted-foreground">Candidate: John Doe</p>
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
            <span className="text-xs font-medium text-foreground">Drug Screen Results</span>
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

// --- Asset Maintenance Visual ---
export const AssetMaintenancePreview = () => {
  return (
    <div className="relative flex flex-col items-center h-full w-full pt-6 pb-4">
      {/* Step 1: DVIR Submission */}
      <FlowBlock
        label="DVIR Submitted"
        subLabel="Technician App"
        icon={Truck}
        className="z-10 w-64"
      />

      {/* Edge 1 */}
      <div className="h-6 w-px bg-border my-1"></div>

      {/* Step 2: Logic / Trigger */}
      <div className="relative z-10 bg-background border border-border rounded-lg p-2 shadow-sm flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium">Defect Detected: Brakes</span>
      </div>

      {/* Edge 2 (Branching) */}
      <div className="h-6 w-px bg-border my-1"></div>
      
      {/* Parallel Actions Container */}
      <div className="flex gap-4 w-full justify-center">
        {/* Left Branch: Parts */}
        <div className="flex flex-col items-center">
           <div className="w-px h-4 bg-border mb-1"></div>
           <FlowBlock
            label="Order Parts"
            subLabel="Inventory System"
            icon={ShoppingCart}
            className="w-48 scale-90"
          />
        </div>

        {/* Right Branch: Assignment */}
        <div className="flex flex-col items-center">
           <div className="w-px h-4 bg-border mb-1"></div>
           <FlowBlock
            label="Assign Mechanic"
            subLabel="Shop Schedule"
            icon={Wrench}
            className="w-48 scale-90"
          />
        </div>
      </div>

      {/* Edge 3 (Converge) */}
      <div className="h-6 w-px bg-border my-1 mt-2"></div>

      {/* Final Step */}
      <FlowBlock
        label="Update Fleet Status"
        subLabel="ERP & TMS"
        icon={Database}
        iconBg="bg-green-100 text-green-600"
        className="z-10 w-64"
      />
    </div>
  );
};

// --- Billing & Claims Visual ---
export const BillingClaimsPreview = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 border-b border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Claim Processing #CLM-892</span>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Automated</span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Documents Row */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 bg-background border border-border rounded p-2 min-w-[120px]">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] font-medium">BOL.pdf</span>
                <span className="text-[8px] text-green-600">Matched</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded p-2 min-w-[120px]">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] font-medium">POD.pdf</span>
                <span className="text-[8px] text-green-600">Verified</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded p-2 min-w-[120px]">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] font-medium">Invoice</span>
                <span className="text-[8px] text-green-600">Approved</span>
              </div>
            </div>
          </div>

          {/* Validation Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rate Validation</span>
              <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passed</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Accessorial Check</span>
              <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passed</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Duplicate Check</span>
              <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passed</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-border mt-2">
             <button className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
               <Database className="h-3 w-3" />
               Submit to Accounting (QuickBooks)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
