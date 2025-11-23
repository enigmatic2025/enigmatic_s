'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function MFAEnrollmentPage() {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    enrollMFA()
  }, [user, router])

  const enrollMFA = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })

      if (error) throw error

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setStep('verify')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyMFA = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const factors = await supabase.auth.mfa.listFactors()
      if (factors.error) throw factors.error

      const factorId = factors.data.totp[0].id

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      })

      if (error) throw error

      alert('MFA enabled successfully!')
      router.push('/nodal/admin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === 'enroll') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-light">Setting up MFA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Secure Your Account
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Two-factor authentication is required for all users
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan the QR code with your authenticator app to continue
          </p>
        </div>

        {step === 'verify' && (
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="MFA QR Code" 
                    className="w-64 h-64 bg-white p-4 rounded-xl"
                  />
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Can't scan? Enter this code manually:
                </p>
                <p className="text-sm font-mono bg-muted px-4 py-2 rounded-md">
                  {secret}
                </p>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={verifyMFA} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-light text-foreground mb-2">
                  Enter 6-digit code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  className="relative block w-full rounded-md border border-border bg-background/50 px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || verifyCode.length !== 6}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-foreground text-background px-4 py-3 text-sm font-light hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? 'Verifying...' : 'Verify and Continue'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
