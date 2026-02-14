'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Plus, MoreHorizontal, Pencil, Trash, RotateCw, Shield, Lock, Ban, UserCog, Search, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { User, Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
import LoadingPage from "@/components/loading-page"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const { data: users = [], mutate: mutateUsers, isLoading: loadingUsers } = useSWR<User[]>('/api/admin/users', (url: string) => apiClient.get(url).then(async res => {
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
  }));

  const { data: orgs = [], isLoading: loadingOrgs } = useSWR<Organization[]>('/api/admin/orgs', (url: string) => apiClient.get(url).then(async res => {
      if (!res.ok) throw new Error('Failed to fetch orgs');
      return res.json();
  }));

  const loading = loadingUsers || loadingOrgs;

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  const hasActiveFilters = search || filterOrg !== 'all' || filterStatus !== 'all' || filterRole !== 'all'

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const userAny = user as any
      // Search by name or email
      if (search) {
        const q = search.toLowerCase()
        if (!user.full_name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) return false
      }
      // Filter by organization
      if (filterOrg !== 'all') {
        const orgId = userAny.memberships?.[0]?.org_id
        if (orgId !== filterOrg) return false
      }
      // Filter by status
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && user.blocked) return false
        if (filterStatus === 'blocked' && !user.blocked) return false
      }
      // Filter by role
      if (filterRole !== 'all') {
        if (filterRole === 'platform_admin' && user.system_role !== 'platform_admin') return false
        if (filterRole === 'owner' && userAny.memberships?.[0]?.role !== 'owner') return false
        if (filterRole === 'admin' && userAny.memberships?.[0]?.role !== 'admin') return false
        if (filterRole === 'member' && userAny.memberships?.[0]?.role !== 'member') return false
      }
      return true
    })
  }, [users, search, filterOrg, filterStatus, filterRole])


  const handleCreate = async (data: any) => {
    try {
      const res = await apiClient.post('/api/admin/users', data)

      if (!res.ok) throw new Error('Failed to create user')

      setIsCreateOpen(false)
      mutateUsers()
      toast.success("User created successfully")
    } catch (error) {
      toast.error('Error creating user')
    }
  }

  const handleUpdate = async (data: any) => {
    if (!selectedUser) return
    try {
      const res = await apiClient.put(`/api/admin/users/${selectedUser.id}`, data)

      if (!res.ok) throw new Error('Failed to update user')

      setIsUpdateOpen(false)
      setSelectedUser(null)
      mutateUsers()
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Error updating user')
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return

    try {
      const res = await apiClient.delete(`/api/admin/users/${user.id}`)

      if (!res.ok) throw new Error('Failed to delete user')

      mutateUsers()
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handlePromote = async (user: User) => {
    if (!confirm(`Promote ${user.email} to Platform Admin?`)) return

    try {
        const res = await apiClient.post('/api/admin/promote', { user_id: user.id })

        if (!res.ok) throw new Error('Failed to promote')
        mutateUsers()
        toast.success('User promoted successfully')
    } catch (error) {
        toast.error('Error promoting user')
    }
  }

  const handleBlock = async (user: User) => {
    const action = user.blocked ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return

    try {
        const res = await apiClient.post(`/api/admin/users/${user.id}/block`, { blocked: !user.blocked })

        if (!res.ok) throw new Error(`Failed to ${action} user`)
        mutateUsers()
        toast.success(`User ${action}ed successfully`)
    } catch (error) {
        toast.error(`Error: ${error}`)
    }
  }

  const handleResetMFA = async (user: User) => {
    if (!confirm(`Reset MFA for ${user.email}?`)) return

    try {
        const res = await apiClient.post(`/api/admin/users/${user.id}/reset-mfa`, {})

        if (!res.ok) throw new Error('Failed to reset MFA')
        toast.success('MFA reset successfully')
    } catch (error) {
        toast.error('Error resetting MFA')
    }
  }

  const handleChangePassword = async (password: string) => {
    if (!selectedUser) return
    try {
        const res = await apiClient.post(`/api/admin/users/${selectedUser.id}/password`, { password })

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
        const res = await apiClient.post(`/api/admin/users/${selectedUser.id}/role`, { role })

        if (!res.ok) throw new Error('Failed to change role')

        setIsChangeRoleOpen(false)
        mutateUsers()
        toast.success('Role updated successfully')
    } catch (error) {
        toast.error('Error changing role')
    }
  }

  if (loading) {
    return (
      <LoadingPage />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Users</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage user access, roles, and security.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orgs</SelectItem>
            {orgs.map(org => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="platform_admin">Platform Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setFilterOrg('all'); setFilterStatus('all'); setFilterRole('all') }}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="font-semibold text-zinc-500">User</TableHead>
              <TableHead className="font-semibold text-zinc-500">Organization</TableHead>
              <TableHead className="font-semibold text-zinc-500">Role</TableHead>
              <TableHead className="font-semibold text-zinc-500">Status</TableHead>
              <TableHead className="text-right font-semibold text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            {user.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.full_name}</span>
                      <span className="text-xs text-zinc-500">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   {(() => {
                       const userAny = user as any
                       if (userAny.memberships && userAny.memberships.length > 0 && userAny.memberships[0].organizations) {
                           return (
                               <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                   {userAny.memberships[0].organizations.name}
                               </span>
                           )
                       }
                       const orgName = orgs.find(o => o.id === user.organization_id)?.name
                       return orgName ? (
                           <span className="text-sm text-zinc-700 dark:text-zinc-300">{orgName}</span>
                       ) : (
                           <span className="text-zinc-400 text-sm italic">No Org</span>
                       )
                   })()}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1.5">
                        {user.system_role === 'platform_admin' && (
                            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                Platform
                            </span>
                        )}
                        {(() => {
                            const userAny = user as any
                            const membershipRole = userAny.memberships?.[0]?.role
                            if (!membershipRole) return null
                            return (
                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 capitalize dark:bg-zinc-800 dark:text-zinc-400">
                                    {membershipRole}
                                </span>
                            )
                        })()}
                        {user.system_role === 'user' && !(user as any).memberships?.[0]?.role && (
                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                user
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    {user.blocked ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Blocked
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Active
                        </span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setIsUpdateOpen(true)
                      }}>
                        <Pencil className="mr-2 h-4 w-4 text-zinc-500" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setIsChangePasswordOpen(true)
                      }}>
                        <Lock className="mr-2 h-4 w-4 text-zinc-500" /> Change Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20" onClick={() => handleDelete(user)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                        {hasActiveFilters ? 'No users match your filters.' : 'No users found.'}
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
        currentRole={(selectedUser as any)?.memberships?.[0]?.role}
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
