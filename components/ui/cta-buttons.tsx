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
      <Button
        size="lg"
        className="text-lg px-8 h-14 rounded-full w-full sm:w-auto"
        asChild
      >
        <Link href="/contact">
          Collaborate
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="text-lg px-8 h-14 rounded-full w-full sm:w-auto"
        asChild
      >
        <Link href="/login">Sign In</Link>
      </Button>
    </div>
  );
}
