import { Hero } from "@/components/layout/hero";
import { MissionQuote } from "@/components/layout/mission-quote";
import { ProblemSection } from "@/components/layout/problem-section";
import { ServicesSection } from "@/components/layout/services-section";
import { ProcessSection } from "@/components/layout/process-section";
import { NodalPlatformSection } from "@/components/layout/nodal-platform-section";
import { PrinciplesSection } from "@/components/layout/principles-section";
import { CTASection } from "@/components/layout/cta-section";
import { TechStack } from "@/components/company/tech-stack";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <TechStack />
      <MissionQuote />
      <ProblemSection />
      <ServicesSection />
      <ProcessSection />
      <NodalPlatformSection />
      <PrinciplesSection />
      <CTASection />
    </div>
  );
}
