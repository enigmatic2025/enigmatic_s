'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  const [unlimited, setUnlimited] = useState(() => Boolean(org?.ai_unlimited_access))
  const [activeTab, setActiveTab] = useState<'set' | 'add'>('add')
  const prevOrgRef = useRef<string | null>(null)

  // When org changes (or dialog opens with a different org), sync unlimited immediately
  const orgId = org?.id ?? null
  const orgUnlimited = Boolean(org?.ai_unlimited_access)
  if (orgId !== prevOrgRef.current) {
    prevOrgRef.current = orgId
    // This runs during render — no flash, no extra frame
    if (unlimited !== orgUnlimited) {
      setUnlimited(orgUnlimited)
    }
  }

  // Also sync when the org prop updates (e.g. after mutate() refreshes)
  useEffect(() => {
    setUnlimited(orgUnlimited)
  }, [orgUnlimited])

  useEffect(() => {
    if (open && org) {
      setStats(null)
      fetchStats()
    }
  }, [open, orgId])

  const fetchStats = async () => {
    if (!org) return
    try {
      const res = await apiClient.get(`/api/admin/orgs/${org.id}/credits/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setUnlimited(data.unlimited_access)
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
      setUnlimited(!checked)
    } finally {
      setLoading(false)
    }
  }

  if (!org) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            AI Credits &mdash; {org.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Stats grid */}
          {stats && (
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Balance</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {unlimited ? '\u221E' : stats.current_balance.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Used</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {stats.total_credits_used.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Requests</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {stats.total_requests.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Blocked</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {stats.blocked_requests}
                </p>
              </div>
            </div>
          )}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Unlimited toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Unlimited Access
              </Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bypass credit limits for this organization
              </p>
            </div>
            <Switch
              checked={unlimited}
              onCheckedChange={handleToggleUnlimited}
              disabled={loading}
            />
          </div>

          {/* Credit management — hidden when unlimited */}
          {!unlimited && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    activeTab === 'add'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Add Credits
                </button>
                <button
                  onClick={() => setActiveTab('set')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    activeTab === 'set'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Set Balance
                </button>
              </div>

              {activeTab === 'add' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="addAmount" className="text-sm">Amount</Label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
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
                        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {loading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[100, 500, 1000, 5000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setAddAmount(amount.toString())}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'set' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="newBalance" className="text-sm">New Balance</Label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      Override current balance to an exact amount
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
                        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {loading ? 'Setting...' : 'Set'}
                      </Button>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[1000, 5000, 10000, 50000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setNewBalance(amount.toString())}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {amount.toLocaleString()}
                        </button>
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
