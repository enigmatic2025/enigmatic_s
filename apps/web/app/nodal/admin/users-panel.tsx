'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash, RotateCw, Shield, Lock, Ban, UserCog } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { CreateUserDialog, UpdateUserDialog, ChangePasswordDialog, ChangeRoleDialog } from "@/components/admin/user-dialogs"

export function UsersPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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

  const handleCreate = async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('Failed to create user')

      setIsCreateOpen(false)
      fetchUsers()
      toast.success("User created successfully")
    } catch (error) {
      toast.error('Error creating user')
    }
  }

  const handleUpdate = async (data: any) => {
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
        body: JSON.stringify(data)
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

  const handleChangePassword = async (password: string) => {
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
            body: JSON.stringify({ password })
        })

        if (!res.ok) throw new Error('Failed to change password')

        setIsChangePasswordOpen(false)
        toast.success('Password changed successfully')
    } catch (error) {
        toast.error('Error changing password')
    }
  }

  const handleChangeRole = async (role: string) => {
    if (!selectedUser) return
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ role })
        })

        if (!res.ok) throw new Error('Failed to change role')

        setIsChangeRoleOpen(false)
        fetchUsers()
        toast.success('Role updated successfully')
    } catch (error) {
        toast.error('Error changing role')
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
        <Button onClick={() => setIsCreateOpen(true)}>
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
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-black text-white">
                            {user.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   {(() => {
                       const userAny = user as any
                       if (userAny.memberships && userAny.memberships.length > 0 && userAny.memberships[0].organizations) {
                           return (
                               <Badge variant="outline" className="font-normal">
                                   {userAny.memberships[0].organizations.name}
                               </Badge>
                           )
                       }
                       const orgName = orgs.find(o => o.id === user.organization_id)?.name
                       return orgName ? (
                           <Badge variant="outline" className="font-normal">{orgName}</Badge>
                       ) : (
                           <span className="text-muted-foreground text-sm">No Org</span>
                       )
                   })()}
                </TableCell>
                <TableCell>
                    {/* Show Organization Role if available, otherwise System Role */}
                    {(() => {
                        const userAny = user as any
                        if (userAny.memberships && userAny.memberships.length > 0) {
                            return (
                                <Badge variant="secondary" className="capitalize">
                                    {userAny.memberships[0].role}
                                </Badge>
                            )
                        }
                        return (
                            <Badge variant={user.system_role === 'admin' ? 'default' : 'secondary'}>
                                {user.system_role}
                            </Badge>
                        )
                    })()}
                </TableCell>
                <TableCell>
                    {user.blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                    ) : (
                        <Badge variant="success">Active</Badge>
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
                      {/* Only show Change Role for non-system admins or if they have a membership */}
                      {((user as any).memberships?.length > 0) && (
                          <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setIsChangeRoleOpen(true)
                          }}>
                            <UserCog className="mr-2 h-4 w-4" /> Change Org Role
                          </DropdownMenuItem>
                      )}
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
            {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        orgs={orgs} 
        onSubmit={handleCreate} 
      />

      <UpdateUserDialog 
        open={isUpdateOpen} 
        onOpenChange={setIsUpdateOpen} 
        user={selectedUser} 
        onSubmit={handleUpdate} 
      />

      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
        onSubmit={handleChangePassword} 
      />

      {selectedUser && (
          <ChangeRoleDialog
            open={isChangeRoleOpen}
            onOpenChange={setIsChangeRoleOpen}
            currentRole={(selectedUser as any).memberships?.[0]?.role || 'member'}
            onSubmit={handleChangeRole}
          />
      )}
    </div>
  )
}
