"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";

interface CTAButtonsProps {
  className?: string;
  hideSignIn?: boolean;
}

export function CTAButtons({ className, hideSignIn = false }: CTAButtonsProps) {
  const { user } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);

  useEffect(() => {
    const getDashboardUrl = async () => {
      if (!user) {
        setDashboardUrl(null);
        return;
      }

      const { data: memberships } = await supabase
        .from('memberships')
        .select('organizations(slug)')
        .limit(1);

      if (memberships && memberships.length > 0 && memberships[0].organizations) {
        // @ts-ignore
        setDashboardUrl(`/nodal/${memberships[0].organizations.slug}/dashboard`);
      } else {
        setDashboardUrl('/nodal/admin');
      }
    };

    getDashboardUrl();
  }, [user]);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 w-full sm:w-auto",
        className
      )}
    >
      <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto" asChild>
        <Link href="/contact">
          Collaborate
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </Button>
      {!hideSignIn && (
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 h-14 w-full sm:w-auto"
          asChild
        >
          {user && dashboardUrl ? (
            <Link href={dashboardUrl}>Dashboard</Link>
          ) : (
            <Link href="/login">Sign In</Link>
          )}
        </Button>
      )}
    </div>
  );
}
