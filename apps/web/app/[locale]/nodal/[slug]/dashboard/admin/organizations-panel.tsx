'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash, MoreHorizontal, Coins, Infinity } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { toast } from 'sonner'
import { Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
import LoadingPage from "@/components/loading-page"
import { Badge } from "@/components/ui/badge"
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

export function OrganizationsPanel() {
  const { data: orgs = [], error, mutate, isLoading: loading } = useSWR<Organization[]>('/api/admin/orgs', (url: string) => apiClient.get(url).then(async res => {
      if (!res.ok) throw new Error('Failed to fetch orgs');
      return res.json();
  }));


  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  // Removed useEffect and fetchOrgs


  const handleCreate = async (data: any) => {
    try {
      const res = await apiClient.post('/api/admin/orgs', data)

      if (!res.ok) throw new Error('Failed to create org')

      setIsCreateOpen(false)
      mutate() // Refresh list
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
      setSelectedOrg(null)
      mutate() // Refresh list
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

      mutate() // Refresh list
      toast.success('Organization deleted successfully')
    } catch (error) {
      toast.error('Error deleting organization')
    }
  }

  const openUpdate = (org: Organization) => {
      setSelectedOrg(org)
      setIsUpdateOpen(true)
  }

  const openCredits = (org: Organization) => {
      setSelectedOrg(org)
      setIsCreditsOpen(true)
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
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Organizations</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage customer tenants, subscriptions, and AI credits.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Create Organization
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="font-semibold text-zinc-500">Name</TableHead>
              <TableHead className="font-semibold text-zinc-500">Slug</TableHead>
              <TableHead className="font-semibold text-zinc-500">Plan</TableHead>
              <TableHead className="font-semibold text-zinc-500">AI Credits</TableHead>
              <TableHead className="text-right font-semibold text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{org.name}</TableCell>
                <TableCell className="text-zinc-500 font-mono text-xs">{org.slug}</TableCell>
                <TableCell>
                    <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-normal">
                        {org.subscription_plan || org.plan || 'Free'}
                    </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openCredits(org)}
                    className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-colors"
                  >
                    {org.ai_unlimited_access ? (
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                        <Infinity className="h-3 w-3 mr-1" />
                        Unlimited
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-amber-500" />
                        <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {(org.ai_credits_balance || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </button>
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
                        <Coins className="mr-2 h-4 w-4 text-amber-500" /> Manage Credits
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
            {orgs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                        No organizations found.
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
