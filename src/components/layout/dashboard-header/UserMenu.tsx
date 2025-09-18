"use client";

import { UserProfile } from "@/lib/models/User";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FiLogIn as LoginIcon, FiLogOut as LogoutIcon } from "react-icons/fi";
import {
  FaUserCircle as UserIcon,
  FaCog as SettingsIcon,
} from "react-icons/fa";
import { Avatar, Button } from "@/components/ui";
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
    { href: "/profile/" + user?.userId, label: "Profile", icon: UserIcon },
    { href: "/profile/settings", label: "Settings", icon: SettingsIcon },
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
            <div className="absolute top-14 right-0 w-56 bg-background shadow-black/30 shadow-xl rounded-lg border border-base-200 z-50">
              <div className="px-4 py-3 border-b border-base-200 sm:hidden">
                <p className="text-lg font-medium text-base-content">
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
                  <link.icon className="w-4 h-4 mr-3" />
                  {link.label}
                </Link>
              ))}

              <hr className="border-base-200" />

              <Button
                variant="ghost"
                leftIcon={<LogoutIcon size={16} />}
                onClick={handleLogout}
                className="w-full text-error"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="btn btn-sm">
          <LoginIcon size={16} />
          <span className="hidden sm:inline ml-2">Login</span>
        </Link>
      )}
    </div>
  );
}

type UserMenuProps = {
  user: UserProfile | null;
};

export default UserMenu;
