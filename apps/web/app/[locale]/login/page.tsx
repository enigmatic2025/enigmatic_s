"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

import { supabase, getUserOrgSlug } from "@/lib/supabase";
import { useRouter } from "@/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { WaveLoader } from "@/components/ui/wave-loader";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Login");

  // useSWR for Check and Redirect logic
  const { data: loginCheck } = useSWR(
    user && !authLoading ? 'login-check' : null,
    async () => {
        // Check MFA assurance level using proper Supabase API
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const { data: factors } = await supabase.auth.mfa.listFactors();

        const hasVerifiedMFA = factors?.totp?.some(
          (f) => f.status === "verified"
        );

        // User has MFA set up but session is only AAL1 — needs to verify
        const needsMFA = hasVerifiedMFA && aalData?.currentLevel === "aal1";

        const orgSlug = await getUserOrgSlug();

        return { needsMFA, orgSlug };
    },
    {
        shouldRetryOnError: false
    }
  );

  // Redirect Effect based on Data
  useEffect(() => {
    if (!loginCheck) return;

    if (loginCheck.needsMFA) {
       routerRef.current.push("/login/mfa-verify");
       return;
    }

    if (loginCheck.orgSlug) {
        routerRef.current.push(`/nodal/${loginCheck.orgSlug}/dashboard`);
    } else {
        toast.error("No organization found. Please contact an administrator.");
    }

  }, [loginCheck]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <WaveLoader size="md" barClassName="bg-muted-foreground" />
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if user has MFA enabled
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      if (
        factorsData?.totp &&
        factorsData.totp.length > 0 &&
        factorsData.totp[0].status === "verified"
      ) {
        // MFA is enabled — session is at AAL1, redirect to verify
        routerRef.current.push("/login/mfa-verify");
        return;
      }

      // MFA NOT ENABLED - Force enrollment
      routerRef.current.push("/account/security/mfa-setup");
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
