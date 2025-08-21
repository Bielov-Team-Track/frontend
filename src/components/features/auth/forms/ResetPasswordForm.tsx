import Loader from '@/components/ui/loader';
import { resetPassword } from '@/lib/requests/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams } from 'next/navigation';
import { type } from 'os';
import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email().required('Email is required'),
  token: yup.string().required('Token is required'),
  newPassword: yup.string().required('New password is required')
})

type ResetPasswordFormProps = {
  onPasswordReset: () => void,
  email: string,
  token: string
}

function ResetPasswordForm({ onPasswordReset, email, token }: ResetPasswordFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: email,
      token: token,
      newPassword: ""
    }
  });

  const submitResetPassword = (data: any) => {
    setIsLoading(true);
    resetPassword(data.email, data.token, data.newPassword).then(() => {
      setIsLoading(false);
      onPasswordReset();
    }).catch(({ response }) => {
      setIsLoading(false);
      const errorResponse = response.data as ErrorResponse;
      setError(errorResponse.errors.map(e => e.errorMessage).join(', '));
    });
  }

  return (
    <form onSubmit={handleSubmit(submitResetPassword)} className='flex flex-col gap-2'>
      {error && <p className="text-error">{error}</p>}
      <label htmlFor="newPassword">New password</label>
      <Controller
        disabled={isLoading}
        name="newPassword"
        control={control}
        render={({ field }) => (
          <input {...field} type="password" className='input' />
        )} />
      {errors.newPassword && <p className="text-error">{errors.newPassword.message}</p>}
      <button disabled={isLoading} className='btn btn-primary w-full'>
        {
          isLoading ?
            <Loader /> :
            "Reset password"
        }
      </button>
    </form>
  )
}

export default ResetPasswordForm