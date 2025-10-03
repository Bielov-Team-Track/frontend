"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaCalendar,
  FaEnvelope,
  FaTrophy,
  FaChartPie,
  FaCog,
  FaHome,
  FaVolleyballBall,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaCreditCard,
} from "react-icons/fa";

interface NavigationSubItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  subItems?: NavigationSubItem[];
}

const navigationItems: NavigationItem[] = [
  { name: "Home", href: "/dashboard", icon: FaHome },
  { name: "My events", href: "/dashboard/events/my", icon: FaCalendar },
  { name: "Upcoming events", href: "/dashboard/events", icon: FaCalendar },
  { name: "Messages", href: "/dashboard/messages", icon: FaEnvelope },
  { name: "Games", href: "/dashboard/games", icon: FaTrophy },
  { name: "Audit", href: "/dashboard/audit", icon: FaChartPie },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: FaCog,
    subItems: [
      { name: "Profile", href: "/dashboard/settings/profile", icon: FaUser },
      {
        name: "Payments",
        href: "/dashboard/settings/payments",
        icon: FaCreditCard,
      },
    ],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemOrSubItemActive = (item: NavigationItem) => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.href);
    }
    return false;
  };

  const isExpanded = (itemName: string) => {
    return (
      expandedItems.includes(itemName) ||
      navigationItems
        .find((item) => item.name === itemName)
        ?.subItems?.some((sub) => pathname === sub.href)
    );
  };

  return (
    <aside className="xl:w-80 w-24 h-full bg-background text-white z-30 rounded-lg">
      <div className="py-8 px-6">
        <div className="hidden xl:flex items-center gap-2 justify-center font-bold w-full text-5xl text-center text-accent mb-4 ">
          <FaVolleyballBall />
          <span className=""> Volleyer</span>
        </div>
        <div className="font-bold w-full xl:hidden text-5xl flex items-center justify-center text-accent mb-4">
          <FaVolleyballBall />
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemOrSubItemActive(item);
            const itemExpanded = isExpanded(item.name);

            return (
              <div key={item.name}>
                {/* Main Navigation Item */}
                <div
                  className={`flex items-center justify-center lg:justify-start space-x-3 px-3 py-2 rounded-md text-xl font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.name);
                    }
                  }}
                >
                  {item.subItems ? (
                    <>
                      <Icon className="self-center" />
                      <span className="hidden xl:block flex-1">
                        {item.name}
                      </span>
                      <div className="hidden xl:block">
                        {itemExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 w-full"
                    >
                      <Icon className="self-center" />
                      <span className="hidden xl:block">{item.name}</span>
                    </Link>
                  )}
                </div>

                {/* Sub Items */}
                {item.subItems && itemExpanded && (
                  <div className="ml-6 mt-1 space-y-1 hidden xl:block">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isSubActive
                              ? "bg-gray-600 text-white"
                              : "text-gray-400 hover:bg-gray-600 hover:text-white"
                          }`}
                        >
                          <SubIcon className="self-center text-sm" />
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
