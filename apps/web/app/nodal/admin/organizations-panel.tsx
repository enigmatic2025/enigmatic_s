'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, MoreHorizontal } from 'lucide-react'
import { apiClient } from "@/lib/api-client"
import { toast } from 'sonner'
import { Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
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

export function OrganizationsPanel() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  useEffect(() => {
    fetchOrgs()
  }, [])

  const fetchOrgs = async () => {
    try {
      const res = await apiClient.get('/api/admin/orgs')

      if (!res.ok) throw new Error('Failed to fetch orgs')

      const data = await res.json()
      setOrgs(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await apiClient.post('/api/admin/orgs', data)

      if (!res.ok) throw new Error('Failed to create org')

      setIsCreateOpen(false)
      fetchOrgs()
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
      fetchOrgs()
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

      fetchOrgs()
      toast.success('Organization deleted successfully')
    } catch (error) {
      toast.error('Error deleting organization')
    }
  }

  const openUpdate = (org: Organization) => {
      setSelectedOrg(org)
      setIsUpdateOpen(true)
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
        <h3 className="text-xl font-normal">All Organizations</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Organization
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                <TableCell>
                    <Badge variant="outline">
                        {org.subscription_plan || org.plan || 'Free'}
                    </Badge>
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
                      <DropdownMenuItem onClick={() => openUpdate(org)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(org)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {orgs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
    </div>
  )
}
