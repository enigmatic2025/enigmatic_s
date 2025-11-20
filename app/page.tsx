import { Header } from "@/components/layout/header";
import { Hero } from "@/components/layout/hero";
import { MissionQuote } from "@/components/layout/mission-quote";
import { ProblemSection } from "@/components/layout/problem-section";
import { ServicesSection } from "@/components/layout/services-section";
import { NodalPlatformSection } from "@/components/layout/nodal-platform-section";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Header transparent />
      <Hero />
      <MissionQuote />
      <ProblemSection />
      <ServicesSection />
      <NodalPlatformSection />
    </div>
  );
}
