import {
	FaCalendar,
	FaEnvelope,
	FaTrophy,
	FaChartPie,
	FaCog,
	FaHome,
	FaUser,
	FaCreditCard,
} from "react-icons/fa";

export interface NavigationSubItem {
	name: string;
	href: string;
	icon: React.ComponentType<any>;
}

export interface NavigationItem {
	name: string;
	href: string;
	icon: React.ComponentType<any>;
	subItems?: NavigationSubItem[];
	badge?: number | (() => number); // Support static number or dynamic function
}

/**
 * Creates navigation items with dynamic badge support
 * @param unreadMessageCount - Current unread message count from store
 */
export const getNavigationItems = (unreadMessageCount: number): NavigationItem[] => [
	{ name: "Events", href: "/dashboard/events", icon: FaCalendar },
	{
		name: "Messages",
		href: "/dashboard/messages",
		icon: FaEnvelope,
		badge: unreadMessageCount
	},
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

// Export static version for backwards compatibility
export const navigationItems: NavigationItem[] = getNavigationItems(0);
