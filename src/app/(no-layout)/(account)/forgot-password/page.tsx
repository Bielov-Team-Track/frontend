"use client";

import ForgotPasswordForm from "@/components/features/auth/forms/ForgotPasswordForm";
import React from "react";

function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = React.useState(false);

  const onEmailSent = () => {
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-stone-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        {emailSent ? (
          <div>Email with reset URL was sent to your address</div>
        ) : (
          <>
            <div>
              Enter your email address and we will send you a link to reset your
              password
            </div>
            <ForgotPasswordForm onEmailSent={onEmailSent} />
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
