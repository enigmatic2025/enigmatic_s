'use client'

import { useState, useEffect } from 'react'
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
import { Organization } from '@/types/admin'

interface CreateOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

export function CreateOrgDialog({ open, onOpenChange, onSubmit }: CreateOrgDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
    setFormData({ name: '', slug: '', plan: 'free' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setFormData({...formData, name, slug})
              }}
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" autoComplete="off" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UpdateOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  org: Organization | null
  onSubmit: (data: any) => Promise<void>
}

export function UpdateOrgDialog({ open, onOpenChange, org, onSubmit }: UpdateOrgDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name,
        slug: org.slug,
        plan: org.subscription_plan || org.plan || 'free'
      })
    }
  }, [org])

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Organization</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" autoComplete="off" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-slug">Slug</Label>
            <Input id="edit-slug" autoComplete="off" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
