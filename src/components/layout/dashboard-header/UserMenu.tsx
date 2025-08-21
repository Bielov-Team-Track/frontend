"use client";

import { UserProfile } from "@/lib/models/User";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FiLogIn as LoginIcon } from "react-icons/fi";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/lib/auth/authContext";
import { useRouter } from "next/navigation";

function UserMenu({ user }: UserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    setIsMenuOpen(false);
    router.refresh();
  };

  const links = [
    { href: "/profile/" + user?.userId, label: "Profile" },
    { href: "/profile/settings", label: "Settings" },
  ];

  const toggleUserMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {user ? (
        <div className="flex items-center gap-2">
          {/* User Info - Hidden on very small screens */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-medium text-base-content">
              {user.name} {user.surname}
            </span>
            <span className="text-xs text-base-content/60">{user.email}</span>
          </div>

          {/* Avatar Button */}
          <button
            onClick={toggleUserMenu}
            className="btn btn-ghost btn-circle hover:btn-primary transition-colors duration-200"
          >
            <Avatar profile={user} size="small" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-14 right-0 w-56 bg-base-100 shadow-xl rounded-lg border border-base-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-base-200 sm:hidden">
                <p className="text-sm font-medium text-base-content">
                  {user.name} {user.surname}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {user.email}
                </p>
              </div>

              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors duration-150"
                  onClick={closeMenu}
                >
                  {link.label === "Profile" && (
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  {link.label === "Settings" && (
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-base-200" />

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="btn btn-primary btn-sm">
          <LoginIcon size={16} />
          <span className="hidden sm:inline ml-2">Login</span>
        </Link>
      )}
    </div>
  );
}

type UserMenuProps = {
  user: UserProfile | undefined;
};

export default UserMenu;
