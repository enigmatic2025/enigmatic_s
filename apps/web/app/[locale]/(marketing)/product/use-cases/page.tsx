"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  DriverOnboardingFlow,
  AssetMaintenanceFlow,
  ManufacturingFlow,
  ConstructionFlow,
} from "@/components/layout/use-case-flows";
import {
  BillingClaimsPreview,
  ManufacturingMaterialFlowPreview,
  ConstructionSiteCoordinationPreview,
} from "@/components/layout/use-case-visualizations";
import { CTASection } from "@/components/layout/cta-section";

const useCases = [
  {
    id: "onboarding",
    component: <DriverOnboardingFlow />,
    className: "md:col-span-2",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    id: "maintenance",
    component: <AssetMaintenanceFlow />,
    className: "md:col-span-1",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    id: "billing",
    component: <BillingClaimsPreview />,
    className: "md:col-span-3",
    minHeight: "min-h-[500px] md:min-h-[600px]",
  },
  {
    id: "predictive",
    component: <ManufacturingFlow />,
    className: "md:col-span-2",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    id: "production",
    component: <ManufacturingMaterialFlowPreview />,
    className: "md:col-span-1",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    id: "field",
    component: <ConstructionSiteCoordinationPreview />,
    className: "md:col-span-1",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
  {
    id: "construction",
    component: <ConstructionFlow />,
    className: "md:col-span-2",
    minHeight: "min-h-[500px] md:min-h-[800px]",
  },
];

export default function UseCasesPage() {
  const t = useTranslations("UseCasesPage");

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
            <span className="text-foreground">{t("title")} </span>
            <span className="text-muted-foreground">
              {t("description")}
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
                  {t(`cards.${useCase.id}`)}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(`cards.${useCase.id}Desc`)}
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
        title={t("ctaTitle")}
        description={t("ctaDescription")}
      />
    </main>
  );
}
