'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersPanel } from './users-panel'
import { OrganizationsPanel } from './organizations-panel'
import { motion, AnimatePresence } from 'framer-motion'

export default function SystemAdminPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orgs')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check System Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('system_role')
        .eq('id', user.id)
        .single()

      if (profile?.system_role !== 'admin') {
        router.push('/login') // Or a 403 page
        return
      }

      setCurrentUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-light text-foreground">System Administration</h1>
          <p className="text-muted-foreground">Manage organizations, users, and system settings.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="orgs">Organizations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {activeTab === 'orgs' ? (
                <motion.div
                  key="orgs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OrganizationsPanel />
                </motion.div>
              ) : (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UsersPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
