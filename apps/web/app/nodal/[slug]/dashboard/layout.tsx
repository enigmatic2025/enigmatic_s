'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Workflow, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [orgs, setOrgs] = useState<any[]>([])
  const [currentOrg, setCurrentOrg] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch user's organizations
      const { data: memberships, error: memError } = await supabase
        .from('memberships')
        .select('org_id, role, organizations(id, name, slug)')
      
      if (memError) {
        console.error('Error fetching orgs:', memError)
        return
      }

      if (memberships && memberships.length > 0) {
        const organizations = memberships.map((m: any) => m.organizations)
        setOrgs(organizations)
        setCurrentOrg(organizations[0]) // Default to first org
      } else {
        // No orgs, redirect to onboarding
        router.push('/onboarding')
      }
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: `/nodal/${currentOrg?.slug}/dashboard`, icon: LayoutDashboard },
    { name: 'Workflows', href: `/nodal/${currentOrg?.slug}/dashboard/workflows`, icon: Workflow },
    { name: 'Members', href: `/nodal/${currentOrg?.slug}/dashboard/members`, icon: Users },
    { name: 'Settings', href: `/nodal/${currentOrg?.slug}/dashboard/settings`, icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-center border-b border-border px-6 flex-shrink-0">
          <span className="text-2xl font-light tracking-widest text-foreground">NODAL</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Org Switcher Placeholder */}
          <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between cursor-pointer hover:bg-muted transition-colors">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Organization</span>
              <span className="text-sm font-medium truncate">{currentOrg?.name || 'Loading...'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-200">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border lg:hidden">
          <button
            type="button"
            className="px-4 text-muted-foreground focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-center items-center lg:justify-start">
             <span className="text-xl font-light tracking-widest text-foreground lg:hidden">NODAL</span>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
