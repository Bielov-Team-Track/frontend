"use client";

import { useAuth } from "@/lib/auth/authContext";
import UserMenu from "../dashboard-header/UserMenu";

const Header = () => {
  const auth = useAuth();

  return (
    <header className="bg-stone-800 h-16 p-4 shadow-md ">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-8">
        <h1 className="text-lg font-semibold text-accent">Volleyer</h1>

        <UserMenu user={auth.userProfile} isLoading={auth.isLoading} />
      </div>
    </header>
  );
};

export default Header;
