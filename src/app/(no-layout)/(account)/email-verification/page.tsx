'use client'

import React, { useState } from 'react'
import { sendVerification } from '@/lib/requests/auth'
import Loader from '@/components/ui/loader'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function EmailVerificationPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [resendSuccess, setResendSuccess] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const searchParams = useSearchParams()
  
  // Try to get email from URL params (if redirected from registration)
  const emailFromParams = searchParams.get('email')

  const handleResendEmail = async () => {
    const emailToUse = email || emailFromParams
    
    if (!emailToUse) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    setError('')
    setResendSuccess(false)
    
    try {
      await sendVerification(emailToUse)
      setResendSuccess(true)
    } catch (error: any) {
      setError('Failed to send verification email. Please try again.')
      console.error('Resend email error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
      {isLoading && <Loader />}
      
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-gray-600">
          We sent a verification email to {emailFromParams || 'your email address'}. 
          Please check your inbox and click the verification link.
        </p>
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}
      {resendSuccess && (
        <div className="text-green-500 text-center">
          Verification email sent! Please check your inbox.
        </div>
      )}

      <div className="w-full">
        {!emailFromParams && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter your email address"
            />
          </div>
        )}
        
        <button
          onClick={handleResendEmail}
          disabled={isLoading}
          className="btn btn-outline w-full mb-4"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <div className="text-center">
          <Link href="/login" className="link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationPage