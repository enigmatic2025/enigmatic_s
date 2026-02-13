'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopBar } from '@/components/admin/admin-top-bar'
import { Spinner } from '@/components/ui/spinner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            // Check if user belongs to "Enigmatic" organization
            const { data: memberships } = await supabase
                .from('memberships')
                .select('id, org_id, role, organizations!inner(name)')
                .eq('user_id', user.id)

            const isEnigmaticMember = memberships?.some((m: any) => 
                m.organizations?.name === 'Enigmatic'
            )

            if (!isEnigmaticMember) { router.push('/login'); return }

            setUser(user)
            setLoading(false)
        }
        checkAdmin()
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
                sidebarOpen ? "lg:ml-64" : "lg:ml-16"
            }`}>
                <AdminTopBar
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                    user={user}
                />

                {/* Page Content */}
                <main className="flex-1 p-6">
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
    )
}
