"use client";

import { WaveLoader } from "@/components/ui/wave-loader";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <WaveLoader size="lg" />
    </div>
  );
}
