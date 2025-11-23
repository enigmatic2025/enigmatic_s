"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DriverOnboardingFlow,
  AssetMaintenanceFlow,
} from "@/components/layout/use-case-flows";
import { BillingClaimsPreview } from "@/components/layout/use-case-visualizations";
import { CTASection } from "@/components/layout/cta-section";

const useCases = [
  {
    title: "Driver Onboarding & Hiring",
    description:
      "Every carrier deals with chaotic onboarding workflows spread across Tenstreet, HRIS, email, spreadsheets, and safety checks. Nodal compresses this messy flow into one unified view, automating compliance steps and document collection.",
    component: <DriverOnboardingFlow />,
    className: "md:col-span-2",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    title: "Asset Maintenance & Inspections",
    description:
      "Maintenance is often reactive and fragmented. With Nodal, a technician submitting a DVIR triggers parts ordering, work assignments, and approvals automatically, orchestrating cross-team work beyond the TMS.",
    component: <AssetMaintenanceFlow />,
    className: "md:col-span-1",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    title: "Billing & Claims Processing",
    description:
      "Accelerate cash flow by reducing leakage. Nodal provides a single workflow view for billing and claims, handling tasks, attachments, and validations before submitting clean data to your TMS or accounting system.",
    component: <BillingClaimsPreview />,
    className: "md:col-span-3",
    minHeight: "min-h-[500px] md:min-h-[600px]",
  },
];

export default function UseCasesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex w-full flex-col justify-center overflow-hidden px-4 md:px-6 pt-28 pb-12 md:pt-40 md:pb-20">
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-normal tracking-tight max-w-3xl leading-[1.15] text-left"
          >
            <span className="text-foreground">Use Cases. </span>
            <span className="text-muted-foreground">
              See how Enigmatic and Nodal solve complex logistics challenges
              with precision and automation.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Use Cases Sections */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col bg-background p-6 md:p-10",
                useCase.className
              )}
            >
              <div className="mb-8 max-w-2xl">
                <h2 className="text-xl md:text-2xl font-normal tracking-tight text-foreground mb-4">
                  {useCase.title}
                </h2>
                <p className="text-base text-secondary-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>

              <div className={cn("w-full relative", useCase.minHeight)}>
                <div className="absolute inset-0 w-full h-full">
                  {useCase.component}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Have a unique challenge?"
        description="Our team of engineers can build custom workflows tailored to your specific operational needs."
        hideSignIn={true}
      />
    </main>
  );
}
