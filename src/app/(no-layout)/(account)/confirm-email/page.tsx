'use client'

import Loader from '@/components/ui/loader';
import { verifyEmail as confirmEmailRequest } from '@/lib/requests/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState, Suspense } from 'react'

function ConfirmEmailContent() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const params = useSearchParams();
  const effectRan = useRef(false);  // Add this ref

  useEffect(() => {
    // If effectRan.current is true, skip running the effect
    if (effectRan.current) {
      return;
    }
    effectRan.current = true;  // Set to true to prevent future runs

    if (isEmailVerified) {
      return;
    }

    const email = params.get('email');
    const token = params.get('token');

    if (email === null) {
      setIsLoading(false);
      setError('This verification link is invalid');
      console.error('Email is missing');
      return;
    }

    if (token === null) {
      setIsLoading(false);
      setError('This verification link is invalid');
      console.error('Token is missing');
      return;
    }
    confirmEmailRequest(email, token)
      .then(() => {
        setIsLoading(false);
        setIsEmailVerified(true);
      })
      .catch((errorResponse) => {
        const data: ErrorResponse = errorResponse.response?.data;

        if (!data) {
          setError('An error occurred while verifying your email');
          setIsLoading(false);
          return;
        }

        if (data.errors[0].errorCode == "InvalidVerificationToken") {
          setError('This verification link is invalid or expired');
        } else {
          setError('An error occurred while verifying your email');
        }

        setIsLoading(false);
      });
  }, []);

  return isLoading ? (
    <Loader />
  ) : isEmailVerified ? (
    <div className='flex flex-col items-center gap-4'>
      <h1>Email is verified</h1>
      <Link href="/login" className='btn btn-success text-white'>Login</Link>
    </div>
  ) : (
    <div>{error}</div>
  );
}

function ConfirmEmailPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}

export default ConfirmEmailPage;
