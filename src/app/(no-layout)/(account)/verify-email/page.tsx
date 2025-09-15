"use client";

import { Button, Loader } from "@/components";
import { verifyEmail } from "@/lib/requests/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { FaCheck } from "react-icons/fa6";

const VerifyEmailPage = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [countdown, setCountdown] = React.useState(5);
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const verifiedRef = React.useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;

    if (!token) {
      setError("Invalid verification link");
      return;
    }

    verifyEmail(token)
      .then(() => {
        verifiedRef.current = true;
        setError(null);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push("/dashboard/events/my");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch((errorResponse) => {
        const data: ErrorResponse = errorResponse.response?.data;
        if (!data) {
          setError("An error occurred while verifying your email");
          return;
        }

        if (data.errors[0].errorCode == "InvalidVerificationToken") {
          setError("This verification link is invalid or expired");
        } else {
          setError("An error occurred while verifying your email");
        }
        console.error("Email verification error:", errorResponse);
      });

    setError(null);
  }, [router, token, verifiedRef]);

  // Countdown timer effect

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-stone-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : !verifiedRef.current ? (
          <>
            <div className="flex items-center justify-center">
              <Loader size="24px" className="inline-block mr-2" />
              <h2>Verifing you email...</h2>
            </div>
            <p>
              We are verifying your email address. This may take a few moments.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2">
              <FaCheck size={"24px"} />
              <h2 className="">Your email is verified!</h2>
            </div>
            <p>
              You will be redirected to your dashboard in{" "}
              <span className="font-bold text-accent">{countdown}</span> seconds
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/dashboard/events/my")}
            >
              go to dashboard straight away
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
