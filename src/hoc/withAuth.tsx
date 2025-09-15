"use client";

import React, { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    console.log("withAuth - isLoading:");
    const { userProfile, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => {

      if (!isLoading && !isAuthenticated) {
        router.replace("/login");
      }
    }, [isLoading, isAuthenticated, router]);

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // If not authenticated or no user, don't render the component
    if (!isAuthenticated || !userProfile) {
      return null;
    }

    // User is authenticated, render the wrapped component with user data
    return <WrappedComponent {...props} user={userProfile} />;
  };

  // Set display name for debugging
  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ComponentWithAuth;
};

export default withAuth;
