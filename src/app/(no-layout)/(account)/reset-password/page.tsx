'use client';

import { ResetPasswordForm } from '@/components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react'
import Loader from '@/components/ui/loader';

function ResetPasswordContent() {
  const params = useSearchParams();
  const [passwordReset, setPasswordReset] = React.useState(false);
  const [email, token] = [params.get('email'), params.get('token')];

  const onPasswordReset = () => {
    setPasswordReset(true);
  }

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Reset Password</h1>
      {
        passwordReset ?
          <div>Password reset successfully. <Link href={"/login"} className='link'>Click here to login</Link></div> :
          <>
            {email && token ?
              <ResetPasswordForm onPasswordReset={onPasswordReset} email={email} token={token} /> :
              <div>Invalid reset URL</div>}
          </>
      }
    </div>
  )
}

function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

export default ResetPasswordPage