"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

import { supabase } from "@/lib/supabase";
import { useRouter } from "@/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Login");

  // useSWR for Check and Redirect logic
  const { data: loginCheck, isLoading: isChecking } = useSWR(
    user && !authLoading ? 'login-check' : null,
    async () => {
        // Check if user has MFA enabled but only AAL1 session
        const { data: { session } } = await supabase.auth.getSession();
        const { data: factors } = await supabase.auth.mfa.listFactors();

        const hasVerifiedMFA = factors?.totp?.some(
          (f) => f.status === "verified"
        );

        let needsMFA = false;
        if (hasVerifiedMFA) {
          // Let's check the assurance level from the session
          const currentLevel = session?.user?.app_metadata?.aal || "aal1";
          if (currentLevel === "aal1") {
            needsMFA = true;
          }
        }

        // Fetch memberships for redirect
        const { data: memberships } = await supabase
          .from("memberships")
          .select("organizations(slug)")
          .limit(1);
        
        return { needsMFA, memberships };
    },
    {
        shouldRetryOnError: false
    }
  );

  // Redirect Effect based on Data
  useEffect(() => {
    if (!loginCheck) return;

    if (loginCheck.needsMFA) {
       // Stop redirect, let MFA flow happen (handled by UI state if we were showing it, but here we just return)
       return; 
    }

    const { memberships } = loginCheck;
    if (
        memberships &&
        memberships.length > 0 &&
        memberships[0].organizations
    ) {
        // @ts-ignore
        router.push(`/nodal/${memberships[0].organizations.slug}/dashboard`);
    } else {
        router.push("/nodal/admin");
    }

  }, [loginCheck, router]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if MFA is required
        if (error.message.includes("MFA") || error.message.includes("factor")) {
          toast.info(
            "MFA verification required. Please check your authenticator app."
          );
          // Store email for MFA challenge page
          sessionStorage.setItem("mfa_email", email);
          router.push("/login/mfa-verify");
          return;
        }
        throw error;
      }

      // Check if user has MFA enabled
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      if (
        factorsData?.totp &&
        factorsData.totp.length > 0 &&
        factorsData.totp[0].status === "verified"
      ) {
        // MFA is enabled, redirect to challenge
        sessionStorage.setItem("mfa_email", email);
        sessionStorage.setItem("mfa_password", password);
        router.push("/login/mfa-verify");
        return;
      }

      // MFA NOT ENABLED - Force enrollment
      if (
        !factorsData?.totp ||
        factorsData.totp.length === 0 ||
        factorsData.totp[0].status !== "verified"
      ) {
        // Redirect to mandatory MFA setup
        router.push("/account/security/mfa-setup");
        return;
      }

      // This code should never be reached due to mandatory MFA
      // But kept as fallback
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: memberships } = await supabase
          .from("memberships")
          .select("organizations(slug)")
          .limit(1);

        if (
          memberships &&
          memberships.length > 0 &&
          memberships[0].organizations
        ) {
          // @ts-ignore
          router.push(`/nodal/${memberships[0].organizations.slug}/dashboard`);
        } else {
          toast.error(
            "No organization found. Please contact an administrator."
          );
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(t("enterEmailFirst"));
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      });
      if (error) throw error;
      toast.success(t("resetEmailSent"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-light tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Button
                  variant="link"
                  className="px-0 font-normal h-auto text-xs text-muted-foreground"
                  onClick={handleForgotPassword}
                  type="button"
                  disabled={loading}
                >
                  {t("forgotPassword")}
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
