'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SystemAdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      fetchData()
    }
    checkUser()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const headers = {
        'Authorization': `Bearer ${session.access_token}`
      }

      // Fetch Users
      const usersRes = await fetch('/api/admin/users', { headers })
      if (usersRes.ok) {
        setUsers(await usersRes.json())
      }

      // Fetch Orgs
      const orgsRes = await fetch('/api/admin/orgs', { headers })
      if (orgsRes.ok) {
        setOrgs(await orgsRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch admin data', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to System Admin?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (!res.ok) throw new Error('Failed to promote')

      alert('User promoted successfully')
      fetchData() // Refresh list
    } catch (error) {
      alert('Error promoting user')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-light text-foreground">System Admin</h1>
          <div className="text-sm text-muted-foreground">
            Logged in as: {currentUser?.email}
          </div>
        </div>

        {/* Users Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light text-foreground">Users</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-3">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="text-sm font-medium text-foreground">{user.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground ml-2">({user.email})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.system_role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.system_role !== 'admin' && (
                        <button
                          onClick={() => handlePromote(user.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          Promote to Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orgs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light text-foreground">Organizations</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {org.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {org.subscription_plan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
