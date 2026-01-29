'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function MFAVerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations("MFA.verify")

  useEffect(() => {
    // Check if we have the necessary session data
    const email = sessionStorage.getItem('mfa_email')
    const password = sessionStorage.getItem('mfa_password')
    
    if (!email || !password) {
      router.push('/login')
    }
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const email = sessionStorage.getItem('mfa_email')
      const password = sessionStorage.getItem('mfa_password')

      if (!email || !password) {
        throw new Error(t("sessionExpired"))
      }

      // First, sign in to get the session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Get the MFA factor
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      if (!factorsData?.totp || factorsData.totp.length === 0) {
        throw new Error(t("noFactorFound"))
      }

      const factorId = factorsData.totp[0].id

      // Verify the code
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      })

      if (error) throw error

      // Clear session storage
      sessionStorage.removeItem('mfa_email')
      sessionStorage.removeItem('mfa_password')

      // Redirect to dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: memberships } = await supabase
          .from('memberships')
          .select('organizations(slug)')
          .limit(1)
        
        if (memberships && memberships.length > 0 && memberships[0].organizations) {
          // @ts-ignore
          router.push(`/nodal/${memberships[0].organizations.slug}/dashboard`)
        } else {
          // Check if system admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('system_role')
            .eq('id', user.id)
            .single()
          
          if (profile?.system_role === 'admin') {
            router.push('/nodal/admin')
          } else {
            toast.error('No organization found. Please contact an administrator.')
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              className="relative block w-full rounded-md border border-border bg-background/50 px-3 py-4 text-foreground placeholder-muted-foreground focus:z-10 focus:outline-none focus:ring-0 text-center text-3xl tracking-widest font-light shadow-none"
              placeholder={t("codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-foreground text-background px-4 py-3 text-sm font-light hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? t("verifying") : t("verify")}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('mfa_email')
                sessionStorage.removeItem('mfa_password')
                router.push('/login')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("backToLogin")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
