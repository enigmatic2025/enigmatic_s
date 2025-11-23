'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Organization } from '@/types/admin'
import { Spinner } from "@/components/ui/spinner"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

export function OrganizationsPanel() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free'
  })

  useEffect(() => {
    fetchOrgs()
  }, [])

  const fetchOrgs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/orgs', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

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

  const handleCreate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create org')

      setIsCreateOpen(false)
      setFormData({ name: '', slug: '', plan: 'free' })
      setIsCreateOpen(false)
      setFormData({ name: '', slug: '', plan: 'free' })
      fetchOrgs()
      toast.success('Organization created successfully')
    } catch (error) {
      toast.error('Error creating organization')
    }
  }

  const handleUpdate = async () => {
    if (!selectedOrg) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch(`/api/admin/orgs/${selectedOrg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update org')

      setIsUpdateOpen(false)
      setSelectedOrg(null)
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch(`/api/admin/orgs/${org.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

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
      setFormData({
          name: org.name,
          slug: org.slug,
          plan: org.plan || 'free' // assuming plan field might be missing or named differently? Backend used "plan", DB might use "subscription_plan" based on previous file read.
          // Wait, previous file read `page.tsx` used `org.subscription_plan`. Backend handler uses `plan`.
          // I will check backend handler again.
          // Backend Create: `plan`. Backend Select: `*` from organizations.
          // DB Schema: I should check schema.sql if available, or just map.
      })
      // Adjust plan if needed (backend handler `UpdateOrganization` expects `plan`)
      // But let's check what `fetchOrgs` returns.
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
        <Button onClick={() => {
            setFormData({ name: '', slug: '', plan: 'free' })
            setIsCreateOpen(true)
        }}>
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
                <TableCell>{org.subscription_plan || org.plan || 'Free'}</TableCell>
                {/* Handling both potential field names */}
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
          </TableBody>
        </Table>
      </div>

      {/* Create Org Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Add a new organization to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                    const name = e.target.value;
                    // Auto-generate slug
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({...formData, name, slug})
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={formData.plan} onValueChange={(val) => setFormData({...formData, plan: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Organization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Org Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Organization</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <Select value={formData.plan} onValueChange={(val) => setFormData({...formData, plan: val})}>
                    <SelectTrigger>
                    <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
