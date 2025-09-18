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
  FaVolleyballBall,
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
    <aside className="lg:w-80 w-24 h-full bg-background text-white z-30 rounded-lg">
      <div className="py-8 px-6">
        <div className="hidden lg:flex items-center gap-2 justify-center font-bold w-full text-5xl text-center text-accent mb-4 ">
          <FaVolleyballBall />
          <span className=""> Volleyer</span>
        </div>
        <div className="font-bold w-full lg:hidden text-5xl flex items-center justify-center text-accent mb-4">
          <FaVolleyballBall />
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-center lg:justify-start space-x-3 px-3 py-2 rounded-md text-xl font-medium transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon className="self-center" />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
