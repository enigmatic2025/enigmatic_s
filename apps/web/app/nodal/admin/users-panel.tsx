'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash, RotateCw, Shield, Lock, Ban } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UsersPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'member',
    organization_id: '',
  })
  const [passwordData, setPasswordData] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchOrgs()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) setUsers(await res.json())
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrgs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/orgs', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) setOrgs(await res.json())
    } catch (error) {
      console.error('Error fetching orgs:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create user')

      setIsCreateOpen(false)
      setFormData({ email: '', full_name: '', password: '', role: 'member', organization_id: '' })
      fetchUsers()
      alert("User created successfully (Note: If backend returns success but user doesn't appear, check backend logs regarding Supabase Admin API)")
    } catch (error) {
      alert('Error creating user')
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email
        })
      })

      if (!res.ok) throw new Error('Failed to update user')

      setIsUpdateOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      alert('Error updating user')
    }
  }

  const handleDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      if (!res.ok) throw new Error('Failed to delete user')

      fetchUsers()
    } catch (error) {
      alert('Error deleting user')
    }
  }

  const handlePromote = async (user: any) => {
    if (!confirm(`Promote ${user.email} to System Admin?`)) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch('/api/admin/promote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ user_id: user.id })
        })

        if (!res.ok) throw new Error('Failed to promote')
        fetchUsers()
        alert('User promoted successfully')
    } catch (error) {
        alert('Error promoting user')
    }
  }

  const handleBlock = async (user: any) => {
    const action = user.blocked ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/admin/users/${user.id}/block`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ blocked: !user.blocked })
        })

        if (!res.ok) throw new Error(`Failed to ${action} user`)
        fetchUsers()
    } catch (error) {
        alert(`Error: ${error}`)
    }
  }

  const handleResetMFA = async (user: any) => {
    if (!confirm(`Reset MFA for ${user.email}?`)) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/admin/users/${user.id}/reset-mfa`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        })

        if (!res.ok) throw new Error('Failed to reset MFA')
        alert('MFA reset successfully')
    } catch (error) {
        alert('Error resetting MFA')
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUser) return
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ password: passwordData })
        })

        if (!res.ok) throw new Error('Failed to change password')

        setIsChangePasswordOpen(false)
        setPasswordData('')
        alert('Password changed successfully')
    } catch (error) {
        alert('Error changing password')
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-normal">All Users</h3>
        <Button onClick={() => {
            setFormData({ email: '', full_name: '', password: '', role: 'member', organization_id: '' })
            setIsCreateOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.full_name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                   {/* This assumes user object has organization_id and we can map it,
                       or backend joins it. The current backend handler just selects * from profiles.
                       Profiles table might not have organization name directly.
                       For now displaying ID or handling if possible. */}
                   {orgs.find(o => o.id === user.organization_id)?.name || 'No Org'}
                </TableCell>
                <TableCell className="capitalize">{user.system_role}</TableCell>
                <TableCell>
                    {user.blocked ? (
                        <span className="text-destructive font-medium">Blocked</span>
                    ) : (
                        <span className="text-green-600 font-medium">Active</span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setFormData({ ...formData, full_name: user.full_name, email: user.email })
                          setIsUpdateOpen(true)
                      }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setIsChangePasswordOpen(true)
                      }}>
                        <Lock className="mr-2 h-4 w-4" /> Change Password
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetMFA(user)}>
                        <RotateCw className="mr-2 h-4 w-4" /> Reset MFA
                      </DropdownMenuItem>
                      {user.system_role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handlePromote(user)}>
                            <Shield className="mr-2 h-4 w-4" /> Promote to Admin
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleBlock(user)}>
                        <Ban className="mr-2 h-4 w-4" /> {user.blocked ? 'Unblock' : 'Block'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org">Organization</Label>
              <Select onValueChange={(val) => setFormData({...formData, organization_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                    {orgs.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="member" onValueChange={(val) => setFormData({...formData, role: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" value={formData.email} disabled />
                {/* Email usually hard to change without verify, keeping it disabled or enabled based on logic */}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-fullname">Full Name</Label>
              <Input id="edit-fullname" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={passwordData} onChange={(e) => setPasswordData(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
