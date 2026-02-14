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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Coins, Infinity, TrendingUp, Shield, Zap } from 'lucide-react'
import { Organization } from '@/types/admin'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface OrgCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  org: Organization | null
  onSuccess: () => void
}

interface CreditStats {
  org_name: string
  current_balance: number
  unlimited_access: boolean
  total_tokens_used: number
  total_credits_used: number
  total_requests: number
  blocked_requests: number
}

export function OrgCreditsDialog({ open, onOpenChange, org, onSuccess }: OrgCreditsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<CreditStats | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [unlimited, setUnlimited] = useState(false)
  const [activeTab, setActiveTab] = useState<'set' | 'add'>('add')

  useEffect(() => {
    if (open && org) {
      fetchStats()
      setUnlimited(org.ai_unlimited_access || false)
    }
  }, [open, org])

  const fetchStats = async () => {
    if (!org) return
    try {
      const res = await apiClient.get(`/api/admin/orgs/${org.id}/credits/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setNewBalance(data.current_balance.toString())
      }
    } catch (error) {
      console.error('Failed to fetch credit stats:', error)
    }
  }

  const handleSetCredits = async () => {
    if (!org || !newBalance) return
    setLoading(true)
    try {
      const res = await apiClient.put(`/api/admin/orgs/${org.id}/credits`, {
        credits: parseInt(newBalance)
      })

      if (!res.ok) throw new Error('Failed to set credits')

      toast.success(`Credits set to ${newBalance}`)
      onSuccess()
      fetchStats()
    } catch (error) {
      toast.error('Failed to set credits')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredits = async () => {
    if (!org || !addAmount) return
    setLoading(true)
    try {
      const res = await apiClient.post(`/api/admin/orgs/${org.id}/credits/add`, {
        credits: parseInt(addAmount)
      })

      if (!res.ok) throw new Error('Failed to add credits')

      const data = await res.json()
      toast.success(`Added ${addAmount} credits (new balance: ${data.new_balance})`)
      setAddAmount('')
      onSuccess()
      fetchStats()
    } catch (error) {
      toast.error('Failed to add credits')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUnlimited = async (checked: boolean) => {
    if (!org) return
    setLoading(true)
    try {
      const res = await apiClient.put(`/api/admin/orgs/${org.id}/unlimited`, {
        unlimited: checked
      })

      if (!res.ok) throw new Error('Failed to update unlimited access')

      setUnlimited(checked)
      toast.success(`Unlimited access ${checked ? 'enabled' : 'disabled'}`)
      onSuccess()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update unlimited access')
    } finally {
      setLoading(false)
    }
  }

  if (!org) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Manage AI Credits - {org.name}
          </DialogTitle>
          <DialogDescription>
            Control AI credit balance and access for this organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  <Coins className="h-4 w-4" />
                  Current Balance
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.unlimited_access ? (
                    <span className="flex items-center gap-2">
                      <Infinity className="h-6 w-6 text-purple-500" />
                      Unlimited
                    </span>
                  ) : (
                    stats.current_balance.toLocaleString()
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Total Used
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.total_credits_used.toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  <Zap className="h-4 w-4" />
                  Requests
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.total_requests.toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  <Shield className="h-4 w-4" />
                  Blocked
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.blocked_requests}
                </div>
              </div>
            </div>
          )}

          {/* Unlimited Access Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                <Infinity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <Label className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  Unlimited Access
                </Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Bypass credit checks for this organization
                </p>
              </div>
            </div>
            <Switch
              checked={unlimited}
              onCheckedChange={handleToggleUnlimited}
              disabled={loading}
            />
          </div>

          {/* Credit Management Tabs */}
          {!unlimited && (
            <>
              <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'add'
                      ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Add Credits
                </button>
                <button
                  onClick={() => setActiveTab('set')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'set'
                      ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Set Balance
                </button>
              </div>

              {activeTab === 'add' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="addAmount">Add/Remove Credits</Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      Positive to add, negative to deduct
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="addAmount"
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="e.g. 1000 or -500"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddCredits}
                        disabled={loading || !addAmount}
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                      >
                        {loading ? 'Processing...' : 'Apply'}
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[100, 500, 1000, 5000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAddAmount(amount.toString())}
                          className="text-xs"
                        >
                          +{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'set' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newBalance">Set Exact Balance</Label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      Override current balance with a specific amount
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="newBalance"
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="e.g. 10000"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSetCredits}
                        disabled={loading || !newBalance}
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                      >
                        {loading ? 'Setting...' : 'Set Balance'}
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[1000, 5000, 10000, 50000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewBalance(amount.toString())}
                          className="text-xs"
                        >
                          {amount.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
