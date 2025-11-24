'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Check if MFA is required
        if (error.message.includes('MFA') || error.message.includes('factor')) {
          toast.info('MFA verification required. Please check your authenticator app.')
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
          toast.error('No organization found. Please contact an administrator.')
        }
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.')
      return
    }
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-light tracking-tight">Sign in to Nodal</CardTitle>
          <CardDescription>
            Enter your credentials to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  variant="link" 
                  className="px-0 font-normal h-auto text-xs text-muted-foreground"
                  onClick={handleForgotPassword}
                  type="button"
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
