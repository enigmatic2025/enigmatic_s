"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { getUserOrgSlug } from "@/lib/supabase";
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

      const slug = await getUserOrgSlug();
      if (slug) {
        setDashboardUrl(`/nodal/${slug}/dashboard/flow-studio`);
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
      <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto hover:bg-black dark:hover:bg-white" asChild>
        <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
          {t("collaborate")}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </Button>
      {!hideSignIn && (
        <Button 
          size="lg"
          variant="outline"
          className="text-lg px-8 h-14 w-full sm:w-auto border-none bg-muted  "
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
