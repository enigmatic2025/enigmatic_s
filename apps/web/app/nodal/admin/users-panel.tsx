'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash, RotateCw, Shield, Lock, Ban } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
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
  const [users, setUsers] = useState<User[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    user_type: 'standard', // 'system' | 'standard'
    role: 'member', // Org role
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
      toast.error('Failed to fetch users')
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
      toast.error('Failed to fetch organizations')
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
      setFormData({ email: '', full_name: '', password: '', user_type: 'standard', role: 'member', organization_id: '' })
      fetchUsers()
      toast.success("User created successfully")
    } catch (error) {
      toast.error('Error creating user')
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
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Error updating user')
    }
  }

  const handleDelete = async (user: User) => {
    // We'll use a custom dialog or just toast confirmation in a real app, 
    // but for now standard confirm is okay or we can skip it if we trust the user.
    // However, to stick to "no alerts", let's just proceed or use a better UI pattern later.
    // For this pass, I will keep confirm but replace alert errors.
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
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handlePromote = async (user: User) => {
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
        toast.success('User promoted successfully')
    } catch (error) {
        toast.error('Error promoting user')
    }
  }

  const handleBlock = async (user: User) => {
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
        toast.success(`User ${action}ed successfully`)
    } catch (error) {
        toast.error(`Error: ${error}`)
    }
  }

  const handleResetMFA = async (user: User) => {
    if (!confirm(`Reset MFA for ${user.email}?`)) return

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/admin/users/${user.id}/reset-mfa`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        })

        if (!res.ok) throw new Error('Failed to reset MFA')
        toast.success('MFA reset successfully')
    } catch (error) {
        toast.error('Error resetting MFA')
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
        toast.success('Password changed successfully')
    } catch (error) {
        toast.error('Error changing password')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-normal">All Users</h3>
        <Button onClick={() => {
            setFormData({ email: '', full_name: '', password: '', user_type: 'standard', role: 'member', organization_id: '' })
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
                   {/* 
                       Backend now returns memberships with organizations.
                       We check if user has memberships and use the first one's organization name.
                       If not found, we fallback to finding by ID in the orgs list.
                   */}
                   {(() => {
                       // Check for nested memberships from backend join
                       const userAny = user as any
                       if (userAny.memberships && userAny.memberships.length > 0 && userAny.memberships[0].organizations) {
                           return userAny.memberships[0].organizations.name
                       }
                       // Fallback to old method
                       return orgs.find(o => o.id === user.organization_id)?.name || 'No Org'
                   })()}
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
              <Label>User Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="type-standard"
                    name="user_type"
                    value="standard"
                    checked={formData.user_type === 'standard'}
                    onChange={() => setFormData({...formData, user_type: 'standard'})}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="type-standard" className="font-normal">Standard User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="type-system"
                    name="user_type"
                    value="system"
                    checked={formData.user_type === 'system'}
                    onChange={() => {
                        // Auto-select Enigmatic org if found
                        const enigmaticOrg = orgs.find(o => o.name === 'Enigmatic')
                        setFormData({
                            ...formData, 
                            user_type: 'system',
                            organization_id: enigmaticOrg?.id || '',
                            role: 'member' // Default role in the org
                        })
                    }}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="type-system" className="font-normal">System Admin</Label>
                </div>
              </div>
            </div>

            {/* Show Org/Role selection for Standard Users OR System Admins (read-only/disabled for system if we want to enforce Enigmatic) */}
            {/* User requested "still need to put in their org", so let's show it for both, but maybe lock it for System Admin if we found Enigmatic */}
            
            <div className="grid gap-2">
              <Label htmlFor="org">Organization</Label>
              <Select 
                value={formData.organization_id}
                onValueChange={(val) => setFormData({...formData, organization_id: val})}
                disabled={formData.user_type === 'system' && !!orgs.find(o => o.name === 'Enigmatic')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                    {orgs.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.user_type === 'system' && (
                  <p className="text-xs text-muted-foreground">System Admins must belong to the Enigmatic organization.</p>
              )}
            </div>

            {formData.user_type === 'standard' && (
                <div className="grid gap-2">
                  <Label htmlFor="role">Organization Role</Label>
                  <Select defaultValue="member" onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            )}
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
