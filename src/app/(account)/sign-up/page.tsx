"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa6";
import { register as registerUser } from "@/lib/requests/auth";
import { AxiosError } from "axios";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { Loader, Input, Button } from "@/components/ui";
import Link from "next/link";

interface SignUpFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      await registerUser(data.email, data.password);

      router.push("/email-verification");
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError;
      const errorResponse = axiosError?.response?.data as any;

      if (errorResponse?.message) {
        setError(errorResponse.message);
      } else if (errorResponse?.errors) {
        setError(
          errorResponse.errors
            .map((e: any) => e.description || e.errorMessage)
            .join(", ")
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {" "}
      {isLoading && (
        <Loader className="bg-black/55 absolute inset-0 rounded-md" />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold text-accent self-center mb-4">
          Volleyer
        </h1>
        <div>
          Already have an account?{" "}
          <Link href={"/login"} className="link">
            Login
          </Link>
        </div>
        {error && <div className="text-red-500">{error}</div>}

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              label="Email"
              placeholder="Enter your email"
              leftIcon={<FaEnvelope />}
              error={errors.email?.message}
              required
              onChange={(e) => {
                field.onChange(e);
                setError("");
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              label="Password"
              placeholder="Enter your password"
              leftIcon={<FaLock />}
              showPasswordToggle
              error={errors.password?.message}
              required
              onChange={(e) => {
                field.onChange(e);
                setError("");
              }}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon={<FaLock />}
              showPasswordToggle
              error={errors.confirmPassword?.message}
              required
              onChange={(e) => {
                field.onChange(e);
                setError("");
              }}
            />
          )}
        />

        <Button type="submit">
          Create Account
        </Button>
      </form>
      {/* <div className="divider">OR</div>
      <div className="flex flex-col gap-4">
        Future: OAuth buttons can go here 
      </div> */}
    </>
  );
}

export default SignUpPage;
