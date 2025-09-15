"use client";

import { ResetPasswordForm } from "@/components";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Loader from "@/components/ui/loader";

function ResetPasswordContent() {
  console.log("Render ResetPasswordContent");
  const params = useSearchParams();
  const [passwordReset, setPasswordReset] = React.useState(false);
  const token = params.get("token");
  console.log(params);
  const onPasswordReset = () => {
    setPasswordReset(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-stone-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        {passwordReset ? (
          <div>
            Password reset successfully.{" "}
            <Link href={"/login"} className="link">
              Click here to login
            </Link>
          </div>
        ) : (
          <>
            {token ? (
              <ResetPasswordForm
                onPasswordReset={onPasswordReset}
                token={token}
              />
            ) : (
              <div>Invalid reset URL</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

export default ResetPasswordPage;
