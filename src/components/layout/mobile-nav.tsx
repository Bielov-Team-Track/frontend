"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaCalendar,
  FaGamepad,
  FaCreditCard,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

const MobileNav = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Events",
      href: "/events",
      icon: FaCalendar,
      active: pathname.startsWith("/events"),
    },
    {
      name: "Games",
      href: "/games",
      icon: FaGamepad,
      active: pathname.startsWith("/games"),
    },
    {
      name: "Groups",
      href: "/groups",
      icon: FaUserGroup,
      active: pathname.startsWith("/groups"),
    },
    {
      name: "Payments",
      href: "/payments",
      icon: FaCreditCard,
      active: pathname.startsWith("/payments"),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: FaMapMarkerAlt,
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-200 sm:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-base-content/70 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
