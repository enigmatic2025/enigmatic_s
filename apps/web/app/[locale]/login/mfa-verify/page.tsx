'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, getUserOrgSlug } from '@/lib/supabase'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function MFAVerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router })
  const t = useTranslations("MFA.verify")

  useEffect(() => {
    // Verify the user has an active session (AAL1 from login)
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        routerRef.current.push('/login')
      }
    }
    checkSession()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get the MFA factor from the existing session
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      if (!factorsData?.totp || factorsData.totp.length === 0) {
        throw new Error(t("noFactorFound"))
      }

      const factorId = factorsData.totp[0].id

      // Verify the code — upgrades session from AAL1 to AAL2
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      })

      if (error) throw error

      // Mark as redirecting so the button stays disabled
      setRedirecting(true)

      // Redirect to dashboard
      const orgSlug = await getUserOrgSlug()
      if (orgSlug) {
        routerRef.current.push(`/nodal/${orgSlug}/dashboard`)
      } else {
        toast.error('No organization found. Please contact an administrator.')
        setRedirecting(false)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
      setLoading(false)
    }
  }

  const isDisabled = loading || redirecting || code.length !== 6

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
              disabled={redirecting}
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
              disabled={isDisabled}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-foreground text-background px-4 py-3 text-sm font-light hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading || redirecting ? t("verifying") : t("verify")}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              disabled={redirecting}
              onClick={() => {
                routerRef.current.push('/login')
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
