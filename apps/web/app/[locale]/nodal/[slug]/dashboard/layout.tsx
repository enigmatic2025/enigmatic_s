"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch user's organizations
      const { data: memberships, error: memError } = await supabase
        .from("memberships")
        .select("org_id, role, organizations(id, name, slug)");

      if (memError) {
        console.error("Error fetching orgs:", memError);
        return;
      }

      // Check for MFA factors
      // @ts-ignore - Supabase type definitions might be slightly outdated on listFactors directly on auth
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (!factorsError && (!factorsData?.totp || factorsData.totp.length === 0 || factorsData.totp[0].status !== 'verified')) {
         // No Verified MFA found -> Redirect to Setup
         router.push("/account/security/mfa-setup");
         return;
      }

      if (memberships && memberships.length > 0) {
        const organizations = memberships.map((m: any) => m.organizations);
        setCurrentOrg(organizations[0]); // Default to first org
      } else {
        router.push("/onboarding");
      }
    };

    getUser();
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            ? (usePathname().includes("/flow-studio/design") ? "lg:ml-[400px]" : "lg:ml-64")
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
