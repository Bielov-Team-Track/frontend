'use client';

import { CompleteProfileSetupForm } from "@/components/features/profile";
import { redirect, useRouter } from "next/navigation";

const CompleteProfileSetupPage = () => {
  const router = useRouter();

  const handleProfileComplete = () => {
    // Redirect to the main application page or dashboard after profile completion
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-stone-900 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        <h1 className="text-2xl text-center font-bold">
          🎉 Welcome to the Volleyer!
        </h1>
        <p className="text-primary-content/70 text-center">
          Please complete your profile setup to access all features of the
          application.
        </p>
        <CompleteProfileSetupForm onProfileComplete={handleProfileComplete} />
      </div>
    </div>
  );
};

export default CompleteProfileSetupPage;
