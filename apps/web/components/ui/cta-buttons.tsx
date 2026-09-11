"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTAButtonsProps {
  className?: string;
}

export function CTAButtons({ className }: CTAButtonsProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 w-full sm:w-auto",
        className
      )}
    >
      <Button className="w-full sm:w-auto hover:bg-black dark:hover:bg-white" asChild>
        <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
          Collaborate
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
