"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface CTAButtonsProps {
  className?: string;
  hideSignIn?: boolean;
}

export function CTAButtons({ className, hideSignIn = false }: CTAButtonsProps) {
  const { user } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const t = useTranslations("Navigation");

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
      <Button className="w-full sm:w-auto hover:bg-black dark:hover:bg-white" asChild>
        <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
          {t("collaborate")}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </Button>
      {!hideSignIn && (
        <Button 
          variant="outline"
          className="w-full sm:w-auto border-none bg-muted"
          asChild
        >
          {user && dashboardUrl ? (
            <Link href={dashboardUrl}>{t("dashboard")}</Link>
          ) : (
            <Link href="/login">{t("signIn")}</Link>
          )}
        </Button>
      )}
    </div>
  );
}
