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
import { Organization, User } from '@/types/admin'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgs: Organization[]
  onSubmit: (data: any) => Promise<void>
}

export function CreateUserDialog({ open, onOpenChange, orgs, onSubmit }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    user_type: 'standard',
    role: 'member',
    organization_id: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit({
      ...formData,
      user_type: formData.user_type === 'platform_admin' ? 'platform_admin' : 'standard',
    })
    setLoading(false)
    setFormData({ email: '', full_name: '', password: '', user_type: 'standard', role: 'member', organization_id: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" autoComplete="off" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input id="fullname" autoComplete="off" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
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
                <Label htmlFor="type-standard" className="font-normal">Organization User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="type-platform-admin"
                  name="user_type"
                  value="platform_admin"
                  checked={formData.user_type === 'platform_admin'}
                  onChange={() => {
                      const enigmaticOrg = orgs.find(o => o.name === 'Enigmatic')
                      setFormData({
                          ...formData,
                          user_type: 'platform_admin',
                          organization_id: enigmaticOrg?.id || '',
                          role: 'member'
                      })
                  }}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="type-platform-admin" className="font-normal">Platform Admin</Label>
              </div>
            </div>
            {formData.user_type === 'platform_admin' && (
                <p className="text-xs text-muted-foreground">Platform Admins are Enigmatic team members with full system access.</p>
            )}
            {formData.user_type === 'standard' && (
                <p className="text-xs text-muted-foreground">Organization Users are customers assigned to an organization with a specific role.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org">Organization</Label>
            <Select
              value={formData.organization_id}
              onValueChange={(val) => setFormData({...formData, organization_id: val})}
              disabled={formData.user_type === 'platform_admin' && !!orgs.find(o => o.name === 'Enigmatic')}
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
            {formData.user_type === 'platform_admin' && (
                <p className="text-xs text-muted-foreground">Platform Admins are automatically assigned to the Enigmatic organization.</p>
            )}
          </div>

          {formData.user_type === 'standard' && (
              <div className="grid gap-2">
                <Label htmlFor="role">Organization Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UpdateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  currentRole?: string
  onSubmit: (data: any) => Promise<void>
}

export function UpdateUserDialog({ open, onOpenChange, user, currentRole, onSubmit }: UpdateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    system_role: 'user',
    role: 'member',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        system_role: user.system_role || 'user',
        role: currentRole || 'member',
      })
    }
  }, [user, currentRole])

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={formData.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-fullname">Full Name</Label>
            <Input id="edit-fullname" autoComplete="off" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label>User Type</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="edit-type-standard"
                  name="edit_user_type"
                  value="user"
                  checked={formData.system_role === 'user'}
                  onChange={() => setFormData({...formData, system_role: 'user'})}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-type-standard" className="font-normal">Organization User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="edit-type-platform-admin"
                  name="edit_user_type"
                  value="platform_admin"
                  checked={formData.system_role === 'platform_admin'}
                  onChange={() => setFormData({...formData, system_role: 'platform_admin'})}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-type-platform-admin" className="font-normal">Platform Admin</Label>
              </div>
            </div>
          </div>

          {formData.system_role === 'user' && (
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Organization Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRole: string
  onSubmit: (role: string) => Promise<void>
}

export function ChangeRoleDialog({ open, onOpenChange, currentRole, onSubmit }: ChangeRoleDialogProps) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setRole(currentRole)
  }, [currentRole])

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(role)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Organization Role</DialogTitle>
          <DialogDescription>Update the user's role within their organization.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (password: string) => Promise<void>
}

export function ChangePasswordDialog({ open, onOpenChange, onSubmit }: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await onSubmit(password)
    setLoading(false)
    setPassword('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
