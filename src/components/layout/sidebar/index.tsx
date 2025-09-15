"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaCalendar,
  FaEnvelope,
  FaTrophy,
  FaChartPie,
  FaCog,
  FaHome,
} from "react-icons/fa";

const navigationItems = [
  { name: "Home", href: "/dashboard", icon: FaHome },
  { name: "My events", href: "/dashboard/events/my", icon: FaCalendar },
  { name: "Upcoming events", href: "/dashboard/events", icon: FaCalendar },
  { name: "Messages", href: "/dashboard/messages", icon: FaEnvelope },
  { name: "Games", href: "/dashboard/games", icon: FaTrophy },
  { name: "Audit", href: "/dashboard/audit", icon: FaChartPie },
  { name: "Settings", href: "/dashboard/settings", icon: FaCog },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-80 h-full bg-background text-white z-30 rounded-lg">
      <div className="py-8 px-6">
        <h1 className="font-bold w-full text-5xl text-center text-accent mb-4">
          Volleyer
        </h1>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xl font-medium transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
