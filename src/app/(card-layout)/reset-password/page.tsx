"use client";

import { ResetPasswordForm } from "@/components";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Loader from "@/components/ui/loader";

function ResetPasswordContent() {
  const params = useSearchParams();
  const [passwordReset, setPasswordReset] = React.useState(false);
  const token = params.get("token");
  const onPasswordReset = () => {
    setPasswordReset(true);
  };

  return (
    <>
      {" "}
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
    </>
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
