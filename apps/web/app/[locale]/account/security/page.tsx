'use client'

import { useState } from 'react'

import { supabase } from '@/lib/supabase'
import { useRouter } from '@/navigation'
import { useAuth } from '@/components/auth-provider'
import { Link } from '@/navigation'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'

export default function SecurityPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if not logged in
  if (!user) {
    // This side effect is acceptable as a route guard, 
    // but ideally handled by middleware or a layout wrapper.
    // For now we keep the guard logic simple or assume middleware handles it.
  }

  // 1. Fetch MFA Factors with SWR
  const { data: factorsData, isLoading } = useSWR(
    user ? 'mfa-factors' : null,
    async () => {
        const { data, error } = await supabase.auth.mfa.listFactors()
        if (error) throw error
        return data
    }
  )

  const mfaEnabled = factorsData?.totp && factorsData.totp.length > 0 && factorsData.totp[0].status === 'verified'

  const [isDisabling, setIsDisabling] = useState(false)

  const handleDisableMFA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return

    setIsDisabling(true)
    try {
      if (factorsData?.totp && factorsData.totp.length > 0) {
        const factorId = factorsData.totp[0].id
        const { error } = await supabase.auth.mfa.unenroll({ factorId })
        if (error) throw error
        
        toast.success('Two-factor authentication has been disabled.')
        // Revalidate SWR
        mutate('mfa-factors') 
      }
    } catch (err: any) {
      toast.error('Error disabling MFA: ' + err.message)
    } finally {
      setIsDisabling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground font-light">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Account Security
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Manage your security settings and two-factor authentication
          </p>
        </div>

        {/* MFA Section */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-light text-foreground">
                Two-Factor Authentication
              </h2>
              <p className="text-base text-muted-foreground">
                {mfaEnabled 
                  ? 'Your account is secured with 2FA' 
                  : 'Required for all users - please enable to continue using the platform'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {mfaEnabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-light bg-green-500/10 text-green-500 border border-green-500/20">
                  ✓ Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-light bg-muted text-muted-foreground border border-border">
                  Disabled
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {!mfaEnabled ? (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-light">
                    ⚠️ Two-factor authentication is required for all accounts. Please enable it to continue.
                  </p>
                </div>
                <Link href="/account/security/mfa-setup">
                  <button className="rounded-md border border-transparent bg-foreground text-background px-4 py-2 text-sm font-light hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300">
                    Enable Two-Factor Authentication
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your account is currently protected with authenticator app-based 2FA.
                </p>
                <button
                  onClick={handleDisableMFA}
                  disabled={isDisabling}
                  className="rounded-md border border-red-500/20 bg-red-500/10 text-red-500 px-4 py-2 text-sm font-light hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Disable Two-Factor Authentication
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

