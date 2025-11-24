'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (authLoading) return // Wait for auth to load
      
      if (user) {
        // Check if user has MFA enabled but only AAL1 session
        const { data: { session } } = await supabase.auth.getSession()
        const { data: factors } = await supabase.auth.mfa.listFactors()
        
        const hasVerifiedMFA = factors?.totp?.some(f => f.status === 'verified')
        
        // If MFA is enabled and we are only at AAL1, DO NOT redirect.
        // Let the handleAuth or manual flow take over to prompt for MFA.
        
        if (hasVerifiedMFA) {
            // Let's check the assurance level from the session
            const currentLevel = session?.user?.app_metadata?.aal || 'aal1'
            if (currentLevel === 'aal1') {
                return // Stop redirect, let MFA flow happen
            }
        }

        // User is already logged in (and satisfied MFA if needed), redirect to dashboard
        const { data: memberships } = await supabase
          .from('memberships')
          .select('organizations(slug)')
          .limit(1)
        
        if (memberships && memberships.length > 0 && memberships[0].organizations) {
          // @ts-ignore
          router.push(`/nodal/${memberships[0].organizations.slug}/dashboard`)
        } else {
          router.push('/nodal/admin')
        }
      }
    }
    
    checkAndRedirect()
  }, [user, authLoading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Check if MFA is required
        if (error.message.includes('MFA') || error.message.includes('factor')) {
          setError('MFA verification required. Please check your authenticator app.')
          // Store email for MFA challenge page
          sessionStorage.setItem('mfa_email', email)
          router.push('/login/mfa-verify')
          return
        }
        throw error
      }

      // Check if user has MFA enabled
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      
      if (factorsData?.totp && factorsData.totp.length > 0 && factorsData.totp[0].status === 'verified') {
        // MFA is enabled, redirect to challenge
        sessionStorage.setItem('mfa_email', email)
        sessionStorage.setItem('mfa_password', password)
        router.push('/login/mfa-verify')
        return
      }

      // MFA NOT ENABLED - Force enrollment
      if (!factorsData?.totp || factorsData.totp.length === 0 || factorsData.totp[0].status !== 'verified') {
        // Redirect to mandatory MFA setup
        router.push('/account/security/mfa-setup')
        return
      }

      // This code should never be reached due to mandatory MFA
      // But kept as fallback
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
          alert('No organization found. Please contact an administrator.')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      })
      if (error) throw error
      alert('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Sign in to Nodal
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Enter your credentials to access the platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border border-border bg-background/50 px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-border bg-background/50 px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-foreground text-background px-4 py-3 text-sm font-medium hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
