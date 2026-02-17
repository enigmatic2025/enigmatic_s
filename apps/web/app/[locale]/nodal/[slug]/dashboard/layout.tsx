"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/navigation";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import LoadingPage from "@/components/loading-page";

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
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });
  const pathname = usePathname();

  // Auth + MFA check (not data fetching — stays as useEffect)
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        routerRef.current.push("/login");
        return;
      }
      setUser(user);

      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (!factorsError && (!factorsData?.totp || factorsData.totp.length === 0 || factorsData.totp[0].status !== 'verified')) {
        routerRef.current.push("/account/security/mfa-setup");
        return;
      }

      setAuthReady(true);
    };

    checkAuth();
  }, []);

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
    },
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  // Handle membership data — set current org or redirect to login
  useEffect(() => {
    if (memberships === undefined) return; // still loading
    if (memberships && memberships.length > 0) {
      const organizations = memberships.map((m: any) => m.organizations);
      setCurrentOrg(organizations[0]);
    } else {
      routerRef.current.push("/login");
    }
  }, [memberships]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isFlowStudioDesign = pathname?.includes("/flow-studio/design");

  // Don't render dashboard until auth is confirmed and org is resolved
  if (!authReady || !currentOrg) {
    return <LoadingPage />;
  }

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
            ? (isFlowStudioDesign ? "lg:ml-100" : "lg:ml-64")
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
