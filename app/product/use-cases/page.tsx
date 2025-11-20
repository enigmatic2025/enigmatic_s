"use client";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DriverOnboardingFlow,
} from "@/components/layout/use-case-flows";
import {
  AssetMaintenancePreview,
  BillingClaimsPreview,
} from "@/components/layout/use-case-visualizations";

const useCases = [
  {
    title: "Driver Onboarding & Hiring",
    description:
      "Every carrier deals with chaotic onboarding workflows spread across Tenstreet, HRIS, email, spreadsheets, and safety checks. Nodal compresses this messy flow into one unified view, automating compliance steps and document collection.",
    component: <DriverOnboardingFlow />,
    className: "md:col-span-2",
  },
  {
    title: "Asset Maintenance & Inspections",
    description:
      "Maintenance is often reactive and fragmented. With Nodal, a technician submitting a DVIR triggers parts ordering, work assignments, and approvals automatically—orchestrating cross-team work beyond the TMS.",
    component: <AssetMaintenancePreview />,
    className: "md:col-span-1",
  },
  {
    title: "Billing & Claims Processing",
    description:
      "Accelerate cash flow by reducing leakage. Nodal provides a single workflow view for billing and claims, handling tasks, attachments, and validations before submitting clean data to your TMS or accounting system.",
    component: <BillingClaimsPreview />,
    className: "md:col-span-3",
  },
];

export default function UseCasesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden px-4 md:px-6 py-20">
        <AuroraBackground />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl mb-6">
              Use Cases
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-xl text-foreground/80 sm:text-2xl font-light"
          >
            See how Enigmatic and Nodal solve complex logistics challenges with precision and automation.
          </motion.div>
        </div>
      </section>

      {/* Use Cases Sections */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col bg-background p-8 md:p-10",
                useCase.className
              )}
            >
              <div className="mb-8 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">
                  {useCase.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>

              <div className="flex-1 w-full min-h-[500px] relative">
                {useCase.component}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-20 mb-20">
        <div className="rounded-3xl bg-muted/50 p-8 md:p-16 text-center border border-border">
          <h2 className="text-3xl md:text-4xl font-light mb-6">
            Have a unique challenge?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our platform is designed to be flexible. Let's discuss how we can tailor a solution for your specific needs.
          </p>
          <Button size="lg" className="text-lg px-8">
            Contact Us
          </Button>
        </div>
      </section>
    </main>
  );
}
