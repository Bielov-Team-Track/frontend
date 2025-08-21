"use client";

import ForgotPasswordForm from "@/components/features/auth/forms/ForgotPasswordForm";
import React from "react";

function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = React.useState(false);

  const onEmailSent = () => {
    setEmailSent(true);
  };

  return (
    <div className="flex flex-col gap-4">
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
  );
}

export default ForgotPasswordPage;
