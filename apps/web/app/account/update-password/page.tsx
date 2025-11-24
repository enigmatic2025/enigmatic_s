'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

function UpdatePasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get('code')
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } catch (err: any) {
          console.error('Exchange error:', err)
          setError(err.message || 'Failed to verify reset link')
          toast.error('Failed to verify reset link: ' + err.message)
        } finally {
          setVerifying(false)
        }
      } else {
        // Check if we already have a session (e.g. user navigated here manually)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setError('Invalid or expired reset link')
        }
        setVerifying(false)
      }
    }
    exchangeCode()
  }, [searchParams])

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long"
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number"
    return null
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const validationError = validatePassword(password)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)

    try {
      // Double check session before updating
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expired. Please request a new password reset link.')
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Password updated successfully')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      console.error('Update error:', error)
      
      // Check for AAL2 requirement
      if (error.message.includes('AAL2') || error.message.includes('MFA')) {
        toast.info('MFA verification required to update password.')
        setMfaRequired(true)
        initializeMfa()
        return
      }

      toast.error(error.message)
      if (error.message.includes('Auth session missing')) {
        setError('Session expired. Please request a new link.')
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error

      const totpFactor = data.totp.find(f => f.status === 'verified')
      if (!totpFactor) {
        throw new Error('No verified MFA factor found')
      }

      setFactorId(totpFactor.id)
      
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      })
      
      if (challengeError) throw challengeError
      setChallengeId(challengeData.id)

    } catch (err: any) {
      toast.error('Failed to initialize MFA: ' + err.message)
      setMfaRequired(false)
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!factorId || !challengeId) throw new Error('MFA not initialized')

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: mfaCode
      })

      if (error) throw error

      // MFA Verified! Now retry password update
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully')
      setTimeout(() => {
        router.push('/login')
      }, 1500)

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying secure link...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-light tracking-tight text-destructive">Link Expired</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => router.push('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (mfaRequired) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleMfaVerify}>
          <div>
            <input
              id="mfa-code"
              name="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              className="relative block w-full rounded-md border border-border bg-background/50 px-3 py-4 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-center text-3xl tracking-widest font-light"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-foreground text-background px-4 py-3 text-sm font-light hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Verifying...' : 'Verify & Update Password'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMfaRequired(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-light tracking-tight">Update Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter new password"
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Confirm new password"
              minLength={8}
            />
          </div>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
          </ul>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <UpdatePasswordContent />
      </Suspense>
    </div>
  )
}
