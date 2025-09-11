"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { FormEvent, useState, Suspense } from "react";
import { FcGoogle as GoogleIcon } from "react-icons/fc";
import { FaEnvelope, FaLock } from "react-icons/fa6";
import { Loader, Input, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/authContext";
import { sendVerification } from "@/lib/requests/auth";

function LoginContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const callback = searchParams.get("callback");

  const credentialsSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      console.log("About to call login...");
      await login(email, password);
      console.log("Login completed, about to redirect...");

      // Small delay to ensure cookie is set before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsLoading(false);

      const targetRoute = callback || "/dashboard/events/my";
      console.log("Redirecting to:", targetRoute);

      // Use window.location for a hard redirect to ensure it works
      router.push(targetRoute);
    } catch (error: any) {
      setIsLoading(false);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";
      setError(message);

      // Check if the error is about email not being confirmed
      if (message === "Email not confirmed") {
        setUnconfirmedEmail(email);
      } else {
        setUnconfirmedEmail(null);
      }

      console.error("Login error:", error);
    }
  };

  const handleResendEmail = async () => {
    if (!unconfirmedEmail) return;

    setIsLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await sendVerification(unconfirmedEmail);
      setResendSuccess(true);
    } catch (error: any) {
      setError("Failed to send verification email. Please try again.");
      console.error("Resend email error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-stone-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        {isLoading && (
          <Loader className="bg-black/55 absolute inset-0 rounded-md" />
        )}
        <form onSubmit={credentialsSignIn} className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-accent text-center mb-4">
            Team Track
          </h1>
          <div className="text-center text-sm sm:text-base">
            Do not have an account?{" "}
            <Link href={"/sign-up"} className="link">
              Register
            </Link>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {resendSuccess && (
            <div className="text-green-500 text-sm">
              Verification email sent! Please check your inbox.
            </div>
          )}
          {unconfirmedEmail && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 text-sm mb-2">
                Your email address is not confirmed. Please check your inbox for
                a verification email.
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
                disabled={isLoading}
              >
                Resend verification email
              </button>
            </div>
          )}
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            leftIcon={<FaEnvelope />}
            required
            onChange={() => {
              setError("");
              setUnconfirmedEmail(null);
              setResendSuccess(false);
            }}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            leftIcon={<FaLock />}
            showPasswordToggle
            required
            onChange={() => {
              setError("");
              setUnconfirmedEmail(null);
              setResendSuccess(false);
            }}
          />
          <Link href={"/forgot-password"} className="link text-sm">
            Forgot your password?
          </Link>
          <Button>Login</Button>
        </form>
        <div className="divider">OR</div>
        <div className="flex flex-col gap-4">
          {/* Future OAuth buttons can go here */}
        </div>
      </div>
    </div>
  );
}

function getProviderLogo(id: string) {
  const iconSize = 24;
  switch (id) {
    case "google":
      return <GoogleIcon size={iconSize} />;
    default:
      return <></>;
  }
}

function LoginPage() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginContent />
    </Suspense>
  );
}

export default LoginPage;
