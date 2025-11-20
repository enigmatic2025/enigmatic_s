import { Hero } from "@/components/layout/hero";
import { MissionQuote } from "@/components/layout/mission-quote";
import { ProblemSection } from "@/components/layout/problem-section";
import { ServicesSection } from "@/components/layout/services-section";
import { NodalPlatformSection } from "@/components/layout/nodal-platform-section";
import { PrinciplesSection } from "@/components/layout/principles-section";
import { CTASection } from "@/components/layout/cta-section";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <MissionQuote />
      <ProblemSection />
      <ServicesSection />
      <NodalPlatformSection />
      <PrinciplesSection />
      <CTASection />
    </div>
  );
}
