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
      await login(email, password);

      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsLoading(false);

      const targetRoute = callback || "/dashboard/events/my";

      router.push(targetRoute);
    } catch (error: any) {
      setIsLoading(false);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";
      setError(message);

      console.error("Login error:", error);
    }
  };

  return (
    <>
      {isLoading && (
        <Loader className="bg-black/55 absolute inset-0 rounded-md" />
      )}
      <form onSubmit={credentialsSignIn} className="flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-accent text-center mb-4">
          Volleyer
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
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          leftIcon={<FaEnvelope />}
          required
          onChange={() => {
            setError("");
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
            setResendSuccess(false);
          }}
        />
        <Link href={"/forgot-password"} className="link text-sm">
          Forgot your password?
        </Link>
        <Button>Login</Button>
      </form>
      {/* <div className="divider">OR</div>
        <div className="flex flex-col gap-4">
          Future OAuth buttons can go here 
        </div> */}
    </>
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
