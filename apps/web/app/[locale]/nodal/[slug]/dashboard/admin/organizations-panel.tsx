'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash, MoreHorizontal, Search, X } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { toast } from 'sonner'
import { Organization } from '@/types/admin'
import LoadingPage from "@/components/loading-page"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateOrgDialog, UpdateOrgDialog } from "@/components/admin/org-dialogs"
import { OrgCreditsDialog } from "./org-credits-dialog"

function isUnlimited(org: Organization): boolean {
  return Boolean(org.ai_unlimited_access)
}

export function OrganizationsPanel() {
  const { data: orgs = [], mutate, isLoading: loading } = useSWR<Organization[]>('/api/admin/orgs', (url: string) => apiClient.get(url).then(async res => {
      if (!res.ok) throw new Error('Failed to fetch orgs');
      return res.json();
  }));

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const selectedOrg = useMemo(() => {
    if (!selectedOrgId) return null
    return orgs.find(o => o.id === selectedOrgId) || null
  }, [orgs, selectedOrgId])

  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [filterAccess, setFilterAccess] = useState<string>('all')

  const hasActiveFilters = search || filterPlan !== 'all' || filterAccess !== 'all'

  const plans = useMemo(() => {
    const set = new Set(orgs.map(o => o.subscription_plan || o.plan || 'free'))
    return Array.from(set).sort()
  }, [orgs])

  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      if (search) {
        const q = search.toLowerCase()
        if (!org.name.toLowerCase().includes(q) && !org.slug.toLowerCase().includes(q)) return false
      }
      if (filterPlan !== 'all') {
        const plan = org.subscription_plan || org.plan || 'free'
        if (plan !== filterPlan) return false
      }
      if (filterAccess !== 'all') {
        const orgIsUnlimited = isUnlimited(org)
        if (filterAccess === 'unlimited' && !orgIsUnlimited) return false
        if (filterAccess === 'limited' && orgIsUnlimited) return false
      }
      return true
    })
  }, [orgs, search, filterPlan, filterAccess])

  const handleCreate = async (data: any) => {
    try {
      const res = await apiClient.post('/api/admin/orgs', data)
      if (!res.ok) throw new Error('Failed to create org')
      setIsCreateOpen(false)
      mutate()
      toast.success('Organization created successfully')
    } catch (error) {
      toast.error('Error creating organization')
    }
  }

  const handleUpdate = async (data: any) => {
    if (!selectedOrg) return
    try {
      const res = await apiClient.put(`/api/admin/orgs/${selectedOrg.id}`, data)
      if (!res.ok) throw new Error('Failed to update org')
      setIsUpdateOpen(false)
      setSelectedOrgId(null)
      mutate()
      toast.success('Organization updated successfully')
    } catch (error) {
      toast.error('Error updating organization')
    }
  }

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete ${org.name}? This cannot be undone.`)) return
    try {
      const res = await apiClient.delete(`/api/admin/orgs/${org.id}`)
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Cannot delete this organization (Enigmatic is protected).")
          return
        }
        throw new Error('Failed to delete org')
      }
      mutate()
      toast.success('Organization deleted successfully')
    } catch (error) {
      toast.error('Error deleting organization')
    }
  }

  const openUpdate = (org: Organization) => {
    setSelectedOrgId(org.id)
    setIsUpdateOpen(true)
  }

  const openCredits = (org: Organization) => {
    setSelectedOrgId(org.id)
    setIsCreditsOpen(true)
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Organizations</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage customer tenants, subscriptions, and AI credits.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Create Organization
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans.map(plan => (
              <SelectItem key={plan} value={plan} className="capitalize">{plan}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAccess} onValueChange={setFilterAccess}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="AI Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="unlimited">Unlimited</SelectItem>
            <SelectItem value="limited">Credit-based</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setFilterPlan('all'); setFilterAccess('all') }}
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
              <TableHead className="font-semibold text-zinc-500">Name</TableHead>
              <TableHead className="font-semibold text-zinc-500">Plan</TableHead>
              <TableHead className="font-semibold text-zinc-500">AI Access</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-right">Tokens Used</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-right">Requests</TableHead>
              <TableHead className="text-right font-semibold text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.map((org) => (
              <TableRow key={org.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                <TableCell>
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{org.name}</span>
                    <p className="text-zinc-400 font-mono text-xs">{org.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 capitalize dark:bg-zinc-800 dark:text-zinc-400">
                    {org.subscription_plan || org.plan || 'free'}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openCredits(org)}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors"
                  >
                    {isUnlimited(org) ? (
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">&infin; Unlimited</span>
                    ) : (
                      <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {(org.ai_credits_balance || 0).toLocaleString()} credits
                      </span>
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {(org.total_tokens_used || 0).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {(org.total_requests || 0).toLocaleString()}
                  </span>
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
                      <DropdownMenuItem onClick={() => openCredits(org)}>
                        Manage Credits
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openUpdate(org)}>
                        <Pencil className="mr-2 h-4 w-4 text-zinc-500" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20" onClick={() => handleDelete(org)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  {hasActiveFilters ? 'No organizations match your filters.' : 'No organizations found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateOrgDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <UpdateOrgDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        org={selectedOrg}
        onSubmit={handleUpdate}
      />

      <OrgCreditsDialog
        open={isCreditsOpen}
        onOpenChange={setIsCreditsOpen}
        org={selectedOrg}
        onSuccess={mutate}
      />
    </div>
  )
}
