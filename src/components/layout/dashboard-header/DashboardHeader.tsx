"use client";

import { Breadcrumbs } from "@/components";
import UserMenu from "./UserMenu";
import { useAuth } from "@/lib/auth/authContext";

function DashboardHeader() {
  const { userProfile } = useAuth();

  return (
    <header className="flex justify-between items-center w-full h-14 p-4 bg-background text-base-content rounded-md">
      <Breadcrumbs />
      <UserMenu user={userProfile!} />
    </header>
  );
}

export default DashboardHeader;
