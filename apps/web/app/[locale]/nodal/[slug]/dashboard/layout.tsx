"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/navigation";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auth + MFA check (not data fetching — stays as useEffect)
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // @ts-ignore
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (!factorsError && (!factorsData?.totp || factorsData.totp.length === 0 || factorsData.totp[0].status !== 'verified')) {
        router.push("/account/security/mfa-setup");
        return;
      }

      setAuthReady(true);
    };

    checkAuth();
  }, [router]);

  // Fetch memberships via SWR (only after auth is confirmed)
  const { data: memberships } = useSWR(
    authReady ? "/api/user/memberships" : null,
    async (url: string) => {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(url, {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      if (!res.ok) throw new Error("Failed to fetch memberships");
      return res.json();
    }
  );

  // Handle membership data — redirect to onboarding or set current org
  useEffect(() => {
    if (memberships === undefined) return; // still loading
    if (memberships && memberships.length > 0) {
      const organizations = memberships.map((m: any) => m.organizations);
      setCurrentOrg(organizations[0]);
    } else {
      router.push("/onboarding");
    }
  }, [memberships, router]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isFlowStudioDesign = pathname?.includes("/flow-studio/design");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        currentOrg={currentOrg}
      />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen
            ? (isFlowStudioDesign ? "lg:ml-[400px]" : "lg:ml-64")
            : "lg:ml-16"
        }`}
      >
        <TopBar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
        />

        {/* Page Content */}
        <main className={`flex-1 ${pathname?.includes('/natalie') || pathname?.includes('/action-flows/') ? 'h-[calc(100vh-3.5rem)]' : 'p-6'}`}>
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
